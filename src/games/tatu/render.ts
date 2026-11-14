/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FrutaBonus } from './frutas';
import { MAZE_COLS, MAZE_OFFSET_X, MAZE_OFFSET_Y, MAZE_ROWS, TILE_SIZE } from './mapa';
import { Sombra } from './sombras';
import { TatuHero } from './tatu';

export const PALETA_TATU = {
  paredeAzul: '#0284C7',
  paredeAzulClaro: '#38BDF8',
  paredeGlow: 'rgba(56, 189, 248, 0.25)',
  portaoToca: '#EC4899',
  semente: '#FEF08A',
  pimentaVermelha: '#EF4444',
  pimentaLaranja: '#F97316',
  pimentaVerde: '#22C55E',
  tatuCarapaca: '#A8A29E',
  tatuCarapacaEscura: '#57534E',
  tatuPele: '#D6D3D1',
  tatuOlho: '#1C1917',
  tatuNeon: '#84CC16',
  sombraAssustadaAzul: '#38BDF8',
  sombraAssustadaBranco: '#F8FAFC',
};

/**
 * Desenha o labirinto (paredes com cantos luminosos, portão da toca, sementes e pimentas).
 */
export function renderizarLabirinto(
  g: CanvasRenderingContext2D,
  grid: number[][],
  piscarLabirinto = false
): void {
  const tempo = performance.now() / 250;
  const corParede = piscarLabirinto
    ? Math.floor(tempo * 2) % 2 === 0
      ? '#FFFFFF'
      : '#38BDF8'
    : PALETA_TATU.paredeAzul;

  const corParedeBrilho = piscarLabirinto ? '#FFFFFF' : PALETA_TATU.paredeAzulClaro;

  for (let r = 0; r < MAZE_ROWS; r++) {
    for (let c = 0; c < MAZE_COLS; c++) {
      const tile = grid[r][c];
      const px = MAZE_OFFSET_X + c * TILE_SIZE;
      const py = MAZE_OFFSET_Y + r * TILE_SIZE;

      // 1. Parede
      if (tile === 1) {
        g.fillStyle = corParede;
        g.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Contorno interno luminoso para estética arcade clássica
        g.fillStyle = corParedeBrilho;
        const ehVizinhoCima = r > 0 && grid[r - 1][c] === 1;
        const ehVizinhoBaixo = r < MAZE_ROWS - 1 && grid[r + 1][c] === 1;
        const ehVizinhoEsq = c > 0 && grid[r][c - 1] === 1;
        const ehVizinhoDir = c < MAZE_COLS - 1 && grid[r][c + 1] === 1;

        if (!ehVizinhoCima) g.fillRect(px, py, TILE_SIZE, 2.5);
        if (!ehVizinhoBaixo) g.fillRect(px, py + TILE_SIZE - 2.5, TILE_SIZE, 2.5);
        if (!ehVizinhoEsq) g.fillRect(px, py, 2.5, TILE_SIZE);
        if (!ehVizinhoDir) g.fillRect(px + TILE_SIZE - 2.5, py, 2.5, TILE_SIZE);

        // Cantos arredondados: só nos vértices expostos à passagem
        const ehParede = (r: number, c: number) =>
          r >= 0 && r < MAZE_ROWS && c >= 0 && c < MAZE_COLS && grid[r][c] === 1;
        const cantos: { cx: number; cy: number; vizA: [number, number]; vizB: [number, number]; arco: [number, number, number, number] }[] = [
          { cx: px, cy: py, vizA: [r - 1, c], vizB: [r, c - 1], arco: [px + 5, py + 5, Math.PI, Math.PI * 1.5] },
          { cx: px + TILE_SIZE, cy: py, vizA: [r - 1, c], vizB: [r, c + 1], arco: [px + TILE_SIZE - 5, py + 5, Math.PI * 1.5, Math.PI * 2] },
          { cx: px + TILE_SIZE, cy: py + TILE_SIZE, vizA: [r + 1, c], vizB: [r, c + 1], arco: [px + TILE_SIZE - 5, py + TILE_SIZE - 5, 0, Math.PI * 0.5] },
          { cx: px, cy: py + TILE_SIZE, vizA: [r + 1, c], vizB: [r, c - 1], arco: [px + 5, py + TILE_SIZE - 5, Math.PI * 0.5, Math.PI] },
        ];
        for (const canto of cantos) {
          if (ehParede(canto.vizA[0], canto.vizA[1]) || ehParede(canto.vizB[0], canto.vizB[1])) continue;
          // Remove o vértice quadrado e desenha o arco luminoso
          g.save();
          g.fillStyle = '#030712';
          g.beginPath();
          g.moveTo(canto.cx, canto.cy);
          if (canto.cx === px && canto.cy === py) { g.lineTo(px + 5, py); g.arc(px + 5, py + 5, 5, Math.PI, Math.PI * 1.5); }
          else if (canto.cx === px + TILE_SIZE && canto.cy === py) { g.lineTo(px + TILE_SIZE - 5, py); g.arc(px + TILE_SIZE - 5, py + 5, 5, Math.PI * 1.5, Math.PI * 2); }
          else if (canto.cx === px + TILE_SIZE && canto.cy === py + TILE_SIZE) { g.lineTo(px + TILE_SIZE - 5, py + TILE_SIZE); g.arc(px + TILE_SIZE - 5, py + TILE_SIZE - 5, 5, 0, Math.PI * 0.5); }
          else { g.lineTo(px + 5, py + TILE_SIZE); g.arc(px + 5, py + TILE_SIZE - 5, 5, Math.PI * 0.5, Math.PI); }
          g.closePath();
          g.fill();
          g.strokeStyle = corParedeBrilho;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(canto.arco[0], canto.arco[1], 5, canto.arco[2], canto.arco[3]);
          g.stroke();
          g.restore();
        }
      }

      // 2. Portão da toca das sombras
      else if (tile === 4) {
        g.fillStyle = PALETA_TATU.portaoToca;
        g.fillRect(px, py + 5, TILE_SIZE, 5);
      }

      // 3. Semente pequena (10 pts)
      else if (tile === 2) {
        g.fillStyle = PALETA_TATU.semente;
        g.fillRect(px + 6, py + 6, 4, 4);
      }

      // 4. Pimenta grande piscante (50 pts - Powerup)
      else if (tile === 3) {
        const pisca = Math.sin(tempo * 3) > -0.3;
        if (pisca) {
          // Corpo da pimenta
          g.fillStyle = Math.sin(tempo * 6) > 0 ? PALETA_TATU.pimentaVermelha : PALETA_TATU.pimentaLaranja;
          g.beginPath();
          g.arc(px + 8, py + 9, 6.5, 0, Math.PI * 2);
          g.fill();

          // Talinho verde da pimenta
          g.fillStyle = PALETA_TATU.pimentaVerde;
          g.fillRect(px + 7, py + 2, 2.5, 4);
        }
      }
    }
  }
}

