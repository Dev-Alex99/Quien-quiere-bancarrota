import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Flame, HelpCircle } from 'lucide-react';
import { sfx } from '../audio/sfx';
import { RoomState } from '../types';

interface HeaderProps {
  roomState: RoomState | null;
  onLeaveRoom?: () => void;
  onOpenTutorial?: () => void;
}

export const StudioHeader: React.FC<HeaderProps> = ({ roomState, onLeaveRoom, onOpenTutorial }) => {
  const [muted, setMuted] = useState(sfx.isMuted);
  const [copied, setCopied] = useState(false);

  const toggleAudio = () => {
    const isNowMuted = sfx.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sfx.playOptionClick();
    }
  };

  const copyRoomLink = () => {
    if (!roomState?.code) return;
    const url = `${window.location.origin}?room=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sfx.playOptionClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b-2 border-studio-cardBorder bg-studio-bg/90 backdrop-blur-md py-2.5 px-4 sm:px-8 z-30 sticky top-0 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo / Studio Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-studio-gold bg-studio-card flex items-center justify-center shadow-gold-glow">
            <Flame size={22} className="text-studio-goldBright animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-sm sm:text-base tracking-wider uppercase text-gold-gradient leading-none">
              ¿Quién Quiere Quedar en Bancarrota?
            </h1>
            <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5 font-semibold">
              Edición Alta Tensión • Concurso Oficial en Vivo
            </p>
          </div>
        </div>

        {/* Room Code & Audio Controls */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {roomState?.code && (
            <div className="flex items-center gap-1.5 border border-studio-gold/60 bg-studio-card/80 px-2.5 py-1 rounded shadow-gold-glow">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estudio:</span>
              <span className="font-mono text-base font-bold text-studio-goldBright tracking-widest">
                {roomState.code}
              </span>
              <button
                onClick={copyRoomLink}
                title="Copiar enlace de invitación"
                className="p-1 hover:text-studio-goldBright transition-colors ml-1"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Rules / Tutorial Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="p-1.5 border border-studio-cardBorder bg-studio-card hover:border-studio-gold transition-colors text-xs flex items-center gap-1 rounded text-gray-200"
              title="Ver Reglamento del Concurso"
            >
              <HelpCircle size={15} className="text-studio-gold" />
              <span className="hidden sm:inline text-[11px] font-bold uppercase">Reglamento</span>
            </button>
          )}

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleAudio}
            className="p-2 border border-studio-cardBorder bg-studio-card hover:border-studio-gold transition-colors rounded text-gray-300"
            title={muted ? 'Activar Efectos de Sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Leave Room Button */}
          {roomState && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-studio-dangerRed/60 text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
