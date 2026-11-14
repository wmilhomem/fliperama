/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';

/**
 * INVASORES CÓSMICOS 84 — Shoot 'em up espacial retrô
 *
 * Homenagem ao clássico Space Invaders: defenda a base orbital
 * disparando contra os enxames alienígenas antes que alcancem a Terra.
 */

const LARGURA = 480;
const ALTURA = 560;
const ALTURA_HUD = 44;
const LINHA_INICIO_ALIEN = 72;
const LINHA_BASE_CANHAO = 524;

const COLUNAS = 10;
const LINHAS = 5;
const ESPACO = { x: 34, y: 30 };
const TOTAL_INVASORES = COLUNAS * LINHAS;

interface Invasor {
  x: number;
  y: number;
  tipo: number; // 0 = cristal-vigia (10 pts), 1 = larva-metal (20 pts), 2 = libélula-sonda (30 pts)
  vivo: boolean;
  frame: number;
}

interface Tiro {
  x: number;
  y: number;
  vy: number;
}

interface Bomba {
  x: number;
  y: number;
  vy: number;
  faseOsc: number;
}

interface Escudo {
  x: number;
  y: number;
  golpes: number; // 0..3
}

interface Particulas {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  cor: string;
}

interface Estrela {
  x: number;
  y: number;
  r: number;
  fase: number;
}

interface Ovni {
  x: number;
  y: number;
  ativo: boolean;
  vx: number;
  proximaEm: number;
}

const MATRIZ_INVASOR = [
  [
    '..X.....X..',
    '...X...X...',
    '..XXXXXXX..',
    '.XXX.X.XXX.',
    'XXXXXXXXXXX',
    'X.XXXXXXX.X',
    'X.X.....X.X',
    '...XX.XX...',
  ],
  [
    '..X.....X..',
    '.X.X...X.X.',
    'X.XXXXXXX.X',
    'XXX.XXX.XXX',
    'XXXXXXXXXXX',
    '.X.X.X.X.X.',
    '.X.......X.',
    '..X.....X..',
  ],
  [
    '....XXX....',
    '..XXXXXXX..',
    '.XXXXXXXXX.',
    'XXX.XXX.XXX',
    'XXXXXXXXXXX',
    '.X.X.X.X.X.',
    'X.X.....X.X',
    '..XX...XX..',
  ],
];

const PALETA_INVASOR = ['#34D399', '#FBBF24', '#F472B6'];
const PONTOS_INVASOR = [10, 20, 30];

