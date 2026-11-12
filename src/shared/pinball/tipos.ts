/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * BIBLIOTECA COMPARTILHADA DE PINBALL
 *
 * Tipos usados para descrever mesas, geometria de campo e elementos.
 * Uma mesa é 100% dados: geometria, elementos, regras, cores e arte.
 */

import { AudioPreset } from '../../engine/types';
import type { Bola } from './fisica';

/** Ponto no plano da mesa (coordenadas lógicas em pixels do canvas). */
export interface Ponto {
  x: number;
  y: number;
}

/** Retângulo orientado nos eixos. */
export interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/** Segmento de reta (parede reta do campo). */
export interface SegmentoParede {
  tipo: 'segmento';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Coeficiente de restituição (0 = sem quique, 1 = elástico). */
  restituicao?: number;
  /** Atrito aplicado na componente tangencial. */
  atrito?: number;
}

/**
 * Arco de parede.
 *
 * Ângulos em radianos, coordenadas de tela (Y crescendo para baixo).
 * `sentido` define se o arco percorre os ângulos de forma crescente (1) ou
 * decrescente (-1). `interno` indica que a bola colide pelo lado de dentro
 * do círculo (ex.: cotovelo da canaleta do lançador).
 */
export interface ArcoParede {
  tipo: 'arco';
  cx: number;
  cy: number;
  raio: number;
  anguloInicio: number;
  anguloFim: number;
  sentido: 1 | -1;
  interno?: boolean;
  restituicao?: number;
  atrito?: number;
}

export type Parede = SegmentoParede | ArcoParede;

export interface BaseElemento {
  id: string;
  /** Pontuação padrão do elemento quando acionado. */
  pontos?: number;
}

/** Bumper de pop (tamborim na Gafieira). */
export interface BumperPop extends BaseElemento {
  tipo: 'bumper';
  x: number;
  y: number;
  raio: number;
  /** Impulso radial aplicado à bola. */
  forca: number;
  rotulo?: string;
}

/** Slingshot (triângulo de borracha ao lado dos flippers). */
export interface Slingshot extends BaseElemento {
  tipo: 'slingshot';
  vertices: [Ponto, Ponto, Ponto];
  forca: number;
  /** Índice da aresta que é a face de chute (0 = primeira aresta). */
  faceChute?: number;
}

/** Alvo fixo (stand-up target): acende e permanece aceso. */
export interface AlvoFixo extends BaseElemento {
  tipo: 'alvoFixo';
  x: number;
  y: number;
  largura: number;
  altura: number;
  rotulo?: string;
  /** Grupo ao qual o alvo pertence (ex.: trio de instrumentos). */
  grupo?: string;
}

/** Alvo de queda (drop target): cai ao ser atingido e reseta em banco. */
export interface AlvoQueda extends BaseElemento {
  tipo: 'alvoQueda';
  x: number;
  y: number;
  largura: number;
  altura: number;
  rotulo?: string;
  /** Banco/grupo ao qual o alvo pertence (ex.: letras S-A-M-B-A). */
  grupo?: string;
}

/** Pista de rolagem (rollover lane): sensor que acende. */
export interface Rollover extends BaseElemento {
  tipo: 'rollover';
  x: number;
  y: number;
  largura: number;
  altura: number;
  rotulo?: string;
}

/** Spinner (placa giratória que conta voltas). */
export interface Spinner extends BaseElemento {
  tipo: 'spinner';
  x: number;
  y: number;
  largura: number;
  altura: number;
  rotulo?: string;
}

/** Inlane: devolve a bola para o flipper. */
export interface Inlane extends BaseElemento {
  tipo: 'inlane';
  x: number;
  y: number;
  largura: number;
  altura: number;
  lado: 'esquerda' | 'direita';
}

/** Outlane: leva a bola direto para o dreno. */
export interface Outlane extends BaseElemento {
  tipo: 'outlane';
  x: number;
  y: number;
  largura: number;
  altura: number;
  lado: 'esquerda' | 'direita';
}

/** Mola do lançador (plunger). */
export interface Plunger extends BaseElemento {
  tipo: 'plunger';
  x: number;
  y: number;
  comprimento: number;
  forcaMax: number;
}

