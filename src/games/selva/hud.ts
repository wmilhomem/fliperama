/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  g.fillRect(0, 0, 320, 28);
  g.fillStyle = '#14532D';
  g.fillRect(0, 26, 320, 2);
  g.fillStyle = '#4ADE80';
  g.fillRect(0, 27, 320, 1);

  g.font = '6px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.textBaseline = 'top';

  g.fillStyle = '#86EFAC';
  g.fillText('PONTOS', 6, 4);
  g.fillStyle = '#FEF9C3';
  g.fillText(Math.floor(dados.pontuacao).toString().padStart(6, '0'), 6, 14);

  g.fillStyle = '#86EFAC';
  g.fillText('REC', 88, 4);
  g.fillStyle = '#FDE047';
  g.fillText(Math.floor(dados.recorde).toString().padStart(6, '0'), 88, 14);

  g.fillStyle = '#86EFAC';
  g.fillText('TEMPO', 156, 4);
  g.fillStyle = dados.tempo <= 60 ? '#F87171' : '#FFFFFF';
  g.fillText(formatarTempo(dados.tempo), 156, 14);

  g.fillStyle = '#86EFAC';
  g.fillText('TESOUROS', 216, 4);
  g.fillStyle = '#67E8F9';
  g.fillText(`${dados.tesouros}/32`, 224, 14);

  desenharVidas(g, dados.vidas);

  g.fillStyle = '#4ADE80';
  g.fillRect(6, 24, 3, 2);
  g.fillStyle = '#BBF7D0';
  g.fillText(dados.camada === 'subsolo' ? 'SUB' : 'SUP', 11, 22);

  g.fillStyle = '#052E16';
  g.fillRect(0, 220, 320, 4);
  g.fillStyle = '#166534';
  g.fillRect(0, 221, 320, 2);

  const progresso = Math.max(0, Math.min(1, (dados.tela + 1) / 120));
  g.fillStyle = '#4ADE80';
  g.fillRect(0, 221, Math.floor(progresso * 320), 2);
  g.fillStyle = '#FACC15';
  g.fillRect(Math.max(0, Math.floor(progresso * 320) - 2), 220, 2, 4);

  g.restore();
}

function desenharVidas(g: CanvasRenderingContext2D, vidas: number): void {
  for (let i = 0; i < vidas; i++) {
    const x = 292 + i * 9;
    g.fillStyle = '#FACC15';
    g.fillRect(x + 1, 12, 5, 3);
    g.fillStyle = '#B45309';
    g.fillRect(x, 15, 7, 2);
    g.fillStyle = '#FEF08A';
    g.fillRect(x + 2, 13, 2, 1);
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
  g.fillRect(0, 0, 320, 224);

  g.fillStyle = 'rgba(250, 204, 21, 0.1)';
  g.fillRect(22, 38, 276, 96);
  g.strokeStyle = '#4ADE80';
  g.lineWidth = 1;
  g.strokeRect(22, 38, 276, 96);

  g.textAlign = 'center';
  g.font = '20px "Press Start 2P", monospace';
  g.fillStyle = '#FACC15';
  g.fillText('SELVA', 160, 68);
  g.font = '12px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('DO OURO PERDIDO', 160, 88);

  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#E2E8F0';
  g.fillText('ENCONTRE OS 32 TESOUROS EM 20 MINUTOS', 160, 108);
  g.fillStyle = '#94A3B8';
  g.fillText('SETAS: ANDAR / SUBIR  •  ESPAÇO / Z: PULAR / SOLTAR', 160, 120);

  g.fillStyle = '#FDE047';
  g.fillText(`RECORDE: ${Math.floor(recorde).toString().padStart(6, '0')}`, 160, 147);

  g.globalAlpha = pulso;
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', 160, 176);
  g.globalAlpha = 1;

  g.fillStyle = '#4ADE80';
  g.fillRect(28, 200, 264, 1);
  g.fillStyle = '#86EFAC';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  M: SOM  •  ESC: HUB', 160, 207);

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
  g.fillRect(0, 0, 320, 224);

  g.textAlign = 'center';
  g.font = '15px "Press Start 2P", monospace';
  g.fillStyle = dados.vitoria ? '#FACC15' : '#F87171';
  g.fillText(dados.vitoria ? 'TESOURO COMPLETO!' : 'FIM DA EXPEDIÇÃO', 160, 48);

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText(dados.vitoria ? 'VOCÊ ENCONTROU O OURO PERDIDO' : 'A SELVA VENCEU ESTA JORNADA', 160, 66);

  g.fillStyle = 'rgba(20, 83, 45, 0.7)';
  g.fillRect(52, 82, 216, 78);
  g.strokeStyle = '#4ADE80';
  g.strokeRect(52, 82, 216, 78);

  g.font = '7px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#E2E8F0';
  g.fillText(`PONTUAÇÃO: ${Math.floor(dados.pontuacao).toString().padStart(6, '0')}`, 66, 96);
  g.fillText(`RECORDE:   ${Math.floor(dados.recorde).toString().padStart(6, '0')}`, 66, 112);
  g.fillText(`TESOUROS:  ${dados.tesouros}/32`, 66, 128);
  g.fillText(`TEMPO:     ${formatarTempo(dados.tempo)}`, 66, 144);

  if (dados.bonus > 0) {
    g.fillStyle = '#FDE047';
    g.fillText(`BÔNUS:     +${dados.bonus}`, 66, 160);
  }

  g.textAlign = 'center';
  g.globalAlpha = pulso;
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', 160, 184);
  g.globalAlpha = 1;

  g.fillStyle = '#4ADE80';
  g.fillRect(28, 198, 264, 1);
  g.fillStyle = '#86EFAC';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  ESC: HUB', 160, 207);

  g.restore();
}
