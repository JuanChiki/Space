'use strict';
/* Orquestacion de un fotograma de logica: llama a cada sistema en orden. Aqui se ve el flujo completo. */

function update(dt){
  t+=dt; if(optOpen||archOpen||invOpen||conOpen||chrOpen) return; R.clk=(R.clk||0)+dt;
  rpgUpdate(dt);              // gameplay: base, regiones, acoplar/aterrizar, regeneración, disparo, enemigos, proyectiles, botín
  const fl=flightStep(dt);    // pilotaje (devuelve fx, fy, boost para la estela)
  buildNear();                // sectores cercanos + marca de sector visitado
  collideShip();
  emitEngineTrail(dt,fl.fx,fl.fy,fl.boost);
  updateParticles(dt);
  updateCamera(dt);
  updateScanning(dt);         // objetivo y escaneo
  if(infoT>0) infoT-=dt;
  if(toastT>0) toastT-=dt;
  if(helpT>0) helpT-=dt;
}
function rpgUpdate(dt){
  baseTick(dt); regFx(dt);
  pollDockLandKeys();
  if(surf){ const K=[keys.left,keys.right,keys.fire||keys.scan]; ship.vx=ship.vy=ship.av=0; ship.x=surf.sx; ship.y=surf.sy; ship.a=surf.sa; surfUpd(dt,K); return; }
  if(docked){ ship.vx=ship.vy=0; for(const k of ['up','left','right','down','shift','fire','scan']) keys[k]=false; return; }
  const danger=clamp(Math.hypot(ship.x,ship.y)/2500,0,1);   // peligro: crece con la distancia al origen
  regenHull(dt); autosave(dt);
  tickCargoWarning(dt); checkExploreMission();
  playerFire(dt);
  spawnPirates(dt,danger);
  updateFoes(dt);
  updateShots(dt,danger);
  updateLoot(dt);
}
