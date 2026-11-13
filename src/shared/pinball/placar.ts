/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
import { LARGURA, ALTURA, ALTURA_PAINEL } from './tuning';

export interface Digito7Segmentos {
  a: boolean;
  b: boolean;
  c: boolean;
  d: boolean;
  e: boolean;
  f: boolean;
  g: boolean;
}

export const MAPA_DIGITOS: Record<number, Digito7Segmentos> = {
  0: { a: true, b: true, c: true, d: true, e: true, f: true, g: false },
  1: { a: false, b: true, c: true, d: false, e: false, f: false, g: false },
  2: { a: true, b: true, c: false, d: true, e: true, f: false, g: true },
  3: { a: true, b: true, c: true, d: true, e: false, f: false, g: true },
  4: { a: false, b: true, c: true, d: false, e: false, f: true, g: true },
  5: { a: true, b: false, c: true, d: true, e: false, f: true, g: true },
  6: { a: true, b: false, c: true, d: true, e: true, f: true, g: true },
  7: { a: true, b: true, c: true, d: false, e: false, f: false, g: false },
  8: { a: true, b: true, c: true, d: true, e: true, f: true, g: true },
  9: { a: true, b: true, c: true, d: true, e: false, f: true, g: true },
};

export function obterDigitos7Segmentos(numero: number): Digito7Segmentos {
  const digit = numero % 10;
  return MAPA_DIGITOS[digit] || MAPA_DIGITOS[0];
}

export function obterTodosDigitos(numero: number): Digito7Segmentos[] {
  const str = numero.toString().padStart(5, '0');
  return str.split('').map(char => obterDigitos7Segmentos(parseInt(char)));
}