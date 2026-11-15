/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SALVE A HANNAH — Reescrita completa
 *
 * Fluxo clássico de fliperama de plataforma: abertura com rapto, 4 telas
 * com perigos próprios (vigas e barris / esteiras e caixas de cimento /
 * elevadores e molas / travas e bolas de fogo), cenas de rapto entre as
 * telas, final de ciclo com desabamento e novos ciclos mais difíceis.
 *
 * Parâmetros de depuração: ?tela=1..4 e ?ciclo=N.
 */

import { EngineContext, GameInstance, GameModule, InputState } from '../../engine/types';
import {
  CHANCE_ESCADA_INTEIRA,
  CHANCE_ESCADA_QUEBRADA,
  COYOTE_MS,
  BUFFER_PULO_MS,
  dificuldadeDoCiclo,
  GRAVIDADE,
  MARTELO_DURACAO,
  PULO_VELOCIDADE,
  PONTOS_ITEM_BONUS,
  PONTOS_INTERROMPER,
  PONTOS_PULO_1,
  PONTOS_PULO_2,
  PONTOS_PULO_3,
  PONTOS_VIDA_EXTRA_1,
  TOLERANCIA_ESCADA,
  VELOCIDADE_ESCADA,
  VELOCIDADE_JOGADOR,
  ALTURA_QUEDA_MORTE,
} from './config';
import {
  construirTela,
  encontrarVigiaAtravessada,
  validarTela,
} from './estrutura';
import { MotorDeCenas } from './cenas';
import { lerControles } from '../../shared/controles';
import {
  desenharBolaFogo,
  desenharBolsa,
  desenharBarril,
  desenharCaixaMassa,
  desenharChapeu,
  desenharGuardaChuva,
  desenharGrotao,
  desenharHannah,
  desenharMartelo,
  desenharMola,
  desenharTrava,
  desenharZeca,
} from './personagens';
import {
  EstruturaTela,
  Segmento,
  TipoItemBonus,
} from './tipos';
import { TELAS } from './telas';

const LARGURA = 480;
const ALTURA = 560;

interface Jogador {
  x: number;
  y: number;
  vx: number;
  vy: number;
  largura: number;
  altura: number;
  onGround: boolean;
  onLadder: boolean;
  ladderId: number | null;
  facing: 1 | -1;
  walkFrame: number;
  walkTimer: number;
  marteloTimer: number;
  invencivelTimer: number;
  coyoteTimer: number;
  bufferPulo: number;
  morrendo: boolean;
  morteTimer: number;
  quedaOrigem: number;
}

interface Barril {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  azul: boolean;
  descendoEscada: boolean;
  escadaId: number | null;
  rotacao: number;
  pulado: boolean;
}

interface BolaFogo {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  onLadder: boolean;
  ladderId: number | null;
  mudarTimer: number;
  subir: boolean;
}

interface CaixaMassa {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotacao: number;
}

interface Mola {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  quiques: number;
  rotacao: number;
}

interface Elevador {
  id: number;
  x: number;
  y: number;
  yTop: number;
  yBottom: number;
  velocidade: number;
  sentido: 1 | -1;
}

interface Trava {
  id: number;
  x: number;
  y: number;
  removida: boolean;
  animacao: number;
}

interface ItemBonus {
  id: string;
  tipo: TipoItemBonus;
  x: number;
  y: number;
  coletado: boolean;
}

interface MarteloItem {
  id: string;
  x: number;
  y: number;
  coletado: boolean;
}

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cor: string;
  tamanho: number;
  vida: number;
}

const NOMES_TELA = ['TÍTULO', 'TELA 1', 'TELA 2', 'TELA 3', 'TELA 4'];
const PREFIXO_RECORDE = 'hannah_ciclo_';

