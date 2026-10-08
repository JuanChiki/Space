'use strict';
/* Generacion procedural de un planeta (nombre, tipo, atmosfera, anillos...). Determinista: no usa Math.random. */

function genName(r){ const n=2+(r()<0.4?1:0); let s=''; for(let i=0;i<n;i++) s+=SYL[Math.floor(r()*SYL.length)]; return s[0].toUpperCase()+s.slice(1)+'-'+ROM[Math.floor(r()*ROM.length)]; }
function pickType(r){ let x=r(),acc=0; for(const [t,w] of TYPE_W){ acc+=w; if(x<acc) return t; } return 'rocky'; }
function makePlanet(r,id,type,x,y,rad,forceRing){
  const [lo,hi]=RADIUS[type];
  const p={kind:'planet',id,type,x,y,r:rad||(lo+r()*(hi-lo)),
    spin:(0.04+r()*0.12)*(r()<0.2?-1:1),phase:r()*6.28,seed:Math.floor(r()*1e6)+1,
    ring:null,atmo:null,bands:4+Math.floor(r()*5),storm:[r()*6.28-3.14,(r()-0.5)*0.6],fl:Math.floor(r()*3)};
  p.name=(type==='station'?'Estación ':'')+genName(r);
  if(type==='ocean'){p.h1=205;p.h2=95;p.sat=65;p.atmo=205;p.temp=Math.round(2+r()*30);}
  else if(type==='rocky'){p.h1=12+r()*40;p.h2=p.h1+(r()-0.5)*30;p.sat=15+r()*45;p.atmo=r()<0.3?20+r()*30:null;p.temp=Math.round(-90+r()*150);}
  else if(type==='gas'){const base=[35,200,15,320,160][Math.floor(r()*5)];p.h1=base;p.h2=base+(r()-0.5)*45;p.sat=35+r()*35;p.atmo=base;p.temp=Math.round(-170+r()*70);}
  else if(type==='ice'){p.h1=190;p.h2=215;p.sat=30+r()*25;p.atmo=r()<0.25?200:null;p.temp=Math.round(-140+r()*70);}
  else if(type==='lava'){p.h1=4;p.h2=38;p.sat=85;p.temp=Math.round(380+r()*600);}
  else if(type==='desert'){p.h1=32;p.h2=18;p.sat=55+r()*20;p.atmo=r()<0.5?35:null;p.temp=Math.round(25+r()*45);}
  else if(type==='jungle'){p.h1=100;p.h2=185;p.sat=50+r()*20;p.atmo=110;p.temp=Math.round(18+r()*18);}
  else if(type==='crystal'){p.h1=275;p.h2=190;p.sat=55+r()*25;p.atmo=null;p.temp=Math.round(-60+r()*80);}
  else {p.h1=215;p.h2=48;p.sat=14;p.temp=Math.round(18+r()*6);}
  const ringP={gas:.55,ice:.12,rocky:.05,crystal:.25}[type]||0;
  if(forceRing||r()<ringP) p.ring={inner:1.4+r()*0.15,outer:1.85+r()*0.6,tilt:0.2+r()*0.16,rot:(r()-0.5)*0.5,hue:p.h1+(r()-0.5)*20};
  p.grav=type==='station'?1:(p.r/24)*(type==='gas'?1.5:1)*(0.75+r()*0.5);
  const la=-2.2+(r()-0.5)*0.5;
  let L=[Math.cos(la)*0.7,Math.sin(la)*0.6,0.55]; const m=Math.hypot(L[0],L[1],L[2]); p.L=L.map(v=>v/m);
  return p;
}
