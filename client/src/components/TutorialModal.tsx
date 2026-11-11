import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, ShieldCheck, Trophy, PhoneCall, LogOut } from 'lucide-react';
import { sfx } from '../audio/sfx';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: '1. La Escalera de los 10 Niveles',
    icon: <Trophy size={28} className="text-studio-gold" />,
    badge: 'MECÁNICA PRINCIPAL',
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-gray-200 leading-relaxed font-game">
        <p>
          En cada partida te enfrentarás a una escalera de <strong>10 preguntas de opción múltiple (A, B, C, D)</strong> diseñadas y presentadas en vivo por la <strong>Inteligencia Central del Concurso</strong>.
        </p>
        <div className="p-3 bg-studio-card border border-studio-cardBorder rounded text-studio-goldBright font-mono text-xs">
          Comienzas en $1.000 y subes peldaño a peldaño hasta el Gran Bote de $1.000.000.
        </div>
        <p className="text-gray-400">
          Cero escritura: solo tocas tu opción en pantalla y confirmas con <strong>"Última Palabra"</strong> antes de que expire el cronómetro.
        </p>
      </div>
    ),
  },
  {
    step: 2,
    title: '2. Pisos Seguros y la Opción de Plantarse',
    icon: <ShieldCheck size={28} className="text-emerald-400" />,
    badge: 'GESTIÓN DE RIESGO',
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-gray-200 leading-relaxed font-game">
        <p>
          Si te equivocas en una respuesta, no caes al nivel anterior: <strong>¡caes al último piso seguro alcanzado!</strong>
        </p>
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500 text-emerald-300 font-bold">
            🛡️ Piso Seguro 1<br /><span className="text-sm">$25.000 (Nivel 4)</span>
          </div>
          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500 text-emerald-300 font-bold">
            🛡️ Piso Seguro 2<br /><span className="text-sm">$500.000 (Nivel 8)</span>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-rose-300">
          <LogOut size={16} className="shrink-0" />
          <span>Si la pregunta te parece suicida, pulsa <strong>"Plantarse"</strong> para retirarte con tu pozo intacto.</span>
        </p>
      </div>
    ),
  },
  {
    step: 3,
    title: '3. Los 4 Comodines de Rescate',
    icon: <PhoneCall size={28} className="text-studio-gold" />,
    badge: 'PODERES ESPECIALES',
    content: (
      <div className="space-y-2.5 text-xs sm:text-sm text-gray-200 leading-relaxed font-game">
        <p>Dispones de 4 comodines de 1 solo uso por partida:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2 border border-studio-cardBorder bg-studio-card rounded">
            <strong>🕵️ El Cuñado Fanfarrón:</strong> Un familiar sabelotodo te aconseja con soberbia (75% acierta, 25% alucina teorías).
          </div>
          <div className="p-2 border border-studio-cardBorder bg-studio-card rounded">
            <strong>✂️ 50:50 Eliminador:</strong> Descarta dos opciones y deja la correcta junto a la trampa más seductora.
          </div>
          <div className="p-2 border border-studio-cardBorder bg-studio-card rounded">
            <strong>👥 Encuesta a la Tribuna:</strong> Consulta las votaciones de 100 personas del público del set en tiempo real.
          </div>
          <div className="p-2 border border-studio-cardBorder bg-studio-card rounded">
            <strong>🐍 Copia Ciega:</strong> En partidas con amigos, te acoplas al voto secreto de otro rival.
          </div>
        </div>
      </div>
    ),
  },
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const current = TUTORIAL_STEPS[currentStep];

  const handleNext = () => {
    sfx.playOptionClick();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    sfx.playOptionClick();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    sfx.playSpotlight();
    localStorage.setItem('bancarrota_tutorial_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="studio-glass p-6 sm:p-8 rounded-2xl border-2 border-studio-gold max-w-xl w-full shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full border border-studio-cardBorder text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="border-b border-studio-cardBorder pb-3 mb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest bg-studio-gold text-black px-2 py-0.5 rounded">
            REGLAMENTO OFICIAL DEL CONCURSO
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-white mt-1">
            Instrucciones para Concursantes
          </h2>
        </div>

        {/* Current Step */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg border border-studio-gold bg-studio-card shrink-0">
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-studio-gold tracking-wider">
              {current.badge}
            </span>
            <h3 className="font-display text-base sm:text-lg font-bold text-white">
              {current.title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="bg-studio-bg/60 p-4 rounded-lg border border-studio-cardBorder min-h-[160px] mb-6">
          {current.content}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-studio-cardBorder pt-3">
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((s, idx) => (
              <span
                key={s.step}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-studio-gold' : 'bg-studio-cardBorder'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 text-xs font-bold uppercase rounded border border-studio-cardBorder text-gray-300 hover:bg-studio-card flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Anterior
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold uppercase rounded bg-studio-gold text-black hover:brightness-110 flex items-center gap-1"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-5 py-2 text-xs font-bold uppercase rounded bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-display flex items-center gap-1.5 shadow-gold-glow"
              >
                <Check size={14} /> ¡Entendido, Vamos a Jugar!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
