'use strict';
/* Arranque: bucle principal, ajuste automatico de rendimiento y espera de la fuente. */

let last=0;
let slowAcc=0, slowN=0;
function loop(now){
  const raw=(now-last)/1000||0.016, dt=Math.min(0.05,raw); last=now;
  update(dt); render();
  requestAnimationFrame(loop);
}
function start(){
  if(!logBook.length) logEv('Despiertas en el sector 0:0. Todo el universo está por descubrir.');
  setup(); buildNear(); camx=ship.x; camy=ship.y;
  last=performance.now(); requestAnimationFrame(loop);
  if('ResizeObserver' in window) new ResizeObserver(()=>setup()).observe(cv); else window.addEventListener('resize',setup);
}
const fontReady=(document.fonts&&document.fonts.load)
  ? Promise.race([document.fonts.load('14px "Space Mono"'),new Promise(r=>setTimeout(r,1200))])
  : Promise.resolve();
fontReady.catch(()=>{}).then(start);
