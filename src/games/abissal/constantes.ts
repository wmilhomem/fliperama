/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Constantes do jogo "Submarino Abissal".
 *
 * Medidas em pixels. A arte usa múltiplos de 16 (unidade-base 16x16).
 * Layout vertical: HUD 0..48, superfície 48..112, mar 112..512, fundo 512..560.
 */

/* ------------------------------------------------------------------ */
/* RESOLUÇÃO E ÁREAS                                                    */
/* ------------------------------------------------------------------ */

export const LARGURA = 480;
export const ALTURA = 560;

/** Altura do HUD do motor no topo. */
export const HUD_ALTURA = 48;

/** Topo da faixa de superfície (céu). */
export const SUPERFICIE_TOPO = 48;

/** Linha d'água (topo do mar). */
export const AGUA_Y = 112;

/** Topo do fundo do mar. */
export const FUNDO_Y = 512;

/** Quantidade de faixas horizontais do mar. */
export const TOTAL_FAIXAS = 5;

/** Altura de cada faixa do mar. */
export const FAIXA_ALTURA = 80;

/** Altura da faixa de superfície. */
export const SUPERFICIE_ALTURA = AGUA_Y - SUPERFICIE_TOPO;

/* ------------------------------------------------------------------ */
/* REGRAS                                                              */
/* ------------------------------------------------------------------ */

export const VIDAS_INICIAIS = 3;
export const VIDAS_MAXIMAS = 6;
export const PONTOS_POR_VIDA_EXTRA = 10000;

/** Mergulhadores transportados ao mesmo tempo. */
export const MAX_MERGULHADORES = 6;

/** Oxigênio máximo (percentual). */
export const OXIGENIO_MAXIMO = 100;

/** Percentual abaixo do qual o alarme de oxigênio dispara. */
export const LIMITE_ALARME = 25;

/** Tempo (s) parado na superfície antes de a patrulha aparecer. */
export const TEMPO_PATRULHA_INICIAL = 40;

/** Tempo (s) parado na superfície que dispara a patrulha. */
export const TEMPO_SUPERFICIE_PATRULHA = 6;

/** Pontos por fase dos inimigos comuns (sobe 10 por fase, teto 90). */
export const PONTOS_BASE_INIMIGO = 20;
export const PONTOS_POR_FASE = 10;
export const PONTOS_MAX_INIMIGO = 90;

/** Pontos do navio de patrulha. */
export const PONTOS_PATRULHA = 150;

/** Pontos por mergulhador entregue (fase x 50, teto 500). */
export const PONTOS_ENTREGA = 50;
export const PONTOS_ENTREGA_MAX = 500;

/** Bônus da fase concluída: 50 pontos por ponto de oxigênio restante. */
export const BONUS_FASE_POR_OXIGENIO = 50;

/* ------------------------------------------------------------------ */
/* PALETA                                                              */
/* ------------------------------------------------------------------ */

export const PALETA = {
  ceuAlto: '#7DD3FC',
  ceuBaixo: '#FDE68A',
  agua1: '#67E8F9',
  agua2: '#22D3EE',
  agua3: '#0E7490',
  agua4: '#0C4A6E',
  agua5: '#082F49',
  agua6: '#041E33',
  areia: '#C2A878',
  areiaEscura: '#8B7355',
  coral: '#FB7185',
  coral2: '#A78BFA',
  alga: '#34D399',
  subCasco: '#D9A441',
  subCascoEscuro: '#8B5E1F',
  cupula: '#FDE68A',
  metal: '#94A3B8',
  metalEscuro: '#475569',
  luz: '#FEF9C3',
  vermelho: '#EF4444',
  vermelhoEscuro: '#991B1B',
  tubarao: '#3F4A5A',
  tubaraoClaro: '#64748B',
  piranha: '#F472B6',
  piranhaEscuro: '#BE185D',
  aguaViva: '#C084FC',
  aguaVivaBrilho: '#E9D5FF',
  Mergulhador: '#F8FAFC',
  MergulhadorVisor: '#38BDF8',
} as const;

/* ------------------------------------------------------------------ */
/* POSIÇÕES DE REFERÊNCIA                                              */
/* ------------------------------------------------------------------ */

/** X do navio de apoio "Pérola" (à esquerda, na superfície). */
export const X_NAVIO_APOIO = 56;

/** X do ponto de retorno do submarino (centro da superfície). */
export const X_RETORNO = 240;

/** Y do centro do navio de apoio. */
export const Y_NAVIO_APOIO = 84;
