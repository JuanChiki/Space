'use strict';
/* Reputacion con las facciones: descuentos, ganancia por comerciar y por acciones. */

const disc=st=>clamp((R.rep[profOf(st).f]||0)*0.002,-0.25,0.25);
function addRep(d){ const o=[]; for(const k in d){ R.rep[k]=clamp((R.rep[k]||0)+d[k],-100,100); o.push(FS[k]+(d[k]>0?' +':' ')+d[k]); } return o.join(' '); }
function tradeRep(st,n){ const f=profOf(st).f; R.rep[f]=clamp((R.rep[f]||0)+0.15*n,-100,100); }
