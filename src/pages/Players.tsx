import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus, Play, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
}

const Players = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get("mode") || "cricket";

  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("darts-players");
    if (stored) {
      setSavedPlayers(JSON.parse(stored));
    }
  }, []);

  const addNewPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error("Entre un nom de joueur");
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
    };

    const updatedSaved = [...savedPlayers, newPlayer];
    setSavedPlayers(updatedSaved);
    localStorage.setItem("darts-players", JSON.stringify(updatedSaved));

    setSelectedPlayers([...selectedPlayers, newPlayer]);
    setNewPlayerName("");
    toast.success(`${newPlayer.name} ajouté!`);
  };

  const togglePlayer = (player: Player) => {
    if (selectedPlayers.find((p) => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
    } else {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter((p) => p.id !== playerId));
  };

  const startGame = () => {
    if (selectedPlayers.length < 2) {
      toast.error("Il faut au moins 2 joueurs");
      return;
    }
    const playerIds = selectedPlayers.map(p => p.id).join(",");
    navigate(`/config?mode=${gameMode}&players=${playerIds}`);
  };

  return (
    <div className="min-h-screen safe-top safe-bottom p-4 sm:p-6">
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold">Sélection</h1>
        </div>

        {/* Selected Players */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold">
              Joueurs ({selectedPlayers.length})
            </h2>
          </div>
          
          {selectedPlayers.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border-2 border-dashed glass-card">
              <p className="text-base sm:text-lg font-medium text-muted-foreground">Aucun joueur sélectionné</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">Ajoute au moins 2 joueurs</p>
            </Card>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {selectedPlayers.map((player, index) => (
                <Card
                  key={player.id}
                  className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between glass-card border-primary/30 shadow-lg animate-scale-in"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <span className="font-semibold text-sm sm:text-base truncate pr-2">{player.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(player.id)}
                    className="shrink-0 hover:text-destructive h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add New Player */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-secondary" />
            <h2 className="text-xl sm:text-2xl font-bold">Nouveau joueur</h2>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Input
              placeholder="Nom du joueur"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewPlayer()}
              className="flex-1 h-12 sm:h-14 text-base glass-card border-2 focus:border-secondary"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={addNewPlayer}
              className="h-12 w-12 sm:h-14 sm:w-14 shrink-0"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>
        </div>

        {/* Saved Players */}
        {savedPlayers.length > 0 && (
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl sm:text-2xl font-bold text-accent">Enregistrés</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {savedPlayers.map((player, index) => {
                const isSelected = selectedPlayers.find((p) => p.id === player.id);
                return (
                  <Button
                    key={player.id}
                    variant={isSelected ? "default" : "outline"}
                    className="h-auto py-3 sm:py-4 text-sm sm:text-base font-semibold animate-scale-in"
                    style={{ animationDelay: `${0.35 + index * 0.02}s` }}
                    onClick={() => togglePlayer(player)}
                  >
                    <span className="truncate">{player.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full h-14 sm:h-16 text-base sm:text-lg font-bold animate-fade-in-up touch-manipulation"
          style={{ animationDelay: '0.4s' }}
          onClick={startGame}
          disabled={selectedPlayers.length < 2}
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Continuer
        </Button>
      </div>
    </div>
  );
};

export default Players;
