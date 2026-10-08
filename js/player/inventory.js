'use strict';
/* Bodega: carga total, capacidad y recogida de botin. */

const cap=()=>20+SH().c+15*R.u.cargo+pfx('cargo');
let loot=[], fullT=0;   // botin flotando y temporizador del aviso de bodega llena
const tot=()=>Object.values(R.cg).reduce((a,b)=>a+b,0);
function tickCargoWarning(dt){ fullT-=dt; }
function updateLoot(dt){
  for(let i=loot.length-1;i>=0;i--){
    const l=loot[i], dx=ship.x-l.x, dy=ship.y-l.y, d=Math.hypot(dx,dy)||1; l.life-=dt;
    if(d<45){ l.vx+=dx/d*160*dt; l.vy+=dy/d*160*dt; }
    const k=Math.exp(-1.5*dt); l.vx*=k; l.vy*=k; l.x+=l.vx*dt; l.y+=l.vy*dt;
    if(d<7){ if(cap()-tot()>=l.u-0.01){ R.cg[l.g]=(R.cg[l.g]||0)+l.u; loot.splice(i,1); continue; } else if(fullT<=0){ fullT=3; toast('Bodega llena: vende en una estacion',2); } }
    if(l.life<=0) loot.splice(i,1);
  }
}
