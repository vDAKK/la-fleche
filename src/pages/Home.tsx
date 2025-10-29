import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Skull, TrendingDown, Play, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";

const Home = () => {
  const navigate = useNavigate();
  const [savedGame, setSavedGame] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("darts-game-in-progress");
    if (saved) {
      try {
        const game = JSON.parse(saved);
        // Check if game is less than 24 hours old
        const hoursSinceLastPlay = (Date.now() - game.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastPlay < 24) {
          setSavedGame(game);
        } else {
          localStorage.removeItem("darts-game-in-progress");
        }
      } catch (e) {
        console.error("Failed to load saved game", e);
      }
    }
  }, []);

  const resumeGame = () => {
    let target = savedGame?.route ?? savedGame?.path;
    if (!target) return;
    
    // On native platforms (HashRouter), use the path as-is
    if (Capacitor.isNativePlatform()) {
      // Fallback for legacy saved games (HashRouter path missing): rebuild route
      if (!target || target === "/") {
        const params = new URLSearchParams();
        if (savedGame?.gameMode) params.set("mode", savedGame.gameMode);
        if (Array.isArray(savedGame?.players) && savedGame.players.length > 0) {
          params.set("players", savedGame.players.map((p: any) => p.id).join(","));
        }
        if (savedGame?.configLives != null) params.set("lives", String(savedGame.configLives));
        if (savedGame?.configStartScore != null) params.set("startScore", String(savedGame.configStartScore));
        if (savedGame?.configCricketMode) params.set("cricketMode", savedGame.configCricketMode);
        if (savedGame?.configDoubleOut != null) params.set("doubleOut", String(savedGame.configDoubleOut));
        target = `/game?${params.toString()}`;
      }
      navigate(target);
      return;
    }
    
    // On web (BrowserRouter), handle BASE_URL
    const base = import.meta.env.BASE_URL || "/";
    if (base !== "/" && target.startsWith(base)) {
      target = target.replace(base, "/");
    }
    navigate(target);
  };

  const deleteSavedGame = () => {
    localStorage.removeItem("darts-game-in-progress");
    setSavedGame(null);
  };

  const gameModes = [
    {
      id: "cricket",
      name: "Cricket",
      icon: Target,
      description: "Ferme les numéros et gagne avec le moins de points",
      gradient: "from-primary/15 to-primary/5",
    },
    {
      id: "501",
      name: "501",
      icon: TrendingDown,
      description: "Atteins exactement zéro avec un double",
      gradient: "from-muted/20 to-muted/5",
    },
    {
      id: "sudden-death",
      name: "Mort Subite",
      icon: Skull,
      description: "Score le plus ou perds une vie",
      gradient: "from-primary/10 to-muted/10",
    },
  ];

  return (
    <div className="min-h-screen safe-top safe-bottom flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-primary/6 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[600px] sm:h-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-8 sm:space-y-12 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative animate-float">
              <Target className="w-16 h-16 sm:w-20 sm:h-20 text-primary drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]" strokeWidth={2.5} />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gradient-primary mb-2 sm:mb-3">
              LA FLÈCHE
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              Choisis ton mode de jeu
            </p>
          </div>
        </div>

        {/* Resume game card */}
        {savedGame && (
          <Card className="p-4 sm:p-6 glass-card border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Partie en cours</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {savedGame.players?.length} joueurs • {savedGame.gameMode === "cricket" ? "Cricket" : savedGame.gameMode === "501" ? "501" : "Mort Subite"}
                </p>
                <Button 
                  onClick={resumeGame}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reprendre la partie
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={deleteSavedGame}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Game modes */}
        <div className="space-y-3 sm:space-y-4">
          {gameModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant="gameMode"
                className={`w-full flex-col gap-3 sm:gap-4 p-6 sm:p-8 h-auto bg-gradient-to-br ${mode.gradient} backdrop-blur-md animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/players?mode=${mode.id}`)}
              >
                <Icon className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                <div className="space-y-1 sm:space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight">{mode.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xs">
                    {mode.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
