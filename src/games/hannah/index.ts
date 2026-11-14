/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';

/* ==========================================================================
   PALETA RETRÔ E ESTRUTURAS DO CENÁRIO DO "SALVE A HANNAH"
   ========================================================================== */

const PALETTE = {
  black: '#000000',
  redGirder: '#EF4444',
  redGirderDark: '#991B1B',
  rivetCyan: '#06B6D4',
  ladderCyan: '#06B6D4',
  woodBrown: '#A85A14',
  woodDark: '#663300',
  barrelOrange: '#FF7700',
  oilBlue: '#1E40AF',
  flameYellow: '#FFE600',
  flameRed: '#FF3300',
  hammerSteel: '#D1D5DB',
  hammerWood: '#92400E',
  hannahPink: '#FF69B4',
  hannahDress: '#FFB6C1',
  hannahHair: '#7A4A21',
  zecaOveralls: '#2563EB',
  zecaShirt: '#EF4444',
  zecaSkin: '#FCD34D',
  zecaShoes: '#78350F',
  grotaoFur: '#45220C',
  grotaoFurDark: '#2B1407',
  grotaoSkin: '#D97706',
  white: '#FFFFFF',
  textYellow: '#FACC15',
};

interface Girder {
  id: number;
  xStart: number;
  yStart: number;
  xEnd: number;
  yEnd: number;
  height: number;
  rollDirection: 1 | -1;
}

interface Ladder {
  x: number;
  yTop: number;
  yBottom: number;
  broken: boolean;
  brokenGapY?: number;
}

interface ItemBonus {
  id: string;
  type: 'chapeu' | 'bolsa' | 'guarda-chuva';
  x: number;
  y: number;
  collected: boolean;
  points: number;
}

interface HammerItem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

const GIRDERS: Girder[] = [
  // Topo: Plataforma da Hannah (Centro)
  { id: 0, xStart: 180, yStart: 75, xEnd: 300, yEnd: 75, height: 12, rollDirection: 1 },
  // Topo: Plataforma do Grotão (Esquerda)
  { id: 1, xStart: 25, yStart: 125, xEnd: 175, yEnd: 125, height: 12, rollDirection: 1 },
  // Andar 5: Inclina para a esquerda
  { id: 2, xStart: 65, yStart: 175, xEnd: 445, yEnd: 155, height: 12, rollDirection: -1 },
  // Andar 4: Inclina para a direita
  { id: 3, xStart: 35, yStart: 245, xEnd: 415, yEnd: 265, height: 12, rollDirection: 1 },
  // Andar 3: Inclina para a esquerda
  { id: 4, xStart: 65, yStart: 355, xEnd: 445, yEnd: 335, height: 12, rollDirection: -1 },
  // Andar 2: Inclina para a direita
  { id: 5, xStart: 35, yStart: 425, xEnd: 415, yEnd: 445, height: 12, rollDirection: 1 },
  // Andar 1: Térreo plano
  { id: 6, xStart: 20, yStart: 520, xEnd: 460, yEnd: 520, height: 14, rollDirection: -1 },
];

const LADDERS: Ladder[] = [
  { x: 240, yTop: 75, yBottom: 166, broken: false },
  { x: 100, yTop: 173, yBottom: 248, broken: false },
  { x: 380, yTop: 159, yBottom: 263, broken: false },
  { x: 230, yTop: 166, yBottom: 255, broken: true, brokenGapY: 210 },
  { x: 130, yTop: 250, yBottom: 351, broken: false },
  { x: 390, yTop: 264, yBottom: 338, broken: false },
  { x: 270, yTop: 257, yBottom: 344, broken: true, brokenGapY: 300 },
  { x: 90, yTop: 354, yBottom: 428, broken: false },
  { x: 360, yTop: 339, yBottom: 442, broken: false },
  { x: 210, yTop: 347, yBottom: 434, broken: true, brokenGapY: 390 },
  { x: 400, yTop: 444, yBottom: 520, broken: false },
  { x: 160, yTop: 432, yBottom: 520, broken: false },
  { x: 280, yTop: 438, yBottom: 520, broken: true, brokenGapY: 478 },
];

function getGirderYAt(girder: Girder, x: number): number | null {
  if (x < girder.xStart || x > girder.xEnd) return null;
  const ratio = (x - girder.xStart) / (girder.xEnd - girder.xStart);
  return girder.yStart + (girder.yEnd - girder.yStart) * ratio;
}

function findGirderBelow(x: number, y: number, tolerance = 12): { girder: Girder; surfaceY: number } | null {
  for (const g of GIRDERS) {
    const gy = getGirderYAt(g, x);
    if (gy !== null) {
      if (y >= gy - tolerance && y <= gy + tolerance + 4) {
        return { girder: g, surfaceY: gy };
      }
    }
  }
  return null;
}

function checkBarrelGirderLanding(prevY: number, currY: number, x: number, radius: number): { girder: Girder; surfaceY: number } | null {
  for (const g of GIRDERS) {
    if (x >= g.xStart - 4 && x <= g.xEnd + 4) {
      const clampedX = Math.max(g.xStart, Math.min(g.xEnd, x));
      const gy = getGirderYAt(g, clampedX);
      if (gy !== null) {
        const prevBottom = prevY + radius;
        const currBottom = currY + radius;
        if (prevBottom <= gy + 4 && currBottom >= gy - 6) {
          return { girder: g, surfaceY: gy };
        }
      }
    }
  }
  return null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface Barrel {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  isSpecial: boolean;
  onLadder: boolean;
  jumpScored: boolean;
  currentGirderId: number | null;
}

interface Fireball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  onLadder: boolean;
  facing: 1 | -1;
  climbCooldown: number;
  changeDirCooldown: number;
}

