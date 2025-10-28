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

    const playerIds = selectedPlayers.map((p) => p.id).join(",");
    navigate(`/game?mode=${gameMode}&players=${playerIds}`);
  };

  return (
    <div className="min-h-screen p-6 bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        <div className="flex items-center gap-4 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0 hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-4xl font-bold tracking-wide">Sélection</h1>
        </div>

        {/* Selected Players */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-primary tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Joueurs sélectionnés ({selectedPlayers.length})
          </h2>
          {selectedPlayers.length === 0 ? (
            <div className="text-muted-foreground text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-lg font-medium">Aucun joueur sélectionné</p>
              <p className="text-sm mt-2">Ajoute au moins 2 joueurs pour commencer</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedPlayers.map((player, index) => (
                <Card
                  key={player.id}
                  className="p-5 flex items-center justify-between bg-gradient-to-br from-card to-card/80 border-2 border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <span className="font-bold text-xl tracking-wide">{player.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(player.id)}
                    className="hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add New Player */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-secondary tracking-wide flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau joueur
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="Nom du joueur"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewPlayer()}
              className="flex-1 h-14 text-lg font-medium border-2 focus:border-secondary transition-colors"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={addNewPlayer}
              className="h-14 w-14 hover:scale-110 transition-transform shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Saved Players */}
        {savedPlayers.length > 0 && (
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-accent tracking-wide">Joueurs enregistrés</h2>
            <div className="grid grid-cols-2 gap-3">
              {savedPlayers.map((player, index) => {
                const isSelected = selectedPlayers.find(
                  (p) => p.id === player.id
                );
                return (
                  <Button
                    key={player.id}
                    variant={isSelected ? "default" : "outline"}
                    className="h-16 text-base font-semibold hover:scale-105 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${0.35 + index * 0.03}s` }}
                    onClick={() => togglePlayer(player)}
                  >
                    {player.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Game Button */}
        <Button
          variant="default"
          size="xl"
          className="w-full h-16 text-xl font-bold tracking-wide hover:scale-105 transition-all duration-300 shadow-xl glow-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
          onClick={startGame}
          disabled={selectedPlayers.length < 2}
        >
          <Play className="w-7 h-7 mr-3" />
          Commencer la partie
        </Button>
      </div>
    </div>
  );
};

export default Players;
