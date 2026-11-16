/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** HUD do Asa Rasante — sobreposição ao HUD compartilhado do motor. */

import { HUDService } from '../../engine/types';
import {
  ARMADURA_MAX,
  COMBUSTIVEL_MAX,
  HUD_ALTURA,
  LARGURA,
} from './config';
import { desenharArmaduraHUD } from './armadura';
import { EstadoVento } from './vento';

export interface EstadoHUD {
  combustivel: number;
  misseis: number;
  semMisseis: boolean;
  armadura: number;
  progresso: number; // 0..1
  recarregando: boolean;
  reabastecendo: boolean;
  vento: EstadoVento;
  missao: number;
  ciclo: number;
  tempo: number;
}

function barraSegmentada(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  proporcao: number,
  cor: string,
  segmentos = 12
): void {
  const vao = 1;
  const larguraSegmento = (largura - vao * (segmentos - 1)) / segmentos;
  const preenchidos = Math.ceil(Math.max(0, Math.min(1, proporcao)) * segmentos);

  for (let i = 0; i < segmentos; i++) {
    g.fillStyle = i < preenchidos ? cor : '#1f2937';
    g.fillRect(
      Math.round(x + i * (larguraSegmento + vao)),
      y,
      Math.ceil(larguraSegmento),
      altura
    );
    if (i < preenchidos) {
      g.fillStyle = 'rgba(255,255,255,0.32)';
      g.fillRect(Math.round(x + i * (larguraSegmento + vao)), y, Math.ceil(larguraSegmento), 1);
    }
  }
}

export function desenharHUDJogo(
  g: CanvasRenderingContext2D,
  hud: HUDService,
  estado: EstadoHUD
): void {
  g.save();

  // Painel superior semitransparente
  g.fillStyle = 'rgba(3, 7, 18, 0.88)';
  g.fillRect(0, 0, LARGURA, HUD_ALTURA);
  g.fillStyle = 'rgba(249, 115, 22, 0.25)';
  g.fillRect(0, HUD_ALTURA - 1, LARGURA, 1);

  // HUD compartilhado (pontos, recorde, vidas, fase=missão)
  hud.desenharHUD(g, LARGURA, HUD_ALTURA);

  // ===== Painel direito: COMB + MÍSSEIS =====
  g.fillStyle = 'rgba(3, 7, 18, 0.96)';
  g.fillRect(302, 0, LARGURA - 302, 48);
  g.strokeStyle = 'rgba(249, 115, 22, 0.35)';
  g.beginPath();
  g.moveTo(302, 0);
  g.lineTo(302, 48);
  g.stroke();

  // Combustível
  const combustivel = Math.max(0, Math.min(1, estado.combustivel / COMBUSTIVEL_MAX));
  const baixo = combustivel <= 0.25;
  const pisca = baixo && Math.floor(estado.tempo * 6) % 2 === 0;
  const corCombustivel = baixo ? (pisca ? '#EF4444' : '#F97316') : '#FB923C';

  g.font = '6px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#FB923C';
  g.fillText('COMB', 308, 10);
  barraSegmentada(g, 344, 5, 124, 6, combustivel, corCombustivel, 12);

  // Míssil estoque + ícone
  g.fillStyle = '#FBBF24';
  g.fillText('MÍS', 308, 28);
  // Ícone de míssil
  const mx = 344;
  g.fillStyle = '#991B1B';
  g.fillRect(mx, 18, 14, 5);
  g.fillStyle = '#FDE047';
  g.beginPath();
  g.moveTo(mx + 14, 17);
  g.lineTo(mx + 18, 20);
  g.lineTo(mx + 14, 24);
  g.closePath();
  g.fill();
  const misPisca = estado.semMisseis && Math.floor(estado.tempo * 5) % 2 === 0;
  g.fillStyle = misPisca ? '#FDE047' : '#E2E8F0';
  g.font = '9px "Press Start 2P", monospace';
  g.fillText(String(estado.misseis).padStart(2, '0'), mx + 24, 28);

  // ===== Linha inferior do HUD: armadura + progresso =====
  // Armadura (3 ícones com metades)
  desenharArmaduraHUD(g, 12, HUD_ALTURA + 6, Math.max(0, Math.min(ARMADURA_MAX, estado.armadura)));

  // Missão/ciclo à direita da armadura
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#FB923C';
  g.fillText(`MISSÃO ${estado.missao}/5`, 102, HUD_ALTURA + 15);
  g.fillStyle = '#94A3B8';
  g.fillText(`CICLO ${estado.ciclo}`, 102, HUD_ALTURA + 27);

  // Barra de progresso do percurso (discreta)
  const bw = 200;
  const bx = LARGURA - bw - 12;
  const by = HUD_ALTURA + 12;
  g.fillStyle = '#1F2937';
  g.fillRect(bx, by, bw, 5);
  g.fillStyle = '#22D3EE';
  g.fillRect(bx, by, Math.floor(bw * Math.max(0, Math.min(1, estado.progresso))), 5);
  g.fillStyle = '#A5F3FC';
  g.fillRect(bx, by, bw, 1);
  // Marcas a cada 25%
  g.fillStyle = '#0891B2';
  for (let i = 1; i < 4; i++) {
    g.fillRect(bx + (bw / 4) * i, by, 1, 5);
  }

  // Aviso de reabastecimento
  if (estado.reabastecendo) {
    g.textAlign = 'center';
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = Math.floor(estado.tempo * 5) % 2 === 0 ? '#FDE047' : '#FB923C';
    g.fillText('REABASTECENDO', LARGURA / 2, HUD_ALTURA + 15);
  }

  // Vento
  g.textAlign = 'left';
  g.fillStyle = '#7DD3FC';
  g.font = '6px "Press Start 2P", monospace';
  g.fillText('VENTO', bx - 58, by + 5);
  const forca = Math.min(1, Math.abs(estado.vento.forca) / 200);
  const corVento = forca > 0.7 ? '#EF4444' : forca > 0.4 ? '#FBBF24' : '#34D399';
  g.fillStyle = corVento;
  const barraLargura = Math.round(40 * forca);
  g.fillRect(bx - 18, by + 1, barraLargura, 4);

  g.restore();
}

