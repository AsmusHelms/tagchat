import express from "express";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const COLS = 9,
  ROWS = 16,
  CELL_SIZE = 120,
  MAX_USERS = 16;
const MAX_ALIAS_LENGTH = 16,
  MAX_MESSAGE_LENGTH = 140,
  MAX_MESSAGES = 50;
const users = new Map();
// Action codes: 0 floor, 1 blocked. Rooftops: 2 club, 3/4/5 images.
// Club: 2 rooftops (blue), 3 reverse room (yellow), 4 random record (green).
// Reverse room: 3 club (yellow), 4 reverse record (green).
const rooms = new Map([
  [
    "rooftops",
    {
      name: "TAGENE",
      background: "/tagene.gif",
      hitMap: "rooftops-hit-map.json",
      messages: [],
    },
  ],
  [
    "jazz",
    {
      name: "JAZZKLUB",
      background: "/jazzklub.gif",
      hitMap: "jazz-hit-map.json",
      messages: [],
    },
  ],
  [
    "jazz-reverse",
    {
      name: "OMVENDT KLUB",
      background: "/klubben_omvendt.gif",
      hitMap: "jazz-reverse-hit-map.json",
      messages: [],
    },
  ],
]);
for (const room of rooms.values()) {
  const map = JSON.parse(fs.readFileSync(path.join(dir, room.hitMap), "utf8"));
  if (map.width !== 1080 || map.height !== 1920 || map.rows.length !== 1920)
    throw Error("Invalid hit map dimensions");
  room.hitRows = map.rows.map((runs) => {
    if (runs.length % 2) throw Error("Invalid hit map runs");
    const row = new Uint8Array(map.width);
    let x = 0;
    for (let i = 0; i < runs.length; i += 2) {
      if (
        !Number.isInteger(runs[i]) ||
        runs[i] <= 0 ||
        !Number.isInteger(runs[i + 1]) ||
        runs[i + 1] < 0 ||
        runs[i + 1] > 5
      )
        throw Error("Invalid hit map run");
      if (x + runs[i] > map.width) throw Error("Hit map run exceeds width");
      row.fill(runs[i + 1], x, x + runs[i]);
      x += runs[i];
    }
    if (x !== map.width) throw Error("Invalid hit map width");
    return row;
  });
  room.blocked = new Set();
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (
        room.hitRows[y * CELL_SIZE + CELL_SIZE / 2][
          x * CELL_SIZE + CELL_SIZE / 2
        ] !== 0
      )
        room.blocked.add(`${x},${y}`);
}
function hit(id, px, py) {
  return rooms.get(id)?.hitRows[py]?.[px] ?? 1;
}
const avatarFiles = fs
  .readdirSync(path.join(dir, "public"))
  .filter((f) => /^avatar[1-9]\d*\.gif$/.test(f));
if (!avatarFiles.length)
  throw Error("Add at least one numbered avatar GIF to public/");
