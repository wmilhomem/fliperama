/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AJUSTES DO "ASA RASANTE" — CAMPANHA DE 5 MISSÕES
 * Todos os números de dificuldade e ajuste do jogo ficam aqui,
 * comentados em português, para facilitar balanceamento.
 */

export const LARGURA = 480;
export const ALTURA = 560;
export const HUD_ALTURA = 48;

// ===== Helicóptero do jogador =====
export const HELI_LARGURA = 36;
export const HELI_ALTURA = 26;
/** Posição Y da linha de fuga — o helicóptero fica na metade inferior da tela. */
export const HELI_LINHA_Y = 452;
/** Velocidade horizontal base de manobra (px/s). */
export const HELI_VEL_X = 242;

// ===== Rolagem (o mundo desce, o helicóptero avança) =====
/** Velocidade vertical padrão do percurso — ritmo de cruzeiro. */
export const ROLAGEM_PADRAO = 96;
/** Limite máximo ao segurar CIMA (acelera). */
export const ROLAGEM_MAX = 172;
/** Limite mínimo ao segurar BAIXO (freia). */
export const ROLAGEM_MIN = 60;
/** Aceleração ao segurar CIMA (px/s²). */
export const ROLAGEM_ACELERAR = 230;
/** Desaceleração ao segurar BAIXO (px/s²). */
export const ROLAGEM_FREAR = 300;
/** Retorno ao cruzeiro quando solta os comandos (px/s²). */
export const ROLAGEM_RETORNO = 190;

// ===== Armadura e vidas =====
/** Pontos de armadura no total (3 ícones com meios). */
export const ARMADURA_MAX = 6;
/** Pontos de dano de uma bala inimiga. */
export const DANO_BALA_INIMIGA = 1;
/** Pontos de dano de um míssil inimigo. */
export const DANO_MISSIL_INIMIGO = 2;
/** Pontos de dano ao colidir com obstáculo sólido ou bateria. */
export const DANO_OBSTACULO = 2;
/** Invulnerabilidade após tomar qualquer dano (segundos). */
export const INVULNERAVEL_SEG = 1.5;
/** Vidas iniciais por partida. */
export const VIDAS_INICIAIS = 3;
export const VIDAS_MAX = 6;
export const PONTOS_VIDA_EXTRA = 15000;

// ===== Armas do jogador =====
/** Cadência das balas (tiros por segundo). */
export const BALAS_POR_SEGUNDO = 6;
/** Limite de balas na tela ao mesmo tempo (evita spam visual). */
export const MAX_BALAS_NA_TELA = 4;
/** Dano de cada bala. */
export const DANO_BALA = 1;
/** Cadência dos mísseis (segundos entre lançamentos). */
export const MISSIL_COOLDOWN = 0.5;
/** Dano de cada míssil. */
export const DANO_MISSIL = 8;
/** Raio da explosão de área do míssil (px). */
export const MISSIL_RAIO_EXPLOSAO = 24;
/** Estoque de mísseis por missão, somado a cada ciclo. */
export const MISSEIS_INICIAIS = [10, 12, 14, 16, 18];
/** Bônus de mísseis por ciclo adicional. */
export const MISSEIS_POR_CICLO = 2;

// ===== Combustível =====
export const COMBUSTIVEL_MAX = 100;
export const COMBUSTIVEL_INICIAL = 100;
/** Consumo por segundo em cruzeiro. */
export const COMBUSTIVEL_GASTO_BASE = 2.6;
/** Consumo por segundo com CIMA segurado. */
export const COMBUSTIVEL_GASTO_ACELERANDO = 5.2;
/** Consumo por segundo com BAIXO segurado. */
export const COMBUSTIVEL_GASTO_DESACELERADO = 1.4;

// ===== Avião-tanque =====
/** Quanto tempo a conexão precisa ser mantida para completar o reabastecimento. */
export const TANKER_TEMPO_CONEXAO = 2;
/** Dimensões da zona de conexão para reabastecer (largura × altura) — mantido como hoje. */
export const TANKER_ZONA_LARGURA = 48;
export const TANKER_ZONA_ALTURA = 24;
export const TANKER_VEL_Y = -110;
export const TANKER_X = LARGURA / 2 - 22;
/** Primeira aparição do tanque na missão 1 (segundos). */
export const TANKER_MISSAO1_APARICAO = 22;
/** Mísseis repostos pelo tanque em cada reabastecimento. */
export const MISSEIS_REPOSTOS_POR_TANK = 2;

