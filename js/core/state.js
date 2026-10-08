'use strict';
/* Estado transversal de la partida en vuelo: nave, camara, tiempo, teclas, entorno cercano y avisos (toast). */

const ship={x:0,y:0,vx:0,vy:0,a:-Math.PI/2,av:0};
let camx=0,camy=0,t=0,shake=0;
const keys={left:false,right:false,up:false,down:false,shift:false,scan:false};
let near={P:[],R:[],S:[],key:''};
let toastMsg='', toastT=0;
function toast(m,sec){ toastMsg=m; toastT=sec||3; }
