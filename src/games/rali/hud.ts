/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALTURA, LARGURA } from './constantes';
import { formatarTempo } from './ciclo';
import { rotuloClima } from './clima';
import { ClimaTipo } from './tipos';

export interface DadosHUD {
  pontuacao: number;
  recorde: number;
  dia: number;
  meta: number;
  carros: number;
  tempoDia: number;
  velocidadeKmh: number;
  clima: ClimaTipo;
  noite: number;
}

export interface DadosResultado {
  dia: number;
  pontuacao: number;
  recorde: number;
  carros: number;
  meta: number;
}

function textoPontos(valor: number): string {
  return Math.floor(valor).toString().padStart(6, '0');
}

export function desenharHUD(g: CanvasRenderingContext2D, dados: DadosHUD): void {
  g.save();
  g.textBaseline = 'top';

  g.fillStyle = 'rgba(8,8,18,0.92)';
  g.fillRect(0, 0, LARGURA, 72);
  g.fillStyle = 'rgba(249,115,22,0.95)';
  g.fillRect(0, 70, LARGURA, 2);

  g.font = '6px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#FB923C';
  g.fillText('PONTOS', 10, 5);
  g.fillStyle = '#FFF7ED';
  g.font = '10px "Press Start 2P", monospace';
  g.fillText(textoPontos(dados.pontuacao), 10, 15);

  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#FB923C';
  g.fillText(`DIA ${dados.dia.toString().padStart(2, '0')}`, 132, 5);
  g.fillStyle = dados.carros >= dados.meta ? '#86EFAC' : '#FFFFFF';
  g.font = '9px "Press Start 2P", monospace';
  g.fillText(
    `${dados.carros.toString().padStart(3, '0')}/${dados.meta.toString().padStart(3, '0')}`,
    132,
    16
  );

  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#FB923C';
  g.textAlign = 'right';
  g.fillText('VELOCIDADE', LARGURA - 10, 5);
  g.fillStyle = dados.velocidadeKmh > 210 ? '#FDE047' : '#FFFFFF';
  g.font = '10px "Press Start 2P", monospace';
  g.fillText(`${Math.round(dados.velocidadeKmh).toString().padStart(3, '0')} KM/H`, LARGURA - 10, 15);

  g.textAlign = 'left';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  g.fillText(`REC ${textoPontos(dados.recorde)}`, 10, 38);

  g.fillStyle = '#94A3B8';
  g.fillText(`TEMPO ${formatarTempo(dados.tempoDia)}`, 132, 38);

  g.textAlign = 'right';
  g.fillStyle = '#94A3B8';
  g.fillText(`${rotuloClima(dados.clima)}  •  ${dados.noite > 0.45 ? 'NOITE' : 'DIA'}`, LARGURA - 10, 38);

  const progresso = Math.max(0, Math.min(1, dados.carros / Math.max(1, dados.meta)));
  g.fillStyle = '#1C1917';
  g.fillRect(10, 58, LARGURA - 20, 6);
  g.fillStyle = progresso >= 1 ? '#22C55E' : '#F97316';
  g.fillRect(10, 58, (LARGURA - 20) * progresso, 6);
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(10, 58, (LARGURA - 20) * progresso, 1);

  g.restore();
}

export function desenharTituloRali(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  g.save();
  const pulso = 0.55 + Math.sin(tempo * 3.2) * 0.25;

  g.fillStyle = 'rgba(3,7,18,0.78)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.fillStyle = 'rgba(249,115,22,0.08)';
  g.fillRect(24, 72, 432, 416);
  g.strokeStyle = '#F97316';
  g.lineWidth = 2;
  g.strokeRect(24, 72, 432, 416);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '46px "Press Start 2P", monospace';
  g.fillStyle = '#F97316';
  g.fillText('RALI', LARGURA / 2, 108);
  g.font = '15px "Press Start 2P", monospace';
  g.fillStyle = '#FED7AA';
  g.fillText('ESTRADA SEM FIM', LARGURA / 2, 168);

  g.fillStyle = '#F97316';
  g.fillRect(58, 202, 364, 2);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = '#E2E8F0';
  g.fillText('ULTRAPASSE OS CARROS, ENFRENTE CHUVA,', LARGURA / 2, 222);
  g.fillText('NEBLINA E NOITE, E CUMPRA A META DE CADA DIA.', LARGURA / 2, 240);

  g.font = '8px "Press Start 2P", monospace';
  g.fillStyle = '#FDBA74';
  g.fillText('◄ ► / A D: DESVIAR', LARGURA / 2, 278);
  g.fillText('▲ / W / ESPAÇO: ACELERAR', LARGURA / 2, 296);
  g.fillText('▼ / S: FREAR', LARGURA / 2, 314);

  g.fillStyle = '#FDE047';
  g.fillText(`RECORDE: ${textoPontos(recorde)}`, LARGURA / 2, 352);

  g.globalAlpha = pulso;
  g.font = '11px "Press Start 2P", monospace';
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 402);
  g.globalAlpha = 1;

  g.fillStyle = '#F97316';
  g.fillRect(58, 438, 364, 1);
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#FDBA74';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  M: SOM  •  ESC: HUB', LARGURA / 2, 454);

  g.restore();
}

