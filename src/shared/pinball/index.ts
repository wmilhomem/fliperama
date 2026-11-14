/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * BIBLIOTECA COMPARTILHADA DE PINBALL DA FLIPERAMA
 *
 * Exporta tudo o que uma mesa de pinball precisa:
 * - `criarJogoPinball`: transforma uma definição de mesa em um jogo do motor.
 * - Tipos de mesa, geometria e elementos.
 * - Blocos de física, flippers, regras comuns e placar de 7 segmentos.
 */

export * from './tipos';
export * from './constantes';
export * from './fisica';
export * from './flippers';
export * from './elementos';
export * from './regras';
export * from './placar';
export { criarJogoPinball, type OpcoesMesa } from './mesa';
