import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Skull, TrendingDown } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const gameModes = [
    {
      id: "cricket",
      name: "Cricket",
      icon: Target,
      description: "Ferme les numéros et gagne avec le moins de points",
      gradient: "from-primary/20 to-primary/5",
    },
    {
      id: "501",
      name: "501",
      icon: TrendingDown,
      description: "Atteins exactement zéro avec un double",
      gradient: "from-secondary/20 to-secondary/5",
    },
    {
      id: "sudden-death",
      name: "Mort Subite",
      icon: Skull,
      description: "Score le plus ou perds une vie",
      gradient: "from-accent/20 to-accent/5",
    },
  ];

  return (
    <div className="min-h-screen safe-top safe-bottom flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[600px] sm:h-[600px] rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
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
              DARTS PRO
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg font-medium">
              Choisis ton mode de jeu
            </p>
          </div>
        </div>

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
