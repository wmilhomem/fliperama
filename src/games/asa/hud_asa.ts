/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HUDService } from '../../engine/types';
import {
  BOMBAS_POR_SETOR,
  COMBUSTIVEL_MAX,
  COR_LARANJA,
  HUD_ALTURA,
  LARGURA,
} from './constantes';
import { EstadoVento } from './vento';
import { TipoBioma } from './constantes';

/**
 * HUD DO JOGO — sobreposto ao HUD compartilhado do motor.
 * Combustível, bombas, vento, setor/bioma e indicador de recarga.
 */

const NOMES_BIOMAS: Record<TipoBioma, string> = {
  litoral: 'LITORAL',
  serra: 'SERRA',
  sertaao: 'SERTÃO',
  floresta: 'FLORESTA',
};

function barraSegmentada(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  largura: number,
  altura: number,
  proporcao: number,
  cor: string,
  segmentos = 10
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
  estado: { combustivel: number; bombas: number; recarregando: boolean },
  vento: EstadoVento,
  setor: number,
  bioma: TipoBioma,
  tempo: number
): void {
  g.save();

  // Painel superior semitransparente
  g.fillStyle = 'rgba(3, 7, 18, 0.88)';
  g.fillRect(0, 0, LARGURA, HUD_ALTURA);

  // HUD compartilhado (pontos, recorde, vidas, fase)
  hud.desenharHUD(g, LARGURA, HUD_ALTURA);

  // ===== Painel direito =====
  g.fillStyle = 'rgba(3, 7, 18, 0.96)';
  g.fillRect(300, 0, LARGURA - 300, 44);
  g.strokeStyle = 'rgba(249, 115, 22, 0.35)';
  g.beginPath();
  g.moveTo(300, 0);
  g.lineTo(300, 44);
  g.stroke();

  // Combustível
  const combustivel = Math.max(0, Math.min(1, estado.combustivel / COMBUSTIVEL_MAX));
  const baixo = combustivel <= 0.25;
  const pisca = baixo && Math.floor(tempo * 6) % 2 === 0;
  const corCombustivel = baixo ? (pisca ? '#EF4444' : '#F97316') : '#FB923C';

  g.font = '6px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = COR_LARANJA;
  g.fillText('COMB', 306, 7);
  barraSegmentada(g, 340, 2, 128, 6, combustivel, corCombustivel, 12);

  // Bombas
  g.fillStyle = '#FDE047';
  g.fillText('BOMBAS', 306, 19);
  for (let i = 0; i < BOMBAS_POR_SETOR; i++) {
    const x = 346 + i * 11;
    if (i < estado.bombas) {
      g.fillStyle = '#FDE047';
      g.fillRect(x, 14, 6, 8);
      g.fillStyle = '#F97316';
      g.fillRect(x + 1, 12, 4, 3);
    } else {
      g.fillStyle = '#1f2937';
      g.fillRect(x, 14, 6, 8);
    }
  }

  // Vento
  g.fillStyle = '#7DD3FC';
  g.fillText('VENTO', 306, 36);
  if (vento.ativo) {
    const forca = Math.min(1, vento.forca / 200);
    const corVento = forca > 0.7 ? '#EF4444' : forca > 0.4 ? '#FBBF24' : '#34D399';
    g.fillStyle = corVento;
    const barraLargura = Math.round(64 * forca);
    g.fillRect(344, 31, barraLargura, 5);
    g.fillStyle = '#334155';
    g.fillRect(344 + barraLargura, 31, 64 - barraLargura, 5);
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = corVento;
    g.fillText(vento.direcao === 1 ? '>>' : '<<', 416, 36);
  } else {
    g.fillStyle = '#334155';
    g.fillRect(344, 31, 64, 5);
  }

  // Setor/bioma (lado esquerdo do painel, abaixo da fase)
  g.font = '7px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#FB923C';
  g.fillText(`SETOR ${setor}`, 18, 74);
  g.fillStyle = '#FDBA74';
  g.fillText(NOMES_BIOMAS[bioma], 92, 74);

  // Indicador de recarga
  if (estado.recarregando) {
    g.textAlign = 'center';
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = Math.floor(tempo * 5) % 2 === 0 ? '#FDE047' : '#FB923C';
    g.fillText('REABASTECENDO', LARGURA / 2, 74);
  }

  g.restore();
}

export function desenharTitulo(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3, 7, 18, 0.68)';
  g.fillRect(0, 0, LARGURA, 560);

  g.textAlign = 'center';
  g.textBaseline = 'top';

  g.font = '34px "Press Start 2P", monospace';
  g.fillStyle = '#FB923C';
  g.fillText('ASA', LARGURA / 2, 84);
  g.fillStyle = '#FDBA74';
  g.fillText('RASANTE', LARGURA / 2, 128);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#7DD3FC';
  g.fillText('A HEROÍNA LIA "ASA" DUARTE', LARGURA / 2, 178);
  g.fillText('DESTRUA AS CENTRAIS DE RADAR', LARGURA / 2, 192);

  g.fillStyle = '#F97316';
  g.fillRect(64, 216, 352, 2);
  g.fillStyle = 'rgba(253, 186, 116, 0.5)';
  g.fillRect(64, 222, 352, 1);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#E2E8F0';
  g.fillText('SETOR APÓS SETOR, DO LITORAL', LARGURA / 2, 244);
  g.fillText('À FLORESTA — SEM PTO DE POUSO.', LARGURA / 2, 258);

  g.fillStyle = '#FDBA74';
  g.fillText('SETAS / WASD: MOVER', LARGURA / 2, 292);
  g.fillText('CIMA: ACELERA · BAIXO: FREIA', LARGURA / 2, 308);
  g.fillText('A/ESPAÇO: CANHÃO · B/X: BOMBA', LARGURA / 2, 324);
  g.fillText('P: PAUSA · R: REINICIAR · M: SOM', LARGURA / 2, 340);

  g.fillStyle = '#FDE047';
  g.font = '8px "Press Start 2P", monospace';
  g.fillText('RECORDE: ' + Math.floor(recorde).toString().padStart(6, '0'), LARGURA / 2, 380);

  g.globalAlpha = 0.6 + Math.sin(tempo * 3) * 0.35;
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 428);
  g.globalAlpha = 1;

  g.fillStyle = '#F97316';
  g.fillRect(64, 464, 352, 1);
  g.font = '5px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  g.fillText('COMBUSTÍVEL APENAS NO AR — FIQUE NA ZONA DO TANQUE', LARGURA / 2, 480);

  g.restore();
}
