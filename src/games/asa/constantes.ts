/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AJUSTES DO "ASA RASANTE"
 * Geometria, velocidades, combustível e pontuação.
 */

export const LARGURA = 480;
export const ALTURA = 560;
export const HUD_ALTURA = 44;
export const PISO = ALTURA;

// Caça do jogador
export const JOGADOR_LARGURA = 32;
export const JOGADOR_ALTURA = 32;
export const JOGADOR_VELOCIDADE_X = 250;
export const LINHA_JOGADOR = 452;

// Velocidade da rolagem (mundo desce, avião avança)
export const VELOCIDADE_ROLAGEM_PADRAO = 96;
export const VELOCIDADE_ROLAGEM_MAX = 168;
export const VELOCIDADE_ROLAGEM_MIN = 62;
export const ACELERACAO_ROLAGEM = 240;

// Combustível
export const COMBUSTIVEL_MAX = 100;
export const COMBUSTIVEL_INICIAL = 100;
export const COMBUSTIVEL_GASTO_BASE = 2.6; // por segundo
export const COMBUSTIVEL_GASTO_ACELERANDO = 5.4; // por segundo com cima pressionado
export const COMBUSTIVEL_GASTO_DESACELERADO = 1.5; // por segundo com baixo pressionado

// Reabastecimento em pleno ar
export const TANKER_INTERVALO_MIN = 16; // segundos
export const TANKER_INTERVALO_MAX = 24; // segundos
export const TANKER_RAIO_CONEXAO_LARGURA = 48;
export const TANKER_RAIO_CONEXAO_ALTURA = 24;
export const TANKER_TEMPO_RECARGA = 2; // segundos para reabastecer
export const TANKER_VEL_Y = -110; // cruza de baixo para cima
export const TANKER_X = LARGURA / 2 - 22;

// Bombas
export const BOMBAS_POR_SETOR = 10;
export const BOMBA_MAX_NO_AR = 1;
export const BOMBA_RAIO_EXPLOSAO = 24;
export const BOMBA_TEMPO_QUEDA = 0.55;

// Setores e biomas
export const TAMANHO_SETOR = 3000; // comprimento vertical do setor (~5 telas)
export const BIOMAS = ['litoral', 'serra', 'sertaao', 'floresta'] as const;
export type TipoBioma = (typeof BIOMAS)[number];

// Dificuldade crescente por setor
export const DIFICULDADE_SETOR = (setor: number): number => Math.min(1, 0.18 + setor * 0.09);

// Pontuação
export const PONTOS_CACA = 60;
export const PONTOS_CACA_MERGULHO = 100;
export const PONTOS_HELICOPTERO = 120;
export const PONTOS_DRONE = 80;
export const PONTOS_TORRE = 100;
export const PONTOS_CAMINHAO = 200;
export const PONTOS_BUNKER = 150;
export const PONTOS_LANCHA = 50;
export const PONTOS_PASSARO = 10;
export const PONTOS_CENTRAL_BASE = 1000;
export const PONTOS_CENTRAL_POR_SETOR = 200;
export const PONTOS_RECARGA = 100;
export const PONTOS_RASANTE_POR_SEGUNDO = 10;
export const PONTOS_TANKER_BONUS = -500; // atirar no tanque: penalidade
export const VIDAS_INICIAIS = 3;
export const VIDAS_MAX = 6;
export const PONTOS_VIDA_EXTRA = 10000;

// Capacidade de bombas reabastecida pelo tanque
export const BOMBAS_RECARGA_TANK = 2;

// Cores (paleta neon de aviação)
export const COR_LARANJA = '#FB923C';
export const COR_LARANJA_NEON = '#F97316';
export const COR_LARANJA_CLARO = '#FDBA74';
export const COR_AMARELO = '#FDE047';
export const COR_VERMELHO = '#EF4444';
export const COR_MAR = '#0EA5E9';
export const COR_MAR_ESCURO = '#0369A1';
export const COR_AREIA = '#FDE68A';
export const COR_GRAMA = '#22C55E';

// Identidade dos biomas: [céu topo, céu base, chão principal, chão escuro]
export const PALETA_BIOMAS: Record<TipoBioma, [string, string, string, string]> = {
  litoral: ['#7DD3FC', '#38BDF8', '#FDE68A', '#E2C97E'],
  serra: ['#94A3B8', '#64748B', '#78716C', '#57534E'],
  sertaao: ['#FDBA74', '#FB923C', '#E7C873', '#C9A85C'],
  floresta: ['#86EFAC', '#34D399', '#166534', '#14532D'],
};
