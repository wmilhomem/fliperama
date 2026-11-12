/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { aleatorio, criarRng } from './semente';
import { obterAmostra } from './rio';
import { Decoracao, SecaoRio, TipoDecoracao } from './tipos';

const TIPOS_MARGEM: TipoDecoracao[] = [
  'moita',
  'moita',
  'arvore',
  'arvore',
  'pedra',
  'palafita',
];

export function criarCenario(secao: SecaoRio, semente: number): Decoracao[] {
  const rng = criarRng(semente + secao.numero * 1543);
  const decoracoes: Decoracao[] = [];
  const quantidade = 92;

  for (let i = 0; i < quantidade; i++) {
    const d = aleatorio(rng, secao.inicio + 10, secao.fim - 10);
    const amostra = obterAmostra(secao, d);
    const esquerda = rng() < 0.5;
    const afastamento = aleatorio(rng, 5, 25);
    const x = esquerda ? amostra.esquerda - afastamento : amostra.direita + afastamento;

    decoracoes.push({
      tipo: TIPOS_MARGEM[Math.floor(rng() * TIPOS_MARGEM.length)],
      x,
      d,
      variacao: rng(),
    });
  }

  for (const ilha of secao.ilhas) {
    const quantidadeIlha = Math.max(2, Math.floor((ilha.fim - ilha.inicio) / 70));

    for (let i = 0; i < quantidadeIlha; i++) {
      const d = aleatorio(rng, ilha.inicio + 16, ilha.fim - 16);
      const amostra = obterAmostra(secao, d);
      const espalhamento = Math.max(0, amostra.ilhaLargura / 2 - 4);
      const x = amostra.centro + aleatorio(rng, -espalhamento, espalhamento);

      decoracoes.push({
        tipo: rng() < 0.75 ? 'arvore' : 'moita',
        x,
        d,
        variacao: rng(),
      });
    }
  }

  decoracoes.sort((a, b) => a.d - b.d);
  return decoracoes;
}
