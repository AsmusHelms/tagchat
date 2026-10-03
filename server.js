import express from 'express';
import fs from 'node:fs';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const MAX_USERS = 10;
const COLS = 9;
const ROWS = 16;
const MAX_MESSAGES = 50;
const MAX_ALIAS = 16;
const MAX_MESSAGE = 140;

// Same map controls both random spawn and server-authoritative movement.
const roomMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'room-map.json'), 'utf8'));
if (roomMap.rows.length !== ROWS || roomMap.rows.some(row => row.length !== COLS || /[^.#]/.test(row))) {
  throw new Error('room-map.json must contain 16 rows of 9 cells (. or #).');
}
const blockedCells = new Set(roomMap.rows.flatMap((row, y) =>
  [...row].flatMap((cell, x) => cell === '#' ? [`${x},${y}`] : [])
));

const users = new Map();
const messages = [];

function cellKey(x, y) {
  return `${x},${y}`;
}

function isValidCell(x, y) {
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

function occupiedCell(x, y, ignoreSocketId = null) {
  for (const [socketId, user] of users.entries()) {
    if (socketId === ignoreSocketId) continue;
    if (user.x === x && user.y === y) return true;
  }
  return false;
}

function openCells() {
  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!blockedCells.has(cellKey(x, y)) && !occupiedCell(x, y)) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
}

function randomOpenCell() {
  const cells = openCells();
  if (!cells.length) return null;
  return cells[Math.floor(Math.random() * cells.length)];
}

function roomState() {
  return {
    users: [...users.values()],
    blockedCells: [...blockedCells],
    messages
  };
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join', (rawAlias, callback = () => {}) => {
    if (users.has(socket.id)) return callback({ ok: true });
    if (users.size >= MAX_USERS) {
      return callback({ ok: false, error: 'Rummet er fyldt. Prøv igen senere.' });
    }

    const alias = String(rawAlias || '').trim().slice(0, MAX_ALIAS);
    if (!alias) return callback({ ok: false, error: 'Skriv et alias.' });

    const cell = randomOpenCell();
    if (!cell) return callback({ ok: false, error: 'Der er ingen ledige felter.' });

    const user = {
      id: socket.id,
      alias,
      x: cell.x,
      y: cell.y
    };
    users.set(socket.id, user);

    callback({ ok: true, selfId: socket.id, state: roomState() });
    socket.broadcast.emit('user:joined', user);
    io.emit('presence', { count: users.size, max: MAX_USERS });
  });

  socket.on('move', ({ x, y }, callback = () => {}) => {
    const user = users.get(socket.id);
    if (!user) return callback({ ok: false });
    if (!isValidCell(x, y)) return callback({ ok: false });
    if (blockedCells.has(cellKey(x, y))) return callback({ ok: false });
    if (occupiedCell(x, y, socket.id)) return callback({ ok: false });

    user.x = x;
    user.y = y;
    io.emit('user:moved', { id: socket.id, x, y });
    callback({ ok: true });
  });

  socket.on('message:send', (rawText, callback = () => {}) => {
    const user = users.get(socket.id);
    if (!user) return callback({ ok: false });

    const text = String(rawText || '').trim().slice(0, MAX_MESSAGE);
    if (!text) return callback({ ok: false });

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: socket.id,
      alias: user.alias,
      text,
      timestamp: Date.now()
    };

    messages.push(message);
    if (messages.length > MAX_MESSAGES) messages.shift();

    io.emit('message:new', message);
    callback({ ok: true });
  });

  socket.on('disconnect', () => {
    if (!users.has(socket.id)) return;
    users.delete(socket.id);
    io.emit('user:left', { id: socket.id });
    io.emit('presence', { count: users.size, max: MAX_USERS });
  });
});

server.listen(PORT, () => {
  console.log(`TAGCHAT v1 running on http://localhost:${PORT}`);
});
