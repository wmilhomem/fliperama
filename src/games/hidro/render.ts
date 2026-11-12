/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA,
  ALERTA_COMBUSTIVEL,
  FUEL_MAX,
  FUEL_TANQUE,
  LARGURA,
  Y_NAVE,
} from './constantes';
import { distanciaNaTela, obterAmostra, obterFaixasNavegaveis, telaY } from './rio';
import { TAU, clamp } from './semente';
import {
  Barreira,
  Decoracao,
  Inimigo,
  Nave,
  Obstaculo,
  Particula,
  SecaoRio,
  Tanque,
  Tiro,
} from './tipos';

const FONTE = '"Press Start 2P", monospace';

function corAgua(d: number, tempo: number): string {
  return (Math.floor(d / 12) + Math.floor(tempo * 2.5)) % 2 === 0 ? '#0B6E88' : '#0A6380';
}

export function desenharRio(
  g: CanvasRenderingContext2D,
  secao: SecaoRio,
  progresso: number,
  tempo: number
): void {
  g.fillStyle = '#052E1D';
  g.fillRect(0, 0, LARGURA, ALTURA);

  for (let y = 0; y < ALTURA; y += 2) {
    const d = distanciaNaTela(y, progresso);
    const amostra = obterAmostra(secao, d);
    const esquerda = Math.floor(amostra.esquerda);
    const direita = Math.ceil(amostra.direita);

    g.fillStyle = '#8F7B4F';
    g.fillRect(esquerda - 2, y, 2, 2);
    g.fillRect(direita, y, 2, 2);

    g.fillStyle = corAgua(d, tempo);
    g.fillRect(esquerda, y, Math.max(0, direita - esquerda), 2);

    g.fillStyle = 'rgba(165, 243, 252, 0.34)';
    g.fillRect(esquerda, y, 1, 2);
    g.fillRect(direita - 1, y, 1, 2);

    if (amostra.ilhaLargura > 0.5) {
      const ilhaEsquerda = Math.floor(amostra.centro - amostra.ilhaLargura / 2);
      const ilhaDireita = Math.ceil(amostra.centro + amostra.ilhaLargura / 2);

      g.fillStyle = '#8F7B4F';
      g.fillRect(ilhaEsquerda - 1, y, 1, 2);
      g.fillRect(ilhaDireita, y, 1, 2);

      g.fillStyle = '#0A4A2D';
      g.fillRect(ilhaEsquerda, y, Math.max(1, ilhaDireita - ilhaEsquerda), 2);

      g.fillStyle = '#137A48';
      if (Math.floor(d / 8) % 3 === 0) {
        g.fillRect(ilhaEsquerda + 1, y, 2, 1);
      }
    }
  }

  desenharOndas(g, secao, progresso, tempo);
}

function desenharOndas(
  g: CanvasRenderingContext2D,
  secao: SecaoRio,
  progresso: number,
  tempo: number
): void {
  g.lineWidth = 1;

  for (let i = 0; i < 30; i++) {
    const y = (i * 43 + progresso * 0.85 + tempo * 16) % ALTURA;
    const d = distanciaNaTela(y, progresso);
    const faixas = obterFaixasNavegaveis(secao, d, 3);

    if (faixas.length === 0) continue;

    const faixa = faixas[i % faixas.length];
    const largura = Math.max(1, faixa[1] - faixa[0]);
    const x = faixa[0] + ((i * 31) % largura);
    const comprimento = 2 + (i % 3);

    g.strokeStyle = i % 4 === 0 ? 'rgba(186, 230, 253, 0.6)' : 'rgba(103, 232, 249, 0.28)';
    g.beginPath();
    g.moveTo(x, Math.floor(y));
    g.lineTo(Math.min(x + comprimento, faixa[1]), Math.floor(y));
    g.stroke();
  }
}

