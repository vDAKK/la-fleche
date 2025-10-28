import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Play } from "lucide-react";
import { toast } from "sonner";

const GameConfig = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "cricket";
  const players = searchParams.get("players") || "";

  // Config states
  const [lives, setLives] = useState(3);
  const [startScore, setStartScore] = useState(501);
  const [cricketMode, setCricketMode] = useState<"classic" | "random">("classic");

  const startGame = () => {
    if (!players) {
      toast.error("Aucun joueur sélectionné");
      navigate("/");
      return;
    }

    const params = new URLSearchParams({
      mode,
      players,
    });

    if (mode === "sudden-death") {
      params.append("lives", lives.toString());
    } else if (mode === "501") {
      params.append("startScore", startScore.toString());
    } else if (mode === "cricket") {
      params.append("cricketMode", cricketMode);
    }

    navigate(`/game?${params.toString()}`);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Configuration</h1>
          <div className="w-10" />
        </div>

        {/* Configuration card */}
        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold capitalize mb-2">{mode}</h2>
            <p className="text-sm text-muted-foreground">
              Configure les paramètres de la partie
            </p>
          </div>

          {/* Sudden Death config */}
          {mode === "sudden-death" && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Nombre de vies</Label>
              <RadioGroup
                value={lives.toString()}
                onValueChange={(v) => setLives(parseInt(v))}
                className="space-y-3"
              >
                {[2, 3, 4, 5].map((n) => (
                  <div key={n} className="flex items-center space-x-3">
                    <RadioGroupItem value={n.toString()} id={`lives-${n}`} />
                    <Label htmlFor={`lives-${n}`} className="cursor-pointer text-base">
                      {n} vies
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* 501 config */}
          {mode === "501" && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Score de départ</Label>
              <RadioGroup
                value={startScore.toString()}
                onValueChange={(v) => setStartScore(parseInt(v))}
                className="space-y-3"
              >
                {[301, 501, 701, 901].map((n) => (
                  <div key={n} className="flex items-center space-x-3">
                    <RadioGroupItem value={n.toString()} id={`score-${n}`} />
                    <Label htmlFor={`score-${n}`} className="cursor-pointer text-base">
                      {n}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Cricket config */}
          {mode === "cricket" && (
            <div className="space-y-4">
              <Label className="text-base font-semibold">Mode de jeu</Label>
              <RadioGroup
                value={cricketMode}
                onValueChange={(v) => setCricketMode(v as "classic" | "random")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="classic" id="classic" />
                  <Label htmlFor="classic" className="cursor-pointer">
                    <div className="text-base font-medium">Classique</div>
                    <div className="text-sm text-muted-foreground">
                      Numéros 15, 16, 17, 18, 19, 20, 25
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="cursor-pointer">
                    <div className="text-base font-medium">Aléatoire</div>
                    <div className="text-sm text-muted-foreground">
                      7 numéros tirés au hasard
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </Card>

        {/* Start button */}
        <Button
          onClick={startGame}
          size="lg"
          className="w-full text-lg py-6"
        >
          <Play className="w-5 h-5 mr-2" />
          Commencer la partie
        </Button>
      </div>
    </div>
  );
};

export default GameConfig;
