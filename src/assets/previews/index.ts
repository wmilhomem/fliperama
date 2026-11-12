/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Miniaturas dos jogos usadas nos cards do hub.
 * Cada imagem é um recorte real da tela do jogo (pixel art).
 */

import hannah from './hannah.png';
import tatu from './tatu.png';
import garimpo from './garimpo.png';
import hidro from './hidro.png';
import selva from './selva.png';
import rali from './rali.png';
import aurora from './aurora.png';
import cheia from './cheia.png';
import mina from './mina.png';
import gafieira from './gafieira.png';
import astro from './astro.png';
import modelo from './modelo.png';

export const PREVIAS_JOGOS: Record<string, string> = {
  hannah,
  tatu,
  garimpo,
  hidro,
  selva,
  rali,
  aurora,
  cheia,
  mina,
  gafieira,
  astro,
  modelo,
};

/** Devolve a miniatura de um jogo (undefined se ainda não existir). */
export function previaDoJogo(id: string): string | undefined {
  return PREVIAS_JOGOS[id];
}
