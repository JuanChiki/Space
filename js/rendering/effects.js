'use strict';
/* Efectos: particulas, explosiones, estela del motor, sacudida por impacto. */

let particles=[], emitAcc=0;
function emit(x,y,vx,vy,life,kind){ if(particles.length<500) particles.push({x,y,vx,vy,life,max:life,kind}); }
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i]; p.life-=dt; if(p.life<=0){ particles.splice(i,1); continue; }
    p.x+=p.vx*dt; p.y+=p.vy*dt; const k=Math.exp(-1.2*dt); p.vx*=k; p.vy*=k;
  }
}
function drawParticles(){
  for(const p of particles){
    const f=p.life/p.max;
    const c=Math.floor(cols/2+(p.x-camx)*Z), r=Math.floor(rows/2+(p.y-camy)/RY*Z);
    const ch=f>0.7?'*':f>0.45?'+':f>0.25?':':'.';
    const hue=p.kind==='spark'?48:(8+f*42|0);
    put(c,r,ch,`hsl(${hue} 95% ${(25+f*58)|0}%)`);
  }
}
function impact(v){
  if(v<20) return; if(v>40) hurt((v-40)*0.22);
  shake=Math.min(1.4,v/110);
  for(let i=0;i<7;i++){ const a=Math.random()*6.283, s=20+Math.random()*60; emit(ship.x,ship.y,Math.cos(a)*s+ship.vx*0.3,Math.sin(a)*s+ship.vy*0.3,0.5+Math.random()*0.4,'spark'); }
}
function emitEngineTrail(dt,fx,fy,boost){
  if(keys.up){
    emitAcc+=(boost?120:45)*(1+0.2*R.u.engine)*dt;
    while(emitAcc>=1){
      emitAcc-=1;
      const j=(Math.random()-0.5)*14, sp2=(boost?130:75)+Math.random()*40;
      const rx=-fy, ry=fx;
      const nz=NOZ[engLvl()], sl=(nz[(Math.random()*nz.length)|0]-6)*0.3+(Math.random()-0.5)*0.6, bf=3.6+Math.random()*1.2;
      emit(ship.x-fx*bf+rx*sl, ship.y-fy*bf+ry*sl,
           ship.vx-fx*sp2+rx*j, ship.vy-fy*sp2+ry*j, 0.35+Math.random()*(boost?0.7:0.45),'flame');
    }
  } else emitAcc=0;
}
function boom(x,y,n,k){ for(let i=0;i<n;i++){ const a=Math.random()*6.283,v=20+Math.random()*80; emit(x,y,Math.cos(a)*v,Math.sin(a)*v,0.5+Math.random()*0.6,k||'spark'); } }
