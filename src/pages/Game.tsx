import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Undo2, Trophy, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
}

interface GamePlayer extends Player {
  score: number;
  cricketMarks?: Record<number, number>;
  lives?: number;
  turnsPlayed?: number;
  totalThrown?: number;
}

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameMode = searchParams.get("mode") || "cricket";
  const playerIds = searchParams.get("players")?.split(",") || [];
  
  // Game config from URL params
  const configLives = parseInt(searchParams.get("lives") || "3");
  const configStartScore = parseInt(searchParams.get("startScore") || "501");
  const configCricketMode = (searchParams.get("cricketMode") || "classic") as "classic" | "random";
  const configDoubleOut = searchParams.get("doubleOut") !== "false"; // Default to true

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [dartCount, setDartCount] = useState(0);
  const [currentThrows, setCurrentThrows] = useState<{ base: number; mult: number }[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [doubleOut] = useState(configDoubleOut);
  const [previousTurnState, setPreviousTurnState] = useState<{
    players: GamePlayer[];
    playerIndex: number;
  } | null>(null);
  const [cricketNumbers, setCricketNumbers] = useState<number[]>([]);
  const [roundScores, setRoundScores] = useState<Map<string, number>>(new Map());
  const [winner, setWinner] = useState<GamePlayer | null>(null);
  const [showVictoryDialog, setShowVictoryDialog] = useState(false);

  // Save game state to localStorage
  useEffect(() => {
    if (players.length > 0 && !winner) {
      const base = import.meta.env.BASE_URL || "/";
      const pathnameSearch = window.location.pathname + window.location.search;
      const hashPath = window.location.hash && window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const effectiveRoute = hashPath && hashPath.startsWith("/")
        ? hashPath
        : pathnameSearch.replace(base, "/");
      const effectivePath = hashPath && hashPath.startsWith("/")
        ? hashPath
        : pathnameSearch;

      const gameState = {
        players,
        currentPlayerIndex,
        dartCount,
        currentThrows,
        multiplier,
        doubleOut,
        previousTurnState,
        cricketNumbers,
        roundScores: Array.from(roundScores.entries()),
        gameMode,
        configLives,
        configStartScore,
        configCricketMode,
        configDoubleOut,
        // Router-aware route (supports HashRouter on native)
        route: effectiveRoute,
        // Absolute-ish path used for backward compatibility
        path: effectivePath,
        timestamp: Date.now(),
      };
      localStorage.setItem("darts-game-in-progress", JSON.stringify(gameState));
    }
  }, [players, currentPlayerIndex, dartCount, currentThrows, multiplier, roundScores, winner]);

  // Clear saved game when game ends
  useEffect(() => {
    if (winner) {
      localStorage.removeItem("darts-game-in-progress");
    }
  }, [winner]);

  // Initialize players once
  useEffect(() => {
    // Check for saved game state first
    const savedGame = localStorage.getItem("darts-game-in-progress");
    if (savedGame) {
      try {
        const state = JSON.parse(savedGame);
        // Only restore if it's the same game (matching URL params / route)
        const currentPath = window.location.pathname + window.location.search;
        const base = import.meta.env.BASE_URL || "/";
        const hashPath = window.location.hash && window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : "";
        const currentRoute = hashPath && hashPath.startsWith("/")
          ? hashPath
          : currentPath.replace(base, "/");
        if ((state.route && state.route === currentRoute) || state.path === currentPath || (hashPath && (state.route === hashPath || state.path === hashPath))) {
          setPlayers(state.players);
          setCurrentPlayerIndex(state.currentPlayerIndex);
          setDartCount(state.dartCount);
          setCurrentThrows(state.currentThrows);
          setMultiplier(state.multiplier);
          setPreviousTurnState(state.previousTurnState);
          setCricketNumbers(state.cricketNumbers || []);
          setRoundScores(new Map(state.roundScores || []));
          toast.success("Partie reprise !");
          return;
        }
      } catch (e) {
        console.error("Failed to restore game state", e);
      }
    }

    const stored = localStorage.getItem("darts-players");
    if (!stored) {
      navigate("/");
      return;
    }

    const allPlayers: Player[] = JSON.parse(stored);
    const selectedPlayers = playerIds
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter((p): p is Player => p !== undefined);

    if (selectedPlayers.length < 2) {
      toast.error("Il faut au moins 2 joueurs");
      navigate("/");
      return;
    }

    // Generate cricket numbers
    let numbers: number[];
    if (gameMode === "cricket") {
      if (configCricketMode === "random") {
        // Generate 7 random numbers between 1-20 + bull (25)
        const availableNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
        const shuffled = availableNumbers.sort(() => Math.random() - 0.5);
        numbers = shuffled.slice(0, 6).concat([25]).sort((a, b) => a - b);
      } else {
        numbers = [15, 16, 17, 18, 19, 20, 25];
      }
      setCricketNumbers(numbers);
    }

    const gamePlayers: GamePlayer[] = selectedPlayers.map((p) => ({
      ...p,
      score: gameMode === "501" ? configStartScore : 0,
      cricketMarks:
        gameMode === "cricket"
          ? Object.fromEntries(numbers.map(n => [n, 0]))
          : undefined,
      lives: gameMode === "sudden-death" ? configLives : undefined,
      turnsPlayed: 0,
      totalThrown: 0,
    }));

    setPlayers(gamePlayers);
  }, []); // Run only once

  const currentPlayer = players[currentPlayerIndex];

  const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];

  const handleScore = (baseScore: number) => {
    const newThrows = [...currentThrows, { base: baseScore, mult: multiplier }];
    setCurrentThrows(newThrows);
    setDartCount(dartCount + 1);

    // Update score immediately for cricket
    if (gameMode === "cricket") {
      const updatedPlayers = [...players];
      const player = updatedPlayers[currentPlayerIndex];
      const dart = { base: baseScore, mult: multiplier };
      
      if (cricketNumbers.includes(dart.base) && player.cricketMarks) {
        const currentMarks = player.cricketMarks[dart.base] || 0;
        const marksToAdd = dart.mult;
        const newMarks = Math.min(currentMarks + marksToAdd, 3);
        const extraMarks = Math.max(0, currentMarks + marksToAdd - 3);

        // Update marks
        player.cricketMarks[dart.base] = newMarks;

        // Score points for OTHER players who haven't closed this number
        if (extraMarks > 0) {
          updatedPlayers.forEach((otherPlayer, idx) => {
            if (idx !== currentPlayerIndex && otherPlayer.cricketMarks) {
              const otherMarks = otherPlayer.cricketMarks[dart.base] || 0;
              if (otherMarks < 3) {
                otherPlayer.score += dart.base * extraMarks;
              }
            }
          });
        }
      }
      
      setPlayers(updatedPlayers);
    }

    // For 501 mode, check immediately if player reached 0
    if (gameMode === "501") {
      const total = newThrows.reduce((a, b) => a + b.base * b.mult, 0);
      const newScore = currentPlayer.score - total;
      const lastDart = newThrows[newThrows.length - 1];
      
      // If player reaches exactly 0 with valid conditions, end turn immediately
      if (newScore === 0 && (!doubleOut || lastDart.mult === 2)) {
        processTurn(newThrows);
        return;
      }
    }

    // After 3 darts, process turn
    if (dartCount + 1 === 3) {
      processTurn(newThrows);
    } else {
      setMultiplier(1); // Reset multiplier
    }
  };

  const processTurn = (throws: { base: number; mult: number }[]) => {
    // Save current state before processing turn
    setPreviousTurnState({
      players: JSON.parse(JSON.stringify(players)),
      playerIndex: currentPlayerIndex,
    });

    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayerIndex];
    
    // Track statistics
    player.turnsPlayed = (player.turnsPlayed || 0) + 1;
    const turnTotal = throws.reduce((a, b) => a + b.base * b.mult, 0);
    player.totalThrown = (player.totalThrown || 0) + turnTotal;

    if (gameMode === "cricket") {
      // Process each throw for cricket
      throws.forEach((dart) => {
        if (cricketNumbers.includes(dart.base) && player.cricketMarks) {
          const currentMarks = player.cricketMarks[dart.base] || 0;
          const marksToAdd = dart.mult;
          const newMarks = Math.min(currentMarks + marksToAdd, 3);
          const extraMarks = Math.max(0, currentMarks + marksToAdd - 3);

          // Update marks
          player.cricketMarks[dart.base] = newMarks;

          // Score points for OTHER players who haven't closed this number
          if (extraMarks > 0) {
            updatedPlayers.forEach((otherPlayer, idx) => {
              if (idx !== currentPlayerIndex && otherPlayer.cricketMarks) {
                const otherMarks = otherPlayer.cricketMarks[dart.base] || 0;
                if (otherMarks < 3) {
                  otherPlayer.score += dart.base * extraMarks;
                }
              }
            });
          }
        }
      });

      // Check win
      const allClosed =
        player.cricketMarks &&
        cricketNumbers.every((n) => (player.cricketMarks![n] || 0) >= 3);
      if (allClosed) {
        const hasLowestScore = updatedPlayers.every(
          (p, idx) => idx === currentPlayerIndex || player.score <= p.score
        );
        if (hasLowestScore) {
          setWinner(player);
          setShowVictoryDialog(true);
          setPlayers(updatedPlayers);
          return;
        }
      }
    } else if (gameMode === "501") {
      const total = throws.reduce((a, b) => a + b.base * b.mult, 0);
      const lastDart = throws[throws.length - 1];
      const newScore = player.score - total;

      // Check bust
      if (newScore < 0 || newScore === 1 || (doubleOut && newScore === 0 && lastDart.mult !== 2)) {
        toast.error("Bust!");
      } else {
        player.score = newScore;
        if (newScore === 0) {
          setWinner(player);
          setShowVictoryDialog(true);
          setPlayers(updatedPlayers);
          return;
        }
      }
    } else if (gameMode === "sudden-death") {
      const total = throws.reduce((a, b) => a + b.base * b.mult, 0);
      player.score += total;

      // Store this turn's score
      const newRoundScores = new Map(roundScores);
      newRoundScores.set(player.id, total);

      // Check if round is complete (all players have played)
      let nextIndex = (currentPlayerIndex + 1) % players.length;
      while ((updatedPlayers[nextIndex].lives || 0) <= 0 && nextIndex !== 0) {
        nextIndex = (nextIndex + 1) % players.length;
      }

      // If we're back to player 0 (or first alive player), round is complete
      const alivePlayers = updatedPlayers.filter((p) => (p.lives || 0) > 0);
      const isRoundComplete = newRoundScores.size === alivePlayers.length;

      if (isRoundComplete) {
        // Find player(s) with lowest score
        let lowestScore = Infinity;
        const scores = Array.from(newRoundScores.entries());
        
        scores.forEach(([_, score]) => {
          if (score < lowestScore) lowestScore = score;
        });

        // Remove life from player(s) with lowest score
        scores.forEach(([playerId, score]) => {
          if (score === lowestScore) {
            const loserPlayer = updatedPlayers.find(p => p.id === playerId);
            if (loserPlayer && loserPlayer.lives) {
              loserPlayer.lives -= 1;
              if (loserPlayer.lives === 0) {
                toast.error(`${loserPlayer.name} éliminé!`);
              } else {
                toast.warning(`${loserPlayer.name} perd une vie (${score} pts)`);
              }
            }
          }
        });

        // Clear round scores for next round
        setRoundScores(new Map());
      } else {
        setRoundScores(newRoundScores);
      }

      const alive = updatedPlayers.filter((p) => (p.lives || 0) > 0);
      if (alive.length === 1) {
        setWinner(alive[0]);
        setShowVictoryDialog(true);
        setPlayers(updatedPlayers);
        return;
      }
    }

    setPlayers(updatedPlayers);

    // Next player
    let nextIndex = (currentPlayerIndex + 1) % players.length;
    if (gameMode === "sudden-death") {
      while ((updatedPlayers[nextIndex].lives || 0) <= 0) {
        nextIndex = (nextIndex + 1) % players.length;
      }
    }

    setCurrentPlayerIndex(nextIndex);
    setDartCount(0);
    setCurrentThrows([]);
    setMultiplier(1);
  };

  const undo = () => {
    if (dartCount > 0) {
      // Undo current throw
      setCurrentThrows(currentThrows.slice(0, -1));
      setDartCount(dartCount - 1);
      setMultiplier(1);
    } else if (previousTurnState) {
      // Undo previous player's turn
      setPlayers(previousTurnState.players);
      setCurrentPlayerIndex(previousTurnState.playerIndex);
      setDartCount(0);
      setCurrentThrows([]);
      setMultiplier(1);
      setPreviousTurnState(null);
      setRoundScores(new Map()); // Reset round scores
      toast.info("Tour précédent annulé");
    }
  };

  const getMarkSymbol = (marks: number) => {
    if (marks === 0) return "";
    if (marks === 1) return "/";
    if (marks === 2) return "X";
    return "✓";
  };

  // Checkout suggestions for 501 mode
  const getCheckoutSuggestions = (score: number): string[] => {
    if (score > 170 || score <= 1) return [];
    
    const checkouts: Record<number, string[]> = {
      2: ["D1"], 3: ["1, D1"], 4: ["D2"], 5: ["1, D2", "3, D1"],
      6: ["D3"], 7: ["3, D2", "1, D3"], 8: ["D4"], 9: ["1, D4", "5, D2"],
      10: ["D5"], 11: ["3, D4", "1, D5"], 12: ["D6"], 13: ["3, D5", "1, D6"],
      14: ["D7"], 15: ["7, D4", "3, D6"], 16: ["D8"], 17: ["9, D4", "1, D8"],
      18: ["D9"], 19: ["3, D8", "7, D6"], 20: ["D10"], 21: ["5, D8", "1, D10"],
      22: ["D11"], 23: ["7, D8", "3, D10"], 24: ["D12"], 25: ["9, D8", "1, D12"],
      26: ["D13"], 27: ["11, D8", "3, D12"], 28: ["D14"], 29: ["13, D8", "5, D12"],
      30: ["D15"], 31: ["15, D8", "7, D12"], 32: ["D16"], 33: ["17, D8", "1, D16"],
      34: ["D17"], 35: ["19, D8", "3, D16"], 36: ["D18"], 37: ["5, D16", "1, D18"],
      38: ["D19"], 39: ["7, D16", "3, D18"], 40: ["D20"], 41: ["9, D16", "1, D20"],
      42: ["D21", "10, D16"], 43: ["3, D20", "11, D16"], 44: ["D22", "12, D16"],
      45: ["13, D16", "5, D20"], 46: ["D23", "6, D20"], 47: ["15, D16", "7, D20"],
      48: ["D24", "16, D16"], 49: ["17, D16", "9, D20"], 50: ["Bull", "10, D20"],
      51: ["19, D16", "11, D20"], 52: ["D26", "20, D16"], 53: ["13, D20", "1, D26"],
      54: ["D27", "14, D20"], 55: ["15, D20", "Bull-5"], 56: ["T16, D4", "16, D20"],
      57: ["17, D20", "T15, D6"], 58: ["18, D20", "T14, D8"], 59: ["19, D20", "T13, D10"],
      60: ["20, D20"], 61: ["T15, D8", "25, D18"], 62: ["T10, D16", "Bull-12"],
      63: ["T13, D12", "T9, D18"], 64: ["T16, D8", "T14, D10"], 65: ["25, D20", "T11, D16"],
      66: ["T10, D18", "T14, D12"], 67: ["T17, D8", "T9, D20"], 68: ["T20, D4", "T16, D10"],
      69: ["T19, D6", "T15, D12"], 70: ["T10, D20", "T18, D8"], 71: ["T13, D16", "T17, D10"],
      72: ["T16, D12", "T14, D15"], 73: ["T19, D8", "T15, D14"], 74: ["T14, D16", "T18, D10"],
      75: ["T17, D12", "T15, D15"], 76: ["T20, D8", "T16, D14"], 77: ["T19, D10", "T15, D16"],
      78: ["T18, D12", "T14, D18"], 79: ["T19, D11", "T13, D20"], 80: ["T20, D10", "T16, D16"],
      81: ["T19, D12", "T15, D18"], 82: ["Bull, D16", "T14, D20"], 83: ["T17, D16", "T13, D21"],
      84: ["T20, D12", "T16, D18"], 85: ["T15, D20", "T19, D14"], 86: ["T18, D16", "T14, D22"],
      87: ["T17, D18", "T13, D24"], 88: ["T20, D14", "T16, D20"], 89: ["T19, D16", "T15, D22"],
      90: ["T20, D15", "T18, D18"], 91: ["T17, D20", "T13, D26"], 92: ["T20, D16", "T16, D22"],
      93: ["T19, D18", "T15, D24"], 94: ["T18, D20", "T14, D26"], 95: ["T19, D19", "T15, D25"],
      96: ["T20, D18", "T16, D24"], 97: ["T19, D20", "T15, D26"], 98: ["T20, D19", "T14, Bull"],
      99: ["T19, D21", "T13, Bull"], 100: ["T20, D20"], 101: ["T17, Bull", "T20, 1, D20"],
      102: ["T20, D21", "T14, Bull"], 103: ["T19, D23", "T17, D16, D8"], 104: ["T18, Bull", "T20, D22"],
      105: ["T20, 5, D20", "T19, D24"], 106: ["T20, D23", "T18, D16, D8"], 107: ["T19, Bull", "T17, D16, D10"],
      108: ["T20, D24", "T16, Bull"], 109: ["T20, 9, D20", "T19, D16, D10"], 110: ["T20, Bull", "T18, D20"],
      111: ["T19, D16, D11", "T20, 11, D20"], 112: ["T20, D16, D10", "T18, D16, D11"],
      113: ["T19, D16, D12", "T20, 13, D20"], 114: ["T20, D16, D11", "T18, D20"],
      115: ["T19, D16, D13", "T20, 15, D20"], 116: ["T20, D16, D12", "T19, D19, D10"],
      117: ["T20, 17, D20", "T19, D20"], 118: ["T20, D16, D13", "T18, D16, D13"],
      119: ["T19, Bull", "T20, 19, D20"], 120: ["T20, 20, D20"],
      121: ["T20, T17, D5", "T17, Bull"], 122: ["T18, D16, D13", "T20, D16, D15"],
      123: ["T19, D16, D15", "T17, D16, D16"], 124: ["T20, D16, D16", "T16, Bull"],
      125: ["25, T20, D20", "T18, D16, D17"], 126: ["T19, D19, D16", "T20, D16, D17"],
      127: ["T20, T17, D8", "T17, D16, D18"], 128: ["T18, D16, D18", "T20, D16, D18"],
      129: ["T19, T16, D12", "T19, D16, D18"], 130: ["T20, T18, D8", "T20, Bull"],
      131: ["T20, T13, D16", "T19, T14, D16"], 132: ["Bull, Bull, D16", "T20, T16, D12"],
      133: ["T20, T19, D8", "T19, T16, D14"], 134: ["T20, T14, D16", "T20, T18, D10"],
      135: ["Bull, Bull, D17", "T20, T15, D15"], 136: ["T20, T20, D8"],
      137: ["T20, T19, D10", "T17, T18, D16"], 138: ["T20, T18, D12", "T19, T19, D12"],
      139: ["T20, T13, D20", "T19, T14, D20"], 140: ["T20, T20, D10"],
      141: ["T20, T19, D12", "T19, T16, D18"], 142: ["T20, T14, D20", "Bull, Bull, D20"],
      143: ["T20, T17, D16", "T19, T18, D16"], 144: ["T20, T20, D12"],
      145: ["T20, T15, D20", "T19, T18, D17"], 146: ["T20, T18, D16", "T19, T19, D16"],
      147: ["T20, T17, D18", "T19, T16, D21"], 148: ["T20, T20, D14"],
      149: ["T20, T19, D16", "T19, T18, D19"], 150: ["T20, T18, D18"],
      151: ["T20, T17, D20", "T19, T18, D20"], 152: ["T20, T20, D16"],
      153: ["T20, T19, D18", "T19, T16, Bull"], 154: ["T20, T18, D20"],
      155: ["T20, T19, D19", "T19, T20, D19"], 156: ["T20, T20, D18"],
      157: ["T20, T19, D20", "T19, T18, Bull"], 158: ["T20, T20, D19"],
      159: ["T20, T19, D21", "T19, T20, D21"], 160: ["T20, T20, D20"],
      161: ["T20, T17, Bull", "T19, T20, D22"], 164: ["T20, T18, Bull", "T19, T19, Bull"],
      167: ["T20, T19, Bull", "T19, T18, D20, D13"], 170: ["T20, T20, Bull"]
    };
    
    return checkouts[score] || [`Aucune combinaison standard pour ${score}`];
  };

  const getGameModeName = (mode: string) => {
    const names: Record<string, string> = {
      "cricket": "Cricket",
      "501": "501",
      "sudden-death": "Mort Subite"
    };
    return names[mode] || mode;
  };

  if (!currentPlayer) return null;

  const numbersToShow = gameMode === "cricket" 
    ? [0, ...cricketNumbers] // Include 0 for missed throws
    : allNumbers;

  const getScoresHeightClass = () => {
    if (gameMode === "cricket") {
      if (players.length <= 2) return "h-[24vh] sm:h-[28vh]";
      if (players.length === 3) return "h-[34vh] sm:h-[38vh]";
      return "h-[40vh] sm:h-[45vh]"; // 4+ joueurs: hauteur max
    }
    // 501 & sudden-death: cartes plus compactes
    if (players.length <= 2) return "h-[16vh] sm:h-[20vh]";
    if (players.length === 3) return "h-[22vh] sm:h-[26vh]";
    return "h-[28vh] sm:h-[30vh]"; // 4+ joueurs
  };

  // Pour la mort subite, déterminer le(s) joueur(s) en danger
  const getLowestTurnScore = () => {
    if (gameMode !== "sudden-death" || roundScores.size === 0) return null;
    let lowest = Infinity;
    roundScores.forEach((score) => {
      if (score < lowest) lowest = score;
    });
    return lowest;
  };
  const lowestTurnScore = getLowestTurnScore();

  return (
    <div className="h-screen flex flex-col safe-top safe-bottom bg-background overflow-hidden">
      <div className="flex-1 overflow-hidden overscroll-none p-3 sm:p-4 flex flex-col">
        <div className="max-w-2xl mx-auto w-full space-y-3 sm:space-y-4 animate-fade-in overflow-y-auto overscroll-none flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">{getGameModeName(gameMode)}</h1>
          <div className="w-11"></div>
        </div>

        {/* Players Scores */}
        <ScrollArea className={`overflow-auto overscroll-contain touch-pan-y w-full rounded-lg border border-border/30 bg-background/50 p-2 ${getScoresHeightClass()}`}>
          <div className={`grid gap-2 pb-2 ${players.length === 2 ? 'grid-cols-2' : players.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {players.map((player, idx) => {
              const turnScore = gameMode === "sudden-death" ? (roundScores.get(player.id) || 0) : null;
              const isInDanger = gameMode === "sudden-death" 
                && lowestTurnScore !== null 
                && turnScore === lowestTurnScore 
                && roundScores.size > 0;
              
              return (
              <Card
                key={player.id}
                className={`p-2 sm:p-3 glass-card transition-all duration-300 ${
                  idx === currentPlayerIndex
                    ? "border-2 border-primary bg-primary/10 shadow-lg glow-primary"
                    : isInDanger
                    ? "border-2 border-destructive bg-destructive/10 shadow-lg shadow-destructive/30 animate-pulse"
                    : "border border-border/50 opacity-70"
                }`}
              >
                <div className="font-bold text-xs truncate mb-1">{player.name}</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {gameMode === "sudden-death" ? turnScore : player.score}
                </div>

                {/* Cricket marks */}
                {gameMode === "cricket" && player.cricketMarks && (
                  <ScrollArea className="mt-1.5 h-24 overscroll-contain touch-pan-y w-full">
                    <div className="grid grid-cols-4 gap-0.5 pr-1 pb-1">
                      {cricketNumbers.map((num) => {
                        const marks = player.cricketMarks![num] || 0;
                        const closed = marks >= 3;
                        return (
                          <div
                            key={num}
                            className={`text-[8px] sm:text-[9px] p-0.5 rounded transition-all duration-300 ${
                              marks === 0
                                ? "bg-muted/30 text-muted-foreground border border-border/30"
                                : marks === 1
                                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-sm"
                                : marks === 2
                                ? "bg-orange-500/25 text-orange-300 border border-orange-500/50 shadow-md"
                                : "bg-primary/25 text-primary border-2 border-primary/60 shadow-lg shadow-primary/20 font-bold"
                            }`}
                          >
                            <div className="font-semibold">{num}</div>
                            <div className="text-[9px] font-bold">{getMarkSymbol(marks)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}

                {/* Lives */}
                {gameMode === "sudden-death" && (
                  <div className="mt-2 text-sm flex items-center gap-1">
                    {Array.from({ length: player.lives || 0 }).map((_, i) => (
                      <span key={i} className="text-lg">❤️</span>
                    ))}
                  </div>
                )}
              </Card>
            );
            })}
          </div>
        </ScrollArea>

        {/* Current turn */}
        <Card className="p-4 sm:p-5 glass-card border-primary/20">
          <div className="text-center text-sm sm:text-base font-bold mb-3">
            <span className="text-primary">{currentPlayer.name}</span> - Lancer {dartCount + 1}/3
          </div>
          <div className="flex justify-center items-center gap-2 sm:gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-lg sm:text-xl font-bold transition-all ${
                  i < dartCount
                    ? "bg-gradient-to-br from-secondary to-secondary/80 border-secondary shadow-lg"
                    : i === dartCount
                    ? "bg-primary/20 border-primary animate-pulse"
                    : "bg-muted/30 border-muted"
                }`}
              >
                {currentThrows[i] 
                  ? currentThrows[i].mult === 2 
                    ? `D${currentThrows[i].base}` 
                    : currentThrows[i].mult === 3 
                    ? `T${currentThrows[i].base}` 
                    : currentThrows[i].base 
                  : ""}
              </div>
            ))}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={undo} 
              disabled={dartCount === 0 && !previousTurnState}
              className="disabled:opacity-30 ml-1"
            >
              <Undo2 className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Checkout suggestions for 501 */}
        {gameMode === "501" && currentPlayer.score <= 170 && currentPlayer.score > 1 && (
          <Card className="p-4 glass-card bg-accent/10 border-accent/30 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-accent" />
              <div className="text-sm font-bold">Suggestions de finish</div>
            </div>
            <div className="space-y-2">
              {getCheckoutSuggestions(currentPlayer.score).map((suggestion, idx) => (
                <div key={idx} className="text-xs sm:text-sm font-mono bg-background/60 px-3 py-2 rounded-xl border border-accent/20">
                  {suggestion}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Multiplier */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((m) => (
            <Button
              key={m}
              variant={multiplier === m ? "default" : "outline"}
              size="lg"
              onClick={() => setMultiplier(m)}
              className={`font-bold transition-all touch-manipulation ${
                multiplier === m ? "scale-105" : ""
              }`}
            >
              {m === 1 ? "Simple" : m === 2 ? "Double" : "Triple"}
            </Button>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {numbersToShow.map((num) => {
            const currentMarks = gameMode === "cricket" && currentPlayer.cricketMarks 
              ? currentPlayer.cricketMarks[num] || 0 
              : 0;
            
            // Vérifier si ce numéro peut rapporter des points
            const canScore = gameMode === "cricket" && currentMarks >= 3 && 
              players.some((p, idx) => idx !== currentPlayerIndex && p.cricketMarks && (p.cricketMarks[num] || 0) < 3);
            
            return (
              <Button
                key={num}
                variant="score"
                onClick={() => handleScore(num)}
                disabled={num === 25 && multiplier === 3}
                className={`h-14 sm:h-16 text-base sm:text-lg font-bold transition-all touch-manipulation relative ${
                  num === 25 ? "col-span-2" : ""
                } ${
                  multiplier === 2
                    ? "ring-2 ring-accent shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
                    : multiplier === 3
                    ? "ring-2 ring-secondary shadow-[0_0_15px_hsl(var(--secondary)/0.3)]"
                    : ""
                } ${
                  gameMode === "cricket" && currentMarks === 1
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : gameMode === "cricket" && currentMarks === 2
                    ? "border-orange-500/50 bg-orange-500/10"
                    : gameMode === "cricket" && currentMarks >= 3
                    ? canScore
                      ? "border-primary/60 bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.4)] animate-pulse-glow"
                      : "border-primary/60 bg-primary/15"
                    : ""
                }`}
              >
                {gameMode === "cricket" && currentMarks > 0 && (
                  <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${
                    currentMarks === 1 
                      ? "bg-yellow-500" 
                      : currentMarks === 2 
                      ? "bg-orange-500" 
                      : "bg-primary"
                  }`} />
                )}
                {num}
              </Button>
            );
          })}
        </div>
      </div>
      </div>

      {/* Victory Dialog */}
      <Dialog open={showVictoryDialog} onOpenChange={setShowVictoryDialog}>
        <DialogContent className="max-w-md glass-card border-primary/30 max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 animate-float">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-2">
                Victoire !
              </h2>
              <p className="text-xl sm:text-2xl font-bold">{winner?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">a remporté la partie</p>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-auto px-1">
            <div className="space-y-4 mt-4 pb-2">
              {/* Statistics */}
              <div className="space-y-3">
              {players.map((player) => (
                <Card 
                  key={player.id}
                  className={`p-4 glass-card ${
                    player.id === winner?.id 
                      ? "border-2 border-primary glow-primary" 
                      : "border-border/50"
                  }`}
                >
                  <div className="font-bold mb-3">{player.name}</div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    {gameMode === "501" && (
                      <>
                        <div>
                          <div className="text-muted-foreground">Score final</div>
                          <div className="font-bold text-lg">{player.score}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Moyenne</div>
                          <div className="font-bold text-lg">
                            {player.turnsPlayed && player.totalThrown
                              ? Math.round(player.totalThrown / player.turnsPlayed)
                              : 0}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Tours joués</div>
                          <div className="font-bold">{player.turnsPlayed || 0}</div>
                        </div>
                      </>
                    )}
                    
                    {gameMode === "cricket" && (
                      <>
                        <div>
                          <div className="text-muted-foreground">Score</div>
                          <div className="font-bold text-lg">{player.score}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Fermés</div>
                          <div className="font-bold text-lg">
                            {player.cricketMarks 
                              ? Object.values(player.cricketMarks).filter(m => m >= 3).length
                              : 0} / {cricketNumbers.length}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Tours joués</div>
                          <div className="font-bold">{player.turnsPlayed || 0}</div>
                        </div>
                      </>
                    )}
                    
                    {gameMode === "sudden-death" && (
                      <>
                        <div>
                          <div className="text-muted-foreground">Score total</div>
                          <div className="font-bold text-lg">{player.score}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Moyenne</div>
                          <div className="font-bold text-lg">
                            {player.turnsPlayed && player.totalThrown
                              ? Math.round(player.totalThrown / player.turnsPlayed)
                              : 0}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-muted-foreground">Tours</div>
                          <div className="font-bold">{player.turnsPlayed || 0}</div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    setShowVictoryDialog(false);
                    setWinner(null);
                  }}
                >
                  Continuer
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Menu
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