const looks = avatarFiles;
function available(id) {
  const r = rooms.get(id);
  return r && fs.existsSync(path.join(dir, "public", r.background));
}
function members(id) {
  return [...users.values()].filter((u) => u.roomId === id);
}
function occupied(id, x, y, ignore) {
  return members(id).some((u) => u.id !== ignore && u.x === x && u.y === y);
}
function walkable(id, x, y) {
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    x < COLS &&
    y >= 0 &&
    y < ROWS &&
    !rooms.get(id).blocked.has(`${x},${y}`)
  );
}
function openCell(id) {
  const cells = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      if (walkable(id, x, y) && !occupied(id, x, y)) cells.push({ x, y });
  return cells[Math.floor(Math.random() * cells.length)];
}
function state(id) {
  const r = rooms.get(id);
  return {
    roomId: id,
    name: r.name,
    background: r.background,
    users: members(id),
    max: MAX_USERS,
    messages: r.messages,
  };
}
function presence() {
  for (const [id] of rooms)
    io.to(id).emit("presence", { count: members(id).length, max: MAX_USERS });
}
function enter(socket, id, alias, callback) {
  if (!available(id))
    return callback({ ok: false, error: "Dette rum er ikke klar endnu." });
  const old = users.get(socket.id);
  if (old?.roomId === id)
    return callback({ ok: true, selfId: socket.id, state: state(id) });
  if (members(id).length >= MAX_USERS)
    return callback({ ok: false, error: "Rummet er fyldt. Prøv igen senere." });
  const cell = openCell(id);
  if (!cell)
    return callback({ ok: false, error: "Der er ingen ledige felter." });
  if (old) {
    socket.leave(old.roomId);
    io.to(old.roomId).emit("user:left", { id: socket.id });
  }
  const user = {
    id: socket.id,
    alias: old?.alias || alias,
    avatar:
      old?.avatar || "/" + looks[Math.floor(Math.random() * looks.length)],
    roomId: id,
    ...cell,
  };
  users.set(socket.id, user);
  socket.join(id);
  callback({ ok: true, selfId: socket.id, state: state(id) });
  socket.to(id).emit("user:joined", user);
  presence();
}
app.use(express.static(path.join(dir, "public")));
io.on("connection", (socket) => {
  socket.on("join", (raw, cb = () => {}) => {
    const alias = String(raw || "")
      .trim()
      .slice(0, MAX_ALIAS_LENGTH);
    if (!alias) return cb({ ok: false, error: "Skriv et alias." });
    enter(socket, "rooftops", alias, cb);
  });

  socket.on("move", (cell, cb = () => {}) => {
    const u = users.get(socket.id);
    if (!u) return cb({ ok: false });
    const { px, py } = cell || {};
    if (
      !Number.isInteger(px) ||
      !Number.isInteger(py) ||
      px < 0 ||
      px >= 1080 ||
      py < 0 ||
      py >= 1920
    )
      return cb({ ok: false });
    const action = hit(u.roomId, px, py);
    if (action === 1) return cb({ ok: false });
    if (u.roomId === "rooftops") {
      if (action === 2) return enter(socket, "jazz", null, cb);
      if ([3, 4, 5].includes(action))
        return cb({
          ok: true,
          overlay: { 3: "/seddel.gif", 4: "/graff.gif", 5: "/seddel2.gif" }[
            action
          ],
        });
    } else if (u.roomId === "jazz") {
      if (action === 2) return enter(socket, "rooftops", null, cb);
      if (action === 3) return enter(socket, "jazz-reverse", null, cb);
      if (action === 4)
        return cb({
          ok: true,
          overlay: `/plade${1 + Math.floor(Math.random() * 9)}.gif`,
        });
    } else if (u.roomId === "jazz-reverse") {
      if (action === 3) return enter(socket, "jazz", null, cb);
      if (action === 4) return cb({ ok: true, overlay: "/plade_omvendt.gif" });
    }
    // Only ordinary floor pixels and ordinary floor grid centers can be occupied.
    if (action !== 0) return cb({ ok: false });
    const x = Math.floor(px / CELL_SIZE),
      y = Math.floor(py / CELL_SIZE);
    if (!walkable(u.roomId, x, y) || occupied(u.roomId, x, y, u.id))
      return cb({ ok: false });
    Object.assign(u, { x, y });
    io.to(u.roomId).emit("user:moved", { id: u.id, x, y });
    cb({ ok: true });
  });
  socket.on("message:send", (raw, cb = () => {}) => {
    const u = users.get(socket.id);
    const text = String(raw || "")
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH);
    if (!u || !text) return cb({ ok: false });
    if (text.toLowerCase() === "/help") return cb({ ok: true, help: true });
    const m = {
      id: randomUUID(),
      userId: u.id,
      alias: u.alias,
      text,
      timestamp: Date.now(),
    };
    const log = rooms.get(u.roomId).messages;
    log.push(m);
    if (log.length > MAX_MESSAGES) log.shift();
    io.to(u.roomId).emit("message:new", m);
    cb({ ok: true });
  });
  socket.on("disconnect", () => {
    const u = users.get(socket.id);
    if (!u) return;
    users.delete(socket.id);
    io.to(u.roomId).emit("user:left", { id: u.id });
    presence();
  });
});
server.listen(process.env.PORT || 3000, "0.0.0.0", () =>
  console.log("TAGCHAT ready"),
);
