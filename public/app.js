const socket = io();

const entry = document.querySelector('#entry');
const roomScreen = document.querySelector('#roomScreen');
const joinForm = document.querySelector('#joinForm');
const aliasInput = document.querySelector('#aliasInput');
const joinError = document.querySelector('#joinError');
const world = document.querySelector('#world');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#messageInput');
const counter = document.querySelector('#counter');
const chatToggle = document.querySelector('#chatToggle');
const chatClose = document.querySelector('#chatClose');
const chatPanel = document.querySelector('#chatPanel');
const chatLog = document.querySelector('#chatLog');
const presence = document.querySelector('#presence');

const COLS = 9;
const ROWS = 16;
const users = new Map();
const bubbleTimers = new Map();
let selfId = null;
let blocked = new Set();

function key(x, y) { return `${x},${y}`; }

function makeAvatar(user) {
  const el = document.createElement('div');
  el.className = 'avatar';
  el.dataset.id = user.id;
  el.innerHTML = `
    <div class="avatar-inner">
      <div class="bubble" hidden></div>
      <img class="head" src="/avatar.gif" alt="" draggable="false">
      <div class="alias"></div>
    </div>
  `;
  el.querySelector('.alias').textContent = user.alias;
  world.appendChild(el);
  return el;
}

function renderUser(user) {
  let record = users.get(user.id);
  if (!record) {
    record = { ...user, el: makeAvatar(user) };
    users.set(user.id, record);
  } else {
    Object.assign(record, user);
  }
  record.el.style.setProperty('--x', record.x);
  record.el.style.setProperty('--y', record.y);
}

function removeUser(id) {
  const user = users.get(id);
  if (!user) return;
  user.el.remove();
  users.delete(id);
  clearTimeout(bubbleTimers.get(id));
  bubbleTimers.delete(id);
}

function showBubble(message) {
  const user = users.get(message.userId);
  if (!user) return;
  const bubble = user.el.querySelector('.bubble');
  bubble.textContent = message.text;
  bubble.hidden = false;

  clearTimeout(bubbleTimers.get(message.userId));
  const timer = setTimeout(() => {
    bubble.hidden = true;
  }, 8000);
  bubbleTimers.set(message.userId, timer);
}

function addChatLine(message) {
  const line = document.createElement('div');
  line.className = 'chat-line';
  const alias = document.createElement('strong');
  alias.textContent = `${message.alias}: `;
  const text = document.createTextNode(message.text);
  line.append(alias, text);
  chatLog.appendChild(line);
  chatLog.scrollTop = chatLog.scrollHeight;
}

joinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const alias = aliasInput.value.trim().slice(0, 16);
  joinError.textContent = '';

  socket.emit('join', alias, (response) => {
    if (!response?.ok) {
      joinError.textContent = response?.error || 'Kunne ikke gå ind.';
      return;
    }

    selfId = response.selfId;
    blocked = new Set(response.state.blockedCells || []);
    response.state.users.forEach(renderUser);
    response.state.messages.forEach(addChatLine);
    presence.textContent = `${response.state.users.length} / 10`;

    entry.classList.add('hidden');
    roomScreen.classList.remove('hidden');
    messageInput.focus();
  });
});

world.addEventListener('click', (event) => {
  if (!selfId) return;
  const rect = world.getBoundingClientRect();
  const x = Math.min(COLS - 1, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * COLS)));
  const y = Math.min(ROWS - 1, Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * ROWS)));
  if (blocked.has(key(x, y))) return;
  socket.emit('move', { x, y });
});

messageInput.addEventListener('input', () => {
  counter.textContent = `${messageInput.value.length} / 140`;
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim().slice(0, 140);
  if (!text) return;

  socket.emit('message:send', text, (response) => {
    if (!response?.ok) return;
    messageInput.value = '';
    counter.textContent = '0 / 140';
    messageInput.focus();
  });
});

chatToggle.addEventListener('click', () => chatPanel.setAttribute('aria-hidden', 'false'));
chatClose.addEventListener('click', () => chatPanel.setAttribute('aria-hidden', 'true'));

socket.on('user:joined', renderUser);
socket.on('user:moved', ({ id, x, y }) => {
  const user = users.get(id);
  if (!user) return;
  user.x = x;
  user.y = y;
  renderUser(user);
});
socket.on('user:left', ({ id }) => removeUser(id));
socket.on('presence', ({ count, max }) => presence.textContent = `${count} / ${max}`);
socket.on('message:new', (message) => {
  addChatLine(message);
  showBubble(message);
});
