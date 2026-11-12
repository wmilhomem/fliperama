/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioService } from '../../engine/types';
import { MedidorCheia } from './tipos';

export function tempoInicialFase(fase: number): number {
  return Math.max(25, 45 - (fase - 1) * 5);
}

export function criarMedidor(fase: number): MedidorCheia {
  const inicial = tempoInicialFase(fase);
  return {
    inicial,
    restante: inicial,
    timerAlerta: 0,
  };
}

export function reiniciarMedidor(medidor: MedidorCheia, fase: number): void {
  medidor.inicial = tempoInicialFase(fase);
  medidor.restante = medidor.inicial;
  medidor.timerAlerta = 0;
}

export function atualizarMedidor(
  medidor: MedidorCheia,
  dt: number,
  audio: AudioService
): boolean {
  if (medidor.restante <= 0) {
    return true;
  }

  medidor.restante -= dt;

  if (medidor.restante > 0 && medidor.restante < 10) {
    medidor.timerAlerta += dt;
    if (medidor.timerAlerta >= 1) {
      medidor.timerAlerta = 0;
      audio.tocar('alerta');
    }
  } else {
    medidor.timerAlerta = 0;
  }

  return medidor.restante <= 0;
}
