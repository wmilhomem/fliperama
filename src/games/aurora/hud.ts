/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HUDService, SpriteUtils } from '../../engine/types';
import { desenharMiniCanhao } from './arte';
import {
  ALTURA,
  CALOR_MAX,
  CORES,
  HUD_ALTURA,
  LARGURA,
  VIDAS_MAX,
} from './constantes';
import { Chefe } from './tipos';

function corDoCalor(calor: number): string {
  if (calor >= 85) return CORES.vermelho;
  if (calor >= 55) return CORES.amarelo;
  return CORES.ciano;
}

export function desenharHUDJogo(
  g: CanvasRenderingContext2D,
  hud: HUDService,
  sprites: SpriteUtils,
  onda: number,
  reservas: number,
  calor: number,
  travado: number
): void {
  g.save();
  g.fillStyle = 'rgba(5,3,18,0.94)';
  g.fillRect(0, 0, LARGURA, HUD_ALTURA);

  hud.desenharHUD(g, LARGURA, HUD_ALTURA);

  g.fillStyle = 'rgba(5,3,18,0.96)';
  g.fillRect(300, 0, LARGURA - 300, 36);
  g.fillRect(0, 36, LARGURA, HUD_ALTURA - 36);

  g.textBaseline = 'top';
  g.textAlign = 'right';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = CORES.violetaClaro;
  g.fillText('ONDA', LARGURA - 18, 5);
  g.font = '14px "Press Start 2P", monospace';
  g.fillStyle = CORES.amarelo;
  g.fillText(onda.toString().padStart(2, '0'), LARGURA - 18, 15);

  g.textAlign = 'left';
  g.font = '5px "Press Start 2P", monospace';
  g.fillStyle = '#94a3b8';
  g.fillText('CANHÕES', 18, 39);
  for (let i = 0; i < Math.min(VIDAS_MAX, reservas); i++) {
    desenharMiniCanhao(g, sprites, 86 + i * 19, 44, true);
  }

  g.font = '5px "Press Start 2P", monospace';
  g.fillStyle = travado > 0 ? CORES.vermelho : '#94a3b8';
  g.fillText(travado > 0 ? 'CALOR!' : 'CALOR', 286, 39);

  const larguraSegmento = 10;
  const alturaSegmento = 9;
  const inicioBarra = 338;
  const segmentos = Math.ceil(CALOR_MAX / 10);
  for (let i = 0; i < segmentos; i++) {
    const ativo = calor > i * 10;
    g.fillStyle = ativo ? corDoCalor(calor) : '#1e1b4b';
    g.fillRect(inicioBarra + i * (larguraSegmento + 2), 42, larguraSegmento, alturaSegmento);
    g.fillStyle = ativo ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)';
    g.fillRect(inicioBarra + i * (larguraSegmento + 2), 42, larguraSegmento, 1);
  }

  if (travado > 0) {
    g.textAlign = 'right';
    g.font = '5px "Press Start 2P", monospace';
    g.fillStyle = Math.floor(travado * 10) % 2 === 0 ? CORES.vermelho : CORES.amarelo;
    g.fillText('SUPERAQUECIDO', LARGURA - 18, 53);
  }

  g.fillStyle = CORES.violeta;
  g.fillRect(0, HUD_ALTURA - 2, LARGURA, 2);
  g.fillStyle = 'rgba(196,181,253,0.55)';
  g.fillRect(0, HUD_ALTURA - 3, LARGURA, 1);
  g.restore();
}

export function desenharBarraChefe(g: CanvasRenderingContext2D, chefe: Chefe): void {
  g.save();
  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#f0abfc';
  g.fillText('CORUJA GIGANTE', LARGURA / 2, HUD_ALTURA + 7);

  const largura = 286;
  const x = (LARGURA - largura) / 2;
  const y = HUD_ALTURA + 18;
  const segmentos = chefe.hpMax;
  const vao = 2;
  const larguraSegmento = (largura - vao * (segmentos - 1)) / segmentos;

  g.fillStyle = 'rgba(5,3,18,0.8)';
  g.fillRect(x - 4, y - 4, largura + 8, 16);

  for (let i = 0; i < segmentos; i++) {
    const cor = i < chefe.hp
      ? chefe.hp <= chefe.hpMax * 0.33
        ? '#f87171'
        : '#f0abfc'
      : '#312e81';
    g.fillStyle = cor;
    g.fillRect(x + i * (larguraSegmento + vao), y, larguraSegmento, 8);
  }

  g.strokeStyle = 'rgba(240,171,252,0.7)';
  g.lineWidth = 1;
  g.strokeRect(x - 4, y - 4, largura + 8, 16);
  g.restore();
}

