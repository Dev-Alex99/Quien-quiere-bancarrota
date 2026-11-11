import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Award, Skull } from 'lucide-react';
import { FinalPodiumData, Player } from '../types';
import { sfx } from '../audio/sfx';

interface PodiumProps {
  podium: FinalPodiumData;
  players: Player[];
  isHost: boolean;
  onPlayAgain: () => void;
}

export const PodiumView: React.FC<PodiumProps> = ({
  podium,
  players,
  isHost,
  onPlayAgain,
}) => {
  useEffect(() => {
    sfx.playCorrectFanfare();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#e5b842', '#38bdf8', '#10b981', '#ffffff'],
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      {/* Studio Glass Card */}
      <div className="studio-glass p-6 sm:p-10 rounded-2xl border-2 border-studio-gold shadow-2xl relative">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-studio-gold bg-studio-card flex items-center justify-center shadow-gold-glow animate-bounce">
          <Trophy size={40} className="text-studio-goldBright" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest bg-studio-gold text-black px-3 py-1 rounded inline-block mb-2">
          FIN DEL PROGRAMA
        </span>

        <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-gold-gradient mb-1">
          Gran Campeón del Concurso
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          El estudio cierra sus puertas y liquida las cuentas bancarias de los concursantes.
        </p>

        {/* Winner Highlight Box */}
        <div className="my-6 p-6 bg-amber-950/30 border-2 border-studio-gold rounded-xl shadow-gold-glow">
          <div className="text-xs uppercase font-bold text-gray-400 mb-1">
            Premio Acumulado Final:
          </div>
          <div className="text-3xl sm:text-5xl font-mono font-black text-studio-goldBright tracking-wide mb-2">
            ${podium.winnerAmount.toLocaleString()}
          </div>
          <div className="font-display text-xl sm:text-2xl font-bold text-white uppercase flex items-center justify-center gap-2">
            <Award size={20} className="text-studio-gold" />
            {podium.winnerName}
          </div>
        </div>

        {/* Final Standings Table */}
        <div className="my-6 text-left">
          <h3 className="font-display text-xs uppercase font-bold text-gray-300 mb-3">
            Cuadro Oficial de Liquidación:
          </h3>

          <div className="border border-studio-cardBorder rounded-lg overflow-hidden bg-studio-bg/60">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-studio-cardBorder bg-studio-card/80 text-gray-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3 text-center w-12">Pos.</th>
                  <th className="py-2.5 px-3 text-left">Concursante</th>
                  <th className="py-2.5 px-3 text-center">Nivel</th>
                  <th className="py-2.5 px-3 text-right">Premio Obtenido</th>
                </tr>
              </thead>
              <tbody>
                {podium.rankings.map((r, i) => (
                  <tr
                    key={r.playerId}
                    className={`border-b border-studio-cardBorder/40 ${
                      i === 0 ? 'bg-amber-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-sm text-studio-gold">
                      #{i + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{r.playerName}</span>
                        {r.isBankrupt && (
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-0.5">
                            <Skull size={10} /> Bancarrota
                          </span>
                        )}
                        {r.hasWalkedAway && !r.isBankrupt && (
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Plantado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-gray-300">
                      Nivel {r.highestLevel} / 10
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-sm text-studio-goldBright">
                      ${r.finalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restart Action */}
        {isHost ? (
          <button
            onClick={() => {
              sfx.playSpotlight();
              onPlayAgain();
            }}
            className="px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider rounded bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:brightness-110 active:scale-98 transition-all inline-flex items-center gap-2 shadow-gold-glow"
          >
            <RotateCcw size={16} />
            Iniciar Nueva Partida
          </button>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Esperando a que el líder inicie una nueva edición...
          </p>
        )}
      </div>
    </div>
  );
};
