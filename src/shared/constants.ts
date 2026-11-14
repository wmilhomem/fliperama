/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlatformConfig } from './types';

export const PLATFORM_NAME = 'FLIPERAMA';
export const PLATFORM_TAGLINE = 'Plataforma de Jogos Arcade Retrô';

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  volume: 0.7,
  somAtivo: true,
  controlesTouch: 'auto',
};

export const STORAGE_KEYS = {
  CONFIG: 'fliperama_config_v1',
  RECORDS: 'fliperama_records_v1',
  SCORES_HISTORY: 'fliperama_history_v1',
  PLAYER: 'fliperama_player_v1',
  LEGACY_HANNAH: 'salve_a_hannah_highscore',
  LEGACY_LIA: 'salve_a_lia_highscore',
} as const;

/** Avatares (emojis) oferecidos na primeira visita. */
export const AVATARES: string[] = [
  '👾', '🕹️', '🤖', '👽', '🦖', '🐉',
  '🦊', '🐯', '🐼', '🐸', '👻', '🐙',
];

export const AVATAR_PADRAO = '👾';
export const NOME_PADRAO = 'JOGADOR';

export const RETRO_PALETTE = {
  bgBlack: '#030712',
  arcadeRed: '#EF4444',
  arcadeRedDark: '#991B1B',
  neonCyan: '#06B6D4',
  neonCyanBright: '#22D3EE',
  neonYellow: '#FACC15',
  neonAmber: '#F59E0B',
  neonGreen: '#10B981',
  neonPurple: '#A855F7',
  neonPink: '#EC4899',
  steelGray: '#475569',
  pureWhite: '#FFFFFF',
} as const;