export function desenharDecoracoes(
  g: CanvasRenderingContext2D,
  decoracoes: Decoracao[],
  progresso: number
): void {
  for (const decoracao of decoracoes) {
    const y = telaY(decoracao.d, progresso);
    if (y < -14 || y > ALTURA + 12) continue;

    const x = Math.floor(decoracao.x);
    const yy = Math.floor(y);
    const variacao = decoracao.variacao;

    if (decoracao.tipo === 'arvore') {
      g.fillStyle = '#3F2A16';
      g.fillRect(x, yy - 2, 1, 8);

      g.fillStyle = '#0A4A2D';
      g.fillRect(x - 3, yy - 7, 7, 6);
      g.fillStyle = '#137A48';
      g.fillRect(x - 2, yy - 8, 5, 3);
      g.fillStyle = '#22C55E';
      g.fillRect(x - 1 + (variacao > 0.5 ? 1 : 0), yy - 7, 2, 2);
      continue;
    }

    if (decoracao.tipo === 'palafita') {
      g.fillStyle = '#4B2E16';
      g.fillRect(x, yy, 1, 8);
      g.fillRect(x + 7, yy, 1, 8);

      g.fillStyle = '#B45309';
      g.fillRect(x - 1, yy - 5, 10, 5);
      g.fillStyle = '#F59E0B';
      g.fillRect(x, yy - 7, 8, 2);
      g.fillStyle = '#7C2D12';
      g.fillRect(x + 2, yy - 3, 2, 3);
      g.fillStyle = '#FDE68A';
      g.fillRect(x + 5, yy - 4, 2, 2);
      continue;
    }

    if (decoracao.tipo === 'pedra') {
      g.fillStyle = '#64748B';
      g.fillRect(x - 2, yy - 1, 5, 3);
      g.fillStyle = '#94A3B8';
      g.fillRect(x - 1, yy - 2, 3, 2);
      continue;
    }

    g.fillStyle = '#065F33';
    g.fillRect(x - 2, yy - 2, 5, 3);
    g.fillStyle = '#10B981';
    g.fillRect(x - 1, yy - 3, 2, 2);
  }
}

export function desenharNave(
  g: CanvasRenderingContext2D,
  nave: Nave,
  tempo: number,
  visivel: boolean
): void {
  if (!visivel) return;

  if (nave.invulneravel > 0 && Math.floor(tempo * 11) % 2 === 0) return;

  g.save();
  g.translate(Math.floor(nave.x), Math.floor(nave.y));
  g.rotate(nave.inclinacao);

  const intensidade = nave.acelerando ? 1.5 : nave.desacelerando ? 0.6 : 1;
  const onda = Math.sin(tempo * 9) * 1.5;

  g.globalAlpha = 0.28;
  g.fillStyle = '#E0F2FE';
  g.beginPath();
  g.moveTo(-5, 6);
  g.lineTo(5, 6);
  g.lineTo(11 + onda, 18 * intensidade);
  g.lineTo(-11 - onda, 18 * intensidade);
  g.closePath();
  g.fill();

  g.globalAlpha = 0.55;
  g.fillStyle = '#67E8F9';
  g.fillRect(-8, 5, 2, 3);
  g.fillRect(6, 5, 2, 3);
  g.globalAlpha = 1;

  g.fillStyle = '#0891B2';
  g.beginPath();
  g.moveTo(0, -11);
  g.lineTo(5, -3);
  g.lineTo(4, 8);
  g.lineTo(0, 11);
  g.lineTo(-4, 8);
  g.lineTo(-5, -3);
  g.closePath();
  g.fill();

  g.strokeStyle = '#E0F2FE';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, -11);
  g.lineTo(5, -3);
  g.lineTo(4, 8);
  g.lineTo(0, 11);
  g.lineTo(-4, 8);
  g.lineTo(-5, -3);
  g.closePath();
  g.stroke();

  g.fillStyle = '#22D3EE';
  g.fillRect(-3, -6, 6, 8);
  g.fillStyle = '#A5F3FC';
  g.fillRect(-1, -5, 2, 5);

  g.fillStyle = '#F59E0B';
  g.fillRect(-4, 8, 2, 3);
  g.fillRect(2, 8, 2, 3);

  g.restore();
}

