export type RoomPhase = 
  | 'LOBBY' 
  | 'QUESTION_ACTIVE' 
  | 'DRAMA_PAUSE' 
  | 'VERDICT_REVEAL' 
  | 'PODIUM';

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface LadderTier {
  level: number;
  amount: number;
  formatted: string;
  isSafe: boolean;
}

export const MONEY_LADDER: LadderTier[] = [
  { level: 1, amount: 1000, formatted: '$1.000', isSafe: false },
  { level: 2, amount: 5000, formatted: '$5.000', isSafe: false },
  { level: 3, amount: 10000, formatted: '$10.000', isSafe: false },
  { level: 4, amount: 25000, formatted: '$25.000', isSafe: true }, // Safe Tier 1
  { level: 5, amount: 50000, formatted: '$50.000', isSafe: false },
  { level: 6, amount: 100000, formatted: '$100.000', isSafe: false },
  { level: 7, amount: 250000, formatted: '$250.000', isSafe: false },
  { level: 8, amount: 500000, formatted: '$500.000', isSafe: true }, // Safe Tier 2
  { level: 9, amount: 750000, formatted: '$750.000', isSafe: false },
  { level: 10, amount: 1000000, formatted: '$1.000.000', isSafe: true }, // Jackpot
];

export interface TriviaQuestion {
  id: string;
  level: number;
  prizeAmount: number;
  category: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: OptionLetter;
  explanation: string;
  cunadoAdvice?: string;
  audiencePoll?: Record<OptionLetter, number>;
  fiftyFiftyOptions?: OptionLetter[]; // 2 wrong options to hide
}

export interface PlayerLifelines {
  cunado: boolean;
  fiftyFifty: boolean;
  audience: boolean;
  blindCopy: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatarIndex: number;
  isHost: boolean;
  isAI?: boolean;
  currentLevel: number; // 0 means haven't passed level 1 yet
  currentPrize: number;
  safePrize: number;
  hasWalkedAway: boolean; // Plantado con el dinero
  isLockedIn: boolean; // Última palabra
  currentChoice: OptionLetter | null;
  usedLifelines: PlayerLifelines;
  removedOptions: OptionLetter[]; // From 50:50
  cunadoTip: string | null;
  audiencePoll: Record<OptionLetter, number> | null;
  blindCopyTargetId: string | null;
  lastAnswerCorrect?: boolean;
}

export interface FinalPodiumData {
  winnerId: string;
  winnerName: string;
  winnerAmount: number;
  rankings: {
    playerId: string;
    playerName: string;
    finalAmount: number;
    highestLevel: number;
    hasWalkedAway: boolean;
    isBankrupt: boolean;
  }[];
}

export interface RoomState {
  code: string;
  phase: RoomPhase;
  players: Player[];
  currentQuestionIndex: number; // 0 to 9
  totalQuestions: number;
  currentQuestion: {
    level: number;
    prizeAmount: number;
    formattedPrize: string;
    category: string;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer?: OptionLetter; // Only sent in VERDICT_REVEAL phase
    explanation?: string;        // Only sent in VERDICT_REVEAL phase
  } | null;
  timerEndsAt: number | null;
  hostCommentary: string | null;
  finalPodium: FinalPodiumData | null;
}
