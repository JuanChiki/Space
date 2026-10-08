'use strict';
/* Enemigos: aparicion y comportamiento (IA, persecucion, disparo, choque con el jugador). */

let foes=[];   // enemigos activos
function spawnBoss(){ const a=Math.random()*6.283, hp=25+R.lv*2; foes.push({x:ship.x+Math.cos(a)*420,y:ship.y+Math.sin(a)*420,vx:0,vy:0,a:a+3.14,hp,mhp:hp,k:'boss',cd:1,fl:0,boss:1}); }
function updateFoes(dt){
  for(const f of foes.slice()){
    const dx=ship.x-f.x, dy=ship.y-f.y, d=Math.hypot(dx,dy)||1, da=Math.atan2(Math.sin(Math.atan2(dy,dx)-f.a),Math.cos(Math.atan2(dy,dx)-f.a));
    const F=FOE[f.k||'raider']; f.a+=clamp(da*3,-F.turn,F.turn)*dt; const th=d>F.keep[1]?F.spd:d<F.keep[0]?-F.spd*0.6:0;
    f.vx+=Math.cos(f.a)*th*dt; f.vy+=Math.sin(f.a)*th*dt; const k=Math.exp(-0.8*dt); f.vx*=k; f.vy*=k; f.x+=f.vx*dt; f.y+=f.vy*dt; f.fl-=dt;
    if((f.cd-=dt)<=0&&d<F.rng&&Math.abs(da)<0.25){ f.cd=F.cd+Math.random()*0.6; shots.push({x:f.x,y:f.y,vx:Math.cos(f.a)*F.sp,vy:Math.sin(f.a)*F.sp,life:F.rng/F.sp+0.5,e:1,dm:F.dmg,ch:F.ch,cl:F.pal[0]}); }
    if(d<8){ hurt(8); f.hp-=2; ship.vx+=dx/d*60; ship.vy+=dy/d*60; f.fl=0.15; if(f.hp<=0) killFoe(f); }
    else if(d>520&&!f.boss) foes.splice(foes.indexOf(f),1);
  }
}
function spawnFoe(k,x,y){
  const danger=clamp(Math.hypot(ship.x,ship.y)/2500,0,1), hp=Math.max(1,Math.round((3+Math.floor(danger*5)+(R.lv>>1))*FOE[k].hp));
  foes.push({x,y,vx:0,vy:0,a:Math.atan2(ship.y-y,ship.x-x),hp,mhp:hp,k,cd:1.5,fl:0});
}