export function desenharTiros(g: CanvasRenderingContext2D, tiros: Tiro[]): void {
  for (const tiro of tiros) {
    if (tiro.origem === 'jogador') {
      g.strokeStyle = '#A5F3FC';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(tiro.x, tiro.y + 5);
      g.lineTo(tiro.x, tiro.y - 3);
      g.stroke();
      g.fillStyle = '#F0F9FF';
      g.fillRect(tiro.x - 1, tiro.y - 4, 2, 3);
    } else {
      g.fillStyle = '#FB923C';
      g.beginPath();
      g.arc(tiro.x, tiro.y, tiro.raio + 1.4, 0, TAU);
      g.fill();
      g.fillStyle = '#FEF3C7';
      g.fillRect(tiro.x - 1, tiro.y - 1, 2, 2);
    }
  }
}

export function desenharInimigos(
  g: CanvasRenderingContext2D,
  inimigos: Inimigo[],
  tempo: number
): void {
  for (const inimigo of inimigos) {
    g.save();
    g.translate(Math.floor(inimigo.x), Math.floor(inimigo.y));

    if (inimigo.tipo === 'lancha') {
      g.fillStyle = 'rgba(224, 242, 254, 0.38)';
      g.beginPath();
      g.moveTo(-4, 4);
      g.lineTo(4, 4);
      g.lineTo(7, 12);
      g.lineTo(-7, 12);
      g.closePath();
      g.fill();

      g.fillStyle = '#B91C1C';
      g.beginPath();
      g.moveTo(0, 10);
      g.lineTo(5, 2);
      g.lineTo(4, -5);
      g.lineTo(-4, -5);
      g.lineTo(-5, 2);
      g.closePath();
      g.fill();

      g.fillStyle = '#FEF2F2';
      g.fillRect(-2, -2, 4, 3);
      g.fillStyle = '#111827';
      g.fillRect(-1, -1, 2, 2);
    } else if (inimigo.tipo === 'patrulha') {
      g.fillStyle = '#475569';
      g.beginPath();
      g.moveTo(0, 11);
      g.lineTo(7, 2);
      g.lineTo(6, -6);
      g.lineTo(-6, -6);
      g.lineTo(-7, 2);
      g.closePath();
      g.fill();

      g.fillStyle = '#94A3B8';
      g.fillRect(-4, -4, 8, 5);
      g.fillStyle = '#1E293B';
      g.fillRect(-1, 4, 2, 5);
      g.fillStyle = '#EF4444';
      g.fillRect(-6, 1, 2, 2);

      if (inimigo.hp > 1) {
        g.fillStyle = '#FACC15';
        g.fillRect(6, -8, 2, 2);
      }
    } else if (inimigo.tipo === 'helicoptero') {
      g.fillStyle = 'rgba(15, 23, 42, 0.28)';
      g.fillRect(-6, 8, 13, 3);

      g.fillStyle = '#334155';
      g.beginPath();
      g.ellipse(0, 1, 5, 7, 0, 0, TAU);
      g.fill();

      g.fillStyle = '#64748B';
      g.fillRect(-1, -9, 2, 7);
      g.fillStyle = '#CBD5E1';
      g.fillRect(-1, -1, 3, 3);
      g.fillStyle = '#EF4444';
      g.fillRect(-1, 6, 2, 2);

      g.strokeStyle = '#E2E8F0';
      g.lineWidth = 1;
      const rotor = Math.sin(tempo * 30 + inimigo.fase) * 7;
      g.beginPath();
      g.moveTo(-9, -8);
      g.lineTo(9, -8);
      g.moveTo(rotor, -12);
      g.lineTo(-rotor, -4);
      g.stroke();

      if (inimigo.hp > 1) {
        g.fillStyle = '#FACC15';
        g.fillRect(7, -3, 2, 2);
      }
    } else if (inimigo.tipo === 'drone') {
      g.fillStyle = 'rgba(239, 68, 68, 0.18)';
      g.beginPath();
      g.arc(0, 0, 10 + Math.sin(tempo * 8) * 1.5, 0, TAU);
      g.fill();

      g.fillStyle = '#7F1D1D';
      g.beginPath();
      g.moveTo(0, -7);
      g.lineTo(7, 0);
      g.lineTo(0, 7);
      g.lineTo(-7, 0);
      g.closePath();
      g.fill();

      g.fillStyle = '#EF4444';
      g.fillRect(-3, -3, 6, 6);
      g.fillStyle = Math.floor(tempo * 8) % 2 === 0 ? '#FEF08A' : '#7F1D1D';
      g.fillRect(-1, -1, 2, 2);
    } else {
      g.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      g.lineWidth = 2;
      const asa = Math.sin(tempo * 12 + inimigo.fase) * 4;
      g.beginPath();
      g.moveTo(-8, asa);
      g.lineTo(0, 0);
      g.lineTo(8, asa);
      g.stroke();
      g.fillStyle = '#F8FAFC';
      g.fillRect(-1, -2, 2, 4);
      g.fillStyle = '#F59E0B';
      g.fillRect(2, -1, 2, 1);
    }

    g.restore();
  }
}

