/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { escalar, MARGEM_TOPO } from './escala';
import { Nave, Pirata, TipoPirata } from './tipos';
import { aleatorio, aplicarWrap, TAU } from './vetor';

export interface DisparoPirata {
  angulo: number;
  velocidade: number;
}

const CONFIG_PIRATA: Record<
  TipoPirata,
  { raio: number; velocidade: number; intervalo: number; velocidadeTiro: number }
> = {
  grande: {
    raio: escalar(12),
    velocidade: escalar(46),
    intervalo: 2.2,
    velocidadeTiro: escalar(120),
  },
  pequeno: {
    raio: escalar(8),
    velocidade: escalar(88),
    intervalo: 1.35,
    velocidadeTiro: escalar(185),
  },
};

let proximoId = 1;

export function criarPirata(tipo: TipoPirata, largura: number, altura: number): Pirata {
  const cfg = CONFIG_PIRATA[tipo];
  const daEsquerda = Math.random() < 0.5;
  const y = aleatorio(MARGEM_TOPO + 8, altura - 40);
  const vx = (daEsquerda ? 1 : -1) * cfg.velocidade;
  const vy = aleatorio(escalar(-18), escalar(18));

  return {
    id: proximoId++,
    tipo,
    x: daEsquerda ? -cfg.raio : largura + cfg.raio,
    y,
    vx,
    vy,
    raio: cfg.raio,
    angulo: Math.atan2(vy, vx),
    timerTiro: aleatorio(0.8, 1.8),
    intervaloTiro: cfg.intervalo,
  };
}

/**
 * Move o pirata e, quando for hora, devolve os dados do tiro que ele disparou.
 */
export function atualizarPirata(
  pirata: Pirata,
  dt: number,
  largura: number,
  altura: number,
  nave: Nave,
  podeAtirar = true
): DisparoPirata | null {
  pirata.x += pirata.vx * dt;
  pirata.y += pirata.vy * dt;

  const posicao = aplicarWrap(pirata.x, pirata.y, pirata.raio, largura, altura);
  pirata.x = posicao.x;
  pirata.y = posicao.y;

  pirata.angulo = Math.atan2(pirata.vy, pirata.vx);
  pirata.timerTiro -= dt;

  if (!podeAtirar) return null;
  if (pirata.timerTiro > 0) return null;

  pirata.timerTiro = pirata.intervaloTiro + aleatorio(-0.25, 0.45);

  if (pirata.tipo === 'pequeno') {
    const angulo = Math.atan2(nave.y - pirata.y, nave.x - pirata.x) + aleatorio(-0.05, 0.05);
    return { angulo, velocidade: CONFIG_PIRATA.pequeno.velocidadeTiro };
  }

  return {
    angulo: aleatorio(0, TAU),
    velocidade: CONFIG_PIRATA.grande.velocidadeTiro,
  };
}

export function intervaloPirata(fase: number, pontuacao: number): number {
  return Math.max(4.5, 13 - fase * 1.0 - Math.min(3.5, pontuacao / 4000));
}

export function chancePirataPequeno(fase: number, pontuacao: number): number {
  return Math.min(0.72, 0.12 + fase * 0.07 + pontuacao / 70000);
}
