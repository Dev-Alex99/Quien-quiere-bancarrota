import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { RoomManager } from './game/RoomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const roomManager = new RoomManager(io);

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    name: '¿Quién Quiere Quedar en Bancarrota? Server',
    status: 'ONLINE',
    engineConfigured: !!config.minimax.apiKey,
    engine: config.minimax.apiKey ? 'INTELIGENCIA_CENTRAL_EN_VIVO' : 'MODO_SIMULADOR_LOCAL',
    time: new Date().toISOString(),
  });
});

// Serve frontend in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) next();
  });
});

// WebSocket Protocol
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Conexión establecida: ${socket.id}`);

  // High-latency clock synchronization
  socket.on('ping:sync', (clientTimestamp: number, callback: (res: { clientTimestamp: number; serverTimestamp: number }) => void) => {
    if (typeof callback === 'function') {
      callback({
        clientTimestamp,
        serverTimestamp: Date.now(),
      });
    }
  });

  // Create Room
  socket.on('room:create', ({ playerName, avatarIndex }, callback) => {
    try {
      const room = roomManager.createRoom();
      const safeName = (playerName || 'Concursante Anónimo').trim().slice(0, 18);
      const player = room.addPlayer(socket.id, safeName, avatarIndex ?? 0);
      
      socket.join(room.code);
      console.log(`[Socket] ${safeName} abrió la sala ${room.code}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          code: room.code,
          playerId: player.id,
          roomState: room.getState(player.id),
        });
      }
      room.broadcastState();
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Join Room
  socket.on('room:join', ({ code, playerName, avatarIndex }, callback) => {
    try {
      const cleanCode = (code || '').toUpperCase().trim();
      const room = roomManager.getRoom(cleanCode);

      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Sala no encontrada. Verifique el código del estudio.' });
        }
        return;
      }

      if (room.phase !== 'LOBBY' && room.phase !== 'PODIUM') {
        const existing = room.players.find(p => p.name.toLowerCase() === (playerName || '').toLowerCase().trim());
        if (!existing) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'El programa ya está en vivo. Espere al próximo corte comercial.' });
          }
          return;
        }
      }

      const safeName = (playerName || 'Concursante Anónimo').trim().slice(0, 18);
      const player = room.addPlayer(socket.id, safeName, avatarIndex ?? 0);
      socket.join(room.code);

      console.log(`[Socket] ${safeName} ingresó a la sala ${room.code}`);

      if (typeof callback === 'function') {
        callback({
          success: true,
          code: room.code,
          playerId: player.id,
          roomState: room.getState(player.id),
        });
      }
      room.broadcastState();
    } catch (err: any) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Start Game (Host only)
  socket.on('game:start', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) return;

    room.startGame();
  });

  // Choose Option (A, B, C, D)
  socket.on('player:choose', ({ code, choice }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.setPlayerChoice(socket.id, choice);
  });

  // Lock In ("Última Palabra")
  socket.on('player:lock_in', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.lockInChoice(socket.id);
  });

  // Walk Away ("Plantarse con el Dinero")
  socket.on('player:walk_away', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.walkAway(socket.id);
  });

  // Lifelines
  socket.on('lifeline:cunado', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.useCunadoLifeline(socket.id);
  });

  socket.on('lifeline:fifty_fifty', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.useFiftyFiftyLifeline(socket.id);
  });

  socket.on('lifeline:audience', ({ code }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.useAudienceLifeline(socket.id);
  });

  socket.on('lifeline:blind_copy', ({ code, targetPlayerId }) => {
    const room = roomManager.getRoom(code);
    if (!room) return;
    room.useBlindCopyLifeline(socket.id, targetPlayerId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    roomManager.handleDisconnect(socket.id);
  });
});

httpServer.listen(config.port, '0.0.0.0', () => {
  console.log('========================================================');
  console.log(`📺  ¿QUIÉN QUIERE QUEDAR EN BANCARROTA? — ESTUDIO EN VIVO`);
  console.log(`🏛️  Servidor escuchando en: http://localhost:${config.port}`);
  console.log(`✨  Inteligencia Central: ${config.minimax.apiKey ? 'CONECTADA (Generación Dinámica en Vivo)' : 'MODO SIMULADOR LOCAL'}`);
  console.log('========================================================');
});
