/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState } from './types';

export class UnifiedInputManager {
  private teclasPressionadas: Set<string> = new Set();
  private touchEstados: Partial<Record<keyof InputState, boolean>> = {};
  private estadosAnteriores: {
    acao: boolean;
    acao2: boolean;
    cima: boolean;
    baixo: boolean;
    esquerda: boolean;
    direita: boolean;
    pausa: boolean;
    reiniciar: boolean;
  } = {
    acao: false,
    acao2: false,
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false,
    pausa: false,
    reiniciar: false,
  };

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private listening: boolean = false;

  constructor() {
    this.boundKeyDown = this.aoPressionarTecla.bind(this);
    this.boundKeyUp = this.aoSoltarTecla.bind(this);
  }

  iniciar(): void {
    if (this.listening || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.boundKeyDown, { passive: false });
    window.addEventListener('keyup', this.boundKeyUp, { passive: false });
    this.listening = true;
  }

  parar(): void {
    if (!this.listening || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.teclasPressionadas.clear();
    this.touchEstados = {};
    this.listening = false;
  }

  private aoPressionarTecla(e: KeyboardEvent): void {
    const code = e.code;
    const key = e.key;

    // Teclas do jogo que previnem rolagem
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code) ||
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)
    ) {
      e.preventDefault();
    }

    this.teclasPressionadas.add(code);
    this.teclasPressionadas.add(key);
  }

  private aoSoltarTecla(e: KeyboardEvent): void {
    this.teclasPressionadas.delete(e.code);
    this.teclasPressionadas.delete(e.key);
  }

  definirTouch(botao: keyof InputState, ativo: boolean): void {
    this.touchEstados[botao] = ativo;
  }

  private lerGamepad(): {
    esquerda: boolean;
    direita: boolean;
    cima: boolean;
    baixo: boolean;
    acao: boolean;
    acao2: boolean;
  } {
    const res = {
      esquerda: false,
      direita: false,
      cima: false,
      baixo: false,
      acao: false,
      acao2: false,
    };

    if (typeof navigator === 'undefined' || !navigator.getGamepads) return res;

    try {
      const gamepads = navigator.getGamepads();
      if (!gamepads) return res;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp || !gp.connected) continue;

        // D-Pad standard / axes
        const axisX = gp.axes[0] || 0;
        const axisY = gp.axes[1] || 0;

        const bUp = gp.buttons[12]?.pressed || axisY < -0.4;
        const bDown = gp.buttons[13]?.pressed || axisY > 0.4;
        const bLeft = gp.buttons[14]?.pressed || axisX < -0.4;
        const bRight = gp.buttons[15]?.pressed || axisX > 0.4;

        // Botão A (0) / Botão B (1)
        const bAction = gp.buttons[0]?.pressed || gp.buttons[2]?.pressed || false;
        const bAction2 = gp.buttons[1]?.pressed || gp.buttons[3]?.pressed || false;

        res.cima = res.cima || bUp;
        res.baixo = res.baixo || bDown;
        res.esquerda = res.esquerda || bLeft;
        res.direita = res.direita || bRight;
        res.acao = res.acao || bAction;
        res.acao2 = res.acao2 || bAction2;
      }
    } catch {
      // Ignora erro de acesso a gamepad
    }

    return res;
  }

  obterEstado(): InputState {
    const gp = this.lerGamepad();

    const kLeft =
      this.teclasPressionadas.has('ArrowLeft') ||
      this.teclasPressionadas.has('KeyA') ||
      this.teclasPressionadas.has('a') ||
      this.teclasPressionadas.has('A');

    const kRight =
      this.teclasPressionadas.has('ArrowRight') ||
      this.teclasPressionadas.has('KeyD') ||
      this.teclasPressionadas.has('d') ||
      this.teclasPressionadas.has('D');

    const kUp =
      this.teclasPressionadas.has('ArrowUp') ||
      this.teclasPressionadas.has('KeyW') ||
      this.teclasPressionadas.has('w') ||
      this.teclasPressionadas.has('W');

    const kDown =
      this.teclasPressionadas.has('ArrowDown') ||
      this.teclasPressionadas.has('KeyS') ||
      this.teclasPressionadas.has('s') ||
      this.teclasPressionadas.has('S');

    const kAction =
      this.teclasPressionadas.has('Space') ||
      this.teclasPressionadas.has(' ') ||
      this.teclasPressionadas.has('KeyZ') ||
      this.teclasPressionadas.has('z') ||
      this.teclasPressionadas.has('Z') ||
      this.teclasPressionadas.has('Enter');

    const kAction2 =
      this.teclasPressionadas.has('ShiftLeft') ||
      this.teclasPressionadas.has('ShiftRight') ||
      this.teclasPressionadas.has('KeyX') ||
      this.teclasPressionadas.has('x') ||
      this.teclasPressionadas.has('X');

    const kPause =
      this.teclasPressionadas.has('KeyP') ||
      this.teclasPressionadas.has('p') ||
      this.teclasPressionadas.has('P');

    const kReset =
      this.teclasPressionadas.has('KeyR') ||
      this.teclasPressionadas.has('r') ||
      this.teclasPressionadas.has('R');

    const esquerda = kLeft || !!this.touchEstados.esquerda || gp.esquerda;
    const direita = kRight || !!this.touchEstados.direita || gp.direita;
    const cima = kUp || !!this.touchEstados.cima || gp.cima;
    const baixo = kDown || !!this.touchEstados.baixo || gp.baixo;
    const acao = kAction || !!this.touchEstados.acao || gp.acao;
    const acao2 = kAction2 || !!this.touchEstados.acao2 || gp.acao2;
    const pausa = kPause || !!this.touchEstados.pausarPressionado;
    const reiniciar = kReset || !!this.touchEstados.reiniciarPressionado;

    // Detecção de borda de subida (just pressed)
    const acaoPressionada = acao && !this.estadosAnteriores.acao;
    const acao2Pressionada = acao2 && !this.estadosAnteriores.acao2;
    const cimaPressionada = cima && !this.estadosAnteriores.cima;
    const baixoPressionada = baixo && !this.estadosAnteriores.baixo;
    const esquerdaPressionada = esquerda && !this.estadosAnteriores.esquerda;
    const direitaPressionada = direita && !this.estadosAnteriores.direita;
    const pausarPressionado = pausa && !this.estadosAnteriores.pausa;
    const reiniciarPressionado = reiniciar && !this.estadosAnteriores.reiniciar;

    // Salvar estado atual para o próximo frame
    this.estadosAnteriores = {
      acao,
      acao2,
      cima,
      baixo,
      esquerda,
      direita,
      pausa,
      reiniciar,
    };

    return {
      esquerda,
      direita,
      cima,
      baixo,
      acao,
      acao2,
      acaoPressionada,
      acao2Pressionada,
      cimaPressionada,
      baixoPressionada,
      esquerdaPressionada,
      direitaPressionada,
      pausarPressionado,
      reiniciarPressionado,
    };
  }

  limpar(): void {
    this.teclasPressionadas.clear();
    this.touchEstados = {};
    this.estadosAnteriores = {
      acao: false,
      acao2: false,
      cima: false,
      baixo: false,
      esquerda: false,
      direita: false,
      pausa: false,
      reiniciar: false,
    };
  }
}
