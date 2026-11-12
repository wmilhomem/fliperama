/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Elementos de pinball: bumpers, slingshots, alvos, pistas, spinner,
 * canais (inlane/outlane), lançador e dreno.
 *
 * Cada elemento é descrito por dados e tem um estado de runtime. O desenho
 * padrão é genérico; a mesa pode sobrescrever com arte própria.
 */

import { Bola } from './fisica';
import { Ponto } from './tipos';
import {
  AlvoFixo,
  AlvoQueda,
  BumperPop,
  Dreno,
  ElementoMesa,
  EstadoAlvoFixo,
  EstadoAlvoQueda,
  EstadoBumper,
  EstadoCanal,
  EstadoElemento,
  EstadoRollover,
  EstadoSimples,
  EstadoSlingshot,
  EstadoSpinner,
  Inlane,
  Outlane,
  Plunger,
  Rollover,
  Slingshot,
  Spinner,
} from './tipos';

/** Cria o estado de runtime de todos os elementos da mesa. */
export function criarEstadosElementos(elementos: ElementoMesa[]): Record<string, EstadoElemento> {
  const estados: Record<string, EstadoElemento> = {};
  for (const elemento of elementos) {
    switch (elemento.tipo) {
      case 'bumper':
        estados[elemento.id] = { tipo: 'bumper', animacao: 0, brilho: 0 } satisfies EstadoBumper;
        break;
      case 'slingshot':
        estados[elemento.id] = { tipo: 'slingshot', animacao: 0 } satisfies EstadoSlingshot;
        break;
      case 'alvoFixo':
        estados[elemento.id] = { tipo: 'alvoFixo', aceso: false, animacao: 0 } satisfies EstadoAlvoFixo;
        break;
      case 'alvoQueda':
        estados[elemento.id] = {
          tipo: 'alvoQueda',
          caido: false,
          animacao: 0,
          resetEm: 0,
        } satisfies EstadoAlvoQueda;
        break;
      case 'rollover':
        estados[elemento.id] = { tipo: 'rollover', aceso: false, animacao: 0 } satisfies EstadoRollover;
        break;
      case 'spinner':
        estados[elemento.id] = {
          tipo: 'spinner',
          angulo: 0,
          velocidade: 0,
          voltas: 0,
          animacao: 0,
          dentro: false,
        } satisfies EstadoSpinner;
        break;
      case 'inlane':
      case 'outlane':
        estados[elemento.id] = { tipo: elemento.tipo, aceso: false, animacao: 0 } satisfies EstadoCanal;
        break;
      default:
        estados[elemento.id] = { tipo: 'plunger', animacao: 0 } satisfies EstadoSimples;
        break;
    }
  }
  return estados;
}

/** Reseta alvos de queda, luzes e marcações no início de cada bola. */
export function resetarElementos(
  estados: Record<string, EstadoElemento>,
  elementos: ElementoMesa[],
  opcoes: { manterAcertos?: boolean } = {}
): void {
  for (const elemento of elementos) {
    const estado = estados[elemento.id];
    if (!estado) continue;
    switch (elemento.tipo) {
      case 'alvoQueda':
        if (estado.tipo !== 'alvoQueda') break;
        estado.caido = false;
        estado.resetEm = 0;
        estado.animacao = 0;
        break;
      case 'alvoFixo':
        if (estado.tipo !== 'alvoFixo') break;
        if (!opcoes.manterAcertos) {
          estado.aceso = false;
          estado.animacao = 0;
        }
        break;
      case 'rollover':
        if (estado.tipo !== 'rollover') break;
        estado.aceso = false;
        estado.animacao = 0;
        break;
      case 'inlane':
      case 'outlane':
        if (estado.tipo !== 'inlane' && estado.tipo !== 'outlane') break;
        estado.aceso = false;
        estado.animacao = 0;
        break;
      case 'spinner':
        if (estado.tipo !== 'spinner') break;
        estado.velocidade = 0;
        estado.animacao = 0;
        break;
      default:
        break;
    }
  }
}

