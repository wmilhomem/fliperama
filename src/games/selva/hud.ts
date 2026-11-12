/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, LARGURA, TOTAL_TELAS, TOTAL_TESOUROS } from './constantes';
import { Camada } from './tipos';

export interface DadosHUD {
  pontuacao: number;
  recorde: number;
  vidas: number;
  tempo: number;
  tesouros: number;
  tela: number;
  camada: Camada;
}

export interface DadosResultado {
  vitoria: boolean;
  pontuacao: number;
  recorde: number;
  tesouros: number;
  tempo: number;
  bonus: number;
}

export function formatarTempo(segundos: number): string {
  const total = Math.max(0, Math.ceil(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos.toString().padStart(2, '0')}:${resto.toString().padStart(2, '0')}`;
}

export function desenharHUD(
  g: CanvasRenderingContext2D,
  dados: DadosHUD
): void {
  g.save();
  g.fillStyle = 'rgba(4, 20, 13, 0.96)';
  g.fillRect(0, 0, LARGURA, 48);
  g.fillStyle = '#14532D';
  g.fillRect(0, 46, LARGURA, 2);
  g.fillStyle = '#4ADE80';
  g.fillRect(0, 47, LARGURA, 1);

  g.font = '7px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.textBaseline = 'top';

  g.fillStyle = '#86EFAC';
  g.fillText('PONTOS', 12, 6);
  g.fillStyle = '#FEF9C3';
  g.font = '9px "Press Start 2P", monospace';
  g.fillText(Math.floor(dados.pontuacao).toString().padStart(6, '0'), 12, 18);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('REC', 112, 6);
  g.fillStyle = '#FDE047';
  g.font = '9px "Press Start 2P", monospace';
  g.fillText(Math.floor(dados.recorde).toString().padStart(6, '0'), 112, 18);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('TEMPO', 204, 6);
  g.fillStyle = dados.tempo <= 60 ? '#F87171' : '#FFFFFF';
  g.font = '9px "Press Start 2P", monospace';
  g.fillText(formatarTempo(dados.tempo), 204, 18);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('TESOUROS', 296, 6);
  g.fillStyle = '#67E8F9';
  g.font = '9px "Press Start 2P", monospace';
  g.fillText(`${dados.tesouros}/${TOTAL_TESOUROS}`, 304, 18);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('VIDAS', 408, 6);
  desenharVidas(g, dados.vidas);

  g.fillStyle = dados.camada === 'subsolo' ? '#22D3EE' : '#4ADE80';
  g.fillRect(12, 38, 3, 3);
  g.fillStyle = '#BBF7D0';
  g.font = '7px "Press Start 2P", monospace';
  g.fillText(
    `${dados.camada === 'subsolo' ? 'SUBTERRÂNEO' : 'SUPERFÍCIE'}  •  TELA ${(
      dados.tela + 1
    )
      .toString()
      .padStart(3, '0')}/${TOTAL_TELAS}`,
    19,
    37
  );

  const progresso = Math.max(0, Math.min(1, (dados.tela + 1) / TOTAL_TELAS));
  const barraY = ALTURA - 8;
  g.fillStyle = '#052E16';
  g.fillRect(0, barraY, LARGURA, 6);
  g.fillStyle = '#166534';
  g.fillRect(0, barraY + 1, LARGURA, 2);
  g.fillStyle = '#4ADE80';
  g.fillRect(0, barraY + 1, Math.floor(progresso * LARGURA), 2);
  g.fillStyle = '#FACC15';
  g.fillRect(Math.max(0, Math.floor(progresso * LARGURA) - 2), barraY, 2, 6);

  g.restore();
}

function desenharVidas(g: CanvasRenderingContext2D, vidas: number): void {
  for (let i = 0; i < vidas; i++) {
    const x = 410 + i * 17;
    const y = 19;
    g.fillStyle = '#FACC15';
    g.fillRect(x + 2, y, 9, 4);
    g.fillStyle = '#B45309';
    g.fillRect(x, y + 4, 13, 3);
    g.fillStyle = '#FEF08A';
    g.fillRect(x + 4, y + 1, 3, 2);
  }
}

export function desenharTituloSelva(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  g.save();
  const pulso = 0.55 + Math.sin(tempo * 3) * 0.25;

  g.fillStyle = 'rgba(3, 12, 7, 0.78)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.fillStyle = 'rgba(250, 204, 21, 0.08)';
  g.fillRect(24, 92, 432, 368);
  g.strokeStyle = '#4ADE80';
  g.lineWidth = 2;
  g.strokeRect(24, 92, 432, 368);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '42px "Press Start 2P", monospace';
  g.fillStyle = '#FACC15';
  g.fillText('SELVA', 240, 136);
  g.font = '18px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('DO OURO PERDIDO', 240, 194);

  g.fillStyle = '#4ADE80';
  g.fillRect(54, 228, 372, 2);

  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = '#E2E8F0';
  g.fillText('ENCONTRE OS 32 TESOUROS EM 20 MINUTOS', 240, 250);
  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  g.fillText('SETAS / A-D: ANDAR  •  CIMA-BAIXO: ESCADAS', 240, 278);
  g.fillText('ESPAÇO / Z: PULAR  •  SOLTAR O CIPÓ', 240, 296);

  g.fillStyle = '#FDE047';
  g.fillText(`RECORDE: ${Math.floor(recorde).toString().padStart(6, '0')}`, 240, 332);

  g.globalAlpha = pulso;
  g.font = '11px "Press Start 2P", monospace';
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', 240, 378);
  g.globalAlpha = 1;

  g.fillStyle = '#4ADE80';
  g.fillRect(54, 414, 372, 1);
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  M: SOM  •  ESC: HUB', 240, 430);

  g.restore();
}

export function desenharResultado(
  g: CanvasRenderingContext2D,
  dados: DadosResultado,
  tempo: number
): void {
  g.save();
  const pulso = 0.55 + Math.sin(tempo * 3) * 0.25;

  g.fillStyle = 'rgba(3, 12, 7, 0.84)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '22px "Press Start 2P", monospace';
  g.fillStyle = dados.vitoria ? '#FACC15' : '#F87171';
  g.fillText(dados.vitoria ? 'TESOURO COMPLETO!' : 'FIM DA EXPEDIÇÃO', 240, 96);

  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText(
    dados.vitoria ? 'VOCÊ ENCONTROU O OURO PERDIDO' : 'A SELVA VENCEU ESTA JORNADA',
    240,
    132
  );

  g.fillStyle = 'rgba(20, 83, 45, 0.7)';
  g.fillRect(58, 166, 364, 210);
  g.strokeStyle = '#4ADE80';
  g.lineWidth = 2;
  g.strokeRect(58, 166, 364, 210);

  g.font = '10px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#E2E8F0';
  g.fillText(`PONTUAÇÃO: ${Math.floor(dados.pontuacao).toString().padStart(6, '0')}`, 88, 194);
  g.fillText(`RECORDE:   ${Math.floor(dados.recorde).toString().padStart(6, '0')}`, 88, 224);
  g.fillText(`TESOUROS:  ${dados.tesouros}/${TOTAL_TESOUROS}`, 88, 254);
  g.fillText(`TEMPO:     ${formatarTempo(dados.tempo)}`, 88, 284);

  if (dados.bonus > 0) {
    g.fillStyle = '#FDE047';
    g.fillText(`BÔNUS:     +${dados.bonus}`, 88, 314);
  }

  g.textAlign = 'center';
  g.font = '10px "Press Start 2P", monospace';
  g.globalAlpha = pulso;
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', 240, 404);
  g.globalAlpha = 1;

  g.fillStyle = '#4ADE80';
  g.fillRect(54, 442, 372, 1);
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  ESC: HUB', 240, 458);

  g.restore();
}
