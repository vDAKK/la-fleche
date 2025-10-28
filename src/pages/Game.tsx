import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Undo2, Settings } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
}

interface CricketMarks {
  15: number;
  16: number;
  17: number;
  18: number;
  19: number;
  20: number;
  25: number;
}

interface GamePlayer extends Player {
  score: number;
  cricketMarks?: CricketMarks;
  lives?: number;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get("mode") || "cricket";
  const playerIds = searchParams.get("players")?.split(",") || [];

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dartCount, setDartCount] = useState(0);
  const [currentThrows, setCurrentThrows] = useState<{ base: number; mult: number }[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [doubleOut, setDoubleOut] = useState(true);
  const [previousTurnState, setPreviousTurnState] = useState<{
    players: GamePlayer[];
    playerIndex: number;
  } | null>(null);

  // Initialize players once
  useEffect(() => {
    const stored = localStorage.getItem("darts-players");
    if (!stored) {
      navigate("/");
      return;
    }

    const allPlayers: Player[] = JSON.parse(stored);
    const selectedPlayers = playerIds
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter((p): p is Player => p !== undefined);

    if (selectedPlayers.length < 2) {
      toast.error("Il faut au moins 2 joueurs");
      navigate("/");
      return;
    }

    const gamePlayers: GamePlayer[] = selectedPlayers.map((p) => ({
      ...p,
      score: gameMode === "501" ? 501 : 0,
      cricketMarks:
        gameMode === "cricket"
          ? { 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0 }
          : undefined,
      lives: gameMode === "sudden-death" ? 3 : undefined,
    }));

    setPlayers(gamePlayers);
  }, []); // Run only once

  const currentPlayer = players[currentPlayerIndex];

  const cricketNumbers = [15, 16, 17, 18, 19, 20, 25];
  const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 50];

  const handleScore = (baseScore: number) => {
    const newThrows = [...currentThrows, { base: baseScore, mult: multiplier }];
    setCurrentThrows(newThrows);
    setDartCount(dartCount + 1);

    // After 3 darts, process turn
    if (dartCount + 1 === 3) {
      processTurn(newThrows);
    } else {
      setMultiplier(1); // Reset multiplier
    }
  };

  const processTurn = (throws: { base: number; mult: number }[]) => {
    // Save current state before processing turn
    setPreviousTurnState({
      players: JSON.parse(JSON.stringify(players)),
      playerIndex: currentPlayerIndex,
    });

    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayerIndex];

    if (gameMode === "cricket") {
      // Process each throw for cricket
      throws.forEach((dart) => {
        if (cricketNumbers.includes(dart.base) && player.cricketMarks) {
          const currentMarks = player.cricketMarks[dart.base as keyof CricketMarks];
          const marksToAdd = dart.mult;
          const newMarks = Math.min(currentMarks + marksToAdd, 3);
          const extraMarks = Math.max(0, currentMarks + marksToAdd - 3);

          // Update marks
          player.cricketMarks[dart.base as keyof CricketMarks] = newMarks;

          // Score points for OTHER players who haven't closed this number
          if (extraMarks > 0) {
            updatedPlayers.forEach((otherPlayer, idx) => {
              if (idx !== currentPlayerIndex && otherPlayer.cricketMarks) {
                const otherMarks = otherPlayer.cricketMarks[dart.base as keyof CricketMarks];
                if (otherMarks < 3) {
                  otherPlayer.score += dart.base * extraMarks;
                }
              }
            });
          }
        }
      });

      // Check win
      const allClosed =
        player.cricketMarks &&
        cricketNumbers.every((n) => player.cricketMarks![n as keyof CricketMarks] >= 3);
      if (allClosed) {
        const hasHighestScore = updatedPlayers.every(
          (p, idx) => idx === currentPlayerIndex || player.score >= p.score
        );
        if (hasHighestScore) {
          toast.success(`🏆 ${player.name} a gagné!`);
          setTimeout(() => navigate("/"), 2000);
          setPlayers(updatedPlayers);
          return;
        }
      }
    } else if (gameMode === "501") {
      const total = throws.reduce((a, b) => a + b.base * b.mult, 0);
      const lastDart = throws[throws.length - 1];
      const newScore = player.score - total;

      // Check bust
      if (newScore < 0 || newScore === 1 || (doubleOut && newScore === 0 && lastDart.mult !== 2)) {
        toast.error("Bust!");
      } else {
        player.score = newScore;
        if (newScore === 0) {
          toast.success(`🏆 ${player.name} a gagné!`);
          setTimeout(() => navigate("/"), 2000);
          setPlayers(updatedPlayers);
          return;
        }
      }
    } else if (gameMode === "sudden-death") {
      const total = throws.reduce((a, b) => a + b.base * b.mult, 0);
      player.score += total;

      if (total < 40) {
        player.lives = (player.lives || 0) - 1;
        if (player.lives === 0) {
          toast.error(`${player.name} éliminé!`);
        }
      }

      const alive = updatedPlayers.filter((p) => (p.lives || 0) > 0);
      if (alive.length === 1) {
        toast.success(`🏆 ${alive[0].name} a gagné!`);
        setTimeout(() => navigate("/"), 2000);
        setPlayers(updatedPlayers);
        return;
      }
    }

    setPlayers(updatedPlayers);

    // Next player
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    if (gameMode === "sudden-death") {
      while ((updatedPlayers[nextIndex].lives || 0) <= 0) {
        nextIndex = (nextIndex + 1) % players.length;
      }
    }

    setCurrentPlayerIndex(nextIndex);
    setDartCount(0);
    setCurrentThrows([]);
    setMultiplier(1);
  };

  const undo = () => {
    if (dartCount > 0) {
      // Undo current throw
      setCurrentThrows(currentThrows.slice(0, -1));
      setDartCount(dartCount - 1);
      setMultiplier(1);
    } else if (previousTurnState) {
      // Undo previous player's turn
      setPlayers(previousTurnState.players);
      setCurrentPlayerIndex(previousTurnState.playerIndex);
      setDartCount(0);
      setCurrentThrows([]);
      setMultiplier(1);
      setPreviousTurnState(null);
      toast.info("Tour précédent annulé");
    }
  };

  const getMarkSymbol = (marks: number) => {
    if (marks === 0) return "";
    if (marks === 1) return "/";
    if (marks === 2) return "X";
    return "✓";
  };

  if (!currentPlayer) return null;

  const numbersToShow = gameMode === "cricket" ? cricketNumbers : allNumbers;

  return (
    <div className="min-h-screen p-3 bg-background">
      <div className="max-w-lg mx-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold capitalize">{gameMode}</h1>
          <Button variant="ghost" size="sm" onClick={undo} disabled={dartCount === 0 && !previousTurnState}>
            <Undo2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-2">
          {players.map((player, idx) => (
            <Card
              key={player.id}
              className={`p-3 ${
                idx === currentPlayerIndex
                  ? "border-2 border-primary bg-primary/10"
                  : "border opacity-60"
              }`}
            >
              <div className="font-bold text-sm truncate">{player.name}</div>
              <div className="text-3xl font-bold text-primary mt-1">{player.score}</div>

              {/* Cricket marks */}
              {gameMode === "cricket" && player.cricketMarks && (
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {cricketNumbers.map((num) => {
                    const marks = player.cricketMarks![num as keyof CricketMarks];
                    const closed = marks >= 3;
                    return (
                      <div
                        key={num}
                        className={`text-[10px] p-1 rounded ${
                          closed
                            ? "bg-secondary text-secondary-foreground font-bold"
                            : marks > 0
                            ? "bg-primary/20"
                            : "bg-muted"
                        }`}
                      >
                        <div>{num === 50 ? "B" : num}</div>
                        <div className="font-bold">{getMarkSymbol(marks)}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lives */}
              {gameMode === "sudden-death" && (
                <div className="mt-2 text-sm">❤️ {player.lives}</div>
              )}
            </Card>
          ))}
        </div>

        {/* Current turn */}
        <Card className="p-3">
          <div className="text-center text-sm font-bold mb-2">
            {currentPlayer.name} - Lancer {dartCount + 1}/3
          </div>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-14 h-14 rounded border-2 flex items-center justify-center text-lg font-bold ${
                  i < dartCount
                    ? "bg-secondary border-secondary"
                    : i === dartCount
                    ? "bg-primary/20 border-primary"
                    : "bg-muted border-muted"
                }`}
              >
                {currentThrows[i] ? currentThrows[i].base * currentThrows[i].mult : ""}
              </div>
            ))}
          </div>
        </Card>

        {/* Multiplier */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((m) => (
            <Button
              key={m}
              variant={multiplier === m ? "default" : "outline"}
              size="sm"
              onClick={() => setMultiplier(m)}
            >
              {m === 1 ? "Simple" : m === 2 ? "Double" : "Triple"}
            </Button>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-5 gap-2">
          {numbersToShow.map((num) => (
            <Button
              key={num}
              variant="secondary"
              size="sm"
              onClick={() => handleScore(num)}
              disabled={num === 25 && multiplier === 3}
              className={`h-12 text-base font-bold ${
                num === 25 || num === 50 ? "col-span-2" : ""
              } ${
                multiplier === 2
                  ? "ring-2 ring-accent"
                  : multiplier === 3
                  ? "ring-2 ring-secondary"
                  : ""
              }`}
            >
              {num}
            </Button>
          ))}
        </div>

        {gameMode === "501" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDoubleOut(!doubleOut)}
            className="w-full text-xs"
          >
            Double Out: {doubleOut ? "ON" : "OFF"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Game;
