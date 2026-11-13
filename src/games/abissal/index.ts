/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * JOGO: "Submarino Abissal"
 *
 * Depois de uma tempestade, mergulhadores ficaram à deriva num oceano cheio
 * de predadores e submarinos piratas. A capitã Marina e o pequeno submarino
 * de resgate "Abissal" precisam recolher os náufragos e levá-los à
 * superfície, sem ficar sem ar.
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import { AGUA_Y, ALTURA, FUNDO_Y, LARGURA, MAX_MERGULHADORES, PONTOS_ENTREGA, PONTOS_ENTREGA_MAX, PONTOS_MAX_INIMIGO, PONTOS_PATRULHA, PONTOS_POR_FASE, PONTOS_POR_VIDA_EXTRA, BONUS_FASE_POR_OXIGENIO, VIDAS_INICIAIS, VIDAS_MAXIMAS, X_RETORNO } from './constantes';
import { desenharCenario, desenharNavioApoio, desenharPontoRetorno } from './cenario';
import {
  configuracaoFase,
  centroDaFaixa,
  faixaDoY,
  sortearFaixa,
  xInicialInimigo,
  type ConfiguracaoFase,
} from './faixas';
import { desenharHudAbissal } from './hud';
import {
  InimigoBase,
  TipoInimigo,
  caixaInimigo,
  criarAguaViva,
  criarCardume,
  criarPirata,
  criarTubarao,
  desenharAguaViva,
  desenharPirata,
  desenharPiranha,
  desenharTorpedoPirata,
  desenharTubarao,
  atualizarAguaViva,
  atualizarPirata,
  atualizarPiranha,
  atualizarTubarao,
  type TorpedoPirata,
} from './inimigos';
import {
  criarExplosao,
  criarBolha,
  criarFaisca,
  criarParticulas,
  criarRespingo,
  atualizarParticulas,
  desenharParticulas,
  type Particula,
} from './particulas';
import {
  criarMergulhador,
  criarMergulhadores,
  caixaMergulhador,
  atualizarMergulhadores,
  desenharMergulhador,
  type Mergulhador,
} from './mergulhadores';
import { criarMusicaAbissal } from './musica';
import {
  atualizarOxigenio,
  criarOxigenio,
  recarregarParcial,
  recarregarTotal,
  semOxigenio,
  type Oxigenio,
} from './oxigenio';
import {
  Bomba,
  PATRULHA_LARGURA,
  Patrulha,
  VIDA_PATRULHA,
  atualizarBombas,
  atualizarPatrulha,
  caixaBomba,
  caixaPatrulha,
  criarPatrulha,
  desenharBomba,
  desenharPatrulha,
} from './patrulha';
import {
  Submarino,
  atualizarSubmarino,
  atualizarTorpedo,
  caixaSubmarino,
  criarSubmarino,
  dispararTorpedo,
  desenharSubmarino,
  desenharTorpedo,
} from './submarino';

interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

interface EstadoFaixa {
  tipo: TipoInimigo;
  proximoSpawn: number;
  vivos: number;
}

function intersecta(a: Retangulo, b: Retangulo): boolean {
  return (
    a.x < b.x + b.largura &&
    a.x + a.largura > b.x &&
    a.y < b.y + b.altura &&
    a.y + a.altura > b.y
  );
}

function pontosDoInimigo(tipo: TipoInimigo, fase: number): number {
  const base = tipo === 'tubarao' ? 20 : tipo === 'piranha' ? 30 : tipo === 'pirata' ? 40 : 15;
  return Math.min(PONTOS_MAX_INIMIGO, base + PONTOS_POR_FASE * (fase - 1));
}

