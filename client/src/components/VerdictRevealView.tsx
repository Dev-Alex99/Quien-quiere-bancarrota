import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, Trophy } from 'lucide-react';
import { OptionLetter, Player } from '../types';
import { getEstimatedServerTime } from '../socket';
import { sfx } from '../audio/sfx';

interface VerdictProps {
  currentQuestion: {
    level: number;
    prizeAmount: number;
    formattedPrize: string;
    question: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer?: OptionLetter;
    explanation?: string;
  };
  timerEndsAt: number | null;
  players: Player[];
  currentPlayerId: string;
}

export const VerdictRevealView: React.FC<VerdictProps> = ({
  currentQuestion,
  timerEndsAt,
  players,
  currentPlayerId,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const correctLetter = currentQuestion.correctAnswer || 'A';
  const currentUser = players.find(p => p.id === currentPlayerId);
  const isUserCorrect = currentUser?.lastAnswerCorrect;

  useEffect(() => {
    sfx.stopTensionDrone();
    if (isUserCorrect) {
      sfx.playCorrectFanfare();
    } else if (isUserCorrect === false) {
      sfx.playBuzzer();
    }
  }, [isUserCorrect]);

  useEffect(() => {
    if (!timerEndsAt) return;
    const interval = setInterval(() => {
      const now = getEstimatedServerTime();
      const remaining = Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
      setSecondsLeft(remaining);
    }, 200);

    return () => clearInterval(interval);
  }, [timerEndsAt]);

  const letters: OptionLetter[] = ['A', 'B', 'C', 'D'];

  return (
    <div className={`max-w-4xl mx-auto px-4 py-4 ${isUserCorrect === false ? 'shake-it' : ''}`}>
      {/* Studio Header Card */}
      <div className="studio-glass p-6 sm:p-8 rounded-xl border-2 border-studio-gold shadow-2xl relative">
        <div className="flex flex-wrap items-center justify-between border-b border-studio-cardBorder pb-3 mb-4 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-studio-gold">
              VEREDICTO OFICIAL DEL NIVEL {currentQuestion.level}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-black text-white">
              Respuesta Correcta Desvelada
            </h2>
          </div>

          <div className="flex items-center gap-1.5 border border-studio-cardBorder bg-studio-card px-3 py-1 rounded font-mono text-xs text-gray-300">
            <Clock size={14} className="text-studio-gold" />
            <span>Próximo Nivel en:</span>
            <span className="font-bold text-studio-goldBright">{secondsLeft}s</span>
          </div>
        </div>

        {/* Question reminder */}
        <p className="text-xs sm:text-sm text-gray-300 mb-4 font-game italic">
          "{currentQuestion.question}"
        </p>

        {/* The 4 Options with Revealed Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {letters.map((letter) => {
            const isCorrect = letter === correctLetter;
            const isPickedByMe = currentUser?.currentChoice === letter;
            const text = currentQuestion.options[letter];

            return (
              <div
                key={letter}
                className={`millionaire-btn py-3 px-5 border-2 text-left rounded transition-all ${
                  isCorrect
                    ? 'border-emerald-300 bg-emerald-600 text-white font-extrabold shadow-blue-glow scale-[1.01] ring-2 ring-emerald-400'
                    : isPickedByMe
                    ? 'border-rose-500 bg-rose-950/90 text-rose-200 font-bold ring-2 ring-rose-500'
                    : 'border-studio-cardBorder/60 bg-studio-card/40 text-gray-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-sm font-black ${isCorrect ? 'text-white' : isPickedByMe ? 'text-rose-400' : 'text-gray-500'}`}>
                    [{letter}]
                  </span>
                  <span className="font-game text-sm leading-tight flex-1">
                    {text}
                  </span>
                  {isCorrect && (
                    <span className="flex items-center gap-1 text-[11px] font-mono uppercase bg-emerald-700 px-2 py-0.5 rounded font-black">
                      <CheckCircle2 size={15} /> ¡CORRECTA!
                    </span>
                  )}
                  {!isCorrect && isPickedByMe && (
                    <span className="flex items-center gap-1 text-[11px] font-mono uppercase bg-rose-900 text-rose-200 px-2 py-0.5 rounded font-bold">
                      <XCircle size={15} className="text-rose-400" /> TU ELECCIÓN
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Real Explanation Box */}
        {currentQuestion.explanation && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 mb-6">
            <strong className="block font-bold text-emerald-400 uppercase text-[10px] mb-1">
              La Verdad Histórica / Científica:
            </strong>
            <p className="font-game leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Contestants Status Grid */}
        <div className="border-t border-studio-cardBorder pt-4">
          <h3 className="font-display text-xs uppercase font-bold text-studio-gold mb-3">
            Situación Financiera de los Concursantes:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((p) => {
              const won = p.lastAnswerCorrect;
              const walked = p.hasWalkedAway && p.lastAnswerCorrect === undefined;
              const isCurrent = p.id === currentPlayerId;

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    isCurrent ? 'bg-studio-card border-studio-gold shadow-gold-glow' : 'bg-studio-card/50 border-studio-cardBorder'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {walked ? (
                      <ShieldCheck size={18} className="text-studio-gold" />
                    ) : won ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <XCircle size={18} className="text-rose-500" />
                    )}
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isCurrent && <span className="text-[9px] bg-studio-gold text-black px-1 rounded font-bold">Tú</span>}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {walked ? 'Se plantó con el dinero' : won ? 'Acierto impecable' : '¡Bancarrota! Cae al piso seguro'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold">
                    <div className="text-sm text-studio-goldBright">
                      ${p.currentPrize.toLocaleString()}
                    </div>
                    {p.safePrize > 0 && (
                      <div className="text-[9px] text-emerald-400">
                        Seguro: ${p.safePrize.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
