/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlatformView = 'hub' | 'jogo' | 'ranking' | 'configuracoes';

export interface PlatformConfig {
  volume: number; // 0.0 a 1.0
  somAtivo: boolean;
  efeitoCRT: boolean;
  controlesTouch: 'auto' | 'sempre' | 'nunca';
}

export interface GameScoreRecord {
  id: string;
  jogoId: string;
  pontuacao: number;
  data: string; // ISO string ou formatada
  nome: string;
}