// ===== Inimigos =====
/** Velocidade da bala inimiga (px/s). */
export const BALA_INIMIGA_VEL = 220;
/** Velocidade e curvatura do míssil inimigo guiado. */
export const MISSIL_INIMIGO_VEL = 118;
export const MISSIL_INIMIGO_CURVA = 1.15;
/** Duração do míssil inimigo (segundos). */
export const MISSIL_INIMIGO_VIDA = 3;
/** Pontos por derrubar um míssil inimigo com tiro. */
export const PONTOS_MISSIL_DERRUBADO = 50;

// ===== Pontuação =====
export const PONTOS_DRONE = 125;
export const PONTOS_BATERIA = 200;
export const PONTOS_TANKER = 100;
export const PONTOS_CHEFÃO = 2000;
/** Bônus por voar rente às montanhas/prédios (só Missões 2 e 4). */
export const PONTOS_RASANTE_POR_SEGUNDO = 10;

// ===== Hora do dia e clima =====
/** Duração mínima que qualquer perigo fica visível na tela antes de poder atingir. */
export const AVISO_MINIMO_SEG = 0.6;
/** Distância mínima que qualquer obstáculo/perigo aparece do helicóptero (px). */
export const MINIMA_DISTANCIA_PERIGO = 160;

// ===== Missões e progressão =====
/** Duração aproximada do percurso, em segundos. */
export const PERCURSO_SEG = [70, 75, 80, 80, 85];
/** Vida inicial do chefão por missão. */
export const CHEFE_VIDA = [60, 80, 100, 120, 150];
/** Bônus por ciclo adicional na vida do chefão. */
export const CHEFE_VIDA_POR_CICLO = 15;

// Pontos de dano no obstáculo sólido (rocha, pico, prédio, copa, torre).
// Definido uma vez e reutilizado.
export const DANO_SOLIDO = DANO_OBSTACULO;

// ===== Ciclos (dificuldade crescente) =====
/**
 * Cada ciclo adicional aumenta inimigos e mísseis inimigos e reduz suprimentos.
 * O ciclo é mostrado no HUD e entra na fórmula das missões.
 */
export const CICLO_EXTRA = {
  /** Multiplicador de quantidade de inimigos. */
  multiplicadorInimigos: 1.16,
  /** Multiplicador de velocidade de mísseis inimigos. */
  multiplicadorMissil: 1.12,
  /** Redução de combustível por ciclo (não afeta o tanque). */
  combustivelExtra: 0,
};

// ===== Decisão de vitória por missão (Stage 1: termina após o tanque) =====
export const MISSAO_1_PONTOS = {
  titulo: 'LITORAL',
  regiao: 'LITORAL DO BRASIL',
  hora: 'MANHÃ',
  clima: 'CÉU LIMPO',
  descricao: 'DO MAR ÀS DUNAS, DESVIE DOS DRONES E DESTRUA AS BATERIAS COSTEIRAS.',
};

/** Tipo de bioma (região) de cada missão. */
export type TipoBioma = 'litoral' | 'serra' | 'sertaao' | 'cidade' | 'floresta';

// Limites de segurança (para o jogo nunca ficar impossível)
export const MAX_DRONES_TELA = 6;
export const MAX_MISSEIS_INIMIGO_TELA = 3;

/** Pontos por completar um reabastecimento no ar. */
export const PONTOS_RECARGA = 100;

// ===== Chefe =====
/** Pausa de aviso ao mudar de etapa (segundos). */
export const CHEFE_PAUSA_ETAPA = 1.5;
/** Dano da bala do chefão. */
export const CHEFE_DANO_BALA = 1;
/** Dano do míssil do chefão. */
export const CHEFE_DANO_MISSIL = 2;
/** Pontos por derrotar o chefão. */
export const PONTOS_CHEFÃO_VALOR = 2000;
/** Velocidade de movimentação do chefão em cada etapa (px/s). */
export const CHEFE_VEL_ETAPA = [62, 88, 106];
/** Intervalo entre disparos do chefão em cada etapa (segundos). */
export const CHEFE_CADENCIA_ETAPA = [1.35, 0.95, 0.72];
