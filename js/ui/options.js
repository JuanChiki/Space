'use strict';
/* Menu de opciones: tamano de simbolos. Incluye la persistencia de esa preferencia. */

let optOpen=false, optSel=0, optGeo=null;
try{ const o=JSON.parse(localStorage.getItem('vacio_opts')||'null'); if(o&&+o.fs) userFs=Math.round(Math.min(FS_MAX,Math.max(FS_MIN,+o.fs))); }catch(e){}
const saveOpts=()=>{ try{ localStorage.setItem('vacio_opts',JSON.stringify({fs:userFs})); }catch(e){} };
const FS_PRE=[()=>FS_MIN,()=>Math.max(FS_MIN,BASE_FS-3),()=>BASE_FS,()=>Math.min(FS_MAX,BASE_FS+3)];   // Mini (1/4 de celda), Peq., Normal, Grande
const PRE_NAMES=['Mini','Peq.','Normal','Grande'], PRE_OFF=[9,16,23,32];
function setFs(v){ const n=Math.round(Math.min(FS_MAX,Math.max(FS_MIN,v))); if(n===userFs) return; userFs=n; saveOpts(); setup(); }
function openOpts(){ optOpen=true; optSel=0; for(const k in keys) keys[k]=false; }
function closeOpts(){ optOpen=false; }
function presetIdx(){ let b=0,bd=1e9; FS_PRE.forEach((f,i)=>{ const d=Math.abs(f()-userFs); if(d<bd){ bd=d; b=i; } }); return bd===0?b:-1; }
function optAct(dir){          // dir: -1 / +1 (izq/der) o 0 (enter)
  if(optSel===0){ if(dir) setFs(userFs+dir); }
  else if(optSel===1){ const i=presetIdx(); const n=dir?Math.min(3,Math.max(0,(i<0?(dir>0?0:3):i)+dir)):(i+1+4)%4; setFs(FS_PRE[n]()); }
  else if(optSel===2){ if(!dir) setFs(BASE_FS); }
  else if(optSel===3){ if(!dir) closeOpts(); }
}
function optNav(e){
  const c=e.code;
  if(c==='Escape'||c==='KeyO'){ if(!e.repeat) closeOpts(); }
  else if(c==='ArrowUp'||c==='KeyW') optSel=(optSel+3)%4;
  else if(c==='ArrowDown'||c==='KeyS') optSel=(optSel+1)%4;
  else if(c==='ArrowLeft'||c==='KeyA'||c==='Minus'||c==='NumpadSubtract') { if(c==='Minus'||c==='NumpadSubtract') setFs(userFs-1); else optAct(-1); }
  else if(c==='ArrowRight'||c==='KeyD'||c==='Equal'||c==='NumpadAdd') { if(c==='Equal'||c==='NumpadAdd') setFs(userFs+1); else optAct(1); }
  else if(c==='Enter'||c==='Space'){ if(!e.repeat) optAct(0); }
  else if(c==='Digit0'||c==='Numpad0') setFs(BASE_FS);
}
function optClick(e){
  if(!optGeo) return; const b=cv.getBoundingClientRect();
  const c=Math.floor((e.clientX-b.left-ox0U)/cwU), r=Math.floor((e.clientY-b.top-oy0U)/chhU), g=optGeo;
  if(c<g.c0||c>=g.c0+g.w||r<g.r0||r>=g.r0+g.h){ closeOpts(); return; }
  const mid=g.c0+(g.w>>1);
  if(r>=g.size-1&&r<=g.size+1){ optSel=0; optAct(c<mid?-1:1); }
  else if(r===g.pre){ optSel=1; let k=0; PRE_OFF.forEach((o,i)=>{ if(c-g.c0-2>=o-1) k=i; }); setFs(FS_PRE[k]()); }
  else if(r===g.reset){ optSel=2; optAct(0); }
  else if(r===g.close){ optSel=3; optAct(0); }
}
function drawOptions(){
  const W=Math.min(cols-2,46), h=15, c0=Math.floor((cols-W)/2), r0=Math.max(1,Math.floor((rows-h)/2));
  box(c0,r0,W,h,DIMC,'OPCIONES');
  for(let r=1;r<h-1;r++) for(let c=1;c<W-1;c++) put(c0+c,r0+r,' ',DIMC);
  const sel=i=>optSel===i, col=i=>sel(i)?ACC:HUDC, mk=i=>sel(i)?'> ':'  ', x=c0+2;
  const tag=userFs===BASE_FS?'(normal)':userFs<=FS_MIN?'(minimo: 1/4)':userFs<BASE_FS?'(mas pequeno)':'(mas grande)';
  text(x,r0+2,mk(0)+'TAMANO DE SIMBOLOS',col(0));
  text(x,r0+4,'   [ - ]   '+String(userFs).padStart(2)+' px   [ + ]  '+tag,col(0));
  const n=Math.round((userFs-FS_MIN)/(FS_MAX-FS_MIN)*(W-10));
  text(x+2,r0+6,'['+'#'.repeat(n)+'-'.repeat(W-10-n)+']',sel(0)?ACC:DIMC);
  const pi=presetIdx(), names=PRE_NAMES;
  text(x,r0+8,mk(1)+'ATAJOS',col(1));
  names.forEach((nm,i)=>text(x+PRE_OFF[i]-1,r0+8,(pi===i?'['+nm+']':' '+nm+' '),pi===i?ACC:(sel(1)?HUDC:DIMC)));
  text(x,r0+10,mk(2)+'Restablecer a normal ('+BASE_FS+' px)',col(2));
  text(x,r0+11,mk(3)+'Cerrar',col(3));
  if(capped) text(x,r0+12,'Limitado a '+fs+' px por rendimiento',ACC);
  else text(x,r0+12,'La interfaz siempre se lee igual',DIMC);
  text(x,r0+13,(touchUI?'toca [ - ] o [ + ] / un atajo':'[A/D] cambiar [W/S] mover [O] cerrar').slice(0,W-4),DIMC);
  optGeo={c0,r0,w:W,h,size:r0+4,pre:r0+8,reset:r0+10,close:r0+11};
}
