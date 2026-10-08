'use strict';
/* Archivo (teclas M / C / J): cascaron comun del mapa, el catalogo y la bitacora; estado, teclado y clics. */

let archOpen=false, archTab=0, archSel=0, archFilt=0, archCur=[0,0], aHit=[], archAll=[], archList=[], logScroll=0;
function setTab(i){ archTab=i; if(i===1){ archAll=catEntries(); applyFilt(); } }
function openArch(tab){
  archOpen=true; archCur=[sectorOf(ship.x),sectorOf(ship.y)]; archSel=0; archFilt=0; logScroll=0;
  for(const k in keys) keys[k]=false; touchEl.style.visibility='hidden'; archAll=catEntries(); applyFilt(); setTab(tab);
}
function closeArch(){ archOpen=false; touchEl.style.visibility=''; }
function archNav(e){
  if(e.ctrlKey||e.metaKey||e.altKey) return false;
  const k=e.code;
  if(k==='Escape'||k==='KeyX'){ closeArch(); return true; }
  if(k==='Tab'){ setTab((archTab+(e.shiftKey?2:1))%3); return true; }
  if(/^[123]$/.test(e.key)){ setTab(+e.key-1); return true; }
  if(k==='KeyM'||k==='KeyC'||k==='KeyJ'){ const i=k==='KeyM'?0:k==='KeyC'?1:2; if(archTab===i) closeArch(); else setTab(i); return true; }
  const dx=((k==='ArrowRight'||k==='KeyD')?1:0)-((k==='ArrowLeft'||k==='KeyA')?1:0), dy=((k==='ArrowDown'||k==='KeyS')?1:0)-((k==='ArrowUp'||k==='KeyW')?1:0), pg=k==='PageDown'?1:k==='PageUp'?-1:0;
  if(archTab===0){
    if(dx||dy){ archCur=[archCur[0]+dx,archCur[1]+dy]; return true; }
    if(k==='Space'||k==='Digit0'||k==='Home'||k==='Enter'){ archCur=[sectorOf(ship.x),sectorOf(ship.y)]; return true; }
  } else if(archTab===1){
    if(k==='Enter'||k==='KeyG'){ if(archList[archSel]) toggleWp(archList[archSel]); return true; }
    if(dx){ archFilt=(archFilt+dx+5)%5; archSel=0; applyFilt(); return true; }
    if(dy||pg){ archSel=clamp(archSel+dy+pg*8,0,Math.max(0,archList.length-1)); return true; }
  } else if(dy||pg){ logScroll=Math.max(0,logScroll+dy*3+pg*10); return true; }
  return false;
}
function archClick(e){
  const b=cv.getBoundingClientRect(), cc=Math.floor((e.clientX-b.left-ox0U)/cwU), rr=Math.floor((e.clientY-b.top-oy0U)/chhU);
  for(let i=aHit.length-1;i>=0;i--){ const h=aHit[i]; if(cc>=h.c&&cc<h.c+h.w&&rr>=h.r&&rr<h.r+h.h){ h.fn(); return; } }
}
const hit=(c,r,w,h,fn)=>aHit.push({c,r,w,h,fn});
function drawArchive(){
  aHit=[];
  for(let c=0;c<cols;c++){ put(c,0,'=',DIMC); put(c,2,'=',DIMC); put(c,rows-3,'-',DIMC); }
  text(2,0,'[ SPACE // ARCHIVO ]',ACC,true);
  const cl='[X] cerrar'; text(cols-cl.length-2,0,cl,HUDC,true); hit(cols-cl.length-2,0,cl.length,1,closeArch);
  let x=2; ['MAPA','CATALOGO','BITACORA'].forEach((nm,i)=>{ const on=archTab===i, s=(on?'[':' ')+' '+(i+1)+' '+nm+' '+(on?']':' '); text(x,1,s,on?ACC:DIMC,true); hit(x,1,s.length,1,()=>setTab(i)); x+=s.length+1; });
  [drawMap,drawCatalog,drawLog][archTab]();
  const hp=touchUI?'toca una casilla, entrada o pestana':['[flechas] mover cursor  [espacio] centrar en tu nave  [TAB] pestana  [ESC] cerrar','[W/S] elegir  [A/D] filtrar  [ENTER] rumbo  [TAB] pestana  [ESC] cerrar','[W/S] desplazar  [TAB] pestana  [ESC] cerrar'][archTab];
  text(2,rows-2,hp.slice(0,cols-4),DIMC);
}
