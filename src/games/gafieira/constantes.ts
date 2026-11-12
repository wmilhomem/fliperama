/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Paleta e medidas da mesa "Noite na Gafieira". */

export const LARGURA = 480;
export const ALTURA = 800;
export const PAINEL_ALTURA = 96;
export const TILE = 16;

export const PALETA = {
  fundo: '#120727',
  fundoEscuro: '#0A0418',
  roxo: '#7C3AED',
  roxoEscuro: '#2A1145',
  rosa: '#EC4899',
  rosaEscuro: '#9D174D',
  rosaClaro: '#F9A8D4',
  turquesa: '#2EC4B6',
  turquesaClaro: '#8AF0E6',
  laranja: '#FB923C',
  laranjaClaro: '#FDBA74',
  dourado: '#FFD166',
  douradoEscuro: '#D9A441',
  creme: '#FDE68A',
  branco: '#FFFFFF',
  sombra: 'rgba(0, 0, 0, 0.45)',
} as const;

/** Posições fixas do campo (o resto é descrito em `mesa.ts`). */
export const CAMPO = {
  teto: 140,
  paredeEsquerda: 24,
  canaletaDireita: 436,
  canaletaBorda: 472,
  centroCanaleta: 454,
  piso: 736,
  pivoEsquerdo: { x: 162, y: 688 },
  pivoDireito: { x: 318, y: 688 },
  comprimentoFlipper: 72,
  raioFlipper: 7,
  anguloRepousoEsquerdo: (30 * Math.PI) / 180,
  anguloAtivoEsquerdo: (-20 * Math.PI) / 180,
  anguloRepousoDireito: (150 * Math.PI) / 180,
  anguloAtivoDireito: (200 * Math.PI) / 180,
} as const;