/** Dreno inferior: encerra a bola. */
export interface Dreno extends BaseElemento {
  tipo: 'dreno';
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/**
 * Portão de mão única.
 *
 * A bola passa livremente subindo (ao ser lançada) e é devolvida para o
 * campo de jogo se tentar voltar para baixo da pista do lançador.
 */
export interface PortaoMaoUnica extends BaseElemento {
  tipo: 'portao';
  /** Borda esquerda do portão. */
  x: number;
  /** Altura do portão. */
  y: number;
  /** Largura do portão. */
  largura: number;
}

/**
 * Trilho / arco (sensor de passagem).
 *
 * Não bloqueia a bola: avisa toda vez que ela atravessa a região
 * (ex.: um arco-rampa em órbita).
 */
export interface Trilho extends BaseElemento {
  tipo: 'trilho';
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export type ElementoMesa =
  | BumperPop
  | Slingshot
  | AlvoFixo
  | AlvoQueda
  | Rollover
  | Spinner
  | Inlane
  | Outlane
  | Plunger
  | Dreno
  | PortaoMaoUnica
  | Trilho;

/** Estado de runtime de um bumper. */
export interface EstadoBumper {
  tipo: 'bumper';
  animacao: number;
  brilho: number;
}

/** Estado de runtime de um slingshot. */
export interface EstadoSlingshot {
  tipo: 'slingshot';
  animacao: number;
}

/** Estado de runtime de um alvo fixo. */
export interface EstadoAlvoFixo {
  tipo: 'alvoFixo';
  aceso: boolean;
  animacao: number;
}

/** Estado de runtime de um alvo de queda. */
export interface EstadoAlvoQueda {
  tipo: 'alvoQueda';
  caido: boolean;
  animacao: number;
  /** Tempo restante até o banco resetar (0 = sem reset pendente). */
  resetEm: number;
}

/** Estado de runtime de uma pista de rolagem. */
export interface EstadoRollover {
  tipo: 'rollover';
  aceso: boolean;
  animacao: number;
}

/** Estado de runtime do spinner. */
export interface EstadoSpinner {
  tipo: 'spinner';
  angulo: number;
  velocidade: number;
  voltas: number;
  animacao: number;
  /** Verdadeiro enquanto a bola está sobre a placa (evita contar em rajada). */
  dentro: boolean;
}

/** Estado de runtime de inlane/outlane. */
export interface EstadoCanal {
  tipo: 'inlane' | 'outlane';
  aceso: boolean;
  animacao: number;
}

/** Estado genérico (sem animação). */
export interface EstadoSimples {
  tipo: 'plunger' | 'dreno';
  animacao: number;
}

export type EstadoElemento =
  | EstadoBumper
  | EstadoSlingshot
  | EstadoAlvoFixo
  | EstadoAlvoQueda
  | EstadoRollover
  | EstadoSpinner
  | EstadoCanal
  | EstadoSimples;

/** Definição de um flipper (cápsula rotativa). */
export interface DefinicaoFlipper {
  lado: 'esquerda' | 'direita';
  pivoX: number;
  pivoY: number;
  comprimento: number;
  /** Espessura na base do flipper. */
  raio: number;
  /** Espessura na ponta do flipper (opcional; padrão = `raio`). */
  raioPonta?: number;
  /** Ângulo de repouso em radianos. */
  anguloRepouso: number;
  /** Ângulo ativo (botão pressionado) em radianos. */
  anguloAtivo: number;
}

/**
 * Região do dreno usada pelo modo debug para contar por onde a bola saiu.
 */
export interface RegiaoDreno {
  id: string;
  rotulo: string;
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/** Lâmpada do painel (TILT, GAME OVER, ESPECIAL...). */
export interface DefinicaoLuz {
  id: string;
  rotulo: string;
  x: number;
  y: number;
}

/** Visor de 6 dígitos do painel de placar (grade de 2 colunas x 2 linhas). */
export interface DefinicaoVisor {
  id: string;
  rotulo: string;
  /** Coluna na grade do painel (0 = jogador 1, 1 = recorde...). */
  coluna: number;
  /** Linha na grade do painel (0 = linha superior, 1 = linha inferior). */
  linha: number;
}

/** Contexto de desenho entregue às mesas. */
export interface ContextoDesenho {
  tempo: number;
  estado: EstadoMesa;
  largura: number;
  altura: number;
  painelAltura: number;
}

/** Contexto entregue às regras da mesa quando um evento acontece. */
export interface ContextoRegra {
  /** Soma pontos ao placar do motor. */
  pontuar(valor: number): void;
  /** Toca um preset de áudio do motor. */
  audio(preset: AudioPreset): void;
  /** Consulta o estado de uma lâmpada do painel. */
  luz(id: string): boolean;
  /** Acende/apaga uma lâmpada do painel. */
  acenderLuz(id: string, acesa: boolean): void;
  /** Multiplicador de bônus atual (1..5). */
  multiplicador(): number;
  /** Sobe um nível do multiplicador (até o limite da mesa). */
  aumentarMultiplicador(): void;
  /** Bolas restantes na partida. */
  bolasRestantes(): number;
  /** Concede uma bola extra. */
  adicionarBola(): void;
  /** Liga o "atire de novo" para a bola atual. */
  ativarAtireDeNovo(): void;
  /** Apaga a marcação de um elemento (ex.: rearmar uma pista de rolagem). */
  apagarElemento(id: string): void;
  /** Verdadeiro quando o elemento já está marcado (acesso/aceso). */
  elementoAceso(id: string): boolean;
  /** Verdadeiro enquanto há bola em campo. */
  bolaEmJogo(): boolean;
}

/** Regras da mesa: callbacks de eventos do campo. */
export interface RegrasMesa {
  aoBumper?(elemento: BumperPop, ctx: ContextoRegra): void;
  aoSlingshot?(elemento: Slingshot, ctx: ContextoRegra): void;
  aoAlvoFixo?(elemento: AlvoFixo, ctx: ContextoRegra): void;
  aoAlvoQueda?(elemento: AlvoQueda, ctx: ContextoRegra): void;
  aoBancoCompleto?(grupo: string, ctx: ContextoRegra): void;
  aoGrupoCompleto?(grupo: string, ctx: ContextoRegra): void;
  aoRollover?(elemento: Rollover, ctx: ContextoRegra): void;
  aoPistasCompletas?(ctx: ContextoRegra): void;
  aoSpinner?(elemento: Spinner, ctx: ContextoRegra): void;
  /** A bola atravessou um trilho/arco (ex.: arco em órbita). */
  aoTrilho?(elemento: Trilho, ctx: ContextoRegra): void;
  aoInlane?(elemento: Inlane, ctx: ContextoRegra): void;
  aoOutlane?(elemento: Outlane, ctx: ContextoRegra): void;
  aoDreno?(ctx: ContextoRegra): void;
  aoTilt?(ctx: ContextoRegra): void;
  aoBolaExtra?(ctx: ContextoRegra): void;
  aoAtireDeNovo?(ctx: ContextoRegra): void;
}

/** Definição completa de uma mesa de pinball. */
export interface DefinicaoMesa {
  id: string;
  titulo: string;
  corTema: string;
  largura: number;
  altura: number;
  /** Altura do painel de placar (vidro traseiro) no topo. */
  painelAltura: number;
  /** Gravidade do campo inclinado (px/s²). */
  gravidade?: number;
  /** Bolas por partida (padrão 3). */
  bolasPorPartida?: number;
  /** Limite do multiplicador de bônus (padrão 5). */
  multiplicadorMaximo?: number;
  /** Segundos de proteção de bola ("ball save") após o lançamento. */
  ballSave?: { segundos?: number; mensagem?: string };
  /** Regiões do dreno usadas pelo contador do modo debug. */
  regioesDreno?: RegiaoDreno[];
  geometria: Parede[];
  elementos: ElementoMesa[];
  flippers: [DefinicaoFlipper, DefinicaoFlipper];
  luzes: DefinicaoLuz[];
  visores: DefinicaoVisor[];
  regras: RegrasMesa;
  /** Cenário desenhado atrás do campo (piso, cortinas, palco). */
  desenharCenario?(g: CanvasRenderingContext2D, ctx: ContextoDesenho): void;
  /**
   * Camada estática pré-renderizada (cenário + decoração do campo).
   * É desenhada UMA vez em um canvas fora da tela e copiada a cada quadro.
   */
  desenharCamadaEstatica?(g: CanvasRenderingContext2D, ctx: ContextoDesenho): void;
  /** Arte customizada de um elemento (usa a arte padrão se omitido). */
  desenharElemento?(
    g: CanvasRenderingContext2D,
    elemento: ElementoMesa,
    estado: EstadoElemento,
    ctx: ContextoDesenho
  ): void;
  /** Arte do vidro traseiro (painel de placar). */
  desenharPainel?(g: CanvasRenderingContext2D, ctx: ContextoDesenho): void;
  /** Arte da bola. */
  desenharBola?(g: CanvasRenderingContext2D, bola: Bola, ctx: ContextoDesenho): void;
  /** Atualização por quadro da mesa (trilha sonora, efeitos, etc). */
  aoAtualizar?(dt: number, ctx: ContextoDesenho): void;
  /** Chamado quando o jogo entra em pausa. */
  aoPausar?(): void;
  /** Chamado quando o jogo volta da pausa. */
  aoRetomar?(): void;
  /** Chamado na destruição do jogo (limpeza de recursos). */
  aoDestruir?(): void;
}

/** Estado público da partida, exposto às mesas. */
export interface EstadoMesa {
  pontuacao: number;
  recorde: number;
  bolaAtual: number;
  bolasRestantes: number;
  bolasPorPartida: number;
  multiplicador: number;
  multiplicadorMaximo: number;
  tilt: boolean;
  atireDeNovo: boolean;
  especial: boolean;
  bonus: number;
  bonusAnimado: number;
  bonusAlvo: number;
  luzes: Record<string, boolean>;
  elementos: Record<string, EstadoElemento>;
  tempo: number;
  fase: 'titulo' | 'jogando' | 'fimDeBola' | 'gameover';
}
