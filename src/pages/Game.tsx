import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Undo2, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
}

interface CricketHits {
  15: number;
  16: number;
  17: number;
  18: number;
  19: number;
  20: number;
  25: number;
  50: number;
}

interface GamePlayer extends Player {
  score: number;
  history: number[];
  cricketHits?: CricketHits;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get("mode") || "cricket";
  const playerIds = searchParams.get("players")?.split(",") || [];

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentThrow, setCurrentThrow] = useState(0);
  const [throwsThisTurn, setThrowsThisTurn] = useState<number[]>([]);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);

  useEffect(() => {
    const stored = localStorage.getItem("darts-players");
    if (stored) {
      const allPlayers: Player[] = JSON.parse(stored);
      const gamePlayers: GamePlayer[] = playerIds
        .map((id) => allPlayers.find((p) => p.id === id))
        .filter((p): p is Player => p !== undefined)
        .map((p) => ({
          ...p,
          score: gameMode === "501" ? 501 : 0,
          history: [],
          cricketHits: gameMode === "cricket" ? {
            15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 25: 0, 50: 0
          } : undefined,
        }));

      if (gamePlayers.length < 2) {
        toast.error("Erreur: joueurs manquants");
        navigate("/");
        return;
      }

      setPlayers(gamePlayers);
    }
  }, [playerIds, gameMode, navigate]);

  const currentPlayer = players[currentPlayerIndex];

  // Score buttons depend on game mode
  const scoreButtons = gameMode === "cricket" 
    ? [
        { label: "15", value: 15 },
        { label: "16", value: 16 },
        { label: "17", value: 17 },
        { label: "18", value: 18 },
        { label: "19", value: 19 },
        { label: "20", value: 20 },
        { label: "25", value: 25 },
        { label: "Bull", value: 50 },
      ]
    : [
        { label: "0", value: 0 },
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
        { label: "5", value: 5 },
        { label: "6", value: 6 },
        { label: "7", value: 7 },
        { label: "8", value: 8 },
        { label: "9", value: 9 },
        { label: "10", value: 10 },
        { label: "11", value: 11 },
        { label: "12", value: 12 },
        { label: "13", value: 13 },
        { label: "14", value: 14 },
        { label: "15", value: 15 },
        { label: "16", value: 16 },
        { label: "17", value: 17 },
        { label: "18", value: 18 },
        { label: "19", value: 19 },
        { label: "20", value: 20 },
        { label: "25", value: 25 },
        { label: "Bull", value: 50 },
      ];

  const multiplierButtons = [
    { label: "Simple", multiplier: 1 },
    { label: "Double", multiplier: 2 },
    { label: "Triple", multiplier: 3 },
  ];

  const addScore = (baseScore: number) => {
    const totalScore = baseScore * selectedMultiplier;
    
    const newThrows = [...throwsThisTurn, totalScore];
    setThrowsThisTurn(newThrows);
    setCurrentThrow(currentThrow + 1);

    if (currentThrow + 1 >= 3) {
      // Turn complete
      const turnTotal = newThrows.reduce((a, b) => a + b, 0);
      
      const updatedPlayers = [...players];
      const player = updatedPlayers[currentPlayerIndex];
      
      if (gameMode === "501") {
        player.score -= turnTotal;
        if (player.score <= 0) {
          toast.success(`🏆 ${player.name} a gagné!`);
          setTimeout(() => navigate("/"), 2000);
          return;
        }
      } else if (gameMode === "cricket") {
        // Cricket logic: track hits and score points
        newThrows.forEach((throwScore) => {
          const number = throwScore as keyof CricketHits;
          if (player.cricketHits && player.cricketHits[number] !== undefined) {
            const currentHits = player.cricketHits[number];
            
            // Check if all other players have closed this number
            const allOthersClosed = updatedPlayers
              .filter((_, idx) => idx !== currentPlayerIndex)
              .every((p) => p.cricketHits && p.cricketHits[number] >= 3);
            
            if (currentHits >= 3 && !allOthersClosed) {
              // Number is closed for this player, add points
              player.score += throwScore;
            } else if (currentHits < 3) {
              // Still opening the number
              player.cricketHits[number] = Math.min(currentHits + 1, 3);
            }
          }
        });
        
        // Check if player won (all numbers closed + highest score)
        if (player.cricketHits) {
          const allClosed = Object.values(player.cricketHits).every(hits => hits >= 3);
          if (allClosed) {
            const isWinner = updatedPlayers.every((p, idx) => {
              if (idx === currentPlayerIndex) return true;
              const pAllClosed = p.cricketHits && Object.values(p.cricketHits).every(hits => hits >= 3);
              return !pAllClosed || player.score >= p.score;
            });
            
            if (isWinner) {
              toast.success(`🏆 ${player.name} a gagné!`);
              setTimeout(() => navigate("/"), 2000);
              return;
            }
          }
        }
      } else {
        player.score += turnTotal;
      }
      
      player.history.push(turnTotal);
      setPlayers(updatedPlayers);
      
      // Next player
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
      setCurrentThrow(0);
      setThrowsThisTurn([]);
      setSelectedMultiplier(1); // Reset multiplier for next player
    } else {
      // Reset multiplier after each throw
      setSelectedMultiplier(1);
    }
  };

  const undoLastThrow = () => {
    if (currentThrow > 0) {
      setThrowsThisTurn(throwsThisTurn.slice(0, -1));
      setCurrentThrow(currentThrow - 1);
    }
  };

  const getHitSymbol = (hits: number) => {
    if (hits === 0) return "";
    if (hits === 1) return "/";
    if (hits === 2) return "X";
    return "✓";
  };

  const isNumberClosedByAll = (number: keyof CricketHits) => {
    return players.every((p) => p.cricketHits && p.cricketHits[number] >= 3);
  };

  const gameRules = {
    "501": "Commencez à 501 points. Soustrayez vos lancers. Premier à 0 gagne!",
    "cricket": "Fermez 15-20, 25 et Bull (3 hits chacun). Premier à tout fermer gagne!",
    "sudden-death": "Marquez le plus de points possible!"
  };

  if (!currentPlayer) return null;

  return (
    <div className="min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-md mx-auto space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-4xl font-bold capitalize tracking-wider text-gradient-primary drop-shadow-lg">{gameMode}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={undoLastThrow}
            disabled={currentThrow === 0}
            className="hover:scale-110 transition-transform disabled:opacity-30"
          >
            <Undo2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Rules */}
        <Card className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/40 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-base text-center font-semibold tracking-wide">
            📋 {gameRules[gameMode as keyof typeof gameRules]}
          </div>
        </Card>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {players.map((player, idx) => (
            <Card
              key={player.id}
              className={`p-5 text-center transition-all duration-500 ${
                idx === currentPlayerIndex
                  ? "border-3 border-primary glow-primary scale-105 bg-gradient-to-br from-card to-primary/10"
                  : "border-2 border-border/50 opacity-70 hover:opacity-90"
              }`}
            >
              <div className="font-bold text-xl truncate tracking-wide">{player.name}</div>
              <div className="text-5xl font-bold text-primary mt-3 tabular-nums">
                {player.score}
              </div>
              
              {/* Cricket Progress */}
              {gameMode === "cricket" && player.cricketHits && (
                <div className="mt-3 grid grid-cols-4 gap-1 text-xs">
                  {[15, 16, 17, 18, 19, 20, 25, 50].map((num) => {
                    const hits = player.cricketHits![num as keyof CricketHits];
                    const isClosed = hits >= 3;
                    const isClosedByAll = isNumberClosedByAll(num as keyof CricketHits);
                    
                    return (
                      <div
                        key={num}
                        className={`p-1 rounded transition-all ${
                          isClosedByAll
                            ? "bg-muted/50 opacity-50 line-through"
                            : isClosed
                            ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground font-bold shadow-lg ring-2 ring-secondary/50"
                            : hits > 0
                            ? "bg-primary/20 border border-primary/40"
                            : "bg-muted"
                        }`}
                      >
                        <div className="text-[10px] font-semibold">{num === 50 ? "B" : num}</div>
                        <div className="font-bold text-sm">
                          {getHitSymbol(hits)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Current Turn Info */}
        <Card className="p-6 bg-gradient-to-br from-card to-primary/5 border-3 border-primary/40 shadow-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold tracking-wide">
              Tour de <span className="text-primary">{currentPlayer.name}</span>
            </div>
            <div className="flex justify-center gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-20 h-20 rounded-xl border-3 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                    i < currentThrow
                      ? "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-secondary shadow-lg glow-secondary scale-105"
                      : i === currentThrow
                      ? "bg-primary/20 border-primary animate-pulse ring-2 ring-primary/50"
                      : "bg-muted/50 border-border/50"
                  }`}
                >
                  {i < throwsThisTurn.length ? throwsThisTurn[i] : ""}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Multiplier Selection */}
        <Card className="p-5 bg-gradient-to-br from-card to-accent/5 border-3 border-accent/40 shadow-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-4">
            <span className="text-base font-bold text-accent tracking-wide">
              Multiplicateur sélectionné
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {multiplierButtons.map((btn) => (
              <Button
                key={btn.label}
                variant={selectedMultiplier === btn.multiplier ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedMultiplier(btn.multiplier)}
                className="text-lg font-bold h-14 hover:scale-105 transition-all duration-300 shadow-md"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Score Pad */}
        <div className={`grid gap-3 animate-fade-in ${gameMode === "cricket" ? "grid-cols-4" : "grid-cols-4"}`} style={{ animationDelay: '0.5s' }}>
          {scoreButtons.map((btn, index) => (
            <Button
              key={btn.label}
              variant="score"
              onClick={() => addScore(btn.value)}
              className={`text-xl font-bold h-16 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl animate-fade-in ${
                btn.label === "Bull" ? "col-span-2" : ""
              } ${
                selectedMultiplier === 2 ? "ring-4 ring-accent glow-accent" : 
                selectedMultiplier === 3 ? "ring-4 ring-secondary glow-secondary" : ""
              }`}
              style={{ animationDelay: `${0.55 + index * 0.02}s` }}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
