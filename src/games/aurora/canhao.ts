/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioService, InputState } from '../../engine/types';
import {
  CALOR_MAX,
  CALOR_POR_TIRO,
  CALOR_RESFRIAMENTO,
  CALOR_TRAVADO,
  CANHAO_MARGEM,
  CANHAO_VELOCIDADE,
  LARGURA,
  Y_CANHAO,
} from './constantes';
import { Canhao } from './tipos';

export interface ResultadoCanhao {
  disparou: boolean;
  superaqueceu: boolean;
}

function clamp(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

export function criarCanhao(): Canhao {
  return {
    x: LARGURA / 2,
    y: Y_CANHAO,
    recuo: 0,
    calor: 0,
    travado: 0,
    cooldown: 0,
  };
}

export function atualizarCanhao(
  canhao: Canhao,
  dt: number,
  input: InputState,
  podeAtirar: boolean,
  audio: AudioService
): ResultadoCanhao {
  let direcao = 0;
  if (input.esquerda) direcao -= 1;
  if (input.direita) direcao += 1;

  canhao.x = clamp(
    canhao.x + direcao * CANHAO_VELOCIDADE * dt,
    CANHAO_MARGEM + 24,
    LARGURA - CANHAO_MARGEM - 24
  );
  canhao.recuo = Math.max(0, canhao.recuo - dt * 8);
  canhao.cooldown = Math.max(0, canhao.cooldown - dt);

  let disparou = false;
  let superaqueceu = false;

  if (canhao.travado > 0) {
    canhao.travado = Math.max(0, canhao.travado - dt);
    canhao.calor = Math.max(0, canhao.calor - 86 * dt);
    if (canhao.travado === 0) {
      canhao.calor = Math.min(canhao.calor, 24);
    }
    return { disparou, superaqueceu };
  }

  canhao.calor = Math.max(0, canhao.calor - CALOR_RESFRIAMENTO * dt);

  if (input.acao && podeAtirar && canhao.cooldown <= 0) {
    disparou = true;
    canhao.cooldown = 0.14;
    canhao.recuo = 1;
    canhao.calor = Math.min(CALOR_MAX, canhao.calor + CALOR_POR_TIRO);
    audio.tocar('tiro');

    if (canhao.calor >= CALOR_MAX) {
      canhao.calor = CALOR_MAX;
      canhao.travado = CALOR_TRAVADO;
      superaqueceu = true;
      audio.tocar('alerta');
    }
  }

  return { disparou, superaqueceu };
}
