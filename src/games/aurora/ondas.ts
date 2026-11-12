/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BOSS_INTERVALO, MAX_AVES_ATIVAS } from './constantes';
import { TipoAve } from './tipos';

export function ehOndaChefe(onda: number): boolean {
  return onda > 0 && onda % BOSS_INTERVALO === 0;
}

export function quantidadeAves(onda: number): number {
  return Math.min(MAX_AVES_ATIVAS, 3 + Math.floor((onda - 1) / 3));
}

export function sortearTipoAve(onda: number): TipoAve {
  const sorteio = Math.random();
  if (onda >= 5 && sorteio < 0.22) return 'escudo';
  if (onda >= 3 && sorteio < 0.45) return 'mergulho';
  return 'grande';
}

export function intervaloSpawn(onda: number): number {
  return Math.max(0.55, 1.25 - onda * 0.04);
}

export function velocidadeQueda(onda: number): number {
  return Math.min(36, 15 + onda * 1.3);
}

export function intervaloAveTiro(onda: number): number {
  return Math.max(1.2, 3.5 - onda * 0.13);
}

export function velocidadeOrbe(onda: number): number {
  return Math.min(205, 98 + onda * 4);
}

export function velocidadeMergulho(onda: number): number {
  return Math.min(265, 150 + onda * 6);
}
