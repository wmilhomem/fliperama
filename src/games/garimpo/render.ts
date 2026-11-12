/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ESCALA } from './escala';
import { Nave, Cristal, Particula, Pirata, Rocha, Tiro, Estrela } from './tipos';
import { TAU } from './vetor';

function prepararLinha(
  g: CanvasRenderingContext2D,
  cor: string,
  largura: number,
  brilho: number
): void {
  g.strokeStyle = cor;
  g.lineWidth = largura;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.shadowColor = cor;
  g.shadowBlur = brilho;
}

function finalizarLinha(g: CanvasRenderingContext2D): void {
  g.shadowBlur = 0;
  g.shadowColor = 'transparent';
}

export function desenharFundo(
  g: CanvasRenderingContext2D,
  largura: number,
  altura: number,
  estrelas: Estrela[],
  tempo: number
): void {
  g.fillStyle = '#020617';
  g.fillRect(0, 0, largura, altura);

  for (const estrela of estrelas) {
    const brilho = 0.25 + 0.75 * Math.abs(Math.sin(tempo * estrela.velocidade + estrela.fase));
    const tamanho = estrela.velocidade > 1.6 ? 2 : 1;
    g.fillStyle = `rgba(148, 197, 255, ${brilho.toFixed(3)})`;
    g.fillRect(estrela.x, estrela.y, tamanho, tamanho);
  }
}

export function desenharNave(
  g: CanvasRenderingContext2D,
  nave: Nave,
  tempo: number,
  visivel: boolean
): void {
  if (!visivel) return;

  const piscando = nave.invulneravel > 0 && Math.floor(tempo * 10) % 2 === 0;
  if (piscando) return;

  g.save();
  g.translate(nave.x, nave.y);
  g.rotate(nave.angulo);
  g.scale(ESCALA, ESCALA);

  prepararLinha(g, '#67E8F9', 1.6, 10);

  // Casco em forma de lança
  g.beginPath();
  g.moveTo(13, 0);
  g.lineTo(-7, -6.5);
  g.lineTo(-1.5, 0);
  g.lineTo(-7, 6.5);
  g.closePath();
  g.stroke();

  // Cockpit
  prepararLinha(g, '#E0F2FE', 1.1, 6);
  g.beginPath();
  g.moveTo(6, 0);
  g.lineTo(1, -2);
  g.lineTo(-1, 0);
  g.lineTo(1, 2);
  g.closePath();
  g.stroke();

  // Chama do propulsor
  const chama = nave.acelerando ? 4 + Math.sin(tempo * 26) * 2.2 : 0;
  if (chama > 0) {
    prepararLinha(g, '#FB923C', 1.4, 12);
    g.beginPath();
    g.moveTo(-7, -3.2);
    g.lineTo(-7 - 4 - chama, 0);
    g.lineTo(-7, 3.2);
    g.stroke();
  }

  finalizarLinha(g);
  g.restore();
}

