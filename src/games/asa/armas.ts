/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Armas do jogador — balas e mísseis. */

import {
  BALAS_POR_SEGUNDO,
  MAX_BALAS_NA_TELA,
  DANO_BALA,
  DANO_MISSIL,
  MISSIL_COOLDOWN,
  MISSIL_RAIO_EXPLOSAO,
  MISSEIS_INICIAIS,
  MISSEIS_POR_CICLO,
} from './config';
import { MissilJogador, TiroJogador } from './tipos';

/** Estoque de mísseis restante na missão corrente. */
export interface EstadoArmas {
  misseis: number;
}

export function criarEstadoArmas(missao: number, ciclo: number): EstadoArmas {
  const indice = Math.min(Math.max(1, missao), MISSEIS_INICIAIS.length) - 1;
  const extra = Math.max(0, (ciclo - 1) * MISSEIS_POR_CICLO);
  return { misseis: MISSEIS_INICIAIS[indice] + extra };
}

const BALA_INTERVALO = 1 / BALAS_POR_SEGUNDO;

export function tentarAtirar(
  armas: EstadoArmas,
  tiros: TiroJogador[],
  x: number,
  y: number,
  agora: number,
  cooldownRef: { valor: number }
): boolean {
  if (tiros.length >= MAX_BALAS_NA_TELA) return false;
  if (cooldownRef.valor > 0) return false;
  tiros.push({ x, y: y - 14, vy: -520 });
  cooldownRef.valor = BALA_INTERVALO;
  return true;
}

export function tickArmas(armas: EstadoArmas, dt: number, cooldownRef: { valor: number }, cooldownMissilRef: { valor: number }): void {
  cooldownRef.valor = Math.max(0, cooldownRef.valor - dt);
  cooldownMissilRef.valor = Math.max(0, cooldownMissilRef.valor - dt);
}

export function tentarLancarMissil(
  armas: EstadoArmas,
  misseis: MissilJogador[],
  x: number,
  y: number,
  cooldownMissilRef: { valor: number }
): boolean {
  if (armas.misseis <= 0) return false;
  if (cooldownMissilRef.valor > 0) return false;
  misseis.push({ x, y: y - 10, vy: -170 });
  armas.misseis -= 1;
  cooldownMissilRef.valor = MISSIL_COOLDOWN;
  return true;
}

export const danoBala = (): number => DANO_BALA;
export const danoMissil = (): number => DANO_MISSIL;
export const raioExplosaoMissil = (): number => MISSIL_RAIO_EXPLOSAO;