/** Anima os elementos e controla o reset dos bancos de alvos de queda. */
export function atualizarElementos(
  estados: Record<string, EstadoElemento>,
  elementos: ElementoMesa[],
  dt: number
): void {
  for (const elemento of elementos) {
    const estado = estados[elemento.id];
    if (!estado) continue;

    switch (estado.tipo) {
      case 'bumper':
        estado.animacao = Math.max(0, estado.animacao - dt * 4);
        estado.brilho = Math.max(0, estado.brilho - dt * 2.5);
        break;
      case 'slingshot':
        estado.animacao = Math.max(0, estado.animacao - dt * 5);
        break;
      case 'alvoFixo':
      case 'rollover':
      case 'inlane':
      case 'outlane':
        estado.animacao = Math.max(0, estado.animacao - dt * 4);
        break;
      case 'alvoQueda':
        estado.animacao = Math.max(0, estado.animacao - dt * 4);
        if (estado.resetEm > 0) {
          estado.resetEm -= dt;
          if (estado.resetEm <= 0) {
            estado.caido = false;
            estado.resetEm = 0;
          }
        }
        break;
      case 'spinner': {
        estado.angulo += estado.velocidade * dt;
        estado.velocidade *= Math.pow(0.02, dt);
        if (Math.abs(estado.velocidade) < 0.2) estado.velocidade = 0;
        estado.animacao = Math.max(0, estado.animacao - dt * 2);
        break;
      }
      default:
        estado.animacao = Math.max(0, estado.animacao - dt * 4);
        break;
    }
  }
}

/** Bumper de pop: empurra a bola radialmente. */
export function colidirBumper(
  bola: Bola,
  elemento: BumperPop,
  estado: EstadoBumper
): boolean {
  const dx = bola.x - elemento.x;
  const dy = bola.y - elemento.y;
  const distancia = Math.hypot(dx, dy);
  const raioTotal = bola.raio + elemento.raio;
  if (distancia > raioTotal) return false;

  let nx: number;
  let ny: number;
  if (distancia < 1e-6) {
    nx = 0;
    ny = -1;
  } else {
    nx = dx / distancia;
    ny = dy / distancia;
  }

  const penetracao = raioTotal - distancia;
  bola.x += nx * penetracao;
  bola.y += ny * penetracao;

  // Componente tangencial preservada, radial substituída pelo impulso.
  const tangencialX = bola.vx - (bola.vx * nx + bola.vy * ny) * nx;
  const tangencialY = bola.vy - (bola.vx * nx + bola.vy * ny) * ny;
  bola.vx = tangencialX * 0.35 + nx * elemento.forca;
  bola.vy = tangencialY * 0.35 + ny * elemento.forca;

  estado.animacao = 1;
  estado.brilho = 1;
  return true;
}

/** Slingshot: triângulo de borracha com chute lateral. */
export function colidirSlingshot(
  bola: Bola,
  elemento: Slingshot,
  estado: EstadoSlingshot
): boolean {
  const [a, b, c] = elemento.vertices;
  if (!pontoDentroDoTriangulo(bola, a, b, c)) return false;

  // Face mais próxima para empurrar a bola para fora
  const faces: Array<[typeof a, typeof b]> = [
    [a, b],
    [b, c],
    [c, a],
  ];
  let melhor: { nx: number; ny: number; distancia: number } | null = null;

  for (const [p1, p2] of faces) {
    const ex = p2.x - p1.x;
    const ey = p2.y - p1.y;
    const len2 = ex * ex + ey * ey;
    if (len2 < 1e-9) continue;
    let t = ((bola.x - p1.x) * ex + (bola.y - p1.y) * ey) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = p1.x + ex * t;
    const py = p1.y + ey * t;
    const dx = bola.x - px;
    const dy = bola.y - py;
    const distancia = Math.hypot(dx, dy);
    if (!melhor || distancia < melhor.distancia) {
      const nx = distancia < 1e-6 ? ey : dx / distancia;
      const ny = distancia < 1e-6 ? -ex : dy / distancia;
      melhor = { nx, ny, distancia };
    }
  }

  if (!melhor) return false;

  bola.x += melhor.nx * (bola.raio + 2);
  bola.y += melhor.ny * (bola.raio + 2);

  const vn = bola.vx * melhor.nx + bola.vy * melhor.ny;
  if (vn < 0) {
    bola.vx -= 1.35 * vn * melhor.nx;
    bola.vy -= 1.35 * vn * melhor.ny;
  }
  bola.vx += melhor.nx * elemento.forca;
  bola.vy += melhor.ny * elemento.forca;

  estado.animacao = 1;
  return true;
}

