import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Undo2 } from "lucide-react";
import { toast } from "sonner";
import {
  GamePlayer,
  ThrowData,
  GameConfig,
  initializePlayers,
  processCricketTurn,
  process501Turn,
  processSuddenDeathTurn,
} from "@/lib/gameLogic";
import { CricketScoreBoard } from "@/components/game/CricketScoreBoard";
import { Standard501ScoreBoard } from "@/components/game/Standard501ScoreBoard";
import { SuddenDeathScoreBoard } from "@/components/game/SuddenDeathScoreBoard";
import { GameSettings } from "@/components/game/GameSettings";

interface Player {
  id: string;
  name: string;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameMode = (searchParams.get("mode") || "cricket") as "cricket" | "501" | "sudden-death";
  const playerIds = searchParams.get("players")?.split(",") || [];

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentThrow, setCurrentThrow] = useState(0);
  const [throwsThisTurn, setThrowsThisTurn] = useState<ThrowData[]>([]);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);

  // Game settings
  const [requireDoubleOut, setRequireDoubleOut] = useState(true);
  const [targetScorePerTurn, setTargetScorePerTurn] = useState(40);

  useEffect(() => {
    const stored = localStorage.getItem("darts-players");
    if (stored) {
      const allPlayers: Player[] = JSON.parse(stored);
      const config: GameConfig = {
        mode: gameMode,
        requireDoubleOut,
        startingLives: 3,
        targetScorePerTurn,
      };

      const gamePlayers = initializePlayers(playerIds, allPlayers, config);

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
  const scoreButtons =
    gameMode === "cricket"
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
    const throwData: ThrowData = { baseScore, multiplier: selectedMultiplier, totalScore };

    const newThrows = [...throwsThisTurn, throwData];
    setThrowsThisTurn(newThrows);
    setCurrentThrow(currentThrow + 1);

    if (currentThrow + 1 >= 3) {
      // Turn complete
      const updatedPlayers = [...players];
      let shouldContinue = true;

      if (gameMode === "501") {
        const result = process501Turn(updatedPlayers[currentPlayerIndex], newThrows, requireDoubleOut);
        updatedPlayers[currentPlayerIndex] = result.player;

        if (result.isBust) {
          toast.error(`Bust! Score retourne à ${result.player.score}`);
        } else if (result.hasWon) {
          toast.success(`🏆 ${result.player.name} a gagné!`);
          shouldContinue = false;
          setTimeout(() => navigate("/"), 2000);
        }
      } else if (gameMode === "cricket") {
        const result = processCricketTurn(
          updatedPlayers[currentPlayerIndex],
          updatedPlayers,
          currentPlayerIndex,
          newThrows
        );
        updatedPlayers[currentPlayerIndex] = result.player;

        if (result.hasWon) {
          toast.success(`🏆 ${result.player.name} a gagné!`);
          shouldContinue = false;
          setTimeout(() => navigate("/"), 2000);
        }
      } else if (gameMode === "sudden-death") {
        const result = processSuddenDeathTurn(
          updatedPlayers[currentPlayerIndex],
          newThrows,
          targetScorePerTurn
        );
        updatedPlayers[currentPlayerIndex] = result.player;

        if (result.isEliminated) {
          toast.error(`${result.player.name} a été éliminé!`);
        }

        // Check if only one player remains
        const activePlayers = updatedPlayers.filter((p) => (p.lives || 0) > 0);
        if (activePlayers.length === 1) {
          toast.success(`🏆 ${activePlayers[0].name} a gagné!`);
          shouldContinue = false;
          setTimeout(() => navigate("/"), 2000);
        }
      }

      if (shouldContinue) {
        const turnTotal = newThrows.reduce((sum, t) => sum + t.totalScore, 0);
        updatedPlayers[currentPlayerIndex].history.push(turnTotal);
        setPlayers(updatedPlayers);

        // Move to next player (skip eliminated players in sudden death)
        let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        if (gameMode === "sudden-death") {
          let attempts = 0;
          while ((updatedPlayers[nextPlayerIndex].lives || 0) <= 0 && attempts < players.length) {
            nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
            attempts++;
          }
        }

        setCurrentPlayerIndex(nextPlayerIndex);
        setCurrentThrow(0);
        setThrowsThisTurn([]);
        setSelectedMultiplier(1);
      }
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

  const gameRules = {
    cricket:
      "Fermez 15-20, 25 et Bull (3 hits chacun). Marquez des points sur les numéros fermés. Plus haut score gagne!",
    "501": requireDoubleOut
      ? "Commencez à 501. Soustrayez vos lancers. Finissez EXACTEMENT à 0 avec un DOUBLE!"
      : "Commencez à 501. Soustrayez vos lancers. Premier à exactement 0 gagne!",
    "sudden-death": `Atteignez ${targetScorePerTurn}+ points par tour ou perdez une vie. Dernier survivant gagne!`,
  };

  if (!currentPlayer) return null;

  return (
    <div className="min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-10 right-10 w-64 h-64 bg-primary/40 rounded-full blur-3xl animate-pulse"
        />
        <div
          className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/40 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
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
          <h1 className="text-4xl font-bold capitalize tracking-wider text-gradient-primary drop-shadow-lg">
            {gameMode === "sudden-death" ? "Mort Subite" : gameMode}
          </h1>
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

        {/* Settings */}
        <GameSettings
          gameMode={gameMode}
          requireDoubleOut={requireDoubleOut}
          onRequireDoubleOutChange={setRequireDoubleOut}
          targetScorePerTurn={targetScorePerTurn}
          onTargetScorePerTurnChange={setTargetScorePerTurn}
        />

        {/* Rules */}
        <Card
          className="p-4 bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/40 shadow-lg animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="text-base text-center font-semibold tracking-wide">
            📋 {gameRules[gameMode]}
          </div>
        </Card>

        {/* Scores - Different component based on game mode */}
        {gameMode === "cricket" && (
          <CricketScoreBoard players={players} currentPlayerIndex={currentPlayerIndex} />
        )}
        {gameMode === "501" && (
          <Standard501ScoreBoard players={players} currentPlayerIndex={currentPlayerIndex} />
        )}
        {gameMode === "sudden-death" && (
          <SuddenDeathScoreBoard players={players} currentPlayerIndex={currentPlayerIndex} />
        )}

        {/* Current Turn Info */}
        <Card
          className="p-6 bg-gradient-to-br from-card to-primary/5 border-3 border-primary/40 shadow-xl animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
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
                  {i < throwsThisTurn.length ? throwsThisTurn[i].totalScore : ""}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Multiplier Selection */}
        <Card
          className="p-5 bg-gradient-to-br from-card to-accent/5 border-3 border-accent/40 shadow-xl animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
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
        <div
          className={`grid gap-3 animate-fade-in ${
            gameMode === "cricket" ? "grid-cols-4" : "grid-cols-4"
          }`}
          style={{ animationDelay: "0.5s" }}
        >
          {scoreButtons.map((btn, index) => (
            <Button
              key={btn.label}
              variant="score"
              onClick={() => addScore(btn.value)}
              className={`text-xl font-bold h-16 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl animate-fade-in ${
                btn.label === "Bull" ? "col-span-2" : ""
              } ${
                selectedMultiplier === 2
                  ? "ring-4 ring-accent glow-accent"
                  : selectedMultiplier === 3
                  ? "ring-4 ring-secondary glow-secondary"
                  : ""
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
