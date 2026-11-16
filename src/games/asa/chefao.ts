/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Chefões — Corsário (M1), Condor de Aço (M2) e Escorpião do Deserto (M3). */

import {
  CHEFE_CADENCIA_ETAPA,
  CHEFE_DANO_BALA,
  CHEFE_DANO_MISSIL,
  CHEFE_PAUSA_ETAPA,
  CHEFE_VEL_ETAPA,
} from './config';

export type TipoChefe = 'corsario' | 'condor' | 'escorpiao' | 'colmeia' | 'tempestade';
export type EtapaChefe = 1 | 2 | 3;

export interface Chefe {
  tipo: TipoChefe;
  x: number;
  y: number;
  /** Fase do movimento (usada para senoidais e circulações). */
  fase: number;
  vida: number;
  vidaMax: number;
  etapa: EtapaChefe;
  pausaEtapa: number;
  flash: number;
  timer: number;
  circulando: boolean;
  /** Segundos restantes da entrada (queda dramática). */
  entrando: number;
  /** Para o Condor: segundos restantes do aviso de mergulho. */
  mergulhoAviso: number;
  /** Direção do mergulho (-1 esquerda, +1 direita). */
  mergulhoDirecao: 1 | -1;
  /** Para o Escorpião do Deserto: segundos restantes do aviso do feixe. */
  feixeAviso: number;
  /** Direção do feixe enquanto varre. */
  feixeFase: number;
}

/** Assinatura uniforme por missão: (Vida, Fase Inicial, Tipo). */
export function criarChefe(
  tipo: TipoChefe,
  vidaMaxima: number
): Chefe {
  const base: Chefe = {
    tipo,
    x: 240,
    y: -70,
    fase: 0,
    vida: vidaMaxima,
    vidaMax: vidaMaxima,
    etapa: 1,
    pausaEtapa: 0,
    flash: 0,
    timer: 1.6,
    circulando: false,
    entrando: 1.4,
    mergulhoAviso: 0,
    mergulhoDirecao: 1,
    feixeAviso: 0,
    feixeFase: 0,
  };
  // Os patrões ficam escondidos acima da tela ao entrar
  return base;
}

export function etapaDoChefe(vida: number, vidaMax: number): EtapaChefe {
  const fracao = vida / vidaMax;
  if (fracao > 2 / 3) return 1;
  if (fracao > 1 / 3) return 2;
  return 3;
}

/**
 * Atualiza o chefão. Retorna 'mudouEtapa' quando muda de fase
 * (quem chama toca o som e mostra o banner).
 */
export function atualizarChefe(
  c: Chefe,
  alvoX: number,
  alvoY: number,
  dt: number
): 'mudouEtapa' | null {
  c.flash = Math.max(0, c.flash - dt * 4);
  c.fase += dt;
  c.mergulhoAviso = Math.max(0, c.mergulhoAviso - dt);
  c.feixeAviso = Math.max(0, c.feixeAviso - dt);

  const etapaNova = etapaDoChefe(c.vida, c.vidaMax);
  if (etapaNova !== c.etapa) {
    c.etapa = etapaNova;
    c.pausaEtapa = CHEFE_PAUSA_ETAPA;
    c.timer = CHEFE_PAUSA_ETAPA + 0.4;
    c.circulando = etapaNova === 2;
    return 'mudouEtapa';
  }

  if (c.pausaEtapa > 0) {
    c.pausaEtapa -= dt;
    return null;
  }

  // Entrada dramática
  if (c.entrando > 0) {
    c.entrando = Math.max(0, c.entrando - dt);
    const alvo = 148;
    c.y += (alvo - c.y) * Math.min(1, dt * 3.2);
    c.x = 240 + Math.sin(c.fase * 1.8) * 30;
    if (c.entrando <= 0) c.y = alvo;
    return null;
  }

  const velocidade = CHEFE_VEL_ETAPA[c.etapa - 1];

  if (c.tipo === 'condor') {
    // Condor desliza em arco amplo; o mergulho lateral é mais brusco nas etapas finais
    const raio = 132;
    c.x = 240 + Math.sin(c.fase * 0.8) * raio;
    c.y = 128 + Math.cos(c.fase * 0.55) * 34;
  } else if (c.tipo === 'escorpiao') {
    // O escorpião avança e recua devagar no topo
    c.x = 240 + Math.sin(c.fase * 0.6) * 140;
    c.y = 112 + Math.cos(c.fase * 0.4) * 26;
  } else if (c.tipo === 'colmeia') {
    // A colmeia plana devagar, pairando
    c.x = 240 + Math.sin(c.fase * 0.5) * 120;
    c.y = 108 + Math.cos(c.fase * 0.32) * 22;
  } else if (c.tipo === 'tempestade') {
    // Senhor da Tempestade avança em arco largo e pulsante
    c.x = 240 + Math.sin(c.fase * 0.7) * 140;
    c.y = 98 + Math.cos(c.fase * 0.48) * 34;
  } else {
    // Corsário
    if (c.etapa === 2) {
      const raio = 120;
      c.x = 240 + Math.cos(c.fase * 0.9) * raio;
      c.y = 152 + Math.sin(c.fase * 1.3) * 44;
    } else {
      c.x = 240 + Math.sin(c.fase * 0.75) * 150;
      c.y = 148 + Math.cos(c.fase * 0.5) * 48;
    }
  }

  c.timer -= dt;
  void velocidade;
  return null;
}