export function desenharObstaculos(g: CanvasRenderingContext2D, obstaculos: Obstaculo[]): void {
  for (const obstaculo of obstaculos) {
    g.save();
    g.translate(Math.floor(obstaculo.x), Math.floor(obstaculo.y));
    g.rotate(obstaculo.rotacao);

    if (obstaculo.tipo === 'tronco') {
      g.fillStyle = '#78350F';
      g.fillRect(-9, -3, 18, 6);
      g.fillStyle = '#A16207';
      g.fillRect(-7, -2, 14, 2);
      g.fillStyle = '#451A03';
      g.fillRect(-9, -3, 2, 6);
      g.fillRect(7, -3, 2, 6);
      g.fillStyle = '#D6D3D1';
      g.fillRect(-9, -1, 2, 2);
      g.fillRect(7, -1, 2, 2);
    } else {
      g.fillStyle = '#475569';
      g.beginPath();
      g.moveTo(-7, 2);
      g.lineTo(-6, -4);
      g.lineTo(-1, -7);
      g.lineTo(5, -5);
      g.lineTo(8, 1);
      g.lineTo(5, 6);
      g.lineTo(-3, 6);
      g.closePath();
      g.fill();

      g.fillStyle = '#94A3B8';
      g.fillRect(-4, -4, 4, 3);
      g.fillStyle = '#334155';
      g.fillRect(1, 1, 3, 2);
    }

    g.restore();
  }
}

export function desenharTanques(
  g: CanvasRenderingContext2D,
  tanques: Tanque[],
  tempo: number
): void {
  for (const tanque of tanques) {
    const y = Math.floor(tanque.y + Math.sin(tempo * 5 + tanque.id) * 1.2);

    g.save();
    g.translate(Math.floor(tanque.x), y);

    g.fillStyle = 'rgba(250, 204, 21, 0.18)';
    g.beginPath();
    g.arc(0, 0, 11, 0, TAU);
    g.fill();

    g.fillStyle = '#FACC15';
    g.fillRect(-5, -7, 10, 13);
    g.fillStyle = '#FDE68A';
    g.fillRect(-4, -6, 3, 9);
    g.fillStyle = '#B45309';
    g.fillRect(-5, -8, 10, 2);
    g.fillRect(-5, 6, 10, 2);

    g.fillStyle = '#78350F';
    g.beginPath();
    g.moveTo(0, -4);
    g.lineTo(3, 0);
    g.lineTo(0, 4);
    g.lineTo(-3, 0);
    g.closePath();
    g.fill();

    const proporcao = clamp(tanque.restante / FUEL_TANQUE, 0, 1);
    g.fillStyle = '#0F172A';
    g.fillRect(-4, 3, 8, 2);
    g.fillStyle = proporcao > 0.35 ? '#22C55E' : '#EF4444';
    g.fillRect(-4, 3, Math.max(1, Math.round(8 * proporcao)), 2);

    g.restore();
  }
}

