/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HUDService, SpriteUtils } from '../../engine/types';
import {
  ALTURA,
  CORES,
  HUD_ALTURA,
  LARGURA,
  TOTAL_TABUAS,
  VIDAS_MAX,
} from './constantes';
import { MedidorCheia } from './tipos';

function desenharChapeu(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  ativo: boolean
): void {
  g.fillStyle = ativo ? CORES.chapéu : '#334155';
  g.fillRect(x, y + 3, 10, 2);
  g.fillRect(x + 2, y + 2, 6, 2);
  g.fillRect(x + 3, y, 4, 2);
  g.fillStyle = ativo ? CORES.chapéuEscuro : '#1E293B';
  g.fillRect(x + 2, y + 4, 6, 1);
}

function desenharMedidorCheia(
  g: CanvasRenderingContext2D,
  medidor: MedidorCheia,
  tempo: number
): void {
  const restante = Math.max(0, Math.ceil(medidor.restante));
  const pisca = restante <= 10 && Math.floor(tempo * 7) % 2 === 0;
  const corBarra = restante <= 10
    ? pisca ? CORES.vermelho : CORES.amarelo
    : restante <= 20
      ? CORES.amarelo
      : CORES.aguaClara;

  g.textAlign = 'left';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosaClaro;
  g.fillText('CHEIA', 318, 4);

  g.textAlign = 'right';
  g.fillStyle = pisca ? CORES.vermelho : CORES.amarelo;
  g.fillText(`${restante}`, 462, 4);

  const segmentos = 10;
  const largura = 12;
  const vao = 2;
  const preenchidos = Math.ceil((medidor.restante / medidor.inicial) * segmentos);
  for (let i = 0; i < segmentos; i++) {
    g.fillStyle = i < preenchidos ? corBarra : '#1E1B4B';
    g.fillRect(318 + i * (largura + vao), 13, largura, 8);
    if (i < preenchidos) {
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(318 + i * (largura + vao), 13, largura, 1);
    }
  }
}

function desenharTabuas(
  g: CanvasRenderingContext2D,
  tabuas: number
): void {
  g.textAlign = 'left';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = tabuas >= TOTAL_TABUAS ? CORES.amarelo : CORES.rosaClaro;
  g.fillText(`TÁBUAS ${Math.floor(tabuas)}/${TOTAL_TABUAS}`, 318, 28);

  const segmentos = TOTAL_TABUAS;
  const largura = 7;
  const vao = 1;
  for (let i = 0; i < segmentos; i++) {
    g.fillStyle = i < tabuas ? (tabuas >= TOTAL_TABUAS ? CORES.amarelo : CORES.rosa) : '#312E81';
    g.fillRect(318 + i * (largura + vao), 37, largura, 5);
  }
}

export function desenharHUDJogo(
  g: CanvasRenderingContext2D,
  hud: HUDService,
  _sprites: SpriteUtils,
  fase: number,
  vidas: number,
  medidor: MedidorCheia,
  tabuas: number,
  casasConcluidas: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(5, 3, 18, 0.94)';
  g.fillRect(0, 0, LARGURA, HUD_ALTURA);

  hud.desenharHUD(g, LARGURA, HUD_ALTURA);

  g.fillStyle = 'rgba(5, 3, 18, 0.96)';
  g.fillRect(300, 0, LARGURA - 300, 36);
  g.fillRect(0, 36, LARGURA, HUD_ALTURA - 36);

  desenharMedidorCheia(g, medidor, tempo);
  desenharTabuas(g, tabuas);

  g.textAlign = 'left';
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosaClaro;
  g.fillText(`FASE ${fase}`, 18, 38);

  const total = Math.min(VIDAS_MAX, vidas);
  for (let i = 0; i < VIDAS_MAX; i++) {
    desenharChapeu(g, 80 + i * 14, 37, i < total);
  }

  if (casasConcluidas > 0) {
    g.textAlign = 'right';
    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = CORES.verdeClaro;
    g.fillText(`CASAS ${casasConcluidas}`, 288, 38);
  }

  g.fillStyle = CORES.rosa;
  g.fillRect(0, HUD_ALTURA - 2, LARGURA, 2);
  g.fillStyle = 'rgba(251, 207, 232, 0.55)';
  g.fillRect(0, HUD_ALTURA - 3, LARGURA, 1);
  g.restore();
}