export function desenharHUDDuelo(
  g: CanvasRenderingContext2D,
  hud: HUDService,
  estado: { misseis: number; armadura: number; semMisseis: boolean; tempo: number }
): void {
  g.save();

  // Faixa de topo: HUD do motor (pontos, recorde, vidas, fase)
  hud.desenharHUD(g, LARGURA, 44);

  // Armadura no rodapé, à esquerda
  desenharArmaduraHUD(g, 12, 540, Math.max(0, Math.min(ARMADURA_MAX, estado.armadura)));

  // Míssil estoque no rodapé, à direita
  g.fillStyle = '#FBBF24';
  g.fillRect(430, 536, 12, 4);
  g.fillRect(442, 534, 2, 8);
  const pisca = estado.semMisseis && Math.floor(estado.tempo * 5) % 2 === 0;
  g.fillStyle = pisca ? '#FDE047' : '#E2E8F0';
  g.font = '9px "Press Start 2P", monospace';
  g.textAlign = 'right';
  g.fillText(String(estado.misseis).padStart(2, '0'), 424, 543);

  g.restore();
}

/** Desenha a ficha da missão (2 s, pulável). */
export function desenharFicha(
  g: CanvasRenderingContext2D,
  missao: number,
  nome: string,
  regiao: string,
  hora: string,
  clima: string,
  descricao: string,
  tempo: number
): void {
  g.save();
  g.fillStyle = '#0B1120';
  g.fillRect(0, 0, LARGURA, 560);

  // Moldura
  g.strokeStyle = '#F97316';
  g.lineWidth = 2;
  g.strokeRect(24, 40, LARGURA - 48, 460);
  g.strokeStyle = 'rgba(251,146,60,0.35)';
  g.strokeRect(28, 44, LARGURA - 56, 452);

  g.textAlign = 'center';
  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = '#7DD3FC';
  g.fillText(`MISSÃO ${missao} DE 5`, LARGURA / 2, 92);

  g.font = '14px "Press Start 2P", monospace';
  g.fillStyle = '#FB923C';
  g.fillText(nome, LARGURA / 2, 140);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#E2E8F0';
  g.fillText(regiao, LARGURA / 2, 176);
  g.fillText(`HORA: ${hora}    CLIMA: ${clima}`, LARGURA / 2, 198);

  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  // Quebra simples da descrição em duas linhas
  const meio = Math.floor(descricao.length / 2);
  const corte = descricao.lastIndexOf(' ', meio);
  g.fillText(descricao.slice(0, corte), LARGURA / 2, 236);
  g.fillText(descricao.slice(corte + 1), LARGURA / 2, 254);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#FDE047';
  g.globalAlpha = 0.75 + Math.sin(tempo * 4) * 0.25;
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 448);
  g.globalAlpha = 1;

  g.restore();
}
