/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ALTURA,
  CAMERA_ALTURA,
  CAMERA_PROFUNDIDADE,
  DISTANCIA_DESENHO,
  JOGADOR_Z,
  LARGURA,
  PISTA_LARGURA,
  SEGMENTO_COMPRIMENTO,
  TOTAL_SEGMENTOS,
} from './constantes';
import { desenharPropsSegmento } from './cenario';
import { aleatorio, criarRng, escolher } from './semente';
import { desenharTrafegoSegmento } from './trafego';
import {
  ClimaTipo,
  Estrada,
  Projecao,
  ProjecaoEstrada,
  PropCenario,
  Segmento,
  TipoProp,
  Trafego,
} from './tipos';

const TIPOS_PROP: TipoProp[] = [
  'arvore',
  'arvore',
  'arvore',
  'arvore',
  'poste',
  'placa',
  'pedra',
  'casa',
  'cerca',
];

function criarProjecao(): Projecao {
  return {
    x: 0,
    y: 0,
    largura: 0,
    escala: 0,
    zRelativo: 0,
    visivel: false,
  };
}

function projetar(
  p: Projecao,
  xMundo: number,
  yMundo: number,
  cameraX: number,
  cameraY: number,
  zRelativo: number
): void {
  const z = Math.max(0.001, zRelativo);
  const escala = CAMERA_PROFUNDIDADE / z;

  p.escala = escala;
  p.x = LARGURA / 2 + escala * (xMundo - cameraX) * (LARGURA / 2);
  p.y = ALTURA / 2 - escala * (yMundo - cameraY) * (ALTURA / 2);
  p.largura = escala * PISTA_LARGURA * (LARGURA / 2);
  p.zRelativo = zRelativo;
  p.visivel = zRelativo > CAMERA_PROFUNDIDADE;
}

function criarProps(rng: () => number): PropCenario[] {
  const props: PropCenario[] = [];

  if (rng() < 0.74) {
    props.push({
      tipo: escolher(rng, TIPOS_PROP),
      lado: rng() < 0.5 ? -1 : 1,
      deslocamento: aleatorio(rng, 0.02, 0.92),
      variacao: rng(),
    });
  }

  if (rng() < 0.19) {
    props.push({
      tipo: escolher(rng, TIPOS_PROP),
      lado: rng() < 0.5 ? -1 : 1,
      deslocamento: aleatorio(rng, 0.08, 1.15),
      variacao: rng(),
    });
  }

  return props;
}

export function criarEstrada(semente: number): Estrada {
  const rng = criarRng(semente ^ 0x27d4eb2f);
  const segmentos: Segmento[] = [];
  let mundoY = 0;

  function adicionarBloco(comprimento: number, curva: number, deltaY: number): void {
    const restante = TOTAL_SEGMENTOS - segmentos.length;
    const total = Math.max(0, Math.min(Math.floor(comprimento), restante));

    for (let i = 0; i < total; i++) {
      mundoY += deltaY;
      const indice = segmentos.length;
      segmentos.push({
        indice,
        curva,
        mundoY,
        faixa: Math.floor(indice / 3) % 2,
        p1: criarProjecao(),
        p2: criarProjecao(),
        props: indice > 26 ? criarProps(rng) : [],
      });
    }
  }

  adicionarBloco(72, 0, 0);

  while (segmentos.length < TOTAL_SEGMENTOS) {
    const sorteio = rng();

    if (sorteio < 0.24) {
      adicionarBloco(aleatorio(rng, 26, 62), 0, 0);
    } else if (sorteio < 0.43) {
      adicionarBloco(aleatorio(rng, 28, 70), aleatorio(rng, 0.55, 1.65), 0);
    } else if (sorteio < 0.62) {
      adicionarBloco(aleatorio(rng, 28, 70), -aleatorio(rng, 0.55, 1.65), 0);
    } else if (sorteio < 0.78) {
      adicionarBloco(aleatorio(rng, 28, 58), 0, aleatorio(rng, 1.2, 3.8));
    } else if (sorteio < 0.91) {
      adicionarBloco(aleatorio(rng, 28, 58), 0, -aleatorio(rng, 1.2, 3.8));
    } else {
      const curva = aleatorio(rng, 0.65, 1.4);
      adicionarBloco(30, curva, 0);
      adicionarBloco(30, -curva, 0);
    }
  }

  return {
    segmentos,
    comprimento: segmentos.length * SEGMENTO_COMPRIMENTO,
  };
}

