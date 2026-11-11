import React from 'react';
import { ShieldCheck, Trophy, UserCheck } from 'lucide-react';
import { MONEY_LADDER, Player } from '../types';

interface LadderProps {
  currentQuestionIndex: number;
  players: Player[];
  currentPlayerId: string;
}

export const MoneyLadder: React.FC<LadderProps> = ({
  currentQuestionIndex,
  players,
  currentPlayerId,
}) => {
  // Ladder reversed so Level 10 ($1,000,000) is at the top
  const reversedLadder = [...MONEY_LADDER].reverse();

  return (
    <div className="studio-glass p-3 rounded-lg border-2 border-studio-cardBorder shadow-lg text-xs">
      <div className="flex items-center justify-between border-b border-studio-cardBorder pb-2 mb-2">
        <span className="font-display font-bold uppercase tracking-wider text-studio-gold text-[11px] flex items-center gap-1">
          <Trophy size={14} /> Escalera de Premios
        </span>
        <span className="text-[10px] text-gray-400 uppercase font-semibold">10 Niveles</span>
      </div>

      <div className="space-y-1">
        {reversedLadder.map((tier) => {
          const isCurrentTarget = currentQuestionIndex === tier.level;
          const isPassed = currentQuestionIndex > tier.level;
          const isSafe = tier.isSafe;

          // Find players sitting on this level
          const playersHere = players.filter(p => p.currentLevel === tier.level);

          return (
            <div
              key={tier.level}
              className={`flex items-center justify-between px-2.5 py-1 rounded transition-all ${
                isCurrentTarget
                  ? 'bg-amber-500/25 border border-studio-gold text-studio-goldBright font-bold shadow-gold-glow -translate-x-1'
                  : isPassed
                  ? 'bg-studio-card/40 text-gray-400'
                  : isSafe
                  ? 'bg-emerald-950/30 text-emerald-400 font-bold border-l-2 border-emerald-500'
                  : 'text-gray-300 hover:bg-studio-card/60'
              }`}
            >
              {/* Level Number & Safe Icon */}
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-5 text-gray-400">{tier.level}.</span>
                {isSafe && (
                  <span title="Piso Seguro Garantizado">
                    <ShieldCheck size={13} className="text-emerald-400" />
                  </span>
                )}
              </div>

              {/* Amount */}
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs tracking-wider ${
                  isSafe ? 'text-emerald-300 font-bold' : isCurrentTarget ? 'text-studio-goldBright' : 'text-gray-200'
                }`}>
                  {tier.formatted}
                </span>

                {/* Player Pins */}
                {playersHere.length > 0 && (
                  <div className="flex -space-x-1">
                    {playersHere.map(p => (
                      <span
                        key={p.id}
                        title={`${p.name} (${p.hasWalkedAway ? 'Plantado' : 'En carrera'})`}
                        className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold border border-black ${
                          p.id === currentPlayerId ? 'bg-studio-gold text-black' : 'bg-studio-cyanGlow text-white'
                        }`}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Net Legend */}
      <div className="mt-3 pt-2 border-t border-studio-cardBorder/60 flex items-center justify-between text-[10px] text-gray-400">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <ShieldCheck size={12} /> Pisos: $25k / $500k
        </span>
        <span className="flex items-center gap-1 text-studio-gold font-semibold">
          <Trophy size={12} /> Bote: $1.000.000
        </span>
      </div>
    </div>
  );
};
