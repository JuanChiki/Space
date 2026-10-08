'use strict';
/* Construccion: base propia, produccion por modulos, almacen e investigacion. */

const techFx=k=>R.base?Object.keys(R.base.tech).reduce((a,id)=>a+((TECH[id]&&TECH[id].fx&&TECH[id].fx[k])||0),0):0;
const baseCap=()=>Math.round((BASE_CAP+Object.keys(R.base.mods).reduce((a,id)=>a+((MODS[id]&&MODS[id].store)||0)*R.base.mods[id],0))*(1+techFx('cap')));
const baseUsed=()=>Object.values(R.base.sto).reduce((a,b)=>a+b,0);
const mcost=c=>{ const o={}; for(const k in c) o[k]=Math.ceil(c[k]*(1-Math.min(0.5,techFx('disc')))); return o; };
const cstr=c=>Object.keys(c).map(k=>k==='cr'?c[k]+'cr':c[k]+GOODS[k][0].slice(0,3)).join(' ');
const canPay=c=>Object.keys(c).every(k=>k==='cr'?R.cr>=c[k]:(R.cg[k]||0)>=c[k]);
const pay=c=>{ for(const k in c){ if(k==='cr') R.cr-=c[k]; else R.cg[k]-=c[k]; } };
function baseRates(){ const o={}, pm=1+techFx('prod'); for(const id in R.base.mods){ const M=MODS[id]; if(M&&M.prod) for(const g in M.prod) o[g]=(o[g]||0)+M.prod[g]*R.base.mods[id]*pm; } return o; }
const prodSum=()=>{ const r=baseRates(), t=Object.keys(r).map(g=>GOODS[g][0]+' '+r[g].toFixed(1)).join('  '); return t?'Prod/min: '+t:'Sin produccion: construye modulos'; };
function baseTick(dt){ const B=R.base; if(!B) return;
  if(docked&&docked.isBase) R.hull=Math.min(hullMax(),R.hull+dt*4);
  const r=baseRates(), cap=baseCap(); let used=baseUsed();
  for(const g in r){ const a=Math.min(r[g]*dt/60,cap-used); if(a<=0) break; B.sto[g]=(B.sto[g]||0)+a; used+=a; }
  for(const id in B.mods){ const M=MODS[id]; if(M&&M.rp) B.rp+=M.rp*B.mods[id]*(1+techFx('rp'))*dt/60; } }
function buildBase(){
  if(docked||surf) return;
  if(R.base){ toast('Tu base esta a '+Math.round(Math.hypot(R.base.x-ship.x,R.base.y-ship.y))+' u  (G para atracar)',3.5); return; }
  if(near.P.some(p=>p.type==='station'&&Math.hypot(p.x-ship.x,p.y-ship.y)<300)) return toast('Muy cerca de una estacion para construir',3);
  if(!canPay(BASE_COST)) return toast('Base: necesitas '+cstr(BASE_COST)+' en tu bodega',4);
  pay(BASE_COST); R.base={x:ship.x,y:ship.y,mods:{},sto:{},rp:0,tech:{}};
  toast('Base construida. Atraca con G para ampliarla',4); logEv('Construyes una base en el sector '+sectorOf(ship.x)+':'+sectorOf(ship.y)+'.'); saveR(); }
