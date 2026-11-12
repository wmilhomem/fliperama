/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agenda, EventoSpawn } from './tipos';

export function criarAgenda(): Agenda {
  return {
    timerInimigo: 1.45,
    timerObstaculo: 2.1,
    timerTanque: 4.2,
  };
}

export function atualizarAgenda(agenda: Agenda, dt: number, secao: number): EventoSpawn[] {
  const eventos: EventoSpawn[] = [];

  agenda.timerInimigo -= dt;
  agenda.timerObstaculo -= dt;
  agenda.timerTanque -= dt;

  if (agenda.timerInimigo <= 0) {
    eventos.push('inimigo');
    const base = Math.max(0.62, 1.85 - secao * 0.1);
    agenda.timerInimigo = base * (0.72 + Math.random() * 0.58);
  }

  if (agenda.timerObstaculo <= 0) {
    eventos.push('obstaculo');
    const base = Math.max(1.15, 2.35 - secao * 0.1);
    agenda.timerObstaculo = base * (0.7 + Math.random() * 0.65);
  }

  if (agenda.timerTanque <= 0) {
    eventos.push('tanque');
    agenda.timerTanque = 8.5 + Math.random() * 4.5;
  }

  return eventos;
}
