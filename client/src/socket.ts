import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || '';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
});

let clockOffset = 0;

export function syncClock() {
  const start = Date.now();
  socket.emit('ping:sync', start, (response: { clientTimestamp: number; serverTimestamp: number }) => {
    if (!response) return;
    const now = Date.now();
    const rtt = now - start;
    const serverTime = response.serverTimestamp;
    clockOffset = (serverTime + rtt / 2) - now;
  });
}

socket.on('connect', () => {
  syncClock();
});

setInterval(() => {
  if (socket.connected) {
    syncClock();
  }
}, 20000);

export function getEstimatedServerTime(): number {
  return Date.now() + clockOffset;
}
