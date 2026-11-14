/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BOMBAS_RECARGA_TANK,
  BOMBAS_POR_SETOR,
  COMBUSTIVEL_GASTO_ACELERANDO,
  COMBUSTIVEL_GASTO_BASE,
  COMBUSTIVEL_GASTO_DESACELERADO,
  COMBUSTIVEL_INICIAL,
  COMBUSTIVEL_MAX,
  TANKER_INTERVALO_MAX,
  TANKER_INTERVALO_MIN,
  TANKER_RAIO_CONEXAO_ALTURA,
  TANKER_RAIO_CONEXAO_LARGURA,
  TANKER_TEMPO_RECARGA,
  TANKER_VEL_Y,
  TANKER_X,
} from './constantes';
import { Tanque } from './tipos';
import { entre } from './util';

/** Estado compartilhado do sistema de combustível. */
export interface EstadoCombustivel {
  combustivel: number;
  bombas: number;
  recargaT: number; // tempo acumulado na zona de conexão
  recarregando: boolean;
}

export function criarEstadoCombustivel(): EstadoCombustivel {
  return {
    combustivel: COMBUSTIVEL_INICIAL,
    bombas: BOMBAS_POR_SETOR,
    recargaT: 0,
    recarregando: false,
  };
}

export function criarTanque(proximaEm: number): Tanque {
  return {
    x: TANKER_X,
    y: 0,
    vx: 0,
    vy: TANKER_VEL_Y,
    ativo: false,
    proximaEm,
    aviso: false,
  };
}

/** Consome combustível; retorna o dano se chegar a zero (motor falha). */
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
 * Atualiza a máquina de estados do avião-tanque.
 * Retorna 'recarregou' quando completa a recarga (para pontuar 100 pts).
 */
export function atualizarTanque(
  tanque: Tanque,
  estado: EstadoCombustivel,
  jogador: { x: number; y: number; largura: number; altura: number },
  dt: number,
  aleatorio: () => number,
  tocarAviso: () => void,
  tocarRecarga: () => void
): 'recarregou' | null {
  if (!tanque.ativo) {
    tanque.proximaEm -= dt;
    if (tanque.proximaEm <= 2 && !tanque.aviso) {
      tanque.aviso = true;
      tocarAviso();
    }
    if (tanque.proximaEm <= 0) {
      tanque.ativo = true;
      tanque.y = 560 + 60; // entra por baixo e sobe
      tanque.aviso = false;
      tanque.proximaEm = entre(aleatorio, TANKER_INTERVALO_MIN, TANKER_INTERVALO_MAX);
    }
    return null;
  }

  tanque.y += tanque.vy * dt;

  // Saiu pela parte de cima sem ter sido reabastecido: ciclo perdido
  if (tanque.y < -80) {
    tanque.ativo = false;
    return null;
  }

  // Zona de conexão: retângulo atrás do tanque (abaixo dele)
  const zona = {
    x: tanque.x + (48 - TANKER_RAIO_CONEXAO_LARGURA) / 2,
    y: tanque.y + 34,
    largura: TANKER_RAIO_CONEXAO_LARGURA,
    altura: TANKER_RAIO_CONEXAO_ALTURA,
  };

  const dentro =
    jogador.x > zona.x - 8 &&
    jogador.x < zona.x + zona.largura + 8 &&
    jogador.y + jogador.altura / 2 > zona.y &&
    jogador.y - jogador.altura / 2 < zona.y + zona.altura;

  if (dentro) {
    estado.recarregando = true;
    estado.recargaT += dt;
    // Combustível sobe continuamente durante a conexão
    estado.combustivel = Math.min(
      COMBUSTIVEL_MAX,
      estado.combustivel + (COMBUSTIVEL_MAX / TANKER_TEMPO_RECARGA) * dt
    );
    tocarRecarga();

    if (estado.recargaT >= TANKER_TEMPO_RECARGA) {
      // Reabastecimento concluído: +100 pts e +2 bombas
      estado.bombas = Math.min(BOMBAS_POR_SETOR, estado.bombas + BOMBAS_RECARGA_TANK);
      estado.recargaT = 0;
      estado.recarregando = false;
      tanque.ativo = false;
      return 'recarregou';
    }
  } else {
    estado.recarregando = false;
    estado.recargaT = Math.max(0, estado.recargaT - dt * 3); // perde o progresso rápido ao sair
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

  // Zona de conexão (luzes piscantes)
  const piscada = Math.floor(tempo * 6) % 2 === 0;
  g.save();
  g.globalAlpha = 0.9;
  g.fillStyle = piscada ? '#FDE047' : '#FACC15';
  g.fillRect(tanque.x + 4, tanque.y + 34, 40, 2);
  g.fillRect(tanque.x + 4, tanque.y + 34 + TANKER_RAIO_CONEXAO_ALTURA - 2, 40, 2);
  g.fillStyle = 'rgba(253, 224, 71, 0.25)';
  g.fillRect(tanque.x + 4, tanque.y + 34, 40, TANKER_RAIO_CONEXAO_ALTURA);
  g.restore();

  // Avião-tanque (grande, lento, cortesia da FAB fictícia)
  g.save();
  g.translate(tanque.x + 24, tanque.y + 20);

  // Fuselagem
  g.fillStyle = '#E2E8F0';
  g.fillRect(-14, -18, 28, 34);
  g.fillStyle = '#94A3B8';
  g.fillRect(-14, 8, 28, 8);

  // Asas gigantes
  g.fillStyle = '#CBD5F5';
  g.fillRect(-46, -4, 92, 8);
  g.fillStyle = '#FB923C';
  g.fillRect(-46, -4, 10, 8);
  g.fillRect(36, -4, 10, 8);

  // Cauda
  g.fillStyle = '#CBD5F5';
  g.fillRect(-16, 12, 10, 5);
  g.fillRect(6, 12, 10, 5);

  // Cockpit
  g.fillStyle = '#38BDF8';
  g.fillRect(-6, -18, 12, 7);

  // Tanques de combustível (barris laranja sob as asas)
  g.fillStyle = '#F97316';
  g.fillRect(-40, 4, 14, 10);
  g.fillRect(26, 4, 14, 10);
  g.fillStyle = '#FDBA74';
  g.fillRect(-40, 4, 14, 3);
  g.fillRect(26, 4, 14, 3);

  // Mangueira de abastecimento
  g.strokeStyle = '#334155';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 12);
  g.lineTo(0, 26);
  g.stroke();

  g.restore();
}

/** Desenha o indicador de tank chegando / seta lateral. */
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
  g.fillText('TANQUE ▼', 240, 78);
  g.restore();
}
