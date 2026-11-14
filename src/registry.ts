/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameModule } from './engine/types';
import { hannahGameModule } from './games/hannah';
import { modeloGameModule } from './games/_modelo';
import { tatuGameModule } from './games/tatu';
import { garimpoGameModule } from './games/garimpo';
import { hidroGameModule } from './games/hidro';
import { raliGameModule } from './games/rali';
import { selvaGameModule } from './games/selva';
import { auroraGameModule } from './games/aurora';
import { cheiaGameModule } from './games/cheia';
import { minaGameModule } from './games/mina';
import { gafieiraGameModule } from './games/gafieira';
import { astroGameModule } from './games/astro';
import { abissalGameModule } from './games/abissal';
import { invasores84GameModule } from './games/invasores84';
import { asaGameModule } from './games/asa';

/**
 * REGISTRO CENTRAL DE JOGOS DO FLIPERAMA
 *
 * Para adicionar um novo jogo na plataforma:
 * 1. Crie a pasta em `/src/games/seu_jogo/index.ts` implementando o contrato `GameModule`.
 * 2. Adicione o módulo no array `JOGOS` abaixo.
 * Pronto! O jogo herda automaticamente o visual, os controles, os sons, o recorde e a tela de pausa.
*/
export const JOGOS: GameModule[] = [
  hannahGameModule,
  tatuGameModule,
  invasores84GameModule,
  hidroGameModule,
  selvaGameModule,
  raliGameModule,
  auroraGameModule,
  cheiaGameModule,
  minaGameModule,
  gafieiraGameModule,
  astroGameModule,
  abissalGameModule,
  garimpoGameModule,
  asaGameModule,
  modeloGameModule,
];

export function obterJogoPorId(id: string): GameModule | undefined {
  return JOGOS.find((j) => j.id === id);
}