export function desenharTransicaoDia(
  g: CanvasRenderingContext2D,
  dia: number,
  carros: number,
  meta: number,
  bonus: number,
  proximoClima: ClimaTipo,
  restante: number,
  tempo: number
): void {
  g.save();
  const pulso = 0.65 + Math.sin(tempo * 4) * 0.2;

  g.fillStyle = 'rgba(3,7,18,0.84)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '18px "Press Start 2P", monospace';
  g.fillStyle = '#F97316';
  g.fillText(`DIA ${dia} CONCLUÍDO`, LARGURA / 2, 142);

  g.font = '9px "Press Start 2P", monospace';
  g.fillStyle = '#86EFAC';
  g.fillText('META BATIDA!', LARGURA / 2, 182);

  g.fillStyle = 'rgba(28,25,23,0.82)';
  g.fillRect(58, 224, 364, 138);
  g.strokeStyle = '#F97316';
  g.lineWidth = 2;
  g.strokeRect(58, 224, 364, 138);

  g.font = '9px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#E2E8F0';
  g.fillText(`CARROS: ${carros}/${meta}`, 84, 250);
  g.fillStyle = '#FDE047';
  g.fillText(`BÔNUS:  +${bonus}`, 84, 280);
  g.fillStyle = '#FDBA74';
  g.fillText(`PRÓXIMO: ${rotuloClima(proximoClima)}`, 84, 310);

  g.textAlign = 'center';
  g.globalAlpha = pulso;
  g.fillStyle = '#FFFFFF';
  g.fillText(`DIA ${dia + 1} EM ${Math.max(1, Math.ceil(restante))}`, LARGURA / 2, 398);
  g.globalAlpha = 1;

  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  ESC: HUB', LARGURA / 2, 454);

  g.restore();
}

export function desenharResultadoFinal(
  g: CanvasRenderingContext2D,
  dados: DadosResultado,
  tempo: number
): void {
  g.save();
  const pulso = 0.55 + Math.sin(tempo * 3.2) * 0.25;

  g.fillStyle = 'rgba(3,7,18,0.86)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '20px "Press Start 2P", monospace';
  g.fillStyle = '#F87171';
  g.fillText('FIM DA ESTRADA', LARGURA / 2, 116);

  g.font = '9px "PRESS START 2P", monospace';
  g.fillStyle = '#FDBA74';
  g.fillText(`VOCÊ CHEGOU AO DIA ${dados.dia}`, LARGURA / 2, 152);

  g.fillStyle = 'rgba(28,25,23,0.82)';
  g.fillRect(58, 194, 364, 154);
  g.strokeStyle = '#F97316';
  g.lineWidth = 2;
  g.strokeRect(58, 194, 364, 154);

  g.font = '9px "Press Start 2P", monospace';
  g.textAlign = 'left';
  g.fillStyle = '#E2E8F0';
  g.fillText(`PONTUAÇÃO: ${textoPontos(dados.pontuacao)}`, 82, 220);
  g.fillText(`RECORDE:   ${textoPontos(dados.recorde)}`, 82, 250);
  g.fillText(`CARROS:    ${dados.carros}/${dados.meta}`, 82, 280);
  g.fillStyle = '#F87171';
  g.fillText('A META DO DIA NÃO FOI BATIDA', 82, 312);

  g.textAlign = 'center';
  g.globalAlpha = pulso;
  g.font = '10px "Press Start 2P", monospace';
  g.fillStyle = '#FFFFFF';
  g.fillText('PRESSIONE AÇÃO / TOQUE', LARGURA / 2, 390);
  g.globalAlpha = 1;

  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#94A3B8';
  g.fillText('P: PAUSA  •  R: REINICIAR  •  ESC: HUB', LARGURA / 2, 450);

  g.restore();
}