export const hannahGameModule: GameModule = {
  id: 'hannah',
  titulo: 'Salve a Hannah',
  descricao: 'Suba as vigas de aço da construção em obras e resgate Hannah das garras do temível gorila Grotão.',
  genero: 'Aventura de Resgate',
  corTema: '#EF4444',
  largura: 480,
  altura: 560,
  instrucoes: {
    historia: 'O temível gorila Grotão sequestrou a jovem Hannah e a levou para o topo de uma imensa estrutura em obras. O destemido herói Zeca, um carpinteiro de macacão azul e boné, deve escalar os 5 andares de vigas inclinadas, desviar de barris rolantes e salvá-la!',
    controles: [
      'Setas / WASD / D-Pad: Mover e subir/descer escadas',
      'Espaço / Botão A: Pular por cima dos barris',
      'Tecla P: Pausar partida',
      'Tecla R: Reiniciar partida',
    ],
    pontos: [
      { acao: 'Pular por cima de um barril', pontos: 100 },
      { acao: 'Esmagar barril com a marreta', pontos: 300 },
      { acao: 'Coletar item da Hannah (chapéu, bolsa, guarda-chuva)', pontos: 500 },
      { acao: 'Bônus de tempo ao resgatar Hannah', pontos: 5000 },
    ],
  },
  criar(ctx: EngineContext): GameInstance {
    let estado: 'TITLE' | 'PLAYING' | 'VICTORY' | 'GAMEOVER' = 'TITLE';
    let fase = 1;
    let vidas = 3;
    let bonusTimer = 5000;
    let flashScreenTimer = 0;

    // Entidades
    let player = {
      x: 80,
      y: 520,
      vx: 0,
      vy: 0,
      width: 18,
      height: 24,
      onGround: true,
      isClimbing: false,
      currentLadder: null as Ladder | null,
      facing: 1 as 1 | -1,
      isHammerActive: false,
      hammerTimer: 0,
      hammerSwingFrame: 0,
      invincibleTimer: 0,
      isDying: false,
      deathTimer: 0,
      walkFrame: 0,
      walkTimer: 0,
    };

    let grotao = {
      x: 95,
      y: 85,
      action: 'idle' as 'idle' | 'beatChest' | 'throwBarrel',
      actionTimer: 0,
      barrelSpawnTimer: 2.5,
      isDefeated: false,
    };

    let hannah = {
      x: 235,
      y: 48,
      speechTimer: 0,
      heartTimer: 0,
      hearts: [] as { x: number; y: number; vy: number; life: number }[],
    };

    let barrels: Barrel[] = [];
    let nextBarrelId = 1;
    let fireballs: Fireball[] = [];
    let nextFireballId = 1;
    let fireballSpawnTimer = 6.0;

    let hammerItems: HammerItem[] = [];
    let bonusItems: ItemBonus[] = [];
    let particles: Particle[] = [];

    function spawnParticles(x: number, y: number, color: string, count = 10, speed = 2.5) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (Math.random() * 0.8 + 0.2) * speed;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1,
          color,
          size: Math.random() * 2.5 + 1.5,
          life: 0.6 + Math.random() * 0.4,
        });
      }
    }

    function initLevel(novaFase: number, preservarPontos = false) {
      fase = novaFase;
      bonusTimer = Math.max(3000, 5000 - (novaFase - 1) * 300);

      if (!preservarPontos) {
        vidas = 3;
        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde: ctx.storage.lerRecorde(ctx.id),
          vidas: 3,
          fase: novaFase,
          bonus: bonusTimer,
        });
      } else {
        ctx.hud.definirEstado({
          vidas,
          fase: novaFase,
          bonus: bonusTimer,
        });
      }

      player = {
        x: 80,
        y: 520,
        vx: 0,
        vy: 0,
        width: 18,
        height: 24,
        onGround: true,
        isClimbing: false,
        currentLadder: null,
        facing: 1,
        isHammerActive: false,
        hammerTimer: 0,
        hammerSwingFrame: 0,
        invincibleTimer: 0,
        isDying: false,
        deathTimer: 0,
        walkFrame: 0,
        walkTimer: 0,
      };

      grotao = {
        x: 95,
        y: 85,
        action: 'idle',
        actionTimer: 0,
        barrelSpawnTimer: Math.max(1.8, 3.5 - novaFase * 0.3),
        isDefeated: false,
      };

      hannah = {
        x: 235,
        y: 48,
        speechTimer: 0,
        heartTimer: 0,
        hearts: [],
      };

      barrels = [];
      fireballs = [];
      particles = [];
      fireballSpawnTimer = Math.max(5.0, 9.0 - novaFase * 0.8);

      hammerItems = [
        { id: 'h1', x: 75, y: 345, collected: false },
        { id: 'h2', x: 385, y: 255, collected: false },
      ];

      bonusItems = [
        { id: 'b1', type: 'chapeu', x: 320, y: 70, collected: false, points: 500 },
        { id: 'b2', type: 'bolsa', x: 420, y: 150, collected: false, points: 500 },
        { id: 'b3', type: 'guarda-chuva', x: 80, y: 235, collected: false, points: 500 },
      ];

      estado = 'PLAYING';
    }

    function handlePlayerDeath() {
      if (player.isDying || player.invincibleTimer > 0) return;

      player.isDying = true;
      player.deathTimer = 1.8;
      player.isHammerActive = false;
      ctx.audio.tocar('vidaPerdida');
      spawnParticles(player.x, player.y, PALETTE.redGirder, 16, 3);

      vidas = ctx.hud.perderVida();
    }

    function handleVictory() {
      estado = 'VICTORY';
      ctx.audio.tocar('vitoria');
      grotao.isDefeated = true;
      flashScreenTimer = 0.5;

      const remainingBonus = Math.floor(bonusTimer);
      if (remainingBonus > 0) {
        ctx.hud.adicionarPontos(remainingBonus, ctx.largura / 2 - 20, 180, '#4ADE80');
      }

      ctx.finalizarJogo('vitoria');

      for (let i = 0; i < 8; i++) {
        hannah.hearts.push({
          x: hannah.x - 20 + Math.random() * 40,
          y: hannah.y - 10 + Math.random() * 10,
          vy: -1 - Math.random() * 1.5,
          life: 2.0,
        });
      }
    }

    return {
      iniciar() {
        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde: ctx.storage.lerRecorde(ctx.id),
          vidas: 3,
          fase: 1,
          bonus: 5000,
        });
        estado = 'TITLE';
      },

      reiniciar() {
        initLevel(1, false);
      },

      pausar() {
        // Pausado
      },

      retomar() {
        // Retomado
      },

      atualizar(dt: number, input: InputState) {
        if (flashScreenTimer > 0) {
          flashScreenTimer -= dt;
        }

        if (estado === 'TITLE') {
          if (input.acaoPressionada || input.cimaPressionada) {
            initLevel(1, false);
          }
          return;
        }

        if (estado === 'VICTORY') {
          if (input.acaoPressionada) {
            initLevel(fase + 1, true);
          }
          return;
        }

        if (estado === 'GAMEOVER') {
          if (input.acaoPressionada) {
            initLevel(1, false);
          }
          return;
        }

        // Atualização do bônus de tempo
        if (bonusTimer > 0) {
          bonusTimer = Math.max(0, bonusTimer - dt * 50);
          ctx.hud.definirBonus(bonusTimer);
          if (bonusTimer <= 0) {
            handlePlayerDeath();
          }
        }

        // Morte do Zeca
        if (player.isDying) {
          player.deathTimer -= dt;
          if (player.deathTimer <= 0) {
            if (vidas <= 0) {
              estado = 'GAMEOVER';
              ctx.finalizarJogo('gameOver');
            } else {
              player.x = 80;
              player.y = 520;
              player.vx = 0;
              player.vy = 0;
              player.isDying = false;
              player.onGround = true;
              player.isClimbing = false;
              player.invincibleTimer = 2.0;
            }
          }
          return;
        }

        if (player.invincibleTimer > 0) {
          player.invincibleTimer -= dt;
        }

        // Marreta
        if (player.isHammerActive) {
          player.hammerTimer -= dt;
          player.hammerSwingFrame += dt * 8;
          if (Math.floor(player.hammerSwingFrame) % 4 === 0) {
            ctx.audio.tocar('marreta');
          }
          if (player.hammerTimer <= 0) {
            player.isHammerActive = false;
          }
        }

        // Checar escadas
        let nearLadder: Ladder | null = null;
        for (const lad of LADDERS) {
          if (Math.abs(player.x - lad.x) < 14 && player.y >= lad.yTop - 6 && player.y <= lad.yBottom + 6) {
            nearLadder = lad;
            break;
          }
        }

        if (nearLadder && !player.isHammerActive) {
          if (input.cima && player.y > nearLadder.yTop) {
            if (!nearLadder.broken || !nearLadder.brokenGapY || player.y > nearLadder.brokenGapY + 14 || player.y < nearLadder.brokenGapY - 14) {
              player.isClimbing = true;
              player.currentLadder = nearLadder;
              player.x = nearLadder.x;
            }
          } else if (input.baixo && player.y < nearLadder.yBottom) {
            if (!nearLadder.broken || !nearLadder.brokenGapY || player.y > nearLadder.brokenGapY + 14 || player.y < nearLadder.brokenGapY - 14) {
              player.isClimbing = true;
              player.currentLadder = nearLadder;
              player.x = nearLadder.x;
            }
          }
        } else {
          player.isClimbing = false;
          player.currentLadder = null;
        }

        // Subir / descer escada
        if (player.isClimbing && player.currentLadder) {
          player.vx = 0;
          player.vy = 0;
          const climbSpeed = 75;

          if (input.cima) {
            if (!(player.currentLadder.broken && player.currentLadder.brokenGapY && Math.abs(player.y - player.currentLadder.brokenGapY) < 10)) {
              player.y -= climbSpeed * dt;
              player.walkTimer += dt;
              if (player.walkTimer > 0.15) {
                player.walkTimer = 0;
                player.walkFrame = (player.walkFrame + 1) % 2;
                ctx.audio.tocar('passo');
              }
            }
          } else if (input.baixo) {
            if (!(player.currentLadder.broken && player.currentLadder.brokenGapY && Math.abs(player.y - player.currentLadder.brokenGapY) < 10)) {
              player.y += climbSpeed * dt;
              player.walkTimer += dt;
              if (player.walkTimer > 0.15) {
                player.walkTimer = 0;
                player.walkFrame = (player.walkFrame + 1) % 2;
                ctx.audio.tocar('passo');
              }
            }
          }

          if (player.y <= player.currentLadder.yTop) {
            player.y = player.currentLadder.yTop;
            player.isClimbing = false;
            player.onGround = true;
          } else if (player.y >= player.currentLadder.yBottom) {
            player.y = player.currentLadder.yBottom;
            player.isClimbing = false;
            player.onGround = true;
          }

          if (input.esquerda || input.direita) {
            const support = findGirderBelow(player.x, player.y, 8);
            if (support) {
              player.isClimbing = false;
              player.onGround = true;
            }
          }
        } else {
          // Movimentação horizontal normal
          const moveSpeed = player.isHammerActive ? 85 : 100;
          if (input.esquerda) {
            player.vx = -moveSpeed;
            player.facing = -1;
          } else if (input.direita) {
            player.vx = moveSpeed;
            player.facing = 1;
          } else {
            player.vx = 0;
          }

          // Pulo
          if (input.acaoPressionada && player.onGround && !player.isHammerActive) {
            player.vy = -200;
            player.onGround = false;
            ctx.audio.tocar('pulo');
          }

          if (!player.onGround) {
            player.vy += 450 * dt;
          }

          player.x += player.vx * dt;
          player.y += player.vy * dt;

          if (player.onGround && Math.abs(player.vx) > 0) {
            player.walkTimer += dt;
            if (player.walkTimer > 0.12) {
              player.walkTimer = 0;
              player.walkFrame = (player.walkFrame + 1) % 3;
              ctx.audio.tocar('passo');
            }
          }

          if (player.x < 30) player.x = 30;
          if (player.x > 450) player.x = 450;

          const support = findGirderBelow(player.x, player.y, 10);
          if (support && player.vy >= 0) {
            if (player.y >= support.surfaceY - 4) {
              if (player.vy > 380) {
                handlePlayerDeath();
                return;
              }
              player.y = support.surfaceY;
              player.vy = 0;
              player.onGround = true;
            }
          } else if (player.onGround) {
            const closeSupport = findGirderBelow(player.x, player.y + 4, 8);
            if (closeSupport) {
              player.y = closeSupport.surfaceY;
            } else {
              player.onGround = false;
            }
          }

          if (player.y > ctx.altura + 30) {
            handlePlayerDeath();
            return;
          }
        }

        // Vitória ao alcançar Hannah
        if (player.y <= 85 && player.x >= 180 && player.x <= 280) {
          handleVictory();
          return;
        }

        // Itens: Marretas
        for (const h of hammerItems) {
          if (!h.collected && Math.abs(player.x - h.x) < 18 && Math.abs(player.y - h.y) < 20) {
            h.collected = true;
            player.isHammerActive = true;
            player.hammerTimer = 8.0;
            ctx.audio.tocar('item');
            spawnParticles(h.x, h.y, PALETTE.hammerSteel, 12, 3);
            ctx.hud.adicionarPontos(300, h.x, h.y - 10, '#38BDF8');
          }
        }

        // Itens Bônus da Hannah
        for (const item of bonusItems) {
          if (!item.collected && Math.abs(player.x - item.x) < 18 && Math.abs(player.y - item.y) < 18) {
            item.collected = true;
            ctx.audio.tocar('moeda');
            spawnParticles(item.x, item.y, PALETTE.flameYellow, 12, 2.5);
            ctx.hud.adicionarPontos(item.points, item.x, item.y - 12, '#FDE047');
          }
        }

        // Grotão e lançamento de barris
        grotao.actionTimer += dt;
        grotao.barrelSpawnTimer -= dt;

        if (grotao.barrelSpawnTimer <= 0 && !grotao.isDefeated) {
          grotao.action = 'throwBarrel';
          grotao.barrelSpawnTimer = Math.max(1.8, 3.8 - fase * 0.35 + Math.random() * 0.8);
          grotao.actionTimer = 0;

          const isSpecial = Math.random() < 0.25 + fase * 0.05;
          barrels.push({
            id: nextBarrelId++,
            x: 135,
            y: 125 - 9,
            vx: 80 + fase * 10,
            vy: 0,
            radius: 9,
            rotation: 0,
            isSpecial,
            onLadder: false,
            jumpScored: false,
            currentGirderId: 1,
          });
          ctx.audio.tocar('barril');
        } else if (grotao.action === 'throwBarrel' && grotao.actionTimer > 0.8) {
          grotao.action = Math.random() > 0.5 ? 'beatChest' : 'idle';
          grotao.actionTimer = 0;
          if (grotao.action === 'beatChest') {
            ctx.audio.tocar('passo');
          }
        }

        // Atualização dos Barris com física estável e descida precisa
        const activeBarrels: Barrel[] = [];
        const baseBarrelSpeed = 75 + fase * 12;

        for (const b of barrels) {
          b.rotation += (b.vx / b.radius) * dt;

          if (b.onLadder) {
            const prevY = b.y;
            b.y += 115 * dt;

            const landing = checkBarrelGirderLanding(prevY, b.y, b.x, b.radius);
            if (landing) {
              b.y = landing.surfaceY - b.radius;
              b.vy = 0;
              b.onLadder = false;
              b.currentGirderId = landing.girder.id;
              b.vx = landing.girder.rollDirection * (b.isSpecial ? baseBarrelSpeed * 1.35 : baseBarrelSpeed);
              ctx.audio.tocar('barril');
              spawnParticles(b.x, b.y + b.radius, PALETTE.redGirderDark, 4, 1.2);
            }
            activeBarrels.push(b);
            continue;
          }

          if (b.currentGirderId !== null) {
            const girder = GIRDERS.find((g) => g.id === b.currentGirderId);
            if (girder) {
              const dir = girder.rollDirection;
              const speed = b.isSpecial ? baseBarrelSpeed * 1.35 : baseBarrelSpeed;
              b.vx = dir * speed;

              if (b.isSpecial && Math.abs(b.y - player.y) < 25 && Math.random() < 0.015) {
                b.vx = (player.x < b.x ? -1 : 1) * speed;
              }

              b.x += b.vx * dt;
              const surfaceY = getGirderYAt(girder, b.x);

              if (surfaceY !== null) {
                b.y = surfaceY - b.radius;
                b.vy = 0;

                // Chance de descer por uma escada
                for (const lad of LADDERS) {
                  if (!lad.broken && Math.abs(b.x - lad.x) < 7 && Math.abs(b.y + b.radius - lad.yTop) < 14) {
                    if (Math.random() < 0.2 + fase * 0.04) {
                      b.onLadder = true;
                      b.currentGirderId = null;
                      b.x = lad.x;
                      b.vx = 0;
                      break;
                    }
                  }
                }
              } else {
                b.currentGirderId = null;
                b.vy = 60;
                b.vx = b.vx * 0.45;
              }
            }
          } else {
            const prevY = b.y;
            b.vy += 450 * dt;
            b.y += b.vy * dt;
            b.x += b.vx * dt;

            const landing = checkBarrelGirderLanding(prevY, b.y, b.x, b.radius);
            if (landing) {
              b.y = landing.surfaceY - b.radius;
              b.vy = 0;
              b.currentGirderId = landing.girder.id;
              const newDir = landing.girder.rollDirection;
              b.vx = newDir * (b.isSpecial ? baseBarrelSpeed * 1.35 : baseBarrelSpeed);
              ctx.audio.tocar('barril');
              spawnParticles(b.x, b.y + b.radius, PALETTE.redGirderDark, 5, 1.5);
            }
          }

          if (b.x < 25) {
            b.x = 25;
            b.vx = Math.abs(b.vx);
          } else if (b.x > 455) {
            b.x = 455;
            b.vx = -Math.abs(b.vx);
          }

          if (b.y >= 505 && b.x <= 75) {
            spawnParticles(50, 495, PALETTE.flameYellow, 8, 2);
            spawnParticles(50, 495, PALETTE.flameRed, 6, 2.5);
            continue;
          }

          if (b.y > ctx.altura + 20) {
            continue;
          }

          // Colisões com Zeca
          const dx = player.x - b.x;
          const dy = player.y - b.y;
          const dist = Math.hypot(dx, dy);

          // Esmagar barril com a marreta (+300 pts)
          if (player.isHammerActive) {
            const hammerHitBox = {
              minX: player.facing === 1 ? player.x - 5 : player.x - 26,
              maxX: player.facing === 1 ? player.x + 26 : player.x + 5,
              minY: player.y - 24,
              maxY: player.y + 10,
            };

            if (
              b.x >= hammerHitBox.minX &&
              b.x <= hammerHitBox.maxX &&
              b.y >= hammerHitBox.minY &&
              b.y <= hammerHitBox.maxY
            ) {
              ctx.audio.tocar('explosao');
              spawnParticles(b.x, b.y, b.isSpecial ? PALETTE.barrelOrange : PALETTE.woodBrown, 14, 3.5);
              ctx.hud.adicionarPontos(300, b.x, b.y - 12, '#38BDF8');
              continue;
            }
          }

          // Pular barril (+100 pts)
          if (!player.onGround && !b.jumpScored) {
            if (Math.abs(dx) < 22 && dy < -10 && dy > -45) {
              b.jumpScored = true;
              ctx.audio.tocar('moeda');
              ctx.hud.adicionarPontos(100, player.x, player.y - 20, PALETTE.textYellow);
              spawnParticles(player.x, player.y, PALETTE.rivetCyan, 5, 1.5);
            }
          }

          // Colisão fatal
          if (dist < b.radius + 10 && !player.isHammerActive && player.invincibleTimer <= 0) {
            handlePlayerDeath();
            return;
          }

          activeBarrels.push(b);
        }
        barrels = activeBarrels;

        // Fogo e chamas espirituosas
        fireballSpawnTimer -= dt;
        if (fireballSpawnTimer <= 0 && fireballs.length < 2 + Math.floor(fase / 2)) {
          fireballSpawnTimer = Math.max(5.0, 10.0 - fase * 1.0 + Math.random() * 2.0);
          fireballs.push({
            id: nextFireballId++,
            x: 60,
            y: 508,
            vx: 45 + fase * 6,
            vy: 0,
            onLadder: false,
            facing: 1,
            climbCooldown: 2.0,
            changeDirCooldown: 3.0,
          });
          spawnParticles(60, 490, PALETTE.flameYellow, 10, 2);
        }

        const activeFireballs: Fireball[] = [];
        for (const fb of fireballs) {
          fb.climbCooldown -= dt;
          fb.changeDirCooldown -= dt;

          if (fb.onLadder) {
            fb.y -= 50 * dt;
            const support = findGirderBelow(fb.x, fb.y, 6);
            if (support && fb.y <= support.surfaceY) {
              fb.y = support.surfaceY;
              fb.onLadder = false;
              fb.climbCooldown = 4.0;
            }
            activeFireballs.push(fb);
            continue;
          }

          const support = findGirderBelow(fb.x, fb.y, 8);
          if (support) {
            fb.y = support.surfaceY;
            if (fb.changeDirCooldown <= 0) {
              fb.changeDirCooldown = 2.0 + Math.random() * 3.0;
              if (Math.random() < 0.6) {
                fb.facing = player.x > fb.x ? 1 : -1;
                fb.vx = Math.abs(fb.vx) * fb.facing;
              }
            }

            if (fb.climbCooldown <= 0) {
              for (const lad of LADDERS) {
                if (!lad.broken && Math.abs(fb.x - lad.x) < 10 && Math.abs(fb.y - lad.yBottom) < 8) {
                  if (Math.random() < 0.4) {
                    fb.onLadder = true;
                    fb.x = lad.x;
                    fb.vx = 0;
                    break;
                  }
                }
              }
            }
          }

          fb.x += fb.vx * dt;
          if (fb.x < 30) {
            fb.x = 30;
            fb.vx = Math.abs(fb.vx);
            fb.facing = 1;
          } else if (fb.x > 450) {
            fb.x = 450;
            fb.vx = -Math.abs(fb.vx);
            fb.facing = -1;
          }

          const distToZeca = Math.hypot(player.x - fb.x, player.y - fb.y);
          if (distToZeca < 16) {
            if (player.isHammerActive) {
              ctx.audio.tocar('explosao');
              spawnParticles(fb.x, fb.y, PALETTE.flameYellow, 16, 3);
              ctx.hud.adicionarPontos(300, fb.x, fb.y - 10, '#F59E0B');
              continue;
            } else if (player.invincibleTimer <= 0) {
              handlePlayerDeath();
              return;
            }
          }

          activeFireballs.push(fb);
        }
        fireballs = activeFireballs;

        // Partículas (velocidade normalizada para 60 atualizações/segundo)
        const fator60 = dt * 60;
        particles = particles.filter((pt) => {
          pt.x += pt.vx * fator60;
          pt.y += pt.vy * fator60;
          pt.vy += 0.15 * fator60;
          pt.life -= dt;
          return pt.life > 0;
        });

        // Corações de Hannah
        hannah.speechTimer += dt;
        hannah.heartTimer += dt;
        if (hannah.heartTimer > 2.5 && !grotao.isDefeated) {
          hannah.heartTimer = 0;
          hannah.hearts.push({
            x: hannah.x + (Math.random() * 16 - 8),
            y: hannah.y - 12,
            vy: -20,
            life: 1.5,
          });
        }

        hannah.hearts = hannah.hearts.filter((h) => {
          h.y += h.vy * dt;
          h.life -= dt;
          return h.life > 0;
        });
      },

      desenhar(g: CanvasRenderingContext2D) {
        // Flash de vitória
        if (flashScreenTimer > 0) {
          g.fillStyle = '#FFFFFF';
          g.fillRect(0, 0, ctx.largura, ctx.altura);
          return;
        }

        g.fillStyle = PALETTE.black;
        g.fillRect(0, 0, ctx.largura, ctx.altura);

        // 1. Vigas de aço
        for (const girder of GIRDERS) {
          const dx = girder.xEnd - girder.xStart;
          const dy = girder.yEnd - girder.yStart;
          const len = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);

          g.save();
          g.translate(girder.xStart, girder.yStart);
          g.rotate(angle);

          g.fillStyle = PALETTE.redGirder;
          g.fillRect(0, 0, len, 3);
          g.fillRect(0, girder.height - 3, len, 3);

          const segmentWidth = 14;
          const count = Math.floor(len / segmentWidth);

          g.strokeStyle = PALETTE.redGirderDark;
          g.lineWidth = 1.5;
          g.beginPath();
          for (let i = 0; i < count; i++) {
            const x1 = i * segmentWidth;
            const x2 = (i + 1) * segmentWidth;
            g.moveTo(x1, 2);
            g.lineTo(x2, girder.height - 2);
            g.moveTo(x2, 2);
            g.lineTo(x1, girder.height - 2);
          }
          g.stroke();

          g.fillStyle = PALETTE.rivetCyan;
          for (let i = 0; i <= count; i++) {
            const rx = i * segmentWidth;
            g.fillRect(rx, 1, 2, 2);
            g.fillRect(rx, girder.height - 3, 2, 2);
          }

          g.restore();
        }

        // 2. Escadas
        for (const lad of LADDERS) {
          const width = 16;
          const halfW = width / 2;
          g.fillStyle = PALETTE.ladderCyan;

          if (!lad.broken) {
            g.fillRect(lad.x - halfW, lad.yTop, 2, lad.yBottom - lad.yTop);
            g.fillRect(lad.x + halfW - 2, lad.yTop, 2, lad.yBottom - lad.yTop);
            for (let y = lad.yTop + 4; y < lad.yBottom; y += 6) {
              g.fillRect(lad.x - halfW, y, width, 2);
            }
          } else {
            const gapY = lad.brokenGapY || (lad.yTop + lad.yBottom) / 2;
            const gapSize = 22;

            g.fillRect(lad.x - halfW, lad.yTop, 2, gapY - gapSize / 2 - lad.yTop);
            g.fillRect(lad.x + halfW - 2, lad.yTop, 2, gapY - gapSize / 2 - lad.yTop);
            for (let y = lad.yTop + 4; y < gapY - gapSize / 2; y += 6) {
              g.fillRect(lad.x - halfW, y, width, 2);
            }

            g.fillStyle = PALETTE.redGirderDark;
            g.fillRect(lad.x - halfW, gapY - gapSize / 2, 4, 3);
            g.fillRect(lad.x + halfW - 4, gapY + gapSize / 2 - 3, 4, 3);

            g.fillStyle = PALETTE.ladderCyan;
            g.fillRect(lad.x - halfW, gapY + gapSize / 2, 2, lad.yBottom - (gapY + gapSize / 2));
            g.fillRect(lad.x + halfW - 2, gapY + gapSize / 2, 2, lad.yBottom - (gapY + gapSize / 2));
            for (let y = gapY + gapSize / 2 + 4; y < lad.yBottom; y += 6) {
              g.fillRect(lad.x - halfW, y, width, 2);
            }
          }
        }

        // 3. Barril de fogo no térreo
        const ox = 50;
        const oy = 490;
        g.fillStyle = PALETTE.oilBlue;
        g.fillRect(ox - 14, oy, 28, 30);
        g.fillStyle = '#60A5FA';
        g.fillRect(ox - 14, oy + 4, 28, 2);
        g.fillRect(ox - 14, oy + 15, 28, 2);
        g.fillRect(ox - 14, oy + 25, 28, 2);
        g.fillStyle = PALETTE.white;
        g.font = '6px "Press Start 2P", monospace';
        g.textAlign = 'center';
        g.fillText('FOGO', ox, oy + 21);

        const flameTime = performance.now() / 150;
        const flameHeight = 12 + Math.sin(flameTime) * 4;
        g.fillStyle = PALETTE.flameYellow;
        g.beginPath();
        g.moveTo(ox - 12, oy);
        g.lineTo(ox - 6, oy - flameHeight);
        g.lineTo(ox, oy - 4);
        g.lineTo(ox + 6, oy - flameHeight - 3);
        g.lineTo(ox + 12, oy);
        g.fill();

        g.fillStyle = PALETTE.flameRed;
        g.beginPath();
        g.moveTo(ox - 8, oy);
        g.lineTo(ox - 2, oy - flameHeight * 0.7);
        g.lineTo(ox + 3, oy - flameHeight * 0.8);
        g.lineTo(ox + 8, oy);
        g.fill();

        // 4. Marretas
        for (const h of hammerItems) {
          if (h.collected) continue;
          g.save();
          g.translate(h.x, h.y);
          g.fillStyle = PALETTE.hammerWood;
          g.fillRect(-2, -10, 4, 16);
          g.fillStyle = PALETTE.hammerSteel;
          g.fillRect(-8, -16, 16, 8);
          g.fillStyle = PALETTE.white;
          g.fillRect(-6, -15, 12, 2);
          g.restore();
        }

        // 5. Itens da Hannah
        for (const it of bonusItems) {
          if (it.collected) continue;
          g.save();
          g.translate(it.x, it.y);
          if (it.type === 'chapeu') {
            g.fillStyle = PALETTE.hannahPink;
            g.fillRect(-8, 0, 16, 3);
            g.fillRect(-5, -6, 10, 6);
            g.fillStyle = PALETTE.flameYellow;
            g.fillRect(-5, -2, 10, 2);
          } else if (it.type === 'bolsa') {
            g.strokeStyle = PALETTE.hammerWood;
            g.lineWidth = 1.5;
            g.strokeRect(-5, -8, 10, 6);
            g.fillStyle = PALETTE.flameYellow;
            g.fillRect(-6, -2, 12, 8);
            g.fillStyle = PALETTE.woodDark;
            g.fillRect(-2, 0, 4, 2);
          } else if (it.type === 'guarda-chuva') {
            g.fillStyle = PALETTE.rivetCyan;
            g.beginPath();
            g.arc(0, -2, 8, Math.PI, 0);
            g.fill();
            g.fillStyle = PALETTE.hammerWood;
            g.fillRect(-1, -2, 2, 10);
            g.fillRect(-4, 7, 4, 2);
          }
          g.restore();
        }

        // 6. Grotão
        g.save();
        g.translate(grotao.x, grotao.y);
        const gTime = performance.now() / 200;
        const isBeating = grotao.action === 'beatChest';
        const isThrowing = grotao.action === 'throwBarrel';

        // Pilha de barris
        g.fillStyle = PALETTE.woodBrown;
        g.fillRect(-38, 20, 16, 24);
        g.fillRect(-20, 20, 16, 24);
        g.fillRect(-29, -2, 16, 24);
        g.fillStyle = PALETTE.black;
        g.fillRect(-38, 26, 16, 2);
        g.fillRect(-38, 36, 16, 2);
        g.fillRect(-20, 26, 16, 2);
        g.fillRect(-20, 36, 16, 2);
        g.fillRect(-29, 4, 16, 2);
        g.fillRect(-29, 14, 16, 2);

        // Corpo
        g.fillStyle = PALETTE.grotaoFur;
        g.fillRect(-16, 0, 32, 38);
        g.fillStyle = PALETTE.grotaoSkin;
        g.fillRect(-10, 8, 20, 24);
        g.fillStyle = PALETTE.grotaoFurDark;
        g.fillRect(-1, 8, 2, 24);

        // Cabeça
        g.fillStyle = PALETTE.grotaoFur;
        g.fillRect(-12, -18, 24, 18);
        g.fillRect(-16, -14, 4, 6);
        g.fillRect(12, -14, 4, 6);
        g.fillStyle = PALETTE.grotaoSkin;
        g.fillRect(-8, -12, 16, 12);

        if (grotao.isDefeated) {
          g.fillStyle = PALETTE.white;
          g.fillRect(-6, -10, 4, 4);
          g.fillRect(2, -10, 4, 4);
          g.fillStyle = PALETTE.flameRed;
          g.fillRect(-5, -9, 2, 2);
          g.fillRect(3, -9, 2, 2);
          g.fillStyle = PALETTE.black;
          g.fillRect(-4, -4, 8, 6);
        } else {
          g.fillStyle = PALETTE.white;
          g.fillRect(-6, -11, 4, 4);
          g.fillRect(2, -11, 4, 4);
          g.fillStyle = PALETTE.black;
          g.fillRect(-4, -10, 2, 2);
          g.fillRect(2, -10, 2, 2);
          g.fillStyle = PALETTE.white;
          g.fillRect(-6, -3, 3, 4);
          g.fillRect(3, -3, 3, 4);
          g.fillStyle = PALETTE.black;
          g.fillRect(-3, -2, 6, 2);
        }

        // Braços
        g.fillStyle = PALETTE.grotaoFur;
        if (isBeating) {
          const beatLeft = Math.floor(gTime) % 2 === 0;
          if (beatLeft) {
            g.fillRect(-8, 6, 8, 10);
            g.fillRect(14, -2, 10, 22);
          } else {
            g.fillRect(-24, -2, 10, 22);
            g.fillRect(0, 6, 8, 10);
          }
        } else if (isThrowing) {
          g.fillRect(-22, -16, 10, 20);
          g.fillRect(12, -16, 10, 20);
          g.fillStyle = PALETTE.woodBrown;
          g.fillRect(-10, -28, 20, 16);
          g.fillStyle = PALETTE.black;
          g.fillRect(-10, -24, 20, 2);
          g.fillRect(-10, -18, 20, 2);
        } else {
          g.fillRect(-24, 8, 10, 28);
          g.fillRect(14, 8, 10, 28);
          g.fillStyle = PALETTE.grotaoSkin;
          g.fillRect(-24, 32, 10, 6);
          g.fillRect(14, 32, 10, 6);
        }

        g.fillStyle = PALETTE.grotaoFurDark;
        g.fillRect(-14, 36, 10, 8);
        g.fillRect(4, 36, 10, 8);
        g.restore();

        // 7. Hannah
        g.save();
        g.translate(hannah.x, hannah.y);
        const hTime = performance.now() / 250;
        const waveArm = Math.sin(hTime) > 0;

        g.fillStyle = PALETTE.hannahHair;
        g.fillRect(-8, -16, 16, 10);
        g.fillRect(-10, -12, 4, 12);
        g.fillRect(6, -12, 4, 12);

        g.fillStyle = PALETTE.zecaSkin;
        g.fillRect(-6, -12, 12, 10);
        g.fillStyle = PALETTE.oilBlue;
        g.fillRect(-4, -10, 2, 2);
        g.fillRect(2, -10, 2, 2);
        g.fillStyle = PALETTE.flameRed;
        g.fillRect(-2, -6, 4, 2);

        g.fillStyle = PALETTE.hannahPink;
        g.fillRect(-6, -2, 12, 16);
        g.fillRect(-9, 10, 18, 6);

        g.fillStyle = PALETTE.white;
        g.fillRect(-4, 0, 8, 10);

        g.fillStyle = PALETTE.zecaSkin;
        if (waveArm) {
          g.fillRect(-12, -10, 4, 12);
          g.fillRect(8, -4, 4, 12);
        } else {
          g.fillRect(-12, -4, 4, 12);
          g.fillRect(8, -10, 4, 12);
        }

        g.fillStyle = PALETTE.black;
        g.fillRect(-6, 16, 4, 3);
        g.fillRect(2, 16, 4, 3);

        if (Math.sin(hTime * 0.8) > -0.3) {
          g.fillStyle = PALETTE.white;
          g.fillRect(16, -26, 68, 16);
          g.beginPath();
          g.moveTo(16, -14);
          g.lineTo(8, -10);
          g.lineTo(18, -10);
          g.fill();

          g.fillStyle = PALETTE.flameRed;
          g.font = '7px "Press Start 2P", monospace';
          g.textAlign = 'center';
          g.fillText('SOCORRO!', 50, -15);
        }

        for (const heart of hannah.hearts) {
          g.fillStyle = PALETTE.hannahPink;
          g.fillRect(heart.x - hannah.x - 4, heart.y - hannah.y - 4, 4, 4);
          g.fillRect(heart.x - hannah.x, heart.y - hannah.y - 4, 4, 4);
          g.fillRect(heart.x - hannah.x - 4, heart.y - hannah.y, 8, 4);
          g.fillRect(heart.x - hannah.x - 2, heart.y - hannah.y + 4, 4, 2);
        }
        g.restore();

        // 8. Barris
        for (const b of barrels) {
          g.save();
          g.translate(b.x, b.y);
          g.rotate(b.rotation);

          const r = b.radius;
          const isOrange = b.isSpecial;

          g.fillStyle = isOrange ? PALETTE.barrelOrange : PALETTE.woodBrown;
          g.beginPath();
          g.arc(0, 0, r, 0, Math.PI * 2);
          g.fill();

          g.strokeStyle = PALETTE.black;
          g.lineWidth = 1.5;
          g.beginPath();
          g.arc(0, 0, r, 0, Math.PI * 2);
          g.stroke();

          g.beginPath();
          g.moveTo(-r, 0);
          g.lineTo(r, 0);
          g.moveTo(0, -r);
          g.lineTo(0, r);
          g.stroke();

          g.fillStyle = isOrange ? PALETTE.flameYellow : PALETTE.woodDark;
          g.beginPath();
          g.arc(0, 0, r * 0.45, 0, Math.PI * 2);
          g.fill();

          if (isOrange) {
            g.fillStyle = PALETTE.white;
            g.fillRect(-2, -2, 4, 4);
          }
          g.restore();
        }

        // 9. Chamas
        const fireTime = performance.now() / 120;
        for (const fb of fireballs) {
          g.save();
          g.translate(fb.x, fb.y);
          const flicker = Math.sin(fireTime + fb.id) * 3;

          g.fillStyle = PALETTE.flameRed;
          g.beginPath();
          g.arc(0, 0, 8, 0, Math.PI * 2);
          g.fill();
          g.fillRect(-6, -10 + flicker, 12, 6);

          g.fillStyle = PALETTE.flameYellow;
          g.beginPath();
          g.arc(0, 0, 5, 0, Math.PI * 2);
          g.fill();
          g.fillRect(-4, -8 + flicker, 8, 5);

          g.fillStyle = PALETTE.white;
          g.fillRect(-2, -3, 4, 4);

          g.fillStyle = PALETTE.black;
          g.fillRect(fb.facing === 1 ? 0 : -3, -2, 2, 2);
          g.restore();
        }

        // 10. Zeca (Herói)
        g.save();
        g.translate(player.x, player.y);

        if (!(player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0)) {
          if (player.isDying) {
            g.rotate(Math.PI / 2);
            g.fillStyle = PALETTE.zecaOveralls;
            g.fillRect(-10, -12, 20, 16);
            g.fillStyle = PALETTE.zecaSkin;
            g.fillRect(-8, -20, 16, 10);
            g.fillStyle = PALETTE.zecaShirt;
            g.fillRect(-10, -24, 20, 6);

            g.fillStyle = PALETTE.flameYellow;
            const t = performance.now() / 100;
            g.fillRect(-18 + Math.cos(t) * 12, -26 + Math.sin(t) * 12, 4, 4);
            g.fillRect(-18 + Math.cos(t + 2) * 12, -26 + Math.sin(t + 2) * 12, 4, 4);
          } else {
            g.scale(player.facing, 1);

            if (player.isHammerActive) {
              const isUp = Math.floor(player.hammerSwingFrame) % 2 === 0;
              g.fillStyle = PALETTE.zecaOveralls;
              g.fillRect(-7, -10, 14, 16);
              g.fillStyle = PALETTE.zecaShirt;
              g.fillRect(-8, -16, 16, 8);
              g.fillStyle = PALETTE.zecaSkin;
              g.fillRect(-6, -22, 12, 8);
              g.fillRect(4, -20, 4, 4);
              g.fillStyle = PALETTE.zecaShirt;
              g.fillRect(-7, -26, 15, 6);
              g.fillRect(0, -22, 10, 3);
              g.fillStyle = PALETTE.zecaShoes;
              g.fillRect(-8, 6, 6, 4);
              g.fillRect(2, 6, 6, 4);

              g.save();
              if (isUp) {
                g.fillStyle = PALETTE.hammerWood;
                g.fillRect(-2, -38, 4, 18);
                g.fillStyle = PALETTE.hammerSteel;
                g.fillRect(-12, -48, 24, 12);
                g.fillStyle = PALETTE.white;
                g.fillRect(-10, -46, 20, 3);
              } else {
                g.fillStyle = PALETTE.hammerWood;
                g.fillRect(4, -8, 18, 4);
                g.fillStyle = PALETTE.hammerSteel;
                g.fillRect(20, -14, 14, 22);
                g.fillStyle = PALETTE.white;
                g.fillRect(22, -12, 10, 4);
                g.fillStyle = PALETTE.flameYellow;
                g.fillRect(24, 6, 8, 3);
              }
              g.restore();
            } else if (player.isClimbing) {
              const alt = player.walkFrame % 2 === 0;
              g.fillStyle = PALETTE.zecaOveralls;
              g.fillRect(-7, -12, 14, 18);
              g.fillStyle = PALETTE.flameYellow;
              g.fillRect(-5, -12, 2, 8);
              g.fillRect(3, -12, 2, 8);
              g.fillStyle = PALETTE.zecaShirt;
              g.fillRect(-6, -22, 12, 8);

              g.fillStyle = PALETTE.zecaSkin;
              if (alt) {
                g.fillRect(-11, -20, 4, 8);
                g.fillRect(7, -12, 4, 8);
              } else {
                g.fillRect(-11, -12, 4, 8);
                g.fillRect(7, -20, 4, 8);
              }

              g.fillStyle = PALETTE.zecaShoes;
              g.fillRect(alt ? -8 : -5, 6, 5, 4);
              g.fillRect(alt ? 0 : 3, 6, 5, 4);
            } else {
              g.fillStyle = PALETTE.zecaShirt;
              g.fillRect(-6, -24, 12, 6);
              g.fillRect(0, -21, 9, 3);

              g.fillStyle = PALETTE.zecaSkin;
              g.fillRect(-6, -18, 12, 8);
              g.fillRect(4, -16, 4, 4);
              g.fillStyle = PALETTE.black;
              g.fillRect(2, -17, 2, 2);
              g.fillStyle = PALETTE.grotaoFurDark;
              g.fillRect(1, -13, 7, 3);

              g.fillStyle = PALETTE.zecaShirt;
              g.fillRect(-7, -12, 14, 8);

              g.fillStyle = PALETTE.zecaOveralls;
              g.fillRect(-6, -8, 12, 14);
              g.fillRect(-4, -12, 3, 6);
              g.fillStyle = PALETTE.flameYellow;
              g.fillRect(-3, -7, 2, 2);

              g.fillStyle = PALETTE.zecaSkin;
              if (!player.onGround) {
                g.fillRect(-10, -18, 4, 8);
                g.fillRect(6, -18, 4, 8);
              } else if (Math.abs(player.vx) > 0) {
                const swing = player.walkFrame === 1 ? -4 : 4;
                g.fillRect(swing, -10, 4, 8);
              } else {
                g.fillRect(-2, -8, 4, 8);
              }

              g.fillStyle = PALETTE.zecaShoes;
              if (!player.onGround) {
                g.fillRect(-8, 2, 6, 4);
                g.fillRect(2, 0, 6, 4);
              } else if (Math.abs(player.vx) > 0) {
                if (player.walkFrame === 0) {
                  g.fillRect(-7, 6, 5, 4);
                  g.fillRect(2, 6, 5, 4);
                } else if (player.walkFrame === 1) {
                  g.fillRect(-10, 4, 5, 5);
                  g.fillRect(4, 6, 5, 4);
                } else {
                  g.fillRect(-5, 6, 5, 4);
                  g.fillRect(5, 4, 5, 5);
                }
              } else {
                g.fillRect(-7, 6, 6, 4);
                g.fillRect(2, 6, 6, 4);
              }
            }
          }
        }
        g.restore();

        // 11. Partículas
        for (const pt of particles) {
          g.fillStyle = pt.color;
          g.fillRect(pt.x, pt.y, pt.size, pt.size);
        }

        // 12. HUD Padrão do motor compartilhado
        ctx.hud.desenharHUD(g, ctx.largura, ctx.altura);

        // 13. Telas especiais
        if (estado === 'TITLE') {
          g.save();
          g.fillStyle = 'rgba(0, 0, 0, 0.78)';
          g.fillRect(0, 0, ctx.largura, ctx.altura);

          const time = performance.now() / 400;
          g.textAlign = 'center';
          g.font = '22px "Press Start 2P", monospace';
          g.fillStyle = PALETTE.redGirderDark;
          g.fillText('SALVE A HANNAH', ctx.largura / 2 + 3, 173);
          g.fillStyle = PALETTE.flameYellow;
          g.fillText('SALVE A HANNAH', ctx.largura / 2, 170);

          g.font = '8px "Press Start 2P", monospace';
          g.fillStyle = PALETTE.rivetCyan;
          g.fillText('ARCADE CLÁSSICO DOS ANOS 80', ctx.largura / 2, 200);

          g.fillStyle = PALETTE.white;
          g.font = '8px "Press Start 2P", monospace';
          g.fillText('TABELA DE PONTOS', ctx.largura / 2, 255);

          g.textAlign = 'left';
          const startX = 105;
          g.fillStyle = PALETTE.woodBrown;
          g.fillRect(startX, 275, 12, 10);
          g.fillStyle = PALETTE.white;
          g.fillText('PULAR BARRIL   = 100 PTS', startX + 22, 284);

          g.fillStyle = PALETTE.hammerSteel;
          g.fillRect(startX, 300, 12, 10);
          g.fillStyle = PALETTE.white;
          g.fillText('MARRETA SMASH  = 300 PTS', startX + 22, 309);

          g.fillStyle = PALETTE.hannahPink;
          g.fillRect(startX, 325, 12, 10);
          g.fillStyle = PALETTE.white;
          g.fillText('ITENS DA HANNAH= 500 PTS', startX + 22, 334);

          if (Math.sin(time * 3) > 0) {
            g.textAlign = 'center';
            g.fillStyle = PALETTE.flameYellow;
            g.font = '10px "Press Start 2P", monospace';
            g.fillText('PRESSIONE PULAR OU', ctx.largura / 2, 400);
            g.fillText('TOQUE PARA INICIAR', ctx.largura / 2, 418);
          }

          g.textAlign = 'center';
          g.font = '7px "Press Start 2P", monospace';
          g.fillStyle = '#94A3B8';
          g.fillText('SETAS: MOVER · ESPAÇO: PULAR · P: PAUSA · R: RESET', ctx.largura / 2, 475);
          g.restore();
        } else if (estado === 'VICTORY') {
          ctx.hud.desenharVitoria(g, ctx.largura, ctx.altura, 'HANNAH SALVA!', Math.floor(bonusTimer));
        } else if (estado === 'GAMEOVER') {
          ctx.hud.desenharGameOver(g, ctx.largura, ctx.altura, 'PRESSIONE PULAR / TOQUE');
        }
      },

      destruir() {
        barrels = [];
        fireballs = [];
        particles = [];
        hammerItems = [];
        bonusItems = [];
      },
    };
  },
};
