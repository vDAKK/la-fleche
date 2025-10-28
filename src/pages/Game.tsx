import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Undo2, Trophy, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
}

interface GamePlayer extends Player {
  score: number;
  cricketMarks?: Record<number, number>;
  lives?: number;
  turnsPlayed?: number;
  totalThrown?: number;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get("mode") || "cricket";
  const playerIds = searchParams.get("players")?.split(",") || [];
  
  // Game config from URL params
  const configLives = parseInt(searchParams.get("lives") || "3");
  const configStartScore = parseInt(searchParams.get("startScore") || "501");
  const configCricketMode = (searchParams.get("cricketMode") || "classic") as "classic" | "random";

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
  const [cricketNumbers, setCricketNumbers] = useState<number[]>([]);
  const [roundScores, setRoundScores] = useState<Map<string, number>>(new Map());
  const [winner, setWinner] = useState<GamePlayer | null>(null);
  const [showVictoryDialog, setShowVictoryDialog] = useState(false);

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

    // Generate cricket numbers
    let numbers: number[];
    if (gameMode === "cricket") {
      if (configCricketMode === "random") {
        // Generate 7 random numbers between 1-20 + bull (25)
        const availableNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
        const shuffled = availableNumbers.sort(() => Math.random() - 0.5);
        numbers = shuffled.slice(0, 6).concat([25]).sort((a, b) => a - b);
      } else {
        numbers = [15, 16, 17, 18, 19, 20, 25];
      }
      setCricketNumbers(numbers);
    }

    const gamePlayers: GamePlayer[] = selectedPlayers.map((p) => ({
      ...p,
      score: gameMode === "501" ? configStartScore : 0,
      cricketMarks:
        gameMode === "cricket"
          ? Object.fromEntries(numbers.map(n => [n, 0]))
          : undefined,
      lives: gameMode === "sudden-death" ? configLives : undefined,
      turnsPlayed: 0,
      totalThrown: 0,
    }));

