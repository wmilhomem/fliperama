/**
 * @license
 * SPDX-license-identifier: Apache-2.0
 */
import { Bola } from './tipos';

export interface Flipper {
  x: number;
  y: number;
  largura: number;
  altura: number;
  angulo: number;
  velocidade: number;
  ativo: boolean;
}

/** Cria um flipper novo. */
export function criarFlipper(x: number, y: number, largura: number, altura: number): Flipper {
  return {
    x,
    y,
    largura,
    altura,
    angulo: 0,
    velocidade: 0,
    ativo: false,
  };
}

/** Ativa o flipper (define ângulo ativo). */
export function ativarFlipper(flipper: Flipper) {
  flipper.ativo = true;
  flipper.velocidade = FORCA_FLIPPER;
}

/** Atualiza o flipper a cada frame. */
export function atualizarFlipper(flipper: Flipper, dt: number) {
  if (flipper.ativo) {
    flipper.angulo += flipper.velocidade * dt;
    if (flipper.angulo >= ANGULO_ATIVO) {
      flipper.angulo = ANGULO_ATIVO;
      flipper.ativo = false;
    }
  } else {
    flipper.angulo -= flipper.velocidade * dt * 0.5;
    if (flipper.angulo <= 0) {
      flipper.angulo = 0;
    }
  }
}

/** Verifica se a bola colide com o flipper. */
export function colidirFlipper(bola: Bola, flipper: Flipper): boolean {
  const centroFlipperX = flipper.x + flipper.largura / 2;
  const centroFlipperY = flipper.y - flipper.altura / 2;

  const dx = bola.x - centroFlipperX;
  const dy = bola.y - centroFlipperY;

  const distancia = Math.hypot(dx, dy);
  const raioTotal = bola.raio + flipper.raio;

  return distancia <= raioTotal;
}