'use strict';
/* Pestana MAPA del archivo: sectores con niebla de guerra. */

const seenSec=(sx,sy)=>{ for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) if(visited.has((sx+dx)+','+(sy+dy))) return true; return false; };
function drawMap(){
  const top=3, bot=rows-3, CW=cols>=110?11:9, CH=rows>=30?4:3, bw=cols-4;
  const [cx,cy]=archCur, mx=sectorOf(ship.x), my=sectorOf(ship.y), pk=new Set(Object.values(pings));
  const ikey=cx+','+cy, ivis=visited.has(ikey), dist=Math.max(Math.abs(cx-mx),Math.abs(cy-my));
  const estado=(cx===mx&&cy===my)?'SECTOR ACTUAL':ivis?'EXPLORADO':(R.st===1&&ikey==='4,-3')?'SEÑAL DETECTADA':pk.has(ikey)?'SEÑAL TRIANGULADA':seenSec(cx,cy)?'SIN EXPLORAR':'DESCONOCIDO';
  const info=[[`Estado ${estado}   Distancia ${dist} sector${dist===1?'':'es'}`,ACC]];
  if(ivis){ const st=sectorStats(cx,cy), objs=[...st.s.planets,...st.s.signals], sc=objs.filter(o=>discovered.has(o.id)).length;
    info.push([`Densidad ${st.cls}   Planetas ${st.pl}  Estaciones ${st.st}  Asteroides ${st.ro}  Señales ${st.sg}`,HUDC],[`Escaneado ${sc}/${objs.length} objetos (sin contar asteroides)`,HUDC]);
  } else info.push(['Sin datos. Vuela hasta allí para explorarlo.',DIMC]);
  info.push(['@ nave  [ ] cursor  O o planeta  # estacion  ? sin escanear  ! senal  X ruinas  * mision',DIMC]);
  const iLines=[]; info.forEach(([tx,co])=>wrap(tx,bw-4).forEach(l=>iLines.push([l,co])));
  const infoH=Math.min(iLines.length+2,Math.max(6,bot-top-CH)), areaH=bot-top-infoH;
  let nx=Math.floor(bw/CW), ny=Math.floor(areaH/CH); if(nx%2===0) nx--; if(ny%2===0) ny--; nx=Math.max(1,nx); ny=Math.max(1,ny);
  const gx0=2+((bw-nx*CW)>>1), hx=(nx-1)>>1, hy=(ny-1)>>1;
  const tg=R.m&&R.m.t==='explore'?[sectorOf(R.m.x),sectorOf(R.m.y)]:null, FA='hsl(165 18% 22%)', AMB='hsl(36 90% 55%)';
  const markOf=(sx,sy,key)=>(R.st===1&&key==='4,-3')?'!':(tg&&sx===tg[0]&&sy===tg[1])?'*':pk.has(key)?'!':null;
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){
    const sx=cx-hx+i, sy=cy-hy+j, key=sx+','+sy, x0=gx0+i*CW, y0=top+j*CH, vis=visited.has(key);
    hit(x0,y0,CW,CH,()=>{ archCur=[sx,sy]; });
    put(x0,y0,'+',FA);
    if(vis){
      const st=sectorStats(sx,sy), gl=[];
      text(x0+1,y0,sx+':'+sy,DIMC);
      for(const p of st.s.planets) gl.push(discovered.has(p.id)?[p.type==='station'?'#':p.r>=20?'O':'o',`hsl(${p.h1|0} 70% 62%)`]:['?',AMB]);
      for(const g of st.s.signals) gl.push(discovered.has(g.id)?[SIG[g.st].ch,`hsl(${SIG[g.st].hue} 45% 62%)`]:['?',AMB]);
      gl.slice(0,CW-2).forEach(([ch,co],q)=>put(x0+1+q,y0+1,ch,co));
      const ro=st.ro; text(x0+1,y0+2,ro===0?'':ro<8?'.':ro<20?'.:':ro<40?'.:.:':'.:.:.:','hsl(30 12% 42%)');
      if(sx===mx&&sy===my) put(x0+CW-2,y0,'@',ACC);
    } else {
      const mk=markOf(sx,sy,key);
      if(mk){ text(x0+1,y0,sx+':'+sy,DIMC); put(x0+(CW>>1),y0+1,mk,(t*2|0)%2?ACC:'hsl(36 70% 38%)'); }
      else if(seenSec(sx,sy)) put(x0+(CW>>1),y0+1,'?','hsl(165 28% 34%)');
      else put(x0+(CW>>1),y0+1,'.',FA);
    }
    if(sx===cx&&sy===cy){ put(x0,y0+1,'[',ACC); put(x0+CW-1,y0+1,']',ACC); }
  }
  // ficha del sector bajo el cursor
  const iy=bot-infoH; box(2,iy,bw,infoH,DIMC,'SECTOR '+cx+':'+cy);
  iLines.slice(0,infoH-2).forEach(([l,co],i)=>text(4,iy+1+i,l,co));
}
