'use strict';
/* Matematica base: hash, ruido, fbm, generador pseudoaleatorio con semilla. Sin dependencias. */

function h2(x,y,s){ let h = Math.imul(x|0,374761393) ^ Math.imul(y|0,668265263) ^ Math.imul(s|0,2246822519); h = Math.imul(h ^ (h>>>13),1274126177); h ^= h>>>16; return (h>>>0)/4294967296; }
function h3(x,y,z,s){ let h = Math.imul(x,374761393) ^ Math.imul(y,668265263) ^ Math.imul(z,1442695041) ^ Math.imul(s,2246822519); h = Math.imul(h ^ (h>>>13),1274126177); h ^= h>>>16; return (h>>>0)/4294967296; }
function noise3(x,y,z,s){
  const xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z);
  let xf=x-xi, yf=y-yi, zf=z-zi;
  xf=xf*xf*(3-2*xf); yf=yf*yf*(3-2*yf); zf=zf*zf*(3-2*zf);
  const a=h3(xi,yi,zi,s), b=h3(xi+1,yi,zi,s), c=h3(xi,yi+1,zi,s), d=h3(xi+1,yi+1,zi,s);
  const e=h3(xi,yi,zi+1,s), f=h3(xi+1,yi,zi+1,s), g=h3(xi,yi+1,zi+1,s), k=h3(xi+1,yi+1,zi+1,s);
  const x1=a+(b-a)*xf, x2=c+(d-c)*xf, x3=e+(f-e)*xf, x4=g+(k-g)*xf;
  const y1=x1+(x2-x1)*yf, y2=x3+(x4-x3)*yf;
  return y1+(y2-y1)*zf;
}
function fbm(x,y,z,s,o){ let a=0.5,f=1,sum=0,n=0; for(let i=0;i<o;i++){ sum+=a*noise3(x*f,y*f,z*f,s+i*17); n+=a; a*=0.5; f*=2.03; } return sum/n; }
function rng(seed){ let a=seed>>>0; return () => { a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
