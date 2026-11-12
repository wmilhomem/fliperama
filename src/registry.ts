/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameModule } from './engine/types';
import { UpcomingGame } from './shared/types';
import { hannahGameModule } from './games/hannah';
import { modeloGameModule } from './games/_modelo';
import { tatuGameModule } from './games/tatu';
import { garimpoGameModule } from './games/garimpo';

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
  garimpoGameModule,
  modeloGameModule,
];

/**
 * Jogos em desenvolvimento exibidos como cabines bloqueadas "EM BREVE" no catálogo.
 */
export const JOGOS_EM_BREVE: UpcomingGame[] = [
  {
    id: 'nave_cosmica',
    titulo: 'Invasores Cósmicos 84',
    genero: 'Shoot \'em up Espacial',
    descricao: 'Defenda a base orbital disparando contra enxames alienígenas em formação com escudos de plasma.',
    corTema: '#8B5CF6',
  },
  {
    id: 'submarino_abissal',
    titulo: 'Submarino Abissal',
    genero: 'Aventura Subaquática',
    descricao: 'Pilote um batiscafo explorando fossas oceânicas, resgatando mergulhadores e desviando de minas magnéticas.',
    corTema: '#06B6D4',
  },
  {
    id: 'pista_veloz',
    titulo: 'Pista Veloz Turbo',
    genero: 'Corrida Retrô',
    descricao: 'Acelere em pistas sinuosas na rodovia noturna ultrapassando rivais antes que o cronômetro expire.',
    corTema: '#F59E0B',
  },
];

export function obterJogoPorId(id: string): GameModule | undefined {
  return JOGOS.find((j) => j.id === id);
}
