(function(){
const W=116,H=62;
let grid=Array.from({length:H},()=>Array(W).fill(' ')),colors=Array.from({length:H},()=>Array(W).fill('#808080'));
let seed=496731;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function put(x,y,ch,color){if(x>=0&&x<W&&y>=0&&y<H){grid[y][x]=ch;colors[y][x]=color}}
function str(x,y,t,color){[...t].forEach((ch,i)=>put(x+i,y,ch,color))}
function building(x,top,w,baseColor,frontColor){
 for(let y=top;y<H;y++)for(let i=x;i<x+w;i++){const n=random();put(i,y,n<.1?'▓':n<.4?'▒':n<.7?'░':'▥',baseColor)}
 str(x,top-1,'▄'.repeat(w),frontColor);
 for(let y=top;y<H;y++){put(x,y,'║',frontColor);put(x+w-1,y,'║',frontColor)}
 for(let y=top+2;y<H-2;y+=4)for(let i=x+2;i<x+w-3;i+=5){
 let lit=random()>.77;
 str(i,y,'╔══╗',lit?'#808040':frontColor);
 str(i,y+1,lit?'║▒▒║':'║▓▓║',lit?'#808040':'#004040');
 str(i,y+2,'╚══╝',frontColor)
 }
}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const p=random();put(x,y,p<.04?'.':p<.065?'·':' ',p<.015?'#C0C0C0':'#808080')
}
[[0,25,12],[10,20,14],[22,26,13],[33,18,11],[43,23,16],[56,15,11],[66,23,15],[79,18,10],[88,24,13],[99,19,17]].forEach(([x,y,w])=>building(x,y,w,'#004040','#808080'));
building(0,32,27,'#808080','#C0C0C0');
building(88,30,28,'#808080','#C0C0C0');
building(27,40,28,'#004040','#808080');
building(61,42,27,'#004040','#808080');
for(let x=3;x<25;x+=3){put(x,30,'┬','#C0C0C0');put(x,31,'│','#C0C0C0')}
str(2,32,'╞══════════════════════╡','#C0C0C0');
str(89,29,'┬─┬─┬─┬─┬─┬─┬─┬─┬','#C0C0C0');
str(89,30,'╞════════════════════╡','#C0C0C0');
for(let y=37;y<56;y+=6){
 str(19,y,'╔══════╗','#C0C0C0');str(19,y+1,'║//////║','#808080');str(19,y+2,'╚══╦═══╝','#C0C0C0');
 str(90,y,'╔══════╗','#C0C0C0');str(90,y+1,'║//////║','#808080');str(90,y+2,'╚══╦═══╝','#C0C0C0');
}
for(let y=39;y<59;y++){put(26,y,'╲','#C0C0C0');put(91,y,'╱','#C0C0C0')}
for(let y=17;y<29;y++)put(103,y,'│','#808080');
str(100,20,'──┼──','#C0C0C0');put(103,16,'◆','#FF0000');
str(38,38,'┌──────┐','#C0C0C0');str(38,39,'│≡≡≡≡≡≡│','#808080');
str(68,40,'┌──────┐','#C0C0C0');str(68,41,'│≡≡≡≡≡≡│','#808080');
str(25,29,'╲__________________','#808080');
str(80,30,'___________________╱','#808080');
for(let x=0;x<W;x++)put(x,58,'═','#C0C0C0');
for(let y=59;y<H;y++)for(let x=0;x<W;x++)put(x,y,random()<.6?'▓':'▒','#808080');
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
let html='';
for(let y=0;y<H;y++){let last='';for(let x=0;x<W;x++){const color=colors[y][x];if(color!==last){if(last)html+='</span>';html+='<span style="color:'+color+'">';last=color}html+=esc(grid[y][x])}if(last)html+='</span>';html+='\n'}
document.getElementById('loadingSkyline').innerHTML=html;
})();
// Preserve a single composition; resize the frame rather than reflowing the ASCII.
(function(){
 const screen=document.getElementById('loadingScreen');
 const frame=document.getElementById('loadingArtFrame');
 const scene=frame.querySelector('.loading-scene');
 const shell=frame.parentElement;
 function fit(){
  if(screen.classList.contains('hidden'))return;
  const v=window.visualViewport;
  const availableWidth=Math.max(1,Math.min(740,(v?.width||innerWidth)-32));
  const availableHeight=Math.max(1,(v?.height||innerHeight)-140);
  const scale=Math.min(1,availableWidth/740,availableHeight/642);
  frame.style.width=`${740*scale}px`;
  frame.style.height=`${642*scale}px`;
  scene.style.transform=`scale(${scale})`;
  shell.style.width=`${740*scale}px`;
 }
 new MutationObserver(fit).observe(screen,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',fit);
 window.visualViewport?.addEventListener('resize',fit);
 fit();
})();
