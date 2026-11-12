/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioPreset } from '../../engine/types';
import { Rocha, TamanhoRocha } from './tipos';
import { aleatorio, aplicarWrap, TAU } from './vetor';

interface ConfigRocha {
  raio: number;
  pontos: number;
  fragmentos: TamanhoRocha[];
  chanceCristal: number;
  cor: string;
  som: AudioPreset;
  particulas: number;
}

export const CONFIG_ROCHAS: Record<TamanhoRocha, ConfigRocha> = {
  grande: {
    raio: 17,
    pontos: 20,
    fragmentos: ['media', 'media'],
    chanceCristal: 0.25,
    cor: '#94A3B8',
    som: 'rochaGrande',
    particulas: 16,
  },
  media: {
    raio: 10.5,
    pontos: 50,
    fragmentos: ['pequena', 'pequena'],
    chanceCristal: 0.5,
    cor: '#67E8F9',
    som: 'rochaMedia',
    particulas: 11,
  },
  pequena: {
    raio: 6.5,
    pontos: 100,
    fragmentos: [],
    chanceCristal: 0.8,
    cor: '#A7F3D0',
    som: 'rochaPequena',
    particulas: 7,
  },
};

let proximoId = 1;

function criarForma(): number[] {
  const total = 7 + Math.floor(Math.random() * 4);
  const forma: number[] = [];

  for (let i = 0; i < total; i++) {
    forma.push(aleatorio(0.72, 1.18));
  }

  return forma;
}

export function criarRocha(
  tamanho: TamanhoRocha,
  x: number,
  y: number,
  vx = aleatorio(-26, 26),
  vy = aleatorio(-26, 26)
): Rocha {
  return {
    id: proximoId++,
    x,
    y,
    vx,
    vy,
    raio: CONFIG_ROCHAS[tamanho].raio,
    tamanho,
    rotacao: aleatorio(0, TAU),
    velRotacao: aleatorio(-0.9, 0.9),
    forma: criarForma(),
  };
}

/**
 * Cria as rochas iniciais da fase longe do centro (local de nascimento da nave)
 * e com espaçamento mínimo entre si.
 */
export function criarRochasFase(
  quantidade: number,
  largura: number,
  altura: number
): Rocha[] {
  const rochas: Rocha[] = [];
  const centroX = largura / 2;
  const centroY = altura / 2;

  for (let i = 0; i < quantidade; i++) {
    let melhorX = centroX;
    let melhorY = centroY;
    let melhorDistancia = -1;

    for (let tentativa = 0; tentativa < 30; tentativa++) {
      const x = aleatorio(24, largura - 24);
      const y = aleatorio(30, altura - 24);
      const distCentro = Math.hypot(x - centroX, y - centroY);

      const longeDasOutras = rochas.every(
        (r) => Math.hypot(x - r.x, y - r.y) > r.raio + CONFIG_ROCHAS.grande.raio + 8
      );

      const distanciaValida = distCentro > 58 && longeDasOutras;

      if (distanciaValida) {
        melhorX = x;
        melhorY = y;
        melhorDistancia = distCentro;
        break;
      }

      if (distCentro > melhorDistancia) {
        melhorX = x;
        melhorY = y;
        melhorDistancia = distCentro;
      }
    }

    rochas.push(criarRocha('grande', melhorX, melhorY));
  }

  return rochas;
}

/**
 * Divide uma rocha em fragmentos com direções e velocidades próprias.
 */
export function dividirRocha(rocha: Rocha): Rocha[] {
  const fragmentos = CONFIG_ROCHAS[rocha.tamanho].fragmentos;
  if (fragmentos.length === 0) return [];

  return fragmentos.map((tamanho) => {
    const angulo = aleatorio(0, TAU);
    const impulso = aleatorio(26, 58);
    const deslocamento = rocha.raio * 0.55;

    return criarRocha(
      tamanho,
      rocha.x + Math.cos(angulo) * deslocamento,
      rocha.y + Math.sin(angulo) * deslocamento,
      rocha.vx * 0.35 + Math.cos(angulo) * impulso,
      rocha.vy * 0.35 + Math.sin(angulo) * impulso
    );
  });
}

export function atualizarRochas(
  rochas: Rocha[],
  dt: number,
  largura: number,
  altura: number
): void {
  for (const rocha of rochas) {
    rocha.x += rocha.vx * dt;
    rocha.y += rocha.vy * dt;
    rocha.rotacao += rocha.velRotacao * dt;

    const posicao = aplicarWrap(rocha.x, rocha.y, rocha.raio, largura, altura);
    rocha.x = posicao.x;
    rocha.y = posicao.y;
  }
}
