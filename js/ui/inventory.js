'use strict';
/* Pantalla de inventario (tecla I): carga, mercados recientes y reputacion. */

let invOpen=false;
function drawInv(){
  const W=Math.min(cols-2,56), c0=Math.floor((cols-W)/2), n=GK.length, sk=Object.values(R.seen).sort((a,b)=>b.t-a.t).slice(0,3), H=n+16, r0=Math.max(0,Math.floor((rows-H)/2));
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) put(c0+c,r0+r,' ',DIMC);
  box(c0,r0,W,H,DIMC,'INVENTARIO');
  text(c0+2,r0+1,`CREDITOS ${R.cr}  BODEGA ${Math.round(tot())}/${cap()}  NAVE ${SH().n}`.slice(0,W-4),HUDC);
  text(c0+2,r0+2,`ARMA ${WP[R.wp].n}  CASCO ${Math.ceil(R.hull)}/${hullMax()}  NV ${R.lv}  COMB ${Math.round(R.fuel)}  COMP ${R.comp}`.slice(0,W-4),DIMC);
  text(c0+2,r0+3,('PIEZAS '+(Object.values(R.fit).map(id=>PARTS[id]&&PARTS[id].n).join(', ')||'ninguna')).slice(0,W-4),DIMC);
  text(c0+2,r0+4,'MERCANCIA   u',ACC); sk.forEach((s,j)=>text(c0+19+j*11,r0+4,s.n.slice(0,10),ACC));
  GK.forEach((g,i)=>{ const y=r0+5+i; text(c0+2,y,GOODS[g][0].padEnd(9),`hsl(${GOODS[g][2]} 55% 66%)`); text(c0+11,y,String(Math.round(R.cg[g]||0)).padStart(3),HUDC);
    sk.forEach((s,j)=>{ const v=s.p[g][0], m=v/GOODS[g][1]; text(c0+19+j*11,y,(v+' cr').padStart(7),m>1.3?'hsl(140 60% 62%)':m<0.8?'hsl(10 65% 58%)':HUDC); }); });
  text(c0+2,r0+6+n,(sk.length?'Precio de venta en tus ultimas estaciones.':'Atraca en estaciones para registrar sus mercados.').slice(0,W-4),DIMC);
  text(c0+2,r0+8+n,'FACCIONES',ACC);
  Object.keys(FAC).forEach((k,i)=>{ const v=R.rep[k]||0; text(c0+2,r0+9+n+i,FAC[k].padEnd(13)+'['+bar((v+100)/200,12)+'] '+(v>0?'+':'')+Math.round(v),v>20?'hsl(140 60% 62%)':v<-20?'hsl(10 65% 58%)':HUDC); });
  text(c0+2,r0+13+n,('GLIFOS '+R.myst.g+'/5   CAMARAS '+R.myst.v+'   GRIETAS '+R.myst.r).slice(0,W-4),ACC);
  text(c0+2,r0+14+n,'[I] cerrar',DIMC);
}
