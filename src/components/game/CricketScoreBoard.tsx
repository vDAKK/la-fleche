import { Card } from "@/components/ui/card";
import { GamePlayer } from "@/lib/gameLogic";
import { getHitSymbol, isNumberClosedByAll, CricketHits } from "@/lib/gameLogic";

interface CricketScoreBoardProps {
  players: GamePlayer[];
  currentPlayerIndex: number;
}

export const CricketScoreBoard = ({ players, currentPlayerIndex }: CricketScoreBoardProps) => {
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

          {/* Cricket Progress */}
          {player.cricketHits && (
            <div className="mt-3 grid grid-cols-4 gap-1 text-xs">
              {[15, 16, 17, 18, 19, 20, 25, 50].map((num) => {
                const hits = player.cricketHits![num as keyof CricketHits];
                const isClosed = hits >= 3;
                const isClosedByAll = isNumberClosedByAll(players, num as keyof CricketHits);

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
                    <div className="font-bold text-sm">{getHitSymbol(hits)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
