import { Card } from "@/components/ui/card";
import { GamePlayer } from "@/lib/gameLogic";
import { Target } from "lucide-react";

interface Standard501ScoreBoardProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
}

export const Standard501ScoreBoard = ({ players, currentPlayerIndex }: Standard501ScoreBoardProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
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

          {/* Bust counter */}
          {(player.bustCount || 0) > 0 && (
            <div className="mt-2 text-xs text-destructive font-semibold">
              Bust x{player.bustCount}
            </div>
          )}

          {/* Checkout suggestions for low scores */}
          {player.score <= 170 && player.score > 1 && idx === currentPlayerIndex && (
            <div className="mt-2 text-xs text-accent font-medium flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Checkout possible
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
