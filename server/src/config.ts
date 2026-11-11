import dotenv from 'dotenv';
import path from 'path';

// Search in root folder and server folder with override
dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
dotenv.config();

const rawKey = (process.env.MINIMAX_API_KEY || '').trim();

export const config = {
  port: parseInt(process.env.PORT || '3002', 10),
  minimax: {
    apiKey: rawKey,
    baseUrl: process.env.MINIMAX_BASE_URL || 'https://api.minimax.io/v1',
    model: process.env.MINIMAX_MODEL || 'MiniMax-M3.1-Flash',
  },
  game: {
    questionDurationSec: parseInt(process.env.QUESTION_TIME_SECONDS || '24', 10),
    dramaPauseDurationSec: parseInt(process.env.DRAMA_PAUSE_SECONDS || '6', 10),
    revealDurationSec: parseInt(process.env.REVEAL_TIME_SECONDS || '10', 10),
    totalQuestions: parseInt(process.env.TOTAL_QUESTIONS || '10', 10),
    maxPlayers: 4,
  }
};
