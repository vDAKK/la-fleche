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

interface GamePlayer extends Player {
  score: number;
  history: number[];
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

  if (!currentPlayer) return null;

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold capitalize">{gameMode}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={undoLastThrow}
            disabled={currentThrow === 0}
          >
            <Undo2 className="w-6 h-6" />
          </Button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-2">
          {players.map((player, idx) => (
            <Card
              key={player.id}
              className={`p-4 text-center transition-all ${
                idx === currentPlayerIndex
                  ? "border-2 border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : "border border-border opacity-60"
              }`}
            >
              <div className="font-bold text-lg truncate">{player.name}</div>
              <div className="text-4xl font-bold text-primary mt-2">
                {player.score}
              </div>
            </Card>
          ))}
        </div>

        {/* Current Turn Info */}
        <Card className="p-4 bg-card border-2 border-primary/30">
          <div className="text-center space-y-2">
            <div className="text-xl font-bold">
              Tour de {currentPlayer.name}
            </div>
            <div className="flex justify-center gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
                    i < currentThrow
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : i === currentThrow
                      ? "bg-primary/20 border-primary animate-pulse"
                      : "bg-muted border-border"
                  }`}
                >
                  {i < throwsThisTurn.length ? throwsThisTurn[i] : ""}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Multiplier Selection */}
        <Card className="p-4 bg-card border-2 border-accent/30">
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-muted-foreground">
              Multiplicateur sélectionné
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {multiplierButtons.map((btn) => (
              <Button
                key={btn.label}
                variant={selectedMultiplier === btn.multiplier ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedMultiplier(btn.multiplier)}
                className="text-base font-bold"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Score Pad */}
        <div className={`grid gap-2 ${gameMode === "cricket" ? "grid-cols-4" : "grid-cols-4"}`}>
          {scoreButtons.map((btn) => (
            <Button
              key={btn.label}
              variant="score"
              onClick={() => addScore(btn.value)}
              className={`${btn.label === "Bull" ? "col-span-2" : ""} ${
                selectedMultiplier === 2 ? "ring-2 ring-accent" : 
                selectedMultiplier === 3 ? "ring-2 ring-secondary" : ""
              }`}
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
