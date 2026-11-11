import { Server } from 'socket.io';
import { config } from '../config.js';
import { 
  OptionLetter, 
  Player, 
  RoomPhase, 
  RoomState, 
  TriviaQuestion, 
  MONEY_LADDER, 
  FinalPodiumData 
} from '../types.js';
import { generateQuestion, generateHostCommentary } from '../ai/minimax.js';

export class GameRoom {
  public code: string;
  public phase: RoomPhase = 'LOBBY';
  public players: Player[] = [];
  public currentQuestionIndex = 0; // 0 to 9
  public totalQuestions = 10;
  public currentQuestion: TriviaQuestion | null = null;
  public timerEndsAt: number | null = null;
  public hostCommentary: string | null = null;
  public finalPodium: FinalPodiumData | null = null;

  private io: Server;
  private timerHandle: NodeJS.Timeout | null = null;
  private nextQuestionPromise: Promise<TriviaQuestion> | null = null;
  private prefetchedLevel: number | null = null;

  constructor(code: string, io: Server) {
    this.code = code;
    this.io = io;
    this.totalQuestions = config.game.totalQuestions;
    // Prefetch question 1 immediately while in lobby
    this.prefetchQuestion(1);
  }

  private prefetchQuestion(level: number): void {
    if (level > this.totalQuestions) return;
    if (this.prefetchedLevel === level && this.nextQuestionPromise) return;

    this.prefetchedLevel = level;
    this.nextQuestionPromise = generateQuestion(level).catch(err => {
      console.warn(`[GameRoom] Error prefetching level ${level}:`, err);
      return null as any;
    });
  }

  public addPlayer(id: string, name: string, avatarIndex: number): Player {
    const existing = this.players.find(p => p.id === id || p.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.id = id;
      existing.name = name;
      existing.avatarIndex = avatarIndex;
      return existing;
    }

    const isHost = this.players.length === 0;
    const player: Player = {
      id,
      name,
      avatarIndex,
      isHost,
      currentLevel: 0,
      currentPrize: 0,
      safePrize: 0,
      hasWalkedAway: false,
      isLockedIn: false,
      currentChoice: null,
      usedLifelines: {
        cunado: false,
        fiftyFifty: false,
        audience: false,
        blindCopy: false,
      },
      removedOptions: [],
      cunadoTip: null,
      audiencePoll: null,
      blindCopyTargetId: null,
    };

    if (this.players.length < config.game.maxPlayers) {
      this.players.push(player);
    }
    return player;
  }

  public removePlayer(socketId: string): void {
    const idx = this.players.findIndex(p => p.id === socketId);
    if (idx !== -1) {
      const wasHost = this.players[idx].isHost;
      this.players.splice(idx, 1);
      if (wasHost && this.players.length > 0) {
        const nextHuman = this.players.find(p => !p.isAI);
        if (nextHuman) nextHuman.isHost = true;
      }
    }
    if (this.players.filter(p => !p.isAI).length === 0) {
      this.clearTimer();
    }
  }

