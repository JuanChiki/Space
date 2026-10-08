'use strict';
/* Vuelo: giro, empuje, freno, asistencia, limite de velocidad, colisiones con planetas y asteroides. */

let assist=true;   // asistencia de vuelo (tecla Z)
function collide(o,rad,rest){
  const dx=ship.x-o.x, dy=ship.y-o.y, d=Math.hypot(dx,dy)||0.001, min=rad+6;
  if(d<min){
    const nx=dx/d, ny=dy/d;
    ship.x=o.x+nx*min; ship.y=o.y+ny*min;
    const vn=ship.vx*nx+ship.vy*ny;
    if(vn<0){ ship.vx-=(1+rest)*vn*nx; ship.vy-=(1+rest)*vn*ny; impact(-vn); }
  }
}
function flightStep(dt){
  const turn=(keys.right?1:0)-(keys.left?1:0);
  ship.av+=(turn*2.7-ship.av)*Math.min(1,dt*9);
  ship.a+=ship.av*dt;
  const fx=Math.cos(ship.a), fy=Math.sin(ship.a);
  const boost=keys.shift&&keys.up&&R.fuel>0;
  if(keys.up){ const eff=R.fuel>0?1:0.25; R.fuel=Math.max(0,R.fuel-(boost?1.6:0.5)*(1-pfx('feff'))*dt); const acc=(boost?300:100)*eff*(1+0.12*R.u.engine+pfx('acc'))*SH().e; ship.vx+=fx*acc*dt; ship.vy+=fy*acc*dt; if(showHelp&&t>1.5) showHelp=false; }
  let sp=Math.hypot(ship.vx,ship.vy);
  if(keys.down&&sp>0.01){ const dec=Math.min(sp,170*dt); ship.vx-=ship.vx/sp*dec; ship.vy-=ship.vy/sp*dec; sp-=dec; }
  if(assist&&!keys.up&&!keys.down){ const k=Math.exp(-0.28*dt); ship.vx*=k; ship.vy*=k; }
  const vmax=boost?460:(assist?190:520);
  sp=Math.hypot(ship.vx,ship.vy);
  if(sp>vmax){ const k=1-Math.min(1,dt*3)*(1-vmax/sp); ship.vx*=k; ship.vy*=k; }
  ship.x+=ship.vx*dt; ship.y+=ship.vy*dt;
  return {fx,fy,boost};
}
function collideShip(){
  for(const p of near.P) collide(p,p.r*1.02,0.55);
  for(const a of near.R) collide(a,a.r,0.8);
}
