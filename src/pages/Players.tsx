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
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">Sélection des joueurs</h1>
        </div>

        {/* Selected Players */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-primary">
            Joueurs sélectionnés ({selectedPlayers.length})
          </h2>
          {selectedPlayers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun joueur sélectionné
            </p>
          ) : (
            <div className="space-y-2">
              {selectedPlayers.map((player) => (
                <Card
                  key={player.id}
                  className="p-4 flex items-center justify-between bg-card border-2 border-primary/50"
                >
                  <span className="font-bold text-lg">{player.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlayer(player.id)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add New Player */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-secondary">Nouveau joueur</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Nom du joueur"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewPlayer()}
              className="flex-1 h-12 text-lg"
            />
            <Button
              variant="secondary"
              size="icon"
              onClick={addNewPlayer}
              className="h-12 w-12"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Saved Players */}
        {savedPlayers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-accent">Joueurs enregistrés</h2>
            <div className="grid grid-cols-2 gap-2">
              {savedPlayers.map((player) => {
                const isSelected = selectedPlayers.find(
                  (p) => p.id === player.id
                );
                return (
                  <Button
                    key={player.id}
                    variant={isSelected ? "default" : "outline"}
                    className="h-14 text-base"
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
          className="w-full"
          onClick={startGame}
          disabled={selectedPlayers.length < 2}
        >
          <Play className="w-6 h-6 mr-2" />
          Commencer la partie
        </Button>
      </div>
    </div>
  );
};

export default Players;
