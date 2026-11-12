/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Estado unificado de entradas do jogador.
 * Fornecido pelo motor a cada quadro de atualização (60 FPS).
 */
export interface InputState {
  // Estados contínuos (pressionado neste momento)
  esquerda: boolean;
  direita: boolean;
  cima: boolean;
  baixo: boolean;
  acao: boolean; // Pulo / Tiro primário (Espaço / Tecla Z / Botão A)
  acao2: boolean; // Ação secundária (Shift / Tecla X / Botão B)

  // Disparos únicos ("just pressed" neste quadro)
  acaoPressionada: boolean;
  acao2Pressionada: boolean;
  cimaPressionada: boolean;
  baixoPressionada: boolean;
  esquerdaPressionada: boolean;
  direitaPressionada: boolean;

  // Comandos de sistema
  pausarPressionado: boolean; // Tecla P
  reiniciarPressionado: boolean; // Tecla R
  voltarPressionado: boolean; // Tecla ESC
  mudoPressionado: boolean; // Tecla M
}

/**
 * Presets de áudio sintetizados via Web Audio API.
 */
export type AudioPreset =
  | 'pulo'
  | 'moeda'
  | 'explosao'
  | 'tiro'
  | 'vidaPerdida'
  | 'vitoria'
  | 'gameOver'
  | 'marreta'
  | 'barril'
  | 'alerta'
  | 'passo'
  | 'item'
  | 'semente'
  | 'fruta'
  | 'propulsor'
  | 'rochaGrande'
  | 'rochaMedia'
  | 'rochaPequena'
  | 'explosaoNave'
  | 'salto'
  | 'cristal'
  | 'batida'
  | 'abastecer';

export interface AudioService {
  tocar(preset: AudioPreset): void;
  tocarTom(frequencia: number, tipo: OscillatorType, duracao: number, volume?: number): void;
  ativar(): void;
  estaMudo(): boolean;
  definirMudo(mudo: boolean): void;
  obterVolume(): number;
  definirVolume(volume: number): void;
}

export interface StorageService {
  salvarRecorde(jogoId: string, pontuacao: number): boolean;
  lerRecorde(jogoId: string): number;
  listarRanking(): Record<string, number>;
  salvarPontuacaoHistorico(jogoId: string, pontuacao: number, nome?: string): void;
  limparDados(): void;
}

export interface HUDState {
  pontuacao: number; // Sempre inteiro!
  recorde: number; // Sempre inteiro!
  vidas: number;
  fase: number;
  bonus?: number;
  tituloFase?: string;
  statusTexto?: string;
  vidasMax?: number;
}

export interface HUDService {
  definirEstado(estado: Partial<HUDState>): void;
  obterEstado(): HUDState;
  adicionarPontos(pts: number, x?: number, y?: number, cor?: string): void;
  perderVida(): number;
  ganharVida(): number;
  definirFase(fase: number): void;
  proximaFase(): number;
  definirBonus(bonus: number): void;
  subtrairBonus(delta: number): number;
  desenharHUD(g: CanvasRenderingContext2D, largura: number, altura: number): void;
  desenharGameOver(g: CanvasRenderingContext2D, largura: number, altura: number, mensagem?: string): void;
  desenharVitoria(g: CanvasRenderingContext2D, largura: number, altura: number, mensagem: string, bonus?: number): void;
}

export interface Rect {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface Circle {
  x: number;
  y: number;
  raio: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CollisionUtils {
  retanguloRetangulo(r1: Rect, r2: Rect): boolean;
  pontoRetangulo(px: number, py: number, r: Rect): boolean;
  circuloCirculo(c1: Circle, c2: Circle): boolean;
  circuloRetangulo(c: Circle, r: Rect): boolean;
  linhaInterseccao(p1: Point, p2: Point, p3: Point, p4: Point): boolean;
}

export interface SpriteUtils {
  desenharMatriz(
    g: CanvasRenderingContext2D,
    matriz: string[],
    paleta: Record<string, string>,
    x: number,
    y: number,
    tamanhoPixel?: number,
    espelharX?: boolean
  ): void;
}

/**
 * Contexto compartilhado que o motor fornece à instância do jogo.
 */
export interface EngineContext {
  id: string;
  largura: number;
  altura: number;
  audio: AudioService;
  storage: StorageService;
  hud: HUDService;
  colisao: CollisionUtils;
  sprites: SpriteUtils;
  finalizarJogo(motivo: 'vitoria' | 'gameOver'): void;
  solicitarPausa(): void;
  solicitarReinicio(): void;
  voltarAoHub(): void;
}

/**
 * Instância viva de um jogo instanciado pelo motor.
 */
export interface GameInstance {
  iniciar(): void;
  atualizar(dt: number, input: InputState): void;
  desenhar(g: CanvasRenderingContext2D): void;
  pausar(): void;
  retomar(): void;
  reiniciar(): void;
  destruir(): void; // Limpar timers, listeners ou referências pendentes
}

/**
 * Contrato de um jogo registrado na plataforma Fliperama.
 */
export interface GameModule {
  id: string; // Ex: "hannah"
  titulo: string; // Ex: "Salve a Hannah"
  descricao: string; // 1 frase para o card do hub
  genero: string; // Ex: "Plataforma"
  corTema: string; // Cor de destaque do card (ex: "#EF4444")
  largura: number; // Resolução lógica do canvas (ex: 480 ou 224)
  altura: number; // (ex: 560 ou 256)
  instrucoes?: {
    historia?: string;
    controles?: string[];
    pontos?: { acao: string; pontos: number }[];
  };
  criar(ctx: EngineContext): GameInstance;
}
