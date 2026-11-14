/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * DADOS DAS 4 TELAS — SALVE A HANNAH
 *
 * Geometria própria, definida por dados. As escadas trazem apenas o X e as
 * duas vigas que ligam — a altura é calculada na carga pela inclinação das
 * vigas. Toda geometria aqui é original.
 */

import { SegmentoDef, EscadaDef, TelaDef, TipoItemBonus } from './tipos';

const b = (tipo: TipoItemBonus, x: number, y: number) => ({ tipo, x, y });

export const TELAS: TelaDef[] = [
  // ------------------------------------------------------------------
  // TELA 1 — VIGAS E BARRIS (25 m)
  // ------------------------------------------------------------------
  {
    numero: 1,
    nome: 'VIGAS E BARRIS',
    alturaMetros: 25,
    bonusInicial: 6000,
    girders: [
      { x: 140, y: 64, largura: 200, dy: 0, direcao: 1 },
      { x: 35, y: 158, largura: 410, dy: -12, direcao: -1 },
      { x: 30, y: 252, largura: 420, dy: 12, direcao: 1 },
      { x: 50, y: 348, largura: 385, dy: -12, direcao: -1 },
      { x: 30, y: 444, largura: 420, dy: 12, direcao: 1 },
      { x: 12, y: 514, largura: 456, dy: 0, direcao: -1 },
    ],
    escadas: [
      { x: 240, entre: [0, 1] },
      { x: 95, entre: [1, 2] },
      { x: 250, entre: [1, 2] },
      { x: 380, entre: [1, 2], quebrada: true },
      { x: 150, entre: [2, 3] },
      { x: 320, entre: [2, 3] },
      { x: 410, entre: [2, 3], quebrada: true },
      { x: 90, entre: [3, 4] },
      { x: 240, entre: [3, 4] },
      { x: 370, entre: [3, 4], quebrada: true },
      { x: 200, entre: [4, 5] },
      { x: 330, entre: [4, 5] },
      { x: 80, entre: [4, 5], quebrada: true },
    ],
    jogadorSpawn: { x: 60, y: 490 },
    grotao: { x: 172, y: 40 },
    hannah: { x: 225, y: 40 },
    barrilSpawn: { x: 190, y: 40 },
    barrilOleo: { x: 40, y: 492 },
    martelos: [
      { x: 120, y: 345 },
      { x: 330, y: 261 },
    ],
    itensBonus: [
      b('chapeu', 300, 46),
      b('bolsa', 428, 258),
      b('guarda-chuva', 62, 442),
    ],
  },

  // ------------------------------------------------------------------
  // TELA 2 — FÁBRICA DE CIMENTO, ESTEIRAS (50 m)
  // ------------------------------------------------------------------
  {
    numero: 2,
    nome: 'FÁBRICA DE CIMENTO',
    alturaMetros: 50,
    bonusInicial: 5000,
    girders: [
      { x: 140, y: 64, largura: 200, dy: 0, direcao: 1 },
      { x: 35, y: 158, largura: 410, dy: 0, direcao: 1, esteira: true, sentidoEsteira: 1 },
      { x: 35, y: 252, largura: 410, dy: 0, direcao: -1, esteira: true, sentidoEsteira: -1 },
      { x: 35, y: 348, largura: 410, dy: 0, direcao: 1, esteira: true, sentidoEsteira: 1 },
      { x: 12, y: 505, largura: 456, dy: 0, direcao: -1 },
    ],
    escadas: [
      { x: 240, entre: [0, 1] },
      { x: 110, entre: [1, 2] },
      { x: 250, entre: [1, 2] },
      { x: 380, entre: [1, 2] },
      { x: 90, entre: [2, 3] },
      { x: 230, entre: [2, 3] },
      { x: 390, entre: [2, 3] },
      { x: 160, entre: [3, 4] },
      { x: 330, entre: [3, 4] },
    ],
    jogadorSpawn: { x: 60, y: 481 },
    grotao: { x: 172, y: 40 },
    hannah: { x: 225, y: 40 },
    barrilSpawn: { x: 190, y: 40 },
    spawnCaixas: [
      { x: -34, y: 240, sentido: 1 },
      { x: 514, y: 240, sentido: -1 },
    ],
    martelos: [
      { x: 80, y: 344 },
      { x: 400, y: 248 },
    ],
    itensBonus: [
      b('chapeu', 300, 46),
      b('bolsa', 62, 248),
      b('guarda-chuva', 420, 344),
    ],
  },

  // ------------------------------------------------------------------
  // TELA 3 — ELEVADORES E MOLAS (75 m)
  // ------------------------------------------------------------------
  {
    numero: 3,
    nome: 'ELEVADORES E MOLAS',
    alturaMetros: 75,
    bonusInicial: 5000,
    girders: [
      { x: 140, y: 64, largura: 200, dy: 0, direcao: 1 },
      { x: 15, y: 150, largura: 215, dy: 0, direcao: 1 },
      { x: 250, y: 150, largura: 215, dy: 0, direcao: -1 },
      { x: 15, y: 290, largura: 145, dy: 0, direcao: 1 },
      { x: 320, y: 290, largura: 145, dy: 0, direcao: -1 },
      { x: 15, y: 505, largura: 450, dy: 0, direcao: -1 },
    ],
    escadas: [
      { x: 80, entre: [3, 1] },
      { x: 390, entre: [4, 2] },
      { x: 180, entre: [1, 0] },
      { x: 300, entre: [2, 0] },
    ],
    jogadorSpawn: { x: 60, y: 481 },
    grotao: { x: 172, y: 40 },
    hannah: { x: 225, y: 40 },
    barrilSpawn: { x: 190, y: 40 },
    elevadores: [
      { x: 85, yTop: 158, yBottom: 480, velocidade: 62, fase: 0 },
      { x: 395, yTop: 158, yBottom: 480, velocidade: 62, fase: Math.PI },
    ],
    itensBonus: [
      b('chapeu', 60, 282),
      b('bolsa', 430, 282),
      b('guarda-chuva', 240, 493),
    ],
  },

  // ------------------------------------------------------------------
  // TELA 4 — TRAVAS (100 m)
  // ------------------------------------------------------------------
  {
    numero: 4,
    nome: 'TRAVAS',
    alturaMetros: 100,
    bonusInicial: 4000,
    girders: [
      { x: 140, y: 64, largura: 200, dy: 0, direcao: 1 },
      { x: 20, y: 160, largura: 440, dy: 0, direcao: 1 },
      { x: 20, y: 258, largura: 440, dy: 0, direcao: -1 },
      { x: 20, y: 356, largura: 440, dy: 0, direcao: 1 },
      { x: 20, y: 454, largura: 440, dy: 0, direcao: -1 },
    ],
    escadas: [
      { x: 140, entre: [1, 0] },
      { x: 340, entre: [1, 0] },
      { x: 120, entre: [2, 1] },
      { x: 390, entre: [2, 1] },
      { x: 130, entre: [3, 2] },
      { x: 380, entre: [3, 2] },
      { x: 150, entre: [4, 3] },
      { x: 330, entre: [4, 3] },
    ],
    jogadorSpawn: { x: 240, y: 430 },
    grotao: { x: 172, y: 40 },
    hannah: { x: 225, y: 40 },
    barrilSpawn: { x: 190, y: 40 },
    martelos: [
      { x: 120, y: 448 },
      { x: 360, y: 350 },
    ],
    itensBonus: [
      b('chapeu', 300, 46),
      b('bolsa', 60, 448),
      b('guarda-chuva', 240, 254),
    ],
    travas: [
      { x: 45, y: 152 },
      { x: 435, y: 152 },
      { x: 45, y: 250 },
      { x: 435, y: 250 },
      { x: 45, y: 348 },
      { x: 435, y: 348 },
      { x: 45, y: 446 },
      { x: 435, y: 446 },
    ],
  },
];