    setPlayers(gamePlayers);
  }, []); // Run only once

  const currentPlayer = players[currentPlayerIndex];

  const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];

  const handleScore = (baseScore: number) => {
    const newThrows = [...currentThrows, { base: baseScore, mult: multiplier }];
    setCurrentThrows(newThrows);
    setDartCount(dartCount + 1);

    // For 501 mode, check immediately if player reached 0
    if (gameMode === "501") {
      const total = newThrows.reduce((a, b) => a + b.base * b.mult, 0);
      const newScore = currentPlayer.score - total;
      const lastDart = newThrows[newThrows.length - 1];
      
      // If player reaches exactly 0 with valid conditions, end turn immediately
      if (newScore === 0 && (!doubleOut || lastDart.mult === 2)) {
        processTurn(newThrows);
        return;
      }
    }

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
    
    // Track statistics
    player.turnsPlayed = (player.turnsPlayed || 0) + 1;
    const turnTotal = throws.reduce((a, b) => a + b.base * b.mult, 0);
    player.totalThrown = (player.totalThrown || 0) + turnTotal;

    if (gameMode === "cricket") {
      // Process each throw for cricket
      throws.forEach((dart) => {
        if (cricketNumbers.includes(dart.base) && player.cricketMarks) {
          const currentMarks = player.cricketMarks[dart.base] || 0;
          const marksToAdd = dart.mult;
          const newMarks = Math.min(currentMarks + marksToAdd, 3);
          const extraMarks = Math.max(0, currentMarks + marksToAdd - 3);

          // Update marks
          player.cricketMarks[dart.base] = newMarks;

          // Score points for OTHER players who haven't closed this number
          if (extraMarks > 0) {
            updatedPlayers.forEach((otherPlayer, idx) => {
              if (idx !== currentPlayerIndex && otherPlayer.cricketMarks) {
                const otherMarks = otherPlayer.cricketMarks[dart.base] || 0;
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
        cricketNumbers.every((n) => (player.cricketMarks![n] || 0) >= 3);
      if (allClosed) {
        const hasLowestScore = updatedPlayers.every(
          (p, idx) => idx === currentPlayerIndex || player.score <= p.score
        );
        if (hasLowestScore) {
          setWinner(player);
          setShowVictoryDialog(true);
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
          setWinner(player);
          setShowVictoryDialog(true);
          setPlayers(updatedPlayers);
          return;
        }
      }
    } else if (gameMode === "sudden-death") {
      const total = throws.reduce((a, b) => a + b.base * b.mult, 0);
      player.score += total;

      // Store this turn's score
      const newRoundScores = new Map(roundScores);
      newRoundScores.set(player.id, total);

      // Check if round is complete (all players have played)
      let nextIndex = (currentPlayerIndex + 1) % players.length;
      while ((updatedPlayers[nextIndex].lives || 0) <= 0 && nextIndex !== 0) {
        nextIndex = (nextIndex + 1) % players.length;
      }

      // If we're back to player 0 (or first alive player), round is complete
      const alivePlayers = updatedPlayers.filter((p) => (p.lives || 0) > 0);
      const isRoundComplete = newRoundScores.size === alivePlayers.length;

      if (isRoundComplete) {
        // Find player(s) with lowest score
        let lowestScore = Infinity;
        const scores = Array.from(newRoundScores.entries());
        
        scores.forEach(([_, score]) => {
          if (score < lowestScore) lowestScore = score;
        });

        // Remove life from player(s) with lowest score
        scores.forEach(([playerId, score]) => {
          if (score === lowestScore) {
            const loserPlayer = updatedPlayers.find(p => p.id === playerId);
            if (loserPlayer && loserPlayer.lives) {
              loserPlayer.lives -= 1;
              if (loserPlayer.lives === 0) {
                toast.error(`${loserPlayer.name} éliminé!`);
              } else {
                toast.warning(`${loserPlayer.name} perd une vie (${score} pts)`);
              }
            }
          }
        });

        // Clear round scores for next round
        setRoundScores(new Map());
      } else {
        setRoundScores(newRoundScores);
      }

      const alive = updatedPlayers.filter((p) => (p.lives || 0) > 0);
      if (alive.length === 1) {
        setWinner(alive[0]);
        setShowVictoryDialog(true);
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
      setRoundScores(new Map()); // Reset round scores
      toast.info("Tour précédent annulé");
    }
  };

  const getMarkSymbol = (marks: number) => {
    if (marks === 0) return "";
    if (marks === 1) return "/";
    if (marks === 2) return "X";
    return "✓";
  };

  // Checkout suggestions for 501 mode
  const getCheckoutSuggestions = (score: number): string[] => {
    if (score > 170 || score <= 1) return [];
    
    const checkouts: Record<number, string[]> = {
      2: ["D1"], 3: ["1, D1"], 4: ["D2"], 5: ["1, D2", "3, D1"],
      6: ["D3"], 7: ["3, D2", "1, D3"], 8: ["D4"], 9: ["1, D4", "5, D2"],
      10: ["D5"], 11: ["3, D4", "1, D5"], 12: ["D6"], 13: ["3, D5", "1, D6"],
      14: ["D7"], 15: ["7, D4", "3, D6"], 16: ["D8"], 17: ["9, D4", "1, D8"],
      18: ["D9"], 19: ["3, D8", "7, D6"], 20: ["D10"], 21: ["5, D8", "1, D10"],
      22: ["D11"], 23: ["7, D8", "3, D10"], 24: ["D12"], 25: ["9, D8", "1, D12"],
      26: ["D13"], 27: ["11, D8", "3, D12"], 28: ["D14"], 29: ["13, D8", "5, D12"],
      30: ["D15"], 31: ["15, D8", "7, D12"], 32: ["D16"], 33: ["17, D8", "1, D16"],
      34: ["D17"], 35: ["19, D8", "3, D16"], 36: ["D18"], 37: ["5, D16", "1, D18"],
      38: ["D19"], 39: ["7, D16", "3, D18"], 40: ["D20"], 41: ["9, D16", "1, D20"],
      50: ["Bull"], 51: ["19, D16", "11, D20"], 52: ["20, D16", "12, D20"],
      60: ["20, D20"], 61: ["T15, D8", "25, D18"], 70: ["T10, D20", "18, D16"],
      80: ["T20, D10", "T16, D16"], 90: ["T20, D15", "T18, D18"],
      100: ["T20, D20"], 101: ["T17, Bull", "T20, 1, D20"],
      110: ["T20, Bull", "T18, D20"], 120: ["T20, 20, D20"],
      130: ["T20, T18, D8"], 140: ["T20, T20, D10"],
      150: ["T20, T18, D18"], 160: ["T20, T20, D20"],
      167: ["T20, T19, Bull"], 170: ["T20, T20, Bull"]
    };
    
    return checkouts[score] || [];
  };

  if (!currentPlayer) return null;

  const numbersToShow = gameMode === "cricket" 
    ? [0, ...cricketNumbers] // Include 0 for missed throws
    : allNumbers;

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
                    const marks = player.cricketMarks![num] || 0;
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

        {/* Checkout suggestions for 501 */}
        {gameMode === "501" && currentPlayer.score <= 170 && currentPlayer.score > 1 && (
          <Card className="p-3 bg-accent/10 border-accent">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-accent" />
              <div className="text-sm font-bold">Suggestions de finish</div>
            </div>
            <div className="space-y-1">
              {getCheckoutSuggestions(currentPlayer.score).map((suggestion, idx) => (
                <div key={idx} className="text-sm font-mono bg-background/50 px-2 py-1 rounded">
                  {suggestion}
                </div>
              ))}
              {getCheckoutSuggestions(currentPlayer.score).length === 0 && (
                <div className="text-xs text-muted-foreground">
                  Score actuel: {currentPlayer.score}
                </div>
              )}
            </div>
          </Card>
        )}

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

      {/* Victory Dialog */}
      <Dialog open={showVictoryDialog} onOpenChange={setShowVictoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              🏆 Victoire !
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Winner */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {winner?.name}
              </h2>
              <p className="text-muted-foreground">a remporté la partie !</p>
            </div>

            {/* Statistics */}
            <Card className="p-4 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Statistiques
              </h3>
              
              <div className="space-y-3">
                {players.map((player) => (
                  <div 
                    key={player.id}
                    className={`p-3 rounded-lg ${
                      player.id === winner?.id 
                        ? "bg-primary/20 border-2 border-primary" 
                        : "bg-muted"
                    }`}
                  >
                    <div className="font-bold mb-2">{player.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {gameMode === "501" && (
                        <>
                          <div>
                            <div className="text-muted-foreground">Score final</div>
                            <div className="font-bold">{player.score}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Moyenne</div>
                            <div className="font-bold">
                              {player.turnsPlayed && player.totalThrown
                                ? Math.round(player.totalThrown / player.turnsPlayed)
                                : 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Tours joués</div>
                            <div className="font-bold">{player.turnsPlayed || 0}</div>
                          </div>
                        </>
                      )}
                      
                      {gameMode === "cricket" && (
                        <>
                          <div>
                            <div className="text-muted-foreground">Score</div>
                            <div className="font-bold">{player.score}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Numéros fermés</div>
                            <div className="font-bold">
                              {player.cricketMarks 
                                ? Object.values(player.cricketMarks).filter(m => m >= 3).length
                                : 0} / {cricketNumbers.length}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Tours joués</div>
                            <div className="font-bold">{player.turnsPlayed || 0}</div>
                          </div>
                        </>
                      )}
                      
                      {gameMode === "sudden-death" && (
                        <>
                          <div>
                            <div className="text-muted-foreground">Score total</div>
                            <div className="font-bold">{player.score}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Moyenne/tour</div>
                            <div className="font-bold">
                              {player.turnsPlayed && player.totalThrown
                                ? Math.round(player.totalThrown / player.turnsPlayed)
                                : 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Tours survécus</div>
                            <div className="font-bold">{player.turnsPlayed || 0}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowVictoryDialog(false);
                  setWinner(null);
                }}
              >
                Continuer
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/")}
              >
                Menu principal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
