'use strict';
/* Pestana BITACORA del archivo: diario de viaje. */

function drawLog(){
  const top=3, bot=rows-3, w=cols-4, inner=w-6;
  box(2,top,w,bot-top,DIMC,'BITACORA DE VIAJE ('+logBook.length+')');
  const L=[]; let day=-1;
  for(let i=logBook.length-1;i>=0;i--){
    const e=logBook[i]; if(e.d!==day){ day=e.d; if(L.length) L.push(['','']); L.push(['DIA '+day,ACC]); }
    const tm=String(Math.floor(e.s/60)).padStart(2,'0')+':'+String(e.s%60).padStart(2,'0');
    wrap(e.x,inner-8).forEach((ln,k)=>L.push([(k?'       ':tm+'  ')+ln,HUDC]));
  }
  if(!L.length) L.push(['Todavía no hay registros.',DIMC],['Explora, escanea, aterriza: el universo recuerda lo que haces.',DIMC]);
  const vis=bot-top-2; logScroll=clamp(logScroll,0,Math.max(0,L.length-vis));
  L.slice(logScroll,logScroll+vis).forEach(([s,co],i)=>text(4,top+1+i,s,co));
  if(L.length>vis){ text(cols-8,top+1,'[^]',HUDC); hit(cols-8,top+1,3,1,()=>{ logScroll=Math.max(0,logScroll-6); }); text(cols-8,bot-2,'[v]',HUDC); hit(cols-8,bot-2,3,1,()=>{ logScroll+=6; }); }
}
