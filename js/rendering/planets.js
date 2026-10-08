'use strict';
/* Dibujo de planetas: textura de superficie por tipo, sombreado, anillos. */

const SV=[0,0,0,0]; // albedo, mezcla de tono, emisión, blancura
function surface(p,px,py,pz,t){
  const s=p.seed;
  switch(p.type){
    case 'ocean':{
      const n=fbm(px*2.1+3,py*2.1,pz*2.1,s,4);
      const cl=fbm(px*3.2+t*0.03,py*3.6,pz*3.2,s+99,3);
      let a,m,w=0;
      if(n>0.53){ a=0.55+(n-0.53)*1.4; m=Math.min(1,0.75+(n-0.53)*1.5); } else { a=0.3+n*0.22; m=0; }
      if(Math.abs(py)>0.86-n*0.1){ a=0.95; w=0.9; m=0; }
      if(cl>0.58){ const c=Math.min(1,(cl-0.58)*4); a+=(0.98-a)*c; w=Math.max(w,c*0.95); }
      SV[0]=a;SV[1]=m;SV[2]=0;SV[3]=w; return; }
    case 'rocky':{
      const n=fbm(px*2.6,py*2.6,pz*2.6,s,5);
      const ridge=Math.abs(noise3(px*6,py*6,pz*6,s+5)-0.5)*2;
      SV[0]=0.28+n*0.7-(ridge<0.12?0.14:0); SV[1]=n; SV[2]=0; SV[3]=0; return; }
    case 'ice':{
      const n=fbm(px*3,py*3,pz*3,s,4);
      const crack=Math.abs(noise3(px*5,py*5,pz*5,s+9)-0.5);
      SV[0]=(0.65+n*0.35)*(crack<0.03?0.55:1); SV[1]=n; SV[2]=0; SV[3]=0.35; return; }
    case 'gas':{
      const warp=(fbm(px*2,py*3.5,pz*2,s,3)-0.5)*0.35;
      const band=0.5+0.5*Math.sin((py+warp)*p.bands*Math.PI);
      const fine=fbm(px*1.5,py*10,pz*1.5,s+3,2);
      let a=0.36+0.4*band+(fine-0.5)*0.25, m=band, w=0;
      const lon=Math.atan2(px,pz);
      const dl=Math.atan2(Math.sin(lon-p.storm[0]),Math.cos(lon-p.storm[0])), da=py-p.storm[1];
      const sd=(dl*dl)/0.09+(da*da)/0.012;
      if(sd<1){ a=0.88-0.3*sd; m=1-m; w=0.2; }
      SV[0]=a;SV[1]=clamp(m,0,1);SV[2]=0;SV[3]=w; return; }
    case 'desert':{ const n=fbm(px*2,py*2,pz*2,s,3), d=Math.sin(pz*6+px*4+n*5);
      SV[0]=0.5+0.22*d+(n-0.5)*0.3; SV[1]=(d+1)/2; SV[2]=0; SV[3]=Math.abs(py)>0.93?0.7:0; return; }
    case 'jungle':{ const n=fbm(px*2.3+3,py*2.3,pz*2.3,s,4), m=fbm(px*5,py*5,pz*5,s+3,3), cl=fbm(px*3.2+t*0.03,py*3.6,pz*3.2,s+99,3);
      let a=n>0.46?0.3+n*0.5:0.22+n*0.2, w=0; if(cl>0.6){ const c=Math.min(1,(cl-0.6)*4); a+=(0.95-a)*c; w=c*0.9; }
      SV[0]=a; SV[1]=n>0.46?0.1+m*0.3:0.95; SV[2]=0; SV[3]=w; return; }
    case 'crystal':{ const c=h3(Math.floor(px*5+8),Math.floor(py*5+8),Math.floor(pz*5+8),s);
      SV[0]=0.3+c*0.55; SV[1]=c; SV[2]=c>0.88?0.45:0; SV[3]=0.3; return; }
    case 'lava':{
      const n=fbm(px*2.4,py*2.4,pz*2.4,s,4);
      const vein=Math.abs(noise3(px*3.5+n,py*3.5,pz*3.5,s+7)-0.5);
      let em=0; if(vein<0.05) em=(0.05-vein)*16;
      SV[0]=0.1+n*0.25; SV[1]=em>0?clamp(0.3+em,0,1):n*0.3; SV[2]=em*0.9; SV[3]=0; return; }
    default:{ // estación
      const lat=Math.asin(clamp(py,-1,1)), lon=Math.atan2(px,pz);
      const hh=h3(Math.floor(lat*8.5+40),Math.floor(lon*6.5+40),3,s);
      let a=0.38+hh*0.32,m=0,em=0;
      const fl=(lat*8.5+40)%1, fo=(lon*6.5+40)%1;
      if(fl<0.07||fo<0.05) a=0.14;
      if(Math.abs(lat)<0.05) a=0.08;
      if(hh>0.9){ em=0.45; m=1; }
      const dd=px*0.42+py*0.32+pz*0.85;
      if(dd>0.92){ a=dd<0.94?0.75:(dd>0.985?0.05:0.22); em=0; m=0; if(dd>0.9985){ em=1; m=1; } }
      SV[0]=a;SV[1]=m;SV[2]=em;SV[3]=0; return; }
  }
}
const RAMP=' .,:;-=+*#%@';
const RING_RAMP=' .:-=+#';
function drawPlanet(p0){
  if(p0.type==='station'){ drawStationArt(p0.x,p0.y,[0,1,2,3].map(i=>({h:((p0.h1|0)+i*70)%360})),p0.seed|0,false); return; }
  const p=Z===1?p0:{...p0,x:camx+(p0.x-camx)*Z,y:camy+(p0.y-camy)*Z,r:p0.r*Z};
  const cx=cols/2+(p.x-camx), cy=rows/2+(p.y-camy)/RY;
  const ext=p.ring?p.r*p.ring.outer:p.r*1.15, exr=ext/RY;
  if(cx+ext<0||cx-ext>cols||cy+exr<0||cy-exr>rows) return;
  const c0=Math.max(0,Math.floor(cx-ext)), c1=Math.min(cols-1,Math.ceil(cx+ext));
  const r0=Math.max(0,Math.floor(cy-exr)), r1=Math.min(rows-1,Math.ceil(cy+exr));
  const spin=t*p.spin+p.phase, cs=Math.cos(spin), sn=Math.sin(spin);
  const L=p.L, rc=p.r, R2=rc*rc, A2=(rc*1.12)*(rc*1.12);
  let rcR=1,rsR=0; if(p.ring){ rcR=Math.cos(p.ring.rot); rsR=Math.sin(p.ring.rot); }
  for(let r=r0;r<=r1;r++){
    const dy=(r+0.5-cy)*RY;
    for(let c=c0;c<=c1;c++){
      const dx=c+0.5-cx, d2=dx*dx+dy*dy;
      let ringCh=null,ringCol=null,front=false;
      if(p.ring){
        const qx=dx*rcR+dy*rsR, qy=-dx*rsR+dy*rcR;
        const qt=qy/p.ring.tilt;
        const ei=Math.sqrt(qx*qx+qt*qt)/rc;
        if(ei>p.ring.inner&&ei<p.ring.outer){
          const u=(ei-p.ring.inner)/(p.ring.outer-p.ring.inner);
          let dens=0.45+0.35*Math.sin(u*23+p.seed*0.01)+0.25*Math.sin(u*57+1.3);
          if(u>0.62&&u<0.7) dens-=0.7;
          if(u<0.08||u>0.92) dens*=0.6;
          dens=clamp(dens,0,1);
          const k=Math.floor(dens*5.99);
          if(k>0){ ringCh=RING_RAMP[k]; ringCol=`hsl(${p.ring.hue|0} 28% ${(22+dens*42)|0}%)`; front=qy>0; }
        }
      }
      const i=r*cols+c;
      if(d2<=R2){
        const nx=dx/rc, ny=dy/rc, nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
        surface(p,nx*cs+nz*sn,ny,-nx*sn+nz*cs,t);
        const lam=nx*L[0]+ny*L[1]+nz*L[2];
        const lit=lam>0?Math.pow(lam,0.8):0;
        let s=SV[0]*(0.045+0.955*lit)+SV[2]; if(s>1) s=1;
        const k=Math.floor(s*11.99);
        let ch=RAMP[k], col;
        const hue=p.h1+(p.h2-p.h1)*SV[1], sat=p.sat*(1-0.85*SV[3]), light=8+s*72;
        col=`hsl(${hue|0} ${sat|0}% ${light|0}%)`;
        if(ringCh&&front){ ch=ringCh; col=ringCol; }
        G[i]=ch; GC[i]=col;
      } else if(ringCh){
        G[i]=ringCh; GC[i]=ringCol;
      } else if(p.atmo!==null&&d2<=A2){
        const lit=(dx*L[0]+dy*L[1])/Math.sqrt(d2);
        if(lit>-0.3){ G[i]=lit>0.4?':':'.'; GC[i]=`hsl(${p.atmo|0} 70% ${(20+Math.max(lit,0)*35)|0}%)`; }
      }
    }
  }
}
