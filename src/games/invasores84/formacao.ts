/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formação de invasores de "Invasores Cósmicos 84".
 *
 * A formação marcha como um bloco: anda para um lado até o invasor mais
 * externo chegar à borda, desce 16 px e inverte a direção. O intervalo entre
 * os passos diminui conforme restam menos invasores (a aceleração é a
 * marca do jogo).
 */

import {
  COLUNAS,
  ESPACO_FILEIRAS,
  FILEIRAS,
  FORMACAO_X0,
  FORMACAO_Y0,
  INTERVALO_MARCHA_BASE,
  INTERVALO_MARCHA_MINIMO,
  INVASOR_ALTURA,
  INVASOR_LARGURA,
  INVASORES_POR_ONDA,
  LARGURA,
  PASSO_FORMACAO_X,
  PASSO_FORMACAO_Y,
} from './constantes';
import { Invasor, tipoDaFileira } from './invasores';

/** Passos horizontais da formação (espaçamento entre colunas). */
export const PASSO_COLUNAS = 40;
/** Passos verticais da formação (espaçamento entre fileiras). */
export const PASSO_FILEIRAS = INVASOR_ALTURA + ESPACO_FILEIRAS;

export interface Formacao {
  invasores: Invasor[];
  direcao: -1 | 1;
  /** Tempo acumulado até o próximo passo da marcha. */
  tempoPasso: number;
  /** Intervalo atual entre passos (depende dos invasores restantes). */
  intervalo: number;
  /** Deslocamento vertical extra da onda. */
  deslocamento: number;
  /** Velocidade base da onda. */
  velocidadeBase: number;
  /** Quantidade de passos dados no total. */
  passos: number;
}

/** Cria a formação completa de uma onda. */
export function criarFormacao(onda: number, velocidadeBase: number): Formacao {
  const invasores: Invasor[] = [];
  const deslocamento = Math.min(2, Math.max(0, onda - 1)) * PASSO_FILEIRAS;

  for (let fileira = 0; fileira < FILEIRAS; fileira++) {
    for (let coluna = 0; coluna < COLUNAS; coluna++) {
      const tipo = tipoDaFileira(fileira);
      invasores.push({
        tipo,
        x: FORMACAO_X0 + coluna * PASSO_COLUNAS,
        y: FORMACAO_Y0 + deslocamento + fileira * PASSO_FILEIRAS,
        largura: INVASOR_LARGURA,
        altura: INVASOR_ALTURA,
        pontos: tipo === 'larva' ? 10 : tipo === 'libelula' ? 20 : 30,
        vivo: true,
        quadro: 0,
        tempoTiro: 0,
      });
    }
  }

  return {
    invasores,
    direcao: 1,
    tempoPasso: 0,
    intervalo: intervaloDaMarcha(INVASORES_POR_ONDA, velocidadeBase),
    deslocamento,
    velocidadeBase,
    passos: 0,
  };
}

/** Intervalo entre passos conforme os invasores restantes. */
export function intervaloDaMarcha(restantes: number, velocidadeBase: number): number {
  const fracao = restantes / INVASORES_POR_ONDA;
  const intervalo = velocidadeBase * Math.pow(fracao, 1.15);
  return Math.max(INTERVALO_MARCHA_MINIMO, intervalo);
}

/** Quantidade de invasores vivos. */
export function contarVivos(formacao: Formacao): number {
  let vivos = 0;
  for (const invasor of formacao.invasores) {
    if (invasor.vivo) vivos++;
  }
  return vivos;
}

/**
 * Atualiza a marcha da formação.
 * Devolve `true` quando deu um passo (para tocar a batida da marcha).
 */
export function atualizarFormacao(formacao: Formacao, dt: number): boolean {
  const vivos = contarVivos(formacao);
  if (vivos === 0) return false;

  formacao.intervalo = intervaloDaMarcha(vivos, formacao.velocidadeBase);
  formacao.tempoPasso += dt;

  if (formacao.tempoPasso < formacao.intervalo) return false;
  formacao.tempoPasso -= formacao.intervalo;
  formacao.passos++;

  // Animação dos quadros
  for (const invasor of formacao.invasores) {
    if (invasor.vivo) invasor.quadro = formacao.passos % 2;
  }

  // Calcula a borda mais externa na direção do movimento
  let menorX = Infinity;
  let maiorX = -Infinity;
  for (const invasor of formacao.invasores) {
    if (!invasor.vivo) continue;
    menorX = Math.min(menorX, invasor.x);
    maiorX = Math.max(maiorX, invasor.x + invasor.largura);
  }

  const avanca = formacao.direcao > 0 ? maiorX + PASSO_FORMACAO_X > LARGURA : menorX - PASSO_FORMACAO_X < 0;

  for (const invasor of formacao.invasores) {
    if (!invasor.vivo) continue;
    if (avanca) {
      // Desce e inverte
      invasor.y += PASSO_FORMACAO_Y;
    } else {
      invasor.x += PASSO_FORMACAO_X * formacao.direcao;
    }
  }

  if (avanca) {
    formacao.direcao = formacao.direcao > 0 ? -1 : 1;
  }

  return true;
}

/** Invasor mais à frente de uma coluna (para atirar bombas). */
export function invasorDaFrente(formacao: Formacao, coluna: number): Invasor | null {
  let melhor: Invasor | null = null;
  for (const invasor of formacao.invasores) {
    if (!invasor.vivo) continue;
    const colunaInvasor = Math.round((invasor.x - FORMACAO_X0) / PASSO_COLUNAS);
    if (colunaInvasor !== coluna) continue;
    if (!melhor || invasor.y > melhor.y) melhor = invasor;
  }
  return melhor;
}

/** Verifica se algum invasor alcançou a linha de defesa. */
export function invasorAlcancouDefesa(formacao: Formacao, linhaDefesaY: number): boolean {
  for (const invasor of formacao.invasores) {
    if (!invasor.vivo) continue;
    if (invasor.y + invasor.altura >= linhaDefesaY) return true;
  }
  return false;
}
