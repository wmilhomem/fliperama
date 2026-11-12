/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TipoAve } from './tipos';

export const LARGURA = 480;
export const ALTURA = 560;
export const HUD_ALTURA = 64;

export const Y_CHAO = ALTURA - 72;
export const Y_CANHAO = ALTURA - 64;

export const CANHAO_LARGURA = 48;
export const CANHAO_ALTURA = 32;
export const CANHAO_VELOCIDADE = 250;
export const CANHAO_MARGEM = 12;

export const VELOCIDADE_TIRO = 620;
export const CALOR_MAX = 100;
export const CALOR_POR_TIRO = 28;
export const CALOR_RESFRIAMENTO = 24;
export const CALOR_TRAVADO = 1;

export const VIDAS_INICIAIS = 3;
export const VIDAS_MAX = 6;
export const PONTOS_VIDA_EXTRA = 10000;
export const BONUS_CANHAO_RESERVA = 100;

export const MAX_AVES_ATIVAS = 6;
export const MAX_ORBES = 18;
export const BOSS_HP = 12;
export const BOSS_INTERVALO = 5;

export const DURACAO_TRANSICAO = 2.3;
export const DURACAO_INVULNERAVEL = 2;
export const DURACAO_AVISO_CHEFE = 2.6;

export const PONTOS_AVE: Record<TipoAve, number> = {
  grande: 50,
  pequena: 80,
  escudo: 120,
  mergulho: 150,
};

export const PONTOS_CHEFE = 1000;

export const CORES = {
  fundo: '#05020f',
  fundo2: '#0b0620',
  auroraVerde: '#34d399',
  auroraVioleta: '#a78bfa',
  auroraAzul: '#22d3ee',
  gelo: '#dbeafe',
  geloEscuro: '#93c5fd',
  montanha: '#1e1b4b',
  montanhaClara: '#312e81',
  lua: '#f8fafc',
  branco: '#f8fafc',
  violeta: '#8b5cf6',
  violetaClaro: '#c4b5fd',
  amarelo: '#fde047',
  vermelho: '#f87171',
  ciano: '#22d3ee',
  verde: '#4ade80',
} as const;
