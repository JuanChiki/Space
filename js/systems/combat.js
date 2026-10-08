'use strict';
/* Combate: disparo del jugador, proyectiles, dano, muerte, destruccion de enemigos y asteroides, aparicion de piratas. */

let muz=0;
let shots=[], fireCd=0, spawnT=8;   // proyectiles, enfriamiento del arma y temporizador de oleadas
function hurt(d){ if(docked) return; R.hull-=d; hitT=5; shake=Math.max(shake,Math.min(1,d/25)); if(R.hull<=0) die(); }
function die(){ logEv('Tu nave fue destruida. Pierdes la carga y parte de los créditos.'); boom(ship.x,ship.y,40,'flame'); toast('Nave destruida: pierdes la carga y 25% de creditos',4.5);
  R.cr=Math.floor(R.cr*0.75); R.cg={}; R.fuel=Math.max(R.fuel,40); ship.x=165; ship.y=95; ship.vx=ship.vy=0; camx=165; camy=95; foes=[]; shots=[]; R.hull=hullMax(); saveR(); }
function killFoe(f){ foes.splice(foes.indexOf(f),1); if(f.boss){ logEv('El jefe pirata ha sido destruido.'); R.cr+=300; addRep({pir:-15,fed:8,com:5}); if(R.st===2){ R.st=3; toast('Jefe pirata destruido. Vuelve a Estacion Ecos',5); } prog('boss'); } boom(f.x,f.y,28,'flame'); const F=FOE[f.k||'raider'], c=Math.round((20+Math.floor(Math.random()*20)+R.lv*3)*F.xp/25); R.cr+=c; R.kills++; gain(F.xp); toast(F.n+' destruido +'+c+' cr  '+addRep({pir:-4,fed:1,com:1}),2.5); prog('kill'); }
function breakRock(a){ const n=Math.max(1,Math.round(a.r*0.9)); boom(a.x,a.y,12);
  for(let i=0;i<2;i++) loot.push({x:a.x,y:a.y,vx:(Math.random()-0.5)*50,vy:(Math.random()-0.5)*50,u:n/2,g:a.rk,h:GOODS[a.rk][2],life:45});
  a.x=a.y=1e9; gain(3); }
function playerFire(dt){
  fireCd-=dt;
  if(keys.fire&&fireCd<=0){ const w=WP[R.wp], fx=Math.cos(ship.a),fy=Math.sin(ship.a), rx=-fy, ry=fx, MZ=([[5.6,0],[1,2.4],[2,2]][R.wp]||[2,2]), sd=R.wp?((muz^=1)?1:-1):0; fireCd=w.cd*(1+pfx('cd')); shots.push({x:ship.x+fx*MZ[0]+rx*MZ[1]*sd,y:ship.y+fy*MZ[0]+ry*MZ[1]*sd,vx:fx*w.s+ship.vx,vy:fy*w.s+ship.vy,life:0.9,w:R.wp}); }
}
function spawnPirates(dt,danger){
  spawnT-=dt;
  if(spawnT<=0){ const pr=R.rep.pir||0; spawnT=(7+Math.random()*7)*(pr<=-30?0.6:1);
    const safe=near.P.some(p=>p.type==='station'&&Math.hypot(p.x-ship.x,p.y-ship.y)<260);
    if(foes.length<1+Math.floor(danger*3)+(pr<=-60?2:pr<=-30?1:0)&&!safe&&curRegK!=='void'&&pr<60&&(pr<30||Math.random()<0.5)&&Math.hypot(ship.x,ship.y)>300){ const a=Math.random()*6.283, pool=SPAWN.filter(([k,d,r])=>danger>d||(r!=null&&pr<=r)).map(([k])=>k).concat(REGION_SPAWN[curRegK]||[]), k=pool[Math.floor(Math.random()*pool.length)], hp=Math.max(1,Math.round((3+Math.floor(danger*5)+(R.lv>>1))*FOE[k].hp));
      foes.push({x:ship.x+Math.cos(a)*170,y:ship.y+Math.sin(a)*170,vx:0,vy:0,a:a+3.14,hp,mhp:hp,k,cd:1.5,fl:0}); toast('Alerta: '+FOE[k].n+' detectado',2.5); } }
}
function updateShots(dt,danger){
  for(let i=shots.length-1;i>=0;i--){
    const sh=shots[i]; if(!sh) continue;   // die() reasigna shots=[] a mitad del bucle: sin esta guarda el juego se congelaba al morir por un proyectil
    sh.x+=sh.vx*dt; sh.y+=sh.vy*dt; let gone=(sh.life-=dt)<=0;
    if(!gone&&sh.e){ if(Math.hypot(sh.x-ship.x,sh.y-ship.y)<6.5){ hurt((6+danger*6)*(sh.dm||1)); gone=true; } }
    else if(!gone){
      for(const f of foes) if(Math.hypot(sh.x-f.x,sh.y-f.y)<FOE[f.k||'raider'].r){ f.hp-=dmgP(); f.fl=0.12; gone=true; boom(sh.x,sh.y,3); if(f.hp<=0) killFoe(f); break; }
      if(!gone) for(const a of near.R) if(a.x<1e8&&Math.hypot(sh.x-a.x,sh.y-a.y)<a.r+3){ a.hp=(a.hp===undefined?a.r*1.3:a.hp)-dmgP(); gone=true; boom(sh.x,sh.y,3); if(a.hp<=0) breakRock(a); break; }
      if(!gone) for(const p of near.P) if(Math.hypot(sh.x-p.x,sh.y-p.y)<p.r){ gone=true; boom(sh.x,sh.y,2); break; }
    }
    if(gone) shots.splice(i,1);
  }
}
