'use strict';
/* Composicion de un fotograma: decide que se dibuja y en que orden. */

function render(){
  if(wantFs()!==fs) setup();
  G.fill(' '); if(layered){ GU.fill(' '); GCU.fill(''); }
  if(archOpen){ withUI(drawArchive); blit(); return; }
  if(invOpen){ withUI(drawInv); blit(); return; }
  if(chrOpen){ withUI(drawChron); blit(); return; }
  if(surf){ drawSurf(); withUI(drawSurfHud); if(conOpen) withUI(drawCon); blit(); return; }
  drawNebula(); drawRegionFx(); drawStars();
  for(const p of near.P) drawPlanet(p);
  for(const a of near.R) drawRock(a);
  for(const g of near.S) drawSignal(g);
  drawParticles(); drawRpg();
  drawShip(cols/2+(ship.x-camx)*Z,rows/2+(ship.y-camy)/RY*Z);
  if(!docked){ drawTargetBrackets(); wpWorld(); } else { tmLbl=null; wpPx=null; }
  withUI(drawHUD);
  if(optOpen) withUI(drawOptions);
  if(conOpen) withUI(drawCon);
  blit();
}
