'use strict';
/* Donde hay regiones: funcion determinista por sector. */

function regionAt(sx,sy){ if(Math.abs(sx)<2&&Math.abs(sy)<2) return null;
  const a=fbm(sx*0.09+3.1,sy*0.09-1.7,0.5,501,2), b=fbm(sx*0.11-8,sy*0.11+4,0.5,733,2), c=fbm(sx*0.07+20,sy*0.07+9,0.5,911,2);
  return a>0.71?'nebula':b>0.66?'storm':c>0.73?'void':null; }
