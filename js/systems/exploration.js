'use strict';
/* Exploracion: sectores cercanos, sectores visitados, bitacora, aterrizaje y recoleccion en superficie. */

function buildNear(){
  const sx=sectorOf(ship.x), sy=sectorOf(ship.y), key=sx+','+sy;
  if(key===near.key) return;
  const P=[],R=[],S=[];
  for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ const s=getSector(sx+dx,sy+dy); P.push(...s.planets); R.push(...s.rocks); S.push(...s.signals); }
  near={P,R,S,key};
  if(!visited.has(key)){ visited.add(key); saveArch(); }
}
let surf=null, landHeld=false;   // superficie actual (null en el espacio) y tecla de aterrizar
const landable=()=>{ let pl=null; for(const p of near.P) if(p.type!=='station'&&Math.hypot(p.x-ship.x,p.y-ship.y)-p.r<26) pl=p; return pl; };
const wrapX=x=>((x%surf.W)+surf.W)%surf.W, hz=()=>Math.round(rows*0.66);
const gy=x=>{ const a=wrapX(x)/surf.W*6.2832, k=surf.W*0.011; return hz()+Math.round((fbm(Math.cos(a)*k+5,Math.sin(a)*k+5,0.5,surf.p.seed,3)-0.5)*9*Z); };
function nodeAt(x){ const p=surf.p, xm=wrapX(x); if(Math.abs(xm-30)<7||h2(xm,p.seed,3)>0.075) return null; const u=2+Math.floor(h2(xm,p.seed,5)*3), d=surf.depl[xm]||0; if(d>=u) return null; return {x:xm,u:u-d,g:PRES[p.type][Math.floor(h2(xm,p.seed,4)*4)]}; }
function tryLand(){
  if(surf){ if(Math.abs(surf.x-surf.home)<6*Z) leave(false); else toast('Vuelve a la nave para despegar',2); return; }
  const pl=landable(); if(!pl) return toast('Acercate a un planeta para aterrizar',2);
  if(Math.hypot(ship.vx,ship.vy)>60) return toast('Frena para aterrizar',2);
  surf={sx:ship.x,sy:ship.y,sa:ship.a,p:pl,W:Math.round(Math.max(180,pl.r*12)*Z),tp:0,x:30,home:30,en:100,got:{},depl:{},prog:0}; toast('Aterrizaje en '+pl.name,2.5); if(!landed.has(pl.id)){ landed.add(pl.id); logEv('Aterrizas en '+pl.name+' por primera vez.'); }
}
function leave(lost){ for(const k in surf.got) R.cg[k]=(R.cg[k]||0)+(lost?Math.floor(surf.got[k]/2):surf.got[k]); toast(lost?'Energia agotada: evacuacion, pierdes la mitad':'Despegue exitoso',3.5); surf=null; saveR(); }
function surfUpd(dt,K){
  const S=surf, p=S.p, mv=(K[1]?1:0)-(K[0]?1:0); fullT-=dt;
  const nx=S.x+mv*14*Z*dt; if(nx<0||nx>=S.W) S.tp=0.35; S.x=((nx%S.W)+S.W)%S.W; S.tp-=dt; S.mv=mv; if(mv) S.fc=mv;
  S.en-=dt*(0.9+clamp(Math.abs(p.temp-18)/55,0,4.5)); if(S.en<=0) return leave(true);
  const xi=Math.round(S.x); let n=null; for(let d=-Math.ceil(2*Z);d<=Math.ceil(2*Z)&&!n;d++) n=nodeAt(xi+d); S.nd=n;
  if(K[2]&&n&&!mv){
    if(tot()+Object.values(S.got).reduce((a,b)=>a+b,0)>=cap()){ S.prog=0; if(fullT<=0){ fullT=3; toast('Bodega llena',2); } }
    else if((S.prog+=dt/0.7)>=1){ S.prog=0; S.got[n.g]=(S.got[n.g]||0)+1; S.depl[n.x]=(S.depl[n.x]||0)+1; gain(1); }
  } else S.prog=0;
}
let visited=new Set(['0,0']), landed=new Set(), pings={}, logBook=[];
try{ const v=JSON.parse(localStorage.getItem('space_visited')||'null'); if(Array.isArray(v)) visited=new Set(v); }catch(e){}
try{ const v=JSON.parse(localStorage.getItem('space_landed')||'null'); if(Array.isArray(v)) landed=new Set(v); }catch(e){}
try{ const v=JSON.parse(localStorage.getItem('space_pings')||'null'); if(v&&typeof v==='object') pings=v; }catch(e){}
try{ const v=JSON.parse(localStorage.getItem('space_log')||'null'); if(Array.isArray(v)) logBook=v; }catch(e){}
const saveArch=()=>{ try{ localStorage.setItem('space_visited',JSON.stringify([...visited])); localStorage.setItem('space_landed',JSON.stringify([...landed])); localStorage.setItem('space_pings',JSON.stringify(pings)); localStorage.setItem('space_log',JSON.stringify(logBook)); }catch(e){} };
function logEv(x){ const c=R.clk||0; logBook.push({d:Math.floor(c/600)+1,s:Math.floor(c%600),x}); if(logBook.length>120) logBook.shift(); saveArch(); }
for(const id of discovered){ const q=idSector(id); if(q) visited.add(q[0]+','+q[1]); }   // partidas antiguas: recuerda los sectores de lo ya catalogado