export function desenharRochas(g: CanvasRenderingContext2D, rochas: Rocha[]): void {
  for (const rocha of rochas) {
    g.save();
    g.translate(rocha.x, rocha.y);
    g.rotate(rocha.rotacao);

    prepararLinha(g, '#94A3B8', rocha.tamanho === 'grande' ? 2.4 : 1.9, 13);

    g.beginPath();
    const total = rocha.forma.length;
    for (let i = 0; i < total; i++) {
      const angulo = (i / total) * TAU;
      const raio = rocha.raio * rocha.forma[i];
      const x = Math.cos(angulo) * raio;
      const y = Math.sin(angulo) * raio;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.stroke();

    // Detalhe interno de cratera
    prepararLinha(g, '#475569', 1.3, 5);
    g.beginPath();
    g.arc(-rocha.raio * 0.22, -rocha.raio * 0.12, rocha.raio * 0.22, 0, TAU);
    g.stroke();

    finalizarLinha(g);
    g.restore();
  }
}

export function desenharTiros(g: CanvasRenderingContext2D, tiros: Tiro[]): void {
  for (const tiro of tiros) {
    const comprimento = tiro.origem === 'jogador' ? 0.035 : 0.02;
    const cor = tiro.origem === 'jogador' ? '#67E8F9' : '#F472B6';
    const brilho = tiro.origem === 'jogador' ? 16 : 12;

    prepararLinha(g, cor, tiro.origem === 'jogador' ? 2.8 : 2.3, brilho);
    g.beginPath();
    g.moveTo(tiro.x - tiro.vx * comprimento, tiro.y - tiro.vy * comprimento);
    g.lineTo(tiro.x, tiro.y);
    g.stroke();
    finalizarLinha(g);
  }
}

export function desenharCristais(
  g: CanvasRenderingContext2D,
  cristais: Cristal[],
  tempo: number
): void {
  for (const cristal of cristais) {
    const pulso = 0.65 + 0.35 * Math.sin(tempo * 7 + cristal.id);
    const raio = cristal.raio * (0.82 + 0.18 * pulso);
    const piscando = cristal.vida < 1.5 && Math.floor(tempo * 8) % 2 === 0;

    if (piscando) continue;

    g.save();
    g.translate(cristal.x, cristal.y);
    prepararLinha(g, '#FDE68A', 2.2, 16);

    g.beginPath();
    g.moveTo(0, -raio * 1.35);
    g.lineTo(raio * 0.85, 0);
    g.lineTo(0, raio * 1.35);
    g.lineTo(-raio * 0.85, 0);
    g.closePath();
    g.stroke();

    prepararLinha(g, '#FEF9C3', 1.2, 9);
    g.beginPath();
    g.moveTo(0, -raio * 0.75);
    g.lineTo(0, raio * 0.75);
    g.stroke();

    finalizarLinha(g);
    g.restore();
  }
}

export function desenharPiratas(g: CanvasRenderingContext2D, piratas: Pirata[]): void {
  for (const pirata of piratas) {
    g.save();
    g.translate(pirata.x, pirata.y);
    g.rotate(pirata.angulo);

    const raio = pirata.raio;
    prepararLinha(g, '#F472B6', pirata.tipo === 'grande' ? 2.5 : 2.1, 14);

    // Casco
    g.beginPath();
    g.moveTo(raio, 0);
    g.lineTo(-raio * 0.4, -raio * 0.8);
    g.lineTo(-raio, -raio * 0.35);
    g.lineTo(-raio * 0.7, 0);
    g.lineTo(-raio, raio * 0.35);
    g.lineTo(-raio * 0.4, raio * 0.8);
    g.closePath();
    g.stroke();

    // Cúpula
    prepararLinha(g, '#FBCFE8', 1.6, 9);
    g.beginPath();
    g.arc(raio * 0.1, 0, raio * 0.34, -Math.PI * 0.75, Math.PI * 0.75);
    g.stroke();

    finalizarLinha(g);
    g.restore();
  }
}

export function desenharParticulas(
  g: CanvasRenderingContext2D,
  particulas: Particula[]
): void {
  for (const particula of particulas) {
    const alpha = Math.max(0, particula.vida / particula.maxVida);
    g.globalAlpha = alpha;
    prepararLinha(g, particula.cor, 1.8, 9);

    const escala = particula.comprimento / (Math.hypot(particula.vx, particula.vy) || 1);
    g.beginPath();
    g.moveTo(particula.x, particula.y);
    g.lineTo(particula.x - particula.vx * escala, particula.y - particula.vy * escala);
    g.stroke();
  }

  g.globalAlpha = 1;
  finalizarLinha(g);
}

export function desenharBarraCarga(
  g: CanvasRenderingContext2D,
  largura: number,
  altura: number,
  carga: number,
  tempoDuplo: number
): void {
  const barraLargura = 144;
  const barraAltura = 7;
  const x = (largura - barraLargura) / 2;
  const y = altura - 16;
  const porcentagem = tempoDuplo > 0 ? tempoDuplo / 10 : carga;

  g.strokeStyle = 'rgba(148, 197, 255, 0.35)';
  g.lineWidth = 1.4;
  g.shadowBlur = 0;
  g.strokeRect(x - 1.5, y - 1.5, barraLargura + 3, barraAltura + 3);

  const cor = tempoDuplo > 0 ? '#F472B6' : '#67E8F9';
  const preenchido = Math.max(0, Math.min(1, porcentagem)) * barraLargura;

  g.fillStyle = cor;
  g.shadowColor = cor;
  g.shadowBlur = 8;
  g.fillRect(x, y, preenchido, barraAltura);
  g.shadowBlur = 0;

  g.font = '10px monospace';
  g.textAlign = 'center';
  g.fillStyle = tempoDuplo > 0 ? '#FBCFE8' : '#A5F3FC';
  g.fillText(tempoDuplo > 0 ? 'TIRO DUPLO' : 'CARGA', largura / 2, y - 7);
  g.textAlign = 'left';
}

export function desenharTitulo(
  g: CanvasRenderingContext2D,
  largura: number,
  altura: number,
  recorde: number,
  tempo: number
): void {
  const pulso = 0.62 + 0.38 * Math.sin(tempo * 2.4);

  g.textAlign = 'center';

  g.font = 'bold 32px monospace';
  g.fillStyle = '#67E8F9';
  g.shadowColor = '#22D3EE';
  g.shadowBlur = 26 * pulso;
  g.fillText('GARIMPO', largura / 2, altura / 2 - 28);
  g.fillText('ESTELAR', largura / 2, altura / 2 + 12);

  g.shadowBlur = 0;
  g.font = '13px monospace';
  g.fillStyle = '#A5F3FC';
  g.fillText('QUEBRE AS ROCHAS, COLETE CRISTAIS', largura / 2, altura / 2 + 48);
  g.fillText('E SOBREVIVA AO CINTURÃO', largura / 2, altura / 2 + 66);

  g.font = '13px monospace';
  g.fillStyle = `rgba(253, 230, 138, ${0.45 + 0.55 * pulso})`;
  g.fillText('PRESSIONE AÇÃO PARA COMEÇAR', largura / 2, altura - 58);

  g.fillStyle = '#94A3B8';
  g.font = '11px monospace';
  g.fillText(`RECORDE ${recorde.toLocaleString('pt-BR')}`, largura / 2, 54);
  g.font = '10px monospace';
  g.fillText('◄ ► GIRAR   ▲ ACELERAR   A ATIRAR   B SALTO', largura / 2, altura - 28);

  g.textAlign = 'left';
}

export function desenharAvisoFase(
  g: CanvasRenderingContext2D,
  largura: number,
  altura: number,
  fase: number
): void {
  g.textAlign = 'center';
  g.font = 'bold 26px monospace';
  g.fillStyle = '#67E8F9';
  g.shadowColor = '#22D3EE';
  g.shadowBlur = 22;
  g.fillText(`FASE ${fase}`, largura / 2, altura / 2);
  g.shadowBlur = 0;
  g.textAlign = 'left';
}
