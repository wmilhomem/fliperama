/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel de placar de pinball: visores de 6 dígitos em display de 7 segmentos,
 * lâmpadas (TILT, GAME OVER, RECORDE...) e indicador de bola.
 */

import { DefinicaoMesa, EstadoMesa } from './tipos';

const SEGMENTOS: Record<string, number> = {
  '0': 0b0111111,
  '1': 0b0000110,
  '2': 0b1011011,
  '3': 0b1001111,
  '4': 0b1100110,
  '5': 0b1101101,
  '6': 0b1111101,
  '7': 0b0000111,
  '8': 0b1111111,
  '9': 0b1101111,
  '-': 0b1000000,
  ' ': 0b0000000,
};

/** Converte um número em string de 6 dígitos com zeros à esquerda. */
export function formatarSeisDigitos(valor: number): string {
  const inteiro = Math.max(0, Math.floor(valor));
  return inteiro.toString().padStart(6, '0').slice(-6);
}

/** Desenha um dígito de 7 segmentos. */
export function desenharDigito(
  g: CanvasRenderingContext2D,
  digito: string,
  x: number,
  y: number,
  largura: number,
  altura: number,
  corAtivo: string,
  corInativo: string
): void {
  const mascara = SEGMENTOS[digito] ?? 0;
  const espessura = 2;
  const vertical = Math.max(2, Math.floor((altura - espessura * 3) / 2));
  const meiaLargura = largura - espessura;

  const segmentos: Array<[number, number, number, number]> = [
    // horizontais: superior, meio, inferior
    [espessura, 0, meiaLargura, espessura],
    [espessura, Math.floor((altura - espessura) / 2), meiaLargura, espessura],
    [espessura, altura - espessura, meiaLargura, espessura],
    // verticais: superior esquerda, superior direita, inferior esquerda, inferior direita
    [0, espessura, espessura, vertical],
    [largura - espessura, espessura, espessura, vertical],
    [0, altura - espessura - vertical, espessura, vertical],
    [largura - espessura, altura - espessura - vertical, espessura, vertical],
  ];

  for (let i = 0; i < segmentos.length; i++) {
    const [sx, sy, sw, sh] = segmentos[i];
    g.fillStyle = mascara & (1 << i) ? corAtivo : corInativo;
    g.fillRect(Math.round(x + sx), Math.round(y + sy), sw, sh);
  }
}

/** Desenha um visor completo de 6 dígitos. */
export function desenharVisor(
  g: CanvasRenderingContext2D,
  valor: number,
  x: number,
  y: number,
  rotulo: string,
  corAtivo: string,
  corInativo: string,
  corRotulo: string
): void {
  g.save();
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = corRotulo;
  g.fillText(rotulo, x, y);

  const digitos = formatarSeisDigitos(valor);
  const larguraDigito = 9;
  const espaco = 2;
  const inicioY = y + 4;
  for (let i = 0; i < digitos.length; i++) {
    desenharDigito(
      g,
      digitos[i],
      x + i * (larguraDigito + espaco),
      inicioY,
      larguraDigito,
      16,
      corAtivo,
      corInativo
    );
  }
  g.restore();
}

/** Desenha o painel de placar completo (visores + lâmpadas + bola). */
export function desenharPlacar(
  g: CanvasRenderingContext2D,
  tabela: DefinicaoMesa,
  estado: EstadoMesa,
  tempo: number
): void {
  const largura = tabela.largura;

  const colunaVisor = 12;
  const linhaVisor = 40;
  const larguraColuna = 92;

  const valores: Record<string, number> = {
    jogador1: estado.pontuacao,
    recorde: estado.recorde,
    bonus: estado.bonusAnimado,
    multiplicador: estado.multiplicador,
  };

  const textosVisor: Record<string, string> = {
    jogador1: 'JOGADOR 1',
    recorde: 'RECORDE',
    bonus: 'BÔNUS',
    multiplicador: 'MULTIPL.',
  };

  tabela.visores.forEach((visor, indice) => {
    const id = visor.id in valores ? visor.id : `visor${indice}`;
    const valor = valores[id] ?? 0;
    const x = colunaVisor + visor.coluna * larguraColuna;
    const y = 8 + visor.linha * linhaVisor;

    // Carcaça do visor
    g.fillStyle = 'rgba(6, 2, 16, 0.88)';
    g.fillRect(x - 5, y - 7, 76, 32);
    g.strokeStyle = 'rgba(236, 72, 153, 0.35)';
    g.lineWidth = 1;
    g.strokeRect(x - 4.5, y - 6.5, 75, 31);

    desenharVisor(
      g,
      valor,
      x,
      y,
      textosVisor[id] ?? visor.rotulo,
      '#FFD166',
      'rgba(120, 86, 170, 0.22)',
      '#F5D0FE'
    );
  });

  // Lâmpadas do painel
  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '5px "Press Start 2P", monospace';
  for (const luz of tabela.luzes) {
    const acesa = estado.luzes[luz.id] === true;
    const cor = acesa ? '#FFD166' : 'rgba(120, 86, 170, 0.25)';
    g.fillStyle = cor;
    g.beginPath();
    g.arc(luz.x, luz.y, 4, 0, Math.PI * 2);
    g.fill();
    if (acesa) {
      g.globalAlpha = 0.25 + Math.sin(tempo * 8) * 0.15;
      g.beginPath();
      g.arc(luz.x, luz.y, 7, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }
    g.fillStyle = acesa ? '#FFE9A8' : 'rgba(200, 180, 220, 0.5)';
    g.fillText(luz.rotulo, luz.x, luz.y + 7);
  }

  // Indicador de bola
  const bolaX = 420;
  const bolaY = 14;
  g.textAlign = 'center';
  g.textBaseline = 'top';
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#F5D0FE';
  g.fillText('BOLA', bolaX, bolaY - 4);
  g.fillStyle = '#FFD166';
  g.fillText(`${estado.bolaAtual}/${estado.bolasPorPartida}`, bolaX, bolaY + 8);

  const totalBolas = Math.max(estado.bolasPorPartida, estado.bolasRestantes);
  for (let i = 0; i < totalBolas; i++) {
    const bx = bolaX - (totalBolas - 1) * 6 + i * 12;
    const by = bolaY + 30;
    const viva = i < estado.bolasRestantes;
    g.fillStyle = viva ? '#22D3EE' : 'rgba(120, 86, 170, 0.25)';
    g.beginPath();
    g.arc(bx, by, 4, 0, Math.PI * 2);
    g.fill();
  }

  g.restore();
}
