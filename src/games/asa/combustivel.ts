/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Combustível e avião-tanque. */

import {
  COMBUSTIVEL_GASTO_ACELERANDO,
  COMBUSTIVEL_GASTO_BASE,
  COMBUSTIVEL_GASTO_DESACELERADO,
  COMBUSTIVEL_INICIAL,
  COMBUSTIVEL_MAX,
  MISSEIS_REPOSTOS_POR_TANK,
  TANKER_REAPARICAO_SEG,
  TANKER_TEMPO_CONEXAO,
  TANKER_VEL_Y,
  TANKER_X,
  TANKER_ZONA_ALTURA,
  TANKER_ZONA_LARGURA,
} from './config';
import { Tanque } from './tipos';

/** Estado compartilhado do sistema de combustível. */
export interface EstadoCombustivel {
  combustivel: number;
  misseis: number;
  recargaT: number; // tempo acumulado na zona de conexão
  recarregando: boolean;
}

export function criarEstadoCombustivel(missao = 1, ciclo = 1, misseisIniciais = 10): EstadoCombustivel {
  void missao;
  void ciclo;
  return {
    combustivel: COMBUSTIVEL_INICIAL,
    misseis: misseisIniciais,
    recargaT: 0,
    recarregando: false,
  };
}

export function criarTanque(proximaEm: number, maxAparicoes = 1): Tanque {
  return {
    x: TANKER_X,
    y: 0,
    vx: 0,
    vy: TANKER_VEL_Y,
    ativo: false,
    proximaEm,
    aviso: false,
    recarregando: -1,
    aparicoesRestantes: maxAparicoes,
  };
}

/** Consome combustível; retorna true se zerar (o helicóptero cai). */
export function atualizarCombustivel(
  estado: EstadoCombustivel,
  dt: number,
  input: { cima: boolean; baixo: boolean }
): boolean {
  const consumo = input.cima
    ? COMBUSTIVEL_GASTO_ACELERANDO
    : input.baixo
      ? COMBUSTIVEL_GASTO_DESACELERADO
      : COMBUSTIVEL_GASTO_BASE;
  estado.combustivel = Math.max(0, estado.combustivel - consumo * dt);
  return estado.combustivel <= 0;
}

/**
 * Máquina de estados do avião-tanque.
 * Retorna 'recarregou' quando completa a recarga (para marcar 100 pts).
 */
export function atualizarTanque(
  tanque: Tanque,
  estado: EstadoCombustivel,
  jogador: { x: number; y: number; largura: number; altura: number },
  dt: number,
  tocarAviso: () => void,
  tocarRecarga: () => void
): 'recarregou' | null {
  if (!tanque.ativo) {
    if (tanque.aparicoesRestantes <= 0) return null; // sem mais aparições

    tanque.proximaEm -= dt;
    if (tanque.proximaEm <= 2 && !tanque.aviso) {
      tanque.aviso = true;
      tocarAviso();
    }
    if (tanque.proximaEm <= 0) {
      tanque.ativo = true;
      tanque.y = 560 + 60; // entra pela base e sobe
      tanque.aviso = false;
      tanque.aparicoesRestantes -= 1;
      tanque.proximaEm = 999;
    }
    return null;
  }

  tanque.y += tanque.vy * dt;

  // Saiu pela parte de cima sem ser reabastecido: perdido
  if (tanque.y < -90) {
    tanque.ativo = false;
    // Próxima aparição em intervalo
    if (tanque.aparicoesRestantes > 0) {
      tanque.proximaEm = TANKER_REAPARICAO_SEG + Math.random() * 6;
    }
    return null;
  }

  // Zona de conexão: retângulo logo abaixo do tanque
  const zona = {
    x: tanque.x,
    y: tanque.y + 34,
    largura: TANKER_ZONA_LARGURA,
    altura: TANKER_ZONA_ALTURA,
  };

  const dentro =
    jogador.x > zona.x - 10 &&
    jogador.x < zona.x + zona.largura + 10 &&
    jogador.y + jogador.altura / 2 > zona.y &&
    jogador.y - jogador.altura / 2 < zona.y + zona.altura;

  if (dentro) {
    estado.recarregando = true;
    estado.recargaT += dt;
    estado.combustivel = Math.min(
      COMBUSTIVEL_MAX,
      estado.combustivel + (COMBUSTIVEL_MAX / TANKER_TEMPO_CONEXAO) * dt
    );
    tocarRecarga();

    if (estado.recargaT >= TANKER_TEMPO_CONEXAO) {
      estado.misseis = Math.min(99, estado.misseis + MISSEIS_REPOSTOS_POR_TANK);
      estado.recargaT = 0;
      estado.recarregando = false;
      tanque.ativo = false;
      if (tanque.aparicoesRestantes > 0) {
        tanque.proximaEm = TANKER_REAPARICAO_SEG + Math.random() * 6;
      }
      return 'recarregou';
    }
  } else {
    estado.recarregando = false;
    estado.recargaT = Math.max(0, estado.recargaT - dt * 3);
  }

  return null;
}

