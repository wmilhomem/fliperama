/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, LARGURA } from './constantes';
import { aleatorio, criarRng } from './semente';
import { ClimaTipo, GotaClima, SistemaClima } from './tipos';

const AGENDA: ClimaTipo[] = ['limpo', 'chuva', 'neblina', 'gelo', 'chuva', 'limpo', 'neblina', 'gelo'];

const CONFIGURACOES: Record<ClimaTipo, { aderencia: number; visibilidade: number }> = {
  limpo: { aderencia: 1, visibilidade: 1 },
  chuva: { aderencia: 0.68, visibilidade: 0.87 },
  neblina: { aderencia: 0.9, visibilidade: 0.56 },
  gelo: { aderencia: 0.36, visibilidade: 0.9 },
};

export function climaDoDia(dia: number): ClimaTipo {
  return AGENDA[(Math.max(1, dia) - 1) % AGENDA.length];
}

export function rotuloClima(clima: ClimaTipo): string {
  if (clima === 'chuva') return 'CHUVA';
  if (clima === 'neblina') return 'NEBLINA';
  if (clima === 'gelo') return 'GELO';
  return 'LIMPO';
}

export function criarSistemaClima(dia: number, semente: number): SistemaClima {
  const tipo = climaDoDia(dia);
  const config = CONFIGURACOES[tipo];
  const rng = criarRng(semente ^ 0x85ebca6b);
  const quantidade = tipo === 'chuva' ? 88 : tipo === 'gelo' ? 58 : 0;
  const gotas: GotaClima[] = [];

  for (let i = 0; i < quantidade; i++) {
    gotas.push({
      x: aleatorio(rng, -40, LARGURA + 40),
      y: aleatorio(rng, 0, ALTURA),
      velocidade: aleatorio(rng, 0.75, 1.35),
      comprimento: aleatorio(rng, 7, 18),
      variacao: rng(),
    });
  }

  return {
    tipo,
    aderencia: config.aderencia,
    visibilidade: config.visibilidade,
    gotas,
    tempo: 0,
  };
}

export function atualizarClima(
  sistema: SistemaClima,
  dt: number,
  velocidade: number
): void {
  sistema.tempo += dt;

  if (sistema.tipo !== 'chuva' && sistema.tipo !== 'gelo') return;

  const chuva = sistema.tipo === 'chuva';
  const velocidadeQueda = (chuva ? 720 : 130) + velocidade * (chuva ? 0.035 : 0.006);
  const vento = chuva ? 135 : 34;

  for (const gota of sistema.gotas) {
    gota.y += velocidadeQueda * gota.velocidade * dt;
    gota.x -= vento * gota.velocidade * dt;

    if (gota.y > ALTURA + 20 || gota.x < -50) {
      gota.y = -20;
      gota.x = Math.random() * (LARGURA + 70);
    }
  }
}

export function desenharClima(
  g: CanvasRenderingContext2D,
  sistema: SistemaClima,
  noite: number
): void {
  if (sistema.tipo === 'neblina') {
    const gradiente = g.createLinearGradient(0, 150, 0, ALTURA);
    gradiente.addColorStop(0, 'rgba(226,232,240,0)');
    gradiente.addColorStop(0.42, 'rgba(226,232,240,0.26)');
    gradiente.addColorStop(0.7, 'rgba(226,232,240,0.2)');
    gradiente.addColorStop(1, 'rgba(226,232,240,0.06)');
    g.fillStyle = gradiente;
    g.fillRect(0, 130, LARGURA, ALTURA - 130);
    return;
  }

  if (sistema.tipo === 'chuva') {
    g.strokeStyle = 'rgba(191,219,254,0.55)';
    g.lineWidth = 1;
    g.beginPath();
    for (const gota of sistema.gotas) {
      g.moveTo(gota.x, gota.y);
      g.lineTo(gota.x - gota.comprimento * 0.45, gota.y + gota.comprimento);
    }
    g.stroke();

    g.fillStyle = 'rgba(30,41,59,0.18)';
    g.fillRect(0, 0, LARGURA, ALTURA);
    return;
  }

  if (sistema.tipo === 'gelo') {
    g.fillStyle = `rgba(147,197,253,${0.1 + noite * 0.04})`;
    g.fillRect(0, 0, LARGURA, ALTURA);

    g.fillStyle = 'rgba(255,255,255,0.68)';
    for (const gota of sistema.gotas) {
      g.fillRect(gota.x, gota.y, gota.variacao < 0.5 ? 1 : 2, 2);
    }
  }
}
