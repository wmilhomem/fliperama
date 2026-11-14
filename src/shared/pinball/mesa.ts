/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Carregador/loader de mesa de pinball.
 *
 * A biblioteca carrega a mesa (dados), roda a física, trata as regras comuns
 * (tilt, bolas, bônus, multiplicador, ball save) e desenha os elementos
 * animados. A mesa só fornece geometria, elementos, regras e arte.
 */

import { EngineContext, GameInstance, InputState } from '../../engine/types';
import {
  BALL_SAVE_PADRAO,
  FORCA_EMPURRAO,
  FORCA_PLUNGER_MINIMA,
  GRAVIDADE_PADRAO,
  IMPULSO_ANTI_TRAVA,
  PASSO_FIXO,
  RAIO_BOLA,
  SUBPASSOS_POR_QUADRO,
  TEMPO_AVISO_BOLA_SALVA,
  TEMPO_CARGA_PLUNGER,
  TEMPO_PARADO_LIMITE,
  VELOCIDADE_MAXIMA,
  VELOCIDADE_PARADA,
} from './tuning';
import {
  Bola,
  aplicarGravidade,
  criarBola,
  moverBola,
} from './fisica';
import {
  atualizarElementos,
  colidirAlvo,
  colidirBumper,
  colidirSlingshot,
  contarVoltasSpinner,
  criarEstadosElementos,
  detectarDreno,
  detectarInlane,
  detectarOutlane,
  detectarRollover,
  detectarSpinner,
  detectarTrilho,
  desenharElementoPadrao,
  resetarElementos,
} from './elementos';
import {
  Flipper,
  atualizarFlipper,
  colidirFlipper,
  criarFlipper,
  desenharFlipper,
} from './flippers';
import { desenharPlacar } from './placar';
import { RegrasComuns } from './regras';
import {
  ContextoDesenho,
  ContextoRegra,
  DefinicaoMesa,
  EstadoBumper,
  EstadoCanal,
  EstadoElemento,
  EstadoMesa,
  EstadoRollover,
  EstadoSlingshot,
  EstadoSpinner,
  Plunger,
  Ponto,
  PortaoMaoUnica,
} from './tipos';

export interface OpcoesMesa {
  /** Mensagem de créditos/controles exibida na tela de título. */
  mensagem?: string;
  /** Callback opcional de inspeção (usado em testes e depuração). */
  aoInspecionar?: (dados: InspecaoMesa) => void;
  /** Ativa o modo debug pela tecla mapeada em `input.cima` (padrão: true). */
  debug?: boolean;
}

/** Dados expostos pelo callback de inspeção. */
export interface InspecaoMesa {
  bola: Bola | null;
  tempo: number;
  fase: EstadoMesa['fase'];
  pontuacao: number;
  bolasRestantes: number;
  multiplicador: number;
  debug: boolean;
  drenosPorRegiao: Record<string, number>;
}

