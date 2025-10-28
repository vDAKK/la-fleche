import { Card } from "@/components/ui/card";
import { GamePlayer } from "@/lib/gameLogic";
import { Heart } from "lucide-react";

interface SuddenDeathScoreBoardProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
}

export const SuddenDeathScoreBoard = ({ players, currentPlayerIndex }: SuddenDeathScoreBoardProps) => {
  const activePlayers = players.filter((p) => (p.lives || 0) > 0);

  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      {players.map((player, idx) => {
        const isEliminated = (player.lives || 0) <= 0;
        
        return (
          <Card
            key={player.id}
            className={`p-5 text-center transition-all duration-500 ${
              isEliminated
                ? "border-2 border-destructive/50 opacity-40 grayscale"
                : idx === currentPlayerIndex
                ? "border-3 border-primary glow-primary scale-105 bg-gradient-to-br from-card to-primary/10"
                : "border-2 border-border/50 opacity-70 hover:opacity-90"
            }`}
          >
            <div className="font-bold text-xl truncate tracking-wide">{player.name}</div>
            
            {isEliminated ? (
              <div className="text-3xl font-bold text-destructive mt-3">
                ÉLIMINÉ
              </div>
            ) : (
              <>
                <div className="text-5xl font-bold text-primary mt-3 tabular-nums">
                  {player.score}
                </div>

                {/* Lives display */}
                <div className="mt-3 flex items-center justify-center gap-1">
                  {Array.from({ length: player.lives || 0 }).map((_, i) => (
                    <Heart
                      key={i}
                      className="w-5 h-5 fill-destructive text-destructive animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
};
