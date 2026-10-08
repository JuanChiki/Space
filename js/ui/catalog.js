'use strict';
/* Pestana CATALOGO del archivo: lo descubierto y su ficha. */

const CATS=['TODO','PLANETAS','ESTACIONES','ASTEROIDES','SEÑALES'], CATS_S=['TODO','PLAN','EST','AST','SEÑ'], CAT_TAG=['','PLA','EST','AST','SEÑ'];
const catOf=o=>o.kind==='signal'?4:o.kind==='rock'?3:o.type==='station'?2:1;
function catEntries(){ const out=[]; [...discovered].forEach((id,i)=>{ const e=resolveObj(id); if(e){ e.n=i+1; out.push(e); } }); return out.reverse(); }
function applyFilt(){ archList=archFilt?archAll.filter(e=>catOf(e.o)===archFilt):archAll; archSel=clamp(archSel,0,Math.max(0,archList.length-1)); }
function detailLines(e,w){
  const o=e.o, L=[], P=(s,c)=>L.push([s,c||HUDC]), sec=e.sx+':'+e.sy;
  P(o.name,ACC);
  if(o.kind==='planet'){
    P(TYPE_ES[o.type],HUDC); P('');
    P('Sector     '+sec); P('Estado     '+(o.type==='station'?'Localizada':landed.has(o.id)?'Explorado (aterrizaje)':'Escaneado'));
    if(o.type==='station'){
      P(''); P('MEJOR PRECIO DE VENTA',ACC);
      GK.map(g=>[g,price(o,g)/GOODS[g][1]]).sort((a,b)=>b[1]-a[1]).slice(0,3).forEach(([g,m])=>P(GOODS[g][0].padEnd(9)+'['+bar((m-0.5)/1.5,8)+'] '+price(o,g)+' cr'));
      P(''); wrap(FLAVOR.station[o.fl%3],w).forEach(l=>P(l,'hsl(160 35% 66%)'));
    } else {
      P('Radio      '+Math.round(o.r*118).toLocaleString('es')+' km'); P('Gravedad   '+o.grav.toFixed(2)+' g'); P('Temp.      '+(o.temp>0?'+':'')+o.temp+' °C');
      P('Atmósfera  '+(o.atmo!=null?'Presente':'No detectada')); P('Anillos    '+(o.ring?'Sí':'No'));
      P(''); P('RECURSOS',ACC); const cnt={}; PRES[o.type].forEach(g=>cnt[g]=(cnt[g]||0)+1);
      Object.entries(cnt).sort((a,b)=>b[1]-a[1]).forEach(([g,c])=>P(GOODS[g][0].padEnd(9)+'['+bar(c/3,10)+']',`hsl(${GOODS[g][2]} 55% 66%)`));
      P(''); wrap(FLAVOR[o.type][o.fl],w).forEach(l=>P(l,'hsl(160 35% 66%)'));
    }
  } else if(o.kind==='rock'){
    P(o.rk==='rock'?'Asteroide rocoso':o.rk==='ice'?'Asteroide helado':'Asteroide metálico'); P('');
    P('Sector     '+sec); P('Diámetro   ~'+Math.round(o.r*2*35)+' m'); P('Contiene   '+GOODS[o.rk][0]); P('');
    wrap(FLAVOR[o.rk==='ice'?'ice2':o.rk==='rock'?'rock':'metal'][0],w).forEach(l=>P(l,'hsl(160 35% 66%)'));
  } else {
    P(SIG[o.st].n); P(''); P('Sector     '+sec); P('Resultado  '+sigResult(o).slice(0,Math.max(10,w-11)));
    if(o.st==='anomaly'){ P(''); ['   /\\','  /  \\',' | ?? |','  \\  /','   \\/'].forEach(l=>P(l,`hsl(275 60% 66%)`)); P(''); P('Origen      DESCONOCIDO'); P('Composición ???'); P('Señal       NO NATURAL'); }
    else { P(''); wrap(SIG[o.st].d[o.seed%SIG[o.st].d.length],w).forEach(l=>P(l,'hsl(160 35% 66%)')); }
  }
  return L;
}
function drawCatalog(){
  const top=3, bot=rows-3, cnt=[0,0,0,0,0]; for(const e of archAll){ cnt[catOf(e.o)]++; cnt[0]++; }
  text(2,top,`DESCUBIERTO  planetas ${cnt[1]}  estaciones ${cnt[2]}  asteroides ${cnt[3]}  señales ${cnt[4]}  sectores ${visited.size}`.slice(0,cols-4),HUDC);
  let x=2; (cols>=84?CATS:CATS_S).forEach((nm,i)=>{ const on=archFilt===i, s=(on?'[':' ')+nm+' '+cnt[i]+(on?']':' '); text(x,top+1,s,on?ACC:DIMC,true); hit(x,top+1,s.length,1,()=>{ archFilt=i; archSel=0; applyFilt(); }); x+=s.length+1; });
  const y0=top+3, H=bot-y0, wide=cols>=76, lw=wide?Math.min(46,Math.floor((cols-5)*0.45)):cols-4, lh=wide?H:Math.max(6,Math.floor(H*0.5));
  box(2,y0,lw,lh,DIMC,'REGISTROS '+(archList.length?(archSel+1)+'/'+archList.length:'0'));
  const vis=lh-2, first=clamp(archSel-(vis>>1),0,Math.max(0,archList.length-vis));
  if(!archList.length){ text(4,y0+2,'Nada catalogado todavía.',DIMC); text(4,y0+3,(touchUI?'Usa el boton escanear.':'Escanea objetos con [E].'),DIMC); }
  for(let k=0;k<vis&&first+k<archList.length;k++){
    const idx=first+k, e=archList[idx], on=idx===archSel, y=y0+1+k;
    text(4,y,((on?'> ':e.id===R.wpt?'* ':'  ')+String(e.n).padStart(3,'0')+' '+e.o.name).slice(0,lw-13),on?ACC:HUDC);
    text(2+lw-8,y,CAT_TAG[catOf(e.o)],on?ACC:DIMC);
    hit(2,y,lw,1,()=>{ archSel=idx; });
  }
  if(archList.length>vis){ text(2+lw-4,y0+1,'[^]',HUDC); hit(2+lw-4,y0+1,3,1,()=>{ archSel=Math.max(0,archSel-5); }); text(2+lw-4,y0+lh-2,'[v]',HUDC); hit(2+lw-4,y0+lh-2,3,1,()=>{ archSel=Math.min(archList.length-1,archSel+5); }); }
  const dx=wide?2+lw+1:2, dy=wide?y0:y0+lh, dw=wide?cols-4-lw-1:cols-4, dh=wide?H:H-lh;
  box(dx,dy,dw,dh,DIMC,'DETALLE');
  if(archList[archSel]) detailLines(archList[archSel],dw-4).slice(0,Math.max(1,dh-5)).forEach(([s,co],i)=>text(dx+2,dy+1+i,s.slice(0,dw-4),co));
  { const e=archList[archSel]; if(e){ const dxw=e.o.x-ship.x, dyw=e.o.y-ship.y, mk=R.wpt===e.id, yy=dy+dh-3, lb=mk?'[ QUITAR RUMBO ]':'[ MARCAR RUMBO ]';
    text(dx+2,yy,('Distancia '+Math.round(Math.hypot(dxw,dyw))+' u   Direccion '+dirName(dxw,dyw)+'   Sector '+e.sx+':'+e.sy).slice(0,dw-4),HUDC);
    text(dx+2,yy+1,lb+(touchUI?'':'  (ENTER)'),mk?'hsl(190 85% 66%)':ACC,true); hit(dx+2,yy+1,lb.length,1,()=>toggleWp(e)); } }
}
