'use strict';
/* Interfaz en vuelo: HUD, radar, marcadores de objetivo y de rumbo, panel de escaneo, ayuda y estado RPG. */

let radarIdx=1, showHelp=!touchUI, helpT=0;   // escala del radar y ayuda inicial
const fmtN=v=>(v>=0?'+':'')+Math.round(v);
function drawRadar(){
  const small=cols<80, iw=small?19:25, ih=small?9:11, w=iw+2, h=ih+2;
  const c0=cols-w-1, r0=1;
  box(c0,r0,w,h,DIMC,'RADAR 1:'+RADAR[radarIdx]);
  for(let r=1;r<h-1;r++) for(let c=1;c<w-1;c++) put(c0+c,r0+r,' ',DIMC);
  const sc=RADAR[radarIdx], mc=c0+1+(iw>>1), mr=r0+1+(ih>>1);
  const rangeX=(iw/2+1)*sc, rangeY=(ih/2+1)*sc*RY;
  const sx0=sectorOf(ship.x-rangeX), sx1=sectorOf(ship.x+rangeX), sy0=sectorOf(ship.y-rangeY), sy1=sectorOf(ship.y+rangeY);
  const jam=g=>curRegK==='nebula'&&Math.hypot(g.x-ship.x,g.y-ship.y)>sc*5;
  const plot=(o,ch,col)=>{
    const dc=Math.round((o.x-ship.x)/sc), dr=Math.round((o.y-ship.y)/(sc*RY));
    if(Math.abs(dc)<=(iw>>1)&&Math.abs(dr)<=(ih>>1)) put(mc+dc,mr+dr,ch,col);
  };
  for(let sy=sy0;sy<=sy1;sy++) for(let sx=sx0;sx<=sx1;sx++){ const s=getSector(sx,sy); for(const a of s.rocks) plot(a,'.','hsl(30 12% 38%)'); }
  for(let sy=sy0;sy<=sy1;sy++) for(let sx=sx0;sx<=sx1;sx++){ const s=getSector(sx,sy);
    for(const p of s.planets) plot(p,p.type==='station'?'#':p.r>=20?'O':'o',`hsl(${p.h1|0} 70% 62%)`); }
  for(let sy=sy0;sy<=sy1;sy++) for(let sx=sx0;sx<=sx1;sx++){ for(const g of getSector(sx,sy).signals) jam(g)||plot(g,discovered.has(g.id)?'+':'?',discovered.has(g.id)?'hsl(200 30% 42%)':((t*2|0)%2?ACC:'hsl(36 70% 38%)')); }
  if(R.base){ const dc=Math.round((R.base.x-ship.x)/sc), dr=Math.round((R.base.y-ship.y)/(sc*RY)), hx=iw>>1, hy=ih>>1, bc=(t*2|0)%2?'hsl(140 75% 62%)':'hsl(140 50% 38%)';
    if(Math.abs(dc)<=hx&&Math.abs(dr)<=hy) put(mc+dc,mr+dr,'B',bc); else { const k=Math.max(Math.abs(dc)/hx,Math.abs(dr)/hy); put(mc+Math.round(dc/k),mr+Math.round(dr/k),'b',bc); } }
  { const o=wpObj(); if(o){ const dc=Math.round((o.x-ship.x)/sc), dr=Math.round((o.y-ship.y)/(sc*RY)), hx=iw>>1, hy=ih>>1, wc=(t*2|0)%2?'hsl(190 85% 66%)':'hsl(190 60% 42%)';
    if(Math.abs(dc)<=hx&&Math.abs(dr)<=hy) put(mc+dc,mr+dr,'*',wc); else { const k=Math.max(Math.abs(dc)/hx,Math.abs(dr)/hy); put(mc+Math.round(dc/k),mr+Math.round(dr/k),arrowCh(o.x-ship.x,o.y-ship.y),wc); } } }
  if(target&&(t*3|0)%2===0) plot(target,target.kind==='planet'?(target.type==='station'?'#':target.r>=20?'O':'o'):'.',ACC);
  for(const f of foes) plot(f,f.boss?'X':'x',(t*4|0)%2?'hsl(355 90% 62%)':'hsl(0 0% 85%)');
  const fx=Math.cos(ship.a), fy=Math.sin(ship.a);
  put(mc+Math.round(fx*1.6),mr+Math.round(fy*1.6/RY),NOSE[((Math.round(ship.a/(Math.PI/4))%8)+8)%8],DIMC);
  put(mc,mr,'@',ACC);
  text(c0+2,r0+h-1,' [R] escala ',DIMC,true);
}
let tmLbl=null;
let wpPx=null;   // posicion en pantalla de la flecha de rumbo
function wpWorld(){ wpPx=null; const o=wpObj(); if(!o) return; const d=Math.hypot(o.x-ship.x,o.y-ship.y);
  if(d<(o.r||10)+60){ toast('Llegaste: '+(o.name||R.wpt),3); R.wpt=null; wpCache=null; saveR(); return; }
  wpPx={px:ox0+(cols/2+(o.x-camx)*Z)*cw, py:oy0+(rows/2+(o.y-camy)/RY*Z)*chh, d, dx:o.x-ship.x, dy:o.y-ship.y, n:o.name||R.wpt}; }
