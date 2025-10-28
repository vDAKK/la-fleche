// Game logic utilities for different dart game modes

export interface CricketHits {
  15: number;
  16: number;
  17: number;
  18: number;
  19: number;
  20: number;
  25: number;
  50: number;
}

export interface Player {
  id: string;
  name: string;
}

export interface GamePlayer extends Player {
  score: number;
  history: number[];
  cricketHits?: CricketHits;
  lives?: number;
  bustCount?: number;
}

export interface ThrowData {
  baseScore: number;
  multiplier: number;
  totalScore: number;
}

export interface GameConfig {
  mode: "cricket" | "501" | "sudden-death";
  requireDoubleOut?: boolean; // For 501
  startingLives?: number; // For sudden death
  targetScorePerTurn?: number; // For sudden death
}

// Initialize players based on game mode
export const initializePlayers = (
  playerIds: string[],
  allPlayers: Player[],
  config: GameConfig
): GamePlayer[] => {
  return playerIds
    .map((id) => allPlayers.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined)
    .map((p) => {
      const basePlayer: GamePlayer = {
        ...p,
        score: config.mode === "501" ? 501 : 0,
        history: [],
        bustCount: 0,
      };

      if (config.mode === "cricket") {
        basePlayer.cricketHits = {
          15: 0,
          16: 0,
          17: 0,
          18: 0,
          19: 0,
          20: 0,
          25: 0,
          50: 0,
        };
      }

      if (config.mode === "sudden-death") {
        basePlayer.lives = config.startingLives || 3;
      }

      return basePlayer;
    });
};

// Cricket game logic
export const processCricketTurn = (
  player: GamePlayer,
  allPlayers: GamePlayer[],
  playerIndex: number,
  throws: ThrowData[]
): { player: GamePlayer; hasWon: boolean } => {
  const updatedPlayer = { ...player };

  throws.forEach((throwData) => {
    const number = throwData.baseScore as keyof CricketHits;
    if (updatedPlayer.cricketHits && updatedPlayer.cricketHits[number] !== undefined) {
      const currentHits = updatedPlayer.cricketHits[number];
      const hitsToAdd = throwData.multiplier;

      // Check if all other players have closed this number
      const allOthersClosed = allPlayers
        .filter((_, idx) => idx !== playerIndex)
        .every((p) => p.cricketHits && p.cricketHits[number] >= 3);

      // Calculate how many hits close the number and how many are extra
      const hitsNeededToClose = Math.max(0, 3 - currentHits);
      const extraHits = Math.max(0, hitsToAdd - hitsNeededToClose);

      // Add hits (max 3)
      updatedPlayer.cricketHits[number] = Math.min(currentHits + hitsToAdd, 3);

      // If there are extra hits and not all others have closed, score points
      if (extraHits > 0 && !allOthersClosed) {
        updatedPlayer.score += number * extraHits;
      }
    }
  });

  // Check if player won
  const hasWon = checkCricketWin(updatedPlayer, allPlayers, playerIndex);

  return { player: updatedPlayer, hasWon };
};

const checkCricketWin = (
  player: GamePlayer,
  allPlayers: GamePlayer[],
  playerIndex: number
): boolean => {
  if (!player.cricketHits) return false;

  const allClosed = Object.values(player.cricketHits).every((hits) => hits >= 3);
  if (!allClosed) return false;

  // All numbers closed, check if highest score or all others haven't closed
  return allPlayers.every((p, idx) => {
    if (idx === playerIndex) return true;
    const pAllClosed = p.cricketHits && Object.values(p.cricketHits).every((hits) => hits >= 3);
    return !pAllClosed || player.score >= p.score;
  });
};

// 501 game logic
export const process501Turn = (
  player: GamePlayer,
  throws: ThrowData[],
  requireDoubleOut: boolean = true
): { player: GamePlayer; hasWon: boolean; isBust: boolean } => {
  const updatedPlayer = { ...player };
  const turnTotal = throws.reduce((sum, t) => sum + t.totalScore, 0);
  const lastThrow = throws[throws.length - 1];
  const newScore = updatedPlayer.score - turnTotal;

  // Check for bust conditions
  const isBust =
    newScore < 0 || // Went below 0
    newScore === 1 || // Can't finish on 1 (impossible to double out)
    (requireDoubleOut && newScore === 0 && lastThrow.multiplier !== 2); // Didn't finish with double

  if (isBust) {
    // Bust: score returns to what it was before the turn
    updatedPlayer.bustCount = (updatedPlayer.bustCount || 0) + 1;
    return { player: updatedPlayer, hasWon: false, isBust: true };
  }

  updatedPlayer.score = newScore;
  const hasWon = newScore === 0;

  return { player: updatedPlayer, hasWon, isBust: false };
};

// Sudden Death game logic
export const processSuddenDeathTurn = (
  player: GamePlayer,
  throws: ThrowData[],
  targetScore: number
): { player: GamePlayer; isEliminated: boolean } => {
  const updatedPlayer = { ...player };
  const turnTotal = throws.reduce((sum, t) => sum + t.totalScore, 0);
  
  updatedPlayer.score += turnTotal;

  // If player didn't reach target score, lose a life
  if (turnTotal < targetScore) {
    updatedPlayer.lives = (updatedPlayer.lives || 0) - 1;
  }

  const isEliminated = (updatedPlayer.lives || 0) <= 0;

  return { player: updatedPlayer, isEliminated };
};

// Helper to check if number is closed by all players in Cricket
export const isNumberClosedByAll = (
  players: GamePlayer[],
  number: keyof CricketHits
): boolean => {
  return players.every((p) => p.cricketHits && p.cricketHits[number] >= 3);
};

// Helper to get hit symbol for Cricket display
export const getHitSymbol = (hits: number): string => {
  if (hits === 0) return "";
  if (hits === 1) return "/";
  if (hits === 2) return "X";
  return "✓";
};