  public async startGame(): Promise<void> {
    if (this.phase !== 'LOBBY' && this.phase !== 'PODIUM') return;

    this.currentQuestionIndex = 0;
    this.finalPodium = null;
    this.hostCommentary = null;

    if (this.prefetchedLevel !== 1 || !this.nextQuestionPromise) {
      this.prefetchQuestion(1);
    }

    // Reset players
    this.players.forEach(p => {
      p.currentLevel = 0;
      p.currentPrize = 0;
      p.safePrize = 0;
      p.hasWalkedAway = false;
      p.isLockedIn = false;
      p.currentChoice = null;
      p.usedLifelines = { cunado: false, fiftyFifty: false, audience: false, blindCopy: false };
      p.removedOptions = [];
      p.cunadoTip = null;
      p.audiencePoll = null;
      p.blindCopyTargetId = null;
      p.lastAnswerCorrect = undefined;
    });

    // 1-Player Solo Mode: if 1 human player, add an AI rival
    const humans = this.players.filter(p => !p.isAI);
    if (humans.length === 1) {
      this.players = this.players.filter(p => !p.isAI);
      this.players.push({
        id: 'ai_rival_tito',
        name: 'Tito el Charlatán (Rival)',
        avatarIndex: 4,
        isHost: false,
        isAI: true,
        currentLevel: 0,
        currentPrize: 0,
        safePrize: 0,
        hasWalkedAway: false,
        isLockedIn: false,
        currentChoice: null,
        usedLifelines: { cunado: false, fiftyFifty: false, audience: false, blindCopy: false },
        removedOptions: [],
        cunadoTip: null,
        audiencePoll: null,
        blindCopyTargetId: null,
      });
    } else {
      this.players = this.players.filter(p => !p.isAI);
    }

    await this.startNextQuestion();
  }

  public async startNextQuestion(): Promise<void> {
    this.currentQuestionIndex += 1;
    this.phase = 'QUESTION_ACTIVE';
    this.hostCommentary = null;

    // Reset round-specific player states
    this.players.forEach(p => {
      p.isLockedIn = false;
      p.currentChoice = null;
      p.removedOptions = [];
      p.cunadoTip = null;
      p.audiencePoll = null;
      p.blindCopyTargetId = null;
      p.lastAnswerCorrect = undefined;
    });

    // Use pre-fetched question if available, otherwise generate
    let question: TriviaQuestion | null = null;
    if (this.nextQuestionPromise && this.prefetchedLevel === this.currentQuestionIndex) {
      question = await this.nextQuestionPromise;
    }
    if (!question) {
      question = await generateQuestion(this.currentQuestionIndex);
    }
    this.currentQuestion = question;

    // Immediately trigger background pre-fetch for the NEXT question while players answer this one!
    this.prefetchQuestion(this.currentQuestionIndex + 1);

    // If there is an AI player and they haven't walked away, simulate their choice
    const aiPlayer = this.players.find(p => p.isAI && !p.hasWalkedAway);
    if (aiPlayer && this.currentQuestion) {
      // 70% chance AI picks correct answer, 30% picks random
      const pickCorrect = Math.random() < 0.7;
      if (pickCorrect) {
        aiPlayer.currentChoice = this.currentQuestion.correctAnswer;
      } else {
        const letters: OptionLetter[] = ['A', 'B', 'C', 'D'];
        aiPlayer.currentChoice = letters[Math.floor(Math.random() * letters.length)];
      }
      aiPlayer.isLockedIn = true;
    }

    this.setPhaseTimer(config.game.questionDurationSec, () => {
      this.triggerDramaPause();
    });

    this.broadcastState();
  }

