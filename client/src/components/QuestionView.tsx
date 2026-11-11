import React, { useState, useEffect, useRef } from 'react';
import { Clock, PhoneCall, Scissors, BarChart3, Users, Lock, LogOut, CheckCircle2 } from 'lucide-react';
import { OptionLetter, Player } from '../types';
import { getEstimatedServerTime } from '../socket';
import { sfx } from '../audio/sfx';

interface QuestionProps {
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
  };
  timerEndsAt: number | null;
  currentUser: Player | undefined;
  allPlayers: Player[];
  onSelectOption: (choice: OptionLetter) => void;
  onLockIn: () => void;
  onWalkAway: () => void;
  onUseCunado: () => void;
  onUseFiftyFifty: () => void;
  onUseAudience: () => void;
  onUseBlindCopy: (targetId: string) => void;
}

export const QuestionView: React.FC<QuestionProps> = ({
  currentQuestion,
  timerEndsAt,
  currentUser,
  allPlayers,
  onSelectOption,
  onLockIn,
  onWalkAway,
  onUseCunado,
  onUseFiftyFifty,
  onUseAudience,
  onUseBlindCopy,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(24);
  const [showBlindCopyModal, setShowBlindCopyModal] = useState(false);
  const prevSecRef = useRef<number>(secondsLeft);

  // Local optimistic state for 0ms instantaneous feedback
  const [localChoice, setLocalChoice] = useState<OptionLetter | null>(null);

  const isLocked = currentUser?.isLockedIn ?? false;
  const hasWalkedAway = currentUser?.hasWalkedAway ?? false;
  const removedOptions = currentUser?.removedOptions || [];
  const usedLifelines = currentUser?.usedLifelines;

  // Sync local choice with server if valid choice arrived
  useEffect(() => {
    if (currentUser?.currentChoice && currentUser.currentChoice !== 'LOCKED') {
      setLocalChoice(currentUser.currentChoice as OptionLetter);
    }
  }, [currentUser?.currentChoice]);

  // Reset local choice on question level change
  useEffect(() => {
    setLocalChoice(null);
  }, [currentQuestion.level]);

  // Effective selected choice
  const activeChoice: OptionLetter | null =
    localChoice || (currentUser?.currentChoice && currentUser.currentChoice !== 'LOCKED' ? (currentUser.currentChoice as OptionLetter) : null);

  // Latency-tolerant timer and heartbeat sound
  useEffect(() => {
    sfx.startTensionDrone();
    if (!timerEndsAt) return;

    const interval = setInterval(() => {
      const now = getEstimatedServerTime();
      const remaining = Math.max(0, Math.ceil((timerEndsAt - now) / 1000));
      setSecondsLeft(remaining);

      // Heartbeat pulse every second, accelerates under 10s
      if (remaining !== prevSecRef.current && remaining > 0) {
        prevSecRef.current = remaining;
        sfx.playHeartbeat(remaining <= 8);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [timerEndsAt]);

  const handleOptionClick = (letter: OptionLetter) => {
    if (isLocked || hasWalkedAway || removedOptions.includes(letter)) return;
    setLocalChoice(letter); // Instant visual feedback!
    sfx.playOptionClick();
    onSelectOption(letter);
  };

  const handleLockIn = () => {
    if (!activeChoice || isLocked || hasWalkedAway) return;
    sfx.playSpotlight();
    onLockIn();
  };

  const handleWalkAwayClick = () => {
    if (isLocked || hasWalkedAway) return;
    sfx.playOptionClick();
    onWalkAway();
  };

  // Keyboard accessibility: 1-4 or A-D to select, Enter to lock in
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || hasWalkedAway) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      let pickedLetter: OptionLetter | null = null;
      if (['A', 'B', 'C', 'D'].includes(key)) {
        pickedLetter = key as OptionLetter;
      } else if (key === '1') pickedLetter = 'A';
      else if (key === '2') pickedLetter = 'B';
      else if (key === '3') pickedLetter = 'C';
      else if (key === '4') pickedLetter = 'D';

      if (pickedLetter && !removedOptions.includes(pickedLetter)) {
        handleOptionClick(pickedLetter);
      } else if ((e.key === 'Enter' || e.key === ' ') && activeChoice && !isLocked) {
        e.preventDefault();
        handleLockIn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, hasWalkedAway, removedOptions, activeChoice]);

  const letters: OptionLetter[] = ['A', 'B', 'C', 'D'];
  const otherHumans = allPlayers.filter(p => p.id !== currentUser?.id && !p.isAI);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Question Info Bar */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-studio-cardBorder pb-3 mb-4 gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-studio-gold">
            Nivel {currentQuestion.level} de 10 • {currentQuestion.category}
          </span>
          <div className="font-display text-xl sm:text-2xl font-black text-gold-gradient tracking-wide">
            Pozo en Juego: {currentQuestion.formattedPrize}
          </div>
        </div>

        {/* Suspense Timer */}
        <div className="flex items-center gap-2 border border-studio-gold/60 bg-studio-card/90 px-3.5 py-1.5 rounded-lg shadow-gold-glow">
          <Clock size={18} className={secondsLeft <= 8 ? 'text-studio-dangerRed animate-bounce' : 'text-studio-gold'} />
          <span className="text-xs uppercase font-bold text-gray-300">Tiempo:</span>
          <span className={`font-mono text-2xl font-black tracking-wider ${
            secondsLeft <= 8 ? 'text-studio-dangerRed' : 'text-studio-goldBright'
          }`}>
            {secondsLeft}s
          </span>
        </div>
      </div>

      {/* Main Question Display Box */}
      <div className="studio-glass p-5 sm:p-8 rounded-xl border-2 border-studio-gold mb-6 shadow-2xl relative text-center">
        <div className="absolute top-2 left-4 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
          PREGUNTA OFICIAL
        </div>
        <p className="font-game text-base sm:text-xl font-bold text-white leading-relaxed mt-2">
          "{currentQuestion.question}"
        </p>
      </div>

      {/* Active Lifeline Info Panels */}
      {/* 1. Cuñado Advice Speech Bubble */}
      {currentUser?.cunadoTip && (
        <div className="mb-4 p-3 bg-amber-950/40 border-2 border-studio-gold rounded-lg text-xs text-amber-200 flex items-start gap-2.5 animate-folder-open">
          <span className="text-2xl shrink-0">🕵️</span>
          <div>
            <strong className="font-bold text-studio-goldBright block uppercase text-[11px]">
              Consejo de tu Cuñado Conspiranoico:
            </strong>
            <p className="italic font-game mt-0.5">"{currentUser.cunadoTip}"</p>
          </div>
        </div>
      )}

      {/* 2. Audience Poll Bar Chart */}
      {currentUser?.audiencePoll && (
        <div className="mb-4 p-3.5 bg-studio-card border border-studio-cardBorder rounded-lg text-xs animate-folder-open">
          <span className="block font-bold text-studio-gold uppercase text-[10px] mb-2 flex items-center gap-1">
            <BarChart3 size={14} /> Encuesta a la Tribuna del Estudio (100 Votos):
          </span>
          <div className="grid grid-cols-4 gap-2 text-center font-mono font-bold">
            {letters.map(letter => {
              const pct = currentUser.audiencePoll?.[letter] || 0;
              return (
                <div key={letter} className="bg-studio-bg/60 p-2 rounded border border-studio-cardBorder">
                  <div className="text-gray-400 text-xs">[{letter}]</div>
                  <div className="text-studio-goldBright text-sm mt-0.5">{pct}%</div>
                  <div className="w-full bg-studio-cardBorder h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-studio-gold h-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Blind Copy Target Info */}
      {currentUser?.blindCopyTargetId && (
        <div className="mb-4 p-2.5 bg-blue-950/50 border border-blue-400 rounded-lg text-xs text-blue-200 flex items-center gap-2">
          <Users size={16} className="text-blue-400" />
          <span>
            Has activado la <strong>Copia Ciega</strong>: tu respuesta se acoplará a la decisión de tu compañero de set.
          </span>
        </div>
      )}

      {/* The 4 Options (A, B, C, D) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
        {letters.map((letter) => {
          const optionText = currentQuestion.options[letter];
          const isSelected = activeChoice === letter;
          const isRemoved = removedOptions.includes(letter);

          return (
            <button
              key={letter}
              type="button"
              disabled={isLocked || hasWalkedAway || isRemoved}
              onClick={() => handleOptionClick(letter)}
              className={`millionaire-btn py-3.5 px-5 border-2 text-left transition-all relative ${
                isRemoved
                  ? 'opacity-20 border-gray-700 bg-gray-900 cursor-not-allowed line-through'
                  : isLocked && isSelected
                  ? 'border-emerald-400 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-extrabold shadow-gold-glow ring-2 ring-emerald-400'
                  : isSelected
                  ? 'border-studio-gold bg-amber-950/80 text-studio-goldBright font-bold ring-2 ring-studio-gold shadow-gold-glow scale-[1.01]'
                  : 'border-studio-cardBorder bg-studio-card hover:border-studio-gold hover:bg-studio-card/90 text-gray-200 hover:text-white cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-mono text-sm font-black w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors ${
                  isSelected && isLocked
                    ? 'bg-emerald-400 text-black'
                    : isSelected
                    ? 'bg-studio-gold text-black font-black'
                    : 'bg-studio-cardBorder/60 text-studio-gold'
                }`}>
                  {letter}
                </span>
                <span className="font-game text-sm sm:text-base leading-snug flex-1">
                  {optionText}
                </span>
                {isSelected && isLocked && (
                  <span className="text-[10px] font-mono uppercase bg-black/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/50 flex items-center gap-1 shrink-0">
                    <Lock size={10} /> BLOQUEADA
                  </span>
                )}
                {isSelected && !isLocked && (
                  <span className="text-[10px] font-mono uppercase bg-studio-gold/20 text-studio-goldBright px-1.5 py-0.5 rounded border border-studio-gold/40 shrink-0">
                    ELEGIDA
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Decision Buttons (Lock In or Walk Away) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 studio-glass rounded-lg border border-studio-cardBorder mb-6">
        <div className="text-xs text-gray-300">
          {hasWalkedAway ? (
            <span className="text-emerald-400 font-bold">¡Te has plantado con ${currentUser?.currentPrize.toLocaleString()}! Observas desde la grada.</span>
          ) : isLocked ? (
            <span className="text-studio-gold font-bold flex items-center gap-1.5">
              <CheckCircle2 size={16} /> ¡Última palabra bloqueada! Esperando al veredicto...
            </span>
          ) : activeChoice ? (
            <span className="text-studio-goldBright font-semibold">Opción [{activeChoice}] marcada. Pulsa "Confirmar" o Enter para fijarla.</span>
          ) : (
            <span>Haz clic en [A], [B], [C] o [D] (o usa teclas 1-4) para marcar tu respuesta.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Walk Away Button */}
          {!hasWalkedAway && !isLocked && currentQuestion.level > 1 && (
            <button
              type="button"
              onClick={handleWalkAwayClick}
              className="px-4 py-2 text-xs font-bold uppercase rounded border border-rose-500/70 text-rose-300 hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              Plantarse con ${currentUser?.currentPrize.toLocaleString()}
            </button>
          )}

          {/* Lock In Button */}
          {!hasWalkedAway && !isLocked && (
            <button
              type="button"
              disabled={!activeChoice}
              onClick={handleLockIn}
              className={`px-6 py-2.5 text-xs font-display font-bold uppercase rounded flex items-center gap-1.5 transition-all shadow-gold-glow ${
                activeChoice
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:brightness-110 active:scale-95 cursor-pointer font-black ring-2 ring-amber-400'
                  : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <Lock size={14} />
              {activeChoice ? `¡Última Palabra [${activeChoice}]!` : 'Elige una opción'}
            </button>
          )}
        </div>
      </div>

      {/* Lifelines Bar */}
      {!hasWalkedAway && (
        <div className="pt-3 border-t border-studio-cardBorder">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Comodines Disponibles (1 uso por partida):
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* 1. Cuñado */}
            <button
              type="button"
              disabled={usedLifelines?.cunado || isLocked}
              onClick={() => {
                sfx.playLifeline();
                onUseCunado();
              }}
              className={`p-2 rounded border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                usedLifelines?.cunado
                  ? 'border-gray-800 bg-gray-900/60 text-gray-600 cursor-not-allowed line-through'
                  : 'border-studio-cardBorder bg-studio-card hover:border-studio-gold text-amber-200 cursor-pointer'
              }`}
            >
              <PhoneCall size={14} />
              <span>El Cuñado Fanfarrón</span>
            </button>

            {/* 2. 50:50 */}
            <button
              type="button"
              disabled={usedLifelines?.fiftyFifty || isLocked}
              onClick={() => {
                sfx.playLifeline();
                onUseFiftyFifty();
              }}
              className={`p-2 rounded border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                usedLifelines?.fiftyFifty
                  ? 'border-gray-800 bg-gray-900/60 text-gray-600 cursor-not-allowed line-through'
                  : 'border-studio-cardBorder bg-studio-card hover:border-studio-gold text-amber-200 cursor-pointer'
              }`}
            >
              <Scissors size={14} />
              <span>50:50 Eliminador</span>
            </button>

            {/* 3. Audience Poll */}
            <button
              type="button"
              disabled={usedLifelines?.audience || isLocked}
              onClick={() => {
                sfx.playLifeline();
                onUseAudience();
              }}
              className={`p-2 rounded border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                usedLifelines?.audience
                  ? 'border-gray-800 bg-gray-900/60 text-gray-600 cursor-not-allowed line-through'
                  : 'border-studio-cardBorder bg-studio-card hover:border-studio-gold text-amber-200 cursor-pointer'
              }`}
            >
              <BarChart3 size={14} />
              <span>La Tribuna</span>
            </button>

            {/* 4. Blind Copy (Multiplayer) */}
            <button
              type="button"
              disabled={usedLifelines?.blindCopy || isLocked || otherHumans.length === 0}
              onClick={() => {
                sfx.playLifeline();
                if (otherHumans.length === 1) {
                  onUseBlindCopy(otherHumans[0].id);
                } else {
                  setShowBlindCopyModal(true);
                }
              }}
              className={`p-2 rounded border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                usedLifelines?.blindCopy || otherHumans.length === 0
                  ? 'border-gray-800 bg-gray-900/60 text-gray-600 cursor-not-allowed line-through'
                  : 'border-studio-cardBorder bg-studio-card hover:border-blue-400 text-blue-200 cursor-pointer'
              }`}
            >
              <Users size={14} />
              <span>Copia Ciega</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal for Blind Copy Target Selection (when >1 friend) */}
      {showBlindCopyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="studio-glass p-5 rounded-xl border-2 border-studio-gold max-w-sm w-full text-center">
            <h3 className="font-display text-sm font-bold uppercase text-studio-gold mb-2">
              Selecciona a quién copiarte a ciegas:
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Si tu compañero acierta, subes con él. Si falla, caes al piso seguro.
            </p>
            <div className="space-y-2 mb-4">
              {otherHumans.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onUseBlindCopy(p.id);
                    setShowBlindCopyModal(false);
                  }}
                  className="w-full py-2 px-3 border border-studio-cardBorder bg-studio-card hover:border-studio-gold text-left rounded text-xs font-bold text-white flex items-center justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] text-studio-gold">${p.currentPrize.toLocaleString()}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBlindCopyModal(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