export function desenharTitulo(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3,2,12,0.62)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.textBaseline = 'top';

  g.font = '35px "Press Start 2P", monospace';
  g.fillStyle = CORES.violeta;
  g.fillText('DEFESA', LARGURA / 2, 94);
  g.fillStyle = '#ddd6fe';
  g.fillText('AURORA', LARGURA / 2, 140);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = CORES.auroraAzul;
  g.fillText('GUARDIÕES DO GELO', LARGURA / 2, 190);

  g.fillStyle = CORES.violeta;
  g.fillRect(64, 214, 352, 2);
  g.fillStyle = 'rgba(196,181,253,0.5)';
  g.fillRect(64, 220, 352, 1);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = '#e2e8f0';
  g.fillText('AVES FANTASMAS SE DIVIDEM E MERGULHAM.', LARGURA / 2, 240);
  g.fillText('PROTEJA A BASE E ENFRENTE A CORUJA A CADA 5 ONDAS.', LARGURA / 2, 258);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = CORES.violetaClaro;
  g.fillText('◄ ► / A D: MOVER', LARGURA / 2, 300);
  g.fillText('ESPAÇO / A: ATIRAR', LARGURA / 2, 318);
  g.fillText('P: PAUSA  •  R: REINICIAR  •  M: SOM  •  ESC: HUB', LARGURA / 2, 336);

  g.fillStyle = CORES.amarelo;
  g.font = '8px "Press Start 2P", monospace';
  g.fillText(`RECORDE: ${Math.floor(recorde).toString().padStart(6, '0')}`, LARGURA / 2, 378);

  g.globalAlpha = 0.6 + Math.sin(tempo * 3.2) * 0.35;
  g.font = '10px "Press Start 2P", monospace';
  g.fillStyle = '#ffffff';
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 426);
  g.globalAlpha = 1;

  g.fillStyle = CORES.violeta;
  g.fillRect(64, 468, 352, 1);
  g.font = '5px "Press Start 2P", monospace';
  g.fillStyle = '#94a3b8';
  g.fillText('OUÇA O CHAMADO DA AURORA BOREAL', LARGURA / 2, 482);

  g.restore();
}

export function desenharTransicao(
  g: CanvasRenderingContext2D,
  onda: number,
  bonus: number,
  restante: number,
  tempo: number
): void {
  g.save();
  g.fillStyle = 'rgba(3,2,12,0.76)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '18px "Press Start 2P", monospace';
  g.fillStyle = CORES.violetaClaro;
  g.fillText(`ONDA ${onda} CONCLUÍDA`, LARGURA / 2, 190);

  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = CORES.verde;
  g.fillText('BASE PROTEGIDA', LARGURA / 2, 230);

  g.fillStyle = 'rgba(30,27,75,0.86)';
  g.fillRect(80, 272, 320, 104);
  g.strokeStyle = CORES.violeta;
  g.lineWidth = 2;
  g.strokeRect(80, 272, 320, 104);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = CORES.amarelo;
  g.fillText(`BÔNUS: +${Math.floor(bonus)}`, LARGURA / 2, 298);
  g.fillStyle = '#e2e8f0';
  g.fillText(`CANHÕES RESERVAS: ${Math.floor(bonus / 100)}`, LARGURA / 2, 324);
  g.fillStyle = CORES.ciano;
  g.fillText(`PRÓXIMA ONDA EM ${Math.max(0, Math.ceil(restante))}`, LARGURA / 2, 350);

  g.globalAlpha = 0.55 + Math.sin(tempo * 4) * 0.25;
  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = '#ffffff';
  g.fillText('PREPARE O CANHÃO', LARGURA / 2, 410);
  g.globalAlpha = 1;

  g.restore();
}

export function desenharAvisoChefe(
  g: CanvasRenderingContext2D,
  onda: number,
  tempo: number
): void {
  g.save();
  const pulso = 0.55 + Math.sin(tempo * 7) * 0.35;

  g.fillStyle = 'rgba(3,2,12,0.7)';
  g.fillRect(0, HUD_ALTURA + 56, LARGURA, 108);
  g.strokeStyle = CORES.vermelho;
  g.lineWidth = 2;
  g.strokeRect(44, HUD_ALTURA + 64, LARGURA - 88, 88);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.globalAlpha = pulso;
  g.font = '18px "Press Start 2P", monospace';
  g.fillStyle = CORES.vermelho;
  g.fillText('ALERTA', LARGURA / 2, HUD_ALTURA + 76);

  g.globalAlpha = 1;
  g.font = '10px "Press Start 2P", monospace';
  g.fillStyle = '#f0abfc';
  g.fillText('CORUJA GIGANTE', LARGURA / 2, HUD_ALTURA + 108);
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#e2e8f0';
  g.fillText(`ONDA ${onda} • PREPARE-SE`, LARGURA / 2, HUD_ALTURA + 132);

  g.restore();
}