export const hannahGameModule: GameModule = {
  id: 'hannah',
  titulo: 'Salve a Hannah',
  descricao: 'Suba as vigas da obra e resgate Hannah do Grotão em 4 telas.',
  genero: 'Aventura de Resgate',
  corTema: '#14B8A6',
  largura: LARGURA,
  altura: ALTURA,
  instrucoes: {
    historia:
      'O Grotão, um gorila gigante da construção, sequestrou a arquiteta Hannah e a levou para o topo de uma inacabada estrutura de aço. Zeca, um pedreiro de capacete amarelo, precisa subir de tela em tela, desviar de barris, bolas de fogo, caixas de massa, molas e travas, e salvar Hannah antes que o Grotão fuja com ela.',
    controles: [
      'Setas Esquerda/Direita: andar',
      'Setas Cima/Baixo ou W/S: subir e descer escadas',
      'Espaço / Z / Botão A: pular',
      'P: pausar · R: reiniciar',
    ],
    pontos: [
      { acao: 'Pular um barril, caixa ou mola', pontos: PONTOS_PULO_1 },
      { acao: 'Pular 2 seguidos', pontos: PONTOS_PULO_2 },
      { acao: 'Pular 3 seguidos', pontos: PONTOS_PULO_3 },
      { acao: 'Quebrar com o martelo', pontos: 300 },
      { acao: 'Retirar uma trava', pontos: PONTOS_INTERROMPER },
      { acao: 'Item de bônus (chapéu 300, bolsa 500, guarda-chuva 800)', pontos: 300 },
    ],
  },

  criar(ctx: EngineContext): GameInstance {
    // ===== Parâmetros de depuração =====
    let telaInicial = 0; // 0 = fluxo normal (abertura → tela 1)
    let cicloInicial = 1;
    try {
      const params = new URLSearchParams(window.location.search);
      const t = parseInt(params.get('tela') ?? '0', 10);
      if (t >= 1 && t <= 4) telaInicial = t;
      const c = parseInt(params.get('ciclo') ?? '1', 10);
      if (Number.isFinite(c) && c >= 1) cicloInicial = c;
    } catch {
      // ambiente sem window (testes)
    }

    // ===== Estado do jogo =====
    type Estado =
      | 'TITLE'
      | 'CENA'
      | 'JOGANDO'
      | 'TELA_CONCLUIDA'
      | 'GAMEOVER';

    let estado: Estado = 'TITLE';
    let telaIndice = telaInicial > 0 ? telaInicial - 1 : 0;
    let ciclo = cicloInicial;
    let estrutura: EstruturaTela = construirTela(TELAS[telaIndice]);
    let problemas = validarTela(estrutura);
    if (problemas.length > 0) {
      console.warn('[hannah] Validação da tela falhou:', problemas);
    }

    let vidas = 3;
    let bonus = estrutura.def.bonusInicial;
    let bonusContador = 0;
    let vidasExtraGanho = false;
    let totalBarrisPulados = 0;
    let totalBarrisQuebrados = 0;
    let telasSemPerderVida = 0;
    let perdeuVidaNaTela = false;
    let tempoTotalJogo = 0;

    const desafio = () => dificuldadeDoCiclo(ciclo);

    // ===== Entidades =====
    let jogador: Jogador = criarJogador();
    let grotao = {
      x: estrutura.def.grotao.x,
      y: estrutura.def.grotao.y,
      frame: 0,
      timerQuebra: 0,
      timerMola: 0,
    };
    let hannah = { x: estrutura.def.hannah.x, y: estrutura.def.hannah.y };
    let barris: Barril[] = [];
    let bolasFogo: BolaFogo[] = [];
    let caixas: CaixaMassa[] = [];
    let molas: Mola[] = [];
    let elevadores: Elevador[] = [];
    let travas: Trava[] = [];
    let martelos: MarteloItem[] = [];
    let itensBonus: ItemBonus[] = [];
    let particulas: Particula[] = [];
    let barrilTimer = 2;
    let caixaTimer = 3;
    let proximaTravaAnim = 0;
    let bonusTickTimer = 0;
    let avisoBonus10s = false;
    let tremor = 0;
    let pulosSeguidos = 0;
    let pulosSeguidosTimer = 0;
    let cena: MotorDeCenas | null = null;
    let cenaApos: (() => void) | null = null;

    function criarJogador(): Jogador {
      return {
        x: estrutura.def.jogadorSpawn.x,
        y: estrutura.def.jogadorSpawn.y,
        vx: 0,
        vy: 0,
        largura: 16,
        altura: 24,
        onGround: true,
        onLadder: false,
        ladderId: null,
        facing: 1,
        walkFrame: 0,
        walkTimer: 0,
        marteloTimer: 0,
        invencivelTimer: 0,
        coyoteTimer: 0,
        bufferPulo: 0,
        morrendo: false,
        morteTimer: 0,
        quedaOrigem: estrutura.def.jogadorSpawn.y,
      };
    }

    // ===== Carga de tela =====
    function carregarTela(indice: number, manterVidas = true) {
      telaIndice = indice;
      estrutura = construirTela(TELAS[indice]);
      problemas = validarTela(estrutura);
      if (problemas.length > 0) {
        console.warn('[hannah] Validação da tela falhou:', problemas);
      }

      if (!manterVidas) vidas = 3;

      bonus = estrutura.def.bonusInicial;
      bonusContador = 0;
      avisoBonus10s = false;
      perdeuVidaNaTela = false;
      pulosSeguidos = 0;

      jogador = criarJogador();

      grotao = {
        x: estrutura.def.grotao.x,
        y: estrutura.def.grotao.y,
        frame: 0,
        timerQuebra: 0,
        timerMola: 0,
      };
      hannah = { x: estrutura.def.hannah.x, y: estrutura.def.hannah.y };

      barris = [];
      bolasFogo = [];
      caixas = [];
      molas = [];
      particulas = [];
      barrilTimer = desafio().barrilIntervalo;
      caixaTimer = 3;
      bonusTickTimer = 0;

      // Martelos da tela
      martelos = (estrutura.def.martelos ?? []).map((m, i) => ({
        id: `m${i}`,
        x: m.x,
        y: m.y,
        coletado: false,
      }));

      // Itens de bônus
      itensBonus = estrutura.def.itensBonus.map((i, idx) => ({
        id: `b${idx}`,
        tipo: i.tipo,
        x: i.x,
        y: i.y,
        coletado: false,
      }));

      // Elevadores (Tela 3)
      elevadores = (estrutura.def.elevadores ?? []).map((e, i) => ({
        id: i,
        x: e.x,
        y: e.yBottom,
        yTop: e.yTop,
        yBottom: e.yBottom,
        velocidade: e.velocidade,
        sentido: 1 as const,
      }));

      // Travas (Tela 4)
      travas = (estrutura.def.travas ?? []).map((t, i) => ({
        id: i,
        x: t.x,
        y: t.y,
        removida: false,
        animacao: 0,
      }));

      // Bolas de fogo (quantidade conforme dificuldade e tela)
      const qtdBolas = telaIndice === 3
        ? Math.min(5, 2 + ciclo)
        : telaIndice === 0
          ? desafio().bolasFogo
          : telaIndice === 1
            ? 1
            : 1; // Tela 3: uma bola de fogo no topo

      for (let i = 0; i < qtdBolas; i++) {
        const g = estrutura.girders[
          telaIndice === 3 ? 1 + (i % 3) : telaIndice === 0 ? 2 : telaIndice === 2 ? 0 : 1
        ];
        bolasFogo.push({
          id: i + 1,
          x: 100 + i * 140,
          y: g.yEm(100 + i * 140) - 8,
          vx: i % 2 === 0 ? -desafio().velocidadeBolaFogo : desafio().velocidadeBolaFogo,
          vy: 0,
          onLadder: false,
          ladderId: null,
          mudarTimer: 2 + Math.random() * 2,
          subir: false,
        });
      }
    }

    function irParaTela(indice: number) {
      carregarTela(indice, true);
      estado = 'JOGANDO';
    }

    // ===== Fluxo principal =====
    function iniciarCena(tipo: 'abertura' | 'rapto' | 'final', aoTerminar: () => void) {
      const instancia = new MotorDeCenas();
      instancia.iniciar({
        tipo,
        alturaMetros: estrutura.def.alturaMetros,
        ciclo,
      });
      cena = instancia;
      cenaApos = aoTerminar;
      estado = 'CENA';
    }

    function iniciarPartida() {
      telaIndice = telaInicial > 0 ? telaInicial - 1 : 0;
      ciclo = cicloInicial;
      vidas = 3;
      vidasExtraGanho = false;
      totalBarrisPulados = 0;
      totalBarrisQuebrados = 0;
      telasSemPerderVida = 0;
      tempoTotalJogo = 0;
      perdeuVidaNaTela = false;

      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: ctx.storage.lerRecorde(ctx.id),
        vidas: 3,
        fase: telaIndice + 1,
        bonus,
      });

      if (telaInicial > 0) {
        carregarTela(telaIndice, false);
        estado = 'JOGANDO';
        return;
      }

      iniciarCena('abertura', () => {
        irParaTela(0);
      });
    }

    // ===== Atualização por estado =====
    function atualizarJogando(dt: number, input: InputState) {
      const dtSeguro = Math.min(dt, 0.05);
      tempoTotalJogo += dtSeguro;
      tremor = Math.max(0, tremor - dtSeguro * 3);
      pulosSeguidosTimer = Math.max(0, pulosSeguidosTimer - dtSeguro);
      if (pulosSeguidosTimer <= 0) pulosSeguidos = 0;

      jogador.invencivelTimer = Math.max(0, jogador.invencivelTimer - dtSeguro);
      jogador.marteloTimer = Math.max(0, jogador.marteloTimer - dtSeguro);

      if (jogador.morrendo) {
        jogador.morteTimer -= dtSeguro;
        if (jogador.morteTimer <= 0) {
          if (vidas <= 0) {
            estado = 'GAMEOVER';
            ctx.finalizarJogo('gameOver');
          } else {
            jogador = criarJogador();
            jogador.invencivelTimer = 2;
            bonus = estrutura.def.bonusInicial;
            bonusContador = 0;
            avisoBonus10s = false;
          }
        }
        atualizarParticulas(dtSeguro);
        return;
      }

      // Contador de bônus
      bonusContador += dtSeguro;
      if (bonusContador >= desafio().bonusTickSeg) {
        bonusContador = 0;
        bonus = Math.max(0, bonus - 100);
        if (bonus === 0) {
          perderVida();
          return;
        }
        if (bonus <= 1000 && !avisoBonus10s) {
          avisoBonus10s = true;
          ctx.audio.tocar('alerta');
        } else if (bonus <= 1000) {
          ctx.audio.tocar('alerta');
        }
      }

      moverJogador(dtSeguro, input);
      atualizarBarris(dtSeguro);
      atualizarBolasFogo(dtSeguro);
      atualizarCaixas(dtSeguro);
      atualizarMolas(dtSeguro);
      atualizarElevadores(dtSeguro);
      atualizarTravas(dtSeguro);
      atualizarItens(dtSeguro);
      atualizarParticulas(dtSeguro);
      atualizarEsteiraTopo(dtSeguro);

      grotao.frame += dtSeguro * 60;
      if (telaIndice === 2) {
        grotao.timerMola -= dtSeguro;
        if (grotao.timerMola <= 0) {
          grotao.timerMola = desafio().molaIntervalo;
          lancarMola();
        }
      }

      // Vitória na tela: tocar na Hannah
      if (Math.abs(jogador.x - hannah.x) < 22 && Math.abs(jogador.y - hannah.y) < 30) {
        concluirTela();
        return;
      }
    }

    // ===== Jogador =====
    function moverJogador(dt: number, input: InputState) {
      const j = jogador;
      const comMartelo = j.marteloTimer > 0;

      j.coyoteTimer = Math.max(0, j.coyoteTimer - dt);
      j.bufferPulo = Math.max(0, j.bufferPulo - dt);
      const pesAntes = j.y + j.altura;

      // Prioridade vertical dentro de uma escada
      if (j.onLadder) {
        if (input.cima) {
          j.y -= VELOCIDADE_ESCADA * dt;
          j.walkTimer += dt;
        } else if (input.baixo) {
          j.y += VELOCIDADE_ESCADA * dt;
          j.walkTimer += dt;
        }
        if (j.walkTimer > 0.12) {
          j.walkTimer = 0;
          j.walkFrame++;
        }
        // Sair da escada no topo/base
        const escada = estrutura.escadas.find((e) => e.x === j.x);
        if (escada) {
          if (j.y <= escada.yTop + 2 || j.y >= escada.yBottom - 2) {
            j.onLadder = false;
            j.ladderId = null;
          }
        } else {
          j.onLadder = false;
          j.ladderId = null;
        }
      } else {
        // Andar — teclado/D-pad ou arrasto horizontal
        const sensH = lerControles().sensibilidade;
        const deltaArrasto =
          input.arrastando && Math.abs(input.arrasteDX) >= Math.abs(input.arrasteDY)
            ? input.arrasteDX * sensH
            : 0;
        let move = 0;
        if (input.esquerda) move -= 1;
        if (input.direita) move += 1;

        if (deltaArrasto !== 0) {
          const delta = Math.max(
            -VELOCIDADE_JOGADOR * dt * 2,
            Math.min(VELOCIDADE_JOGADOR * dt * 2, deltaArrasto)
          );
          j.x += delta;
          j.vx = 0;
          j.facing = delta >= 0 ? 1 : -1;
          j.walkTimer += dt;
          if (j.walkTimer > 0.12) {
            j.walkTimer = 0;
            j.walkFrame++;
          }
        } else {
          j.vx = move * VELOCIDADE_JOGADOR;
          j.x += j.vx * dt;
          j.facing = move !== 0 ? (move > 0 ? 1 : -1) : j.facing;
          if (move !== 0) {
            j.walkTimer += dt;
            if (j.walkTimer > 0.12) {
              j.walkTimer = 0;
              j.walkFrame++;
            }
          }
        }

        // Esteira empurra o jogador
        const vigia = encontrarSegmentoDe(j.x, j.y);
        if (vigia?.esteira) {
          j.x += (vigia.sentidoEsteira ?? 1) * 60 * dt;
        }

        // Pular (com buffer + coyote)
        if (input.acaoPressionada) j.bufferPulo = BUFFER_PULO_MS / 1000;
        if (j.bufferPulo > 0 && (j.onGround || j.coyoteTimer > 0) && !comMartelo) {
          j.vy = -PULO_VELOCIDADE;
          j.onGround = false;
          j.coyoteTimer = 0;
          j.bufferPulo = 0;
          ctx.audio.tocar('pulo');
        }

        // Gravidade
        j.vy += GRAVIDADE * dt;
        j.y += j.vy * dt;

        // Agarrar escada (tolerância de 10 px)
        if (!j.onLadder) {
          const pes = j.y + j.altura;
          const escada = estrutura.escadas.find(
            (e) => !e.quebrada && Math.abs(j.x - e.x) <= TOLERANCIA_ESCADA && pes >= e.yTop - 2 && j.y <= e.yBottom + 4
          );
          if (escada && (input.cima || input.baixo) && !comMartelo) {
            j.onLadder = true;
            j.x = escada.x;
            j.ladderId = estrutura.escadas.indexOf(escada);
            j.vy = 0;
          }
        }
      }

      // Colisão com as vigas (pouso por varredura — nunca atravessa)
      if (!j.onLadder) {
        const pouso = encontrarVigiaAtravessada(estrutura.girders, pesAntes, j.y + j.altura, j.x);
        if (pouso) {
          const superficie = pouso.surfaceY;
          // Morte por queda se caiu de altura maior que um andar
          if (j.quedaOrigem > 0 && j.y + j.altura - j.quedaOrigem > ALTURA_QUEDA_MORTE && j.vy > 300) {
            perderVida();
            return;
          }
          j.y = superficie - j.altura;
          j.vy = 0;
          j.onGround = true;
          j.coyoteTimer = COYOTE_MS / 1000;
          j.quedaOrigem = j.y + j.altura;
        } else {
          if (j.onGround) j.coyoteTimer = COYOTE_MS / 1000;
          j.onGround = false;
        }
      }

      // Limites laterais
      j.x = Math.max(8, Math.min(LARGURA - 8 - j.largura, j.x));

      // Cair no vazio
      if (j.y > ALTURA + 30) perderVida();
    }

    function encontrarSegmentoDe(x: number, y: number): Segmento | null {
      for (const vigia of estrutura.girders) {
        if (x >= vigia.x - 6 && x <= vigia.x2 + 6) {
          const sup = vigia.yEm(x);
          if (Math.abs(y - sup) < 10) return vigia;
        }
      }
      return null;
    }

    function perderVida() {
      if (jogador.invencivelTimer > 0) return;
      vidas = ctx.hud.perderVida();
      perdeuVidaNaTela = true;
      jogador.morrendo = true;
      jogador.morteTimer = 1.6;
      ctx.audio.tocar('vidaPerdida');
      tremor = 1;
      ctx.hud.definirEstado({ vidas });
    }

    function concluirTela() {
      // Bônus restante + pontos da tela
      ctx.hud.adicionarPontos(bonus, larguraCentro(), 140, '#4ADE80');
      ctx.hud.adicionarPontos(telaIndice === 3 ? 2000 : 1000, larguraCentro(), 170, '#FACC15');
      if (!perdeuVidaNaTela) {
        telasSemPerderVida++;
        ctx.hud.adicionarPontos(2000, larguraCentro(), 200, '#F472B6');
      }
      ctx.audio.tocar('vitoria');

      if (telaIndice === 3) {
        // Final do ciclo
        iniciarCena('final', () => {
          ciclo += 1;
          carregarTela(0, false);
          estado = 'JOGANDO';
          ctx.hud.definirEstado({ bonus });
        });
        return;
      }

      // Cena de rapto para a próxima tela
      iniciarCena('rapto', () => {
        irParaTela(telaIndice + 1);
      });
    }

    function larguraCentro() {
      return LARGURA / 2;
    }

    // ===== Barris (Tela 1) =====
    function atualizarBarris(dt: number) {
      barrilTimer -= dt;
      if (barrilTimer <= 0 && telaIndice === 0) {
        barrilTimer = desafio().barrilIntervalo * (0.7 + Math.random() * 0.6);
        const azul = Math.random() < 0.22;
        const spawnG = estrutura.girders[0];
        barris.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          x: estrutura.def.barrilSpawn.x,
          y: estrutura.def.barrilSpawn.y,
          vx: spawnG.direcao * desafio().barrilVelocidade,
          vy: 0,
          radius: 8,
          azul,
          descendoEscada: false,
          escadaId: null,
          rotacao: 0,
          pulado: false,
        });
        ctx.audio.tocar('barril');
      }

      const ativos: Barril[] = [];
      for (const b of barris) {
        b.rotacao += (b.vx / b.radius) * dt;

        if (b.descendoEscada && b.escadaId !== null) {
          const escada = estrutura.escadas[b.escadaId];
          b.y += 85 * dt;
          b.x = escada.x;
          // Pousou na viga de baixo
          const vigia = encontrarSegmentoDe(b.x, b.y + b.radius);
          if (vigia && b.y + b.radius >= vigia.yEm(b.x)) {
            b.y = vigia.yEm(b.x) - b.radius;
            b.descendoEscada = false;
            b.escadaId = null;
            b.vx = vigia.direcao * desafio().barrilVelocidade;
            b.vy = 0;
            ctx.audio.tocar('barril');
            for (let i = 0; i < 5; i++) {
              particulas.push({
                x: b.x, y: b.y + b.radius,
                vx: (Math.random() - 0.5) * 80, vy: -Math.random() * 60,
                cor: '#A8A29E', tamanho: 2, vida: 0.5,
              });
            }
          }
          ativos.push(b);
          continue;
        }

        // Gravidade / pouso em vigas (por varredura — nunca atravessa)
        const prevBottom = b.y + b.radius;
        b.vy += GRAVIDADE * dt;
        b.y += b.vy * dt;
        const atravessada = encontrarVigiaAtravessada(estrutura.girders, prevBottom, b.y + b.radius, b.x);
        const vigia = atravessada?.vigia ?? encontrarSegmentoDe(b.x, b.y + b.radius);
        if (vigia) {
          const superficie = vigia.yEm(b.x);
          if (b.y + b.radius >= superficie - 2) {
            // Chance de descer pela escada (topo da escada encosta nesta viga)
            let desceu = false;
            for (const escada of estrutura.escadas) {
              if (Math.abs(b.x - escada.x) < 8 && Math.abs(b.y + b.radius - escada.yTop) < 10) {
                const chance = escada.quebrada ? CHANCE_ESCADA_QUEBRADA : CHANCE_ESCADA_INTEIRA;
                if (Math.random() < chance) {
                  b.descendoEscada = true;
                  b.escadaId = estrutura.escadas.indexOf(escada);
                  b.x = escada.x;
                  b.vx = 0;
                  b.vy = 0;
                  desceu = true;
                  if (escada.quebrada) {
                    ctx.audio.tocar('batida');
                    tremor = Math.max(tremor, 0.35);
                  }
                  break;
                }
              }
            }
            if (!desceu) {
              b.y = superficie - b.radius;
              b.vy = 0;
              b.vx = vigia.direcao * desafio().barrilVelocidade;
            }
          }
        }

        if (!vigia) {
          // No ar: corta o embalo horizontal para o barril cair quase
          // vertical sobre a viga de baixo (sem "escapar" pelas laterais)
          b.vx *= 0.12;
        }
        // Esteira empurra o barril
        if (vigia?.esteira) {
          b.x += (vigia.sentidoEsteira ?? 1) * 45 * dt;
        }
        b.x += b.vx * dt;

        // Barril azul que chega ao barril de óleo → bola de fogo
        const oleo = estrutura.def.barrilOleo;
        if (oleo && b.azul && b.y > ALTURA - 80 && Math.abs(b.x - oleo.x) < 30) {
          ctx.audio.tocar('alerta');
          bolasFogo.push({
            id: Date.now() + 7,
            x: oleo.x,
            y: oleo.y - 10,
            vx: desafio().velocidadeBolaFogo * (Math.random() < 0.5 ? 1 : -1),
            vy: 0,
            onLadder: false,
            ladderId: null,
            mudarTimer: 2,
            subir: false,
          });
          continue; // barril some (vira fogo)
        }

        // Barril saiu por baixo → some com respingo
        if (b.y > ALTURA + 20) {
          ctx.audio.tocar('propulsor');
          continue;
        }

        // Martelo destrói barril
        if (jogador.marteloTimer > 0 &&
            Math.abs(b.x - jogador.x) < 18 &&
            Math.abs(b.y - (jogador.y + 12)) < 22) {
          totalBarrisQuebrados++;
          const pontos = 300 + Math.floor(Math.random() * 3) * 150;
          ctx.hud.adicionarPontos(pontos, b.x, b.y - 10, '#FBBF24');
          ctx.audio.tocar('marreta');
          contextoParticulas(b.x, b.y, '#B45309');
          continue;
        }

        // Jogador pula sobre barril
        if (!jogador.onGround && !b.pulado &&
            Math.abs(b.x - jogador.x) < 18 &&
            jogador.y + jogador.altura < b.y) {
          b.pulado = true;
          pulosSeguidos++;
          pulosSeguidosTimer = 1.5;
          const bonus = pulosSeguidos >= 3 ? PONTOS_PULO_3 : pulosSeguidos === 2 ? PONTOS_PULO_2 : PONTOS_PULO_1;
          ctx.hud.adicionarPontos(bonus, b.x, b.y - 10, '#FDE68A');
          totalBarrisPulados++;
        }

        // Colisão fatal
        if (jogador.invencivelTimer <= 0 &&
            Math.hypot(b.x - jogador.x, b.y - (jogador.y + 12)) < b.radius + 7) {
          perderVida();
          return;
        }

        ativos.push(b);
      }
      barris = ativos;
    }

    // ===== Bolas de fogo =====
    function atualizarBolasFogo(dt: number) {
      const agressivas = telaIndice === 3;
      for (const fb of bolasFogo) {
        fb.mudarTimer -= dt;

        // Subir/descer escadas
        if (fb.onLadder && fb.ladderId !== null) {
          const escada = estrutura.escadas[fb.ladderId];
          fb.y += (fb.subir ? -1 : 1) * desafio().velocidadeBolaFogo * 0.8 * dt;
          fb.x = escada.x;
          if (fb.y <= escada.yTop || fb.y >= escada.yBottom) fb.onLadder = false;
          continue;
        }

        // Anda na viga; quica nas bordas
        const vigia = encontrarSegmentoDe(fb.x, fb.y + 8);
        if (vigia) {
          fb.y = vigia.yEm(fb.x) - 8;
          fb.x += fb.vx * dt;
          if (fb.x < vigia.x + 4 || fb.x > vigia.x2 - 4) {
            fb.vx *= -1;
            fb.x = Math.max(vigia.x + 4, Math.min(vigia.x2 - 4, fb.x));
          }
          // Decidir entrar numa escada
          if (fb.mudarTimer <= 0) {
            fb.mudarTimer = 2 + Math.random() * 2.5;
            const escada = estrutura.escadas.find(
              (e) => !e.quebrada && Math.abs(fb.x - e.x) < 12 && fb.y >= e.yTop && fb.y <= e.yBottom
            );
            if (escada) {
              fb.onLadder = true;
              fb.ladderId = estrutura.escadas.indexOf(escada);
              fb.subir = agressivas ? hannah.y < fb.y : Math.random() < 0.5;
              continue;
            }
            if (agressivas) {
              fb.vx = (jogador.x < fb.x ? -1 : 1) * desafio().velocidadeBolaFogo;
            } else if (Math.random() < 0.45) {
              fb.vx *= -1;
            }
          }
        } else {
          // Queda livre
          fb.vy += GRAVIDADE * dt;
          fb.y += fb.vy * dt;
          fb.x += fb.vx * dt;
          const pouso = encontrarSegmentoDe(fb.x, fb.y + 8);
          if (pouso) {
            fb.y = pouso.yEm(fb.x) - 8;
            fb.vy = 0;
          }
        }

        // Martelo destrói bola de fogo
        if (jogador.marteloTimer > 0 &&
            Math.abs(fb.x - jogador.x) < 18 &&
            Math.abs(fb.y - (jogador.y + 12)) < 20) {
          ctx.hud.adicionarPontos(500, fb.x, fb.y - 10, '#FDE68A');
          ctx.audio.tocar('marreta');
          contextoParticulas(fb.x, fb.y, '#F97316');
          fb.y = ALTURA + 100;
          continue;
        }

        // Colisão fatal
        if (jogador.invencivelTimer <= 0 &&
            Math.hypot(fb.x - jogador.x, fb.y - (jogador.y + 12)) < 12) {
          perderVida();
          return;
        }
      }
      bolasFogo = bolasFogo.filter((fb) => fb.y < ALTURA + 40);
    }

    // ===== Caixas de massa (Tela 2) =====
    function atualizarCaixas(dt: number) {
      if (telaIndice === 1) {
        caixaTimer -= dt;
        if (caixaTimer <= 0) {
          caixaTimer = 2.6;
          const ponto = estrutura.def.spawnCaixas![Math.floor(Math.random() * 2)];
          caixas.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            x: ponto.x,
            y: ponto.y,
            vx: ponto.sentido * 70,
            vy: 0,
            rotacao: 0,
          });
        }
      }

      const ativas: CaixaMassa[] = [];
      for (const c of caixas) {
        // Na viga da esteira central
        const vigia = encontrarSegmentoDe(c.x, c.y + 8);
        if (vigia) {
          c.y = vigia.yEm(c.x) - 8;
          c.vx = (vigia.sentidoEsteira ?? 1) * 70;
          c.x += c.vx * dt;
          c.rotacao += (c.vx / 40) * dt;
        } else {
          c.vy += GRAVIDADE * dt;
          c.y += c.vy * dt;
          c.x += c.vx * dt;
          const pouso = encontrarSegmentoDe(c.x, c.y + 8);
          if (pouso) {
            c.y = pouso.yEm(c.x) - 8;
            c.vy = 0;
          }
        }

        // Martelo destrói
        if (jogador.marteloTimer > 0 &&
            Math.abs(c.x - jogador.x) < 20 &&
            Math.abs(c.y - (jogador.y + 12)) < 20) {
          ctx.hud.adicionarPontos(300, c.x, c.y - 10, '#FDE68A');
          ctx.audio.tocar('marreta');
          contextoParticulas(c.x, c.y, '#A8A29E');
          continue;
        }

        if (!jogador.onGround && Math.abs(c.x - jogador.x) < 18 &&
            jogador.y + jogador.altura < c.y) {
          pulosSeguidos++;
          pulosSeguidosTimer = 1.5;
          const bonus = pulosSeguidos >= 3 ? PONTOS_PULO_3 : pulosSeguidos === 2 ? PONTOS_PULO_2 : PONTOS_PULO_1;
          ctx.hud.adicionarPontos(bonus, c.x, c.y - 10, '#FDE68A');
        }

        if (jogador.invencivelTimer <= 0 &&
            Math.abs(c.x - jogador.x) < 17 &&
            Math.abs(c.y - (jogador.y + 12)) < 14) {
          perderVida();
          return;
        }

        if (c.y > ALTURA + 30 || c.x < -60 || c.x > LARGURA + 60) continue;
        ativas.push(c);
      }
      caixas = ativas;
    }

    // ===== Molas (Tela 3) =====
    function lancarMola() {
      const dir = jogador.x < grotao.x ? -1 : 1;
      molas.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        x: grotao.x,
        y: grotao.y,
        vx: dir * desafio().molaVelocidade,
        vy: -160,
        quiques: 0,
        rotacao: 0,
      });
      ctx.audio.tocar('bumper');
    }

    function atualizarMolas(dt: number) {
      const ativas: Mola[] = [];
      for (const m of molas) {
        m.vy += GRAVIDADE * 0.75 * dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rotacao += dt * 6;

        const vigia = encontrarSegmentoDe(m.x, m.y + 8);
        if (vigia && m.vy > 0) {
          m.y = vigia.yEm(m.x) - 8;
          m.vy = -Math.abs(m.vy) * 0.72;
          m.quiques++;
          ctx.audio.tocar('bumper');
          for (let i = 0; i < 4; i++) {
            particulas.push({
              x: m.x, y: m.y + 8,
              vx: (Math.random() - 0.5) * 60, vy: -Math.random() * 40,
              cor: '#F87171', tamanho: 2, vida: 0.4,
            });
          }
        }

        if (jogador.marteloTimer > 0 &&
            Math.abs(m.x - jogador.x) < 18 &&
            Math.abs(m.y - (jogador.y + 12)) < 18) {
          ctx.hud.adicionarPontos(500, m.x, m.y - 10, '#FBBF24');
          ctx.audio.tocar('marreta');
          contextoParticulas(m.x, m.y, '#DC2626');
          continue;
        }

        if (!jogador.onGround && Math.abs(m.x - jogador.x) < 18 &&
            jogador.y + jogador.altura < m.y) {
          pulosSeguidos++;
          pulosSeguidosTimer = 1.5;
          ctx.hud.adicionarPontos(PONTOS_PULO_1, m.x, m.y - 10, '#FDE68A');
        }

        if (jogador.invencivelTimer <= 0 &&
            Math.abs(m.x - jogador.x) < 15 &&
            Math.abs(m.y - (jogador.y + 12)) < 14) {
          perderVida();
          return;
        }

        if (m.quiques > 2 || m.y > ALTURA + 20 || m.x < -50 || m.x > LARGURA + 50) continue;
        ativas.push(m);
      }
      molas = ativas;
    }

    // ===== Elevadores (Tela 3) =====
    function atualizarElevadores(dt: number) {
      for (const el of elevadores) {
        el.y += el.sentido * el.velocidade * dt;
        if (el.y <= el.yTop) {
          el.y = el.yTop;
          el.sentido = 1;
        } else if (el.y >= el.yBottom) {
          el.y = el.yBottom;
          el.sentido = -1;
        }
        // Carregar o jogador se estiver em cima
        if (Math.abs(jogador.x - el.x) < 26 && Math.abs(jogador.y + jogador.altura - el.y) < 8) {
          jogador.y = el.y - jogador.altura;
          jogador.vy = 0;
          jogador.onGround = true;
        }
      }
    }

    // ===== Travas (Tela 4) =====
    function atualizarTravas(_dt: number) {
      for (const trava of travas) {
        if (trava.removida) {
          trava.animacao = Math.min(1, trava.animacao + _dt * 2);
          continue;
        }
        if (Math.abs(jogador.x - trava.x) < 14 && Math.abs(jogador.y + jogador.altura - trava.y) < 16) {
          trava.removida = true;
          ctx.hud.adicionarPontos(PONTOS_INTERROMPER, trava.x, trava.y - 10, '#FCA5A5');
          ctx.audio.tocar('alvo');
          for (let i = 0; i < 6; i++) {
            particulas.push({
              x: trava.x, y: trava.y,
              vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 80,
              cor: '#EF4444', tamanho: 2, vida: 0.5,
            });
          }
          if (travas.every((t) => t.removida)) {
            tremor = 1;
            ctx.audio.tocar('explosaoNave');
          }
        }
      }
    }

    // ===== Martelos e itens =====
    function atualizarItens(_dt: number) {
      for (const h of martelos) {
        if (h.coletado) continue;
        if (Math.abs(jogador.x - h.x) < 15 && Math.abs(jogador.y + jogador.altura - h.y) < 16) {
          h.coletado = true;
          jogador.marteloTimer = MARTELO_DURACAO;
          ctx.audio.tocar('item');
          ctx.hud.adicionarPontos(300, h.x, h.y - 10, '#FBBF24');
        }
      }
      for (const item of itensBonus) {
        if (item.coletado) continue;
        if (Math.abs(jogador.x - item.x) < 15 && Math.abs(jogador.y + jogador.altura - item.y) < 16) {
          item.coletado = true;
          const pontos = PONTOS_ITEM_BONUS[item.tipo];
          ctx.hud.adicionarPontos(pontos, item.x, item.y - 10, '#FDE047');
          ctx.audio.tocar('moeda');
        }
      }
      // Vida extra em 7.000 pontos
      const pontuacao = ctx.hud.obterEstado().pontuacao;
      if (!vidasExtraGanho && pontuacao >= PONTOS_VIDA_EXTRA_1) {
        vidasExtraGanho = true;
        vidas = ctx.hud.ganharVida();
        ctx.audio.tocar('item');
      }
    }

    function contextoParticulas(x: number, y: number, cor: string) {
      for (let i = 0; i < 10; i++) {
        particulas.push({
          x, y,
          vx: (Math.random() - 0.5) * 140, vy: (Math.random() - 0.5) * 140 - 40,
          cor, tamanho: 2 + Math.random() * 2, vida: 0.6,
        });
      }
    }

    function atualizarParticulas(dt: number) {
      for (const p of particulas) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt;
        p.vida -= dt;
      }
      particulas = particulas.filter((p) => p.vida > 0);
    }

    // ===== Esteira do topo inverte aleatoriamente (Tela 2) =====
    let esteiraTopoTimer = 0;
    function atualizarEsteiraTopo(dt: number) {
      if (telaIndice !== 1) return;
      const topo = estrutura.girders[1];
      if (!topo?.esteira) return;

      const atual = topo.sentidoEsteira ?? 1;
      esteiraTopoTimer += dt;
      if (esteiraTopoTimer > 6) {
        esteiraTopoTimer = 0;
        topo.sentidoEsteira = atual === 1 ? -1 : 1;
        ctx.audio.tocar('propulsor');
      }
    }

    // ===== Renderização =====
    function desenhar(g: CanvasRenderingContext2D) {
      g.save();
      if (tremor > 0) {
        g.translate((Math.random() - 0.5) * 8 * tremor, (Math.random() - 0.5) * 8 * tremor);
      }

      // Fundo: cenário da construção
      const grad = g.createLinearGradient(0, 0, 0, ALTURA);
      grad.addColorStop(0, '#1C2A44');
      grad.addColorStop(0.6, '#3B4A6B');
      grad.addColorStop(1, '#54432F');
      g.fillStyle = grad;
      g.fillRect(0, 0, LARGURA, ALTURA);

      // Vigas
      for (const vigia of estrutura.girders) desenharVigia(g, vigia);

      // Esteiras da Tela 2 com setas animadas
      if (telaIndice === 1) {
        for (const vigia of estrutura.girders) {
          if (!vigia.esteira) continue;
          const dir = vigia.sentidoEsteira ?? 1;
          const t = (performance.now() / 300) % 24;
          g.fillStyle = 'rgba(250,204,21,0.75)';
          for (let x = vigia.x - 24 + t; x < vigia.x2; x += 24) {
            const y = vigia.yEm(Math.max(vigia.x, Math.min(vigia.x2, x))) - 8;
            g.beginPath();
            if (dir > 0) {
              g.moveTo(x, y - 3);
              g.lineTo(x + 6, y);
              g.lineTo(x, y + 3);
            } else {
              g.moveTo(x + 6, y - 3);
              g.lineTo(x, y);
              g.lineTo(x + 6, y + 3);
            }
            g.closePath();
            g.fill();
          }
        }
      }

      // Escadas
      for (const escada of estrutura.escadas) desenharEscada(g, escada);

      // Elevadores (Tela 3)
      for (const el of elevadores) {
        g.fillStyle = '#A16207';
        g.fillRect(el.x - 24, el.y - 4, 48, 6);
        g.fillStyle = '#FDE68A';
        g.fillRect(el.x - 24, el.y - 6, 48, 2);
        g.strokeStyle = '#78716C';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(el.x, 44);
        g.lineTo(el.x, el.y);
        g.stroke();
      }

      // Barril de óleo (Tela 1) decorativo
      if (estrutura.def.barrilOleo) {
        desenharBarril(g, estrutura.def.barrilOleo.x, estrutura.def.barrilOleo.y, 0, true);
      }

      // Travas (Tela 4)
      for (const trava of travas) {
        if (trava.removida && trava.animacao >= 1) continue;
        const escala = trava.removida ? 1 - trava.animacao : 1;
        g.save();
        g.translate(trava.x, trava.y);
        g.scale(escala, escala);
        desenharTrava(g, 0, 0);
        g.restore();
      }

      // Martelos e itens de bônus
      for (const h of martelos) {
        if (h.coletado) continue;
        desenharMartelo(g, h.x, h.y, performance.now() / 300);
      }
      for (const item of itensBonus) {
        if (item.coletado) continue;
        const frame = performance.now() / 200;
        if (item.tipo === 'chapeu') desenharChapeu(g, item.x, item.y, frame);
        else if (item.tipo === 'bolsa') desenharBolsa(g, item.x, item.y, frame);
        else desenharGuardaChuva(g, item.x, item.y, frame);
      }

      // Barris
      for (const b of barris) {
        desenharBarril(g, b.x, b.y, b.rotacao, b.azul);
      }

      // Bolas de fogo
      for (const fb of bolasFogo) {
        desenharBolaFogo(g, fb.x, fb.y, performance.now() / 90);
      }

      // Caixas de massa
      for (const c of caixas) {
        desenharCaixaMassa(g, c.x, c.y);
      }

      // Molas
      for (const m of molas) {
        desenharMola(g, m.x, m.y, performance.now() / 90);
      }

      // Partículas
      for (const p of particulas) {
        g.globalAlpha = Math.max(0, p.vida);
        g.fillStyle = p.cor;
        g.fillRect(Math.floor(p.x - p.tamanho / 2), Math.floor(p.y - p.tamanho / 2), p.tamanho, p.tamanho);
      }
      g.globalAlpha = 1;

      // Hannah (noiva aguardando)
      if (estado !== 'CENA') {
        desenharHannah(g, hannah.x, hannah.y + 24, performance.now() / 400, true);
        // Grotão
        desenharGrotao(g, grotao.x, grotao.y + 24, 1, grotao.frame, false);
      }

      // Jogador
      if (!jogador.morrendo || Math.floor(jogador.morteTimer * 8) % 2 === 0) {
        if (jogador.invencivelTimer > 0 && Math.floor(jogador.invencivelTimer * 10) % 2 === 0) {
          // piscando: pula o desenho
        } else {
          desenharZeca(g, jogador.x + jogador.largura / 2, jogador.y + jogador.altura, jogador.facing, jogador.walkFrame, jogador.marteloTimer > 0);
          // Martelo sobre a cabeça enquanto ativo
          if (jogador.marteloTimer > 0) {
            desenharMartelo(g, jogador.x + jogador.largura / 2 + 8, jogador.y - 4, performance.now() / 150);
            if (jogador.marteloTimer <= 2.5 && Math.floor(jogador.marteloTimer * 6) % 2 === 0) {
              g.fillStyle = '#FBBF24';
              g.fillRect(jogador.x + jogador.largura / 2 - 6, jogador.y - 14, 12, 2);
            }
          }
        }
      }

      // HUD
      ctx.hud.desenharHUD(g, LARGURA, ALTURA);

      // Altura e ciclo (abaixo de FASE, no canto esquerdo)
      g.fillStyle = '#22D3EE';
      g.font = '8px "Press Start 2P", monospace';
      g.textAlign = 'left';
      g.fillText(`${estrutura.def.alturaMetros}m`, 18, 62);
      g.fillText(`CICLO ${ciclo}`, 18, 76);

      g.restore();
    }

    function desenharVigia(g: CanvasRenderingContext2D, vigia: Segmento) {
      const dx = vigia.x2 - vigia.x;
      const dy = vigia.y2 - vigia.y;
      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      g.save();
      g.translate(vigia.x, vigia.y);
      g.rotate(angle);

      g.fillStyle = '#C2410C';
      g.fillRect(0, 0, len, 3);
      g.fillRect(0, vigia.altura - 3, len, 3);

      const segmentWidth = 14;
      const count = Math.floor(len / segmentWidth);
      g.strokeStyle = '#7C2D12';
      g.lineWidth = 1.5;
      g.beginPath();
      for (let i = 0; i < count; i++) {
        const x1 = i * segmentWidth;
        const x2 = (i + 1) * segmentWidth;
        g.moveTo(x1, 2);
        g.lineTo(x2, vigia.altura - 2);
        g.moveTo(x2, 2);
        g.lineTo(x1, vigia.altura - 2);
      }
      g.stroke();

      g.fillStyle = '#22D3EE';
      for (let i = 0; i <= count; i++) {
        const rx = i * segmentWidth;
        g.fillRect(rx, 1, 2, 2);
        g.fillRect(rx, vigia.altura - 3, 2, 2);
      }

      g.restore();
    }

    function desenharEscada(g: CanvasRenderingContext2D, escada: { x: number; yTop: number; yBottom: number; quebrada: boolean }) {
      const largura = 16;
      const metade = largura / 2;
      g.fillStyle = '#22D3EE';

      if (!escada.quebrada) {
        g.fillRect(escada.x - metade, escada.yTop, 2, escada.yBottom - escada.yTop);
        g.fillRect(escada.x + metade - 2, escada.yTop, 2, escada.yBottom - escada.yTop);
        for (let y = escada.yTop + 4; y < escada.yBottom; y += 6) {
          g.fillRect(escada.x - metade, y, largura, 2);
        }
      } else {
        const gap = (escada.yTop + escada.yBottom) / 2;
        const gapTamanho = 18;
        // Parte de cima
        g.fillRect(escada.x - metade, escada.yTop, 2, gap - gapTamanho / 2 - escada.yTop);
        g.fillRect(escada.x + metade - 2, escada.yTop, 2, gap - gapTamanho / 2 - escada.yTop);
        for (let y = escada.yTop + 4; y < gap - gapTamanho / 2; y += 6) {
          g.fillRect(escada.x - metade, y, largura, 2);
        }
        // Pontas quebradas vermelhas
        g.fillStyle = '#EF4444';
        g.fillRect(escada.x - metade, gap - gapTamanho / 2, 4, 3);
        g.fillRect(escada.x + metade - 4, gap + gapTamanho / 2 - 3, 4, 3);
        // Parte de baixo
        g.fillStyle = '#22D3EE';
        g.fillRect(escada.x - metade, gap + gapTamanho / 2, 2, escada.yBottom - (gap + gapTamanho / 2));
        g.fillRect(escada.x + metade - 2, gap + gapTamanho / 2, 2, escada.yBottom - (gap + gapTamanho / 2));
        for (let y = gap + gapTamanho / 2 + 4; y < escada.yBottom; y += 6) {
          g.fillRect(escada.x - metade, y, largura, 2);
        }
      }
    }

    // ===== GameInstance =====
    let tempoGlobal = 0;

    return {
      iniciar() {
        iniciarPartida();
      },

      reiniciar() {
        iniciarPartida();
      },

      pausar() {},
      retomar() {},

      destruir() {
        barris = [];
        bolasFogo = [];
        caixas = [];
        molas = [];
        travas = [];
        martelos = [];
        itensBonus = [];
        particulas = [];
      },

      atualizar(dt: number, input: InputState) {
        const dtSeguro = Math.min(dt, 0.05);
        tempoGlobal += dtSeguro;

        if (estado === 'TITLE') {
          if (input.acaoPressionada || input.cimaPressionada) {
            iniciarPartida();
          }
          return;
        }

        if (estado === 'CENA' && cena) {
          if (cena.atualizar(dtSeguro, input.acaoPressionada)) {
            const depois = cenaApos;
            cena = null;
            cenaApos = null;
            depois?.();
          }
          return;
        }

        if (estado === 'GAMEOVER') {
          if (input.acaoPressionada) iniciarPartida();
          return;
        }

        atualizarJogando(dtSeguro, input);
      },

      desenhar(g: CanvasRenderingContext2D) {
        if (estado === 'TITLE') {
          // Tela de título
          const grad = g.createLinearGradient(0, 0, 0, ALTURA);
          grad.addColorStop(0, '#0F172A');
          grad.addColorStop(1, '#1E293B');
          g.fillStyle = grad;
          g.fillRect(0, 0, LARGURA, ALTURA);

          desenharEstruturaSilhuetaFake(g);

          g.fillStyle = '#FDE68A';
          g.font = '18px "Press Start 2P", monospace';
          g.textAlign = 'center';
          g.fillText('SALVE A', LARGURA / 2, 150);
          g.fillStyle = '#14B8A6';
          g.fillText('HANNAH', LARGURA / 2, 178);

          g.fillStyle = '#F8FAFC';
          g.font = '7px "Press Start 2P", monospace';
          g.fillText('RESGATE-A DO GROTÃO', LARGURA / 2, 216);

          const pisca = Math.floor(tempoGlobal * 2) % 2 === 0;
          if (pisca) {
            g.fillStyle = '#FBBF24';
            g.fillText('PRESSIONE AÇÃO', LARGURA / 2, 300);
          }

          g.fillStyle = '#94A3B8';
          g.font = '6px "Press Start 2P", monospace';
          g.fillText('SETAS: MOVER · ESPAÇO: PULAR', LARGURA / 2, 400);
          g.fillText('RECORDE: ' + Math.floor(ctx.storage.lerRecorde(ctx.id)), LARGURA / 2, 430);
          return;
        }

        if (estado === 'CENA' && cena) {
          cena.desenhar(g, LARGURA, ALTURA);
          return;
        }

        desenhar(g);

        if (estado === 'GAMEOVER') {
          ctx.hud.desenharGameOver(g, LARGURA, ALTURA, 'PRESSIONE AÇÃO');
        }
      },
    };
  },
};

function desenharEstruturaSilhuetaFake(g: CanvasRenderingContext2D) {
  g.strokeStyle = '#334155';
  g.lineWidth = 4;
  for (let i = 0; i < 6; i++) {
    const y = 330 + i * 26;
    g.beginPath();
    g.moveTo(80 - i * 8, y);
    g.lineTo(400 + i * 8, y);
    g.stroke();
  }
}
