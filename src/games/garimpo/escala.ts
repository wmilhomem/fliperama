/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Fator de escala aplicado a sprites, velocidades e distâncias para a
 * resolução ampliada de 480x560 (mesmo padrão de Salve a Hannah).
 */
export const ESCALA = 1.5;

/** Faixa superior reservada ao HUD do motor. */
export const MARGEM_TOPO = 66;

/** Margem lateral usada no nascimento de rochas, piratas e saltos. */
export const MARGEM_LATERAL = 30;

export function escalar(valor: number): number {
  return valor * ESCALA;
}
