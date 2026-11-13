/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
import { LARGURA, ALTURA, ALTURA_PAINEL } from './tuning';

export const LINHA_TOPO = ALTURA_PAINEL;
export const LINHA_BAIXA = ALTURA;
export const LINHA_MEIO = (ALTURA_PAINEL + ALTURA) / 2;
export const LARGURA_UTIL = LARGURA - MARGEM_COSTAS * 2;

export const BUMPER_POSICOES = [
  { x: LARGURA / 2, y: 100, raio: 16 },
  { x: LARGURA / 3, y: 180, raio: 16 },
  { x: (LARGURA * 2) / 3, y: 180, raio: 16 },
];

export const ALVO_POSICOES = [
  { x: 120, y: 320 },
  { x: 180, y: 312 },
  { x: 240, y: 310 },
  { x: 300, y: 310 },
  { x: 360, y: 330 },
];

export const SPAWN_BOLA = { x: LARGURA / 2, y: ALTURA - 50 };