export function desenharBarreira(
  g: CanvasRenderingContext2D,
  barreira: Barreira,
  tempo: number
): void {
  if (barreira.y < -35 || barreira.y > 145) return;

  const x = Math.floor(barreira.x - barreira.largura / 2);
  const y = Math.floor(barreira.y - barreira.altura / 2);
  const largura = Math.max(1, Math.floor(barreira.largura));
  const altura = Math.floor(barreira.altura);

  g.fillStyle = 'rgba(0, 0, 0, 0.22)';
  g.fillRect(x + 2, y + 3, largura, altura);

  g.fillStyle = '#78350F';
  g.fillRect(x, y, largura, altura);

  g.fillStyle = '#A16207';
  g.fillRect(x, y + 2, largura, 3);
  g.fillRect(x, y + 9, largura, 3);

  g.fillStyle = '#451A03';
  for (let i = 4; i < largura; i += 13) {
    g.fillRect(x + i, y, 2, altura);
  }

  g.fillStyle = '#94A3B8';
  g.fillRect(x - 2, y - 2, 4, altura + 4);
  g.fillRect(x + largura - 2, y - 2, 4, altura + 4);

  const luz = Math.floor(tempo * 7) % 2 === 0 ? '#EF4444' : '#7F1D1D';
  g.fillStyle = luz;
  g.fillRect(x + 1, y - 1, 3, 3);
  g.fillRect(x + largura - 4, y - 1, 3, 3);

  const barraLargura = Math.min(70, largura);
  const bx = Math.floor(barreira.x - barraLargura / 2);
  const by = y - 10;

  g.fillStyle = 'rgba(15, 23, 42, 0.85)';
  g.fillRect(bx - 1, by - 1, barraLargura + 2, 5);
  g.fillStyle = '#F97316';
  g.fillRect(bx, by, Math.round(barraLargura * clamp(barreira.hp / barreira.hpMax, 0, 1)), 3);
}

export function desenharParticulas(
  g: CanvasRenderingContext2D,
  particulas: Particula[]
): void {
  for (const particula of particulas) {
    const alpha = clamp(particula.vida / particula.maxVida, 0, 1);
    g.globalAlpha = alpha;
    g.fillStyle = particula.cor;
    const tamanho = Math.max(1, Math.round(particula.tamanho * alpha));
    g.fillRect(Math.floor(particula.x), Math.floor(particula.y), tamanho, tamanho);
  }

  g.globalAlpha = 1;
}

export function desenharCombustivel(
  g: CanvasRenderingContext2D,
  combustivel: number,
  tempo: number
): void {
  const x = 9;
  const y = ALTURA - 17;
  const largura = 108;
  const altura = 8;
  const proporcao = clamp(combustivel / FUEL_MAX, 0, 1);
  const baixo = combustivel <= ALERTA_COMBUSTIVEL;
  const piscando = baixo && Math.floor(tempo * 6) % 2 === 0;

  g.font = `6px ${FONTE}`;
  g.textAlign = 'left';
  g.fillStyle = baixo ? (piscando ? '#FEF08A' : '#EF4444') : '#A5F3FC';
  g.fillText(baixo ? 'COMBUSTÍVEL BAIXO' : 'COMBUSTÍVEL', x, y - 5);

  g.fillStyle = 'rgba(2, 6, 23, 0.82)';
  g.fillRect(x - 1, y - 1, largura + 2, altura + 2);
  g.strokeStyle = baixo ? '#EF4444' : 'rgba(103, 232, 249, 0.65)';
  g.lineWidth = 1;
  g.strokeRect(x - 0.5, y - 0.5, largura + 1, altura + 1);

  if (!piscando || !baixo) {
    g.fillStyle = baixo ? '#EF4444' : proporcao < 0.5 ? '#FACC15' : '#22C55E';
    g.fillRect(x, y, Math.round(largura * proporcao), altura);
  }

  g.fillStyle = '#0F172A';
  for (let i = 1; i < 4; i++) {
    g.fillRect(x + Math.round((largura / 4) * i), y, 1, altura);
  }

  g.font = `6px ${FONTE}`;
  g.textAlign = 'right';
  g.fillStyle = baixo ? '#FCA5A5' : '#E0F2FE';
  g.fillText(`${Math.ceil(combustivel)}%`, x + largura + 39, y + 7);
  g.textAlign = 'left';
}