/** Alvo fixo ou de queda: bloqueia a bola e acende/derruba. */
export function colidirAlvo(
  bola: Bola,
  elemento: AlvoFixo | AlvoQueda,
  estado: EstadoAlvoFixo | EstadoAlvoQueda
): boolean {
  if (estado.tipo === 'alvoQueda' && estado.caido) return false;

  const meiaLargura = elemento.largura / 2;
  const meiaAltura = elemento.altura / 2;
  const dx = bola.x - elemento.x;
  const dy = bola.y - elemento.y;

  if (Math.abs(dx) > meiaLargura + bola.raio) return false;
  if (Math.abs(dy) > meiaAltura + bola.raio) return false;

  // Normal pelo eixo de menor penetração
  const sobreX = meiaLargura + bola.raio - Math.abs(dx);
  const sobreY = meiaAltura + bola.raio - Math.abs(dy);

  let nx: number;
  let ny: number;
  if (sobreX < sobreY) {
    nx = Math.sign(dx) || 1;
    ny = 0;
    bola.x += nx * sobreX;
  } else {
    nx = 0;
    ny = Math.sign(dy) || 1;
    bola.y += ny * sobreY;
  }

  const vn = bola.vx * nx + bola.vy * ny;
  if (vn < 0) {
    bola.vx -= 1.2 * vn * nx;
    bola.vy -= 1.2 * vn * ny;
  }

  estado.animacao = 1;
  if (estado.tipo === 'alvoFixo') estado.aceso = true;
  return true;
}

/** Sensor de pista de rolagem. */
export function detectarRollover(
  bola: Bola,
  elemento: Rollover,
  estado: EstadoRollover
): boolean {
  if (estado.aceso) return false;
  const sobre = bolaSobreRetangulo(
    bola,
    elemento.x - elemento.largura / 2,
    elemento.y - elemento.altura / 2,
    elemento.largura,
    elemento.altura
  );
  if (!sobre) return false;
  estado.aceso = true;
  estado.animacao = 1;
  return true;
}

/** Spinner: a bola atravessa a placa e a placa gira. */
export function detectarSpinner(
  bola: Bola,
  elemento: Spinner,
  estado: EstadoSpinner
): boolean {
  const sobre = bolaSobreRetangulo(
    bola,
    elemento.x - elemento.largura / 2,
    elemento.y - elemento.altura / 2,
    elemento.largura,
    elemento.altura
  );

  if (!sobre) {
    estado.dentro = false;
    return false;
  }
  if (estado.dentro) return false;

  estado.dentro = true;
  const empurrao = Math.abs(bola.vx) + Math.abs(bola.vy);
  const sentido = bola.vx >= 0 ? 1 : -1;
  estado.velocidade = sentido * (Math.abs(estado.velocidade) + empurrao * 2.4);
  estado.animacao = 1;
  return true;
}

/** Conta voltas do spinner (cada volta = 1 giro pontuado). */
export function contarVoltasSpinner(estado: EstadoSpinner): number {
  if (estado.tipo !== 'spinner') return 0;
  const voltas = Math.floor(Math.abs(estado.angulo) / (Math.PI * 0.5));
  if (voltas <= estado.voltas) return 0;
  const novas = voltas - estado.voltas;
  estado.voltas = voltas;
  return novas;
}

/** Inlane: devolve a bola para o flipper do lado. */
export function detectarInlane(
  bola: Bola,
  elemento: Inlane,
  estado: EstadoCanal
): boolean {
  const sobre = bolaSobreRetangulo(
    bola,
    elemento.x - elemento.largura / 2,
    elemento.y - elemento.altura / 2,
    elemento.largura,
    elemento.altura
  );
  if (!sobre) return false;
  estado.aceso = true;
  estado.animacao = 1;
  return true;
}

/** Outlane: avisa que a bola está indo para o dreno. */
export function detectarOutlane(
  bola: Bola,
  elemento: Outlane,
  estado: EstadoCanal
): boolean {
  const sobre = bolaSobreRetangulo(
    bola,
    elemento.x - elemento.largura / 2,
    elemento.y - elemento.altura / 2,
    elemento.largura,
    elemento.altura
  );
  if (!sobre) return false;
  estado.aceso = true;
  estado.animacao = 1;
  return true;
}

/** Dreno: a bola chegou ao fim. */
export function detectarDreno(bola: Bola, elemento: Dreno): boolean {
  return bolaSobreRetangulo(bola, elemento.x, elemento.y, elemento.largura, elemento.altura);
}

/** Posição de repouso da bola na canaleta do lançador. */
export function posicaoNaMola(elemento: Plunger): { x: number; y: number } {
  return { x: elemento.x, y: elemento.y };
}

