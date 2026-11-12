/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Regras comuns de pinball: tilt, contagem de bolas, multiplicador de bônus,
 * bola extra, "atire de novo" e bônus de fim de bola.
 */

import {
  BOLAS_PADRAO,
  EMPURROES_PARA_TILT,
  JANELA_TILT,
  MULTIPLICADOR_MAXIMO,
  VALOR_ELEMENTO_BONUS,
} from './constantes';
import { EstadoMesa } from './tipos';

export interface OpcoesRegras {
  bolasPorPartida?: number;
  multiplicadorMaximo?: number;
}

export class RegrasComuns {
  readonly estado: EstadoMesa;
  private readonly multiplicadorMaximo: number;
  private empurroes: number[] = [];
  private tempoAtual = 0;

  constructor(opcoes: OpcoesRegras = {}) {
    this.multiplicadorMaximo = opcoes.multiplicadorMaximo ?? MULTIPLICADOR_MAXIMO;
    this.estado = {
      pontuacao: 0,
      recorde: 0,
      bolaAtual: 1,
      bolasRestantes: opcoes.bolasPorPartida ?? BOLAS_PADRAO,
      bolasPorPartida: opcoes.bolasPorPartida ?? BOLAS_PADRAO,
      multiplicador: 1,
      multiplicadorMaximo: this.multiplicadorMaximo,
      tilt: false,
      atireDeNovo: false,
      especial: false,
      bonus: 0,
      bonusAnimado: 0,
      bonusAlvo: 0,
      luzes: {},
      elementos: {},
      tempo: 0,
      fase: 'titulo',
    };
  }

  /** Reinicia a partida (mantém o recorde). */
  reiniciar(recorde: number): void {
    this.estado.pontuacao = 0;
    this.estado.recorde = recorde;
    this.estado.bolaAtual = 1;
    this.estado.bolasRestantes = this.estado.bolasPorPartida;
    this.estado.multiplicador = 1;
    this.estado.tilt = false;
    this.estado.atireDeNovo = false;
    this.estado.especial = false;
    this.estado.bonus = 0;
    this.estado.bonusAnimado = 0;
    this.estado.bonusAlvo = 0;
    this.estado.luzes = {};
    this.estado.fase = 'jogando';
    this.empurroes = [];
    this.tempoAtual = 0;
  }

  /** Avança o relógio interno das regras. */
  tick(dt: number): void {
    this.tempoAtual += dt;
    this.estado.tempo = this.tempoAtual;
  }

  /**
   * Registra um empurrão (nudge).
   * Devolve `true` quando o tilt é disparado.
   */
  registrarEmpurrão(): boolean {
    if (this.estado.tilt) return false;
    this.empurroes = this.empurroes.filter((momento) => this.tempoAtual - momento <= JANELA_TILT);
    this.empurroes.push(this.tempoAtual);
    if (this.empurroes.length >= EMPURROES_PARA_TILT) {
      this.estado.tilt = true;
      this.empurroes = [];
      return true;
    }
    return false;
  }

  /** Sobe um nível do multiplicador de bônus. */
  aumentarMultiplicador(): void {
    this.estado.multiplicador = Math.min(
      this.multiplicadorMaximo,
      this.estado.multiplicador + 1
    );
  }

  /** Conta quantos elementos da mesa estão acesos (para o bônus final). */
  contarElementosAcesos(): number {
    let total = 0;
    for (const estado of Object.values(this.estado.elementos)) {
      if (estado.tipo === 'alvoQueda' && estado.caido) total += 1;
      if (estado.tipo === 'alvoFixo' && estado.aceso) total += 1;
      if (estado.tipo === 'rollover' && estado.aceso) total += 1;
    }
    return total;
  }

  /** Calcula o bônus de fim de bola (elementos acesos x valor x multiplicador). */
  calcularBonus(): number {
    return this.contarElementosAcesos() * VALOR_ELEMENTO_BONUS * this.estado.multiplicador;
  }

  /** Define o alvo da animação de bônus. */
  prepararBonus(): void {
    this.estado.bonusAlvo = this.calcularBonus();
    this.estado.bonusAnimado = 0;
  }

  /**
   * Avança a animação de contagem do bônus.
   * Devolve os pontos que devem entrar no placar neste quadro.
   */
  animarBonus(dt: number): number {
    if (this.estado.bonusAlvo <= 0) return 0;
    const passo = Math.max(1, Math.ceil(this.estado.bonusAlvo * (dt / 2.2)));
    const restante = this.estado.bonusAlvo - this.estado.bonusAnimado;
    const parcela = Math.min(restante, passo);
    this.estado.bonusAnimado += parcela;
    return parcela;
  }

  /** Concede uma bola extra. */
  adicionarBola(): void {
    this.estado.bolasRestantes += 1;
  }

  /** Liga o "atire de novo" para a bola atual. */
  ativarAtireDeNovo(): void {
    this.estado.atireDeNovo = true;
    this.estado.luzes.atireDeNovo = true;
  }

  /** Acende/apaga uma lâmpada do painel. */
  acenderLuz(id: string, acesa: boolean): void {
    this.estado.luzes[id] = acesa;
  }

  /** Consulta uma lâmpada do painel. */
  luz(id: string): boolean {
    return this.estado.luzes[id] === true;
  }
}
