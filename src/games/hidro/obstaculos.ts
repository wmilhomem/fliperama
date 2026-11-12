/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA } from './constantes';
import { telaY } from './rio';
import { Obstaculo, TipoObstaculo } from './tipos';

interface ConfigObstaculo {
  raio: number;
}

export const CONFIG_OBSTACULOS: Record<TipoObstaculo, ConfigObstaculo> = {
  tronco: { raio: 8 },
  pedra: { raio: 7 },
};

export function criarObstaculo(
  tipo: TipoObstaculo,
  x: number,
  d: number,
  id: number
): Obstaculo {
  return {
    id,
    tipo,
    x,
    d,
    y: telaY(d, 0),
    raio: CONFIG_OBSTACULOS[tipo].raio,
    rotacao: Math.random() * Math.PI * 2,
    velRotacao: (Math.random() - 0.5) * 1.4,
  };
}

export function atualizarObstaculos(
  obstaculos: Obstaculo[],
  dt: number,
  progresso: number
): Obstaculo[] {
  for (const obstaculo of obstaculos) {
    obstaculo.y = telaY(obstaculo.d, progresso);
    obstaculo.rotacao += obstaculo.velRotacao * dt;
  }

  return obstaculos.filter((obstaculo) => obstaculo.y < ALTURA + 45);
}

export function intervaloSpawnObstaculo(secao: number): number {
  const base = Math.max(1.15, 2.35 - secao * 0.1);
  return base * (0.7 + Math.random() * 0.65);
}