export interface DisparoChefe {
  balas: { x: number; y: number; vx: number; vy: number }[];
  misseis: { x: number; y: number; vx: number; vy: number }[];
  /** Mensagem de aviso para mostrar na tela (ex: "MERGULHO!" ou "FEIXE!"). */
  avisoTexto: string | null;
}

/** Decide e gera o próximo disparo do chefão. */
export function decidirDisparoChefe(
  c: Chefe,
  alvoX: number,
  alvoY: number
): DisparoChefe | null {
  if (c.pausaEtapa > 0 || c.entrando > 0) return null;
  if (c.timer > 0) return null;

  c.timer = CHEFE_CADENCIA_ETAPA[c.etapa - 1] * (0.75 + Math.random() * 0.5);

  const dx = alvoX - c.x;
  const dy = alvoY - c.y;
  const dist = Math.hypot(dx, dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  const disparo: DisparoChefe = { balas: [], misseis: [], avisoTexto: null };

  if (c.tipo === 'condor') {
    // Penas em leque
    const baseAng = Math.atan2(dirY, dirX);
    const penas = c.etapa === 1 ? 4 : c.etapa === 2 ? 5 : 6;
    for (let i = -Math.floor(penas / 2); i <= Math.floor(penas / 2); i++) {
      const ang = baseAng + i * 0.24;
      const vel = 210 + c.etapa * 24;
      disparo.balas.push({
        x: c.x,
        y: c.y + 10,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
      });
    }
    // Aviso de mergulho a cada 2 rajadas (etapa 2+)
    if (c.etapa >= 2 && Math.random() < 0.34) {
      c.mergulhoAviso = 0.9;
      c.mergulhoDirecao = Math.random() < 0.5 ? -1 : 1;
      disparo.avisoTexto = c.mergulhoDirecao === -1 ? '◀ MERGULHO!' : 'MERGULHO! ▶';
    }
  } else if (c.tipo === 'escorpiao') {
    // Tiros em leque, sempre
    const baseAng = Math.atan2(dirY, dirX);
    const penas = c.etapa === 1 ? 4 : c.etapa === 2 ? 5 : 6;
    for (let i = -Math.floor(penas / 2); i <= Math.floor(penas / 2); i++) {
      const ang = baseAng + i * 0.26;
      const vel = 215 + c.etapa * 20;
      disparo.balas.push({
        x: c.x,
        y: c.y + 12,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
      });
    }
    // Feixe do canhão a cada 2 rajadas (etapa 2+)
    if (c.etapa >= 2 && Math.random() < 0.38) {
      c.feixeAviso = 0.9;
      c.feixeFase = 0;
      disparo.avisoTexto = 'FEIXE!';
    }
  } else if (c.tipo === 'colmeia') {
    // Solta enxame de mini-drones + mísseis ocasionais
    const baseAng = Math.atan2(dirY, dirX);
    // Leque fraco (não é o foco) — fóco: enxame
    const penas = c.etapa === 1 ? 3 : c.etapa === 2 ? 4 : 5;
    for (let i = -Math.floor(penas / 2); i <= Math.floor(penas / 2); i++) {
      const ang = baseAng + i * 0.28;
      const vel = 180 + c.etapa * 22;
      disparo.balas.push({
        x: c.x,
        y: c.y + 12,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
      });
    }
    // Míssil extra nas etapas 2 e 3
    if (Math.random() < (c.etapa === 1 ? 0.25 : c.etapa === 2 ? 0.45 : 0.6)) {
      disparo.misseis.push({ x: c.x, y: c.y + 14, vx: dirX * 170, vy: dirY * 170 + 10 });
    }
  } else if (c.tipo === 'tempestade') {
    // Senhor da Tempestade: rajadas elétricas brutas, cada vez mais longas
    const baseAng = Math.atan2(dirY, dirX);
    const penas = c.etapa === 1 ? 5 : c.etapa === 2 ? 6 : 7;
    for (let i = -Math.floor(penas / 2); i <= Math.floor(penas / 2); i++) {
      const ang = baseAng + i * 0.22;
      const vel = 225 + c.etapa * 26;
      disparo.balas.push({
        x: c.x,
        y: c.y + 12,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
      });
    }
    // Míssil pesado etapa 2+
    if (c.etapa >= 2 && Math.random() < 0.4) {
      disparo.misseis.push({ x: c.x, y: c.y + 14, vx: dirX * 160, vy: dirY * 160 + 10 });
    }
    // Feixe/raio brutal na etapa 3 — aviso visual
    if (c.etapa === 3 && Math.random() < 0.36) {
      disparo.avisoTexto = 'RAIO!';
    }
  } else {
    // Corsário
    if (c.etapa === 1) {
      for (let i = -1; i <= 1; i++) {
        disparo.balas.push({
          x: c.x + i * 14,
          y: c.y + 12,
          vx: dirX * 200 + i * 40,
          vy: dirY * 200 + 40,
        });
      }
    } else if (c.etapa === 2) {
      disparo.balas.push({ x: c.x - 10, y: c.y + 12, vx: dirX * 210 - 30, vy: dirY * 210 + 30 });
      disparo.balas.push({ x: c.x + 10, y: c.y + 12, vx: dirX * 210 + 30, vy: dirY * 210 + 30 });
      if (Math.random() < 0.55) {
        disparo.misseis.push({ x: c.x, y: c.y + 14, vx: dirX * 130, vy: dirY * 130 + 10 });
      }
    } else {
      const baseAng = Math.atan2(dirY, dirX);
      for (let i = -2; i <= 2; i++) {
        const ang = baseAng + i * 0.28;
        const vel = 230;
        disparo.balas.push({
          x: c.x,
          y: c.y + 12,
          vx: Math.cos(ang) * vel,
          vy: Math.sin(ang) * vel,
        });
      }
      disparo.misseis.push({ x: c.x, y: c.y + 14, vx: dirX * 140, vy: dirY * 140 + 10 });
    }
  }

  return disparo;
}

export const chefeDanoBala = (): number => CHEFE_DANO_BALA;
export const chefeDanoMissil = (): number => CHEFE_DANO_MISSIL;

function retangulo(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cor: string
): void {
  g.fillStyle = cor;
  g.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/** Desenha o chefão conforme o tipo. */
export function desenharChefe(g: CanvasRenderingContext2D, c: Chefe, tempo: number): void {
  g.save();
  g.translate(c.x, c.y);

  const flash = c.flash > 0 && Math.floor(tempo * 8) % 2 === 0;

  // Sombra sob o capote
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(-30, 118, 60, 4);

  if (c.tipo === 'corsario') {
    // Corpo do helicóptero (escuro com faixa vermelha)
    retangulo(g, -26, -16, 52, 26, flash ? '#FFFFFF' : '#1F2937');
    retangulo(g, -26, -16, 52, 5, flash ? '#FFFFFF' : '#374151');
    retangulo(g, -26, -3, 52, 6, flash ? '#FFFFFF' : '#DC2626');
    // Cabine
    retangulo(g, -18, -10, 36, 12, flash ? '#FFFFFF' : '#0F172A');
    retangulo(g, -14, -8, 8, 8, flash ? '#FFFFFF' : '#7F1D1D');
    retangulo(g, 6, -8, 8, 8, flash ? '#FFFFFF' : '#7F1D1D');
    // Patas
    retangulo(g, -20, 10, 6, 8, '#0F172A');
    retangulo(g, 14, 10, 6, 8, '#0F172A');
    // Rotor principal
    const fase = Math.floor(tempo * 10) % 2 === 0;
    if (fase) {
      retangulo(g, -46, -22, 92, 4, flash ? '#FFFFFF' : '#111827');
      retangulo(g, -3, -25, 6, 6, flash ? '#FFFFFF' : '#374151');
    } else {
      retangulo(g, -28, -21, 56, 3, flash ? '#FFFFFF' : '#1F2937');
      retangulo(g, -3, -25, 6, 5, flash ? '#FFFFFF' : '#374151');
      retangulo(g, -47, -21, 4, 3, '#DC2626');
      retangulo(g, 43, -21, 4, 3, '#DC2626');
    }
    // Pontas vermelhas no rotor
    retangulo(g, -47, -22, 4, 2, flash ? '#FFFFFF' : '#DC2626');
    retangulo(g, 43, -22, 4, 2, flash ? '#FFFFFF' : '#DC2626');
  } else if (c.tipo === 'condor') {
    // Corpo: ave-drone gigante marrom/oliva
    retangulo(g, -30, -14, 60, 22, flash ? '#FFFFFF' : '#3F3F46');
    retangulo(g, -30, -14, 60, 5, flash ? '#FFFFFF' : '#52525B');
    // Penas (asas)
    retangulo(g, -44, -10, 16, 16, flash ? '#FFFFFF' : '#27272A');
    retangulo(g, 28, -10, 16, 16, flash ? '#FFFFFF' : '#27272A');
    // Cabeça
    retangulo(g, -10, -22, 20, 12, flash ? '#FFFFFF' : '#1F2937');
    // Bico/garras amarelas
    retangulo(g, -6, -12, 4, 4, flash ? '#FFFFFF' : '#FBBF24');
    retangulo(g, 2, -12, 4, 4, flash ? '#FFFFFF' : '#FBBF24');
    // Olhos vermelhos brilham
    retangulo(g, -7, -18, 4, 3, '#EF4444');
    retangulo(g, 3, -18, 4, 3, '#EF4444');
    // Aviso de mergulho (seta piscando de um lado)
    if (c.mergulhoAviso > 0) {
      const pisca = Math.floor(tempo * 8) % 2 === 0;
      if (pisca) {
        g.fillStyle = '#FDE047';
        const dir = c.mergulhoDirecao;
        g.beginPath();
        if (dir === -1) {
          g.moveTo(-58, -4); g.lineTo(-46, -12); g.lineTo(-46, 4);
        } else {
          g.moveTo(58, -4); g.lineTo(46, -12); g.lineTo(46, 4);
        }
        g.closePath();
        g.fill();
      }
    }
  } else if (c.tipo === 'escorpiao') {
    // Casco blindado com cauda-canhão
    retangulo(g, -28, -12, 56, 20, flash ? '#FFFFFF' : '#44403C');
    retangulo(g, -28, -12, 56, 6, flash ? '#FFFFFF' : '#57534E');
    // Placas blindadas
    retangulo(g, -22, -4, 44, 4, flash ? '#FFFFFF' : '#292524');
    // Canhão da cauda (volta para a esquerda)
    retangulo(g, -40, -10, 12, 6, flash ? '#FFFFFF' : '#1C1917');
    retangulo(g, -46, -12, 6, 10, flash ? '#FFFFFF' : '#0F172A');
    // Olhos/sensação
    retangulo(g, -14, -6, 4, 3, '#F97316');
    retangulo(g, 10, -6, 4, 3, '#F97316');
    // Aviso do feixe (arco de carga brilhando)
    if (c.feixeAviso > 0) {
      const pisca = Math.floor(tempo * 8) % 2 === 0;
      if (pisca) {
        g.strokeStyle = '#FBBF24';
        g.lineWidth = 3;
        g.beginPath();
        g.arc(-46, -7, 10 + Math.sin(tempo * 20) * 2, 0, Math.PI * 2);
        g.stroke();
      }
    }
  } else if (c.tipo === 'colmeia') {
    // Nave-mãe colmeia (oval escuro com colméias amarelas)
    retangulo(g, -34, -14, 68, 22, flash ? '#FFFFFF' : '#1E1B4B');
    retangulo(g, -34, -14, 68, 6, flash ? '#FFFFFF' : '#312E81');
    // Colméioas (células hexagonais)
    for (let i = -22; i <= 22; i += 16) {
      retangulo(g, i - 5, -6, 10, 12, flash ? '#FFFFFF' : '#FBBF24');
      retangulo(g, i - 5, -6, 10, 2, flash ? '#FFFFFF' : '#FDE047');
    }
    // Núcleo central brilhante
    retangulo(g, -8, -4, 16, 6, flash ? '#FFFFFF' : '#EF4444');
    retangulo(g, -4, -3, 8, 4, flash ? '#FFFFFF' : '#FECACA');
    // Antenas
    retangulo(g, -16, -20, 2, 8, flash ? '#FFFFFF' : '#FBBF24');
    retangulo(g, 14, -20, 2, 8, flash ? '#FFFFFF' : '#FBBF24');
  } else if (c.tipo === 'tempestade') {
    // Senhor da Tempestade (nuvem eletrizante indigo claro)
    retangulo(g, -32, -16, 64, 26, flash ? '#FFFFFF' : '#4338CA');
    retangulo(g, -32, -16, 64, 7, flash ? '#FFFFFF' : '#6366F1');
    // Nuvem sobreposta (cubos em várias camadas)
    retangulo(g, -22, -24, 44, 10, flash ? '#FFFFFF' : '#6366F1');
    retangulo(g, -26, -22, 10, 6, flash ? '#FFFFFF' : '#818CF8');
    retangulo(g, 16, -22, 10, 6, flash ? '#FFFFFF' : '#818CF8');
    // Núcleo elétrico (amarelo-branco)
    retangulo(g, -6, -6, 12, 6, flash ? '#FFFFFF' : '#FEF08A');
    // Raios saindo (amarelos/brancos)
    g.fillStyle = flash ? '#FFFFFF' : '#FBBF24';
    g.fillRect(-2, -2, 4, 12);
    g.fillRect(-10, 8, 3, 8);
    g.fillRect(7, 8, 3, 8);
    // Olhos da tempestade
    retangulo(g, -14, -8, 4, 4, '#FDE047');
    retangulo(g, 10, -8, 4, 4, '#FDE047');
  }

  g.restore();
}

/** Barra de vida do chefão com o nome. */
export function desenharBarraChefe(
  g: CanvasRenderingContext2D,
  c: Chefe,
  nome: string,
  tempo: number
): void {
  g.save();

  // Fundo do painel
  g.fillStyle = 'rgba(3, 7, 18, 0.92)';
  g.fillRect(0, 48, 480, 44);
  g.fillStyle = 'rgba(220, 38, 38, 0.35)';
  g.fillRect(0, 91, 480, 1);

  // Nome
  g.font = '8px "Press Start 2P", monospace';
  g.textAlign = 'center';
  g.fillStyle = '#FECACA';
  g.fillText(`CHEFÃO: ${nome}`, 240, 62);

  // Barra de vida
  const fracao = Math.max(0, Math.min(1, c.vida / c.vidaMax));
  const largura = 400;
  const bx = (480 - largura) / 2;
  const by = 70;
  g.fillStyle = '#111827';
  g.fillRect(bx, by, largura, 14);
  const cor = fracao > 0.66 ? '#22C55E' : fracao > 0.33 ? '#FBBF24' : '#EF4444';
  g.fillStyle = cor;
  g.fillRect(bx, by, Math.floor(largura * fracao), 14);
  // Divisores das etapas
  g.fillStyle = '#0F172A';
  g.fillRect(bx + Math.floor(largura / 3), by, 2, 14);
  g.fillRect(bx + Math.floor((largura * 2) / 3), by, 2, 14);
  // Brilho
  g.fillStyle = 'rgba(255,255,255,0.25)';
  g.fillRect(bx, by, Math.floor(largura * fracao), 3);

  g.restore();
}
