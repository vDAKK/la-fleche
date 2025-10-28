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
      description: "Ferme les numéros 15-20 et le bull",
    },
    {
      id: "sudden-death",
      name: "Mort Subite",
      icon: Skull,
      description: "Dernier joueur restant gagne",
    },
    {
      id: "501",
      name: "501",
      icon: TrendingDown,
      description: "Atteins exactement zéro",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Target className="w-20 h-20 text-primary animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </div>
          </div>
          <h1 className="text-7xl font-bold text-gradient-primary drop-shadow-lg tracking-wider">
            DARTS PRO
          </h1>
          <p className="text-muted-foreground text-xl font-medium">
            Choisis ton mode de jeu
          </p>
        </div>

        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {gameModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant="gameMode"
                className="w-full flex-col gap-4 p-8 h-auto hover:scale-105 transition-all duration-300 hover:glow-primary group animate-fade-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={() => navigate(`/players?mode=${mode.id}`)}
              >
                <Icon className="w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                <div className="space-y-2">
                  <div className="text-3xl font-bold tracking-wide">{mode.name}</div>
                  <div className="text-sm text-muted-foreground font-medium">
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