export function criarJogoPinball(
  ctx: EngineContext,
  tabela: DefinicaoMesa,
  opcoes: OpcoesMesa = {}
): GameInstance {
  const gravidade = tabela.gravidade ?? GRAVIDADE_PADRAO;
  const regras = new RegrasComuns({
    bolasPorPartida: tabela.bolasPorPartida,
    multiplicadorMaximo: tabela.multiplicadorMaximo,
  });
  const estadosElementos = criarEstadosElementos(tabela.elementos);
  regras.estado.elementos = estadosElementos;

  const flippers: [Flipper, Flipper] = [
    criarFlipper(tabela.flippers[0]),
    criarFlipper(tabela.flippers[1]),
  ];

  const elementoPlunger = tabela.elementos.find(
    (elemento): elemento is Plunger => elemento.tipo === 'plunger'
  );
  const portoes = tabela.elementos.filter(
    (elemento): elemento is PortaoMaoUnica => elemento.tipo === 'portao'
  );
  const ballSaveSegundos = tabela.ballSave?.segundos ?? BALL_SAVE_PADRAO;

  let bola: Bola | null = null;
  let cargaPlunger = 0;
  let plungerPressionado = false;
  let plungerLiberado = false;
  let tempoGlobal = 0;
  let tempoEstado = 0;
  let tempoDesdeLancamento = 0;
  let bolaLancada = false;
  let tempoAvisoBolaSalva = 0;
  let tremor = 0;
  let ultimoImpacto: Record<string, number> = {};
  let destroyed = false;

  // Modo debug e contadores de dreno por região
  let debugAtivo = false;
  const drenosPorRegiao: Record<string, number> = {};


  // Rastro curto da bola
  const rastro: Ponto[] = [];

  // Camada estática pré-renderizada
  let camadaEstatica: HTMLCanvasElement | null = null;

  const contextoRegra: ContextoRegra = {
    pontuar(valor: number) {
      ctx.hud.adicionarPontos(valor);
      regras.estado.pontuacao = ctx.hud.obterEstado().pontuacao;
    },
    audio(preset) {
      ctx.audio.tocar(preset);
    },
    luz(id: string) {
      return regras.luz(id);
    },
    acenderLuz(id: string, acesa: boolean) {
      regras.acenderLuz(id, acesa);
    },
    multiplicador() {
      return regras.estado.multiplicador;
    },
    aumentarMultiplicador() {
      regras.aumentarMultiplicador();
    },
    bolasRestantes() {
      return regras.estado.bolasRestantes;
    },
    adicionarBola() {
      regras.adicionarBola();
    },
    ativarAtireDeNovo() {
      regras.ativarAtireDeNovo();
    },
    apagarElemento(id: string) {
      const estado = estadosElementos[id];
      if (!estado) return;
      if (estado.tipo === 'rollover' || estado.tipo === 'alvoFixo') {
        estado.aceso = false;
      } else if (estado.tipo === 'alvoQueda') {
        estado.caido = false;
        estado.resetEm = 0;
      }
    },
    elementoAceso(id: string) {
      const estado = estadosElementos[id];
      if (!estado) return false;
      if (estado.tipo === 'rollover' || estado.tipo === 'alvoFixo') return estado.aceso;
      if (estado.tipo === 'alvoQueda') return estado.caido;
      return false;
    },
    bolaEmJogo() {
      return bola !== null;
    },
  };

  function contextoDesenho(): ContextoDesenho {
    return {
      tempo: tempoGlobal,
      estado: regras.estado,
      largura: tabela.largura,
      altura: tabela.altura,
      painelAltura: tabela.painelAltura,
    };
  }

  function podeDisparar(id: string, intervalo = 0.12): boolean {
    const agora = tempoGlobal;
    const ultimo = ultimoImpacto[id] ?? -999;
    if (agora - ultimo < intervalo) return false;
    ultimoImpacto[id] = agora;
    return true;
  }

  /** Verdadeiro quando todos os elementos do grupo estão marcados. */
  function grupoCompleto(grupo: string): boolean {
    const doGrupo = tabela.elementos.filter(
      (elemento) =>
        (elemento.tipo === 'alvoFixo' || elemento.tipo === 'alvoQueda') &&
        elemento.grupo === grupo
    );
    if (doGrupo.length === 0) return false;
    return doGrupo.every((elemento) => {
      const estado = estadosElementos[elemento.id];
      if (!estado) return false;
      if (estado.tipo === 'alvoFixo') return estado.aceso;
      if (estado.tipo === 'alvoQueda') return estado.caido;
      return false;
    });
  }

  function servirBola(): void {
    if (!elementoPlunger) return;
    bola = criarBola(elementoPlunger.x, elementoPlunger.y, RAIO_BOLA);
    bola.naMola = true;
    cargaPlunger = 0;
    plungerPressionado = false;
    plungerLiberado = false;
    bolaLancada = false;
    tempoDesdeLancamento = 0;
    ultimoImpacto = {};
    rastro.length = 0;
    resetarElementos(estadosElementos, tabela.elementos);
    regras.estado.atireDeNovo = false;
    regras.estado.luzes.atireDeNovo = false;
    regras.estado.especial = false;
    regras.estado.luzes.especial = false;
    regras.estado.tilt = false;
    regras.estado.luzes.tilt = false;
  }

  function iniciarPartida(): void {
    regras.reiniciar(ctx.storage.lerRecorde(ctx.id));
    regras.estado.recorde = ctx.hud.obterEstado().recorde;
    ctx.hud.definirEstado({
      pontuacao: 0,
      recorde: regras.estado.recorde,
      vidas: regras.estado.bolasRestantes,
      fase: 1,
    });
    tempoEstado = 0;
    tremor = 0;
    for (const chave of Object.keys(drenosPorRegiao)) delete drenosPorRegiao[chave];
    servirBola();
  }

  function lancarBola(): void {
    if (!bola || !elementoPlunger) return;
    const forca =
      elementoPlunger.forcaMax *
      (FORCA_PLUNGER_MINIMA + (1 - FORCA_PLUNGER_MINIMA) * cargaPlunger);
    bola.naMola = false;
    bola.vx = 0;
    bola.vy = -forca;
    bola.tempoParada = 0;
    bolaLancada = true;
    tempoDesdeLancamento = 0;
    cargaPlunger = 0;
    plungerPressionado = false;
    ctx.audio.tocar('plunger');
  }

  /** Registra por onde a bola saiu (usado pelo contador do modo debug). */
  function registrarDreno(): void {
    if (!bola) return;
    const regioes = tabela.regioesDreno ?? [];
    for (const regiao of regioes) {
      if (
        bola.x >= regiao.x &&
        bola.x <= regiao.x + regiao.largura &&
        bola.y >= regiao.y &&
        bola.y <= regiao.y + regiao.altura
      ) {
        drenosPorRegiao[regiao.id] = (drenosPorRegiao[regiao.id] ?? 0) + 1;
        return;
      }
    }
    drenosPorRegiao.outros = (drenosPorRegiao.outros ?? 0) + 1;
  }

  function fimDaBola(motivo: 'dreno' | 'tilt'): void {
    if (regras.estado.fase !== 'jogando') return;

    if (motivo === 'tilt') {
      ctx.audio.tocar('tilt');
      tabela.regras.aoTilt?.(contextoRegra);
    }

    // Ball save: a bola volta para o lançador sem custar bola
    if (motivo === 'dreno' && bolaLancada && tempoDesdeLancamento < ballSaveSegundos) {
      regras.acenderLuz('bolaSalva', true);
      tempoAvisoBolaSalva = TEMPO_AVISO_BOLA_SALVA;
      tempoEstado = 0;
      servirBola();
      return;
    }

    if (regras.estado.atireDeNovo) {
      regras.estado.atireDeNovo = false;
      regras.estado.luzes.atireDeNovo = false;
      servirBola();
      return;
    }

    if (regras.estado.especial) {
      regras.estado.especial = false;
      regras.estado.luzes.especial = false;
      regras.adicionarBola();
      ctx.audio.tocar('bolaExtra');
      tabela.regras.aoBolaExtra?.(contextoRegra);
    }

    ctx.audio.tocar('drenar');
    tabela.regras.aoDreno?.(contextoRegra);

    regras.prepararBonus();
    regras.estado.fase = 'fimDeBola';
    tempoEstado = 0;
    bola = null;
  }

  function fimDePartida(): void {
    regras.estado.fase = 'gameover';
    regras.estado.luzes.gameOver = true;
    regras.estado.bolasRestantes = 0;
    ctx.hud.definirEstado({
      pontuacao: regras.estado.pontuacao,
      recorde: ctx.hud.obterEstado().recorde,
      vidas: 0,
      fase: regras.estado.bolaAtual,
    });
    ctx.finalizarJogo('gameOver');
  }

  function aplicarEmpurrão(): void {
    if (!bola || regras.estado.tilt) return;
    const direcao = bola.x < tabela.largura / 2 ? 1 : -1;
    bola.vx += direcao * FORCA_EMPURRAO * (0.6 + Math.random() * 0.4);
    bola.vy -= FORCA_EMPURRAO * 0.45;
    tremor = 1;
    if (regras.registrarEmpurrão()) {
      regras.estado.tilt = true;
      regras.estado.luzes.tilt = true;
      tabela.regras.aoTilt?.(contextoRegra);
      fimDaBola('tilt');
    }
  }

  /**
   * Portão de mão única: a bola sobe livremente, mas não pode voltar
   * para baixo da pista do lançador — ela é devolvida para o campo.
   */
  function atualizarPortoes(ultimoY: number): void {
    if (!bola) return;
    for (const portao of portoes) {
      const dentroX =
        bola.x > portao.x - bola.raio && bola.x < portao.x + portao.largura + bola.raio;
      if (!dentroX) continue;
      if (bola.y >= portao.y && ultimoY < portao.y) {
        // Tentou voltar para a pista: devolve a bola para o campo de jogo.
        bola.y = portao.y - bola.raio - 0.2;
        bola.vy = -Math.abs(bola.vy) * 0.4 - 40;
        bola.vx = -Math.abs(bola.vx) * 0.3 - 260;
      }
    }
  }

  function atualizarJogo(dt: number, input: InputState): void {
    regras.tick(dt);
    tempoGlobal += dt;
    tremor = Math.max(0, tremor - dt * 3.2);

    if (opcoes.debug !== false && input.cimaPressionada) {
      debugAtivo = !debugAtivo;
    }

    if (input.acao2Pressionada) aplicarEmpurrão();

    // Aviso de bola salva (pisca por alguns segundos)
    if (tempoAvisoBolaSalva > 0) {
      tempoAvisoBolaSalva -= dt;
      if (tempoAvisoBolaSalva <= 0) regras.acenderLuz('bolaSalva', false);
    }

    const travado = regras.estado.tilt;
    atualizarFlipper(flippers[0], input.esquerda && !travado, dt);
    atualizarFlipper(flippers[1], input.direita && !travado, dt);

    // Lançador: só arma depois que o botão foi solto (evita lançar junto com o start)
    if (!input.acao) plungerLiberado = true;
    if (bola && bola.naMola && elementoPlunger && plungerLiberado) {
      if (input.acao) {
        plungerPressionado = true;
        cargaPlunger = Math.min(1, cargaPlunger + dt / TEMPO_CARGA_PLUNGER);
      } else if (plungerPressionado) {
        lancarBola();
      }
    }

    if (bola) {
      if (bolaLancada) tempoDesdeLancamento += dt;
      const bloqueado = regras.estado.tilt;
      let sobreFlipper = false;
      const yAntesDoQuadro = bola.y;

      for (let subpasso = 0; subpasso < SUBPASSOS_POR_QUADRO; subpasso++) {
        if (bola.naMola) {
          bola.vx = 0;
          bola.vy = 0;
          bola.x = elementoPlunger ? elementoPlunger.x : bola.x;
          bola.y = elementoPlunger ? elementoPlunger.y : bola.y;
          continue;
        }
        aplicarGravidade(bola, gravidade, PASSO_FIXO);
        moverBola(bola, PASSO_FIXO, tabela.geometria);
        if (!bloqueado) {
          if (colidirFlipper(bola, flippers[0])) sobreFlipper = true;
          if (colidirFlipper(bola, flippers[1])) sobreFlipper = true;
        }
        for (const elemento of tabela.elementos) {
          const estado = estadosElementos[elemento.id];
          if (!estado) continue;
          switch (elemento.tipo) {
            case 'bumper': {
              const acertou = colidirBumper(bola, elemento, estado as EstadoBumper);
              if (acertou && podeDisparar(elemento.id, 0.2)) {
                ctx.audio.tocar('bumper');
                if (elemento.pontos) contextoRegra.pontuar(elemento.pontos);
                tabela.regras.aoBumper?.(elemento, contextoRegra);
              }
              break;
            }
            case 'slingshot': {
              const acertou = colidirSlingshot(bola, elemento, estado as EstadoSlingshot);
              if (acertou && podeDisparar(elemento.id, 0.2)) {
                ctx.audio.tocar('slingshot');
                if (elemento.pontos) contextoRegra.pontuar(elemento.pontos);
                tabela.regras.aoSlingshot?.(elemento, contextoRegra);
              }
              break;
            }
            case 'alvoFixo': {
              const estadoAlvo = estado as { tipo: 'alvoFixo'; aceso: boolean; animacao: number };
              const acertou = colidirAlvo(bola, elemento, estadoAlvo);
              if (acertou && !estadoAlvo.aceso) {
                estadoAlvo.aceso = true;
                ctx.audio.tocar('alvo');
                if (elemento.pontos) contextoRegra.pontuar(elemento.pontos);
                tabela.regras.aoAlvoFixo?.(elemento, contextoRegra);
                if (elemento.grupo && grupoCompleto(elemento.grupo)) {
                  tabela.regras.aoGrupoCompleto?.(elemento.grupo, contextoRegra);
                }
              }
              break;
            }
            case 'alvoQueda': {
              const estadoAlvo = estado as {
                tipo: 'alvoQueda';
                caido: boolean;
                animacao: number;
                resetEm: number;
              };
              const acertou = colidirAlvo(bola, elemento, estadoAlvo);
              if (acertou && !estadoAlvo.caido) {
                estadoAlvo.caido = true;
                estadoAlvo.resetEm = 0;
                ctx.audio.tocar('alvoQueda');
                if (elemento.pontos) contextoRegra.pontuar(elemento.pontos);
                tabela.regras.aoAlvoQueda?.(elemento, contextoRegra);
                if (elemento.grupo && grupoCompleto(elemento.grupo)) {
                  // Banco completo: programa o rearme dos alvos do banco.
                  for (const alvo of tabela.elementos) {
                    if (alvo.tipo !== 'alvoQueda' || alvo.grupo !== elemento.grupo) continue;
                    const estadoBanco = estadosElementos[alvo.id];
                    if (estadoBanco && estadoBanco.tipo === 'alvoQueda') {
                      estadoBanco.resetEm = 1.8;
                    }
                  }
                  tabela.regras.aoBancoCompleto?.(elemento.grupo, contextoRegra);
                }
              }
              break;
            }
            default:
              break;
          }
        }
      }

      // Portões de mão única (o Y anterior vem de antes dos subpassos)
      atualizarPortoes(yAntesDoQuadro);

      // Sensores (uma leitura por quadro)
      for (const elemento of tabela.elementos) {
        const estado = estadosElementos[elemento.id];
        if (!estado) continue;
        switch (elemento.tipo) {
          case 'rollover': {
            const estadoRollover = estado as EstadoRollover;
            if (detectarRollover(bola, elemento, estadoRollover)) {
              tabela.regras.aoRollover?.(elemento, contextoRegra);
            }
            break;
          }
          case 'spinner': {
            const estadoSpinner = estado as EstadoSpinner;
            if (detectarSpinner(bola, elemento, estadoSpinner)) {
              const voltas = contarVoltasSpinner(estadoSpinner);
              if (voltas > 0) {
                ctx.audio.tocar('spinner');
                if (elemento.pontos) contextoRegra.pontuar(elemento.pontos * voltas);
                tabela.regras.aoSpinner?.(elemento, contextoRegra);
              }
            }
            break;
          }
          case 'inlane': {
            const estadoCanal = estado as EstadoCanal;
            if (detectarInlane(bola, elemento, estadoCanal) && podeDisparar(elemento.id, 0.3)) {
              tabela.regras.aoInlane?.(elemento, contextoRegra);
            }
            break;
          }
          case 'trilho': {
            if (detectarTrilho(bola, elemento) && podeDisparar(elemento.id, 0.5)) {
              if (elemento.pontos) contextoRegra.pontuar(elemento.pontos);
              tabela.regras.aoTrilho?.(elemento, contextoRegra);
            }
            break;
          }
          case 'outlane': {
            const estadoCanal = estado as EstadoCanal;
            if (detectarOutlane(bola, elemento, estadoCanal) && podeDisparar(elemento.id, 0.3)) {
              tabela.regras.aoOutlane?.(elemento, contextoRegra);
            }
            break;
          }
          case 'dreno': {
            if (detectarDreno(bola, elemento)) {
              registrarDreno();
              fimDaBola('dreno');
            }
            break;
          }
          default:
            break;
        }
      }

      // A bola pode ter sido drenada dentro do laço de sensores.
      if (!bola) return;

      // Rede de segurança: bola fora do campo conta como dreno.
      if (
        bola.y > tabela.altura + 24 ||
        bola.y < -24 ||
        bola.x < -24 ||
        bola.x > tabela.largura + 24
      ) {
        registrarDreno();
        bola = null;
        fimDaBola('dreno');
        return;
      }

      // Anti-travamento: bola parada por muito tempo (fora dos flippers).
      const velocidade = Math.hypot(bola.vx, bola.vy);
      if (velocidade < VELOCIDADE_PARADA && !bola.naMola && !sobreFlipper) {
        bola.tempoParada += dt;
        if (bola.tempoParada > TEMPO_PARADO_LIMITE) {
          bola.tempoParada = 0;
          bola.vx += (Math.random() - 0.5) * IMPULSO_ANTI_TRAVA * 2;
          bola.vy -= IMPULSO_ANTI_TRAVA;
        }
      } else {
        bola.tempoParada = 0;
      }

      const velocidadeFinal = Math.hypot(bola.vx, bola.vy);
      if (velocidadeFinal > VELOCIDADE_MAXIMA) {
        const escala = VELOCIDADE_MAXIMA / velocidadeFinal;
        bola.vx *= escala;
        bola.vy *= escala;
      }

      // Rastro curto da bola
      rastro.push({ x: bola.x, y: bola.y });
      if (rastro.length > 7) rastro.shift();
    }

    atualizarElementos(estadosElementos, tabela.elementos, dt);
    tabela.aoAtualizar?.(dt, contextoDesenho());
    ctx.hud.definirEstado({
      pontuacao: regras.estado.pontuacao,
      recorde: Math.max(regras.estado.recorde, ctx.hud.obterEstado().recorde),
      vidas: regras.estado.bolasRestantes,
      fase: regras.estado.bolaAtual,
    });

    opcoes.aoInspecionar?.({
      bola,
      tempo: tempoGlobal,
      fase: regras.estado.fase,
      pontuacao: regras.estado.pontuacao,
      bolasRestantes: regras.estado.bolasRestantes,
      multiplicador: regras.estado.multiplicador,
      debug: debugAtivo,
      drenosPorRegiao: { ...drenosPorRegiao },
    });

    // Lâmpada de recorde (acende quando o jogador supera o recorde salvo)
    if (tabela.luzes.some((luz) => luz.id === 'recorde')) {
      regras.acenderLuz('recorde', regras.estado.pontuacao > regras.estado.recorde);
    }
  }

  function atualizarFimDeBola(dt: number): void {
    tempoEstado += dt;
    const parcela = regras.animarBonus(dt);
    if (parcela > 0) {
      ctx.hud.adicionarPontos(parcela);
      regras.estado.pontuacao = ctx.hud.obterEstado().pontuacao;
    }
    const bonusConcluido =
      regras.estado.bonusAlvo <= 0 || regras.estado.bonusAnimado >= regras.estado.bonusAlvo;
    if (bonusConcluido && tempoEstado > 0.6) {
      regras.estado.bolasRestantes -= 1;
      if (regras.estado.bolasRestantes <= 0) {
        fimDePartida();
        return;
      }
      regras.estado.bolaAtual = Math.min(
        regras.estado.bolasPorPartida,
        regras.estado.bolaAtual + 1
      );
      servirBola();
      regras.estado.fase = 'jogando';
      tempoEstado = 0;
    }
  }

  function prepararCamadaEstatica(): void {
    if (typeof document === 'undefined') return;
    if (camadaEstatica) return;
    if (!tabela.desenharCamadaEstatica) return;
    const canvas = document.createElement('canvas');
    canvas.width = tabela.largura;
    canvas.height = tabela.altura;
    const g = canvas.getContext('2d');
    if (!g) return;
    g.imageSmoothingEnabled = false;
    tabela.desenharCamadaEstatica(g, contextoDesenho());
    camadaEstatica = canvas;
  }

  function desenharParedes(g: CanvasRenderingContext2D): void {
    g.save();
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const parede of tabela.geometria) {
      const traco = () => {
        g.beginPath();
        if (parede.tipo === 'segmento') {
          g.moveTo(parede.x1, parede.y1);
          g.lineTo(parede.x2, parede.y2);
        } else {
          g.arc(
            parede.cx,
            parede.cy,
            parede.raio,
            parede.anguloInicio,
            parede.anguloFim,
            parede.sentido === -1
          );
        }
        g.stroke();
      };
      // Contorno grosso e escuro + cor viva (para a bola sempre destacar)
      g.strokeStyle = 'rgba(12, 4, 28, 0.95)';
      g.lineWidth = 10;
      traco();
      g.strokeStyle = tabela.corTema;
      g.lineWidth = 5;
      traco();
      g.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      g.lineWidth = 1.5;
      traco();
    }
    g.restore();
  }

  function desenharElementos(g: CanvasRenderingContext2D): void {
    const ctxDesenho = contextoDesenho();
    for (const elemento of tabela.elementos) {
      const estado = estadosElementos[elemento.id];
      if (!estado) continue;
      if (tabela.desenharElemento) {
        tabela.desenharElemento(g, elemento, estado, ctxDesenho);
      } else {
        desenharElementoPadrao(g, elemento, estado);
      }
    }
  }

  function desenharRastro(g: CanvasRenderingContext2D): void {
    if (rastro.length < 2) return;
    g.save();
    for (let i = 0; i < rastro.length - 1; i++) {
      const t = (i + 1) / rastro.length;
      g.globalAlpha = t * 0.35;
      g.fillStyle = '#C7D2FE';
      const p = rastro[i];
      g.beginPath();
      g.arc(p.x, p.y, RAIO_BOLA * 0.8 * t, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function desenharBola(g: CanvasRenderingContext2D): void {
    if (!bola) return;
    const ctxDesenho = contextoDesenho();
    desenharRastro(g);
    if (tabela.desenharBola) {
      tabela.desenharBola(g, bola, ctxDesenho);
      return;
    }
    g.save();
    g.fillStyle = '#FDE68A';
    g.beginPath();
    g.arc(bola.x, bola.y, bola.raio, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)';
    g.beginPath();
    g.arc(bola.x - 2.5, bola.y - 3, bola.raio * 0.32, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function desenharFlippers(g: CanvasRenderingContext2D): void {
    desenharFlipper(g, flippers[0], '#F472B6', '#2A1145');
    desenharFlipper(g, flippers[1], '#F472B6', '#2A1145');
  }

  /** Modo debug: geometria de colisão, raios e contadores de dreno. */
  function desenharDebug(g: CanvasRenderingContext2D): void {
    if (!debugAtivo) return;
    g.save();
    g.lineWidth = 1;

    // Paredes
    g.strokeStyle = 'rgba(0, 255, 255, 0.55)';
    for (const parede of tabela.geometria) {
      g.beginPath();
      if (parede.tipo === 'segmento') {
        g.moveTo(parede.x1, parede.y1);
        g.lineTo(parede.x2, parede.y2);
      } else {
        g.arc(
          parede.cx,
          parede.cy,
          parede.raio,
          parede.anguloInicio,
          parede.anguloFim,
          parede.sentido === -1
        );
      }
      g.stroke();
    }

    // Raios dos elementos
    for (const elemento of tabela.elementos) {
      if (elemento.tipo === 'bumper') {
        g.strokeStyle = 'rgba(255, 214, 102, 0.8)';
        g.beginPath();
        g.arc(elemento.x, elemento.y, elemento.raio, 0, Math.PI * 2);
        g.stroke();
      } else if (elemento.tipo === 'alvoFixo' || elemento.tipo === 'alvoQueda') {
        g.strokeStyle = 'rgba(255, 214, 102, 0.8)';
        g.strokeRect(
          elemento.x - elemento.largura / 2,
          elemento.y - elemento.altura / 2,
          elemento.largura,
          elemento.altura
        );
      } else if (elemento.tipo === 'slingshot') {
        g.strokeStyle = 'rgba(255, 214, 102, 0.8)';
        g.beginPath();
        g.moveTo(elemento.vertices[0].x, elemento.vertices[0].y);
        g.lineTo(elemento.vertices[1].x, elemento.vertices[1].y);
        g.lineTo(elemento.vertices[2].x, elemento.vertices[2].y);
        g.closePath();
        g.stroke();
      } else if (elemento.tipo === 'dreno' || elemento.tipo === 'outlane' || elemento.tipo === 'inlane') {
        g.strokeStyle = 'rgba(255, 106, 106, 0.8)';
        g.strokeRect(
          elemento.x - elemento.largura / 2,
          elemento.y - elemento.altura / 2,
          elemento.largura,
          elemento.altura
        );
      }
    }

    // Pivôs dos flippers
    g.fillStyle = '#22D3EE';
    for (const flipper of flippers) {
      g.beginPath();
      g.arc(flipper.definicao.pivoX, flipper.definicao.pivoY, 5, 0, Math.PI * 2);
      g.fill();
    }

    // Contadores de dreno
    g.font = '12px "Press Start 2P", monospace';
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = 'rgba(0,0,0,0.75)';
    g.fillRect(8, 104, 300, 24 + Object.keys(drenosPorRegiao).length * 16);
    g.fillStyle = '#FACC15';
    let linha = 110;
    g.fillText('DRENOS', 16, linha);
    linha += 16;
    for (const regiao of tabela.regioesDreno ?? []) {
      g.fillText(
        `${regiao.rotulo}: ${drenosPorRegiao[regiao.id] ?? 0}`,
        16,
        linha
      );
      linha += 16;
    }
    g.fillText(`OUTROS: ${drenosPorRegiao.outros ?? 0}`, 16, linha);

    g.restore();
  }

  function desenharTitulo(g: CanvasRenderingContext2D): void {
    g.save();
    g.fillStyle = 'rgba(6, 2, 16, 0.88)';
    g.fillRect(0, 0, tabela.largura, tabela.altura);

    g.textAlign = 'center';
    g.textBaseline = 'top';
    g.fillStyle = tabela.corTema;
    g.fillRect(120, 150, tabela.largura - 240, 3);

    g.font = '30px "Press Start 2P", monospace';
    g.fillStyle = '#FFD166';
    g.fillText('FLIPERAMA', tabela.largura / 2, 186);

    g.font = '20px "Press Start 2P", monospace';
    g.fillStyle = tabela.corTema;
    const palavras = tabela.titulo.toUpperCase().split(' ');
    palavras.forEach((palavra, indice) => {
      g.fillText(palavra, tabela.largura / 2, 236 + indice * 30);
    });

    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = '#E9D5FF';
    g.fillText('MESA DE PINBALL', tabela.largura / 2, 236 + palavras.length * 30 + 16);

    g.fillStyle = '#C4B5FD';
    g.fillText('SETAS / Z / BARRA: FLIPPERS', tabela.largura / 2, 430);
    g.fillText('ESPAÇO: LANÇADOR', tabela.largura / 2, 452);
    g.fillText('X: EMPURRÃO', tabela.largura / 2, 474);
    g.fillText('D: MODO DEBUG', tabela.largura / 2, 496);
    g.fillText('P PAUSA  R RESET  ESC HUB', tabela.largura / 2, 518);

    if (opcoes.mensagem) {
      g.fillStyle = '#FDA4AF';
      g.fillText(opcoes.mensagem, tabela.largura / 2, 552);
    }

    g.globalAlpha = 0.6 + Math.sin(tempoGlobal * 3.2) * 0.35;
    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = '#FFFFFF';
    g.fillText('PRESSIONE ESPAÇO / TOQUE', tabela.largura / 2, 600);
    g.globalAlpha = 1;
    g.restore();
  }

  function desenharBonus(g: CanvasRenderingContext2D): void {
    g.save();
    g.fillStyle = 'rgba(6, 2, 16, 0.72)';
    g.fillRect(0, 0, tabela.largura, tabela.altura);
    g.textAlign = 'center';
    g.textBaseline = 'top';
    g.font = '20px "Press Start 2P", monospace';
    g.fillStyle = '#FFD166';
    g.fillText('FIM DE BOLA', tabela.largura / 2, 300);
    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = '#F5D0FE';
    g.fillText(`BÔNUS ${regras.estado.multiplicador}X`, tabela.largura / 2, 340);
    g.font = '26px "Press Start 2P", monospace';
    g.fillStyle = '#22D3EE';
    g.fillText(
      Math.floor(regras.estado.bonusAnimado).toString().padStart(6, '0'),
      tabela.largura / 2,
      372
    );
    g.restore();
  }

  function desenharAvisoBolaSalva(g: CanvasRenderingContext2D): void {
    if (!regras.luz('bolaSalva')) return;
    if (Math.floor(tempoGlobal * 6) % 2 === 0) return;
    g.save();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = 'rgba(6, 2, 16, 0.8)';
    g.fillRect(tabela.largura / 2 - 110, 180, 220, 34);
    g.fillStyle = '#22D3EE';
    g.fillText('BOLA SALVA', tabela.largura / 2, 197);
    g.restore();
  }

  return {
    iniciar() {
      if (destroyed) return;
      tempoGlobal = 0;
      tempoEstado = 0;
      regras.estado.fase = 'titulo';
      regras.estado.recorde = ctx.storage.lerRecorde(ctx.id);
      ctx.hud.definirEstado({
        pontuacao: 0,
        recorde: regras.estado.recorde,
        vidas: regras.estado.bolasPorPartida,
        fase: 1,
      });
      bola = null;
      prepararCamadaEstatica();
    },

    reiniciar() {
      if (destroyed) return;
      iniciarPartida();
    },

    pausar() {
      tabela.aoPausar?.();
    },

    retomar() {
      tabela.aoRetomar?.();
    },

    atualizar(dt: number, input: InputState) {
      if (destroyed) return;

      if (regras.estado.fase === 'titulo') {
        tempoGlobal += dt;
        if (input.acaoPressionada || input.acao2Pressionada) {
          iniciarPartida();
        }
        return;
      }

      if (regras.estado.fase === 'gameover') {
        tempoGlobal += dt;
        if (input.acaoPressionada) {
          iniciarPartida();
        }
        return;
      }

      if (regras.estado.fase === 'fimDeBola') {
        tempoGlobal += dt;
        atualizarFimDeBola(dt);
        return;
      }

      atualizarJogo(dt, input);
    },

    desenhar(g: CanvasRenderingContext2D) {
      if (destroyed) return;
      g.imageSmoothingEnabled = false;

      g.fillStyle = '#07030F';
      g.fillRect(0, 0, tabela.largura, tabela.altura);

      const tremorX = Math.sin(tempoGlobal * 70) * tremor * 5;
      const tremorY = Math.cos(tempoGlobal * 63) * tremor * 3;

      // Campo de jogo
      g.save();
      g.beginPath();
      g.rect(0, tabela.painelAltura, tabela.largura, tabela.altura - tabela.painelAltura);
      g.clip();
      g.translate(tremorX, tremorY);

      if (camadaEstatica) {
        g.drawImage(camadaEstatica, 0, 0);
      }

      // Camada animada (luzes, feixes, decoração que se move)
      tabela.desenharCenario?.(g, contextoDesenho());

      desenharParedes(g);
      desenharElementos(g);
      desenharFlippers(g);
      desenharBola(g);
      desenharDebug(g);
      g.restore();

      // Painel de placar
      g.save();
      tabela.desenharPainel?.(g, contextoDesenho());
      desenharPlacar(g, tabela, regras.estado, tempoGlobal);
      g.restore();

      desenharAvisoBolaSalva(g);

      if (regras.estado.fase === 'titulo') {
        desenharTitulo(g);
      } else if (regras.estado.fase === 'fimDeBola') {
        desenharBonus(g);
      } else if (regras.estado.fase === 'gameover') {
        ctx.hud.desenharGameOver(
          g,
          tabela.largura,
          tabela.altura,
          'PRESSIONE AÇÃO / TOQUE'
        );
      }
    },

    destruir() {
      destroyed = true;
      bola = null;
      ultimoImpacto = {};
      camadaEstatica = null;
      for (const estado of Object.values(estadosElementos)) {
        if (estado.tipo === 'spinner') estado.velocidade = 0;
      }
      tabela.aoDestruir?.();
    },
  };
}
