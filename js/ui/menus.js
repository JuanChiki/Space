'use strict';
/* Menus de la estacion: servicios, mercado y hangar. Navegacion por teclado y raton. */

const wideDock=()=>cols>=84&&rows>=31;   // pantalla ancha: el muelle muestra la mision a un lado
let menuMsg='', dockGeo=null;
let dockPage=0;
let mkMode=0;
function menuItems(){
  if(docked&&docked.isBase) return baseItems();
  const u=R.u, up=i=>`${UP[i][1].padEnd(11)} Nv${u[UP[i][0]]} ${u[UP[i][0]]>=5?'MAX':cost(UP[i][0])+'cr'+(cn(UP[i][0])?'+'+cn(UP[i][0])+'c':'')}`;
  if(dockPage===5) return [...Object.keys(PARTS).map(id=>`${PARTS[id].s.padEnd(7)}${PARTS[id].n.padEnd(15)}${R.fit[PARTS[id].s]===id?'[ON]':PARTS[id].cr+'+'+PARTS[id].c+'c'}`),'Volver'];
  if(dockPage===3) return [...SC[profOf(docked).f].o.map(o=>o.l),'Volver'];
  if(dockPage===2){ const by=mkMode>=2, q=mkMode%2?5:1;
    const ev=evOf(docked);
    return [(by?'COMPRAR':'VENDER')+' x'+q+'  (cambiar modo)',`Vender todo = ${sellAll(false)} cr`,...GK.map(g=>`${GOODS[g][0].padEnd(8)} x${String(Math.round(R.cg[g]||0)).padEnd(3)} ${by?buyP(docked,g):price(docked,g)} cr${ev&&ev.g===g?(ev.m>1?' ^ESCASEZ':' vEXCEDENTE'):''}`),`Componentes x${R.comp}  ${compP(docked)} cr`,'Volver']; }
  if(dockPage) return [...WP.map((w,i)=>`${w.n.padEnd(8)} ${R.wp===i?'[equipada]':R.ow[i]?'(tuya)':w.p+' cr'}`),...SHP.map((x,i)=>`Nave ${x.n.padEnd(10)} ${R.sh===i?'[activa]':R.os[i]?'(tuya)':x.p+' cr'}`),'Volver'];
  return [`Combustible ${Math.round(R.fuel)}/100  ${fuelP(docked).toFixed(1)}cr/u`,`Reparar casco  ${(2*(1-disc(docked))).toFixed(1)}cr/pt`,up(0),up(1),up(2),up(3),wideDock()?(R.m?'Mision en curso':'Aceptar mision +'+offer.rew+' cr'):(R.m?'Mision activa: '+mT(R.m):'Mision: '+mT(offer)+' +'+offer.rew),'Mercado: comprar / vender','Hangar: armas y naves',npcLbl(),'Taller: piezas de nave','Zarpar'];
}
function menuDo(i){
  if(docked&&docked.isBase) return baseDo(i);
  const u=R.u; let m='';
  if(dockPage===5){ if(i===0){ dockPage=0; return; } const id=Object.keys(PARTS)[i-1], P=PARTS[id]; if(!P) return;
    if(R.fit[P.s]===id) menuMsg='Ya instalada'; else if(R.cr<P.cr) menuMsg='Faltan creditos'; else if(R.comp<P.c) menuMsg='Faltan componentes (Mercado)';
    else { R.cr-=P.cr; R.comp-=P.c; R.fit[P.s]=id; R.hull=Math.min(R.hull,hullMax()); menuMsg=P.n+' instalada: '+P.d; } saveR(); return; }
  if(dockPage===3){ if(i===0){ dockPage=0; return; } const o=SC[profOf(docked).f].o[i-1]; if(!o) return;
    if(R.npc[npcK(docked)]){ menuMsg='Ya no hay nada mas que hablar'; return; }
    const r=o.fn(); if(r[0]==='!'){ menuMsg=r.slice(1); return; }
    R.npc[npcK(docked)]=1; menuMsg=r; logEv(docked.name+': '+r); dockPage=0; saveR(); return; }
  if(dockPage===2){ if(i===0){ dockPage=0; return; }
    if(i===1){ mkMode=(mkMode+1)%4; return; }
    if(i===2){ const v=sellAll(true); menuMsg=v?'Vendido: +'+v+' cr':'Nada que vender'; snap(docked); saveR(); return; }
    if(i===11){ const q=mkMode%2?5:1, c=compP(docked); let n=0; for(let j=0;j<q&&R.cr>=c;j++){ R.cr-=c; R.comp++; n++; } menuMsg=n?'Componentes +'+n+' -'+n*c+' cr':'Faltan creditos'; saveR(); return; }
    const g=GK[i-3], by=mkMode>=2, q=mkMode%2?5:1; let n=0,v=0;
    for(let j=0;j<q;j++){
      if(by){ const c=buyP(docked,g); if(tot()+1>cap()){ menuMsg=n?menuMsg:'Bodega llena'; break; } if(R.cr<c){ menuMsg=n?menuMsg:'Faltan creditos'; break; } R.cr-=c; R.cg[g]=(R.cg[g]||0)+1; pushMk(docked,g,-1); n++; v+=c; }
      else { if((R.cg[g]||0)<1){ menuMsg=n?menuMsg:'No tienes '+GOODS[g][0]; break; } const c=price(docked,g); R.cr+=c; R.cg[g]--; pushMk(docked,g,1); n++; v+=c; gain(1); }
    }
    if(n) tradeRep(docked,n);
    if(n) menuMsg=(by?'Comprado ':'Vendido ')+n+' '+GOODS[g][0]+(by?' -':' +')+v+' cr';
    snap(docked); saveR(); return; }
  if(dockPage){ if(i===0){ dockPage=0; return; } const k=i-1, w=k<WP.length, A=w?WP:SHP, ow=w?R.ow:R.os, j=w?k:k-WP.length;
    if(!ow[j]){ if(R.cr>=A[j].p){ R.cr-=A[j].p; ow[j]=1; } else { menuMsg='Faltan creditos'; return; } }
    if(w) R.wp=j; else { R.sh=j; R.hull=Math.min(R.hull,hullMax()); } menuMsg=A[j].n+' equipado'; saveR(); return; }
  if(i===0){ docked=null; return; }
  if(i===1){ const fp=fuelP(docked), n=Math.min(Math.ceil(100-R.fuel),Math.floor(R.cr/fp)); if(n>0){ R.fuel=Math.min(100,R.fuel+n); R.cr-=Math.ceil(n*fp); m='Combustible +'+n; } else m=R.fuel>=100?'Tanque lleno':'Sin creditos'; }
  else if(i===2){ const rt=Math.max(1,2*(1-disc(docked))), n=Math.min(Math.ceil(hullMax()-R.hull),Math.floor(R.cr/rt)); if(n>0){ R.hull+=n; R.cr-=Math.ceil(n*rt); m='Casco reparado +'+n; } else m=R.hull>=hullMax()?'Casco intacto':'Sin creditos'; }
  else if(i<=6){ const k=UP[i-3][0]; if(u[k]>=5) m='Nivel maximo'; else if(R.cr<cost(k)) m='Faltan creditos'; else if(R.comp<cn(k)) m='Faltan componentes (Mercado)'; else { R.cr-=cost(k); R.comp-=cn(k); u[k]++; if(k==='hull') R.hull+=40; m=UP[i-3][1]+' instalado'; } }
  else if(i===7){ if(R.m) m='Ya tienes una mision activa'; else { R.m=Object.assign({have:0},offer); if(offer.t==='boss') spawnBoss(); m='Mision aceptada'; } }
  else if(i===8) dockPage=2; else if(i===9) dockPage=1; else if(i===11){ dockPage=5; m='Una pieza por ranura. Instalar reemplaza la anterior.'; } else if(i===10){ if(R.npc[npcK(docked)]) m='Nadie mas quiere hablar hoy'; else { dockPage=3; m=SC[profOf(docked).f].t; } }
  menuMsg=m||menuMsg; if(docked) snap(docked); saveR();
}
let sel=0, lastPg=0;
function dockNav(e){
  const n=menuItems().length;
  if(e.code==='ArrowUp'||e.code==='KeyW') sel=(sel+n-1)%n;
  else if(e.code==='ArrowDown'||e.code==='KeyS') sel=(sel+1)%n;
  else if(e.code==='Enter'||e.code==='Space') menuDo(sel<n-1?sel+1:0);
  else if(e.code==='Escape') menuDo(0);
  else return false;
  return true;
}
function drawDock(){
  if(docked.isBase){ drawBase(); return; }
  if(lastPg!==dockPage){ sel=0; lastPg=dockPage; }
  const items=menuItems(), n=items.length, wide=wideDock(); sel=Math.min(sel,n-1);
  const W=Math.min(cols-2,wide?100:58), c0=Math.floor((cols-W)/2), hm=hullMax(), u=R.u, mk=!wide&&rows>=n+GK.length+15, lw=wide?46:W;
  const bodyH=wide?Math.max(n+GK.length+4,23):n+2+(mk?GK.length+2:0), H=bodyH+7, r0=Math.max(0,Math.floor((rows-H)/2)), y1=r0+3;
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) put(c0+c,r0+r,' ',DIMC);
  box(c0,r0,W,3,DIMC,''); for(let c=1;c<W-1;c++){ put(c0+c,r0,'=',DIMC); put(c0+c,r0+2,'=',DIMC); }
  put(c0+1+((t*18)%(W-2)|0),r0+2,'#',ACC);
  text(c0+2,r0,'[ '+docked.name.toUpperCase()+' ]',ACC,true); const tag=(t*2|0)%2?'  ATRACADA':'* ATRACADA'; text(c0+W-tag.length-2,r0,tag,HUDC,true);
  text(c0+2,r0+1,(wide?`CASCO [${bar(R.hull/hm,10)}] ${Math.ceil(R.hull)}/${hm}  CR ${R.cr}  NV ${R.lv} [${bar(R.xp/(R.lv*60),6)}]  BODEGA ${Math.round(tot())}/${cap()}`:`CASCO [${bar(R.hull/hm,6)}] ${Math.ceil(R.hull)}  CR ${R.cr}  BOD ${Math.round(tot())}/${cap()}`).slice(0,W-4),HUDC);
  box(c0,y1,lw,n+2,DIMC,['SERVICIOS','ARMAS Y NAVES','MERCADO','CONTACTO','BASE','TALLER'][dockPage]);
  items.forEach((s,i)=>{ const k=i<n-1?i+1:0, on=i===sel, y=y1+1+i;
    text(c0+2,y,((on?'> ':'  ')+`[${k}] ${s}`).slice(0,lw-6),on?ACC:k===0?DIMC:HUDC); if(on) text(c0+lw-3,y,'<',ACC); });
  dockGeo={r0:y1+1,c0,w:lw,n};
  const mkt=(x,y,w)=>{ box(c0+x,y,w,GK.length+2,DIMC,'MERCADO - precio de venta');
    const best=GK.reduce((a,g)=>price(docked,g)/GOODS[g][1]>price(docked,a)/GOODS[a][1]?g:a,GK[0]);
    GK.forEach((g,i)=>{ const pr=price(docked,g), m=pr/GOODS[g][1], yy=y+1+i, cc=c0+x+2, col=m>1.3?'hsl(140 60% 62%)':m<0.8?'hsl(10 65% 58%)':HUDC;
      text(cc,yy,GOODS[g][0].padEnd(8),`hsl(${GOODS[g][2]} 55% 66%)`); text(cc+8,yy,String(Math.round(R.cg[g]||0)).padStart(3)+'u',DIMC);
      text(cc+13,yy,'['+bar((m-0.5)/1.5,8)+']',col); text(cc+23,yy,String(pr).padStart(3)+' cr',col); if(g===best) text(cc+30,yy,'<- mejor',ACC); }); };
  if(wide){ const x=lw, w=W-lw, cx=c0+x+(w>>1), cy=y1+7;
    mkt(0,y1+n+2,lw);
    box(c0+x,y1,w,18,DIMC,'HANGAR - '+SH().n.toUpperCase());
    for(const [dc,dr,ch,col] of shipSprite(-Math.PI/2,1)) put(cx+dc,cy+dr,ch,col);
    text(c0+x+2,y1+16,`${WP[R.wp].n}${R.wp?'':' Nv'+u.laser}  MOTOR N${engLvl()}  CASCO ${u.hull}  BODEGA ${u.cargo}`.slice(0,w-4),HUDC);
    const my=y1+18; box(c0+x,my,w,5,DIMC,R.m?'MISION ACTIVA':'MISION DISPONIBLE');
    wrap(R.m?mT(R.m)+'  +'+R.m.rew+' cr':mT(offer)+'  +'+offer.rew+' cr  [7]',w-4).slice(0,3).forEach((l,i)=>text(c0+x+2,my+1+i,l,ACC)); }
  else if(mk) mkt(0,y1+n+2,W);
  const fy=y1+bodyH; box(c0,fy,W,4,DIMC,''); text(c0+2,fy+1,('> '+menuMsg).slice(0,W-4),ACC);
  text(c0+2,fy+2,(touchUI?'toca una opcion':'[W/S] mover  [ENTER] elegir  [0] zarpar').slice(0,W-4),DIMC);
}
const dockRow=e=>{ if(!docked||!dockGeo) return -1; const b=cv.getBoundingClientRect(), rw=Math.floor((e.clientY-b.top-oy0U)/chhU)-dockGeo.r0, cc=Math.floor((e.clientX-b.left-ox0U)/cwU);
  return rw>=0&&rw<dockGeo.n&&cc>=dockGeo.c0&&cc<dockGeo.c0+dockGeo.w?rw:-1; };
