import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { OptionLetter, RoomState } from './types';
import { StudioHeader } from './components/StudioHeader';
import { LobbyView } from './components/LobbyView';
import { MoneyLadder } from './components/MoneyLadder';
import { QuestionView } from './components/QuestionView';
import { DramaPauseView } from './components/DramaPauseView';
import { VerdictRevealView } from './components/VerdictRevealView';
import { PodiumView } from './components/PodiumView';
import { TutorialModal } from './components/TutorialModal';
import { sfx } from './audio/sfx';

export const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string>(() => sessionStorage.getItem('bancarrota_player_id') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    return localStorage.getItem('bancarrota_tutorial_seen') !== 'true';
  });

  // Start audio context on first user click/touch
  useEffect(() => {
    const handleFirstInteraction = () => {
      sfx.initCtx();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    socket.on('room:state', (updated: RoomState) => {
      setRoomState(updated);
    });

    socket.on('connect', () => {
      setErrorMessage(null);
    });

    return () => {
      socket.off('room:state');
    };
  }, []);

  const handleCreateRoom = (name: string, avatarIndex: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    socket.emit('room:create', { playerName: name, avatarIndex }, (res: any) => {
      setIsLoading(false);
      if (res?.success) {
        setPlayerId(res.playerId);
        sessionStorage.setItem('bancarrota_player_id', res.playerId);
        setRoomState(res.roomState);
      } else {
        setErrorMessage(res?.error || 'No se pudo abrir el estudio.');
      }
    });
  };

  const handleJoinRoom = (code: string, name: string, avatarIndex: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    socket.emit('room:join', { code, playerName: name, avatarIndex }, (res: any) => {
      setIsLoading(false);
      if (res?.success) {
        setPlayerId(res.playerId);
        sessionStorage.setItem('bancarrota_player_id', res.playerId);
        setRoomState(res.roomState);
      } else {
        setErrorMessage(res?.error || 'Sala no hallada o programa en curso.');
      }
    });
  };

  const handleStartGame = () => {
    if (!roomState?.code) return;
    socket.emit('game:start', { code: roomState.code });
  };

  const handleSelectOption = (choice: OptionLetter) => {
    if (!roomState?.code) return;
    socket.emit('player:choose', { code: roomState.code, choice });
  };

  const handleLockIn = () => {
    if (!roomState?.code) return;
    socket.emit('player:lock_in', { code: roomState.code });
  };

  const handleWalkAway = () => {
    if (!roomState?.code) return;
    socket.emit('player:walk_away', { code: roomState.code });
  };

  const handleUseCunado = () => {
    if (!roomState?.code) return;
    socket.emit('lifeline:cunado', { code: roomState.code });
  };

  const handleUseFiftyFifty = () => {
    if (!roomState?.code) return;
    socket.emit('lifeline:fifty_fifty', { code: roomState.code });
  };

  const handleUseAudience = () => {
    if (!roomState?.code) return;
    socket.emit('lifeline:audience', { code: roomState.code });
  };

  const handleUseBlindCopy = (targetPlayerId: string) => {
    if (!roomState?.code) return;
    socket.emit('lifeline:blind_copy', { code: roomState.code, targetPlayerId });
  };

  const handleLeaveRoom = () => {
    sessionStorage.removeItem('bancarrota_player_id');
    setRoomState(null);
    setPlayerId('');
    window.location.search = '';
  };

  const currentUser = roomState?.players.find((p) => p.id === playerId);
  const isHost = currentUser?.isHost ?? false;
  const isGameActive = roomState && ['QUESTION_ACTIVE', 'DRAMA_PAUSE', 'VERDICT_REVEAL'].includes(roomState.phase);

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-studio-bg overflow-x-hidden">
      {/* Studio Lighting Sweep Effect */}
      <div className="spotlight-beam fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none z-0" />

      {/* Top TV Header */}
      <StudioHeader
        roomState={roomState}
        onLeaveRoom={roomState ? handleLeaveRoom : undefined}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main Studio Floor */}
      <main className="flex-1 flex flex-col justify-center py-4 z-10 px-2 sm:px-4">
        {(!roomState || roomState.phase === 'LOBBY') && (
          <LobbyView
            roomState={roomState}
            playerId={playerId}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {/* Active Game Layout: Stage + Side Money Ladder */}
        {isGameActive && roomState.currentQuestion && (
          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Center Stage (3 Columns on Large Screens) */}
            <div className="lg:col-span-3">
              {roomState.phase === 'QUESTION_ACTIVE' && (
                <QuestionView
                  currentQuestion={roomState.currentQuestion}
                  timerEndsAt={roomState.timerEndsAt}
                  currentUser={currentUser}
                  allPlayers={roomState.players}
                  onSelectOption={handleSelectOption}
                  onLockIn={handleLockIn}
                  onWalkAway={handleWalkAway}
                  onUseCunado={handleUseCunado}
                  onUseFiftyFifty={handleUseFiftyFifty}
                  onUseAudience={handleUseAudience}
                  onUseBlindCopy={handleUseBlindCopy}
                />
              )}

              {roomState.phase === 'DRAMA_PAUSE' && (
                <DramaPauseView
                  hostCommentary={roomState.hostCommentary}
                  currentPrizeFormatted={roomState.currentQuestion.formattedPrize}
                />
              )}

              {roomState.phase === 'VERDICT_REVEAL' && (
                <VerdictRevealView
                  currentQuestion={roomState.currentQuestion}
                  timerEndsAt={roomState.timerEndsAt}
                  players={roomState.players}
                  currentPlayerId={playerId}
                />
              )}
            </div>

            {/* Side Money Ladder (1 Column) */}
            <div className="lg:col-span-1 hidden sm:block">
              <MoneyLadder
                currentQuestionIndex={roomState.currentQuestionIndex}
                players={roomState.players}
                currentPlayerId={playerId}
              />
            </div>
          </div>
        )}

        {/* Podium Final View */}
        {roomState && roomState.phase === 'PODIUM' && roomState.finalPodium && (
          <PodiumView
            podium={roomState.finalPodium}
            players={roomState.players}
            isHost={isHost}
            onPlayAgain={handleStartGame}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-studio-cardBorder bg-studio-bg/90 py-2.5 px-4 text-center text-[10px] text-gray-500 uppercase tracking-widest z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>¿Quién Quiere Quedar en Bancarrota? • Formato Oficial de TV</span>
          <span>Estudio Central de Televisión • En Vivo</span>
          <span>Tolerancia de Latencia: 0 - 800ms</span>
        </div>
      </footer>

      {/* Tutorial / Game Rules Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
};
