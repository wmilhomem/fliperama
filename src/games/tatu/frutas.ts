/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MAZE_OFFSET_X, MAZE_OFFSET_Y, TILE_SIZE } from './mapa';

export type FrutaTipo = 'caju' | 'abacaxi' | 'jabuticaba' | 'goiaba';

export interface FrutaBonus {
  tipo: FrutaTipo;
  nome: string;
  pontos: number;
  x: number;
  y: number;
  ativa: boolean;
  tempoRestante: number;
}

export function obterFrutaDaFase(fase: number): { tipo: FrutaTipo; nome: string; pontos: number } {
  if (fase === 1) {
    return { tipo: 'caju', nome: 'Caju', pontos: 100 };
  } else if (fase === 2) {
    return { tipo: 'abacaxi', nome: 'Abacaxi', pontos: 300 };
  } else if (fase === 3) {
    return { tipo: 'jabuticaba', nome: 'Jabuticaba', pontos: 500 };
  } else {
    return { tipo: 'goiaba', nome: 'Goiaba', pontos: 700 };
  }
}

export function criarFrutaBonus(fase: number): FrutaBonus {
  const dados = obterFrutaDaFase(fase);
  // Posição: abaixo da toca (coluna 13.5, linha 20)
  const spawnCol = 13.5;
  const spawnRow = 20;

  return {
    tipo: dados.tipo,
    nome: dados.nome,
    pontos: dados.pontos,
    x: MAZE_OFFSET_X + spawnCol * TILE_SIZE,
    y: MAZE_OFFSET_Y + spawnRow * TILE_SIZE + TILE_SIZE / 2,
    ativa: false,
    tempoRestante: 0,
  };
}

export function spawnarFruta(fruta: FrutaBonus, fase: number): void {
  const dados = obterFrutaDaFase(fase);
  fruta.tipo = dados.tipo;
  fruta.nome = dados.nome;
  fruta.pontos = dados.pontos;
  fruta.ativa = true;
  fruta.tempoRestante = 10.0; // Fica na tela por 10 segundos
}

export function atualizarFruta(fruta: FrutaBonus, dt: number): void {
  if (!fruta.ativa) return;

  fruta.tempoRestante -= dt;
  if (fruta.tempoRestante <= 0) {
    fruta.ativa = false;
    fruta.tempoRestante = 0;
  }
}
