/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SpriteUtils } from '../../engine/types';
import {
  ALTURA_PLATAFORMA,
  CORES,
  FILEIRAS_Y,
  LARGURA,
  LARGURA_PLATAFORMA,
  TARTARUGA_AVISO,
  TARTARUGA_CICLO,
  TARTARUGA_SUBINDO,
  TARTARUGA_SUBMERSA,
  TOLERANCIA_POUSO,
} from './constantes';
import { Plataforma } from './tipos';

let proximoId = 1;

const CENTROS_BASE = [64, 232, 400];

function criarTartaruga(): Pick<Plataforma, 'tipo' | 'estadoTartaruga' | 'tempoCiclo' | 'tremor' | 'submergiuAgora'> {
  return {
    tipo: 'tartaruga',
    estadoTartaruga: 'flutuando',
    tempoCiclo: 0,
    tremor: 0,
    submergiuAgora: false,
  };
}

export function criarFileiras(fase: number): Plataforma[] {
  const plataformas: Plataforma[] = [];
  const totalTartarugas = Math.min(3, Math.ceil(fase / 2));

  for (let fileira = 0; fileira < FILEIRAS_Y.length; fileira++) {
    const direcao: -1 | 1 = fileira % 2 === 0 ? 1 : -1;
    const velocidade = Math.min(86, 24 + fileira * 8 + (fase - 1) * 4.5);
    const indiceTartaruga = (fase + fileira) % 3;
    const temTartaruga = fileira < totalTartarugas;

    for (let i = 0; i < CENTROS_BASE.length; i++) {
      const x = CENTROS_BASE[i] + (fileira % 2) * 24;
      const tartaruga = temTartaruga && i === indiceTartaruga;
      const base: Plataforma = {
        id: proximoId++,
        fileira,
        x,
        y: FILEIRAS_Y[fileira],
        largura: LARGURA_PLATAFORMA,
        altura: ALTURA_PLATAFORMA,
        direcao,
        velocidade,
        tipo: tartaruga ? 'tartaruga' : 'lirio',
        florida: false,
        estadoTartaruga: 'flutuando',
        tempoCiclo: 0,
        tremor: 0,
        xAnterior: x,
        wrapou: false,
        submergiuAgora: false,
      };

      if (tartaruga) {
        Object.assign(base, criarTartaruga());
        base.tempoCiclo = (fase * 0.6 + fileira * 1.1 + i * 1.7) % TARTARUGA_CICLO;
      }

      plataformas.push(base);
    }
  }

  return plataformas;
}

export function atualizarPlataformas(plataformas: Plataforma[], dt: number): void {
  for (const p of plataformas) {
    p.xAnterior = p.x;
    p.wrapou = false;
    p.submergiuAgora = false;

    p.x += p.direcao * p.velocidade * dt;

    if (p.x > LARGURA + p.largura / 2) {
      p.x = -p.largura / 2;
      p.wrapou = true;
    } else if (p.x < -p.largura / 2) {
      p.x = LARGURA + p.largura / 2;
      p.wrapou = true;
    }

    if (p.tipo === 'tartaruga') {
      p.tempoCiclo += dt;
      p.tremor = 0;

      if (p.estadoTartaruga === 'flutuando' && p.tempoCiclo >= TARTARUGA_CICLO) {
        p.estadoTartaruga = 'aviso';
        p.tempoCiclo = 0;
      } else if (p.estadoTartaruga === 'aviso') {
        p.tremor = Math.sin(p.tempoCiclo * 48) * 2;
        if (p.tempoCiclo >= TARTARUGA_AVISO) {
          p.estadoTartaruga = 'submersa';
          p.tempoCiclo = 0;
          p.submergiuAgora = true;
        }
      } else if (p.estadoTartaruga === 'submersa' && p.tempoCiclo >= TARTARUGA_SUBMERSA) {
        p.estadoTartaruga = 'subindo';
        p.tempoCiclo = 0;
      } else if (p.estadoTartaruga === 'subindo' && p.tempoCiclo >= TARTARUGA_SUBINDO) {
        p.estadoTartaruga = 'flutuando';
        p.tempoCiclo = 0;
      }
    }
  }
}

export function plataformaPorId(
  plataformas: Plataforma[],
  id: number | null
): Plataforma | null {
  if (id === null) return null;
  return plataformas.find((p) => p.id === id) ?? null;
}

export function plataformaSob(
  plataformas: Plataforma[],
  fileira: number,
  x: number
): Plataforma | null {
  let escolhida: Plataforma | null = null;
  let menorDistancia = Number.POSITIVE_INFINITY;

  for (const p of plataformas) {
    if (p.fileira !== fileira) continue;
    if (p.tipo === 'tartaruga' && p.estadoTartaruga !== 'flutuando' && p.estadoTartaruga !== 'aviso') {
      continue;
    }

    const distancia = Math.abs(x - p.x);
    if (distancia <= p.largura / 2 + TOLERANCIA_POUSO && distancia < menorDistancia) {
      menorDistancia = distancia;
      escolhida = p;
    }
  }

  return escolhida;
}

export function resetarFlores(plataformas: Plataforma[]): void {
  for (const p of plataformas) {
    if (p.tipo === 'lirio') {
      p.florida = false;
    }
  }
}

