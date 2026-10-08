'use strict';
/* Misiones: ofertas de las estaciones, progreso y descripcion. */

function prog(k){ const m=R.m; if(m&&m.t===k&&++m.have>=m.n){ R.cr+=m.rew; gain(60); toast('Mision cumplida +'+m.rew+' cr',4); logEv('Misión cumplida: +'+m.rew+' cr.'); if(m.story){ R.st=1; toast('Senal triangulada: viaja al sector 4:-3',5); } R.m=null; } saveR(); }
function mT(m){ const d=Math.round(Math.hypot((m.x||0)-ship.x,(m.y||0)-ship.y)), dg=String(Math.round(((Math.atan2(m.y-ship.y,m.x-ship.x)*180/Math.PI+90)%360+360)%360)).padStart(3,'0');
  return m.txt||(m.t==='kill'?`piratas ${m.have||0}/${m.n}`:m.t==='scan'?`escaneos ${m.have||0}/${m.n}`:m.t==='boss'?'cazar pirata jefe':m.t==='explore'?`explorar zona a ${d}u rumbo ${dg}`:`entregar ${m.n} ${GOODS[m.g][0]} al hub`); }
function mkOffer(st){
  if(st.id==='p0c'&&R.st===0) return {t:'scan',n:3,rew:150,story:1,txt:'SENAL: escanea 3 objetos'};
  const T=['kill','scan','boss','explore']; if(st.id!=='p0c') T.push('deliver','deliver');
  const t=T[Math.floor(Math.random()*T.length)], n=2+Math.floor(Math.random()*3), o={t,n,rew:60*n+10*R.lv};
  if(t==='boss'){ o.n=1; o.rew=250+20*R.lv; }
  if(t==='explore'){ const a=Math.random()*6.283,d=900+Math.random()*900; o.n=1; o.x=Math.round(st.x+Math.cos(a)*d); o.y=Math.round(st.y+Math.sin(a)*d); o.rew=120+Math.round(d/8); }
  if(t==='deliver'){ const g=GK[Math.floor(Math.random()*5)]; o.g=g; o.n=4+Math.floor(Math.random()*6); o.rew=Math.round(o.n*GOODS[g][1]*2.5)+40; }
  return o; }
function checkExploreMission(){
  if(R.m&&R.m.t==='explore'&&Math.hypot(ship.x-R.m.x,ship.y-R.m.y)<90) prog('explore');
}
