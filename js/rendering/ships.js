'use strict';
/* Dibujo de naves: nave del jugador (modelo compacto con luces y motor) y celdas de enemigos. */

function shipCells(a,des=HULLS[R.sh],pal=palH(SH().hue)){
  const fx=Math.cos(a), fy=Math.sin(a), rx=-fy, ry=fx, out=[], idx=((Math.round(a/(Math.PI/4))%8)+8)%8;
  for(const [f,sv,tk,mir,ci] of des) for(const sd of (mir?[-1,1]:[1])){
    let ch=tk;
    if(tk==='N') ch=NOSE[idx]; else if(tk==='W') ch=lineGlyph(-2*fx+sd*3.5*rx,-2*fy+sd*3.5*ry); else if(tk==='L') ch=lineGlyph(fx,fy); else if(tk==='T') ch=lineGlyph(rx,ry);
    let col=pal[ci];
    if(ci===3&&pal!==PW) col=`hsl(${22+((t*20+f)|0)%3*6} 95% ${52+((t*17+f)|0)%3*8}%)`;
    else if(ci===4&&typeof col!=='string') col=Math.sin(t*5+(sd>0?0:3))>-0.3?col[sd>0?1:0]:pal[1];
    out.push([f*fx+sd*sv*rx,f*fy+sd*sv*ry,ch,col]);
  }
  return out;
}
function buildShip(thr){
  const u=R.u, wk=R.wp===1?'pulse':R.wp===2?'cannon':u.laser>0?'laser':null, el=engLvl();
  const rows=SHB.concat(SHE[el]).map(r=>r.split(''));
  if(wk) for(const i in SHW[wk]) rows[+i]=SHW[wk][i].split('');
  const ac=u.hull>=4?'#':':';
  for(const [i,c] of [[7,4],[7,8],[6,4],[6,8],[5,4],[5,8],[8,3],[8,9],[9,3],[9,9]].slice(0,u.hull*2)) if(rows[i][c]===' ') rows[i][c]=ac;
  [6,4,8,3,9].slice(0,u.cargo).forEach(c=>{ rows[10][c]='='; });
  if(thr) for(const c of NOZ[el]) for(let k=0;k<(thr>1?4:2);k++){ const rr=13+k; while(rows.length<=rr) rows.push(Array(13).fill(' '));
    const put1=(cc,ch)=>{ if(h2(c*3+k+cc,(t*18)|0,5)<0.88) rows[rr][cc]=ch; };
    if(k===0){ put1(c-1,'\\'); put1(c,'|'); put1(c+1,'/'); } else put1(c,k===3?'.':':'); }
  const tag=(r,c,ch)=>{ if(ch==='*') return 'l'; if((r===3&&(c===5||c===7))||(r===4&&c===6)) return 'w'; if(r>=13) return 'f'; if(r===12&&(ch==='('||ch===')')) return 'n'; if(r===11) return 'd';
    if(ch===':'||ch==='#') return 'a'; if(ch==='+') return 'x'; if(r===10&&ch==='=') return 'c';
    if(wk&&r>=4&&r<=9&&(c<=1||c>=11||(wk==='cannon'&&r<=7&&(c===2||c===10)))) return 'g'; if(r>=5&&r<=9&&(c===5||c===7)) return 'd'; return 'h'; };
  return rows.map((row,r)=>row.map((ch,c)=>[ch,ch===' '?0:tag(r,c,ch)]));
}
function shipCol(tag,sr,sc,thr,sd){
  const h=SH().hue;
  switch(tag){
    case 'h': return `hsl(${h} 40% 82%)`;
    case 'd': return `hsl(${h} 30% 52%)`;
    case 'w': return `hsl(195 95% ${(66+Math.sin(t*2+sc)*8)|0}%)`;
    case 'n': return `hsl(${22+((t*20+sc)|0)%3*6} 95% ${52+((t*17+sc)|0)%3*8}%)`;
    case 'N': return `hsl(185 100% ${(80+Math.sin(t*7)*10)|0}%)`;
    case 'l': { const L=sd!==undefined?sd<0:sc<6; return Math.sin(t*4+(L?0:3))>-0.2?(L?'hsl(0 90% 62%)':'hsl(140 85% 62%)'):`hsl(${h} 30% 40%)`; }
    case 'gf': return 'hsl(48 100% 70%)';
    case 'g': return 'hsl(48 100% 70%)';
    case 'x': return `hsl(185 100% ${(62+Math.sin(t*6)*14)|0}%)`;
    case 'a': return 'hsl(205 35% 66%)';
    case 'c': return 'hsl(30 55% 52%)';
    default: { const fl=sr-13; return thr>1?`hsl(${(48-fl*8)|0} 100% ${(88-fl*9)|0}%)`:`hsl(${(30-fl*7)|0} 95% ${(62-fl*8)|0}%)`; }
  }
}
function shipSprite(a,thr){
  const fx=Math.cos(a), fy=Math.sin(a), rx=-fy, ry=fx, out=[], idx=((Math.round(a/(Math.PI/4))%8)+8)%8, h=SH().hue;
  const P=(f,s,ch,col)=>out.push([Math.round((f*fx+s*rx)*Z),Math.round((f*fy+s*ry)*Z/RY),ch,col]);
  const seg=(f0,s0,f1,s1,ch,col)=>{ if(Z<=1.001){ P(f0,s0,ch,col); P(f1,s1,ch,col); return; }   // con zoom se rellenan los huecos
    const n=Math.ceil(Math.hypot(f1-f0,s1-s0)*Z/1.3); for(let i=0;i<=n;i++) P(f0+(f1-f0)*i/n,s0+(s1-s0)*i/n,ch,col); };
  const hull=`hsl(${h} 40% 82%)`, dark=`hsl(${h} 30% 62%)`;
  for(const sd of [-1,1]){
    const g=lineGlyph(-2*fx+sd*3.5*rx,-2*fy+sd*3.5*ry);
    seg(-0.5,sd*1.6,-1.5,sd*3.4,g,hull);
    const on=Math.sin(t*4+(sd<0?0:3))>-0.2;                       // bombillitos que parpadean
    P(-2.4,sd*4.2,'*',on?(sd<0?'hsl(0 90% 62%)':'hsl(140 85% 62%)'):`hsl(${h} 30% 40%)`);
  }
  const fl=22+((t*20)|0)%3*6, fli=52+((t*17)|0)%3*8;
  P(-2.5,0,'=',`hsl(${fl} 95% ${fli}%)`);
  if(thr) P(-3.7,0,thr>1?'*':':',`hsl(${thr>1?48:30} 100% ${thr>1?85:62}%)`);
  if(Z<=1.001){ P(-1,0,'#',dark); P(1,0,'@','hsl(195 95% 72%)'); P(3,0,'#',hull); }
  else { seg(-1,0,1,0,'#',dark); seg(1,0,3,0,'#',hull); P(1,0,'@','hsl(195 95% 72%)'); }
  P(4.6,0,NOSE[idx],`hsl(185 100% ${(80+Math.sin(t*7)*10)|0}%)`);
  return out;
}
function drawShip(sx,sy){
  const scol=Math.round(sx), srow=Math.round(sy);
  for(const [dc,dr,ch,col] of shipSprite(ship.a,keys.up?(keys.shift?2:1):0)) put(scol+dc,srow+dr,ch,col);
  const fx=Math.cos(ship.a), fy=Math.sin(ship.a);   // guia de punteria: rumbo exacto
  for(let k=0;k<3;k++){ const d=(20+k*6+((t*8)%6))*Z; put(scol+Math.round(fx*d),srow+Math.round(fy*d/RY),k===0?':':'.',`hsl(190 45% ${58-k*10}%)`); }
}
