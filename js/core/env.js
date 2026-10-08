'use strict';
/* Entorno: canvas, contexto 2D, deteccion de pantalla tactil y botonera tactil (DOM). */

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const touchUI = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
const touchEl=document.getElementById('touch');
