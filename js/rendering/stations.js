'use strict';
/* Dibujo de estaciones espaciales y de la base propia: hub central, anillo, paneles y un modulo por cada modulo construido. */

const modHue=id=>(MODS[id]&&MODS[id].hue!=null)?MODS[id].hue:(id.length*53+id.charCodeAt(0)*7)%360;
/* ---- estacion espacial: hub central, anillo giratorio con ventanas, radios, paneles solares y un modulo (pod) por cada modulo construido ---- */
function drawStationArt(wx,wy,pods,seed,isBase){
  const sx=cols/2+(wx-camx)*Z, sy=rows/2+(wy-camy)/RY*Z, ex=31*Z, ey=31*Z/RY;
  if(sx+ex<0||sx-ex>cols||sy+ey<0||sy-ey>rows) return;
  const c0=Math.max(0,Math.floor(sx-ex)), c1=Math.min(cols-1,Math.ceil(sx+ex)), r0=Math.max(0,Math.floor(sy-ey)), r1=Math.min(rows-1,Math.ceil(sy+ey));
  const np=pods.length, rot=t*0.15, PI=Math.PI, steel='hsl(210 14% 58%)', hh=isBase?150:200, blink=(t*2|0)%2;
  const pp=pods.map((q,i)=>{ const a=PI/4+i*2*PI/Math.max(4,np); return {x:14.2*Math.cos(a),y:14.2*Math.sin(a),a,h:q.h}; });
  for(let r=r0;r<=r1;r++){ const y=(r+0.5-sy)*RY/Z;
    for(let c=c0;c<=c1;c++){ const x=(c+0.5-sx)/Z, d=Math.hypot(x,y); let ch=null,col;
      if(d<4.4){ ch=d<2?'@':d<3.3?'O':'0'; col=`hsl(${hh} 30% ${(58-d*6)|0}%)`; if(d<1.1&&blink) col='hsl(48 100% 72%)'; }
      else if(d<5.2){ ch='%'; col='hsl(210 15% 30%)'; }
      else if(d>8.4&&d<10){ const a=Math.atan2(y,x)+rot; ch=(Math.floor(a*6/PI)&1)?'=':'o'; col=ch==='o'?'hsl(48 90% 66%)':steel; }
      else if(d<=8.4){ const a=Math.atan2(y,x), m=((a%(PI/2))+PI/2)%(PI/2); if(d*Math.sin(Math.min(m,PI/2-m))<0.6){ ch='+'; col=steel; } }
      if(!ch){ for(const q of pp){ const dd=Math.hypot(x-q.x,y-q.y);
          if(dd<2.6){ ch=dd<1?(blink?'*':'O'):dd<1.9?'#':'='; col=`hsl(${q.h} 55% ${(56-dd*9)|0}%)`; break; }
          const pr=(x*Math.sin(q.a)-y*Math.cos(q.a)), al=x*Math.cos(q.a)+y*Math.sin(q.a);
          if(Math.abs(pr)<0.5&&al>10&&al<11.8){ ch=Math.abs(Math.cos(q.a))>0.7?'-':'|'; col=steel; break; } } }
      if(!ch&&Math.abs(x)>10&&Math.abs(x)<=17.5&&Math.abs(y)<0.45){ ch='='; col=steel; }
      if(!ch&&Math.abs(y)<4.5&&Math.abs(x)>17.5&&Math.abs(x)<30){ ch=((Math.floor(x*0.9)+Math.floor(y*0.9))&1)?'#':':'; col=ch==='#'?'hsl(215 65% 44%)':'hsl(215 55% 32%)'; }
      if(ch){ const i=r*cols+c; G[i]=ch; GC[i]=col; } } }
  if(isBase) text(Math.round(sx)-2,Math.round(sy-19*Z/RY),'BASE',ACC);
}
