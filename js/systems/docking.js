'use strict';
/* Acoplamiento a estaciones: reglas de acceso, entrega de misiones, historia. */

let docked=null, dockHeld=false, offer=null;   // estacion actual, tecla de acoplar y mision ofrecida
function tryDock(){
  if(docked){ docked=null; return; }
  if(R.base&&Math.hypot(R.base.x-ship.x,R.base.y-ship.y)<40){
    if(Math.hypot(ship.vx,ship.vy)>70) return toast('Frena para atracar',2);
    docked={id:'base',name:'Base propia',x:R.base.x,y:R.base.y,r:8,type:'station',isBase:true}; dockPage=4; bp=0; sel=0; foes=foes.filter(f=>f.boss); shots=[]; menuMsg='Base propia. '+prodSum(); return; }
  let st=null; for(const p of near.P) if(p.type==='station'&&Math.hypot(p.x-ship.x,p.y-ship.y)-p.r<36) st=p;
  if(!st) return toast('Acercate a una estacion para atracar',2);
  { const f=profOf(st).f; if((R.rep[f]||0)<=-50) return toast('Atraque denegado: '+FAC[f]+' te considera hostil',3.5); }
  if(Math.hypot(ship.vx,ship.vy)>70) return toast('Frena para atracar',2);
  if(st.id==='pS'&&R.st===1){ spawnBoss(); R.st=2; return toast('Eco: Los piratas nos tomaron... cuidado, viene su jefe',5); }
  docked=st; dockPage=0; offer=mkOffer(st); foes=foes.filter(f=>f.boss); shots=[]; menuMsg='Bienvenido a '+st.name+' ('+profOf(st).n+' - '+FS[profOf(st).f]+' '+Math.round(R.rep[profOf(st).f])+')'; snap(st);
  if(st.id==='pS'&&R.st===3){ R.st=4; R.cr+=500; R.os[2]=1; menuMsg='Gracias, piloto. Te dejamos un Caza y 500 cr'; }
  const m=R.m; if(m&&m.t==='deliver'&&st.id==='p0c'&&(R.cg[m.g]||0)>=m.n){ R.cg[m.g]-=m.n; R.cr+=m.rew; gain(60); menuMsg='Entrega completada +'+m.rew+' cr'; tradeRep(st,20); R.m=null; }
  saveR();
}
function pollDockLandKeys(){
  if(keys.dock&&!dockHeld&&!surf) tryDock(); dockHeld=keys.dock; if(keys.land&&!landHeld) tryLand(); landHeld=keys.land;
}
