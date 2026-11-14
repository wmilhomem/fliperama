/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * HAPTICS — feedback tátil do Fliperama
 *
 * Usa `navigator.vibrate` quando disponível (Android/Chrome). Em navegadores
 * sem a API (Safari do iPhone), é um no-op silencioso. Respeita a chave
 * "Vibração" de Configurações (padrão: ligada).
 */

import { HapticEvento, HapticsService } from './types';
import { lerControles } from '../shared/controles';

const PADROES: Record<HapticEvento, number | number[]> = {
  tiro: 8,
  acerto: 15,
  explosao: 40,
  dano: 120,
  vida: [30, 40, 30],
  fim: [80, 60, 80],
};

export class RetroHapticsService implements HapticsService {
  tocar(evento: HapticEvento): void {
    if (!lerControles().vibracao) return;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(PADROES[evento]);
      }
    } catch {
      // Vibração é sempre opcional: nunca quebra o jogo.
    }
  }
}
