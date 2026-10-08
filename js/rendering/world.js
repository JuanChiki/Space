'use strict';
/* Dibujo del mundo: nebulosa, estrellas, asteroides, senales y entidades de combate (botin, disparos, enemigos). */

const LAYERS=[{p:0.08,d:0.016,l:30},{p:0.22,d:0.009,l:42},{p:0.5,d:0.004,l:62}];
function drawNebula(){
  const wx0=Math.floor(camx*0.06*Z), wy0=Math.floor(camy*0.06/RY*Z);
  const st=Z>=1.5?2:1;                                  // paso del ruido: con simbolos pequenos basta calcularlo cada 2 celdas
  const gx0=Math.floor(wx0/st), gy0=Math.floor(wy0/st), gw=Math.ceil(cols/st)+2, gh=Math.ceil(rows/st)+2;
  const NB=new Float32Array(gw*gh);
  for(let gy=0;gy<gh;gy++) for(let gx=0;gx<gw;gx++) NB[gy*gw+gx]=fbm((gx+gx0)*st*0.03/Z,(gy+gy0)*st*RY*0.03/Z,0.5,77,2);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const wx=c+wx0, wy=r+wy0;
      const n=NB[(Math.floor(wy/st)-gy0)*gw+(Math.floor(wx/st)-gx0)];
      if(n<=0.55) continue;
      const dens=(n-0.55)*4.2;
      const h=h2(wx,wy,5);
      if(h<dens){ const i=r*cols+c; G[i]=h<dens*0.35?':':'.'; GC[i]=`hsl(${(245+(n-0.5)*170)|0} 55% ${(8+(n-0.5)*34)|0}%)`; }
    }
  }
}
function drawStars(){
  for(let li=0;li<3;li++){
    const L=LAYERS[li]; const ox=Math.floor(camx*L.p*Z), oy=Math.floor(camy*L.p/RY*Z), Ld=L.d/(Z*Z);
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const h=h2(c+ox,r+oy,li+1); if(h>=Ld) continue;
        const sub=h/Ld;
        const ch=li===0?'.':li===1?(sub<0.7?'.':'+'):(sub<0.5?'.':sub<0.85?'+':'*');
        const hk=(h*977)%1; const hue=hk<0.6?210:hk<0.85?40:350;
        const tw=0.7+0.3*Math.sin(t*(0.9+sub*2.4)+sub*61);
        const i=r*cols+c; G[i]=ch; GC[i]=`hsl(${hue} 45% ${(L.l*tw)|0}%)`;
      }
    }
  }
}
const ROCK_RAMP=' .:-=+*#%';
const RL=(()=>{ const v=[-0.6,-0.5,0.62]; const m=Math.hypot(...v); return v.map(x=>x/m); })();
function drawRock(a0){
  const a=Z===1?a0:{...a0,x:camx+(a0.x-camx)*Z,y:camy+(a0.y-camy)*Z,r:a0.r*Z};
  const cx=cols/2+(a.x-camx), cy=rows/2+(a.y-camy)/RY;
  const ext=a.r*1.3, exr=ext/RY;
  if(cx+ext<0||cx-ext>cols||cy+exr<0||cy-exr>rows) return;
  const c0=Math.max(0,Math.floor(cx-ext)), c1=Math.min(cols-1,Math.ceil(cx+ext));
  const r0=Math.max(0,Math.floor(cy-exr)), r1=Math.min(rows-1,Math.ceil(cy+exr));
  const spin=t*a.spin+a.phase, cs=Math.cos(spin), sn=Math.sin(spin);
  const hue=a.rk==='rock'?28:a.rk==='ice'?200:38, sat=a.rk==='rock'?14:a.rk==='ice'?38:34;
  for(let r=r0;r<=r1;r++){
    const dy=(r+0.5-cy)*RY;
    for(let c=c0;c<=c1;c++){
      const dx=c+0.5-cx, d=Math.sqrt(dx*dx+dy*dy);
      if(d>ext) continue;
      const ang=Math.atan2(dy,dx);
      const edge=a.r*(0.72+0.5*noise3(Math.cos(ang)*1.4+5,Math.sin(ang)*1.4+5,0.5,a.seed));
      if(d>edge) continue;
      const nx=dx/edge, ny=dy/edge, nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      const tex=noise3((nx*cs+nz*sn)*3+a.seed%7,ny*3,(-nx*sn+nz*cs)*3,a.seed);
      const lam=Math.max(0,nx*RL[0]+ny*RL[1]+nz*RL[2]);
      const s=(0.25+0.75*tex)*(0.15+0.85*lam);
      const k=Math.max(1,Math.floor(s*8.99));
      const i=r*cols+c; G[i]=ROCK_RAMP[k]; GC[i]=`hsl(${hue} ${sat}% ${(14+s*60)|0}%)`;
    }
  }
}
function drawRegionFx(){ if(!curRegK||curRegK==='void') return; const H=REG[curRegK].hue, tt=Math.floor(t*3), n=Math.floor(cols*rows*0.04);
  for(let i=0;i<n;i++){ const c=(h2(i,7,903)*cols+tt*0.3)%cols|0, r=(h2(i,9,907)*rows+(curRegK==='storm'?tt*2:0))%rows|0; put(c,r,h2(i,tt>>1,5)<0.5?':':'.',`hsl(${H} 45% ${24+(h2(i,3,2)*18|0)}%)`); }
  if(curRegK==='storm'&&h2(t*6|0,1,2)>0.9){ let c=(h2(t*6|0,2,3)*cols)|0; for(let r=0;r<rows;r++){ c+=h2(r,t*6|0,4)<0.5?-1:1; put(c,r,h2(r,1,4)<0.5?'/':'\\','hsl(190 100% 82%)'); } } }