function bolaSobreRetangulo(
  bola: Bola,
  x: number,
  y: number,
  largura: number,
  altura: number
): boolean {
  return (
    bola.x + bola.raio > x &&
    bola.x - bola.raio < x + largura &&
    bola.y + bola.raio > y &&
    bola.y - bola.raio < y + altura
  );
}

function pontoDentroDoTriangulo(p: Ponto, a: Ponto, b: Ponto, c: Ponto): boolean {
  const sinal = (p1: typeof a, p2: typeof b, p3: typeof c) =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const d1 = sinal(p, a, b);
  const d2 = sinal(p, b, c);
  const d3 = sinal(p, c, a);
  const temNegativo = d1 < 0 || d2 < 0 || d3 < 0;
  const temPositivo = d1 > 0 || d2 > 0 || d3 > 0;
  return !(temNegativo && temPositivo);
}

/* ------------------------------------------------------------------ */
/* DESENHO PADRÃO                                                     */
/* ------------------------------------------------------------------ */

/** Desenha um elemento usando a arte genérica da biblioteca. */
export function desenharElementoPadrao(
  g: CanvasRenderingContext2D,
  elemento: ElementoMesa,
  estado: EstadoElemento
): void {
  switch (elemento.tipo) {
    case 'bumper': {
      const brilho = Math.max(0, Math.min(1, estado.tipo === 'bumper' ? estado.brilho : 0));
      const escala = 1 + brilho * 0.16;
      g.save();
      g.translate(elemento.x, elemento.y);
      g.scale(escala, escala);
      g.fillStyle = '#1F1147';
      g.beginPath();
      g.arc(0, 0, elemento.raio + 3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = brilho > 0 ? '#FFD166' : '#EC4899';
      g.beginPath();
      g.arc(0, 0, elemento.raio, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.beginPath();
      g.arc(-elemento.raio * 0.3, -elemento.raio * 0.35, elemento.raio * 0.32, 0, Math.PI * 2);
      g.fill();
      g.restore();
      break;
    }
    case 'slingshot': {
      g.save();
      g.fillStyle = estado.tipo === 'slingshot' && estado.animacao > 0 ? '#FFFFFF' : '#F472B6';
      g.strokeStyle = '#2A1145';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(elemento.vertices[0].x, elemento.vertices[0].y);
      g.lineTo(elemento.vertices[1].x, elemento.vertices[1].y);
      g.lineTo(elemento.vertices[2].x, elemento.vertices[2].y);
      g.closePath();
      g.fill();
      g.stroke();
      g.restore();
      break;
    }
    case 'alvoFixo': {
      const aceso = estado.tipo === 'alvoFixo' && estado.aceso;
      g.save();
      g.fillStyle = aceso ? '#FFD166' : '#2EC4B6';
      g.strokeStyle = '#2A1145';
      g.lineWidth = 2;
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.strokeRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.restore();
      break;
    }
    case 'alvoQueda': {
      const caido = estado.tipo === 'alvoQueda' && estado.caido;
      g.save();
      g.fillStyle = caido ? '#1B1033' : '#F59E0B';
      g.strokeStyle = '#2A1145';
      g.lineWidth = 2;
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.strokeRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.restore();
      break;
    }
    case 'rollover': {
      const aceso = estado.tipo === 'rollover' && estado.aceso;
      g.save();
      g.fillStyle = aceso ? '#FFD166' : '#3A2358';
      g.strokeStyle = '#2A1145';
      g.lineWidth = 2;
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.strokeRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.restore();
      break;
    }
    case 'spinner': {
      g.save();
      g.translate(elemento.x, elemento.y);
      g.rotate(estado.tipo === 'spinner' ? estado.angulo : 0);
      g.fillStyle = '#2EC4B6';
      g.strokeStyle = '#2A1145';
      g.lineWidth = 2;
      g.fillRect(-elemento.largura / 2, -2, elemento.largura, 4);
      g.strokeRect(-elemento.largura / 2, -2, elemento.largura, 4);
      g.restore();
      break;
    }
    case 'inlane':
    case 'outlane': {
      const aceso = estado.tipo === 'inlane' || estado.tipo === 'outlane' ? estado.aceso : false;
      g.save();
      g.fillStyle = aceso ? '#FFD166' : 'rgba(46,196,182,0.35)';
      g.fillRect(
        elemento.x - elemento.largura / 2,
        elemento.y - elemento.altura / 2,
        elemento.largura,
        elemento.altura
      );
      g.restore();
      break;
    }
    default:
      break;
  }
}