export function projetarEstrada(
  estrada: Estrada,
  posicao: number,
  jogadorX: number,
  visibilidade: number
): ProjecaoEstrada {
  const total = estrada.segmentos.length;
  const baseIndice = Math.floor(posicao / SEGMENTO_COMPRIMENTO) % total;
  const basePercentual = (posicao % SEGMENTO_COMPRIMENTO) / SEGMENTO_COMPRIMENTO;
  const indiceJogador = Math.floor((posicao + JOGADOR_Z) / SEGMENTO_COMPRIMENTO) % total;
  const jogadorY = estrada.segmentos[indiceJogador].mundoY;
  const cameraY = jogadorY + CAMERA_ALTURA;
  const distancia = Math.max(
    52,
    Math.min(DISTANCIA_DESENHO, Math.floor(DISTANCIA_DESENHO * Math.max(0.45, visibilidade)))
  );

  let x = 0;
  let dx = -(estrada.segmentos[baseIndice].curva * basePercentual);

  for (let n = 0; n < distancia; n++) {
    const indice = (baseIndice + n) % total;
    const segmento = estrada.segmentos[indice];
    const proximo = estrada.segmentos[(indice + 1) % total];
    const z1 = (n - basePercentual) * SEGMENTO_COMPRIMENTO;
    const z2 = z1 + SEGMENTO_COMPRIMENTO;

    projetar(
      segmento.p1,
      0,
      segmento.mundoY,
      jogadorX * PISTA_LARGURA - x,
      cameraY,
      z1
    );
    projetar(
      segmento.p2,
      0,
      proximo.mundoY,
      jogadorX * PISTA_LARGURA - x - dx,
      cameraY,
      z2
    );

    x += dx;
    dx += segmento.curva;
  }

  return {
    baseIndice,
    basePercentual,
    jogadorY,
    distancia,
  };
}

function desenharQuadrilatero(
  g: CanvasRenderingContext2D,
  x1a: number,
  x1b: number,
  y1: number,
  x2a: number,
  x2b: number,
  y2: number,
  cor: string
): void {
  g.fillStyle = cor;
  g.beginPath();
  g.moveTo(x1a, y1);
  g.lineTo(x1b, y1);
  g.lineTo(x2b, y2);
  g.lineTo(x2a, y2);
  g.closePath();
  g.fill();
}

export function desenharPista(
  g: CanvasRenderingContext2D,
  estrada: Estrada,
  projecao: ProjecaoEstrada,
  trafego: Trafego[],
  tempo: number,
  noite: number,
  clima: ClimaTipo
): void {
  const total = estrada.segmentos.length;
  const gelo = clima === 'gelo';
  const chuva = clima === 'chuva';
  const gramaA = gelo ? '#CBD5E1' : chuva ? '#0F3D2E' : '#14532D';
  const gramaB = gelo ? '#E2E8F0' : chuva ? '#0B3326' : '#166534';
  const asfaltoA = gelo ? '#64748B' : chuva ? '#1E293B' : '#334155';
  const asfaltoB = gelo ? '#586578' : chuva ? '#172033' : '#2B3444';

  for (let n = projecao.distancia - 1; n >= 1; n--) {
    const segmento = estrada.segmentos[(projecao.baseIndice + n) % total];
    const p1 = segmento.p1;
    const p2 = segmento.p2;

    if (!p1.visivel || p2.y >= p1.y) continue;

    const topo = Math.max(-48, p2.y);
    const base = Math.min(ALTURA + 48, p1.y);

    if (base - topo < 0.4) continue;

    g.fillStyle = segmento.faixa ? gramaA : gramaB;
    g.fillRect(0, topo, LARGURA, base - topo + 1);

    desenharPropsSegmento(g, segmento, noite);

    desenharQuadrilatero(
      g,
      p1.x - p1.largura,
      p1.x + p1.largura,
      p1.y,
      p2.x - p2.largura,
      p2.x + p2.largura,
      p2.y,
      segmento.faixa ? asfaltoA : asfaltoB
    );

    const rumble1 = p1.largura * 0.085;
    const rumble2 = p2.largura * 0.085;
    const corRumble = Math.floor(segmento.indice / 3) % 2 === 0 ? '#F8FAFC' : '#DC2626';

    desenharQuadrilatero(
      g,
      p1.x - p1.largura,
      p1.x - p1.largura + rumble1,
      p1.y,
      p2.x - p2.largura,
      p2.x - p2.largura + rumble2,
      p2.y,
      corRumble
    );
    desenharQuadrilatero(
      g,
      p1.x + p1.largura - rumble1,
      p1.x + p1.largura,
      p1.y,
      p2.x + p2.largura - rumble2,
      p2.x + p2.largura,
      p2.y,
      corRumble
    );

    if (segmento.indice % 6 < 3) {
      const meia1 = Math.max(0.65, p1.largura * 0.012);
      const meia2 = Math.max(0.5, p2.largura * 0.012);

      for (const limite of [-0.5, 0, 0.5]) {
        const x1 = p1.x + p1.largura * limite;
        const x2 = p2.x + p2.largura * limite;
        desenharQuadrilatero(
          g,
          x1 - meia1,
          x1 + meia1,
          p1.y,
          x2 - meia2,
          x2 + meia2,
          p2.y,
          'rgba(248,250,252,0.82)'
        );
      }
    }

    desenharTrafegoSegmento(g, segmento, projecao, n, trafego, tempo, noite);
  }
}
