/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * TIPOS DAS TELAS E DO MOTOR — SALVE A HANNAH
 *
 * As telas são definidas por dados: vigas como segmentos (com inclinação
 * própria), escadas inteiras e quebradas ligando vigas, itens e pontos de
 * nascimento. A altura de uma escada é calculada na carga a partir da
 * geometria das vigas que ela liga.
 */

export interface SegmentoDef {
  /** Ponto inicial (esquerda). Altura final definida por `dy` (0 = reto). */
  x: number;
  y: number;
  /** Comprimento horizontal. */
  largura: number;
  /** Variação vertical até a ponta direita (negativo = inclinado p/ cima). */
  dy: number;
  /** Direção do fluxo (para objetos que rolam): 1 = direita → esquerda? não:
   *  -1 rola para a esquerda, 1 para a direita. */
  direcao: 1 | -1;
  /** Esteira rolante (só na Tela 2): empurra o jogador e os objetos. */
  esteira?: boolean;
  /** Sentido atual da esteira (1 direita, -1 esquerda). */
  sentidoEsteira?: 1 | -1;
  /** Espessura da viga em pixels (padrão 12). */
  altura?: number;
}

export interface EscadaDef {
  x: number;
  /** Índices das duas vigas que esta escada liga. */
  entre: [number, number];
  quebrada?: boolean;
}

export type TipoItemBonus = 'chapeu' | 'bolsa' | 'guarda-chuva';

export interface ItemBonusDef {
  tipo: TipoItemBonus;
  x: number;
  y: number;
}

export interface TelaDef {
  numero: number;
  nome: string;
  /** Altura exibida no HUD/cenas (25, 50, 75, 100). */
  alturaMetros: number;
  bonusInicial: number;
  girders: SegmentoDef[];
  escadas: EscadaDef[];
  jogadorSpawn: { x: number; y: number };
  grotao: { x: number; y: number };
  hannah: { x: number; y: number };
  barrilSpawn: { x: number; y: number };
  /** Barril de óleo decorativo/gatilho de bolas de fogo (Tela 1). */
  barrilOleo?: { x: number; y: number };
  /** Pontos de reaparecimento dos martelos (sempre 2 quando presente). */
  martelos?: { x: number; y: number }[];
  itensBonus: ItemBonusDef[];
  /** Tela 2: pontos de saída das caixas de massa (laterais da esteira central). */
  spawnCaixas?: { x: number; y: number; sentido: 1 | -1 }[];
  /** Tela 3: duas colunas de elevadores. */
  elevadores?: { x: number; yTop: number; yBottom: number; velocidade: number; fase: number }[];
  /** Tela 4: travas a retirar. */
  travas?: { x: number; y: number }[];
}

/** Vigas resolvidas com Y calculado. */
export interface Segmento extends SegmentoDef {
  x2: number;
  y2: number;
  altura: number;
  yEm(x: number): number;
}

/** Escadas resolvidas. */
export interface Escada {
  x: number;
  yTop: number;
  yBottom: number;
  quebrada: boolean;
  entre: [number, number];
}

export interface EstruturaTela {
  def: TelaDef;
  girders: Segmento[];
  escadas: Escada[];
}