function drawRpg(){
  const W=o=>[Math.round(cols/2+(o.x-camx)*Z),Math.round(rows/2+(o.y-camy)/RY*Z)];
  if(R.base){ const pods=[]; for(const id in R.base.mods) for(let i=0;i<R.base.mods[id];i++) pods.push({h:modHue(id)}); drawStationArt(R.base.x,R.base.y,pods,17,true); }
  for(const l of loot){ const [c,r]=W(l); put(c,r,(t*4|0)%2?'*':'+',`hsl(${l.h} 70% 62%)`); }
  for(const s of shots){ const [c,r]=W(s); put(c,r,s.e?(s.ch||'o'):s.w===1?'.':s.w===2?'O':s.w===3?'@':lineGlyph(s.vx,s.vy),s.e?(s.cl||'hsl(355 90% 62%)'):s.w===3?'hsl(150 90% 62%)':s.w===4?'hsl(200 100% 78%)':'hsl(48 100% 72%)'); }
  for(const f of foes){ const [c,r]=W(f), F=FOE[f.k||'raider'], col=f.fl>0?'hsl(40 100% 90%)':F.pal[0]; const fh=Math.round(F.h*Z); if(f.boss) text(c-2,r-fh-2,'JEFE',col); text(c-3,r-fh-1,'['+bar(f.hp/(f.mhp||f.hp),5)+']',col);
    const zn=Math.ceil(Z-0.01);
    for(const [ux,uy,ch,cl] of shipCells(f.a,F.des,f.fl>0?PW:F.pal)){ const cc=c+Math.round(ux*Z), rr=r+Math.round(uy/RY*Z);
      put(cc,rr,ch,cl); if(zn>1&&ch==='#') for(let i=0;i<zn;i++) for(let j=0;j<Math.ceil(zn/2);j++) if(i||j) put(cc+i,rr+j,ch,cl); } }
}
function drawSignal(g){
  const c=Math.round(cols/2+(g.x-camx)*Z), r=Math.round(rows/2+(g.y-camy)/RY*Z);
  if(c<-10||c>cols+10||r<-5||r>rows+5) return;
  const known=discovered.has(g.id), pul=0.5+0.5*Math.sin(t*2.4+g.phase);
  const spr=(lines,col)=>lines.forEach((ln,i)=>text(c-(ln.length>>1),r+i-(lines.length>>1),ln,col));
  if(!known){ put(c,r,'?',`hsl(36 100% ${(38+pul*30)|0}%)`); if(pul>0.6){ put(c-2,r,'.',DIMC); put(c+2,r,'.',DIMC); } return; }
  const S=SIG[g.st], col=`hsl(${S.hue} 45% 62%)`;
  if(g.st==='derelict') spr(['  _/\\_  ','<=[##]=>','  \\__/  '],col);
  else if(g.st==='ruins') spr([' #=#  # ',' x#=#x  ','#=x#=## '],col);
  else if(g.st==='beacon') spr([pul>0.5?'(( ! ))':' ( ! ) '],`hsl(48 100% ${(45+pul*25)|0}%)`);
  else if(g.st==='debris'){ for(let i=0;i<9;i++) put(c+Math.round((h2(g.seed,i,1)-0.5)*14),r+Math.round((h2(g.seed,i,2)-0.5)*4),".,'`:%"[Math.floor(h2(g.seed,i,3)*6)],col); }
  else if(g.st==='monolith') spr(['  .-.  ',' |#|#| ',' |#|#| ',' |#|#| ','_|___|_'],`hsl(40 ${(25+pul*40)|0}% ${(55+pul*20)|0}%)`);
  else if(g.st==='vault') spr(['  _/^\\_  ',' /_|=|_\\ ','|__| |__|'],`hsl(40 50% ${(45+pul*25)|0}%)`);
  else if(g.st==='rift'){ const gl='\\|/-'[Math.floor(t*8)%4]; spr(['  '+gl+'  ','--(@)--','  '+gl+'  '],`hsl(${((300+t*60)%360)|0} 80% ${(50+pul*25)|0}%)`); }
  else if(g.st==='echo') spr([pul>0.5?' )) ? (( ':'  ) ? (  '],`hsl(190 60% ${(45+pul*25)|0}%)`);
  else if(g.st==='ghost') spr(['  _/\\_  ',' <_oo_> ',' /____\\ '],`hsl(180 25% ${(35+pul*35)|0}%)`);
  else if(g.st==='anomaly'){ const gl='?!%&@$#'[Math.floor(t*6+g.phase*3)%7]; spr(['  /\\  ',' <'+gl+gl+'> ','  \\/  '],`hsl(${(275+Math.sin(t)*25)|0} 70% ${(50+pul*25)|0}%)`); }
  else put(c,r,'.',DIMC);
}
