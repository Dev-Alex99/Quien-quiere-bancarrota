import React, { useEffect } from 'react';
import { Flame, Lock } from 'lucide-react';
import { sfx } from '../audio/sfx';

interface DramaProps {
  hostCommentary: string | null;
  currentPrizeFormatted: string;
}

export const DramaPauseView: React.FC<DramaProps> = ({
  hostCommentary,
  currentPrizeFormatted,
}) => {
  useEffect(() => {
    // Intense fast heartbeat during drama pause
    const interval = setInterval(() => {
      sfx.playHeartbeat(true);
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      {/* Studio Suspense Stage */}
      <div className="studio-glass p-8 sm:p-12 rounded-2xl border-2 border-studio-gold shadow-2xl relative overflow-hidden">
        {/* Spotlight sweep */}
        <div className="spotlight-beam absolute inset-0 pointer-events-none" />

        {/* Lock Icon Pulsing */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-studio-gold bg-studio-card flex items-center justify-center shadow-gold-glow animate-heart-pulse">
          <Lock size={28} className="text-studio-goldBright" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest bg-studio-gold text-black px-3 py-1 rounded inline-block mb-3">
          ÚLTIMA PALABRA BLOQUEADA
        </span>

        <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-gold-gradient mb-2">
          El Conductor evalúa sus decisiones...
        </h2>

        <p className="font-mono text-xs text-gray-400 mb-6 uppercase tracking-wider">
          Pozo en disputa: {currentPrizeFormatted}
        </p>

        {/* Host Live Commentary Box */}
        <div className="p-4 bg-studio-bg/80 border border-studio-cardBorder rounded-lg text-sm sm:text-base italic text-amber-100 min-h-[4rem] flex items-center justify-center">
          {hostCommentary ? (
            <span>« {hostCommentary} »</span>
          ) : (
            <span className="text-gray-400 flex items-center gap-2">
              <Flame size={16} className="text-studio-gold animate-spin" />
              Sintonizando las miradas en el estudio...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
