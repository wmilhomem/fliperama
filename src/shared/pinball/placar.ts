/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Painel de placar de pinball: visores de 6 dígitos em display de 7 segmentos,
 * lâmpadas (TILT, GAME OVER, BOLA SALVA...) e indicador de bola.
 *
 * O painel ocupa a faixa de cima do gabinete (96 px). A linha 1 (0..40) é
 * desenhada pela mesa (vidro traseiro); a linha 2 (40..96) é o placar.
 */

import { DefinicaoMesa, EstadoMesa } from './tipos';

/** Máscara de 7 segmentos (a,b,c,d,e,f,g). */
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

/** Tamanho do dígito de 7 segmentos. */
const DIGITO_LARGURA = 14;
const DIGITO_ALTURA = 24;
const DIGITO_ESPACO = 4;

/** Tamanho mínimo de fonte do painel (legibilidade). */
export const FONTE_PAINEL = 12;

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
  corAtivo: string,
  corInativo: string
): void {
  const mascara = SEGMENTOS[digito] ?? 0;
  const w = DIGITO_LARGURA;
  const h = DIGITO_ALTURA;
  const t = 3;
  const meia = 7;

  const segmentos: Array<[number, number, number, number]> = [
    [t, 0, w - 2 * t, t], // superior
    [t, Math.floor((h - t) / 2), w - 2 * t, t], // meio
    [t, h - t, w - 2 * t, t], // inferior
    [0, t, t, meia], // superior esquerda
    [w - t, t, t, meia], // superior direita
    [0, h - t - meia, t, meia], // inferior esquerda
    [w - t, h - t - meia, t, meia], // inferior direita
  ];

  for (let i = 0; i < segmentos.length; i++) {
    const [sx, sy, sw, sh] = segmentos[i];
    g.fillStyle = mascara & (1 << i) ? corAtivo : corInativo;
    g.fillRect(Math.round(x + sx), Math.round(y + sy), sw, sh);
  }
}

/** Desenha um visor completo de 6 dígitos com o rótulo acima. */
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
  g.textBaseline = 'top';
  g.font = `${FONTE_PAINEL}px "Press Start 2P", monospace`;
  g.fillStyle = corRotulo;
  g.fillText(rotulo, x, y);

  const digitos = formatarSeisDigitos(valor);
  const inicioY = y + FONTE_PAINEL + 4;
  for (let i = 0; i < digitos.length; i++) {
    desenharDigito(
      g,
      digitos[i],
      x + i * (DIGITO_LARGURA + DIGITO_ESPACO),
      inicioY,
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

  // Visores na linha 2 do painel (y = 40..96)
  tabela.visores.forEach((visor, indice) => {
    const id = visor.id in valores ? visor.id : `visor${indice}`;
    const valor = valores[id] ?? 0;
    const x = 12 + visor.coluna * 124;
    const y = 42;

    // Carcaça do visor
    g.fillStyle = 'rgba(6, 2, 16, 0.9)';
    g.fillRect(x - 6, y - 4, 114, 50);
    g.strokeStyle = 'rgba(236, 72, 153, 0.45)';
    g.lineWidth = 1;
    g.strokeRect(x - 5.5, y - 3.5, 113, 49);

    desenharVisor(
      g,
      valor,
      x,
      y,
      textosVisor[id] ?? visor.rotulo,
      '#FFD166',
      'rgba(120, 86, 170, 0.25)',
      '#F5D0FE'
    );
  });

  // Bloco BOLA / BÔNUS
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.font = `${FONTE_PAINEL}px "Press Start 2P", monospace`;
  g.fillStyle = '#F5D0FE';
  g.fillText(`BOLA ${estado.bolaAtual}/${estado.bolasPorPartida}`, 268, 44);
  g.fillStyle = '#FFD166';
  g.fillText(`BÔNUS x${estado.multiplicador}`, 268, 70);

  const totalBolas = Math.max(estado.bolasPorPartida, estado.bolasRestantes);
  for (let i = 0; i < totalBolas; i++) {
    const bx = 272 + i * 16;
    const by = 86;
    const viva = i < estado.bolasRestantes;
    g.fillStyle = viva ? '#22D3EE' : 'rgba(120, 86, 170, 0.25)';
    g.beginPath();
    g.arc(bx, by, 5, 0, Math.PI * 2);
    g.fill();
  }

  // Lâmpadas do painel
  g.textAlign = 'center';
  g.textBaseline = 'top';
  for (const luz of tabela.luzes) {
    const acesa = estado.luzes[luz.id] === true;
    const cor = acesa ? '#FFD166' : 'rgba(120, 86, 170, 0.28)';

    // Ícone bem visível (lâmpada com moldura)
    g.fillStyle = acesa ? 'rgba(255, 209, 102, 0.22)' : 'rgba(40, 12, 70, 0.85)';
    g.beginPath();
    g.arc(luz.x, luz.y, 9, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = cor;
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = cor;
    g.beginPath();
    g.arc(luz.x, luz.y, 5, 0, Math.PI * 2);
    g.fill();

    if (acesa) {
      g.globalAlpha = 0.25 + Math.sin(tempo * 8) * 0.15;
      g.beginPath();
      g.arc(luz.x, luz.y, 14, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }

    g.font = `${FONTE_PAINEL}px "Press Start 2P", monospace`;
    g.fillStyle = acesa ? '#FFE9A8' : 'rgba(200, 180, 220, 0.6)';
    g.fillText(luz.rotulo, luz.x, luz.y + 12);
  }
}