/**
 * Desenha o Tatu herói (modo normal com carapaça segmentada ou modo bola blindada).
 */
export function renderizarTatu(g: CanvasRenderingContext2D, tatu: TatuHero): void {
  g.save();
  g.translate(tatu.x, tatu.y);

  // Animação de desmaio ao perder vida
  if (tatu.morrendo) {
    const progresso = Math.min(1.0, tatu.timerMorte / 1.5);
    g.rotate(progresso * Math.PI);
    g.fillStyle = PALETA_TATU.tatuCarapacaEscura;
    g.beginPath();
    g.arc(0, 0, 9, 0, Math.PI * 2);
    g.fill();

    // Estrelinhas de tontura
    const t = performance.now() / 150;
    g.fillStyle = '#FACC15';
    g.fillRect(Math.cos(t) * 14 - 2, Math.sin(t) * 14 - 2, 4, 4);
    g.fillRect(Math.cos(t + 3.14) * 14 - 2, Math.sin(t + 3.14) * 14 - 2, 4, 4);
    g.restore();
    return;
  }

  // Rotação visual de acordo com a direção do movimento
  let angulo = 0;
  if (tatu.dir === 'direita') angulo = 0;
  else if (tatu.dir === 'baixo') angulo = Math.PI / 2;
  else if (tatu.dir === 'esquerda') angulo = Math.PI;
  else if (tatu.dir === 'cima') angulo = -Math.PI / 2;
  g.rotate(angulo);

  if (tatu.modoBola) {
    // -------------------------------------------------------------
    // MODO BOLA BLINDADA (Rolando e brilhando em verde-limão neon)
    // -------------------------------------------------------------
    const rot = (tatu.animFrame % 4) * (Math.PI / 2); // 4 quadros de giro
    g.rotate(rot);

    // Glow verde-limão
    g.fillStyle = 'rgba(132, 204, 22, 0.4)';
    g.beginPath();
    g.arc(0, 0, 13, 0, Math.PI * 2);
    g.fill();

    // Esfera carapaça blindada
    g.fillStyle = PALETA_TATU.tatuNeon;
    g.beginPath();
    g.arc(0, 0, 10.5, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = PALETA_TATU.tatuCarapacaEscura;
    g.beginPath();
    g.arc(0, 0, 8.5, 0, Math.PI * 2);
    g.fill();

    // Segmentos da carapaça girando
    g.fillStyle = PALETA_TATU.tatuCarapaca;
    g.fillRect(-7.5, -2.5, 15, 5);
    g.fillRect(-2.5, -7.5, 5, 15);
  } else {
    // -------------------------------------------------------------
    // MODO NORMAL (Tatu-bola caminhando)
    // -------------------------------------------------------------
    const passo = tatu.animFrame % 2 === 0;

    // Patinhas
    g.fillStyle = PALETA_TATU.tatuPele;
    g.fillRect(-6, passo ? 7 : 5, 4, 3.5);
    g.fillRect(3, passo ? 5 : 7, 4, 3.5);
    g.fillRect(-6, passo ? -9 : -7, 4, 3.5);
    g.fillRect(3, passo ? -7 : -9, 4, 3.5);

    // Carapaça oval (cinza-bege)
    g.fillStyle = PALETA_TATU.tatuCarapaca;
    g.beginPath();
    g.ellipse(-1, 0, 10.5, 8.5, 0, 0, Math.PI * 2);
    g.fill();

    // Faixas segmentadas da carapaça
    g.fillStyle = PALETA_TATU.tatuCarapacaEscura;
    g.fillRect(-4, -6.5, 3, 13);
    g.fillRect(1, -6.5, 3, 13);

    // Focinho alongado
    g.fillStyle = PALETA_TATU.tatuPele;
    g.beginPath();
    g.moveTo(7, -4);
    lineToRel(g, 12, 0);
    lineToRel(g, 7, 4);
    g.fill();

    // Ponta do focinho preto
    g.fillStyle = PALETA_TATU.tatuOlho;
    g.fillRect(10.5, -1, 2.5, 2.5);

    // Olhos
    g.fillStyle = '#FFFFFF';
    g.fillRect(5.5, -4.5, 3, 3);
    g.fillRect(5.5, 2, 3, 3);
    g.fillStyle = PALETA_TATU.tatuOlho;
    g.fillRect(6.5, -3.5, 2, 2);
    g.fillRect(6.5, 2.5, 2, 2);

    // Orelhas pontudas
    g.fillStyle = PALETA_TATU.tatuPele;
    g.fillRect(0, -8.5, 3, 3);
    g.fillRect(0, 5.5, 3, 3);
  }

  g.restore();
}

function lineToRel(g: CanvasRenderingContext2D, x: number, y: number): void {
  g.lineTo(x, y);
}

/**
 * Desenha as Sombras (normais, assustadas ou olhos derrotados).
 */
export function renderizarSombras(
  g: CanvasRenderingContext2D,
  sombras: Sombra[],
  timerAssustado = 0
): void {
  const tempo = performance.now() / 150;

  for (const s of sombras) {
    g.save();
    g.translate(s.x, s.y);

    // 1. MODO OLHOS (Derrotada, voando de volta à toca)
    if (s.modo === 'olhos') {
      desenharOlhosSombra(g, s.dir);
      g.restore();
      continue;
    }

    // 2. MODO ASSUSTADA (Azul-claro, piscando em branco perto do fim)
    if (s.modo === 'assustada') {
      const piscarBranco = timerAssustado < 2.5 && Math.sin(tempo * 6) > 0;
      g.fillStyle = piscarBranco
        ? PALETA_TATU.sombraAssustadaBranco
        : PALETA_TATU.sombraAssustadaAzul;

      // Corpo da sombra
      desenharCorpoSombra(g, s.animFrame);

      // Olhos assustados (pontinhos brancos e boca em zigue-zague)
      g.fillStyle = piscarBranco ? '#EF4444' : '#FFFFFF';
      g.fillRect(-5, -4, 3.5, 3.5);
      g.fillRect(2.5, -4, 3.5, 3.5);

      // Boquinha ondulada de pânico
      g.fillStyle = piscarBranco ? '#EF4444' : '#FFFFFF';
      g.fillRect(-7, 3.5, 3.5, 2);
      g.fillRect(-3.5, 5.5, 7, 2);
      g.fillRect(3.5, 3.5, 3.5, 2);

      g.restore();
      continue;
    }

    // 3. MODO NORMAL (Cor própria da sombra + crista distintiva)
    g.fillStyle = s.cor;
    desenharCorpoSombra(g, s.animFrame);

    // Crista distintiva no topo da cabeça para cada sombra
    if (s.id === 'vermelha') {
      // Crista pontuda tripla
      g.fillRect(-2, -13, 4, 4);
      g.fillRect(-7, -10, 3, 3);
      g.fillRect(4, -10, 3, 3);
    } else if (s.id === 'roxa') {
      // Orelhas duplas pontudas
      g.fillRect(-7, -12, 3, 4);
      g.fillRect(4, -12, 3, 4);
    } else if (s.id === 'azul') {
      // Chifrinho central arredondado
      g.beginPath();
      g.arc(0, -11, 3.5, 0, Math.PI * 2);
      g.fill();
    } else if (s.id === 'laranja') {
      // Cúpula lisa e bochechas mais largas
      g.fillRect(-9, 0, 18, 7);
    }

    // Olhos expressivos olhando na direção do movimento
    desenharOlhosSombra(g, s.dir);

    g.restore();
  }
}

function desenharCorpoSombra(g: CanvasRenderingContext2D, animFrame: number): void {
  // Cabeça e corpo em cúpula
  g.beginPath();
  g.arc(0, -2, 9.5, Math.PI, 0, false);
  g.lineTo(9.5, 7);
  g.lineTo(-9.5, 7);
  g.closePath();
  g.fill();

  // Ondulações na base (tentáculos fantasmagóricos animados)
  const alt = animFrame % 2 === 0;
  if (alt) {
    g.fillRect(-9.5, 7, 5, 4);
    g.fillRect(-3, 7, 6, 5);
    g.fillRect(4.5, 7, 5, 4);
  } else {
    g.fillRect(-7.5, 7, 6, 5);
    g.fillRect(1.5, 7, 6, 5);
  }
}

function desenharOlhosSombra(g: CanvasRenderingContext2D, dir: string): void {
  let pupX = 0;
  let pupY = 0;
  if (dir === 'cima') pupY = -2.5;
  else if (dir === 'baixo') pupY = 2.5;
  else if (dir === 'esquerda') pupX = -2.5;
  else if (dir === 'direita') pupX = 2.5;

  // Esclera branca grande
  g.fillStyle = '#FFFFFF';
  g.beginPath();
  g.ellipse(-4.5 + pupX * 0.6, -3 + pupY * 0.6, 4, 4.8, 0, 0, Math.PI * 2);
  g.ellipse(4.5 + pupX * 0.6, -3 + pupY * 0.6, 4, 4.8, 0, 0, Math.PI * 2);
  g.fill();

  // Pupila azul-escura
  g.fillStyle = '#0F172A';
  g.beginPath();
  g.arc(-4.5 + pupX, -3 + pupY, 2.2, 0, Math.PI * 2);
  g.arc(4.5 + pupX, -3 + pupY, 2.2, 0, Math.PI * 2);
  g.fill();
}

/**
 * Desenha frutas brasileiras colecionáveis com pixel art original em tamanho generoso.
 */
export function renderizarFruta(g: CanvasRenderingContext2D, fruta: FrutaBonus): void {
  if (!fruta.ativa) return;

  g.save();
  g.translate(fruta.x, fruta.y);

  // Leve pulsação de escala
  const escala = 1 + Math.sin(performance.now() / 200) * 0.1;
  g.scale(escala, escala);

  if (fruta.tipo === 'caju') {
    // Pedúnculo amarelo/laranja
    g.fillStyle = '#F59E0B';
    g.beginPath();
    g.ellipse(0, -2, 6.5, 8.5, 0, 0, Math.PI * 2);
    g.fill();

    // Castanha cinza curvada embaixo
    g.fillStyle = '#64748B';
    g.beginPath();
    g.arc(0, 8, 3.5, 0, Math.PI * 2);
    g.fill();

    // Cabinho verde
    g.fillStyle = '#22C55E';
    g.fillRect(-1, -12, 2, 4);
  } else if (fruta.tipo === 'abacaxi') {
    // Casca dourada com textura
    g.fillStyle = '#EAB308';
    g.fillRect(-5.5, -4, 11, 13);
    g.fillStyle = '#78350F';
    g.fillRect(-3, 0, 2, 2);
    g.fillRect(2, 4, 2, 2);

    // Coroa de folhas verdes pontudas
    g.fillStyle = '#16A34A';
    g.beginPath();
    g.moveTo(-5.5, -4);
    g.lineTo(0, -11);
    g.lineTo(5.5, -4);
    g.fill();
  } else if (fruta.tipo === 'jabuticaba') {
    // Trio de jabuticabas pretas brilhantes
    g.fillStyle = '#1E1B4B';
    g.beginPath();
    g.arc(-3.5, 2, 4.5, 0, Math.PI * 2);
    g.arc(3.5, 2, 4.5, 0, Math.PI * 2);
    g.arc(0, -3.5, 4.5, 0, Math.PI * 2);
    g.fill();

    // Brilho branco
    g.fillStyle = '#FFFFFF';
    g.fillRect(-4.5, 0, 2, 2);
    g.fillRect(2.5, 0, 2, 2);

    // Folhinha verde
    g.fillStyle = '#22C55E';
    g.fillRect(-2, -9, 4, 3);
  } else if (fruta.tipo === 'goiaba') {
    // Casca verde
    g.fillStyle = '#15803D';
    g.beginPath();
    g.arc(0, 0, 8.5, 0, Math.PI * 2);
    g.fill();

    // Polpa rosada
    g.fillStyle = '#F43F5E';
    g.beginPath();
    g.arc(0, 0, 6.5, 0, Math.PI * 2);
    g.fill();

    // Sementinhas amarelas
    g.fillStyle = '#FEF08A';
    g.fillRect(-3, -2, 2, 2);
    g.fillRect(2, 0, 2, 2);
    g.fillRect(-1, 3, 2, 2);
  }

  g.restore();
}

/**
 * Desenha mensagens centrais ("PRONTO!" e "FIM DE JOGO") com tipografia retrô grande e nítida.
 */
export function renderizarMensagemCentro(
  g: CanvasRenderingContext2D,
  texto: string,
  cor: string,
  largura: number
): void {
  g.save();
  g.font = '12px "Press Start 2P", monospace';
  g.textAlign = 'center';
  g.fillStyle = cor;
  // Linha 17 (centro vertical do labirinto, logo abaixo da toca)
  const y = MAZE_OFFSET_Y + 17 * TILE_SIZE + 6;
  g.fillText(texto, largura / 2, y);
  g.restore();
}
