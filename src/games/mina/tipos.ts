export type EstadoJogo = 'titulo' | 'jogando' | 'morrendo' | 'resgate' | 'gameover';

export type TipoCriatura = 'morcego' | 'aranha' | 'cobra' | 'mariposa' | 'piranha';

export interface Ponto {
  x: number;
  y: number;
}

export interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface Sala {
  indice: number;
  coluna: number;
  linha: number;
  x: number;
  y: number;
  largura: number;
  altura: number;
  escura: boolean;
  temLava: boolean;
  temAgua: boolean;
}

export interface Cristal {
  id: number;
  x: number;
  y: number;
  tipo: number;
  cor: string;
  pontos: number;
  coletado: boolean;
  tempo: number;
}

export interface Lampada {
  id: number;
  sala: number;
  x: number;
  y: number;
  acesa: boolean;
  brilho: number;
}

export interface CriaturaSpawn {
  id: number;
  tipo: TipoCriatura;
  sala: number;
  x: number;
  y: number;
}

export interface LavaMovel {
  x: number;
  y: number;
  baseX: number;
  largura: number;
  altura: number;
  amplitude: number;
  velocidade: number;
  tempo: number;
}

export interface MapaMina {
  largura: number;
  altura: number;
  tiles: Uint8Array;
  fragilHp: Map<number, number>;
  lavaApagada: Map<number, number>;
  salas: Sala[];
  cristais: Cristal[];
  lampadas: Lampada[];
  spawns: CriaturaSpawn[];
  lavaMoveis: LavaMovel[];
  inicio: Ponto;
  minerador: Ponto;
  salaInicial: number;
  salaFinal: number;
  totalCristais: number;
}

export interface Heroina {
  x: number;
  y: number;
  largura: number;
  altura: number;
  vx: number;
  vy: number;
  olhando: number;
  noChao: boolean;
  energia: number;
  calor: number;
  travado: boolean;
  tempoTrava: number;
  invulneravel: number;
  emAgua: boolean;
  propulsor: boolean;
  andando: boolean;
  animacao: number;
}

export interface Criatura {
  id: number;
  tipo: TipoCriatura;
  sala: number;
  x: number;
  y: number;
  largura: number;
  altura: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  direcao: number;
  tempo: number;
  vivo: boolean;
  animacao: number;
}

export interface Dinamite {
  x: number;
  y: number;
  vx: number;
  vy: number;
  largura: number;
  altura: number;
  noChao: boolean;
  tempo: number;
  pisca: number;
}

export interface GotaLava {
  x: number;
  y: number;
  vy: number;
  ativa: boolean;
  tempo: number;
}

export interface Laser {
  ativo: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  calor: number;
  travado: boolean;
  tempoTrava: number;
  tempoDano: number;
  tempoSom: number;
}

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  maxVida: number;
  tamanho: number;
  cor: string;
  gravidade: number;
  brilho: boolean;
}

export interface TextoFlutuante {
  x: number;
  y: number;
  texto: string;
  cor: string;
  vida: number;
  maxVida: number;
}

export interface Camera {
  x: number;
  y: number;
  tremor: number;
}

export interface FonteLuz {
  x: number;
  y: number;
  raio: number;
  forca: number;
  cor: string;
}

export interface EstadoHUD {
  energia: number;
  dinamites: number;
  calor: number;
  travado: boolean;
  fase: number;
  vidas: number;
  cristais: number;
  totalCristais: number;
  sala: number;
  totalSalas: number;
  resgatado: boolean;
}
