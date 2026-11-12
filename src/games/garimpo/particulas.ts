/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESCALA, escalar } from './escala';
import { Nave, Particula } from './tipos';
import { aleatorio, TAU } from './vetor';

export function criarExplosao(
  particulas: Particula[],
  x: number,
  y: number,
  cor: string,
  quantidade: number,
  forca = 115
): void {
  for (let i = 0; i < quantidade; i++) {
    const angulo = aleatorio(0, TAU);
    const velocidade = aleatorio(forca * 0.2, forca) * ESCALA;
    const vida = aleatorio(0.28, 0.7);

    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      vida,
      maxVida: vida,
      cor,
      comprimento: aleatorio(escalar(3), escalar(9)),
    });
  }
}

export function criarFaiscaPropulsor(particulas: Particula[], nave: Nave): void {
  const angulo = nave.angulo + Math.PI + aleatorio(-0.35, 0.35);
  const velocidade = aleatorio(escalar(55), escalar(110));
  const distancia = escalar(8);
  const vida = aleatorio(0.12, 0.26);

  particulas.push({
    x: nave.x + Math.cos(nave.angulo + Math.PI) * distancia,
    y: nave.y + Math.sin(nave.angulo + Math.PI) * distancia,
    vx: Math.cos(angulo) * velocidade + nave.vx * 0.4,
    vy: Math.sin(angulo) * velocidade + nave.vy * 0.4,
    vida,
    maxVida: vida,
    cor: Math.random() < 0.4 ? '#FEF08A' : '#FB923C',
    comprimento: aleatorio(escalar(2), escalar(6)),
  });
}

export function atualizarParticulas(particulas: Particula[], dt: number): Particula[] {
  for (const particula of particulas) {
    particula.vida -= dt;
    particula.x += particula.vx * dt;
    particula.y += particula.vy * dt;

    const fator = Math.exp(-2.6 * dt);
    particula.vx *= fator;
    particula.vy *= fator;
  }

  return particulas.filter((particula) => particula.vida > 0);
}
