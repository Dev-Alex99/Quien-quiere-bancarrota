import React, { useState } from 'react';
import { Play, UserPlus, Users, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';
import { RoomState } from '../types';
import { sfx } from '../audio/sfx';

interface LobbyProps {
  roomState: RoomState | null;
  playerId: string;
  onCreateRoom: (name: string, avatarIndex: number) => void;
  onJoinRoom: (code: string, name: string, avatarIndex: number) => void;
  onStartGame: () => void;
  onOpenTutorial?: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

const AVATARS = [
  { id: 0, title: 'El Banquero Suicida', icon: '🤵' },
  { id: 1, title: 'La Heredera Ambiciosa', icon: '💎' },
  { id: 2, title: 'El Apostador Serial', icon: '🎲' },
  { id: 3, title: 'El Cripto-Especulador', icon: '🕶️' },
  { id: 4, title: 'El Mago de las Deudas', icon: '🎩' },
  { id: 5, title: 'El Pirata de Wall Street', icon: '🦜' },
];

export const LobbyView: React.FC<LobbyProps> = ({
  roomState,
  playerId,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  onOpenTutorial,
  isLoading,
  errorMessage,
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('bancarrota_name') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [inputCode, setInputCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || '').toUpperCase();
  });
  const [copied, setCopied] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    localStorage.setItem('bancarrota_name', e.target.value);
    sfx.playOptionClick();
  };

  const handleCreate = () => {
    if (!playerName.trim()) return;
    sfx.playSpotlight();
    onCreateRoom(playerName.trim(), selectedAvatar);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !inputCode.trim()) return;
    sfx.playSpotlight();
    onJoinRoom(inputCode.trim(), playerName.trim(), selectedAvatar);
  };

  const copyShareLink = () => {
    if (!roomState) return;
    const url = `${window.location.origin}?room=${roomState.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sfx.playOptionClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = roomState?.players.find(p => p.id === playerId)?.isHost;
  const humanCount = roomState?.players.filter(p => !p.isAI).length || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Studio Card Container */}
      <div className="studio-glass p-6 sm:p-10 rounded-xl border-2 border-studio-cardBorder shadow-2xl relative overflow-hidden">
        {/* Spotlight visual glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-studio-cardBorder pb-4 mb-6 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-studio-gold text-studio-bg px-2.5 py-0.5 rounded">
              SET DE GRABACIÓN PRINCIPAL
            </span>
            <h2 className="font-display text-2xl sm:text-3xl uppercase font-black text-gold-gradient mt-1">
              {roomState ? `Estudio en Vivo: ${roomState.code}` : 'Bienvenido al Concurso'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 border border-studio-gold/60 text-studio-gold hover:bg-studio-gold/10 rounded transition-colors"
              >
                📖 Reglamento
              </button>
            )}
            <div className="text-xs font-mono font-bold px-3 py-1 rounded bg-studio-card border border-studio-gold text-studio-goldBright">
              {roomState ? 'SALA EN ESPERA' : 'ACCESO PÚBLICO'}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3 bg-rose-950/50 border border-rose-500 text-rose-300 text-xs font-semibold rounded flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* View 1: Not in Room */}
        {!roomState ? (
          <div className="space-y-6">
            {/* Contestant Name */}
            <div className="studio-glass p-5 rounded-lg border border-studio-cardBorder">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Nombre o Alias del Concursante:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={handleNameChange}
                maxLength={20}
                placeholder="Escribe tu apodo millonario..."
                className="w-full bg-studio-bg/70 border-b-2 border-studio-gold font-game text-xl text-white px-2 py-1.5 focus:outline-none focus:border-studio-goldBright placeholder:text-gray-500"
              />

              {/* Avatar Selector */}
              <div className="mt-5">
                <span className="block text-[11px] font-bold uppercase text-gray-400 mb-2">
                  Selecciona tu Personaje del Show:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.id);
                        sfx.playOptionClick();
                      }}
                      className={`p-2 rounded-lg border-2 text-center transition-all ${
                        selectedAvatar === av.id
                          ? 'border-studio-gold bg-amber-950/40 shadow-gold-glow -translate-y-0.5'
                          : 'border-studio-cardBorder bg-studio-card/60 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-3xl">{av.icon}</div>
                      <div className="text-[10px] font-bold mt-1 text-gray-200 leading-tight">
                        {av.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Create or Join Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create */}
              <div className="studio-glass p-5 rounded-lg border border-studio-cardBorder flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg uppercase font-bold text-studio-gold flex items-center gap-2 mb-1">
                    <Sparkles size={18} /> Iniciar Nuevo Programa
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Abre un nuevo concurso. Podrás invitar hasta 3 amigos mediante enlace o jugar en solitario contra la escalera del millón.
                  </p>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={!playerName.trim() || isLoading}
                  className="w-full py-3 px-4 font-bold text-sm uppercase rounded bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} />
                  {isLoading ? 'Abriendo Estudio...' : 'Crear Sala Oficial'}
                </button>
              </div>

              {/* Join */}
              <div className="studio-glass p-5 rounded-lg border border-studio-cardBorder flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg uppercase font-bold text-white flex items-center gap-2 mb-1">
                    <Users size={18} className="text-studio-cyanGlow" /> Unirse con Código
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Ingresa el código de 4 letras provisto por el anfitrión:
                  </p>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      sfx.playOptionClick();
                    }}
                    maxLength={4}
                    placeholder="EJ: BANC"
                    className="w-full bg-studio-bg/80 border-2 border-studio-cardBorder font-mono text-center tracking-widest text-xl py-1.5 text-studio-goldBright uppercase rounded focus:outline-none focus:border-studio-gold mb-4"
                  />
                </div>
                <button
                  onClick={handleJoin}
                  disabled={!playerName.trim() || !inputCode.trim() || isLoading}
                  className="w-full py-3 px-4 font-bold text-sm uppercase rounded bg-studio-card border-2 border-studio-gold text-studio-goldBright hover:bg-studio-cardBorder active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={16} />
                  {isLoading ? 'Entrando...' : 'Ingresar al Set'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: Inside Room */
          <div className="space-y-6">
            {/* Share link banner */}
            <div className="studio-glass p-4 rounded-lg border border-studio-cardBorder flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400">
                  Enlace para convocar rivales (1 a 4 concursantes):
                </span>
                <div className="font-mono text-sm sm:text-base text-studio-goldBright tracking-wider font-bold">
                  {window.location.origin}?room={roomState.code}
                </div>
              </div>
              <button
                onClick={copyShareLink}
                className="px-4 py-2 border border-studio-gold text-studio-goldBright hover:bg-studio-gold/10 transition-colors text-xs font-bold uppercase rounded flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? '¡Copiado!' : 'Copiar Enlace'}
              </button>
            </div>

            {/* Solo Mode Notification */}
            {humanCount === 1 && (
              <div className="p-3.5 bg-blue-950/40 border border-blue-500/50 rounded-lg text-xs text-blue-200 flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <strong className="font-bold text-blue-300 block uppercase">
                    Modo Individual Habilitado
                  </strong>
                  <span>
                    Estás solo en el set. Si inicias ahora, el programa convocará a <strong>Tito el Charlatán (Rival de la Casa)</strong> como tu contrincante en la carrera hacia el millón.
                  </span>
                </div>
              </div>
            )}

            {/* Contestant List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xs uppercase font-bold text-gray-300">
                  Concursantes en el Set ({roomState.players.length} / 4):
                </h3>
                <span className="text-xs text-gray-400">
                  {4 - roomState.players.length} plaza(s) disponibles
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roomState.players.map((p) => {
                  const avatar = AVATARS[p.avatarIndex] || AVATARS[0];
                  const isCurrent = p.id === playerId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-lg border flex items-center gap-3 ${
                        isCurrent
                          ? 'border-studio-gold bg-amber-950/20 shadow-gold-glow'
                          : 'border-studio-cardBorder bg-studio-card/50'
                      }`}
                    >
                      <div className="text-3xl p-1.5 bg-studio-bg rounded-full border border-studio-cardBorder">
                        {avatar.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate text-white">{p.name}</span>
                          {p.isHost && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-studio-gold text-black font-bold">
                              Líder
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {avatar.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Host Launch Controls */}
            <div className="pt-4 border-t border-studio-cardBorder flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-400 text-center sm:text-left">
                {isHost ? (
                  <span>Puedes dar la orden de salida cuando estés listo.</span>
                ) : (
                  <span>Esperando que el líder del concurso inicie el programa...</span>
                )}
              </div>

              {isHost ? (
                <button
                  onClick={() => {
                    sfx.playSpotlight();
                    onStartGame();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 font-display text-sm font-bold uppercase tracking-wider rounded bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-gold-glow"
                >
                  <Play size={18} />
                  ¡Comenzar el Concurso!
                </button>
              ) : (
                <div className="px-4 py-2 border border-studio-cardBorder bg-studio-card rounded text-xs font-bold uppercase text-gray-400">
                  Esperando Inicio...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
