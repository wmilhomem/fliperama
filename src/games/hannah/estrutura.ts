/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CARGA E VALIDAÇÃO DE TELAS — SALVE A HANNAH
 *
 * Resolve a geometria declarada em telas.ts para objetos com altura
 * calculada, e valida que a tela é atravessável: existe caminho do térreo
 * até o topo usando apenas escadas inteiras, todos os itens estão ao
 * alcance e o nascimento de barris não fica sobre o jogador.
 */

import {
  EstruturaTela,
  Escada,
  Segmento,
  TelaDef,
} from './tipos';

export function construirTela(def: TelaDef): EstruturaTela {
  const girders: Segmento[] = def.girders.map((g) => {
    const x2 = g.x + g.largura;
    const y2 = g.y + g.dy;
    const yEm = (x: number) => g.y + (g.dy * (x - g.x)) / g.largura;
    return { ...g, x2, y2, altura: g.altura ?? 12, yEm };
  });

  const escadas: Escada[] = def.escadas.map((e) => {
    const [a, b] = e.entre;
    const yA = girders[a].yEm(e.x);
    const yB = girders[b].yEm(e.x);
    return {
      x: e.x,
      yTop: Math.min(yA, yB),
      yBottom: Math.max(yA, yB),
      quebrada: !!e.quebrada,
      entre: [a, b],
    };
  });

  return { def, girders, escadas };
}

/**
 * Valida atravessabilidade e integridade da tela.
 * Devolve a lista de problemas encontrados (vazia = válida).
 */
export function validarTela(est: EstruturaTela): string[] {
  const problemas: string[] = [];
  const { girders, escadas, def } = est;
  const n = girders.length;
  if (n < 2) {
    problemas.push('tela precisa de ao menos 2 vigas');
    return problemas;
  }

  // BFS do térreo (viga mais baixa) até a viga do topo (índice 0),
  // usando apenas escadas inteiras.
  let inicio = 0;
  for (let i = 0; i < n; i++) {
    if (girders[i].yEm(girders[i].x + girders[i].largura / 2) >
        girders[inicio].yEm(girders[inicio].x + girders[inicio].largura / 2)) {
      inicio = i;
    }
  }

  const adj: Set<number>[] = Array.from({ length: n }, () => new Set());
  for (const e of escadas) {
    if (e.quebrada) continue;
    adj[e.entre[0]].add(e.entre[1]);
    adj[e.entre[1]].add(e.entre[0]);
  }

  const alcancado = new Set<number>([inicio]);
  const fila = [inicio];
  while (fila.length) {
    const atual = fila.shift()!;
    for (const vizinho of adj[atual]) {
      if (!alcancado.has(vizinho)) {
        alcancado.add(vizinho);
        fila.push(vizinho);
      }
    }
  }

  if (!alcancado.has(0)) {
    problemas.push('não há caminho do térreo ao topo usando apenas escadas inteiras');
  }

  // Todo martelo e item de bônus precisa estar ao alcance de uma viga alcançável.
  const itens = [
    ...(def.martelos ?? []).map((m) => ({ rotulo: 'martelo', x: m.x, y: m.y })),
    ...def.itensBonus.map((i) => ({ rotulo: `item ${i.tipo}`, x: i.x, y: i.y })),
  ];
  for (const item of itens) {
    let melhorDistancia = Infinity;
    let vigiaMaisProxima = -1;
    for (let i = 0; i < n; i++) {
      if (item.x < girders[i].x - 8 || item.x > girders[i].x2 + 8) continue;
      const d = Math.abs(girders[i].yEm(item.x) - item.y);
      if (d < melhorDistancia) {
        melhorDistancia = d;
        vigiaMaisProxima = i;
      }
    }
    if (vigiaMaisProxima === -1) {
      problemas.push(`${item.rotulo} fora de qualquer viga`);
    } else if (!alcancado.has(vigiaMaisProxima)) {
      problemas.push(`${item.rotulo} inalcançável`);
    }
  }

  // Nascimento de barril não pode ficar em cima do jogador.
  if (Math.abs(def.barrilSpawn.x - def.jogadorSpawn.x) < 60
      && Math.abs(def.barrilSpawn.y - def.jogadorSpawn.y) < 80) {
    problemas.push('barril nasce em cima do jogador');
  }

  return problemas;
}
