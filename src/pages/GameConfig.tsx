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

  const [lives, setLives] = useState(3);
  const [startScore, setStartScore] = useState(501);
  const [cricketMode, setCricketMode] = useState<"classic" | "random">("classic");
  const [doubleOut, setDoubleOut] = useState(true);

  const startGame = () => {
    if (!players) {
      toast.error("Aucun joueur sélectionné");
      navigate("/");
      return;
    }

    const params = new URLSearchParams({ mode, players });

    if (mode === "sudden-death") {
      params.append("lives", lives.toString());
    } else if (mode === "501") {
      params.append("startScore", startScore.toString());
      params.append("doubleOut", doubleOut.toString());
    } else if (mode === "cricket") {
      params.append("cricketMode", cricketMode);
    }

    navigate(`/game?${params.toString()}`);
  };

  return (
    <div className="min-h-screen safe-top safe-bottom p-4 sm:p-6">
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/players?mode=${mode}`)}>
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Configuration</h1>
          <div className="w-10 sm:w-12" />
        </div>

        {/* Config Card */}
        <Card className="p-6 sm:p-8 space-y-6 glass-card border-primary/20 shadow-xl animate-scale-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold capitalize">{mode}</h2>
            <p className="text-sm text-muted-foreground">
              Configure les paramètres
            </p>
          </div>

          {/* Sudden Death config */}
          {mode === "sudden-death" && (
            <div className="space-y-4">
              <Label className="text-base sm:text-lg font-semibold">Nombre de vies</Label>
              <RadioGroup
                value={lives.toString()}
                onValueChange={(v) => setLives(parseInt(v))}
                className="grid grid-cols-2 gap-3"
              >
                {[2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    htmlFor={`lives-${n}`}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      lives === n
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={n.toString()} id={`lives-${n}`} />
                    <span className="font-semibold">{n} vies</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* 501 config */}
          {mode === "501" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base sm:text-lg font-semibold">Score de départ</Label>
                <RadioGroup
                  value={startScore.toString()}
                  onValueChange={(v) => setStartScore(parseInt(v))}
                  className="grid grid-cols-2 gap-3"
                >
                  {[301, 501, 701, 901].map((n) => (
                    <label
                      key={n}
                      htmlFor={`score-${n}`}
                      className={`flex items-center justify-center space-x-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        startScore === n
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card/50 hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={n.toString()} id={`score-${n}`} />
                      <span className="font-semibold">{n}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base sm:text-lg font-semibold">Règle de sortie</Label>
                <RadioGroup
                  value={doubleOut.toString()}
                  onValueChange={(v) => setDoubleOut(v === "true")}
                  className="space-y-3"
                >
                  <label
                    htmlFor="double-on"
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      doubleOut
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="true" id="double-on" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold">Double Out ON</div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Finir avec un double obligatoire
                      </div>
                    </div>
                  </label>
                  <label
                    htmlFor="double-off"
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      !doubleOut
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50 hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="false" id="double-off" className="mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold">Double Out OFF</div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Finir avec n'importe quel score
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Cricket config */}
          {mode === "cricket" && (
            <div className="space-y-4">
              <Label className="text-base sm:text-lg font-semibold">Mode de jeu</Label>
              <RadioGroup
                value={cricketMode}
                onValueChange={(v) => setCricketMode(v as "classic" | "random")}
                className="space-y-3"
              >
                <label
                  htmlFor="classic"
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    cricketMode === "classic"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/50 hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="classic" id="classic" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold">Classique</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      15, 16, 17, 18, 19, 20, 25
                    </div>
                  </div>
                </label>
                <label
                  htmlFor="random"
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    cricketMode === "random"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card/50 hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="random" id="random" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold">Aléatoire</div>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                      7 numéros tirés au hasard
                    </div>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}
        </Card>

        {/* Start button */}
        <Button
          onClick={startGame}
          size="lg"
          className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold animate-fade-in-up touch-manipulation"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Commencer la partie
        </Button>
      </div>
    </div>
  );
};

export default GameConfig;
