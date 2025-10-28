import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameSettingsProps {
  gameMode: string;
  requireDoubleOut: boolean;
  onRequireDoubleOutChange: (value: boolean) => void;
  targetScorePerTurn: number;
  onTargetScorePerTurnChange: (value: number) => void;
}

export const GameSettings = ({
  gameMode,
  requireDoubleOut,
  onRequireDoubleOutChange,
  targetScorePerTurn,
  onTargetScorePerTurnChange,
}: GameSettingsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 hover:scale-110 transition-transform z-10"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-wide">
            Paramètres de jeu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {gameMode === "501" && (
            <Card className="p-4 bg-card/50 border-2 border-primary/30">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="double-out" className="text-base font-semibold">
                    Double Out
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Finir avec un double obligatoire
                  </p>
                </div>
                <Switch
                  id="double-out"
                  checked={requireDoubleOut}
                  onCheckedChange={onRequireDoubleOutChange}
                />
              </div>
            </Card>
          )}

          {gameMode === "sudden-death" && (
            <Card className="p-4 bg-card/50 border-2 border-primary/30">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-score" className="text-base font-semibold">
                    Score cible par tour
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Score minimum à atteindre pour ne pas perdre de vie
                  </p>
                </div>
                <div className="flex gap-2">
                  {[20, 30, 40, 50].map((score) => (
                    <Button
                      key={score}
                      variant={targetScorePerTurn === score ? "default" : "outline"}
                      onClick={() => onTargetScorePerTurnChange(score)}
                      className="flex-1"
                    >
                      {score}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {gameMode === "cricket" && (
            <Card className="p-4 bg-card/50 border-2 border-primary/30">
              <p className="text-sm text-muted-foreground text-center">
                Mode Cricket standard
                <br />
                Pas de paramètres supplémentaires
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
