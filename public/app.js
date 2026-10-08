const socket = io();
const $ = id => document.getElementById(id);
const world=$('world'), users=new Map(), timers=new Map();
let selfId=null, roomId='rooftops', blocked=new Set(), rememberedAlias='';
function viewport(){const v=window.visualViewport;document.documentElement.style.setProperty('--viewport-h',`${v?.height||innerHeight}px`);document.documentElement.style.setProperty('--viewport-top',`${v?.offsetTop||0}px`);clampPanel();}
function positionBubble(u){
  if(u.bubble.hidden)return;
  const r=world.getBoundingClientRect(), a=u.el.getBoundingClientRect(), b=u.bubble;
  b.style.maxWidth=`${Math.min(220,r.width-12)}px`;
  b.style.left=`${Math.max(6,Math.min(r.width-b.offsetWidth-6,a.left-r.left+a.width/2-b.offsetWidth/2))}px`;
  b.style.top=`${Math.max(4,Math.min(r.height-b.offsetHeight-4,a.top-r.top-b.offsetHeight-6))}px`;
}
function renderUser(u){let r=users.get(u.id);if(!r){
 const el=document.createElement('div');el.className='avatar';
 const inner=document.createElement('div');inner.className='avatar-inner';
 const head=document.createElement('img');head.className='head';head.src=u.avatar||'/avatar.gif';head.alt='';head.draggable=false;
 const alias=document.createElement('div');alias.className='alias';alias.textContent=u.alias;
 inner.append(head,alias);el.append(inner);
 const bubble=document.createElement('div');bubble.className='bubble';bubble.hidden=true;
 world.append(el,bubble);r={...u,el,bubble};users.set(u.id,r);
 }else Object.assign(r,u);
 r.el.style.setProperty('--x',r.x);r.el.style.setProperty('--y',r.y);positionBubble(r);
}
function removeUser(id){const r=users.get(id);if(!r)return;r.el.remove();r.bubble.remove();users.delete(id);clearTimeout(timers.get(id));timers.delete(id);}
function chatLine(m){const line=document.createElement('div');line.className='chat-line';const a=document.createElement('strong');a.textContent=m.alias+': ';line.append(a,document.createTextNode(m.text));$('chatLog').append(line);while($('chatLog').children.length>50)$('chatLog').firstChild.remove();$('chatLog').scrollTop=$('chatLog').scrollHeight;}
function applyState(response){selfId=response.selfId;const s=response.state;roomId=s.roomId;[...users.keys()].forEach(removeUser);$('chatLog').replaceChildren();blocked=new Set(s.blockedCells);world.style.backgroundImage=`url("${s.background}")`;s.users.forEach(renderUser);s.messages.forEach(chatLine);$('roomName').textContent=roomId==='jazz'?'JAZZKLUB':'TAGENE';$('presence').textContent=`${s.users.length} / 16`;}
$('joinForm').addEventListener('submit',e=>{e.preventDefault();rememberedAlias=$('aliasInput').value.trim().slice(0,16);socket.emit('join',rememberedAlias,r=>{if(!r?.ok){$('joinError').textContent=r?.error||'Kunne ikke gå ind.';return;}applyState(r);$('entry').classList.add('hidden');$('roomScreen').classList.remove('hidden');viewport();});});
const imageOverlay=$('imageOverlay'), overlayImage=$('overlayImage');
function closeOverlay(){imageOverlay.classList.add('hidden');overlayImage.removeAttribute('src');}
function openOverlay(src){overlayImage.src=src;imageOverlay.classList.remove('hidden');imageOverlay.focus();}
imageOverlay.addEventListener('click',e=>{e.stopPropagation();closeOverlay();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOverlay();});
world.addEventListener('click',e=>{
 if(!selfId||!socket.connected)return;
 const r=world.getBoundingClientRect();const px=Math.min(1079,Math.max(0,Math.floor((e.clientX-r.left)/r.width*1080))),py=Math.min(1919,Math.max(0,Math.floor((e.clientY-r.top)/r.height*1920)));
 socket.emit('move',{x:Math.floor(px/120),y:Math.floor(py/120),px,py},response=>{
   if(response?.state){closeOverlay();applyState(response);$('roomError').textContent='';}
   else if(response?.overlay)openOverlay(response.overlay);
   else if(response?.error)$('roomError').textContent=response.error;
 });
});
$('messageInput').addEventListener('input',()=>{$('counter').textContent=`${$('messageInput').value.length} / 140`;});
$('messageForm').addEventListener('submit',e=>{e.preventDefault();const t=$('messageInput').value.trim().slice(0,140);if(!t)return;socket.emit('message:send',t,r=>{if(r?.help){$('helpOverlay').classList.remove('hidden');$('helpOverlay').focus();}if(r?.ok){$('messageInput').value='';$('counter').textContent='0 / 140';}});});
socket.on('user:joined',renderUser);socket.on('user:moved',u=>{const r=users.get(u.id);if(r)renderUser({...r,...u});});socket.on('user:left',u=>removeUser(u.id));socket.on('presence',p=>{$('presence').textContent=`${p.count} / ${p.max}`;});
socket.on('message:new',m=>{chatLine(m);const u=users.get(m.userId);if(!u)return;u.bubble.textContent=m.text;u.bubble.hidden=false;positionBubble(u);clearTimeout(timers.get(u.id));timers.set(u.id,setTimeout(()=>{u.bubble.hidden=true;},8000));});
socket.on('disconnect',()=>{if(selfId)$('roomError').textContent='Forbindelsen er afbrudt. Forbinder igen…';});
socket.on('connect',()=>{if(!selfId)return;socket.emit('join',rememberedAlias,r=>{if(!r?.ok){selfId=null;$('roomScreen').classList.add('hidden');$('entry').classList.remove('hidden');$('joinError').textContent=r?.error||'Kunne ikke genoprette forbindelsen.';return;}applyState(r);$('roomError').textContent='';});});
const panel=$('chatPanel');let placed=false, drag=null;
function clampPanel(){if(!placed)return;const v=window.visualViewport;const w=v?.width||innerWidth,h=v?.height||innerHeight,top=v?.offsetTop||0,left=v?.offsetLeft||0;panel.style.left=`${Math.max(left+6,Math.min(parseFloat(panel.style.left)||0,left+w-panel.offsetWidth-6))}px`;panel.style.top=`${Math.max(top+6,Math.min(parseFloat(panel.style.top)||0,top+h-panel.offsetHeight-6))}px`;}
$('chatToggle').addEventListener('click',()=>{panel.setAttribute('aria-hidden','false');if(!placed){panel.style.left='12px';panel.style.top=`${(window.visualViewport?.offsetTop||0)+60}px`;placed=true;}clampPanel();$('chatLog').scrollTop=$('chatLog').scrollHeight;});$('chatClose').addEventListener('click',()=>panel.setAttribute('aria-hidden','true'));
const header=panel.querySelector('.chat-header');
header.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:parseFloat(panel.style.left),top:parseFloat(panel.style.top)};header.setPointerCapture(e.pointerId);});
header.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;panel.style.left=`${drag.left+e.clientX-drag.x}px`;panel.style.top=`${drag.top+e.clientY-drag.y}px`;clampPanel();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])header.addEventListener(event,()=>{drag=null;});
const wrap=world.parentElement;
new ResizeObserver(()=>{const r=wrap.getBoundingClientRect();const w=Math.min(r.width,r.height*9/16);world.style.width=`${w}px`;world.style.height=`${w*16/9}px`;users.forEach(positionBubble);}).observe(wrap);
new ResizeObserver(()=>users.forEach(positionBubble)).observe(world);
window.addEventListener('resize',viewport);window.visualViewport?.addEventListener('resize',viewport);window.visualViewport?.addEventListener('scroll',viewport);viewport();

function closeHelp(){$('helpOverlay').classList.add('hidden');}
$('helpOverlay').addEventListener('click',closeHelp);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHelp();});
