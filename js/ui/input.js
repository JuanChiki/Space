'use strict';
/* Entrada: teclado, botonera tactil, raton (muelle, archivo, consola, rueda). */

const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'down',ShiftLeft:'shift',ShiftRight:'shift',KeyE:'scan',KeyF:'fire',KeyG:'dock',KeyL:'land'};
window.addEventListener('keydown',e=>{
  if(conOpen){
    if(e.code==='Escape'||e.code==='Backquote'||e.code==='F2') conOpen=false;
    else if(e.code==='Enter'){ const l=conBuf; if(l.trim()){ conHist.push(l); conHi=conHist.length; conLog.push('> '+l); conPush(conRun(l)); saveR(); } conBuf=''; }
    else if(e.code==='Backspace') conBuf=conBuf.slice(0,-1);
    else if(e.code==='ArrowUp'){ conHi=Math.max(0,conHi-1); conBuf=conHist[conHi]||''; }
    else if(e.code==='ArrowDown'){ conHi=Math.min(conHist.length,conHi+1); conBuf=conHist[conHi]||''; }
    else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey) conBuf+=e.key;
    e.preventDefault(); return; }
  if(optOpen){ optNav(e); e.preventDefault(); return; }
  if(invOpen){ if(e.code==='KeyI'||e.code==='Escape'||e.code==='Enter') invOpen=false; e.preventDefault(); return; }
  if(chrOpen){ if(e.code==='KeyY'||e.code==='Escape'||e.code==='Enter') chrOpen=false; e.preventDefault(); return; }
  if(archOpen){ if(archNav(e)) e.preventDefault(); return; }
  if(docked&&dockNav(e)){ e.preventDefault(); return; }
  const k=KEYMAP[e.code];
  if(k){ keys[k]=true; e.preventDefault(); return; }
  if(e.repeat) return;
  if(docked&&/^\d$/.test(e.key)) menuDo(+e.key);
  else if(e.code==='KeyQ') cycleW();
  else if(e.code==='KeyM') openArch(0);
  else if(e.code==='KeyC') openArch(1);
  else if(e.code==='KeyJ') openArch(2);
  else if(e.code==='Backquote'||e.code==='F2'){ conOpen=true; conBuf=''; for(const k in keys) keys[k]=false; e.preventDefault(); }
  else if(e.code==='KeyY'){ chrOpen=true; for(const k in keys) keys[k]=false; }
  else if(e.code==='KeyB') buildBase();
  else if(e.code==='KeyI'){ invOpen=true; for(const k in keys) keys[k]=false; }
  else if(e.code==='KeyZ'){ assist=!assist; toast('Asistencia de vuelo: '+(assist?'ON':'OFF'),2); }
  else if(e.code==='KeyR'){ radarIdx=(radarIdx+1)%RADAR.length; }
  else if(e.code==='KeyH'){ if(showHelp||helpT>0){ showHelp=false; helpT=0; } else helpT=12; }
  else if(e.code==='KeyO') openOpts();
  else if(e.key==='+'||e.key==='='||e.code==='NumpadAdd') setFs(userFs+1);
  else if(e.key==='-'||e.code==='NumpadSubtract') setFs(userFs-1);
});
window.addEventListener('keyup',e=>{ const k=KEYMAP[e.code]; if(k){ keys[k]=false; e.preventDefault(); } });
window.addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; });
document.querySelectorAll('#touch button').forEach(b=>{
  const k=b.dataset.k;
  const on=e=>{ keys[k]=true; b.classList.add('on'); try{ b.setPointerCapture(e.pointerId); }catch(_){} e.preventDefault(); };
  const off=e=>{ keys[k]=false; b.classList.remove('on'); e.preventDefault(); };
  b.addEventListener('pointerdown',on); b.addEventListener('pointerup',off); b.addEventListener('pointercancel',off); b.addEventListener('lostpointercapture',off);
});
document.querySelector('#touch button[data-k="opts"]').addEventListener('pointerdown',()=>openOpts());
document.querySelector('#touch button[data-k="map"]').addEventListener('pointerdown',()=>openArch(0));
document.querySelector('#touch button[data-k="chr"]').addEventListener('pointerdown',()=>{ chrOpen=!chrOpen; });
document.querySelector('#touch button[data-k="con"]').addEventListener('pointerdown',()=>{ const v=prompt('Comando (escribe ayuda):'); if(v){ toast(conRun(v)||'-',5); saveR(); } });
document.querySelector('#touch button[data-k="base"]').addEventListener('pointerdown',()=>{ buildBase(); });
document.querySelector('#touch button[data-k="inv"]').addEventListener('pointerdown',()=>{ invOpen=!invOpen; });
document.querySelector('#touch button[data-k="cat"]').addEventListener('pointerdown',()=>openArch(1));
cv.addEventListener('pointermove',e=>{ const i=dockRow(e); if(i>=0) sel=i; });
cv.addEventListener('wheel',e=>{ if(!archOpen) return; e.preventDefault(); const d=Math.sign(e.deltaY); if(archTab===1) archSel=clamp(archSel+d,0,Math.max(0,archList.length-1)); else if(archTab===2) logScroll=Math.max(0,logScroll+d*3); },{passive:false});
cv.addEventListener('pointerdown',e=>{ if(invOpen){ invOpen=false; return; } if(chrOpen){ chrOpen=false; return; } if(archOpen){ archClick(e); return; } if(optOpen){ optClick(e); return; } const i=dockRow(e); if(i>=0){ sel=i; menuDo(i<dockGeo.n-1?i+1:0); } });
