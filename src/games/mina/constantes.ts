export const LARGURA = 480;
export const ALTURA = 560;
export const HUD_ALTURA = 48;

export const TILE = 16;
export const SALA_LARGURA = 13;
export const SALA_ALTURA = 8;
export const SALA_GAP = 2;
export const MARGEM = 3;
export const TOPO_CEU = 8;
export const COLUNAS = 3;
export const LINHAS = 4;
export const SALAS_MAX = COLUNAS * LINHAS;
export const MAPA_LARGURA = MARGEM * 2 + COLUNAS * SALA_LARGURA + (COLUNAS - 1) * SALA_GAP;
export const MAPA_ALTURA = TOPO_CEU + 3 + LINHAS * SALA_ALTURA + (LINHAS - 1) * SALA_GAP + 3;
export const MUNDO_LARGURA = MAPA_LARGURA * TILE;
export const MUNDO_ALTURA = MAPA_ALTURA * TILE;

export const TILE_VAZIO = 0;
export const TILE_ROCHA = 1;
export const TILE_FRAGIL = 2;
export const TILE_LAVA_PAREDE = 3;
export const TILE_AGUA = 4;
export const TILE_LAVA = 5;
export const TILE_MADEIRA = 6;

export const FRAGIL_VIDA = 3;
export const LAVA_APAGADA_TEMPO = 5;

export const VIDAS_INICIAIS = 3;
export const VIDAS_MAX = 6;
export const PONTOS_VIDA_EXTRA = 20000;
export const ENERGY_MAX = 100;
export const DINAMITE_FUSIVEL = 3;
export const DINAMITE_RAIO = 32;
export const LASER_ALCANCE = 128;
export const LASER_CALOR_MAX = 1.5;
export const LASER_TRAVA = 1;
export const LASER_DANO_INTERVALO = 0.18;
export const INVULNERAVEL_TEMPO = 1.5;
export const MORTE_TEMPO = 1.1;
export const RESGATE_TEMPO = 3.2;

export const GRAVIDADE = 430;
export const GRAVIDADE_AGUA = 120;
export const VELOCIDADE_ANDAR = 95;
export const ACELERACAO = 720;
export const ATRITO = 900;
export const ACELERACAO_PROPULSOR = 980;
export const SUBIDA_MAX = 165;
export const QUEDA_MAX = 300;
export const MERGULHO_MAX = 240;
export const PROPULSOR_AGUA = 480;
export const SUBIDA_AGUA_MAX = 85;
export const CONSUMO_PROPULSOR = 3;
export const CONSUMO_CHAO = 0.2;
export const CONSUMO_LASER = 1.5;

export const JOGADOR_LARGURA = 12;
export const JOGADOR_ALTURA = 28;

export const PONTOS = {
  morcego: 50,
  aranha: 75,
  cobra: 100,
  mariposa: 150,
  sala: 100,
  exploracao: 50,
  resgateBase: 1000,
} as const;

export const CORES = {
  fundo: '#090713',
  fundoClaro: '#16101f',
  rocha: '#4a2f26',
  rochaClara: '#6b4432',
  rochaEscura: '#2b1a18',
  fragil: '#8b5a34',
  fragilClara: '#b47a45',
  madeira: '#8b5a2b',
  madeiraClara: '#c08445',
  madeiraEscura: '#5b351c',
  ouro: '#fbbf24',
  ouroClaro: '#fde68a',
  ouroEscuro: '#b45309',
  laranja: '#f97316',
  lava: '#ef4444',
  lavaClara: '#fbbf24',
  lavaEscura: '#991b1b',
  agua: '#0ea5e9',
  aguaClara: '#67e8f9',
  aguaEscura: '#075985',
  branco: '#f8fafc',
  cinza: '#94a3b8',
  cinzaEscuro: '#334155',
  preto: '#020617',
  verde: '#22c55e',
  verdeClaro: '#86efac',
  rosa: '#f472b6',
  rosaClaro: '#fbcfe8',
  roxo: '#8b5cf6',
  azul: '#38bdf8',
  amarelo: '#facc15',
  vermelho: '#ef4444',
  pele: '#f1b27a',
  peleEscura: '#c27a45',
  capacete: '#facc15',
  capaceteEscuro: '#ca8a04',
  macacao: '#f59e0b',
  macacaoEscuro: '#b45309',
  bota: '#3f2a1d',
} as const;

export const NOMES_CRISTAL = ['ÂMBAR', 'TURQUESA', 'AMETISTA', 'RUBI'] as const;
export const CORES_CRISTAL = ['#fbbf24', '#22d3ee', '#a78bfa', '#fb7185'] as const;
export const PONTOS_CRISTAL = [100, 200, 300, 500] as const;

export const ORDEM_SALAS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 1],
  [1, 0],
  [2, 0],
  [2, 1],
  [2, 2],
  [3, 2],
  [3, 1],
  [3, 0],
];
