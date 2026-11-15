/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PREFERÊNCIAS DE CONTROLE POR TOQUE (PILOTO "ARRASTAR")
 *
 * Armazenadas em `fliperama_controles_v1`. Lidas através de um cache em
 * memória para não fazer parse do JSON a cada quadro do jogo.
 */

export type EsquemaTouch = 'arrastar' | 'classico';
export type ModoTiro = 'manual' | 'toque' | 'auto';

export interface ControlesConfig {
  /** Esquema escolhido por jogo (ausente = padrão do módulo). */
  esquemas: Record<string, EsquemaTouch>;
  modoTiro: ModoTiro;
  /** Sensibilidade do arrasto (0,5x a 2x). */
  sensibilidade: number;
  /** Inverte o lado da faixa e do botão ATIRAR. */
  canhoto: boolean;
  vibracao: boolean;
  /** Dica de 3 segundos já vista por jogo (etapa por jogo). */
  dicaVista: Record<string, boolean>;
  /** Sobrepõe o diagnóstico de toque na tela do jogo. */
  diagnostico: boolean;
}

const KEY = 'fliperama_controles_v1';

export const PADRAO_CONTROLES: ControlesConfig = {
  esquemas: {},
  modoTiro: 'manual',
  sensibilidade: 1,
  canhoto: false,
  vibracao: true,
  dicaVista: {},
  diagnostico: false,
};

export const MODOS_TIRO: { id: ModoTiro; rotulo: string; descricao: string }[] = [
  { id: 'manual', rotulo: 'MANUAL', descricao: 'Botão ATIRAR com o outro polegar' },
  { id: 'toque', rotulo: 'TOQUE', descricao: 'Toque rápido na faixa dispara' },
  { id: 'auto', rotulo: 'AUTOMÁTICO', descricao: 'Atira enquanto arrasta (acessibilidade)' },
];

export const SENSIBILIDADES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

let cache: ControlesConfig | null = null;

export function lerControles(): ControlesConfig {
  if (cache) return cache;
  if (typeof window === 'undefined') return { ...PADRAO_CONTROLES };
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    cache = {
      ...PADRAO_CONTROLES,
      ...(parsed as Partial<ControlesConfig>),
      esquemas: { ...PADRAO_CONTROLES.esquemas, ...(parsed?.esquemas ?? {}) },
      // Migração: dicaVista booleano antigo → mapa por jogo
      dicaVista:
        parsed?.dicaVista === true
          ? { invasores84: true }
          : typeof parsed?.dicaVista === 'object' && parsed?.dicaVista !== null
            ? { ...(parsed.dicaVista as Record<string, boolean>) }
            : {},
      sensibilidade: Math.min(2, Math.max(0.5, Number(parsed?.sensibilidade) || 1)),
      modoTiro: ['manual', 'toque', 'auto'].includes(parsed?.modoTiro)
        ? parsed.modoTiro
        : 'manual',
      canhoto: !!parsed?.canhoto,
      vibracao: parsed?.vibracao !== false,
      diagnostico: !!parsed?.diagnostico,
    };
  } catch {
    cache = { ...PADRAO_CONTROLES };
  }
  return cache;
}

export function salvarControles(patch: Partial<ControlesConfig>): ControlesConfig {
  const atual = lerControles();
  const novo: ControlesConfig = { ...atual, ...patch };
  cache = novo;
  try {
    localStorage.setItem(KEY, JSON.stringify(novo));
  } catch {
    // Quota/modo anônimo: mantém só em memória
  }
  return novo;
}

export function salvarEsquema(jogoId: string, esquema: EsquemaTouch): ControlesConfig {
  const novo = salvarControles({
    esquemas: { ...lerControles().esquemas, [jogoId]: esquema },
  });
  for (const fn of ouvintesEsquema) fn();
  return novo;
}

// --- Barramento simples para alternar esquema/dica ao vivo ---
const ouvintesEsquema = new Set<() => void>();
const ouvintesDica = new Set<() => void>();

export function aoMudarEsquema(fn: () => void): () => void {
  ouvintesEsquema.add(fn);
  return () => {
    ouvintesEsquema.delete(fn);
  };
}

export function aoPedirDicaDeToque(fn: () => void): () => void {
  ouvintesDica.add(fn);
  return () => {
    ouvintesDica.delete(fn);
  };
}

/** Pede para reabrir a dica de 3 segundos do piloto "arrastar". */
export function pedirDicaDeToque(): void {
  for (const fn of ouvintesDica) fn();
}

export function dicaVistaDoJogo(jogoId: string): boolean {
  return !!lerControles().dicaVista[jogoId];
}

export function marcarDicaVista(jogoId: string): ControlesConfig {
  const atual = lerControles();
  return salvarControles({ dicaVista: { ...atual.dicaVista, [jogoId]: true } });
}

export function esquemaDoJogo(jogoId: string, padrao: EsquemaTouch): EsquemaTouch {
  const s = lerControles().esquemas[jogoId];
  return s === 'arrastar' || s === 'classico' ? s : padrao;
}
