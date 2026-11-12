/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AUMENTO_COMPRIMENTO_SECAO,
  COMPRIMENTO_SECAO_BASE,
  EXTRA_RIO,
  INICIO_RIO,
  LARGURA_MUNDO,
  LARGURA_RIO_MAX,
  LARGURA_RIO_MIN,
  PASSO_RIO,
  Y_NAVE,
} from './constantes';
import { TAU, RNG, aleatorio, clamp, criarRng, interpolar } from './semente';
import { AmostraRio, IlhaRio, SecaoRio } from './tipos';

export function telaY(d: number, progresso: number): number {
  return Y_NAVE + progresso - d;
}

export function distanciaNaTela(y: number, progresso: number): number {
  return progresso + Y_NAVE - y;
}

export function criarSecao(numero: number, semente: number): SecaoRio {
  const rng = criarRng(semente + numero * 7919);
  const comprimento = COMPRIMENTO_SECAO_BASE + (numero - 1) * AUMENTO_COMPRIMENTO_SECAO;
  const inicio = INICIO_RIO;
  const fim = comprimento + EXTRA_RIO;

  const faseCentroA = aleatorio(rng, 0, TAU);
  const faseCentroB = aleatorio(rng, 0, TAU);
  const faseLarguraA = aleatorio(rng, 0, TAU);
  const faseLarguraB = aleatorio(rng, 0, TAU);
  const amplitudeCentro = 19 + Math.min(9, (numero - 1) * 2.4);
  const larguraBase = clamp(174 - (numero - 1) * 7, LARGURA_RIO_MIN + 14, LARGURA_RIO_MAX - 8);

  const ilhas: IlhaRio[] = [];
  const quantidadeIlhas = Math.min(3, Math.max(0, numero - 1));

  for (let i = 0; i < quantidadeIlhas; i++) {
    const margemSecao = 180;
    const inicioIlha = aleatorio(rng, margemSecao, Math.max(margemSecao + 20, comprimento - 260));
    const tamanhoIlha = aleatorio(rng, 130, 250);

    ilhas.push({
      inicio: inicioIlha,
      fim: Math.min(comprimento - 110, inicioIlha + tamanhoIlha),
      largura: aleatorio(rng, 22, 34),
    });
  }

  const amostras: AmostraRio[] = [];

  for (let d = inicio; d <= fim; d += PASSO_RIO) {
    const largura = clamp(
      larguraBase +
        Math.sin(d * 0.015 + faseLarguraA) * 13 +
        Math.sin(d * 0.0047 + faseLarguraB) * 9,
      LARGURA_RIO_MIN,
      LARGURA_RIO_MAX
    );

    const centroBase =
      LARGURA_MUNDO / 2 +
      Math.sin(d * 0.012 + faseCentroA) * amplitudeCentro +
      Math.sin(d * 0.028 + faseCentroB) * amplitudeCentro * 0.38;

    const centro = clamp(
      centroBase,
      largura / 2 + 8,
      LARGURA_MUNDO - largura / 2 - 8
    );
    const esquerda = centro - largura / 2;
    const direita = centro + largura / 2;

    let ilhaLargura = 0;

    for (const ilha of ilhas) {
      if (d < ilha.inicio || d > ilha.fim) continue;

      const entrada = clamp((d - ilha.inicio) / 28, 0, 1);
      const saida = clamp((ilha.fim - d) / 34, 0, 1);
      const curva = Math.min(entrada, saida);
      ilhaLargura = Math.max(ilhaLargura, ilha.largura * Math.sqrt(curva));
    }

    amostras.push({
      d,
      centro,
      largura,
      ilhaLargura,
      esquerda,
      direita,
    });
  }

  return {
    numero,
    comprimento,
    inicio,
    fim,
    passo: PASSO_RIO,
    amostras,
    ilhas,
  };
}

export function obterAmostra(secao: SecaoRio, d: number): AmostraRio {
  const posicao = (d - secao.inicio) / secao.passo;
  const indice = clamp(Math.floor(posicao), 0, secao.amostras.length - 1);
  const proximo = Math.min(secao.amostras.length - 1, indice + 1);
  const fracao = clamp(posicao - indice, 0, 1);

  const a = secao.amostras[indice];
  const b = secao.amostras[proximo];

  if (a === b) return a;

  const centro = interpolar(a.centro, b.centro, fracao);
  const largura = interpolar(a.largura, b.largura, fracao);
  const ilhaLargura = interpolar(a.ilhaLargura, b.ilhaLargura, fracao);

  return {
    d,
    centro,
    largura,
    ilhaLargura,
    esquerda: centro - largura / 2,
    direita: centro + largura / 2,
  };
}

export type FaixaNavegavel = [number, number];

export function obterFaixasNavegaveis(
  secao: SecaoRio,
  d: number,
  margem = 0
): FaixaNavegavel[] {
  const amostra = obterAmostra(secao, d);
  const faixas: FaixaNavegavel[] = [];

  const esquerda = amostra.esquerda + margem;
  const direita = amostra.direita - margem;

  if (amostra.ilhaLargura < 1) {
    if (direita > esquerda) faixas.push([esquerda, direita]);
    return faixas;
  }

  const ilhaEsquerda = amostra.centro - amostra.ilhaLargura / 2 - margem;
  const ilhaDireita = amostra.centro + amostra.ilhaLargura / 2 + margem;

  if (ilhaEsquerda > esquerda) faixas.push([esquerda, ilhaEsquerda]);
  if (direita > ilhaDireita) faixas.push([ilhaDireita, direita]);

  return faixas;
}

export function limitarXNaSecao(
  secao: SecaoRio,
  d: number,
  x: number,
  margem = 0
): number {
  const faixas = obterFaixasNavegaveis(secao, d, margem);

  if (faixas.length === 0) {
    return obterAmostra(secao, d).centro;
  }

  for (const [esquerda, direita] of faixas) {
    if (x >= esquerda && x <= direita) return x;
  }

  let melhorX = x;
  let melhorDistancia = Number.POSITIVE_INFINITY;

  for (const [esquerda, direita] of faixas) {
    const candidato = clamp(x, esquerda, direita);
    const distancia = Math.abs(candidato - x);

    if (distancia < melhorDistancia) {
      melhorDistancia = distancia;
      melhorX = candidato;
    }
  }

  return melhorX;
}

export function xNavegavel(secao: SecaoRio, d: number, rng: RNG, margem = 0): number {
  const faixas = obterFaixasNavegaveis(secao, d, margem);

  if (faixas.length === 0) return obterAmostra(secao, d).centro;

  const total = faixas.reduce((soma, [esquerda, direita]) => soma + (direita - esquerda), 0);
  let escolha = rng() * total;

  for (const [esquerda, direita] of faixas) {
    const largura = direita - esquerda;
    if (escolha <= largura) return esquerda + rng() * largura;
    escolha -= largura;
  }

  const ultima = faixas[faixas.length - 1];
  return ultima[0] + rng() * (ultima[1] - ultima[0]);
}

export function centroRio(secao: SecaoRio, d: number): number {
  return obterAmostra(secao, d).centro;
}

export function larguraRio(secao: SecaoRio, d: number): number {
  return obterAmostra(secao, d).largura;
}

export function comprimentoSecao(numero: number): number {
  return COMPRIMENTO_SECAO_BASE + (numero - 1) * AUMENTO_COMPRIMENTO_SECAO;
}
