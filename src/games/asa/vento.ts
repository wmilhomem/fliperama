/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * VENTO — rajadas laterais periódicas.
 * Empurram o avião; mais fortes no sertão. O HUD mostra sentido/força.
 */

export interface EstadoVento {
  ativo: boolean;
  direcao: 1 | -1; // 1 = empurra para a direita
  forca: number; // px/s de empurrão
  tempo: number; // tempo restante da rajada
  proximaEm: number; // até a próxima rajada
  acumulador: number; // relógio interno
}

export function criarEstadoVento(bioma: string): EstadoVento {
  const fatorSertao = bioma === 'sertaao' ? 1.45 : bioma === 'serra' ? 0.7 : 1;
  return {
    ativo: false,
    direcao: 1,
    forca: 120 * fatorSertao,
    tempo: 0,
    proximaEm: 2.5 + Math.random() * 2,
    acumulador: 0,
  };
}

export function atualizarVento(
  vento: EstadoVento,
  dt: number,
  bioma: string
): void {
  vento.acumulador += dt;

  if (vento.ativo) {
    vento.tempo -= dt;
    if (vento.tempo <= 0) {
      vento.ativo = false;
      // Próxima rajada: mais intensa no sertão
      const fator = bioma === 'sertaao' ? 1.6 : bioma === 'serra' ? 0.7 : 1;
      vento.proximaEm = (1.6 + Math.random() * 2.4) * (bioma === 'serra' ? 0.65 : 1);
      vento.forca = (95 + Math.random() * 90) * fator;
      vento.direcao = Math.random() < 0.5 ? 1 : -1;
    }
    return;
  }

  vento.proximaEm -= dt;
  if (vento.proximaEm <= 0) {
    vento.ativo = true;
    vento.tempo = bioma === 'serra' ? 0.7 + Math.random() * 0.5 : 1.2 + Math.random() * 0.9;
  }
}

/** Empuxo horizontal do vento no avião (px/s). */
export function empuxoVento(vento: EstadoVento): number {
  return vento.ativo ? vento.direcao * vento.forca : 0;
}

/** Desenha partículas de poeira/ondas acompanhando a direção do vento. */
export function desenharParticulasVento(
  g: CanvasRenderingContext2D,
  vento: EstadoVento,
  tempo: number
): void {
  if (!vento.ativo) return;
  g.save();
  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 1;
  const dir = vento.direcao;
  for (let i = 0; i < 14; i++) {
    const semilla = i * 0.7 + Math.floor(tempo * 7) * 0.11;
    const y = 70 + ((i * 37 + Math.floor(tempo * 140)) % 420);
    const x = (semilla * 480 + tempo * 300 * dir) % 640;
    const px = dir === 1 ? x - 200 : 480 - (x - 200);
    g.globalAlpha = 0.25 + 0.4 * ((i % 3) / 2);
    g.beginPath();
    g.moveTo(px, y);
    g.lineTo(px + 22 * dir, y - 2);
    g.stroke();
  }
  g.restore();
  g.globalAlpha = 1;
}