export const abissalGameModule: GameModule = {
  id: 'abissal',
  titulo: 'Submarino Abissal',
  descricao:
    'Mergulhe, resgate os náufragos e volte à superfície antes que o oxigênio acabe.',
  genero: 'Aventura submarina',
  corTema: '#0EA5E9',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'Depois de uma tempestade, mergulhadores ficaram à deriva num oceano cheio de predadores e submarinos piratas. Recolha os náufragos e leve-os ao navio de apoio "Pérola" antes que o oxigênio acabe.',
    controles: [
      'Setas / WASD / D-Pad: navegar o submarino',
      'Espaço / Botão A: disparar torpedo',
      'P: pausar · R: reiniciar · M: som · ESC: voltar ao hub',
    ],
    pontos: [
      { acao: 'Tubarão-lanterna', pontos: 20 },
      { acao: 'Piranha-abissal', pontos: 30 },
      { acao: 'Submarino pirata', pontos: 40 },
      { acao: 'Água-viva elétrica', pontos: 15 },
      { acao: 'Navio-patrulha pirata', pontos: 150 },
      { acao: 'Entrega de cada náufrago', pontos: 50 },
    ],
  },
  criar(ctx: EngineContext): GameInstance {
    const musica = criarMusicaAbissal(ctx.audio);

    let estado: 'titulo' | 'jogando' | 'morrendo' | 'gameover' = 'titulo';
    let fase = 1;
    let vidas = VIDAS_INICIAIS;
    let config: ConfiguracaoFase = configuracaoFase(1);
    let sub: Submarino = criarSubmarino(X_RETORNO - 24, AGUA_Y - 40);
    let oxigenio: Oxigenio = criarOxigenio();
    let mergulhadores: Mergulhador[] = criarMergulhadores();
    let inimigos: InimigoBase[] = [];
    let torpedosPirata: TorpedoPirata[] = [];
    let particulas: Particula[] = criarParticulas();
    let patrulha: Patrulha | null = null;
    let bombas: Bomba[] = [];
    let faixas: EstadoFaixa[] = [];
    let tempoGlobal = 0;
    let tempoFase = 0;
    let tempoNaSuperficie = 0;
    let proximoMergulhador = 2;
    let tempoEstado = 0;
    let tempoMotor = 0;
    let tempoBolhas = 0;
    let pontosMarcaVidaExtra = 0;
    let naSuperficieAnterior = true;
    let destruido = false;

    function iniciarFase(novaFase: number): void {
      fase = novaFase;
      config = configuracaoFase(fase);
      faixas = [];
      for (let i = 0; i < 5; i++) {
        const tipos: TipoInimigo[] = ['tubarao', 'piranha', 'pirata', 'aguaviva', 'tubarao'];
        faixas.push({
          tipo: tipos[Math.floor(Math.random() * tipos.length)],
          proximoSpawn: 0.6 + Math.random() * 1.4,
          vivos: 0,
        });
      }
      inimigos = [];
      torpedosPirata = [];
      bombas = [];
      patrulha = null;
      tempoFase = 0;
      tempoNaSuperficie = 0;
      proximoMergulhador = 2;
      sub.mergulhou = false;
      sub.aBordo = 0;
      sub.x = X_RETORNO - 24;
      sub.y = AGUA_Y - 40;
      sub.vx = 0;
      sub.vy = 0;
      sub.torpedo = null;
      recarregarTotal(oxigenio);
    }

    function iniciarPartida(): void {
      vidas = VIDAS_INICIAIS;
      pontosMarcaVidaExtra = 0;
      mergulhadores = criarMergulhadores();
      particulas = criarParticulas();
      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas,
        fase: 1,
      });
      iniciarFase(1);
      estado = 'jogando';
      tempoEstado = 0;
      naSuperficieAnterior = true;
    }

    function adicionarPontos(valor: number): void {
      const total = Math.floor(ctx.hud.obterEstado().pontuacao + valor);
      ctx.hud.definirEstado({ pontuacao: total });
      if (total - pontosMarcaVidaExtra >= PONTOS_POR_VIDA_EXTRA && vidas < VIDAS_MAXIMAS) {
        pontosMarcaVidaExtra = total;
        vidas += 1;
        ctx.hud.definirEstado({ vidas });
        ctx.audio.tocar('item');
      }
    }

    function perderVida(): void {
      if (estado !== 'jogando') return;
      vidas -= 1;
      ctx.hud.definirEstado({ vidas });
      ctx.audio.tocar('vidaPerdida');
      particulas.push(...criarExplosao(sub.x + sub.largura / 2, sub.y + sub.altura / 2, 48));

      if (vidas <= 0) {
        estado = 'gameover';
        ctx.hud.definirEstado({ vidas: 0 });
        ctx.finalizarJogo('gameOver');
        return;
      }

      // Ressurreição na superfície
      sub.x = X_RETORNO - 24;
      sub.y = AGUA_Y - 40;
      sub.vx = 0;
      sub.vy = 0;
      sub.torpedo = null;
      sub.aBordo = 0;
      sub.mergulhou = false;
      sub.estado = 'atingido';
      sub.tempoEstado = 0;
      recarregarTotal(oxigenio);
      tempoNaSuperficie = 0;
      tempoEstado = 0;
      estado = 'morrendo';
    }

    function entregarNaufragos(): void {
      const pontos = Math.min(PONTOS_ENTREGA_MAX, PONTOS_ENTREGA * fase);
      const aBordo = sub.aBordo;

      if (aBordo >= MAX_MERGULHADORES) {
        // Fase concluída
        adicionarPontos(aBordo * pontos);
        adicionarPontos(Math.floor(oxigenio.valor) * BONUS_FASE_POR_OXIGENIO);
        ctx.audio.tocar('entrega');
        ctx.audio.tocar('vitoria');
        sub.aBordo = 0;
        iniciarFase(fase + 1);
        ctx.hud.definirEstado({ fase });
      } else if (aBordo >= 1) {
        // Entrega parcial
        adicionarPontos(pontos);
        ctx.audio.tocar('entrega');
        sub.aBordo -= 1;
        recarregarParcial(oxigenio, 35);
        // Volta para o mar
        sub.y = AGUA_Y + 8;
        sub.vy = 40;
        sub.mergulhou = false;
        tempoNaSuperficie = 0;
      }

      // A patrulha some quando o jogador entrega um náufrago
      if (patrulha) {
        particulas.push(...criarExplosao(patrulha.x + PATRULHA_LARGURA / 2, patrulha.y + 16, 48));
        patrulha = null;
        tempoNaSuperficie = 0;
      }
    }

    function atualizarInimigos(dt: number): void {
      const faixaSub = faixaDoY(sub.y + sub.altura / 2);

      for (let i = faixas.length - 1; i >= 0; i--) {
        const faixa = faixas[i];
        faixa.proximoSpawn -= dt;

        if (faixa.proximoSpawn <= 0 && faixa.vivos < config.quantidadePorFaixa) {
          // Não nasce em cima do submarino
          if (Math.abs(i - faixaSub) >= 1) {
            const lado: -1 | 1 = Math.random() > 0.5 ? 1 : -1;
            const velocidade = config.velocidadeInimigos * (0.85 + Math.random() * 0.35);
            let novos: InimigoBase[] = [];
            switch (faixa.tipo) {
              case 'tubarao':
                novos = [
                  criarTubarao(
                    xInicialInimigo(lado, 64),
                    i,
                    velocidade * lado,
                    pontosDoInimigo('tubarao', fase)
                  ),
                ];
                break;
              case 'piranha': {
                const tamanho = 3 + Math.floor(Math.random() * 3);
                novos = criarCardume(
                  xInicialInimigo(lado, 32),
                  i,
                  velocidade * lado,
                  pontosDoInimigo('piranha', fase),
                  tamanho
                );
                break;
              }
              case 'pirata':
                novos = [
                  criarPirata(
                    xInicialInimigo(lado, 32),
                    i,
                    velocidade * lado * 0.8,
                    pontosDoInimigo('pirata', fase)
                  ),
                ];
                break;
              default:
                novos = [
                  criarAguaViva(
                    xInicialInimigo(lado, 32),
                    i,
                    velocidade * 0.35 * lado,
                    pontosDoInimigo('aguaviva', fase)
                  ),
                ];
                break;
            }
            inimigos.push(...novos);
            faixa.vivos += novos.length;
            faixa.proximoSpawn = 2.2 + Math.random() * 2.4 - config.quantidadePorFaixa * 0.2;
          } else {
            faixa.proximoSpawn = 0.8;
          }
        }
      }

      const caixaSub = caixaSubmarino(sub);

      for (let i = inimigos.length - 1; i >= 0; i--) {
        const inimigo = inimigos[i];
        inimigo.animacao += dt;

        switch (inimigo.tipo) {
          case 'tubarao':
            atualizarTubarao(inimigo, dt);
            break;
          case 'piranha':
            atualizarPiranha(inimigo, dt);
            break;
          case 'pirata': {
            const novos = atualizarPirata(inimigo, dt, 2.4);
            for (const t of novos) {
              // Não deixa o pirata atirar em cima do submarino (impossível desviar)
              const acima = Math.abs(t.y - (sub.y + sub.altura / 2)) < 20;
              if (!acima) torpedosPirata.push(t);
            }
            break;
          }
          case 'aguaviva': {
            const base = centroDaFaixa(inimigo.faixa);
            atualizarAguaViva(inimigo, dt, base - 40, base + 40);
            break;
          }
          default:
            break;
        }

        // Colisão com o torpedo do submarino
        if (sub.torpedo && intersecta(caixaInimigo(inimigo), {
          x: sub.torpedo.x,
          y: sub.torpedo.y,
          largura: 16,
          altura: 16,
        })) {
          sub.torpedo = null;
          inimigo.vivo = false;
          const faixaDoInimigo = faixas[inimigo.faixa];
          if (faixaDoInimigo) {
            faixaDoInimigo.vivos = Math.max(0, faixaDoInimigo.vivos - 1);
          }
          adicionarPontos(inimigo.pontos);
          ctx.audio.tocar('explosao');
          particulas.push(
            ...criarExplosao(
              inimigo.x + inimigo.largura / 2,
              inimigo.y + inimigo.altura / 2,
              32
            )
          );
          for (let p = 0; p < 4; p++) {
            particulas.push(criarFaisca(inimigo.x + inimigo.largura / 2, inimigo.y + inimigo.altura / 2, '#FDE68A'));
          }
          inimigos.splice(i, 1);
          continue;
        }

        // Colisão com o submarino
        if (!inimigo.vivo) {
          inimigos.splice(i, 1);
          continue;
        }
        if (intersecta(caixaInimigo(inimigo), caixaSub)) {
          perderVida();
          return;
        }
      }

      // Torpedos dos piratas
      for (let i = torpedosPirata.length - 1; i >= 0; i--) {
        const t = torpedosPirata[i];
        t.x += t.vx * dt;
        t.vida -= dt;
        if (t.vida <= 0 || t.x < -32 || t.x > LARGURA + 32) {
          torpedosPirata.splice(i, 1);
          continue;
        }
        if (
          intersecta(
            { x: t.x, y: t.y, largura: 16, altura: 8 },
            caixaSub
          )
        ) {
          torpedosPirata.splice(i, 1);
          perderVida();
          return;
        }
      }
    }

    function atualizarNaufragos(dt: number): void {
      const faixaSub = faixaDoY(sub.y + sub.altura / 2);
      proximoMergulhador -= dt;
      if (proximoMergulhador <= 0) {
        proximoMergulhador = 5 + Math.random() * 4;
        const faixa = sortearFaixa(faixaSub);
        const y = centroDaFaixa(faixa) - 16;
        const x = Math.random() * (LARGURA - 16);
        if (Math.abs(x - sub.x) > 80) {
          mergulhadores.push(criarMergulhador(faixa, x, y));
        }
      }

      atualizarMergulhadores(mergulhadores, dt);

      const caixaSub = caixaSubmarino(sub);
      for (let i = mergulhadores.length - 1; i >= 0; i--) {
        const m = mergulhadores[i];
        if (m.tempoToque > 0) continue;
        if (intersecta(caixaMergulhador(m), caixaSub)) {
          if (sub.aBordo < MAX_MERGULHADORES) {
            sub.aBordo += 1;
            m.tempoToque = 0.5;
            ctx.audio.tocar('mergulhador');
            particulas.push(criarBolha(m.x + 8, m.y + 8, 3));
            mergulhadores.splice(i, 1);
          } else {
            m.tempoToque = 0.4;
          }
        }
      }
    }

    function atualizarNavioPatrulha(dt: number): void {
      if (!patrulha) {
        const deveAparecer =
          tempoNaSuperficie > 6 || tempoFase >= config.tempoAtePatrulha;
        if (deveAparecer) {
          patrulha = criarPatrulha(Math.random() > 0.5 ? 1 : -1);
          ctx.audio.tocar('patrulha');
        }
        return;
      }

      const novas = atualizarPatrulha(patrulha, dt);
      bombas.push(...novas);
      atualizarBombas(bombas, dt);

      if (patrulha.x > LARGURA + 80 || patrulha.x + patrulha.largura < -80) {
        patrulha = null;
        tempoNaSuperficie = 0;
        return;
      }

      // O torpedo do submarino destrói a patrulha (vários acertos)
      if (sub.torpedo && intersecta(caixaPatrulha(patrulha), {
        x: sub.torpedo.x,
        y: sub.torpedo.y,
        largura: 16,
        altura: 16,
      })) {
        sub.torpedo = null;
        patrulha.vida -= 1;
        adicionarPontos(PONTOS_PATRULHA);
        ctx.audio.tocar('explosao');
        particulas.push(
          ...criarExplosao(patrulha.x + patrulha.largura / 2, patrulha.y + 16, 40)
        );
        if (patrulha.vida <= 0) {
          particulas.push(
            ...criarExplosao(patrulha.x + patrulha.largura / 2, patrulha.y + 16, 64)
          );
          patrulha = null;
          tempoNaSuperficie = 0;
        }
      }

      const caixaSub = caixaSubmarino(sub);
      for (let i = bombas.length - 1; i >= 0; i--) {
        if (intersecta(caixaBomba(bombas[i]), caixaSub)) {
          bombas.splice(i, 1);
          perderVida();
          return;
        }
      }
    }

    function atualizarSuperficie(dt: number): void {
      const naSuperficie = sub.y < AGUA_Y;

      if (naSuperficie) {
        tempoNaSuperficie += dt;
        if (!naSuperficieAnterior) {
          ctx.audio.tocar('superficie');
          particulas.push(criarRespingo(sub.x + sub.largura / 2, AGUA_Y));
        }
      } else {
        tempoNaSuperficie = 0;
      }
      naSuperficieAnterior = naSuperficie;

      if (!naSuperficie) return;

      if (sub.aBordo >= 1) {
        entregarNaufragos();
      } else if (sub.mergulhou) {
        // O submarino não pode subir sem trazer ninguém
        perderVida();
      }
    }

    return {
      iniciar() {
        if (destruido) return;
        estado = 'titulo';
        tempoGlobal = 0;
        musica.atualizar(0, false, false);
      },

      reiniciar() {
        if (destruido) return;
        iniciarPartida();
      },

      pausar() {
        /* a trilha para junto com o laço do motor */
      },

      retomar() {
        /* idem */
      },

      atualizar(dt: number, input: InputState) {
        if (destruido) return;
        tempoGlobal += dt;

        if (estado === 'titulo') {
          if (input.acaoPressionada || input.acao2Pressionada) {
            iniciarPartida();
          }
          return;
        }

        if (estado === 'gameover') {
          if (input.acaoPressionada) {
            iniciarPartida();
          }
          return;
        }

        if (estado === 'morrendo') {
          tempoEstado += dt;
          sub.tempoEstado += dt;
          if (tempoEstado > 1) {
            estado = 'jogando';
            sub.estado = 'parado';
          }
          atualizarParticulas(particulas, dt);
          musica.atualizar(dt, false, false);
          return;
        }

        tempoFase += dt;

        // Oxigênio
        const alarme = atualizarOxigenio(oxigenio, config.consumoOxigenio, dt);
        if (alarme) ctx.audio.tocar('alarme');
        if (semOxigenio(oxigenio)) {
          perderVida();
          return;
        }

        // Movimento e torpedo
        atualizarSubmarino(sub, input, dt);
        if (input.acaoPressionada) {
          if (dispararTorpedo(sub)) {
            ctx.audio.tocar('torpedo');
          }
        }
        atualizarTorpedo(sub, dt);

        // Zumbido do motor (muda com a velocidade)
        tempoMotor -= dt;
        if (tempoMotor <= 0) {
          tempoMotor = 0.22;
          const vel = Math.hypot(sub.vx, sub.vy);
          ctx.audio.tocarTom(52 + vel * 0.35, 'sawtooth', 0.18, 0.035);
        }

        // Bolhas do motor
        tempoBolhas -= dt;
        if (tempoBolhas <= 0) {
          tempoBolhas = 0.5 + Math.random() * 0.6;
          particulas.push(
            criarBolha(
              sub.direcao > 0 ? sub.x - 2 : sub.x + sub.largura + 2,
              sub.y + sub.altura / 2,
              3
            )
          );
        }

        atualizarInimigos(dt);
        if (estado !== 'jogando') return;
        atualizarNaufragos(dt);
        atualizarNavioPatrulha(dt);
        if (estado !== 'jogando') return;
        atualizarSuperficie(dt);
        if (estado !== 'jogando') return;

        atualizarParticulas(particulas, dt);
        musica.atualizar(dt, true, oxigenio.valor <= 25);
      },

      desenhar(g: CanvasRenderingContext2D) {
        if (destruido) return;
        g.imageSmoothingEnabled = false;

        // Cenário estático + dinâmico
        desenharCenario(g, tempoGlobal);

        // Bolhas decorativas da água
        g.save();
        g.globalAlpha = 0.25;
        g.fillStyle = '#E0F2FE';
        for (let i = 0; i < 14; i++) {
          const x = ((i * 73 + tempoGlobal * (8 + (i % 3) * 6)) % (LARGURA + 16)) - 8;
          const y = FUNDO_Y - (((i * 37 + tempoGlobal * (14 + (i % 4) * 8)) % (FUNDO_Y - AGUA_Y)) + 0);
          g.fillRect(Math.round(x), Math.round(y), 2, 2);
        }
        g.restore();

        // Náufragos
        for (const m of mergulhadores) {
          desenharMergulhador(g, m, tempoGlobal);
        }

        // Inimigos
        for (const inimigo of inimigos) {
          switch (inimigo.tipo) {
            case 'tubarao':
              desenharTubarao(g, inimigo);
              break;
            case 'piranha':
              desenharPiranha(g, inimigo);
              break;
            case 'pirata':
              desenharPirata(g, inimigo);
              break;
            default:
              desenharAguaViva(g, inimigo);
              break;
          }
        }

        // Torpedos inimigos
        for (const t of torpedosPirata) {
          desenharTorpedoPirata(g, t);
        }

        // Partículas
        desenharParticulas(g, particulas);

        // Navio de apoio e ponto de retorno
        desenharNavioApoio(g, tempoGlobal);
        desenharPontoRetorno(g, tempoGlobal);

        // Patrulha e bombas
        if (patrulha) desenharPatrulha(g, patrulha, tempoGlobal);
        for (const b of bombas) desenharBomba(g, b, tempoGlobal);

        // Submarino e torpedo
        desenharSubmarino(g, sub, tempoGlobal);
        desenharTorpedo(g, sub);

        // HUD do motor + HUD do jogo
        ctx.hud.desenharHUD(g, LARGURA, ALTURA);
        desenharHudAbissal(g, {
          oxigenio: oxigenio.valor,
          aBordo: sub.aBordo,
          tempo: tempoGlobal,
        });

        if (estado === 'gameover') {
          ctx.hud.desenharGameOver(g, LARGURA, ALTURA, 'PRESSIONE AÇÃO / TOQUE');
        }
      },

      destruir() {
        destruido = true;
        musica.desligar();
        particulas = [];
        inimigos = [];
        mergulhadores = [];
        torpedosPirata = [];
        bombas = [];
        patrulha = null;
      },
    };
  },
};
