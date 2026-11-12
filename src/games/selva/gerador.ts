/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LARGURA_MUNDO,
  SEMENTE_MUNDO,
  SUBSOLO_CHAO,
  TOTAL_TELAS,
  TOTAL_TESOUROS,
  TRILHA_Y,
} from './constantes';
import { aleatorio, inteiro, rngDaTela } from './semente';
import {
  Camada,
  Escorpiao,
  MundoSelva,
  Obstaculo,
  TelaSelva,
  Tesouro,
  TipoTesouro,
  TipoTela,
} from './tipos';

const TIPOS: TipoTela[] = [
  'tronco',
  'fileira',
  'jacare',
  'cipo',
  'areia',
  'cobra',
  'fogueira',
];

const VALORES: Record<TipoTesouro, number> = {
  anel: 2000,
  barra: 3000,
  bau: 4000,
  pulseira: 4000,
  diamante: 5000,
};

const TIPOS_TESOURO: TipoTesouro[] = [
  'anel',
  'barra',
  'bau',
  'pulseira',
  'diamante',
];

export function gerarMundo(): MundoSelva {
  const telas: TelaSelva[] = [];

  for (let indice = 0; indice < TOTAL_TELAS; indice++) {
    telas.push(gerarTela(indice));
  }

  const tesouros = gerarTesouros(telas);

  return { telas, tesouros };
}

function gerarTela(indice: number): TelaSelva {
  const semente = rngDaTela(SEMENTE_MUNDO, indice, 0x41);
  const rng = rngDaTela(SEMENTE_MUNDO, indice, 0x42);
  let tipo: TipoTela = 'livre';

  if (indice >= 2) {
    const sorteio = semente();
    if (sorteio < 0.1) tipo = 'livre';
    else if (sorteio < 0.24) tipo = 'tronco';
    else if (sorteio < 0.37) tipo = 'fileira';
    else if (sorteio < 0.53) tipo = 'jacare';
    else if (sorteio < 0.67) tipo = 'cipo';
    else if (sorteio < 0.79) tipo = 'areia';
    else if (sorteio < 0.9) tipo = 'cobra';
    else tipo = 'fogueira';
  }

  const obstaculos = tipo === 'livre' ? [] : criarObstaculo(tipo, rng);
  const parede =
    indice >= 6 && (indice % 5 === 2 || rng() < 0.2)
      ? { x: 148, largura: 12 }
      : null;
  const escadas = criarEscadas(tipo, parede);
  const escorpioes = criarEscorpioes(indice, rng, parede);

  return {
    indice,
    semente: rngDaTela(SEMENTE_MUNDO, indice, 0x43)(),
    tipo,
    obstaculos,
    escorpioes,
    parede,
    escadas,
  };
}

function criarObstaculo(tipo: TipoTela, rng: () => number): Obstaculo[] {
  switch (tipo) {
    case 'tronco': {
      const x = Math.floor(aleatorio(rng, 68, 188));
      return [
        {
          tipo: 'tronco',
          x,
          y: TRILHA_Y - 10,
          largura: 18,
          altura: 10,
          vx: rng() < 0.5 ? -32 : 32,
        },
      ];
    }

    case 'fileira': {
      const base = Math.floor(aleatorio(rng, 72, 150));
      const quantidade = inteiro(rng, 2, 3);
      const troncos: number[] = [];

      for (let i = 0; i < quantidade; i++) {
        troncos.push(base + i * 22);
      }

      return [
        {
          tipo: 'fileira',
          x: base,
          y: TRILHA_Y - 9,
          largura: (quantidade - 1) * 22 + 9,
          altura: 9,
          troncos,
        },
      ];
    }

    case 'jacare': {
      const quantidade = inteiro(rng, 2, 3);
      const x = Math.floor(aleatorio(rng, 72, 112));
      const largura = quantidade * 20 + (quantidade - 1) * 2;
      const jacares = [];

      for (let i = 0; i < quantidade; i++) {
        jacares.push({
          x: x + i * 22,
          largura: 22,
          fase: i * 0.72 + rng() * 0.35,
        });
      }

      return [{ tipo: 'jacare', x, largura, jacares }];
    }

    case 'cipo': {
      const x = Math.floor(aleatorio(rng, 82, 96));
      return [
        {
          tipo: 'cipo',
          x,
          largura: 84,
          ancoraX: x + 42,
          ancoraY: 32,
          comprimento: 74,
          fase: rng() * Math.PI * 2,
        },
      ];
    }

    case 'areia': {
      const largura = Math.floor(aleatorio(rng, 38, 46));
      return [
        {
          tipo: 'areia',
          x: Math.floor(aleatorio(rng, 72, 132)),
          largura,
        },
      ];
    }

    case 'cobra': {
      return [
        {
          tipo: 'cobra',
          x: Math.floor(aleatorio(rng, 72, 196)),
          largura: 17,
          altura: 10,
          y: TRILHA_Y - 10,
        },
      ];
    }

    case 'fogueira': {
      return [
        {
          tipo: 'fogueira',
          x: Math.floor(aleatorio(rng, 72, 194)),
          largura: 18,
          altura: 14,
          y: TRILHA_Y - 8,
          fase: rng() * Math.PI * 2,
        },
      ];
    }

    case 'livre':
      return [];
  }
}

