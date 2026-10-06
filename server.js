import express from 'express';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const COLS = 9, ROWS = 16, MAX_USERS = 16;
const users = new Map();
const rooms = new Map([
  ['rooftops', { name: 'TAGENE', background: '/tagene.gif', map: 'room-map.json', messages: [] }],
  ['jazz', { name: 'JAZZKLUB', background: '/jazzklub.gif', map: 'jazz-map.json', messages: [] }]
]);
for (const room of rooms.values()) {
  const { rows } = JSON.parse(fs.readFileSync(path.join(dir, room.map), 'utf8'));
  if (rows.length !== ROWS || rows.some(row => row.length !== COLS || /[^.#]/.test(row))) throw Error('Invalid room map');
  room.blocked = new Set(rows.flatMap((row, y) => [...row].flatMap((c, x) => c === '#' ? [`${x},${y}`] : [])));
}
// Pixel map built from tagene_klik.gif. Hotspots are handled before grid movement.
const hitMap = JSON.parse(fs.readFileSync(path.join(dir, 'rooftops-hit-map.json'), 'utf8'));
const hitRows = hitMap.rows.map(runs => {
  const row = new Uint8Array(hitMap.width); let x = 0;
  for (let i=0; i<runs.length; i+=2) { row.fill(runs[i+1], x, x+runs[i]); x+=runs[i]; }
  if(x!==hitMap.width)throw Error('Invalid hit map');return row;
});
function hit(px,py) { return hitRows[py]?.[px] ?? 1; }
rooms.get('rooftops').blocked = new Set();
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(hit(x*120+60,y*120+60)!==0)rooms.get('rooftops').blocked.add(`${x},${y}`);
const avatarFiles = fs.readdirSync(path.join(dir, 'public')).filter(f => /^(?:avatar|mand|dame)[1-9]\d*\.gif$/.test(f));
const looks = avatarFiles.length ? avatarFiles : ['avatar.gif'];
function available(id) { const r = rooms.get(id); return r && fs.existsSync(path.join(dir, 'public', r.background)); }
function members(id) { return [...users.values()].filter(u => u.roomId === id); }
function catalog() { return [...rooms].map(([id,r]) => ({ id, name:r.name, available:!!available(id), count:members(id).length, max:MAX_USERS })); }
function occupied(id,x,y,ignore) { return members(id).some(u => u.id !== ignore && u.x===x && u.y===y); }
function openCell(id) {
  const cells=[];
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(!rooms.get(id).blocked.has(`${x},${y}`)&&!occupied(id,x,y)) cells.push({x,y});
  return cells[Math.floor(Math.random()*cells.length)];
}
function state(id) { const r=rooms.get(id);return {roomId:id, background:r.background, users:members(id),blockedCells:[...r.blocked],messages:r.messages,rooms:catalog()}; }
function presence() { for(const [id] of rooms) io.to(id).emit('presence',{count:members(id).length,max:MAX_USERS});io.emit('rooms',catalog()); }
function enter(socket,id,alias,callback) {
  if(!available(id)) return callback({ok:false,error:'Dette rum er ikke klar endnu.'});
  const old=users.get(socket.id);
  if(old?.roomId===id) return callback({ok:true,selfId:socket.id,state:state(id)});
  if(members(id).length>=MAX_USERS) return callback({ok:false,error:'Rummet er fyldt. Prøv igen senere.'});
  const cell=openCell(id);if(!cell) return callback({ok:false,error:'Der er ingen ledige felter.'});
  if(old){socket.leave(old.roomId);io.to(old.roomId).emit('user:left',{id:socket.id});}
  const user={id:socket.id,alias:old?.alias||alias,avatar:old?.avatar||'/'+looks[Math.floor(Math.random()*looks.length)],roomId:id,...cell};
  users.set(socket.id,user);socket.join(id);
  callback({ok:true,selfId:socket.id,state:state(id)});socket.to(id).emit('user:joined',user);presence();
}
app.use(express.static(path.join(dir,'public')));
io.on('connection',socket=>{
  socket.emit('rooms',catalog());
  socket.on('join',(raw,cb=()=>{})=>{const alias=String(raw||'').trim().slice(0,16);if(!alias)return cb({ok:false,error:'Skriv et alias.'});enter(socket,'rooftops',alias,cb);});
  socket.on('room:change',(id,cb=()=>{})=>{if(!users.has(socket.id))return cb({ok:false});enter(socket,id,null,cb);});
  socket.on('move',(cell,cb=()=>{})=>{
    const u=users.get(socket.id);if(!u)return cb({ok:false});
    let {x,y,px,py}=cell||{};
    if(u.roomId==='rooftops') {
      if(!Number.isInteger(px)||!Number.isInteger(py)||px<0||px>=1080||py<0||py>=1920)return cb({ok:false});
      const action=hit(px,py);
      if(action===1)return cb({ok:false});
      if(action===2)return enter(socket,'jazz',null,cb);
      if(action===3||action===4)return cb({ok:true,overlay:action===3?'/seddel.gif':'/graff.gif'});
      x=Math.floor(px/120);y=Math.floor(py/120);
    }
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=COLS||y<0||y>=ROWS||rooms.get(u.roomId).blocked.has(`${x},${y}`)||occupied(u.roomId,x,y,u.id))return cb({ok:false});
    Object.assign(u,{x,y});io.to(u.roomId).emit('user:moved',{id:u.id,x,y});cb({ok:true});
  });
  socket.on('message:send',(raw,cb=()=>{})=>{
    const u=users.get(socket.id);const text=String(raw||'').trim().slice(0,140);if(!u||!text)return cb({ok:false});
    const m={id:randomUUID(),userId:u.id,alias:u.alias,text,timestamp:Date.now()};const log=rooms.get(u.roomId).messages;
    log.push(m);if(log.length>50)log.shift();io.to(u.roomId).emit('message:new',m);cb({ok:true});
  });
  socket.on('disconnect',()=>{const u=users.get(socket.id);if(!u)return;users.delete(socket.id);io.to(u.roomId).emit('user:left',{id:u.id});presence();});
});
server.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('TAGCHAT ready'));
