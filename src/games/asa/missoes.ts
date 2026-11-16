/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Dados das 5 missões — Asa Rasante. */

export interface MissaoDef {
  numero: number;
  nome: string;
  regiao: string;
  /** Hora do dia para o céu e a iluminação. */
  hora: 'manha' | 'entardecer' | 'tarde' | 'noite' | 'madrugada';
  /** Tipo de clima visual ('limpo' | 'chuva' | 'neblina' | 'tempestadeAreia' | 'tempestade'). */
  climaTipo: 'limpo' | 'chuva' | 'neblina' | 'tempestadeAreia' | 'tempestade';
  clima: string;
  descricao: string;
  /** Vida inicial do chefão. */
  chefaoVida: number;
  /** Estoque inicial de mísseis. */
  misseisBase: number;
  /** Tipo do chefão ('corsario' | 'condor' | 'escorpiao' | 'colmeia' | 'tempestade'). */
  chefaoTipo: 'corsario' | 'condor' | 'escorpiao' | 'colmeia' | 'tempestade';
}

export const MISSOES: MissaoDef[] = [
  {
    numero: 1,
    nome: 'LITORAL',
    regiao: 'COSTA DO BRASIL',
    hora: 'manha',
    climaTipo: 'limpo',
    clima: 'CÉU LIMPO',
    descricao: 'DESVIE DOS DRONES E DESTRUA AS BATERIAS COSTEIRAS.',
    chefaoVida: 60,
    misseisBase: 10,
    chefaoTipo: 'corsario',
  },
  {
    numero: 2,
    nome: 'SERRA',
    regiao: 'CADEIA DE MONTANHAS',
    hora: 'entardecer',
    climaTipo: 'neblina',
    clima: 'CHUVA FRACA',
    descricao: 'ATRAVESSE OS CÂNIONS. EVITE OS PAREDÕES DE ROCHA.',
    chefaoVida: 80,
    misseisBase: 12,
    chefaoTipo: 'condor',
  },
  {
    numero: 3,
    nome: 'SERTÃO',
    regiao: 'INTERIOR DO BRASIL',
    hora: 'tarde',
    climaTipo: 'tempestadeAreia',
    clima: 'TEMPESTADE DE AREIA',
    descricao: 'RAJADAS DE AREIA E VENTOS FORTES NO AR.',
    chefaoVida: 100,
    misseisBase: 14,
    chefaoTipo: 'escorpiao',
  },
  {
    numero: 4,
    nome: 'CIDADE',
    regiao: 'CIRCUITO METROPOLITANO',
    hora: 'noite',
    climaTipo: 'chuva',
    clima: 'CHUVA FORTE',
    descricao: 'PRÉDIOS E RUAS EM NEON. ENXAMES DE DRONES.',
    chefaoVida: 120,
    misseisBase: 16,
    chefaoTipo: 'colmeia',
  },
  {
    numero: 5,
    nome: 'FLORESTA',
    regiao: 'MATA ATLÂNTICA',
    hora: 'madrugada',
    climaTipo: 'tempestade',
    clima: 'TEMPESTADE',
    descricao: 'COPAS DENSAS E RAIOS. O SENHOR DA TEMPESTADE ESPERA.',
    chefaoVida: 150,
    misseisBase: 18,
    chefaoTipo: 'tempestade',
  },
];

/** Devolve as informações da missão pelo número (1 a 5). */
export function obterMissao(n: number): MissaoDef {
  const idx = Math.min(Math.max(1, Math.floor(n)), MISSOES.length) - 1;
  return MISSOES[idx];
}
