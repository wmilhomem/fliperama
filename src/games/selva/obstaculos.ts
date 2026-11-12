/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TRILHA_Y } from './constantes';
import { Explorador, Obstaculo, TelaSelva } from './tipos';
import {
  atualizarTronco,
  colideTronco,
  desenharTronco,
} from './obstaculos/tronco';
import { colideFileira, desenharFileira } from './obstaculos/fileira';
import {
  colideJacare,
  desenharPocoJacare,
  obterSuporteJacare,
} from './obstaculos/jacare';
import { desenharPocoCipo } from './obstaculos/cipo';
import { desenharAreiaMovedica } from './obstaculos/areia';
import { colideCobra, desenharCobra } from './obstaculos/cobra';
import { colideFogueira, desenharFogueira } from './obstaculos/fogueira';
import {
  atualizarEscorpiao,
  colideEscorpiao,
  desenharEscorpiao,
} from './obstaculos/escorpiao';
import { desenharParede } from './obstaculos/parede';

export type ResultadoColisao = 'bump' | 'fatal' | null;

export function atualizarObstaculos(tela: TelaSelva, dt: number): void {
  for (const obstaculo of tela.obstaculos) {
    if (obstaculo.tipo === 'tronco') {
      atualizarTronco(obstaculo, dt);
    }
  }

  for (const escorpiao of tela.escorpioes) {
    atualizarEscorpiao(escorpiao, dt, tela.parede);
  }
}

export function desenharObstaculosSuperficie(
  g: CanvasRenderingContext2D,
  tela: TelaSelva,
  tempo: number
): void {
  for (const obstaculo of tela.obstaculos) {
    desenharObstaculo(g, obstaculo, tempo);
  }
}

export function desenharObstaculosSubsolo(
  g: CanvasRenderingContext2D,
  tela: TelaSelva,
  tempo: number
): void {
  if (tela.parede) {
    desenharParede(g, tela.parede);
  }

  for (const escorpiao of tela.escorpioes) {
    desenharEscorpiao(g, escorpiao, tempo);
  }
}

function desenharObstaculo(
  g: CanvasRenderingContext2D,
  obstaculo: Obstaculo,
  tempo: number
): void {
  switch (obstaculo.tipo) {
    case 'tronco':
      desenharTronco(g, obstaculo, tempo);
      break;
    case 'fileira':
      desenharFileira(g, obstaculo);
      break;
    case 'jacare':
      desenharPocoJacare(g, obstaculo, tempo);
      break;
    case 'cipo':
      desenharPocoCipo(g, obstaculo, tempo);
      break;
    case 'areia':
      desenharAreiaMovedica(g, obstaculo, tempo);
      break;
    case 'cobra':
      desenharCobra(g, obstaculo, tempo);
      break;
    case 'fogueira':
      desenharFogueira(g, obstaculo, tempo);
      break;
  }
}

export function obterSuporteSuperficie(
  tela: TelaSelva,
  x: number,
  tempo: number
): number | null {
  for (const obstaculo of tela.obstaculos) {
    if (obstaculo.tipo === 'jacare') {
      if (x < obstaculo.x || x > obstaculo.x + obstaculo.largura) continue;
      return obterSuporteJacare(obstaculo, x, tempo);
    }

    if (obstaculo.tipo === 'cipo' || obstaculo.tipo === 'areia') {
      if (x >= obstaculo.x && x <= obstaculo.x + obstaculo.largura) {
        return null;
      }
    }
  }

  return TRILHA_Y;
}

export function colidirSuperficie(
  jogador: Explorador,
  tela: TelaSelva,
  tempo: number
): ResultadoColisao {
  for (const obstaculo of tela.obstaculos) {
    switch (obstaculo.tipo) {
      case 'tronco':
        if (colideTronco(jogador, obstaculo)) return 'bump';
        break;
      case 'fileira':
        if (colideFileira(jogador, obstaculo)) return 'bump';
        break;
      case 'fogueira':
        if (colideFogueira(jogador, obstaculo)) return 'bump';
        break;
      case 'cobra':
        if (colideCobra(jogador, obstaculo)) return 'fatal';
        break;
      case 'jacare':
        if (colideJacare(jogador, obstaculo, tempo)) return 'fatal';
        break;
      case 'areia':
        if (
          jogador.x >= obstaculo.x &&
          jogador.x <= obstaculo.x + obstaculo.largura &&
          jogador.y >= TRILHA_Y + 3
        ) {
          return 'fatal';
        }
        break;
      case 'cipo':
        if (
          jogador.x >= obstaculo.x &&
          jogador.x <= obstaculo.x + obstaculo.largura &&
          jogador.y >= TRILHA_Y + 3
        ) {
          return 'fatal';
        }
        break;
    }
  }

  return null;
}

export function colidirSubsolo(jogador: Explorador, tela: TelaSelva): boolean {
  return tela.escorpioes.some((escorpiao) => colideEscorpiao(jogador, escorpiao));
}