  public setPlayerChoice(playerId: string, choice: OptionLetter): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.phase !== 'QUESTION_ACTIVE' || player.hasWalkedAway || player.isLockedIn) return;

    player.currentChoice = choice;
    this.broadcastState();
  }

  public lockInChoice(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.phase !== 'QUESTION_ACTIVE' || player.hasWalkedAway || !player.currentChoice) return;

    player.isLockedIn = true;
    this.broadcastState();
    this.checkAllDecided();
  }

  public walkAway(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || this.phase !== 'QUESTION_ACTIVE' || player.hasWalkedAway) return;

    player.hasWalkedAway = true;
    player.isLockedIn = true;
    // Current prize stays at current level's safe/won amount
    this.broadcastState();
    this.checkAllDecided();
  }

  public useCunadoLifeline(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.usedLifelines.cunado || !this.currentQuestion || player.hasWalkedAway) return;

    player.usedLifelines.cunado = true;
    player.cunadoTip = this.currentQuestion.cunadoAdvice || '¡Metele fichas a la que te dicte el corazón!';
    this.broadcastState();
  }

  public useFiftyFiftyLifeline(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.usedLifelines.fiftyFifty || !this.currentQuestion || player.hasWalkedAway) return;

    player.usedLifelines.fiftyFifty = true;
    player.removedOptions = this.currentQuestion.fiftyFiftyOptions || ['A', 'C'];
    this.broadcastState();
  }

  public useAudienceLifeline(playerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.usedLifelines.audience || !this.currentQuestion || player.hasWalkedAway) return;

    player.usedLifelines.audience = true;
    player.audiencePoll = this.currentQuestion.audiencePoll || { A: 50, B: 25, C: 15, D: 10 };
    this.broadcastState();
  }

  public useBlindCopyLifeline(playerId: string, targetPlayerId: string): void {
    const player = this.players.find(p => p.id === playerId);
    const target = this.players.find(p => p.id === targetPlayerId);
    if (!player || !target || player.usedLifelines.blindCopy || player.hasWalkedAway) return;

    player.usedLifelines.blindCopy = true;
    player.blindCopyTargetId = target.id;
    // Copies whatever target picks
    if (target.currentChoice) {
      player.currentChoice = target.currentChoice;
      player.isLockedIn = target.isLockedIn;
    }
    this.broadcastState();
  }

  private checkAllDecided(): void {
    const activeHumans = this.players.filter(p => !p.isAI);
    const allDecided = activeHumans.every(p => p.hasWalkedAway || p.isLockedIn);

    if (allDecided) {
      this.clearTimer();
      this.triggerDramaPause();
    }
  }

  private async triggerDramaPause(): Promise<void> {
    this.clearTimer();
    this.phase = 'DRAMA_PAUSE';
    this.timerEndsAt = null;

    // Apply blind copy for anyone who used it
    this.players.forEach(p => {
      if (p.blindCopyTargetId) {
        const target = this.players.find(t => t.id === p.blindCopyTargetId);
        if (target && target.currentChoice) {
          p.currentChoice = target.currentChoice;
          p.isLockedIn = true;
        }
      }
    });

    this.broadcastState();

    if (this.currentQuestion) {
      const decisions = this.players.map(p => ({
        playerName: p.name,
        choice: p.currentChoice,
        isLockedIn: p.isLockedIn,
        hasWalkedAway: p.hasWalkedAway,
      }));

      // Host generates suspense roast
      generateHostCommentary(this.currentQuestion, decisions).then(commentary => {
        this.hostCommentary = commentary;
        this.broadcastState();
      });
    }

    this.setPhaseTimer(config.game.dramaPauseDurationSec, () => {
      this.revealVerdict();
    });
  }

  private revealVerdict(): void {
    this.clearTimer();
    this.phase = 'VERDICT_REVEAL';

    if (!this.currentQuestion) return;
    const correctLetter = this.currentQuestion.correctAnswer;
    const currentTier = MONEY_LADDER[this.currentQuestionIndex - 1];

    // Evaluate answers
    this.players.forEach(p => {
      if (p.hasWalkedAway) {
        // Safe, did not answer
        p.lastAnswerCorrect = undefined;
        return;
      }

      const isCorrect = p.currentChoice === correctLetter;
      p.lastAnswerCorrect = isCorrect;

      if (isCorrect) {
        p.currentLevel = this.currentQuestionIndex;
        p.currentPrize = currentTier.amount;
        if (currentTier.isSafe) {
          p.safePrize = currentTier.amount;
        }
      } else {
        // Wrong answer: falls to safe prize
        p.currentPrize = p.safePrize;
        p.hasWalkedAway = true; // Cannot continue ladder
      }
    });

    this.broadcastState();

    this.setPhaseTimer(config.game.revealDurationSec, () => {
      const activePlayers = this.players.filter(p => !p.hasWalkedAway && !p.isAI);
      const isLastQuestion = this.currentQuestionIndex >= this.totalQuestions;

      if (isLastQuestion || activePlayers.length === 0) {
        this.finishGame();
      } else {
        this.startNextQuestion();
      }
    });
  }

  private finishGame(): void {
    this.clearTimer();
    this.phase = 'PODIUM';
    this.timerEndsAt = null;

    const sorted = [...this.players].sort((a, b) => b.currentPrize - a.currentPrize);
    const winner = sorted[0];

    this.finalPodium = {
      winnerId: winner?.id || '',
      winnerName: winner?.name || 'El Concursante',
      winnerAmount: winner?.currentPrize || 0,
      rankings: sorted.map(p => ({
        playerId: p.id,
        playerName: p.name,
        finalAmount: p.currentPrize,
        highestLevel: p.currentLevel,
        hasWalkedAway: p.hasWalkedAway,
        isBankrupt: p.currentPrize === 0,
      })),
    };

    this.broadcastState();
  }

  private setPhaseTimer(seconds: number, onComplete: () => void): void {
    this.clearTimer();
    this.timerEndsAt = Date.now() + seconds * 1000;
    this.timerHandle = setTimeout(() => {
      this.timerHandle = null;
      onComplete();
    }, seconds * 1000);
  }

  private clearTimer(): void {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }

  public getState(forPlayerId?: string): RoomState {
    const tier = MONEY_LADDER[Math.max(0, this.currentQuestionIndex - 1)];

    return {
      code: this.code,
      phase: this.phase,
      players: this.players.map(p => {
        const isSelf = !!(forPlayerId && p.id === forPlayerId);
        const reveal = this.phase === 'VERDICT_REVEAL' || this.phase === 'PODIUM';

        let choice: any = null;
        if (reveal || isSelf) {
          choice = p.currentChoice;
        } else if (p.isLockedIn) {
          choice = 'LOCKED';
        }

        return {
          id: p.id,
          name: p.name,
          avatarIndex: p.avatarIndex,
          isHost: p.isHost,
          isAI: p.isAI,
          currentLevel: p.currentLevel,
          currentPrize: p.currentPrize,
          safePrize: p.safePrize,
          hasWalkedAway: p.hasWalkedAway,
          isLockedIn: p.isLockedIn,
          currentChoice: choice,
          usedLifelines: p.usedLifelines,
          removedOptions: isSelf || reveal ? p.removedOptions : [],
          cunadoTip: isSelf ? p.cunadoTip : null,
          audiencePoll: isSelf ? p.audiencePoll : null,
          blindCopyTargetId: isSelf || reveal ? p.blindCopyTargetId : null,
          lastAnswerCorrect: p.lastAnswerCorrect,
        };
      }),
      currentQuestionIndex: this.currentQuestionIndex,
      totalQuestions: this.totalQuestions,
      currentQuestion: this.currentQuestion ? {
        level: this.currentQuestion.level,
        prizeAmount: this.currentQuestion.prizeAmount,
        formattedPrize: tier.formatted,
        category: this.currentQuestion.category,
        question: this.currentQuestion.question,
        options: this.currentQuestion.options,
        correctAnswer: this.phase === 'VERDICT_REVEAL' || this.phase === 'PODIUM' ? this.currentQuestion.correctAnswer : undefined,
        explanation: this.phase === 'VERDICT_REVEAL' || this.phase === 'PODIUM' ? this.currentQuestion.explanation : undefined,
      } : null,
      timerEndsAt: this.timerEndsAt,
      hostCommentary: this.hostCommentary,
      finalPodium: this.finalPodium,
    };
  }

  public broadcastState(): void {
    const sockets = this.io.sockets.adapter.rooms.get(this.code);
    if (sockets && sockets.size > 0) {
      for (const socketId of sockets) {
        this.io.to(socketId).emit('room:state', this.getState(socketId));
      }
    } else {
      this.io.to(this.code).emit('room:state', this.getState());
    }
  }
}
