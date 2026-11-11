/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameLoopCallbacks {
  atualizar: (dt: number) => void;
  renderizar: () => void;
  aoMudarVisibilidade?: (visivel: boolean) => void;
}

export class RetroGameLoop {
  private callbacks: GameLoopCallbacks;
  private animFrameId: number | null = null;
  private rodando: boolean = false;
  private pausado: boolean = false;
  private ultimoTempo: number = 0;
  private acumulador: number = 0;
  private readonly passoFixo: number = 1 / 60; // 60 atualizações por segundo
  private boundFrame: (tempo: number) => void;
  private boundVisibilityChange: () => void;

  constructor(callbacks: GameLoopCallbacks) {
    this.callbacks = callbacks;
    this.boundFrame = this.frame.bind(this);
    this.boundVisibilityChange = this.aoMudarVisibilidadeDoc.bind(this);
  }

  iniciar(): void {
    if (this.rodando) return;
    this.rodando = true;
    this.pausado = false;
    this.ultimoTempo = performance.now();
    this.acumulador = 0;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.boundVisibilityChange);
    }

    this.animFrameId = requestAnimationFrame(this.boundFrame);
  }

  parar(): void {
    this.rodando = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    }
  }

  pausar(): void {
    this.pausado = true;
  }

  retomar(): void {
    if (this.pausado) {
      this.pausado = false;
      this.ultimoTempo = performance.now();
      this.acumulador = 0;
    }
  }

  estaPausado(): boolean {
    return this.pausado;
  }

  estaRodando(): boolean {
    return this.rodando;
  }

  private aoMudarVisibilidadeDoc(): void {
    const visivel = !document.hidden;
    if (this.callbacks.aoMudarVisibilidade) {
      this.callbacks.aoMudarVisibilidade(visivel);
    }
    if (!visivel) {
      this.pausar();
    }
  }

  private frame(tempoAtual: number): void {
    if (!this.rodando) return;

    let delta = (tempoAtual - this.ultimoTempo) / 1000;
    this.ultimoTempo = tempoAtual;

    // Limita delta máximo para evitar espiral de mortes em travadas
    if (delta > 0.25) {
      delta = 0.25;
    }

    if (!this.pausado) {
      this.acumulador += delta;

      // Executa passos de física fixos de 1/60s
      while (this.acumulador >= this.passoFixo) {
        this.callbacks.atualizar(this.passoFixo);
        this.acumulador -= this.passoFixo;
      }
    }

    // Renderiza sempre no vsync
    this.callbacks.renderizar();

    this.animFrameId = requestAnimationFrame(this.boundFrame);
  }
}