export const invasores84GameModule: GameModule = {
  id: 'invasores84',
  titulo: 'Invasores Cósmicos 84',
  genero: 'Tiro Espacial',
  descricao: 'Defenda a base orbital disparando contra os enxames alienígenas em formação.',
  corTema: '#22C55E',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'Durante uma patrulha na órbita da Terra, o RX-84 "Gorgon" detecta uma imensa formação inimiga se aproximando. Você é a última linha de defesa da base orbital: derrube cada um dos invasores antes que eles toquem o solo.',
    controles: [
      'Setas Esquerda/Direita ou A/D: mover o canhão',
      'Espaço / Botão A: disparar (mantenha pressionado para fogo contínuo)',
      'P: pausar  ·  R: reiniciar',
    ],
    pontos: [
      { acao: 'Abater Cristal-vigia', pontos: 10 },
      { acao: 'Abater Larva-metal', pontos: 20 },
      { acao: 'Abater Libélula-sonda', pontos: 30 },
      { acao: 'Abater Nave Fantasma', pontos: 100 },
    ],
  },
  criar(ctx: EngineContext): GameInstance {
    // ===== Estado interno =====
    let estadoJogo: 'JOGANDO' | 'GAMEOVER' = 'JOGANDO';

    let jogador = {
      x: LARGURA / 2,
      y: LINHA_BASE_CANHAO,
      largura: 36,
      altura: 22,
      velocidade: 240,
      invulneravel: 0,
      cooldown: 0,
    };

    let invasores: Invasor[] = [];
    let tiros: Tiro[] = [];
    let bombas: Bomba[] = [];
    let escudos: Escudo[] = [];
    let particulas: Particulas[] = [];

    let direcaoEnxame = 1;
    let fase = 1;
    let velocidadeEnxame = 28;
    let ovoCooldown = 0.8;
    let ovniProximaEm = 18 + Math.random() * 14;
    let ovni: Ovni = { x: -80, y: ALTURA_HUD + 6, ativo: false, vx: 220, proximaEm: ovniProximaEm };

    const estrelas: Estrela[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * LARGURA,
      y: ALTURA_HUD + Math.random() * (ALTURA - ALTURA_HUD),
      r: Math.random() < 0.25 ? 1.6 : 1,
      fase: Math.random() * Math.PI * 2,
    }));

    // ===== Spawn =====
    function gerarEnxame(alturaInicio: number): Invasor[] {
      const inicioX = (LARGURA - (COLUNAS - 1) * ESPACO.x) / 2;
      const novos: Invasor[] = [];
      for (let linha = 0; linha < LINHAS; linha++) {
        for (let coluna = 0; coluna < COLUNAS; coluna++) {
          const tipo = linha === 0 ? 2 : linha <= 2 ? 1 : 0;
          novos.push({
            x: inicioX + coluna * ESPACO.x,
            y: alturaInicio + linha * ESPACO.y,
            tipo,
            vivo: true,
            frame: 0,
          });
        }
      }
      return novos;
    }

    function gerarEscudos(): Escudo[] {
      const largura = 54;
      const altura = 22;
      const y = LINHA_BASE_CANHAO - 74;
      return [
        { x: 92 - largura / 2, y, golpes: 0 },
        { x: 240 - largura / 2, y, golpes: 0 },
        { x: 388 - largura / 2, y, golpes: 0 },
      ];
    }

    function reiniciarPartida() {
      estadoJogo = 'JOGANDO';
      jogador.x = LARGURA / 2;
      jogador.invulneravel = 0;
      jogador.cooldown = 0;
      fase = 1;
      velocidadeEnxame = 28;
      ovoCooldown = 0.8;
      ovniProximaEm = 16 + Math.random() * 14;
      ovni = { x: -80, y: ALTURA_HUD + 6, ativo: false, vx: 220, proximaEm: ovniProximaEm };
      invasores = gerarEnxame(LINHA_INICIO_ALIEN);
      tiros = [];
      bombas = [];
      escudos = gerarEscudos();
      particulas = [];
      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas: 3,
        fase: 1,
      });
    }

    function gerarExplosao(x: number, y: number, cor: string, quantidade = 14) {
      for (let i = 0; i < quantidade; i++) {
        const angulo = Math.random() * Math.PI * 2;
        const vel = 40 + Math.random() * 120;
        particulas.push({
          x,
          y,
          vx: Math.cos(angulo) * vel,
          vy: Math.sin(angulo) * vel,
          vida: 0.5 + Math.random() * 0.5,
          cor,
        });
      }
    }

    // ===== Lógica de atualização =====
    function moverEnxame(dt: number) {
      const vivos = invasores.filter((i) => i.vivo);
      if (vivos.length === 0) return;

      const fatorMortos = 1 + (1 - vivos.length / TOTAL_INVASORES) * 2.6;
      const velocidade = (velocidadeEnxame + (fase - 1) * 8) * fatorMortos;

      let tocouBorda = false;
      for (const inv of vivos) {
        inv.x += direcaoEnxame * velocidade * dt;
        inv.frame += dt * 6;
        if (inv.x < 12 || inv.x > LARGURA - 12) tocouBorda = true;
      }

      if (tocouBorda) {
        direcaoEnxame *= -1;
        for (const inv of vivos) {
          inv.y += 14;
          inv.x += direcaoEnxame * 4;
        }
      }

      // Verificar se os alienígenas alcançaram a linha do canhão
      for (const inv of vivos) {
        if (inv.y >= LINHA_BASE_CANHAO - 40) {
          estadoJogo = 'GAMEOVER';
          ctx.finalizarJogo('gameOver');
          return;
        }
      }
    }

    function atirar() {
      if (jogador.cooldown > 0 || tiros.length >= 3) return;
      tiros.push({ x: jogador.x, y: jogador.y - 18, vy: -520 });
      jogador.cooldown = 0.22;
      ctx.audio.tocar('tiro');
    }

    function atualizarTiros(dt: number) {
      jogador.cooldown = Math.max(0, jogador.cooldown - dt);
      jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);

      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        tiro.y += tiro.vy * dt;
        if (tiro.y < ALTURA_HUD) {
          tiros.splice(i, 1);
        }
      }

      for (let i = bombas.length - 1; i >= 0; i--) {
        const bomba = bombas[i];
        bomba.y += bomba.vy * dt;
        bomba.x += Math.sin(bomba.faseOsc) * 30 * dt;
        bomba.faseOsc += dt * 6;
        if (bomba.y > ALTURA + 20) {
          bombas.splice(i, 1);
        }
      }

      for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        p.vida -= dt;
        if (p.vida <= 0) {
          particulas.splice(i, 1);
        }
      }
    }

    function atualizarOvni(dt: number) {
      if (ovni.ativo) {
        ovni.x += ovni.vx * dt;
        if (ovni.x > LARGURA + 80 || ovni.x < -80) {
          ovni.ativo = false;
          ovniProximaEm = 18 + Math.random() * 14;
        }
        return;
      }

      ovniProximaEm -= dt;
      if (ovniProximaEm <= 0) {
        ovni.ativo = true;
        ovni.vx = Math.random() < 0.5 ? 220 : -220;
        ovni.x = ovni.vx > 0 ? -80 : LARGURA + 80;
      }
    }

    function gerarBomba(dt: number) {
      ovoCooldown -= dt;
      if (ovoCooldown > 0) return;

      const vivos = invasores.filter((i) => i.vivo);
      if (vivos.length === 0) return;

      // Gatilho de disparo: inimigos mais baixos atiram com mais frequência
      const maisBaixos = new Map<number, Invasor>();
      for (const inv of vivos) {
        const coluna = Math.round(inv.x / ESPACO.x);
        const atual = maisBaixos.get(coluna);
        if (!atual || inv.y > atual.y) maisBaixos.set(coluna, inv);
      }
      const candidatos = [...maisBaixos.values()];
      const atirador = candidatos[Math.floor(Math.random() * candidatos.length)];
      bombas.push({
        x: atirador.x,
        y: atirador.y + 12,
        vy: 120 + (fase - 1) * 22 + Math.random() * 30,
        faseOsc: Math.random() * Math.PI * 2,
      });

      const fatorRubro = Math.max(0.35, 1.4 - (1 - vivos.length / TOTAL_INVASORES) * 0.9 - (fase - 1) * 0.15);
      ovoCooldown = fatorRubro * (0.6 + Math.random() * 0.9);
    }

    function verificarColisoes() {
      // Tiro × invasor
      for (let i = tiros.length - 1; i >= 0; i--) {
        const tiro = tiros[i];
        let acertou = false;

        for (const inv of invasores) {
          if (!inv.vivo) continue;
          if (Math.abs(tiro.x - inv.x) < 14 && Math.abs(tiro.y - inv.y) < 10) {
            inv.vivo = false;
            acertou = true;
            const pontos = PONTOS_INVASOR[inv.tipo];
            ctx.hud.adicionarPontos(pontos, inv.x, inv.y, PALETA_INVASOR[inv.tipo]);
            gerarExplosao(inv.x, inv.y, PALETA_INVASOR[inv.tipo], 16);
            ctx.audio.tocar('explosao');
            break;
          }
        }

        // Tiro × OVNI
        if (!acertou && ovni.ativo) {
          if (Math.abs(tiro.x - ovni.x) < 26 && Math.abs(tiro.y - ovni.y) < 10) {
            acertou = true;
            const pontos = 80 + Math.floor(Math.random() * 5) * 20; // 80..160
            ctx.hud.adicionarPontos(pontos, ovni.x, ovni.y, '#FDE047');
            gerarExplosao(ovni.x, ovni.y, '#FDE047', 24);
            ctx.audio.tocar('especial');
            ovni.ativo = false;
            ovniProximaEm = 18 + Math.random() * 14;
          }
        }

        // Tiro × escudo (destrói o escudo)
        if (!acertou) {
          for (const escudo of escudos) {
            if (escudo.golpes < 3 &&
                tiro.x > escudo.x && tiro.x < escudo.x + 54 &&
                tiro.y > escudo.y && tiro.y < escudo.y + 18) {
              escudo.golpes += 1;
              acertou = true;
              gerarExplosao(tiro.x, escudo.y + 6, '#34D399', 6);
              break;
            }
          }
        }

        if (acertou) tiros.splice(i, 1);
      }

      // Bomba × canhão / escudo
      for (let i = bombas.length - 1; i >= 0; i--) {
        const bomba = bombas[i];
        let consumida = false;

        // Escudo
        for (const escudo of escudos) {
          if (escudo.golpes < 3 &&
              bomba.x > escudo.x && bomba.x < escudo.x + 54 &&
              bomba.y > escudo.y && bomba.y < escudo.y + 18) {
            escudo.golpes += 1;
            consumida = true;
            gerarExplosao(bomba.x, escudo.y + 6, '#34D399', 6);
            break;
          }
        }

        // Canhão
        if (!consumida && jogador.invulneravel <= 0) {
          const canhao = {
            x: jogador.x - jogador.largura / 2,
            y: jogador.y - jogador.altura / 2,
            largura: jogador.largura,
            altura: jogador.altura,
          };
          if (bomba.x > canhao.x && bomba.x < canhao.x + canhao.largura &&
              bomba.y > canhao.y && bomba.y < canhao.y + canhao.altura) {
            consumida = true;
            gerarExplosao(jogador.x, jogador.y, '#FBBF24', 26);
            ctx.audio.tocar('vidaPerdida');
            const restantes = ctx.hud.perderVida();
            jogador.invulneravel = 2.2;
            if (restantes <= 0) {
              estadoJogo = 'GAMEOVER';
              ctx.finalizarJogo('gameOver');
              return;
            }
          }
        }

        if (consumida) bombas.splice(i, 1);
      }
    }

    function verificarFimDeFase() {
      if (invasores.some((i) => i.vivo)) return;

      // Fase completa: avança de nível e reexame o enxame mais baixo e rápido
      fase += 1;
      ctx.hud.definirFase(fase);
      ctx.audio.tocar('vitoria');
      invasores = gerarEnxame(LINHA_INICIO_ALIEN + 10);
      velocidadeEnxame = 28 + (fase - 1) * 6;
      direcaoEnxame = 1;
      tiros = [];
      bombas = [];
      escudos = gerarEscudos();
    }

    function atualizarJogo(dt: number, input: InputState) {
      if (estadoJogo === 'GAMEOVER') {
        if (input.acaoPressionada) {
          reiniciarPartida();
        }
        return;
      }

      // Movimento do canhão
      let move = 0;
      if (input.esquerda) move -= 1;
      if (input.direita) move += 1;
      jogador.x += move * jogador.velocidade * dt;
      jogador.x = Math.max(jogador.largura / 2 + 4, Math.min(LARGURA - jogador.largura / 2 - 4, jogador.x));

      // Disparo: mantenha pressionado para fogo contínuo
      if (input.acao) atirar();

      moverEnxame(dt);
      if (estadoJogo !== 'JOGANDO') return;

      atualizarTiros(dt);
      atualizarOvni(dt);
      gerarBomba(dt);
      verificarColisoes();
      if (estadoJogo !== 'JOGANDO') return;

      verificarFimDeFase();
    }

    // ===== Desenho =====
    function desenharEscudo(g: CanvasRenderingContext2D, escudo: Escudo) {
      const cor = escudo.golpes === 0 ? '#22C55E' : escudo.golpes === 1 ? '#16A34A' : escudo.golpes === 2 ? '#166534' : 'transparent';
      if (escudo.golpes >= 3) return;
      g.save();
      g.fillStyle = cor;
      g.fillRect(escudo.x, escudo.y, 54, 16);
      g.fillRect(escudo.x + 6, escudo.y - 6, 42, 6);
      // buraco central (arco clássico)
      g.globalCompositeOperation = 'destination-out';
      g.fillRect(escudo.x + 19, escudo.y + 10, 16, 8);
      g.restore();
    }

    function desenharAlien(g: CanvasRenderingContext2D, inv: Invasor) {
      const matriz = MATRIZ_INVASOR[inv.tipo];
      const paleta = PALETA_INVASOR[inv.tipo];
      const fase = Math.floor(inv.frame) % 2;
      const desloc = fase === 0 ? 0 : 1;
      ctx.sprites.desenharMatriz(g, matriz, { X: paleta }, Math.floor(inv.x - 11), Math.floor(inv.y - 9) + desloc, 2);
    }

    function desenharCenario(g: CanvasRenderingContext2D, tempoTotal: number) {
      // Fundo espacial
      g.fillStyle = '#050714';
      g.fillRect(0, 0, LARGURA, ALTURA);

      // Estrelas (com cintilação)
      for (const e of estrelas) {
        const brilho = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tempoTotal * 2 + e.fase));
        g.fillStyle = `rgba(255,255,255,${brilho.toFixed(3)})`;
        g.fillRect(Math.floor(e.x), Math.floor(e.y), Math.ceil(e.r), Math.ceil(e.r));
      }

      // Horizonte planetário decorativo (atmosfera)
      g.fillStyle = '#0b1030';
      g.beginPath();
      g.ellipse(LARGURA / 2, ALTURA + 30, LARGURA * 0.8, 90, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(34,197,94,0.08)';
      g.beginPath();
      g.ellipse(LARGURA / 2, ALTURA + 26, LARGURA * 0.8, 76, 0, 0, Math.PI * 2);
      g.fill();

      // Linha de base do canhão
      g.strokeStyle = 'rgba(34,197,94,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, LINHA_BASE_CANHAO + 20);
      g.lineTo(LARGURA, LINHA_BASE_CANHAO + 20);
      g.stroke();
    }

    function desenharJogador(g: CanvasRenderingContext2D) {
      const pisca = jogador.invulneravel > 0 && Math.floor(jogador.invulneravel * 10) % 2 === 0;
      if (pisca) return;

      // Corpo do canhão
      g.fillStyle = '#4ADE80';
      g.fillRect(jogador.x - jogador.largura / 2, jogador.y - 6, jogador.largura, 14);
      g.fillStyle = '#22C55E';
      g.fillRect(jogador.x - jogador.largura / 2 + 4, jogador.y + 8, jogador.largura - 8, 6);

      // Base
      g.fillStyle = '#15803D';
      g.fillRect(jogador.x - jogador.largura / 2 - 6, jogador.y + 14, jogador.largura + 12, 6);

      // Canhão
      g.fillStyle = '#BBF7D0';
      g.fillRect(jogador.x - 2, jogador.y - 16, 4, 12);

      // Cockpit
      g.fillStyle = '#A7F3D0';
      g.fillRect(jogador.x - 6, jogador.y - 4, 12, 5);
    }

    function desenharOvni(g: CanvasRenderingContext2D) {
      g.save();
      g.translate(ovni.x, ovni.y);
      g.fillStyle = '#F472B6';
      g.beginPath();
      g.ellipse(0, 0, 26, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#FDE68A';
      g.beginPath();
      g.ellipse(0, -4, 12, 6, 0, Math.PI, Math.PI * 2);
      g.fill();
      g.fillStyle = '#FFFFFF';
      g.fillRect(-14, -1, 3, 3);
      g.fillRect(-4, -1, 3, 3);
      g.fillRect(6, -1, 3, 3);
      g.restore();
    }

    // ===== GameInstance =====
    let tempoTotal = 0;

    return {
      iniciar() {
        reiniciarPartida();
      },

      reiniciar() {
        reiniciarPartida();
      },

      pausar() {
        // Motor desenha a tela de pausa; nada a fazer aqui.
      },

      retomar() {
        // Motor retoma o loop; nada a fazer aqui.
      },

      destruir() {
        tiros = [];
        bombas = [];
        invasores = [];
        particulas = [];
      },

      atualizar(dt: number, input: InputState) {
        const dtSeguro = Math.min(dt, 0.05);
        tempoTotal += dtSeguro;
        atualizarJogo(dtSeguro, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        desenharCenario(g, tempoTotal);

        // Escudos
        for (const escudo of escudos) {
          desenharEscudo(g, escudo);
        }

        // Invasores
        for (const inv of invasores) {
          if (!inv.vivo) continue;
          desenharAlien(g, inv);
        }

        // OVNI
        if (ovni.ativo) {
          desenharOvni(g);
        }

        // Tiros do jogador
        g.fillStyle = '#FDE047';
        for (const tiro of tiros) {
          g.fillRect(Math.floor(tiro.x - 1.5), Math.floor(tiro.y - 8), 3, 12);
        }

        // Bombas inimigas
        for (const bomba of bombas) {
          g.fillStyle = '#F87171';
          g.fillRect(Math.floor(bomba.x - 2), Math.floor(bomba.y - 5), 4, 10);
          g.fillStyle = '#FCA5A5';
          g.fillRect(Math.floor(bomba.x - 2), Math.floor(bomba.y - 5), 4, 3);
        }

        // Partículas de explosão
        for (const p of particulas) {
          g.globalAlpha = Math.max(0, Math.min(1, p.vida / 0.9));
          g.fillStyle = p.cor;
          g.fillRect(Math.floor(p.x - 2), Math.floor(p.y - 2), 4, 4);
        }
        g.globalAlpha = 1;

        // Canhão do jogador
        desenharJogador(g);

        // HUD padrão do motor
        ctx.hud.desenharHUD(g, LARGURA, ALTURA);

        // Tela de Game Over
        if (estadoJogo === 'GAMEOVER') {
          ctx.hud.desenharGameOver(g, LARGURA, ALTURA, 'PRESSIONE AÇÃO / TOQUE');
        }
      },
    };
  },
};
