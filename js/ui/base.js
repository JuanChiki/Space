'use strict';
/* Menu de la base propia: modulos, almacen e investigacion, y su dibujo. */

let bp=0, stMode=0;   // pagina del menu de la base y modo deposito/retirada
function baseItems(){ const B=R.base;
  if(bp===1) return [...Object.keys(MODS).map(id=>{ const M=MODS[id], h=B.mods[id]||0, lk=M.req&&!B.tech[M.req]; return `${M.n.padEnd(11)} ${h}/${M.max||9}  ${lk?'[req: '+TECH[M.req].n+']':cstr(mcost(M.cost))}`; }),'Volver'];
  if(bp===2) return [(stMode?'RETIRAR':'DEPOSITAR')+'  (cambiar modo)',...GK.map(g=>`${GOODS[g][0].padEnd(8)} bod ${String(Math.floor(R.cg[g]||0)).padEnd(3)} base ${Math.floor(B.sto[g]||0)}`),'Volver'];
  if(bp===3) return [...Object.keys(TECH).map(id=>{ const T=TECH[id]; return `${T.n.padEnd(11)} ${B.tech[id]?'[LISTO]':T.rp+'RP'+(T.req&&!B.tech[T.req]?' [req]':'')}  ${T.d}`; }),'Volver'];
  return ['Modulos ('+Object.values(B.mods).reduce((a,b)=>a+b,0)+')','Almacen '+Math.floor(baseUsed())+'/'+baseCap(),'Investigacion '+Math.floor(B.rp)+' RP','Zarpar']; }
function baseDo(i){ const B=R.base; let m='';
  if(i===0){ if(bp===0) docked=null; else { bp=0; sel=0; } return; }
  if(bp===0){ bp=i; sel=0; }
  else if(bp===1){ const id=Object.keys(MODS)[i-1], M=MODS[id]; if(M){ const c=mcost(M.cost), h=B.mods[id]||0;
    if(M.req&&!B.tech[M.req]) m='Requiere investigar '+TECH[M.req].n; else if(h>=(M.max||9)) m='Maximo alcanzado'; else if(!canPay(c)) m='Faltan recursos: '+cstr(c);
    else { pay(c); B.mods[id]=h+1; m=M.n+' construido'; logEv('Base: '+M.n+' construido.'); } } }
  else if(bp===2){ if(i===1) stMode^=1; else { const g=GK[i-2]; if(g){
    if(stMode){ const n=Math.floor(Math.min(B.sto[g]||0,cap()-tot())); if(n>0){ B.sto[g]-=n; R.cg[g]=(R.cg[g]||0)+n; m='Retirado '+n+' '+GOODS[g][0]; } else m='Nada que retirar o bodega llena'; }
    else { const n=Math.floor(Math.min(R.cg[g]||0,baseCap()-baseUsed())); if(n>0){ R.cg[g]-=n; B.sto[g]=(B.sto[g]||0)+n; m='Depositado '+n+' '+GOODS[g][0]; } else m='Nada que depositar o almacen lleno'; } } } }
  else if(bp===3){ const id=Object.keys(TECH)[i-1], T=TECH[id]; if(T){ if(B.tech[id]) m='Ya investigado'; else if(T.req&&!B.tech[T.req]) m='Requiere '+TECH[T.req].n; else if(B.rp<T.rp) m='Faltan puntos de investigacion';
    else { B.rp-=T.rp; B.tech[id]=1; m=T.n+' investigado'; logEv('Base: investigada '+T.n+'.'); } } }
  if(m) menuMsg=m; saveR(); }
let avx=0;
function roomArt(id,k){ const M=MODS[id], g=M.prod?Object.keys(M.prod)[0]:null, o=[];
  if(g){ const c=GOODS[g][0][0]; let row=''; for(let i=0;i<7;i++) row+=((i+k)%3===0)?c:' '; return ['[=====]',row,'[=====]']; }
  if(M.store) return ['[=][=] ','[=][=] ','[=][=] '];
  if(M.rp){ const a=['  o  . ',' .  O  ','  ~~~~ ']; return a.map((l,i)=>(l+l).slice((k+i)%4,(k+i)%4+7)); }
  return ['  ...  ','  ...  ','  ...  ']; }
function drawBase(){
  const items=menuItems(), n=items.length; sel=Math.min(sel,n-1); const B=R.base, W=Math.min(cols-2,58), c0=Math.floor((cols-W)/2), IH=9, showI=rows>=n+9+IH+2, H=n+9+(showI?IH:0), r0=Math.max(0,Math.floor((rows-H)/2)), yi=r0+3, y1=yi+(showI?IH:0), k=Math.floor(t*3);
  for(let r=0;r<H;r++) for(let c=0;c<W;c++) put(c0+c,r0+r,' ',DIMC);
  box(c0,r0,W,3,DIMC,''); text(c0+2,r0,'[ BASE PROPIA ]',ACC,true);
  text(c0+2,r0+1,`CR ${R.cr}  BOD ${Math.round(tot())}/${cap()}  ALM ${Math.floor(baseUsed())}/${baseCap()}  RP ${Math.floor(B.rp)}`.slice(0,W-4),HUDC);
  if(showI){ box(c0,yi,W,IH,DIMC,'INTERIOR'); const ids=Object.keys(MODS), RW=9, vis=Math.max(1,Math.floor((W-14)/RW));
    const want=bp===1?ids[sel]:bp===2?'almacen':bp===3?'laboratorio':null, si=want?ids.indexOf(want):-1, s0=si>=vis?si-vis+1:0;
    text(c0+2,yi+1,'ESCLUSA',DIMC); text(c0+2,yi+2,'+-----+',DIMC); text(c0+2,yi+3,'| [@] |',DIMC); text(c0+2,yi+4,'+-----+',DIMC);
    let tx=c0+5;
    ids.slice(s0,s0+vis).forEach((id,j)=>{ const M=MODS[id], have=B.mods[id]||0, x=c0+12+j*RW, hue=`hsl(${modHue(id)} 50% 62%)`;
      text(x,yi+1,M.n.slice(0,8),have?hue:DIMC);
      if(have) roomArt(id,k).forEach((l,i)=>text(x,yi+2+i,l,hue)); else text(x,yi+3,'(vacio)',DIMC);
      text(x,yi+5,'x'+have+'/'+(M.max||9),have?HUDC:DIMC); if(s0+j===si&&have) tx=x+3; });
    for(let c=2;c<W-2;c++) put(c0+c,yi+7,'=',DIMC);
    avx+=(tx-avx)*0.15; if(Math.abs(avx)<1) avx=tx; text(Math.round(avx),yi+6,'@',ACC); }
  box(c0,y1,W,n+2,DIMC,['BASE','MODULOS','ALMACEN','INVESTIGACION'][bp]);
  items.forEach((s,i)=>{ const kk=i<n-1?i+1:0, on=i===sel, y=y1+1+i; text(c0+2,y,((on?'> ':'  ')+`[${kk}] ${s}`).slice(0,W-6),on?ACC:kk===0?DIMC:HUDC); if(on) text(c0+W-3,y,'<',ACC); });
  dockGeo={r0:y1+1,c0,w:W,n};
  const fy=y1+n+2; box(c0,fy,W,4,DIMC,''); text(c0+2,fy+1,('> '+menuMsg).slice(0,W-4),ACC); text(c0+2,fy+2,prodSum().slice(0,W-4),DIMC);
}
