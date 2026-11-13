/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Faixas do mar e tabela de configuração por fase.
 *
 * Cada faixa é uma "rota" horizontal por onde os inimigos circulam.
 * A tabela abaixo define a dificuldade de cada fase (a partir da fase 8
 * o ciclo se repete com os limites máximos).
 */

import {
  AGUA_Y,
  FAIXA_ALTURA,
  LARGURA,
  PONTOS_BASE_INIMIGO,
  PONTOS_MAX_INIMIGO,
  PONTOS_POR_FASE,
  TOTAL_FAIXAS,
} from './constantes';

export interface ConfiguracaoFase {
  fase: number;
  /** Velocidade base dos inimigos (px/s). */
  velocidadeInimigos: number;
  /** Quantidade de inimigos por faixa. */
  quantidadePorFaixa: number;
  /** Quantidade de submarinos piratas. */
  submarinosPirata: number;
  /** Consumo de oxigênio por segundo (%). */
  consumoOxigenio: number;
  /** Tempo (s) na superfície até a patrulha aparecer. */
  tempoAtePatrulha: number;
  /** Intervalo (s) entre-appearance da patrulha. */
  intervaloPatrulha: number;
  /** Pontuação base dos inimigos comuns desta fase. */
  pontosInimigo: number;
}

/** Configuração da fase (a partir da fase 8 repete com limites máximos). */
export function configuracaoFase(fase: number): ConfiguracaoFase {
  const nivel = Math.min(fase, 8);
  const pontos = Math.min(
    PONTOS_MAX_INIMIGO,
    PONTOS_BASE_INIMIGO + PONTOS_POR_FASE * (nivel - 1)
  );

  return {
    fase,
    velocidadeInimigos: Math.min(95, 42 + nivel * 6),
    quantidadePorFaixa: Math.min(4, 1 + Math.floor(nivel / 2)),
    submarinosPirata: Math.min(3, Math.floor((nivel - 1) / 2)),
    consumoOxigenio: Math.min(4.6, 2.1 + (nivel - 1) * 0.32),
    tempoAtePatrulha: Math.max(12, 40 - (nivel - 1) * 4),
    intervaloPatrulha: Math.max(9, 24 - (nivel - 1) * 2),
    pontosInimigo: pontos,
  };
}

/** Faixa do mar em que uma velocidade vertical cai. */
export function faixaDoY(y: number): number {
  const faixa = Math.floor((y - AGUA_Y) / FAIXA_ALTURA);
  return Math.max(0, Math.min(TOTAL_FAIXAS - 1, faixa));
}

/** Centro vertical de uma faixa. */
export function centroDaFaixa(faixa: number): number {
  return AGUA_Y + faixa * FAIXA_ALTURA + FAIXA_ALTURA / 2;
}

/** Sorteia uma faixa que não esteja muito perto do|submarino. */
export function sortearFaixa(faixaSubmarino: number): number {
  const opcoes: number[] = [];
  for (let i = 0; i < TOTAL_FAIXAS; i++) {
    if (Math.abs(i - faixaSubmarino) >= 1) opcoes.push(i);
  }
  if (opcoes.length === 0) return 0;
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

/** X inicial de um inimigo (fora da tela, para entrar depois). */
export function xInicialInimigo(lado: -1 | 1, largura: number): number {
  return lado > 0 ? -largura - 16 : LARGURA + 16;
}