/** Desenha o avião-tanque e a zona de conexão. */
export function desenharTanque(
  g: CanvasRenderingContext2D,
  tanque: Tanque,
  tempo: number
): void {
  if (!tanque.ativo) return;

  // Zona de conexão (barras piscantes)
  const piscada = Math.floor(tempo * 6) % 2 === 0;
  g.save();
  g.globalAlpha = 0.9;
  g.fillStyle = piscada ? '#FDE047' : '#FACC15';
  g.fillRect(tanque.x, tanque.y + 34, TANKER_ZONA_LARGURA, 2);
  g.fillRect(tanque.x, tanque.y + 34 + TANKER_ZONA_ALTURA - 2, TANKER_ZONA_LARGURA, 2);
  g.fillStyle = 'rgba(253, 224, 71, 0.22)';
  g.fillRect(tanque.x, tanque.y + 34, TANKER_ZONA_LARGURA, TANKER_ZONA_ALTURA);
  g.restore();

  // Avião-tanque (grande e lento)
  g.save();
  g.translate(tanque.x + TANKER_ZONA_LARGURA / 2, tanque.y + 16);

  // Fuselagem
  g.fillStyle = '#E2E8F0';
  g.fillRect(-16, -18, 32, 32);
  g.fillStyle = '#94A3B8';
  g.fillRect(-16, 6, 32, 8);

  // Asas gigantes
  g.fillStyle = '#CBD5F5';
  g.fillRect(-50, -4, 100, 9);
  g.fillStyle = '#FB923C';
  g.fillRect(-50, -4, 11, 9);
  g.fillRect(39, -4, 11, 9);

  // Cauda
  g.fillStyle = '#CBD5F5';
  g.fillRect(-17, 13, 12, 6);
  g.fillRect(5, 13, 12, 6);

  // Cockpit
  g.fillStyle = '#38BDF8';
  g.fillRect(-7, -18, 14, 8);

  // Tanques laranjas sob as asas
  g.fillStyle = '#F97316';
  g.fillRect(-42, 5, 15, 10);
  g.fillRect(27, 5, 15, 10);
  g.fillStyle = '#FDBA74';
  g.fillRect(-42, 5, 15, 3);
  g.fillRect(27, 5, 15, 3);

  // Mangueira de abastecimento
  g.strokeStyle = '#334155';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 14);
  g.lineTo(0, 27);
  g.stroke();

  g.restore();
}

/** Seta/aviso lateral de que o tanque está chegando. */
export function desenharIndicadorTanque(
  g: CanvasRenderingContext2D,
  tanque: Tanque,
  tempo: number
): void {
  if (tanque.ativo || tanque.proximaEm > 2) return;
  const piscada = Math.floor(tempo * 5) % 2 === 0;
  if (!piscada) return;
  g.save();
  g.fillStyle = '#FDE047';
  g.font = '8px "Press Start 2P", monospace';
  g.textAlign = 'center';
  g.fillText('TANQUE', 240, 92);
  // Setas laterais apontando para o tanque
  g.beginPath();
  g.moveTo(120, 100); g.lineTo(104, 106); g.lineTo(120, 112); g.fill();
  g.beginPath();
  g.moveTo(360, 100); g.lineTo(376, 106); g.lineTo(360, 112); g.fill();
  g.restore();
}
