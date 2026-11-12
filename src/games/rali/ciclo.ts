/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DURACAO_DIA, META_DIA_1, META_DIA_OUTROS } from './constantes';
import { clamp } from './semente';

export function alvoDoDia(dia: number): number {
  return dia <= 1 ? META_DIA_1 : META_DIA_OUTROS;
}

export function fatorNoite(dia: number, tempoRestante: number): number {
  const tempoDecorrido = DURACAO_DIA - Math.max(0, tempoRestante);
  const hora = (0.4 + (dia - 1) * 0.13 + (tempoDecorrido / DURACAO_DIA) * 0.38) % 1;
  const escuridao = (Math.cos(hora * Math.PI * 2) + 1) / 2;
  return clamp(Math.pow(escuridao, 1.45) * 0.85, 0, 0.74);
}

export function formatarTempo(segundos: number): string {
  const total = Math.max(0, Math.ceil(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos.toString().padStart(2, '0')}:${resto.toString().padStart(2, '0')}`;
}
