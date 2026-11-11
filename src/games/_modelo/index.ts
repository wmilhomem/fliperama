/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';

/**
 * JOGO MODELO / TEMPLATE: "Retro Orb" (Bolinha Arcade)
 *
 * Use este arquivo como modelo/molde para criar novos jogos na plataforma Fliperama.
 * Basta copiar esta pasta para `/src/games/nome_do_jogo/index.ts` e registrá-lo em `registry.ts`.
 */
export const modeloGameModule: GameModule = {
  id: 'modelo',
  titulo: 'Retro Orb',
  descricao: 'Jogo modelo: controle a esfera de neon, colete cristais de energia e desvie dos choques elétricos.',
  genero: 'Arcade / Esquiva',
  corTema: '#06B6D4',
  largura: 320,
  altura: 400,
  instrucoes: {
    historia: 'Você controla um orbe de plasma em um circuito retrô. Colete chips de energia antes que o tempo acabe e evite colidir com as faíscas oscilantes!',
    controles: [
      'Setas / WASD / D-Pad: Mover o orbe em todas as direções',
      'Espaço / Botão A: Impulso de velocidade rápido',
    ],
    pontos: [
      { acao: 'Coletar Cristal de Energia', pontos: 100 },
      { acao: 'Bônus por Fase Concluída', pontos: 500 },
    ],
  },
  criar(ctx: EngineContext): GameInstance {
    // ESTADO INTERNO DO JOGO
    interface Cristal {
      x: number;
      y: number;
      raio: number;
      cor: string;
      tempo: number;
    }

    interface Faisca {
      x: number;
      y: number;
      vx: number;
      vy: number;
      raio: number;
    }

    let jogador = {
      x: ctx.largura / 2,
      y: ctx.altura / 2,
      vx: 0,
      vy: 0,
      raio: 10,
      velocidade: 160,
    };

    let cristais: Cristal[] = [];
    let faiscas: Faisca[] = [];
    let tempoSpawnFaisca = 0;
    let estadoJogo: 'JOGANDO' | 'VITORIA' | 'GAMEOVER' = 'JOGANDO';

    function gerarCristal(): Cristal {
      const margem = 30;
      return {
        x: margem + Math.random() * (ctx.largura - margem * 2),
        y: margem + 40 + Math.random() * (ctx.altura - margem * 2 - 40),
        raio: 6,
        cor: '#FACC15',
        tempo: 0,
      };
    }

    function gerarFaisca(): Faisca {
      const lado = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (lado === 0) {
        x = Math.random() * ctx.largura;
        y = 45;
      } else if (lado === 1) {
        x = ctx.largura - 5;
        y = Math.random() * ctx.altura;
      } else if (lado === 2) {
        x = Math.random() * ctx.largura;
        y = ctx.altura - 5;
      } else {
        x = 5;
        y = Math.random() * ctx.altura;
      }

      const angulo = Math.random() * Math.PI * 2;
      const vel = 80 + Math.random() * 60;
      return {
        x,
        y,
        vx: Math.cos(angulo) * vel,
        vy: Math.sin(angulo) * vel,
        raio: 7,
      };
    }

    function resetarEntidades() {
      jogador.x = ctx.largura / 2;
      jogador.y = ctx.altura / 2;
      jogador.vx = 0;
      jogador.vy = 0;

      cristais = [gerarCristal(), gerarCristal(), gerarCristal()];
      faiscas = [gerarFaisca(), gerarFaisca()];
      tempoSpawnFaisca = 0;
      estadoJogo = 'JOGANDO';
    }

    return {
      iniciar() {
        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde: ctx.storage.lerRecorde(ctx.id),
          vidas: 3,
          fase: 1,
        });
        resetarEntidades();
      },

      reiniciar() {
        ctx.hud.definirEstado({
          pontuacao: 0,
          recorde: ctx.storage.lerRecorde(ctx.id),
          vidas: 3,
          fase: 1,
        });
        resetarEntidades();
      },

      pausar() {
        // Pausar sons contínuos ou rotinas caso existam
      },

      retomar() {
        // Retomar
      },

      atualizar(dt: number, input: InputState) {
        if (estadoJogo === 'GAMEOVER' || estadoJogo === 'VITORIA') {
          if (input.acaoPressionada) {
            this.reiniciar();
          }
          return;
        }

        // Movimentação do Jogador
        let moveX = 0;
        let moveY = 0;

        if (input.esquerda) moveX -= 1;
        if (input.direita) moveX += 1;
        if (input.cima) moveY -= 1;
        if (input.baixo) moveY += 1;

        // Normalização diagonal
        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        // Boost de velocidade
        const boost = input.acao ? 1.6 : 1.0;
        jogador.x += moveX * jogador.velocidade * boost * dt;
        jogador.y += moveY * jogador.velocidade * boost * dt;

        // Limites da arena
        jogador.x = Math.max(jogador.raio + 4, Math.min(ctx.largura - jogador.raio - 4, jogador.x));
        jogador.y = Math.max(jogador.raio + 45, Math.min(ctx.altura - jogador.raio - 4, jogador.y));

        // Coleta de cristais
        for (let i = cristais.length - 1; i >= 0; i--) {
          const c = cristais[i];
          c.tempo += dt;
          if (
            ctx.colisao.circuloCirculo(
              { x: jogador.x, y: jogador.y, raio: jogador.raio },
              { x: c.x, y: c.y, raio: c.raio }
            )
          ) {
            ctx.audio.tocar('moeda');
            ctx.hud.adicionarPontos(100, c.x, c.y, '#FACC15');
            cristais.splice(i, 1);
            cristais.push(gerarCristal());

            // Avançar fase ao atingir múltiplos de 500 pontos
            const pts = ctx.hud.obterEstado().pontuacao;
            if (pts > 0 && pts % 500 === 0) {
              ctx.audio.tocar('vitoria');
              ctx.hud.proximaFase();
              faiscas.push(gerarFaisca());
            }
          }
        }

        // Atualizar faíscas
        tempoSpawnFaisca += dt;
        if (tempoSpawnFaisca > 4.0 && faiscas.length < 8) {
          faiscas.push(gerarFaisca());
          tempoSpawnFaisca = 0;
        }

        for (const f of faiscas) {
          f.x += f.vx * dt;
          f.y += f.vy * dt;

          // Rebater nas paredes
          if (f.x - f.raio <= 4 || f.x + f.raio >= ctx.largura - 4) {
            f.vx *= -1;
          }
          if (f.y - f.raio <= 45 || f.y + f.raio >= ctx.altura - 4) {
            f.vy *= -1;
          }

          // Colisão com o jogador
          if (
            ctx.colisao.circuloCirculo(
              { x: jogador.x, y: jogador.y, raio: jogador.raio },
              { x: f.x, y: f.y, raio: f.raio }
            )
          ) {
            ctx.audio.tocar('vidaPerdida');
            const vidasRestantes = ctx.hud.perderVida();
            if (vidasRestantes <= 0) {
              estadoJogo = 'GAMEOVER';
              ctx.finalizarJogo('gameOver');
            } else {
              // Reposiciona jogador no centro
              jogador.x = ctx.largura / 2;
              jogador.y = ctx.altura / 2;
            }
            break;
          }
        }
      },

      desenhar(g: CanvasRenderingContext2D) {
        // Arena Retrô
        g.strokeStyle = '#06B6D4';
        g.lineWidth = 2;
        g.strokeRect(4, 45, ctx.largura - 8, ctx.altura - 49);

        // Grid sutil
        g.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        g.lineWidth = 1;
        for (let x = 20; x < ctx.largura; x += 25) {
          g.beginPath();
          g.moveTo(x, 45);
          g.lineTo(x, ctx.altura - 4);
          g.stroke();
        }
        for (let y = 60; y < ctx.altura; y += 25) {
          g.beginPath();
          g.moveTo(4, y);
          g.lineTo(ctx.largura - 4, y);
          g.stroke();
        }

        // Cristais de energia
        for (const c of cristais) {
          const escala = 1 + Math.sin(c.tempo * 6) * 0.2;
          g.fillStyle = c.cor;
          g.beginPath();
          g.arc(c.x, c.y, c.raio * escala, 0, Math.PI * 2);
          g.fill();
        }

        // Faíscas inimigas
        for (const f of faiscas) {
          g.fillStyle = '#EF4444';
          g.beginPath();
          g.arc(f.x, f.y, f.raio, 0, Math.PI * 2);
          g.fill();

          // Núcleo branco
          g.fillStyle = '#FFFFFF';
          g.beginPath();
          g.arc(f.x, f.y, f.raio * 0.4, 0, Math.PI * 2);
          g.fill();
        }

        // Jogador (Orbe de Plasma)
        g.fillStyle = '#22D3EE';
        g.beginPath();
        g.arc(jogador.x, jogador.y, jogador.raio, 0, Math.PI * 2);
        g.fill();

        g.fillStyle = '#FFFFFF';
        g.beginPath();
        g.arc(jogador.x - 2, jogador.y - 2, jogador.raio * 0.4, 0, Math.PI * 2);
        g.fill();

        // Desenhar HUD padrão do motor
        ctx.hud.desenharHUD(g, ctx.largura, ctx.altura);

        // Tela de Game Over se aplicável
        if (estadoJogo === 'GAMEOVER') {
          ctx.hud.desenharGameOver(g, ctx.largura, ctx.altura, 'PRESSIONE AÇÃO / TOQUE');
        }
      },

      destruir() {
        cristais = [];
        faiscas = [];
      },
    };
  },
};
