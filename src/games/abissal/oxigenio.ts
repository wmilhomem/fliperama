/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sistema de oxigênio do "Submarino Abissal".
 *
 * O oxigênio cai continuamente (mais rápido nas fases seguintes), pisca em
 * vermelho abaixo de 25% e é recarregado na superfície.
 */

import { LIMITE_ALARME, OXIGENIO_MAXIMO } from './constantes';

export interface Oxigenio {
  valor: number;
  /** Tempo desde o último bipe do alarme. */
  tempoAlarme: number;
  /** Verdadeiro quando está abaixo do limite de alarme. */
  emAlarme: boolean;
}

export function criarOxigenio(): Oxigenio {
  return { valor: OXIGENIO_MAXIMO, tempoAlarme: 0, emAlarme: false };
}

/**
 * Atualiza o oxigênio.
 * Devolve `true` quando o alarme acabou de disparar (para tocar o som).
 */
export function atualizarOxigenio(
  oxigenio: Oxigenio,
  consumoPorSegundo: number,
  dt: number
): boolean {
  oxigenio.valor = Math.max(0, oxigenio.valor - consumoPorSegundo * dt);
  oxigenio.emAlarme = oxigenio.valor <= LIMITE_ALARME && oxigenio.valor > 0;

  if (!oxigenio.emAlarme) {
    oxigenio.tempoAlarme = 0;
    return false;
  }

  oxigenio.tempoAlarme -= dt;
  if (oxigenio.tempoAlarme <= 0) {
    oxigenio.tempoAlarme = 1.2;
    return true;
  }
  return false;
}

/** Recarrega parcialmente (entrega de um mergulhador). */
export function recarregarParcial(oxigenio: Oxigenio, quantidade: number): void {
  oxigenio.valor = Math.min(OXIGENIO_MAXIMO, oxigenio.valor + quantidade);
}

/** Recarrega totalmente (fase concluída ou ressurreição). */
export function recarregarTotal(oxigenio: Oxigenio): void {
  oxigenio.valor = OXIGENIO_MAXIMO;
}

/** Verdadeiro quando o oxigênio acabou. */
export function semOxigenio(oxigenio: Oxigenio): boolean {
  return oxigenio.valor <= 0;
}
