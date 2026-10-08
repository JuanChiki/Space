'use strict';
/* Configuracion y constantes de ajuste. Tocar aqui para afinar el juego sin buscar por el codigo. */

const FONT = '"Space Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const BG = '#02030a';
const SEC = 500;
const RADAR=[28,70,160];
const SCAN_RANGE=170;
/* ---- tamaño de símbolos: el mundo usa 'fs'; la interfaz (HUD, menus) siempre usa el tamaño normal para leerse bien ---- */
const BASE_FS=touchUI?11:14, FS_MIN=Math.floor(BASE_FS/2), FS_MAX=touchUI?16:24, MAX_CELLS=touchUI?60000:150000;   // FS_MIN = mitad del tamano: en 1 celda normal caben 4
const HUDC='hsl(155 60% 72%)', DIMC='hsl(165 28% 40%)', ACC='hsl(36 100% 63%)';
/* SEÑALES Y EVENTOS EMERGENTES
   Objetos misteriosos repartidos por el universo. Se ven como '?' hasta escanearlos.
   No todo da recompensa: a veces el eco no era nada (ver Futuro.md, punto 14). */
const SIGNAL_RATE=0.15;     // probabilidad de que un sector tenga una señal (0 = ninguna, 1 = todos)