function wpUI(){ if(!wpPx) return; const q=wpPx, cx=(q.px-ox0)/cw, cy=(q.py-oy0)/chh, hx=cols/2, hy=rows/2, col=(t*2|0)%2?'hsl(190 85% 66%)':'hsl(190 60% 42%)', lab=q.n+'  '+Math.round(q.d)+'u';
  if(cx>=3&&cx<=cols-4&&cy>=5&&cy<=rows-4){ text(clamp(Math.round(cx-lab.length/2),1,cols-lab.length-1),Math.round(cy)-3,lab,col); put(Math.round(cx),Math.round(cy)-2,'v',col); }
  else { const dx=cx-hx, dy=cy-hy, k=Math.min((hx-3)/Math.max(1e-6,Math.abs(dx)),(hy-4)/Math.max(1e-6,Math.abs(dy))), ex=Math.round(hx+dx*k), ey=Math.round(hy+dy*k);
    put(ex,ey,arrowCh(q.dx,q.dy),col); text(clamp(ex>hx?ex-lab.length-1:ex+2,1,cols-lab.length-1),ey,lab,col); } }
function drawTargetBrackets(){            // parentesis sobre el objetivo (capa del mundo)
  tmLbl=null; if(!target) return;
  const cx=cols/2+(target.x-camx)*Z, cy=rows/2+(target.y-camy)/RY*Z, rcx=target.r*Z;
  const col=(t*2.5|0)%2===0?ACC:'hsl(36 80% 45%)';
  put(Math.round(cx-rcx-2),Math.round(cy),'[',col); put(Math.round(cx+rcx+1),Math.round(cy),']',col);
  tmLbl={px:ox0+cx*cw,py:oy0+cy*chh,rpy:(rcx/RY)*chh};
}
function drawTargetLabel(){               // texto del objetivo (capa de interfaz, siempre legible)
  if(!target||!tmLbl) return;
  const cx=(tmLbl.px-ox0)/cw, cy=(tmLbl.py-oy0)/chh, rcy=tmLbl.rpy/chh;
  const known=discovered.has(target.id);
  let l1=target.name, l2;
  if(scanTarget===target&&scanP>0&&scanP<1){ const n=12, f=Math.round(scanP*n); l2='['+'#'.repeat(f)+'-'.repeat(n-f)+'] escaneando'; }
  else l2=(known?'(catalogado) ':'')+(touchUI?'':'[E] ')+'escanear';
  const dist=Math.round(Math.max(0,tdist));
  l2+='  '+dist+'u';
  const lc=clamp(Math.round(cx-l1.length/2),1,cols-Math.max(l1.length,l2.length)-1);
  const lr=clamp(Math.round(cy-rcy-2),2,rows-4);
  text(lc,lr,l1,known?HUDC:ACC); text(lc,lr+1,l2,DIMC);
}
function drawInfo(){
  if(!infoObj||infoT<=0) return;
  const o=infoObj, radarW=(cols<80?21:27)+2;
  const w=clamp(cols-radarW-3,24,40), inner=w-4;
  const lines=[];
  if(o.kind==='planet'){
    lines.push(o.name, TYPE_ES[o.type], '');
    lines.push('Radio     '+Math.round(o.r*118).toLocaleString('es')+' km');
    lines.push('Gravedad  '+o.grav.toFixed(2)+' g');
    lines.push('Temp.     '+(o.temp>0?'+':'')+o.temp+' °C');
    if(o.ring) lines.push('Anillos   sí');
    lines.push('');
    lines.push(...wrap(FLAVOR[o.type][o.fl],inner));
  } else if(o.kind==='signal'){
    lines.push(o.name, SIG[o.st].n, '', 'Sector    '+sectorOf(o.x)+':'+sectorOf(o.y), '');
    if(o.st==='anomaly') lines.push('Origen    DESCONOCIDO','Composic. ???','Señal     NO NATURAL','');
    else lines.push(...wrap(sigResult(o),inner),'',...wrap(SIG[o.st].d[o.seed%SIG[o.st].d.length],inner));
  } else {
    lines.push(o.name, o.rk==='rock'?'Asteroide rocoso':o.rk==='ice'?'Asteroide helado':'Asteroide metálico','');
    lines.push('Diámetro  ~'+Math.round(o.r*2*35)+' m','');
    lines.push(...wrap(FLAVOR[o.rk==='ice'?'ice2':o.rk==='rock'?'rock':'metal'][0],inner));
  }
  const h=lines.length+2, c0=1, r0=3;
  box(c0,r0,w,h,DIMC,'ESCANEO');
  for(let r=1;r<h-1;r++) for(let c=1;c<w-1;c++) put(c0+c,r0+r,' ',DIMC);
  lines.forEach((ln,i)=>text(c0+2,r0+1+i,ln,i===0?ACC:i===1?HUDC:'hsl(160 35% 66%)'));
}
function drawHelp(){
  if(!showHelp&&helpT<=0) return;
  const L=[' CONTROLES','',' W / flecha arriba    impulso',' A D / flechas        girar',' S / espacio          freno',' SHIFT                turbo (con impulso)',' E (mantener)         escanear',' Z                    asistencia de vuelo',' R                    escala del radar',' O  (o + / -)         tamano de simbolos',' F                    disparar (minar/combatir)',' G                    atracar en estacion',' L                    aterrizar / despegar',' Q                    cambiar arma',' M                    mapa de sectores',' C                    catalogo',' J                    bitacora de viaje',' I                    inventario y mercados conocidos',' B                    construir base / ver donde esta',' Y                    cronica: tu historia hasta ahora',' `  (o F2)            consola de comandos (pruebas)',' H                    ocultar esta ayuda'];
  const w=44, h=L.length+2, c0=Math.floor((cols-w)/2), r0=Math.max(2,Math.floor(rows*0.62)-Math.floor(h/2));
  box(c0,r0,w,h,DIMC,'');
  for(let r=1;r<h-1;r++) for(let c=1;c<w-1;c++) put(c0+c,r0+r,' ',DIMC);
  L.forEach((ln,i)=>text(c0+1,r0+1+i,ln,i===0?ACC:HUDC));
}
function drawHUD(){
  text(2,1,'SPACE',HUDC);
  text(2,2,'prototipo 0.3 archivo',DIMC);
  if(docked){ drawDock(); return; }
  drawRadar();
  drawInfo();
  drawTargetLabel(); wpUI();
  drawHelp(); drawRpgHud();
  const sp=Math.hypot(ship.vx,ship.vy);
  const bar=(()=>{ const n=14,f=Math.round(clamp(sp/460,0,1)*n); return '#'.repeat(f)+'-'.repeat(n-f); })();
  const deg=String(Math.round(((ship.a*180/Math.PI+90)%360+360)%360)).padStart(3,'0');
  let zone='espacio profundo', zd=320;
  for(const p of near.P){ const d=Math.hypot(p.x-ship.x,p.y-ship.y)-p.r; if(d<zd){ zd=d; zone='cerca de '+p.name; } }
  const lines=[
    `VEL ${String(Math.round(sp*3)).padStart(4)} km/s [${bar}]`,
    `RUMBO ${deg}  ASISTENCIA ${assist?'ON':'OFF'}`,
    `POS ${fmtN(ship.x)},${fmtN(ship.y)}  SECTOR ${sectorOf(ship.x)}:${sectorOf(ship.y)} [${sectorStats(sectorOf(ship.x),sectorOf(ship.y)).cls}]`,
    `ZONA ${zone}`,
    `CATALOGO ${discovered.size}`
  ];
  const base=rows-1-(touchUI?11:0)-lines.length+1;
  lines.forEach((ln,i)=>text(2,base+i,ln,i===4?ACC:HUDC));
  if(toastT>0){ const s='* '+toastMsg+' *'; text(Math.floor((cols-s.length)/2),Math.min(rows-3,Math.floor(rows*0.18)),s,ACC); }
}
function drawRpgHud(){
  const hm=hullMax(), f=Math.round(clamp(R.hull/hm,0,1)*14), b=rows-1-(touchUI?11:0)-5;
  const L=[[`CASCO [${'#'.repeat(f)+'-'.repeat(14-f)}] ${Math.ceil(R.hull)}/${hm}`,R.hull<hm*0.3?'hsl(355 85% 62%)':HUDC],
    [`NV ${R.lv}  XP ${R.xp}/${R.lv*60}  CR ${R.cr}`,HUDC],[`BODEGA ${Math.round(tot())}/${cap()}  COMP ${R.comp}`,HUDC],[`COMBUSTIBLE [${bar(R.fuel/100,10)}] ${Math.round(R.fuel)}`,R.fuel<20?'hsl(355 85% 62%)':HUDC],...(R.base?[[`BASE ${Math.round(Math.hypot(R.base.x-ship.x,R.base.y-ship.y))}u  ALM ${Math.floor(baseUsed())}/${baseCap()}`,DIMC]]:[]),...(curRegK?[['REGION '+REG[curRegK].n,`hsl(${REG[curRegK].hue} 60% 65%)`]]:[])];
  if(R.m) L.push([`MISION ${mT(R.m)}  +${R.m.rew} cr`,ACC]);
  if(R.st===1) L.push(['SENAL: viaja al sector 4:-3',ACC]); if(R.st===2) L.push(['ELIMINA al jefe pirata',ACC]);
  L.forEach(([s,c],i)=>text(2,b-L.length+1+i,s,c));
  if(foes.length&&(t*3|0)%2===0){ const s='! ALERTA PIRATAS !'; text(Math.floor((cols-s.length)/2),1,s,'hsl(355 85% 62%)'); }
  if(!docked&&near.P.some(p=>p.type==='station'&&Math.hypot(p.x-ship.x,p.y-ship.y)-p.r<36)){ const s=(touchUI?'':'[G] ')+'atracar (frena primero)'; text(Math.floor((cols-s.length)/2),Math.floor(rows*0.26),s,ACC); }
  if(!docked&&landable()){ const s=(touchUI?'':'[L] ')+'aterrizar (frena primero)'; text(Math.floor((cols-s.length)/2),Math.floor(rows*0.3),s,ACC); }
  if(docked) drawDock();
}
