'use strict';
/* Motor de dibujo ASCII: rejilla de celdas, capas (mundo/interfaz), alta resolucion, primitivas (put, text, box, wrap) y volcado al canvas. */

let fs=touchUI?11:14, cols=80, rows=30, cw=8, chh=16, RY=2, dpr=1, vw=0, vh=0, ox0=0, oy0=0, G=[], GC=[];
let userFs=BASE_FS, Z=1, layered=false, capped=false;
let cwU=8, chhU=16, RYU=2, colsU=80, rowsU=30, ox0U=0, oy0U=0, GU=[], GCU=[];
function wantFs(){
  if(!vw) return BASE_FS;                       // en la superficie de un planeta: tamaño normal
  let f=Math.min(FS_MAX,Math.max(FS_MIN,userFs));
  capped=f>userFs; return f;
}
function setup(){
  const rect=cv.getBoundingClientRect(); vw=rect.width||window.innerWidth||800; vh=rect.height||window.innerHeight||600;
  dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.max(1,Math.floor(vw*dpr)); cv.height=Math.max(1,Math.floor(vh*dpr));
  fs=wantFs();
  ctx.font=`400 ${fs}px ${FONT}`;
  cw=ctx.measureText('M').width||fs*0.6; chh=Math.round(fs*1.22); RY=chh/cw;
  cols=Math.max(20,Math.floor(vw/cw)); rows=Math.max(10,Math.floor(vh/chh));
  ox0=(vw-cols*cw)/2; oy0=(vh-rows*chh)/2;
  G=new Array(cols*rows).fill(' '); GC=new Array(cols*rows).fill('');
  Z=fs<BASE_FS?BASE_FS/fs:1;
  layered=fs!==BASE_FS;
  if(layered){
    ctx.font=`400 ${BASE_FS}px ${FONT}`;
    cwU=ctx.measureText('M').width||BASE_FS*0.6; chhU=Math.round(BASE_FS*1.22); RYU=chhU/cwU;
    colsU=Math.max(20,Math.floor(vw/cwU)); rowsU=Math.max(10,Math.floor(vh/chhU));
    ox0U=(vw-colsU*cwU)/2; oy0U=(vh-rowsU*chhU)/2;
    GU=new Array(colsU*rowsU).fill(' '); GCU=new Array(colsU*rowsU).fill('');
  } else { cwU=cw; chhU=chh; RYU=RY; colsU=cols; rowsU=rows; ox0U=ox0; oy0U=oy0; GU=G; GCU=GC; }
  ctx.font=`400 ${fs}px ${FONT}`; ctx.textBaseline='middle';
}
function withUI(fn){
  if(!layered){ fn(); return; }
  const sv=[cols,rows,cw,chh,RY,G,GC,ox0,oy0,Z];
  cols=colsU; rows=rowsU; cw=cwU; chh=chhU; RY=RYU; G=GU; GC=GCU; ox0=ox0U; oy0=oy0U; Z=1;
  try{ fn(); } finally{ [cols,rows,cw,chh,RY,G,GC,ox0,oy0,Z]=sv; }
}
function put(c,r,ch,col){ if(c<0||r<0||c>=cols||r>=rows) return; const i=r*cols+c; G[i]=ch; GC[i]=col; }
function text(c,r,s,col,solid){ for(let i=0;i<s.length;i++){ if(solid||s[i]!==' ') put(c+i,r,s[i],col); } }
function box(c0,r0,w,h,col,title){
  for(let r=0;r<h;r++) for(let c=0;c<w;c++){
    const top=r===0,bot=r===h-1,l=c===0,rt=c===w-1; let ch=' ';
    if((top||bot)&&(l||rt)) ch='+'; else if(top||bot) ch='-'; else if(l||rt) ch='|';
    put(c0+c,r0+r,ch,col);
  }
  if(title) text(c0+2,r0,' '+title+' ',col,true);
}
function wrap(str,w){ const out=[]; let line=''; for(const wd of str.split(' ')){ if((line+' '+wd).trim().length>w){ out.push(line); line=wd; } else line=(line+' '+wd).trim(); } if(line) out.push(line); return out; }
/* ---- alta resolucion: al alejar, cada caracter del arte original pasa a ser 4 (2x2) con plantillas que conservan la forma ---- */
const TPL={'/':' // ','\\':'\\  \\','|':'| | ','-':'  --','_':'  __','=':'----','^':'/\\  ','v':'  \\/','<':' / \\','>':'\\ / ','o':'/\\\\/','O':'/\\\\/','.':'  . ',':':'. . ','*':'\\//\\'};
function blk(c,r,ch,col){ if(Z<1.5){ put(c,r,ch,col); return; } const q=TPL[ch]; for(let j=0;j<2;j++) for(let i=0;i<2;i++){ const x=q?q[j*2+i]:ch; if(x!==' ') put(c+i,r+j,x,col); } }
function upscaleU(){ for(let r=0;r<rows;r++){ const sr=Math.min(rowsU-1,Math.floor(r/Z)), fy=(r/Z-sr)>=0.5?1:0;
  for(let c=0;c<cols;c++){ const sc=Math.min(colsU-1,Math.floor(c/Z)), ch=GU[sr*colsU+sc]; if(ch===' ') continue;
    const fx=(c/Z-sc)>=0.5?1:0, q=TPL[ch], x=q?q[fy*2+fx]:ch; if(x!==' '){ G[r*cols+c]=x; GC[r*cols+c]=GCU[sr*colsU+sc]; } } } }