function desenharFlor(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  tempo: number
): void {
  const balanco = Math.sin(tempo * 3.4 + x * 0.04) * 1;
  const fx = Math.floor(x + balanco);
  const fy = Math.floor(y);

  g.fillStyle = CORES.rosaEscuro;
  g.fillRect(fx - 4, fy + 4, 8, 2);
  g.fillStyle = CORES.rosa;
  g.fillRect(fx - 6, fy, 4, 4);
  g.fillRect(fx + 2, fy, 4, 4);
  g.fillRect(fx - 4, fy - 4, 4, 4);
  g.fillRect(fx, fy - 4, 4, 4);
  g.fillStyle = CORES.rosaClaro;
  g.fillRect(fx - 2, fy - 2, 4, 4);
  g.fillStyle = CORES.amarelo;
  g.fillRect(fx - 1, fy - 1, 2, 2);
}

function desenharLirio(
  g: CanvasRenderingContext2D,
  p: Plataforma,
  tempo: number
): void {
  const x = Math.floor(p.x);
  const y = Math.floor(p.y);

  g.fillStyle = 'rgba(4, 47, 46, 0.42)';
  g.fillRect(x - 24, y + 11, 48, 5);

  g.fillStyle = CORES.verdeEscuro;
  g.fillRect(x - 22, y + 4, 44, 9);
  g.fillRect(x - 18, y + 2, 36, 13);

  g.fillStyle = CORES.verde;
  g.fillRect(x - 20, y + 4, 40, 7);
  g.fillRect(x - 16, y + 2, 32, 10);

  g.fillStyle = CORES.verdeClaro;
  g.fillRect(x - 16, y + 3, 32, 3);
  g.fillRect(x - 10, y + 6, 20, 2);

  g.fillStyle = '#0B3B2E';
  g.fillRect(x + 10, y + 4, 10, 4);
  g.fillRect(x + 14, y + 8, 6, 4);

  g.fillStyle = CORES.verdeEscuro;
  for (let i = -16; i <= 16; i += 8) {
    g.fillRect(x + i, y + 7, 1, 4);
  }

  if (p.florida) {
    desenharFlor(g, x + 8, y - 2, tempo);
  }
}

function desenharTartaruga(
  g: CanvasRenderingContext2D,
  p: Plataforma,
  tempo: number
): void {
  const submersa = p.estadoTartaruga === 'submersa';
  const subindo = p.estadoTartaruga === 'subindo';
  const x = Math.floor(p.x + p.tremor);
  const y = Math.floor(p.y);

  g.save();
  g.globalAlpha = submersa ? 0.28 : subindo ? 0.55 : 1;

  g.fillStyle = 'rgba(4, 47, 46, 0.5)';
  g.fillRect(x - 24, y + 11, 48, 5);

  g.fillStyle = CORES.tartarugaVerde;
  g.fillRect(x - 22, y + 3, 44, 10);
  g.fillStyle = CORES.tartaruga;
  g.fillRect(x - 18, y, 36, 14);
  g.fillStyle = CORES.tartarugaClara;
  g.fillRect(x - 14, y + 2, 28, 4);
  g.fillRect(x - 10, y + 8, 20, 3);

  g.fillStyle = '#451A03';
  g.fillRect(x - 18, y + 6, 36, 2);
  g.fillRect(x - 6, y + 1, 2, 12);
  g.fillRect(x + 5, y + 1, 2, 12);

  g.fillStyle = '#365314';
  g.fillRect(x + 20, y + 5, 7, 6);
  g.fillStyle = '#1A2E05';
  g.fillRect(x + 23, y + 7, 2, 2);
  g.fillRect(x - 24, y + 8, 6, 4);
  g.fillRect(x - 26, y + 12, 4, 3);

  if (p.estadoTartaruga === 'aviso') {
    const pisca = Math.floor(tempo * 10) % 2 === 0;
    g.globalAlpha = 1;
    g.fillStyle = pisca ? CORES.amarelo : CORES.vermelho;
    g.fillRect(x - 2, y - 12, 4, 6);
    g.fillRect(x - 2, y - 4, 4, 2);
    g.fillStyle = 'rgba(125, 211, 252, 0.9)';
    g.fillRect(x - 20 + Math.sin(tempo * 5) * 4, y + 12, 4, 3);
    g.fillRect(x + 12 + Math.cos(tempo * 6) * 4, y + 13, 3, 3);
  }

  if (submersa) {
    g.globalAlpha = 0.9;
    g.strokeStyle = 'rgba(125, 211, 252, 0.75)';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(x, y + 10, 18 + Math.sin(tempo * 4) * 2, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = 'rgba(167, 243, 208, 0.75)';
    g.fillRect(x - 14 + Math.sin(tempo * 3) * 5, y + 8, 3, 3);
    g.fillRect(x + 10 + Math.cos(tempo * 4) * 5, y + 4, 3, 3);
  }

  g.restore();
}

export function desenharPlataformas(
  g: CanvasRenderingContext2D,
  _sprites: SpriteUtils,
  plataformas: Plataforma[],
  tempo: number
): void {
  for (const p of plataformas) {
    if (p.tipo === 'tartaruga') {
      desenharTartaruga(g, p, tempo);
    } else {
      desenharLirio(g, p, tempo);
    }
  }
}