export function desenharTitulo(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3, 2, 12, 0.82)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.fillStyle = 'rgba(5, 3, 18, 0.55)';
  g.fillRect(48, 70, LARGURA - 96, 430);
  g.strokeStyle = 'rgba(244, 114, 182, 0.3)';
  g.lineWidth = 1;
  g.strokeRect(48, 70, LARGURA - 96, 430);

  g.textAlign = 'center';
  g.textBaseline = 'top';

  g.font = '34px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosa;
  g.fillText('CASA', LARGURA / 2, 92);
  g.fillStyle = CORES.verdeClaro;
  g.fillText('NA CHEIA', LARGURA / 2, 136);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.aguaClara;
  g.fillText('TIQUINHO E A PALAFITA', LARGURA / 2, 184);

  g.fillStyle = CORES.rosa;
  g.fillRect(58, 210, 364, 2);
  g.fillStyle = 'rgba(251, 207, 232, 0.55)';
  g.fillRect(58, 216, 364, 1);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#E2E8F0';
  g.fillText('PULE ENTRE AS VITÓRIAS-RÉGIAS', LARGURA / 2, 238);
  g.fillText('E CONSTRUA A CASA DE PALAFITA.', LARGURA / 2, 256);
  g.fillText('ENTRE ANTES QUE A CHEIA SUBA.', LARGURA / 2, 274);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosaClaro;
  g.fillText('SETAS / WASD / D-PAD: MOVER', LARGURA / 2, 312);
  g.fillText('CIMA / BAIXO: PULAR DE FILEIRA', LARGURA / 2, 328);
  g.fillText('P: PAUSA   R: REINICIAR   M: SOM   ESC: HUB', LARGURA / 2, 344);

  g.fillStyle = CORES.amarelo;
  g.font = '8px "Press Start 2P", monospace';
  g.fillText(`RECORDE: ${Math.floor(recorde).toString().padStart(6, '0')}`, LARGURA / 2, 382);

  g.globalAlpha = 0.6 + Math.sin(tempo * 3.4) * 0.35;
  g.font = '10px "Press Start 2P", monospace';
  g.fillStyle = CORES.branco;
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 428);
  g.globalAlpha = 1;

  g.fillStyle = CORES.verde;
  g.fillRect(70, 468, 340, 1);
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  g.fillText('CADA TÁBUA APROXIMA O TIQUINHO DE CASA', LARGURA / 2, 482);

  g.restore();
}

export function desenharTransicao(
  g: CanvasRenderingContext2D,
  fase: number,
  bonus: number,
  casasConcluidas: number,
  restante: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3, 2, 12, 0.78)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '18px "Press Start 2P", monospace';
  g.fillStyle = CORES.rosaClaro;
  g.fillText('CASA CONCLUÍDA', LARGURA / 2, 184);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = CORES.verdeClaro;
  g.fillText(`FASE ${fase} VENCIDA`, LARGURA / 2, 222);

  g.fillStyle = 'rgba(30, 27, 75, 0.86)';
  g.fillRect(78, 254, 324, 132);
  g.strokeStyle = CORES.rosa;
  g.lineWidth = 2;
  g.strokeRect(78, 254, 324, 132);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = CORES.amarelo;
  g.fillText(`BÔNUS: +${Math.floor(bonus)}`, LARGURA / 2, 276);
  g.fillStyle = '#E2E8F0';
  g.fillText('TÁBUAS: 16/16', LARGURA / 2, 300);
  g.fillStyle = CORES.verdeClaro;
  g.fillText(`CASAS: ${casasConcluidas}`, LARGURA / 2, 324);
  g.fillStyle = CORES.aguaClara;
  g.fillText(`PRÓXIMA EM ${Math.max(0, Math.ceil(restante))}`, LARGURA / 2, 348);

  g.globalAlpha = 0.6 + Math.sin(tempo * 5) * 0.3;
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.branco;
  g.fillText('A CHEIA VAI SUBIR DE NOVO...', LARGURA / 2, 410);
  g.globalAlpha = 1;

  g.restore();
}

