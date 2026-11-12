/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EstadoJogo = 'titulo' | 'jogando' | 'transicao' | 'resultado';
export type ClimaTipo = 'limpo' | 'chuva' | 'neblina' | 'gelo';
export type TipoProp = 'arvore' | 'poste' | 'placa' | 'pedra' | 'casa' | 'cerca';

export interface Projecao {
  x: number;
  y: number;
  largura: number;
  escala: number;
  zRelativo: number;
  visivel: boolean;
}

export interface PropCenario {
  tipo: TipoProp;
  lado: -1 | 1;
  deslocamento: number;
  variacao: number;
}

export interface Segmento {
  indice: number;
  curva: number;
  mundoY: number;
  faixa: number;
  p1: Projecao;
  p2: Projecao;
  props: PropCenario[];
}

export interface Estrada {
  segmentos: Segmento[];
  comprimento: number;
}

export interface ProjecaoEstrada {
  baseIndice: number;
  basePercentual: number;
  jogadorY: number;
  distancia: number;
}

export interface Jogador {
  x: number;
  velocidadeLateral: number;
  inclinacao: number;
  derrapagem: number;
}

export interface Trafego {
  zRelativo: number;
  faixa: number;
  velocidade: number;
  cor: string;
  ultrapassado: boolean;
}

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  maxVida: number;
  cor: string;
  tamanho: number;
}

export interface GotaClima {
  x: number;
  y: number;
  velocidade: number;
  comprimento: number;
  variacao: number;
}

export interface SistemaClima {
  tipo: ClimaTipo;
  aderencia: number;
  visibilidade: number;
  gotas: GotaClima[];
  tempo: number;
}

export interface Estrela {
  x: number;
  y: number;
  tamanho: number;
  brilho: number;
}

export interface Nuvem {
  x: number;
  y: number;
  escala: number;
  velocidade: number;
}

export interface CenarioFundo {
  estrelas: Estrela[];
  nuvens: Nuvem[];
  montanhasLonge: number[];
  montanhasPerto: number[];
  arvores: number[];
}

export interface ResultadoPartida {
  dia: number;
  pontuacao: number;
  recorde: number;
  carros: number;
  meta: number;
}
