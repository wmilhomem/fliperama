/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA,
  DRENAGEM_ACELERANDO,
  DRENAGEM_BASE,
  DRENAGEM_DESACELERANDO,
  FUEL_MAX,
  FUEL_TANQUE,
  TAXA_ABASTECIMENTO,
} from './constantes';
import { telaY } from './rio';
import { clamp } from './semente';
import { Tanque } from './tipos';

export function criarTanque(x: number, d: number, id: number): Tanque {
  return {
    id,
    x,
    d,
    y: telaY(d, 0),
    raio: 7,
    restante: FUEL_TANQUE,
  };
}

export function atualizarTanques(tanques: Tanque[], progresso: number): Tanque[] {
  for (const tanque of tanques) {
    tanque.y = telaY(tanque.d, progresso);
  }

  return tanques.filter((tanque) => tanque.y < ALTURA + 45 && tanque.restante > 0);
}

export function drenarCombustivel(
  atual: number,
  dt: number,
  acelerando: boolean,
  desacelerando: boolean
): number {
  const taxa = acelerando
    ? DRENAGEM_ACELERANDO
    : desacelerando
      ? DRENAGEM_DESACELERANDO
      : DRENAGEM_BASE;

  return Math.max(0, atual - taxa * dt);
}

export function transferirCombustivel(
  combustivel: number,
  tanque: Tanque,
  dt: number
): number {
  const espaco = Math.max(0, FUEL_MAX - combustivel);
  const transferido = Math.min(espaco, tanque.restante, TAXA_ABASTECIMENTO * dt);

  if (transferido <= 0) return combustivel;

  tanque.restante = Math.max(0, tanque.restante - transferido);
  return clamp(combustivel + transferido, 0, FUEL_MAX);
}
