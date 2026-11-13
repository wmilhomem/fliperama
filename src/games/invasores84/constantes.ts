/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Constantes do jogo "Invasores Cósmicos 84".
 *
 * Estética de monitor de fósforo verde dos anos 80. Medidas em pixels,
 * com sprites desenhados em múltiplos de 16.
 */

/* ------------------------------------------------------------------ */
/* RESOLUÇÃO E ÁREAS                                                    */
/* ------------------------------------------------------------------ */

export const LARGURA = 480;
export const ALTURA = 560;

/** Altura do HUD do motor no topo. */
export const HUD_ALTURA = 48;

/** Linha de defesa (topo da plataforma da estação). */
export const LINHA_DEFESA_Y = 496;

/* ------------------------------------------------------------------ */
/* FORMAÇÃO                                                            */
/* ------------------------------------------------------------------ */

export const COLUNAS = 10;
export const FILEIRAS = 5;

/** Tamanho do sprite do invasor. */
export const INVASOR_LARGURA = 32;
export const INVASOR_ALTURA = 32;

/** Espaçamento vertical entre as fileiras (16 px). */
export const ESPACO_FILEIRAS = 16;

/**
 * Passos da formação (movimento em blocos discretos).
 * O passo horizontal é curto para a formação ter espaço de marcha.
 */
export const PASSO_FORMACAO_X = 8;
export const PASSO_FORMACAO_Y = 16;

/** Topo da primeira fileira. */
export const FORMACAO_Y0 = 60;

/** Coluna inicial (a formação é centralizada). */
export const FORMACAO_X0 = 40;

/** Intervalo entre passos no início da onda (segundos). */
export const INTERVALO_MARCHA_BASE = 0.62;

/** Intervalo mínimo entre passos (o último invasor é bem mais rápido). */
export const INTERVALO_MARCHA_MINIMO = 0.055;

/** Quantidade de invasores por onda. */
export const INVASORES_POR_ONDA = COLUNAS * FILEIRAS;

/* ------------------------------------------------------------------ */
/* CANHÃO E TIROS                                                       */
/* ------------------------------------------------------------------ */

export const CANHAO_LARGURA = 32;
export const CANHAO_ALTURA = 16;
export const CANHAO_Y = 470;
export const CANHAO_VELOCIDADE = 235;

export const TIRO_LARGURA = 8;
export const TIRO_ALTURA = 16;
export const TIRO_VELOCIDADE = 430;

/* ------------------------------------------------------------------ */
/* BOMBAS                                                              */
/* ------------------------------------------------------------------ */

export const BOMBA_LARGURA = 8;
export const BOMBA_ALTURA = 16;
export const BOMBA_VELOCIDADE = 190;
export const BOMBAS_MAXIMAS = 3;

/* ------------------------------------------------------------------ */
/* ABRIGOS                                                             */
/* ------------------------------------------------------------------ */

export const ABRIGO_LARGURA = 64;
export const ABRIGO_ALTURA = 48;
export const ABRIGO_BLOCO = 8;
export const ABRIGO_COLUNAS = ABRIGO_LARGURA / ABRIGO_BLOCO;
export const ABRIGO_FILEIRAS = ABRIGO_ALTURA / ABRIGO_BLOCO;
export const ABRIGOS_X = [32, 144, 256, 368];
export const ABRIGO_Y = 396;

/** Raio de erosão (em blocos) ao atingir um abrigo. */
export const EROSAO_BLOCOS = 2;

/* ------------------------------------------------------------------ */
/* DISCO-MÃE                                                           */
/* ------------------------------------------------------------------ */

export const DISCO_LARGURA = 48;
export const DISCO_ALTURA = 16;
export const DISCO_Y = 84;
export const DISCO_VELOCIDADE = 110;
export const DISCO_INTERVALO = 25;

/** Tabela de bônus do disco conforme os tiros disparados na onda. */
export const DISCO_BONUS: Array<{ tiros: number; pontos: number }> = [
  { tiros: 0, pontos: 50 },
  { tiros: 8, pontos: 100 },
  { tiros: 16, pontos: 150 },
  { tiros: 28, pontos: 300 },
];

/* ------------------------------------------------------------------ */
/* CHEFE (ONDA-CHEFE)                                                  */
/* ------------------------------------------------------------------ */

export const CHEFE_LARGURA = 96;
export const CHEFE_ALTURA = 48;
export const CHEFE_VIDAS = 10;
export const CHEFE_PONTOS = 1500;
export const CHEFE_INTERVALO_ONDAS = 5;

/* ------------------------------------------------------------------ */
/* PONTUAÇÃO E VIDAS                                                   */
/* ------------------------------------------------------------------ */

export const VIDAS_INICIAIS = 3;
export const VIDAS_MAXIMAS = 6;

/** Primeiro vida extra em 1.500 pontos; depois a cada 15.000. */
export const PONTOS_PRIMEIRA_VIDA = 1500;
export const PONTOS_VIDA_EXTRA = 15000;

/* ------------------------------------------------------------------ */
/* PALETA (FÓSFORO VERDE DOS ANOS 80)                                   */
/* ------------------------------------------------------------------ */

export const PALETA = {
  preto: '#03060A',
  fosforo: '#39FF6A',
  fosforoClaro: '#B6FFC9',
  fosforoEscuro: '#0E7A33',
  verdeMarinho: '#062B18',
  planeta: '#1E3A8A',
  planetaClaro: '#3B82F6',
  planetaBorda: '#93C5FD',
  metal: '#5A6B7A',
  metalClaro: '#94A3B8',
  metalEscuro: '#27303C',
  branco: '#FFFFFF',
  vermelho: '#FF5A5A',
  laranja: '#FFA23A',
} as const;
