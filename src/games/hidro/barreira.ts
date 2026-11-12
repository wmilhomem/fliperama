/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect } from '../../engine/types';
import { ALTURA_BARREIRA, Y_BARREIRA, Y_NAVE } from './constantes';
import { centroRio, larguraRio, telaY } from './rio';
import { Barreira, SecaoRio } from './tipos';

export function criarBarreira(secao: SecaoRio): Barreira {
  const d = secao.comprimento;
  const hpMax = 60 + (secao.numero - 1) * 24;

  return {
    x: centroRio(secao, d),
    y: telaY(d, 0),
    d,
    largura: Math.max(52, larguraRio(secao, d) - 8),
    altura: ALTURA_BARREIRA,
    hp: hpMax,
    hpMax,
    timerTiro: 2.4,
    travada: false,
  };
}

export function atualizarBarreira(
  barreira: Barreira,
  secao: SecaoRio,
  progresso: number
): void {
  const yNatural = telaY(barreira.d, progresso);

  if (!barreira.travada && yNatural >= Y_BARREIRA) {
    barreira.travada = true;
  }

  if (barreira.travada) {
    barreira.d = progresso + (Y_NAVE - Y_BARREIRA);
  }

  barreira.y = telaY(barreira.d, progresso);
  barreira.x = centroRio(secao, barreira.d);
  barreira.largura = Math.max(52, larguraRio(secao, barreira.d) - 8);
}

export function retanguloBarreira(barreira: Barreira): Rect {
  return {
    x: barreira.x - barreira.largura / 2,
    y: barreira.y - barreira.altura / 2,
    largura: barreira.largura,
    altura: barreira.altura,
  };
}

export function barreiraVisivel(barreira: Barreira): boolean {
  return barreira.y > -28 && barreira.y < 130;
}

export function barreiraPodeAtirar(barreira: Barreira): boolean {
  return barreira.travada && barreira.hp > 0 && barreira.y <= Y_BARREIRA + 1;
}
