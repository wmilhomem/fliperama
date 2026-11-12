/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA,
  DURACAO_INVULNERAVEL,
  VELOCIDADE_NAVE,
  Y_NAVE,
} from './constantes';
import { centroRio, limitarXNaSecao } from './rio';
import { clamp } from './semente';
import { Nave, SecaoRio } from './tipos';
import { InputState } from '../../engine/types';

export function criarNave(secao: SecaoRio): Nave {
  return {
    x: centroRio(secao, 0),
    y: Y_NAVE,
    raio: 8,
    invulneravel: DURACAO_INVULNERAVEL,
    timerTiro: 0,
    acelerando: false,
    desacelerando: false,
    inclinacao: 0,
  };
}

export function reposicionarNave(nave: Nave, secao: SecaoRio): void {
  nave.x = centroRio(secao, 0);
  nave.y = Y_NAVE;
  nave.invulneravel = DURACAO_INVULNERAVEL;
  nave.timerTiro = 0;
  nave.inclinacao = 0;
  nave.acelerando = false;
  nave.desacelerando = false;
}

export function atualizarNave(
  nave: Nave,
  dt: number,
  input: InputState,
  secao: SecaoRio,
  progresso: number
): void {
  nave.acelerando = input.cima && !input.baixo;
  nave.desacelerando = input.baixo && !input.cima;

  const direcao = (input.direita ? 1 : 0) - (input.esquerda ? 1 : 0);
  const alvoInclinacao = direcao * 0.19;

  nave.inclinacao += (alvoInclinacao - nave.inclinacao) * Math.min(1, dt * 11);
  nave.x += direcao * VELOCIDADE_NAVE * dt;
  nave.x = limitarXNaSecao(secao, progresso, nave.x, nave.raio + 1);
  nave.x = clamp(nave.x, nave.raio + 3, 224 - nave.raio - 3);
  nave.y = Y_NAVE;
  nave.timerTiro = Math.max(0, nave.timerTiro - dt);
  nave.invulneravel = Math.max(0, nave.invulneravel - dt);
  nave.y = clamp(nave.y, 0, ALTURA);
}
