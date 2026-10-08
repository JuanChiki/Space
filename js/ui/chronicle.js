'use strict';
/* Cronica (tecla Y): resumen de tu historia hasta ahora. */

let chrOpen=false;
function story(){ const rp=R.rep, P=[], ep=rp.pir<=-30?'Azote de los Piratas':R.myst.g>=3?'Lector de Glifos':R.base?'Fundador de la Base':discovered.size>=15?'Cartografo de lo Desconocido':'Vagabundo del Vacio';
  P.push('"'+ep+'". Al mando de un '+SH().n+' de nivel '+R.lv+', con '+R.cr+' creditos.');
  P.push('Has cruzado '+visited.size+' sectores y catalogado '+discovered.size+' hallazgos. '+R.kills+' naves han caido ante ti.');
  const al=FACK.filter(k=>rp[k]>=30).map(k=>FAC[k]), en=FACK.filter(k=>rp[k]<=-30).map(k=>FAC[k]);
  P.push(al.length||en.length?(al.length?'Te consideran aliado: '+al.join(', ')+'. ':'')+(en.length?'Te consideran enemigo: '+en.join(', ')+'.':''):'Ninguna faccion tiene aun una opinion firme de ti.');
  P.push(R.base?'Tu base ya acoge '+Object.values(R.base.mods).reduce((a,b)=>a+b,0)+' modulos y '+Object.keys(R.base.tech).length+' tecnologias.':'Aun no has fundado una base: el vacio sigue sin dueno.');
  P.push(R.myst.g||R.myst.v||R.myst.r?'Has registrado '+R.myst.g+' glifos de los Primeros, abierto '+R.myst.v+' camaras y cruzado '+R.myst.r+' grietas.':'Los Primeros aun no te han dejado su rastro.');
  const lg=logBook.slice(-4); if(lg.length) P.push('Reciente: '+lg.map(e=>'dia '+e.d+', '+e.x).join(' / '));
  return P; }
function drawChron(){ const W=Math.min(cols-2,64), c0=Math.floor((cols-W)/2), L=[]; story().forEach(q=>L.push(...wrapT(q,W-6),'')); const H=Math.min(rows-2,L.length+4), r0=Math.max(0,Math.floor((rows-H)/2));
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) put(c0+c,r0+r,' ',DIMC);
  box(c0,r0,W,H,DIMC,'CRONICA'); L.slice(0,H-4).forEach((l,i)=>text(c0+3,r0+1+i,l,i===0?ACC:HUDC)); text(c0+2,r0+H-2,'[Y] cerrar',DIMC); }
