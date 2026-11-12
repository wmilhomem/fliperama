/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState } from '../../engine/types';
import { Nave } from './tipos';
import { aplicarWrap, TAU } from './vetor';

export const ACELERACAO = 135;
export const VELOCIDADE_MAXIMA = 175;
export const VELOCIDADE_GIRO = 3.6;
export const DURACAO_INVULNERAVEL = 2.0;
export const RECARGA_SALTO = 1.0;

const ARRASTO = 0.42;

export function criarNave(largura: number, altura: number): Nave {
  const nave: Nave = {
    x: largura / 2,
    y: altura / 2,
    vx: 0,
    vy: 0,
    angulo: -Math.PI / 2,
    raio: 7,
    invulneravel: DURACAO_INVULNERAVEL,
    acelerando: false,
    timerPropulsor: 0,
    timerTiro: 0,
    recargaSalto: 0,
    tempoDuplo: 0,
  };

  return nave;
}

export function reposicionarNave(nave: Nave, largura: number, altura: number): void {
  nave.x = largura / 2;
  nave.y = altura / 2;
  nave.vx = 0;
  nave.vy = 0;
  nave.angulo = -Math.PI / 2;
  nave.invulneravel = DURACAO_INVULNERAVEL;
  nave.acelerando = false;
  nave.timerPropulsor = 0;
  nave.timerTiro = 0;
  nave.recargaSalto = 0;
  nave.tempoDuplo = 0;
}

export function atualizarNave(
  nave: Nave,
  dt: number,
  input: InputState,
  largura: number,
  altura: number
): void {
  if (nave.invulneravel > 0) nave.invulneravel = Math.max(0, nave.invulneravel - dt);
  if (nave.timerTiro > 0) nave.timerTiro = Math.max(0, nave.timerTiro - dt);
  if (nave.recargaSalto > 0) nave.recargaSalto = Math.max(0, nave.recargaSalto - dt);
  if (nave.tempoDuplo > 0) nave.tempoDuplo = Math.max(0, nave.tempoDuplo - dt);

  if (input.esquerda) nave.angulo -= VELOCIDADE_GIRO * dt;
  if (input.direita) nave.angulo += VELOCIDADE_GIRO * dt;

  if (nave.angulo > Math.PI) nave.angulo -= TAU;
  if (nave.angulo < -Math.PI) nave.angulo += TAU;

  nave.acelerando = input.cima;

  if (nave.acelerando) {
    nave.vx += Math.cos(nave.angulo) * ACELERACAO * dt;
    nave.vy += Math.sin(nave.angulo) * ACELERACAO * dt;
  } else {
    nave.timerPropulsor = 0;
  }

  // Atrito exponencial independente de FPS
  const fatorArrasto = Math.exp(-ARRASTO * dt);
  nave.vx *= fatorArrasto;
  nave.vy *= fatorArrasto;

  const velocidade = Math.hypot(nave.vx, nave.vy);
  if (velocidade > VELOCIDADE_MAXIMA) {
    const escala = VELOCIDADE_MAXIMA / velocidade;
    nave.vx *= escala;
    nave.vy *= escala;
  }

  nave.x += nave.vx * dt;
  nave.y += nave.vy * dt;

  const posicao = aplicarWrap(nave.x, nave.y, nave.raio, largura, altura);
  nave.x = posicao.x;
  nave.y = posicao.y;
}
