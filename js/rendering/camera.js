'use strict';
/* Camara: sigue a la nave con un poco de adelanto segun la velocidad. */

function updateCamera(dt){
  const lim=(cols*0.22)/Z, limY=(rows*RY*0.22)/Z;
  const tx=ship.x+clamp(ship.vx*0.25,-lim,lim), ty=ship.y+clamp(ship.vy*0.25,-limY,limY);
  const k=1-Math.exp(-dt*5);
  camx+=ship.vx*dt; camy+=ship.vy*dt;
  camx+=(tx-camx)*k; camy+=(ty-camy)*k;
  shake*=Math.exp(-dt*7);
}