export function desenharTitulo(
  g: CanvasRenderingContext2D,
  recorde: number,
  tempo: number
): void {
  const pulso = 0.55 + 0.45 * Math.sin(tempo * 2.8);

  g.fillStyle = 'rgba(2, 23, 17, 0.7)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';

  g.fillStyle = '#67E8F9';
  g.shadowColor = '#06B6D4';
  g.shadowBlur = 20 * pulso;
  g.font = `bold 34px ${FONTE}`;
  g.fillText('HIDRO', LARGURA / 2, 72);

  g.fillStyle = '#22C55E';
  g.shadowColor = '#16A34A';
  g.font = `12px ${FONTE}`;
  g.fillText('RIO ABAIXO', LARGURA / 2, 94);
  g.shadowBlur = 0;

  g.strokeStyle = 'rgba(103, 232, 249, 0.45)';
  g.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const y = 108 + i * 5;
    g.beginPath();
    g.moveTo(46 + i * 8, y);
    g.lineTo(178 - i * 8, y);
    g.stroke();
  }

  g.font = `7px ${FONTE}`;
  g.fillStyle = '#E0F2FE';
  g.fillText('SETAS / WASD: DESVIAR', LARGURA / 2, 142);
  g.fillText('CIMA: ACELERAR  BAIXO: FREAR', LARGURA / 2, 156);
  g.fillText('A / ESPAÇO: ATIRAR', LARGURA / 2, 170);
  g.fillStyle = '#FDE68A';
  g.fillText('ABASTEÇA NOS TANQUES DO RIO', LARGURA / 2, 188);

  g.fillStyle = '#94A3B8';
  g.font = `7px ${FONTE}`;
  g.fillText(`RECORDE ${recorde.toLocaleString('pt-BR')}`, LARGURA / 2, 213);

  g.fillStyle = `rgba(253, 230, 138, ${0.4 + 0.6 * pulso})`;
  g.font = `7px ${FONTE}`;
  g.fillText('PRESSIONE AÇÃO', LARGURA / 2, 239);
  g.fillText('PARA COMEÇAR', LARGURA / 2, 250);

  g.textAlign = 'left';
}

export function desenharAviso(
  g: CanvasRenderingContext2D,
  titulo: string,
  subtitulo: string,
  tempo: number
): void {
  const pulso = 0.6 + 0.4 * Math.sin(tempo * 4);

  g.fillStyle = 'rgba(2, 15, 23, 0.68)';
  g.fillRect(0, 0, LARGURA, ALTURA);

  g.textAlign = 'center';
  g.font = `bold 17px ${FONTE}`;
  g.fillStyle = `rgba(103, 232, 249, ${pulso})`;
  g.shadowColor = '#06B6D4';
  g.shadowBlur = 16;
  g.fillText(titulo, LARGURA / 2, ALTURA / 2 - 8);
  g.shadowBlur = 0;

  g.font = `7px ${FONTE}`;
  g.fillStyle = '#E0F2FE';
  g.fillText(subtitulo, LARGURA / 2, ALTURA / 2 + 17);
  g.textAlign = 'left';
}

export function desenharAvisoNave(g: CanvasRenderingContext2D, tempo: number): void {
  if (Math.floor(tempo * 2) % 2 === 0) return;

  g.textAlign = 'center';
  g.font = `8px ${FONTE}`;
  g.fillStyle = '#FDE68A';
  g.fillText('PRONTO!', LARGURA / 2, Y_NAVE - 34);
  g.textAlign = 'left';
}
