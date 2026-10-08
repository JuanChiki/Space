'use strict';
/* Economia: precios dinamicos con saturacion y eventos, combustible, componentes, venta de carga. */

const cost=k=>Math.round(100*Math.pow(R.u[k]+1,1.6));
const fuelP=st=>1.5*(1-disc(st))*(profOf(st).n==='Minera'?0.8:1), compP=st=>Math.max(1,Math.round(45*(profOf(st).n==='Cientifica'?0.7:1)*(1-disc(st)))), cn=k=>Math.floor(R.u[k]/2);
function evOf(st){ const x=Math.floor(st.x), y=Math.floor(st.y), d=Math.floor((R.clk||0)/600), h=h3(x,y,d,91); if(h>0.2) return null; return {g:GK[Math.floor(h/0.2*GK.length)],m:h3(x,y,d,92)<0.5?1.6:0.6}; }
function satOf(st,g){ const e=R.mk[st.id+'|'+g]; if(!e) return 0; const d=((R.clk||0)-e.t)/15; return e.v>0?Math.max(0,e.v-d):Math.min(0,e.v+d); }
function pushMk(st,g,n){ R.mk[st.id+'|'+g]={v:satOf(st,g)+n,t:R.clk||0}; }
function mid(st,g){ const P=profOf(st), x=Math.floor(st.x), y=Math.floor(st.y), k=GK.indexOf(g),
  b=GOODS[g][1]*(0.75+0.5*h2(x,y,k+11)), pf=P.s.includes(g)?0.7:P.d.includes(g)?1.4:1, dr=1+0.12*Math.sin((R.clk||0)/240+h2(x,k,5)*6.28);
  const ev=evOf(st); return b*pf*dr*(ev&&ev.g===g?ev.m:1)*clamp(1-0.04*satOf(st,g),0.45,1.7); }
const price=(st,g)=>Math.max(1,Math.round(mid(st,g)*0.92*(1+disc(st)*0.5))), buyP=(st,g)=>Math.max(1,Math.round(mid(st,g)*1.12*(1-disc(st))));
function snap(st){ const p={}; for(const g of GK) p[g]=[price(st,g),buyP(st,g)]; R.seen[st.id]={n:st.name,t:R.clk||0,pr:profOf(st).n,p}; }
function sellAll(doit){ let v=0,n=0; for(const g of GK){ const u=R.cg[g]||0; if(u){ v+=Math.round(u*price(docked,g)); n+=u; if(doit){ R.cg[g]=0; pushMk(docked,g,u); } } } if(doit){ R.cr+=v; gain(Math.round(n)); tradeRep(docked,n); } return v; }