function criarEscadas(
  tipo: TipoTela,
  parede: { x: number; largura: number } | null
): number[] {
  if (parede) return [38, 188];
  if (tipo === 'jacare' || tipo === 'cipo' || tipo === 'areia') return [38, 188];
  return [38, 112, 188];
}

function criarEscorpioes(
  indice: number,
  rng: () => number,
  parede: { x: number; largura: number } | null
): Escorpiao[] {
  const escorpioes: Escorpiao[] = [];
  const rngExtra = rngDaTela(SEMENTE_MUNDO, indice, 0x56);
  const quantidade = rngExtra() < 0.58 ? (rngExtra() < 0.18 ? 2 : 1) : 0;

  for (let i = 0; i < quantidade; i++) {
    let x = Math.floor(aleatorio(rng, 28, 196));

    if (parede && x + 12 > parede.x - 8 && x < parede.x + parede.largura + 8) {
      x = parede.x + parede.largura + 18;
    }

    if (x + 12 > LARGURA_MUNDO - 26) x = LARGURA_MUNDO - 44;

    escorpioes.push({
      id: indice * 10 + i,
      x,
      y: SUBSOLO_CHAO - 5,
      vx: rng() < 0.5 ? -25 : 25,
      largura: 12,
      altura: 5,
    });
  }

  return escorpioes;
}

function gerarTesouros(telas: TelaSelva[]): Tesouro[] {
  const tesouros: Tesouro[] = [];

  for (let i = 0; i < TOTAL_TESOUROS; i++) {
    const tela = Math.floor(((i + 0.5) * TOTAL_TELAS) / TOTAL_TESOUROS);
    const tipo = TIPOS_TESOURO[i % TIPOS_TESOURO.length];
    const camada: Camada = i % 3 === 1 ? 'subsolo' : 'superficie';
    const rng = rngDaTela(SEMENTE_MUNDO, tela, 0x70 + i);
    const x = encontrarXSeguro(telas[tela], camada, rng);
    const y = camada === 'superficie' ? TRILHA_Y - 15 : SUBSOLO_CHAO - 15;

    tesouros.push({
      id: `tesouro-${i}`,
      tela,
      camada,
      x,
      y,
      tipo,
      valor: VALORES[tipo],
    });
  }

  return tesouros;
}

function encontrarXSeguro(
  tela: TelaSelva,
  camada: Camada,
  rng: () => number
): number {
  for (let tentativa = 0; tentativa < 24; tentativa++) {
    const x = Math.floor(aleatorio(rng, 46, 198));
    if (camada === 'superficie' && xSeguroSuperficie(tela, x)) return x;
    if (camada === 'subsolo' && xSeguroSubsolo(tela, x)) return x;
  }

  return camada === 'superficie' ? 196 : 170;
}

function xSeguroSuperficie(tela: TelaSelva, x: number): boolean {
  if (tela.escadas.some((escada) => Math.abs(x - escada) < 12)) return false;

  for (const obstaculo of tela.obstaculos) {
    if (x > obstaculo.x - 15 && x < obstaculo.x + obstaculo.largura + 15) {
      return false;
    }
  }

  return true;
}

function xSeguroSubsolo(tela: TelaSelva, x: number): boolean {
  if (tela.parede && x > tela.parede.x - 16 && x < tela.parede.x + tela.parede.largura + 16) {
    return false;
  }

  if (tela.escadas.some((escada) => Math.abs(x - escada) < 12)) return false;

  return !tela.escorpioes.some(
    (escorpiao) => x > escorpiao.x - 16 && x < escorpiao.x + escorpiao.largura + 16
  );
}
