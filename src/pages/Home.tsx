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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <Target className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Darts Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            Choisis ton mode de jeu
          </p>
        </div>

        <div className="space-y-4">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant="gameMode"
                className="w-full flex-col gap-3 p-6"
                onClick={() => navigate(`/players?mode=${mode.id}`)}
              >
                <Icon className="w-10 h-10" />
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{mode.name}</div>
                  <div className="text-sm text-muted-foreground font-normal">
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
