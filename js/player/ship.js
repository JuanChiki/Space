'use strict';
/* Nave del jugador: estadisticas derivadas (casco, dano, motor), cambio de arma y regeneracion del casco. */

const engLvl=()=>R.u.engine<1?1:R.u.engine<3?2:3;
const hullMax=()=>100+SH().h+40*R.u.hull+10*(R.lv-1)+pfx('hull'), dmgP=()=>(1+0.6*R.u.laser)*WP[R.wp].d*(1+pfx('dmg'));
let hitT=0;   // segundos desde el ultimo golpe (la regeneracion espera a que llegue a 0)
const SH=()=>SHP[R.sh];
const pfx=k=>Object.values(R.fit).reduce((a,id)=>a+((PARTS[id]&&PARTS[id].fx[k])||0),0);
function cycleW(){ do R.wp=(R.wp+1)%WP.length; while(!R.ow[R.wp]); toast('Arma: '+WP[R.wp].n,1.5); }
function regenHull(dt){
  const hm=hullMax();
  hitT-=dt; if(hitT<=0&&R.hull<hm) R.hull=Math.min(hm,R.hull+dt*1.2);
}
