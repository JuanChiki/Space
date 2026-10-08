'use strict';
/* Rumbo (waypoint): marcar un registro del catalogo como destino, con su nombre y distancia. */

/* ---- RUMBO: marca un registro del catalogo como destino; flecha en pantalla con nombre y distancia, y marcador en el radar ---- */
const DIRN=['E','SE','S','SO','O','NO','N','NE'], ARR=['>','\\','v','/','<','\\','^','/'], dirIdx=(dx,dy)=>((Math.round(Math.atan2(dy,dx)/(Math.PI/4))%8)+8)%8;
const arrowCh=(dx,dy)=>ARR[dirIdx(dx,dy)], dirName=(dx,dy)=>DIRN[dirIdx(dx,dy)];
let wpCache=null;   // objeto del rumbo marcado (cache de resolveObj)
function wpObj(){ if(!R.wpt) return null; if(!wpCache||wpCache.id!==R.wpt) wpCache=resolveObj(R.wpt); return wpCache?wpCache.o:null; }
function toggleWp(e){ if(R.wpt===e.id){ R.wpt=null; wpCache=null; toast('Rumbo cancelado',2); } else { R.wpt=e.id; wpCache=null; toast('Rumbo marcado: '+(e.o.name||e.id),3); } saveR(); }