function lineGlyph(vx,vy){ let ph=Math.atan2(vy,vx); if(ph<0) ph+=Math.PI; if(ph>=Math.PI) ph-=Math.PI; const q=ph/(Math.PI/8); if(q<1||q>=7) return '-'; if(q<3) return '\\'; if(q<5) return '|'; return '/'; }
const NOSE=['>','\\','v','/','<','\\','^','/'];
function blitLayer(Gx,GCx,nc,nr,cwx,chx,ox,oy,px,ui,shx,shy){
  ctx.font=`400 ${px}px ${FONT}`; ctx.textBaseline='middle';
  ctx.setTransform(dpr,0,0,dpr,(ox+shx)*dpr,(oy+shy)*dpr);
  let last=null;
  for(let r=0;r<nr;r++){
    const base=r*nc, y=r*chx+chx/2;
    for(let c=0;c<nc;c++){
      const ch=Gx[base+c];
      if(ch===' '){ if(ui&&GCx[base+c]){ ctx.fillStyle=BG; ctx.fillRect(c*cwx,r*chx,cwx+0.6,chx); last=null; } continue; }   // hueco solido de la interfaz
      const col=GCx[base+c]; if(col!==last){ ctx.fillStyle=col; last=col; }
      ctx.fillText(ch,c*cwx,y);
    }
  }
}
function blit(){
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle=BG; ctx.fillRect(0,0,vw,vh);
  const sx=shake>0.02?(Math.random()-0.5)*shake*cw*1.4:0, sy=shake>0.02?(Math.random()-0.5)*shake*chh*0.8:0;
  blitLayer(G,GC,cols,rows,cw,chh,ox0,oy0,fs,false,sx,sy);
  if(layered) blitLayer(GU,GCU,colsU,rowsU,cwU,chhU,ox0U,oy0U,BASE_FS,true,sx,sy);
}
function wrapT(str,w){ const o=[]; let l=''; for(const wd of str.split(' ')){ if((l+' '+wd).trim().length>w){ o.push(l); l=wd; } else l=(l+' '+wd).trim(); } if(l) o.push(l); return o; }
const bar=(f,n)=>{ f=Math.round(clamp(f,0,1)*n); return '#'.repeat(f)+'-'.repeat(n-f); };
