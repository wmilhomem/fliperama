/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Pause,
  Play,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Gamepad2,
  Crosshair,
  MoveHorizontal,
  Hand,
  Gauge,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { GameModule, GameInstance, EngineContext, InputState } from './types';
import { UnifiedInputManager } from './input';
import { RetroAudioEngine } from './audio';
import { RetroStorageService } from './storage';
import { StandardHUDManager } from './hud';
import { RetroGameLoop } from './loop';
import { collision } from './collision';
import { sprites } from './sprites';
import { PlatformConfig } from '../shared/types';
import { lerJogador } from '../shared/player';
import { NOVA_ENTRADA_TOUCH } from '../shared/constants';
import {
  EsquemaTouch,
  aoMudarEsquema,
  aoPedirDicaDeToque,
  dicaVistaDoJogo,
  esquemaDoJogo,
  lerControles,
  marcarDicaVista,
  salvarEsquema,
} from '../shared/controles';
import { GestureInputManager } from './gestures';
import { RetroHapticsService } from './haptics';

interface GameRunnerProps {
  modulo: GameModule;
  config: PlatformConfig;
  onVoltarAoHub: () => void;
  onAbrirAjuda: () => void;
  onAlternarSom: () => void;
}

export const GameRunner: React.FC<GameRunnerProps> = ({
  modulo,
  config,
  onVoltarAoHub,
  onAbrirAjuda,
  onAlternarSom,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [estaPausado, setEstaPausado] = useState(false);
  const [somLigado, setSomLigado] = useState(config.somAtivo);
  const [mostrarConfirmacaoReset, setMostrarConfirmacaoReset] = useState(false);
  const [dispositivoTouch, setDispositivoTouch] = useState(false);

  // Instâncias do motor
  const inputManagerRef = useRef<UnifiedInputManager>(new UnifiedInputManager());
  const audioRef = useRef<RetroAudioEngine>(new RetroAudioEngine(config.volume, !config.somAtivo));
  const storageRef = useRef<RetroStorageService>(new RetroStorageService());
  const hudRef = useRef<StandardHUDManager>(new StandardHUDManager());
  const gameInstanceRef = useRef<GameInstance | null>(null);
  const gameLoopRef = useRef<RetroGameLoop | null>(null);

  // Mantém os callbacks mais recentes acessíveis ao loop (evita closures obsoletas)
  const onVoltarAoHubRef = useRef(onVoltarAoHub);
  const onAlternarSomRef = useRef(onAlternarSom);
  onVoltarAoHubRef.current = onVoltarAoHub;
  onAlternarSomRef.current = onAlternarSom;

  // Detectar suporte a touch
  useEffect(() => {
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    setDispositivoTouch(isTouch);
  }, []);

  // Piloto de controles por gestos ("arrastar") — só para jogos com controleTouch
  const gestureRef = useRef<GestureInputManager>(new GestureInputManager());
  const hapticsRef = useRef(new RetroHapticsService());
  const faixaRef = useRef<HTMLDivElement | null>(null);
  const botaoAtirarRef = useRef<HTMLButtonElement | null>(null);
  const [esquemaTouch, setEsquemaTouch] = useState<EsquemaTouch>(() =>
    modulo.controleTouch
      ? esquemaDoJogo(modulo.id, modulo.controleTouch.padrao)
      : 'classico'
  );
  const [mostrarDica, setMostrarDica] = useState(false);
  const [faixaToqueX, setFaixaToqueX] = useState<number | null>(null);
  const [diagInfo, setDiagInfo] = useState(() => gestureRef.current.lerDiagnostico());

  const temControleTouch = Boolean(modulo.controleTouch) && NOVA_ENTRADA_TOUCH;
  const exibirArrastar =
    temControleTouch &&
    esquemaTouch === 'arrastar' &&
    (config.controlesTouch === 'sempre' || (config.controlesTouch === 'auto' && dispositivoTouch));
  const controlesDoJogo = lerControles();
  const canhotoAtivo = controlesDoJogo.canhoto;
  const modoTiroAtivo = controlesDoJogo.modoTiro;
  const diagnosticoAtivo = controlesDoJogo.diagnostico && temControleTouch;

  // Atualizar áudio caso config mude
  useEffect(() => {
    audioRef.current.definirMudo(!config.somAtivo);
    audioRef.current.definirVolume(config.volume);
    setSomLigado(config.somAtivo);
  }, [config.somAtivo, config.volume]);

  // Alternar o esquema de toque ao vivo (botão na barra, "?" ou Configurações)
  useEffect(() => {
    return aoMudarEsquema(() => {
      if (modulo.controleTouch) {
        setEsquemaTouch(esquemaDoJogo(modulo.id, modulo.controleTouch.padrao));
      }
      gestureRef.current.liberarTudo();
      inputManagerRef.current.limpar();
    });
  }, [modulo.id, modulo.controleTouch]);

  // Reabrir a dica de 3 segundos (botão "?" do jogo)
  useEffect(() => {
    return aoPedirDicaDeToque(() => {
      if (temControleTouch && exibirArrastar) setMostrarDica(true);
    });
  }, [temControleTouch, exibirArrastar]);

  // Registrar/desregistrar a faixa e o botão ATIRAR quando o esquema muda
  useEffect(() => {
    const g = gestureRef.current;
    g.definirLarguraLogica(modulo.largura);
    if (exibirArrastar) {
      g.registrarFaixa(faixaRef.current);
      g.registrarBotao(botaoAtirarRef.current);
    } else {
      g.liberarTudo();
      g.registrarFaixa(null);
      g.registrarBotao(null);
    }
  }, [exibirArrastar, modulo]);

  // Dica de primeiro uso: uma vez por aparelho e por jogo com controleTouch
  useEffect(() => {
    if (!exibirArrastar || !modulo.controleTouch) return;
    if (dicaVistaDoJogo(modulo.id)) return;
    setMostrarDica(true);
    marcarDicaVista(modulo.id);
  }, [exibirArrastar, modulo.id, modulo.controleTouch]);

  // Auto-esconder a dica após 3 segundos
  useEffect(() => {
    if (!mostrarDica) return;
    const id = window.setTimeout(() => setMostrarDica(false), 3000);
    return () => window.clearTimeout(id);
  }, [mostrarDica]);

  // Painel de diagnóstico (5 Hz) enquanto estiver ligado
  useEffect(() => {
    if (!diagnosticoAtivo) return;
    const id = window.setInterval(() => setDiagInfo(gestureRef.current.lerDiagnostico()), 200);
    return () => window.clearInterval(id);
  }, [diagnosticoAtivo]);

  // Ciclo de vida do jogo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Desativa suavização para pixel art perfeito
    ctx.imageSmoothingEnabled = false;

    // Inicializar input
    const input = inputManagerRef.current;
    input.definirTeclasExtras(modulo.teclasExtras ?? {});
    input.iniciar();

    // Inicializar HUD com recorde do jogo
    const recordeInicial = storageRef.current.lerRecorde(modulo.id);
    hudRef.current = new StandardHUDManager({
      pontuacao: 0,
      recorde: recordeInicial,
      vidas: 3,
      fase: 1,
    });

    // Criar EngineContext
    const engineCtx: EngineContext = {
      id: modulo.id,
      largura: modulo.largura,
      altura: modulo.altura,
      audio: audioRef.current,
      storage: storageRef.current,
      hud: hudRef.current,
      colisao: collision,
      sprites: sprites,
      haptics: hapticsRef.current,
      finalizarJogo: (motivo) => {
        if (motivo === 'gameOver') {
          audioRef.current.tocar('gameOver');
        } else {
          audioRef.current.tocar('vitoria');
        }
        const pontuacaoFinal = hudRef.current.obterEstado().pontuacao;
        const perfil = lerJogador();
        storageRef.current.salvarRecorde(modulo.id, pontuacaoFinal);
        storageRef.current.salvarPontuacaoHistorico(
          modulo.id,
          pontuacaoFinal,
          perfil?.nome ?? 'JOGADOR',
          perfil?.avatar
        );
      },
      solicitarPausa: () => {
        alternarPausa();
      },
      solicitarReinicio: () => {
        reiniciarPartida();
      },
      voltarAoHub: () => {
        onVoltarAoHubRef.current();
      },
    };

    // Criar e iniciar o jogo
    const jogo = modulo.criar(engineCtx);
    gameInstanceRef.current = jogo;
    jogo.iniciar();

    // Criar e iniciar o Game Loop
    const loop = new RetroGameLoop({
      atualizar: (dt: number) => {
        const base = input.obterEstado();
        const frame = gestureRef.current.lerFrame();
        const inputState: InputState = {
          ...base,
          acao: base.acao || frame.acao,
          acaoPressionada: base.acaoPressionada || frame.acaoPressionada,
          arrasteDX: frame.arrasteDX,
          arrastando: frame.arrastando,
        };

        // Atalhos de sistema universais (P pausa, R reset, M som, ESC hub)
        if (inputState.voltarPressionado) {
          onVoltarAoHubRef.current();
          return;
        }

        if (inputState.mudoPressionado) {
          alternarMudoLocal();
          return;
        }

        if (inputState.pausarPressionado) {
          alternarPausa();
          return;
        }

        if (inputState.reiniciarPressionado) {
          reiniciarPartida();
          return;
        }

        // Atualizar lógica do jogo
        hudRef.current.atualizarTextosFlutuantes(dt);
        jogo.atualizar(dt, inputState);
      },
      renderizar: () => {
        // Limpar tela de fundo do canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, modulo.largura, modulo.altura);

        // Desenhar cena do jogo
        jogo.desenhar(ctx);

        // Desenhar HUD compartilhado e overlays se aplicável
        if (gameLoopRef.current?.estaPausado()) {
          hudRef.current.desenharTelaPausa(ctx, modulo.largura, modulo.altura);
        }
      },
      aoMudarVisibilidade: (visivel: boolean) => {
        setEstaPausado(!visivel);
        gestureRef.current.liberarTudo();
        if (!visivel) {
          jogo.pausar();
        } else {
          jogo.retomar();
        }
      },
    });

    gameLoopRef.current = loop;
    loop.iniciar();

    // Cleanup completo ao desmontar
    return () => {
      loop.parar();
      jogo.destruir();
      input.parar();
      inputManagerRef.current.limpar();
      gestureRef.current.destruir();
      gameInstanceRef.current = null;
      gameLoopRef.current = null;
    };
  }, [modulo]);

  const alternarPausa = () => {
    const loop = gameLoopRef.current;
    const jogo = gameInstanceRef.current;
    if (!loop || !jogo) return;

    if (loop.estaPausado()) {
      loop.retomar();
      jogo.retomar();
      setEstaPausado(false);
    } else {
      loop.pausar();
      jogo.pausar();
      setEstaPausado(true);
    }
  };

  const reiniciarPartida = () => {
    audioRef.current.ativar();
    const jogo = gameInstanceRef.current;
    if (jogo) {
      jogo.reiniciar();
      if (gameLoopRef.current?.estaPausado()) {
        gameLoopRef.current.retomar();
      }
      setEstaPausado(false);
      setMostrarConfirmacaoReset(false);
    }
  };

  const alternarMudoLocal = () => {
    audioRef.current.ativar();
    onAlternarSomRef.current();
  };

  const alternarEsquemaTouch = () => {
    if (!modulo.controleTouch) return;
    const novo: EsquemaTouch = esquemaTouch === 'arrastar' ? 'classico' : 'arrastar';
    salvarEsquema(modulo.id, novo);
  };

  // Handlers para botões touch virtuais
  const handleTouchStart = (botao: keyof InputState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    audioRef.current.ativar();
    inputManagerRef.current.definirTouch(botao, true);
  };

  const handleTouchEnd = (botao: keyof InputState) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    inputManagerRef.current.definirTouch(botao, false);
  };

  // Ponteiros toques direto na tela do jogo (opcional, usado por pinball)
  const ponteirosTelaRef = useRef<Map<number, 'esquerda' | 'direita'>>(new Map());

  const acaoDoLado = (lado: 'esquerda' | 'direita'): keyof InputState | undefined => {
    const config = modulo.toqueTela;
    if (!config) return undefined;
    return lado === 'esquerda' ? config.esquerda : config.direita;
  };

  const handlePointerDownTela = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!modulo.toqueTela) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const lado: 'esquerda' | 'direita' =
      e.clientX - rect.left < rect.width / 2 ? 'esquerda' : 'direita';
    ponteirosTelaRef.current.set(e.pointerId, lado);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Captura de ponteiro é opcional em alguns navegadores
    }
    const acao = acaoDoLado(lado);
    if (acao) {
      audioRef.current.ativar();
      inputManagerRef.current.definirTouch(acao, true);
    }
  };

  const handlePointerUpTela = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!modulo.toqueTela) return;
    const lado = ponteirosTelaRef.current.get(e.pointerId);
    if (!lado) return;
    ponteirosTelaRef.current.delete(e.pointerId);
    // Só solta a ação quando não há outro ponteiro no mesmo lado
    let aindaPressionado = false;
    for (const valor of ponteirosTelaRef.current.values()) {
      if (valor === lado) aindaPressionado = true;
    }
    if (aindaPressionado) return;
    const acao = acaoDoLado(lado);
    if (acao) inputManagerRef.current.definirTouch(acao, false);
  };

  const exibirTouch =
    config.controlesTouch === 'sempre' ||
    (config.controlesTouch === 'auto' && dispositivoTouch);

  // Piloto "arrastar": posição da alça neon sob o dedo (relativa à faixa)
  const atualizarFaixaToque = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = faixaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setFaixaToqueX(Math.max(0, Math.min(rect.width, e.clientX - rect.left)));
  };

  const limparFaixaToque = () => setFaixaToqueX(null);

  const rotuloAcao = modulo.controleTouch?.acaoRotulo ?? 'ATIRAR';
  const temVertical = Boolean(modulo.controleTouch?.vertical);

  const botaoAcao = (
    <button
      ref={botaoAtirarRef}
      type="button"
      aria-label={rotuloAcao}
      className="flex flex-col items-center justify-center shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-red-600 active:bg-red-500 active:scale-95 border-2 border-red-400 shadow-[0_5px_0_#7f1d1d] active:shadow-none transition-all touch-none select-none"
      style={{ WebkitTouchCallout: 'none', overscrollBehavior: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {rotuloAcao === 'ACELERAR' ? (
        <Gauge className="w-6 h-6 text-white" />
      ) : (
        <Crosshair className="w-6 h-6 text-white" />
      )}
      <span className="text-[8px] font-bold text-white mt-0.5 tracking-widest">{rotuloAcao}</span>
    </button>
  );

  const botoesVerticais = (
    <div className="flex flex-col gap-1.5 shrink-0">
      <button
        type="button"
        aria-label="Acelerar"
        onTouchStart={handleTouchStart('cima')}
        onTouchEnd={handleTouchEnd('cima')}
        onMouseDown={handleTouchStart('cima')}
        onMouseUp={handleTouchEnd('cima')}
        onContextMenu={(e) => e.preventDefault()}
        className="w-14 h-14 rounded-xl bg-emerald-700/80 active:bg-emerald-500 border border-emerald-500/60 text-emerald-200 flex flex-col items-center justify-center touch-none select-none"
        style={{ WebkitTouchCallout: 'none', overscrollBehavior: 'none' }}
      >
        <ChevronUp className="w-5 h-5" />
        <span className="text-[6px] font-bold">ACELERAR</span>
      </button>
      <button
        type="button"
        aria-label="Frear"
        onTouchStart={handleTouchStart('baixo')}
        onTouchEnd={handleTouchEnd('baixo')}
        onMouseDown={handleTouchStart('baixo')}
        onMouseUp={handleTouchEnd('baixo')}
        onContextMenu={(e) => e.preventDefault()}
        className="w-14 h-14 rounded-xl bg-amber-700/80 active:bg-amber-500 border border-amber-500/60 text-amber-200 flex flex-col items-center justify-center touch-none select-none"
        style={{ WebkitTouchCallout: 'none', overscrollBehavior: 'none' }}
      >
        <ChevronDown className="w-5 h-5" />
        <span className="text-[6px] font-bold">FREAR</span>
      </button>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-between w-full h-full min-h-[92vh] select-none p-2 md:p-4 text-white font-arcade ${
        exibirArrastar ? 'overscroll-none' : ''
      }`}
      onClick={() => audioRef.current.ativar()}
    >
      {/* BARRA SUPERIOR DO FLIPERAMA */}
      <header className="w-full max-w-3xl flex items-center justify-between px-3 py-2 bg-slate-900/95 border border-red-950/80 rounded-lg shadow-xl mb-2 backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={onVoltarAoHub}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs transition-colors"
            title="Voltar ao catálogo de jogos (ESC)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[9px]">HUB</span>
          </button>

          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: modulo.corTema }}
            />
            <h2 className="text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase truncate max-w-[130px] sm:max-w-[200px]">
              {modulo.titulo}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {/* Botão Pausar / Continuar */}
          <button
            onClick={alternarPausa}
            title={estaPausado ? 'Continuar jogo (P)' : 'Pausar jogo (P)'}
            className={`p-1.5 rounded transition-colors ${
              estaPausado
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {estaPausado ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Botão Reiniciar */}
          <button
            onClick={() => setMostrarConfirmacaoReset(true)}
            title="Reiniciar jogo (R)"
            className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-600 text-slate-300 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[9px] hidden md:inline">RESET</span>
          </button>

          {/* Som */}
          <button
            onClick={alternarMudoLocal}
            title={somLigado ? 'Silenciar som (M)' : 'Ativar som (M)'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {somLigado ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            )}
          </button>

          {/* Alternar controle de toque (Arrastar / Botões na tela) — só em aparelhos de toque */}
          {temControleTouch && dispositivoTouch && (
            <button
              onClick={alternarEsquemaTouch}
              title="Alternar: Arrastar (novo) / Botões na tela (reserva)"
              aria-label="Alternar esquema de controle de toque"
              className={`p-1.5 rounded transition-colors ${
                esquemaTouch === 'arrastar'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/60'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Ajuda / Controles */}
          <button
            onClick={onAbrirAjuda}
            title="Ver controles e instruções"
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* DICA DE PRIMEIRO USO (piloto "arrastar") */}
      {mostrarDica && exibirArrastar && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 pointer-events-none bg-black/40">
          <div className="flex items-center gap-6 bg-slate-950/80 border border-cyan-500/60 rounded-2xl px-8 py-5 shadow-[0_0_35px_rgba(34,211,238,0.3)]">
            <Hand className="w-12 h-12 text-cyan-300 dica-arrastar" />
            <MoveHorizontal className="w-8 h-8 text-slate-300" />
            <div className="flex flex-col items-center">
              <Crosshair className="w-10 h-10 text-red-400 dica-atirar" />
              <span className="text-[7px] text-red-300 mt-1 tracking-widest">ATIRAR</span>
            </div>
          </div>
          <p className="text-[11px] text-white bg-black/75 border border-cyan-500/50 rounded-lg px-4 py-2 tracking-wide">
            Arraste para mover. Toque em {rotuloAcao}.
          </p>
        </div>
      )}

      {/* ÁREA CENTRAL DO GABINETE & CANVAS COM ESCALA NÍTIDA */}
      <main className="relative flex flex-col items-center justify-center w-full max-w-3xl flex-1 min-h-0">
        <div
          className="relative rounded-xl overflow-hidden p-2 md:p-3 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 shadow-[0_0_40px_rgba(239,68,68,0.25)] flex items-center justify-center max-w-full"
          style={{ borderColor: modulo.corTema }}
        >
          <canvas
            ref={canvasRef}
            width={modulo.largura}
            height={modulo.altura}
            style={{
              aspectRatio: `${modulo.largura}/${modulo.altura}`,
              ...(modulo.toqueTela ? { touchAction: 'none' } : {}),
            }}
            onPointerDown={modulo.toqueTela ? handlePointerDownTela : undefined}
            onPointerUp={modulo.toqueTela ? handlePointerUpTela : undefined}
            onPointerCancel={modulo.toqueTela ? handlePointerUpTela : undefined}
            className="pixelated w-auto max-w-full max-h-[64vh] sm:max-h-[72vh] md:max-h-[78vh] lg:max-h-[82vh] bg-black rounded shadow-2xl cursor-pointer"
          />

          {/* DIAGNÓSTICO DE TOQUE (Configurações > Avançado) */}
          {diagnosticoAtivo && exibirArrastar && (
            <div className="absolute top-1 left-1 z-30 pointer-events-none rounded-md border border-cyan-500/70 bg-black/85 p-1.5 text-[7px] font-mono text-cyan-200 leading-tight">
              <div className="font-bold text-cyan-300">DIAGN · {diagInfo.ponteiros.length} ponteiro(s)</div>
              {diagInfo.ponteiros.map((p) => (
                <div key={p.id}>
                  #{p.id} {p.zona === 'faixa' ? 'faixa' : 'botão'} x{p.x} y{p.y}
                </div>
              ))}
              <div>
                arrasteDX {diagInfo.arrasteDX.toFixed(1)}
                {diagInfo.arrastando ? ' (arrastando)' : ''}
              </div>
              <div>ATIRAR: {diagInfo.atirarHeld ? 'pressionado' : '—'}</div>
              <div>
                tiro: {diagInfo.modoTiro} · sens {diagInfo.sensibilidade}x
              </div>
              <div>
                latência ~{diagInfo.latenciaMs}ms · descartes {diagInfo.descartadas}
              </div>
            </div>
          )}

          {/* MODAL DE CONFIRMAÇÃO DE RESET */}
          {mostrarConfirmacaoReset && (
            <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-4 text-center rounded-lg backdrop-blur-sm">
              <div className="border border-red-500/60 bg-slate-950/90 p-5 rounded-lg max-w-xs shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                <RotateCcw className="w-8 h-8 text-red-500 mx-auto mb-2 animate-spin" />
                <h3 className="text-xs text-red-400 font-bold mb-2">REINICIAR PARTIDA?</h3>
                <p className="text-[9px] text-slate-300 leading-relaxed mb-4">
                  A pontuação da partida atual será reiniciada. O recorde salvo não será perdido.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={reiniciarPartida}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-[9px] font-bold shadow"
                  >
                    SIM, REINICIAR
                  </button>
                  <button
                    onClick={() => setMostrarConfirmacaoReset(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[9px]"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DICA DE TECLADO DESKTOP */}
        {!exibirTouch && (
          <div className="hidden md:flex items-center justify-center gap-6 mt-2 text-[9px] text-slate-400">
            <span>Setas / WASD: Mover</span>
            <span>Espaço: Pular / Ação</span>
            <span>P: Pausar</span>
            <span>R: Reiniciar</span>
            <span>ESC: Hub</span>
          </div>
        )}
      </main>

      {/* CONTROLES POR GESTOS — piloto "arrastar" (exclusivo para mobile) */}
      {exibirArrastar && (
        <footer className="w-full max-w-3xl flex items-center gap-4 mt-2 px-6 py-2 z-20">
          {canhotoAtivo && botaoAcao}
          {canhotoAtivo && temVertical && botoesVerticais}

          {/* Faixa de arrasto */}
          <div
            ref={faixaRef}
            role="slider"
            aria-label="Faixa de arrasto: arraste para mover"
            className="relative flex-1 h-14 rounded-full bg-slate-900/90 border border-slate-700 shadow-inner touch-none select-none"
            style={{ WebkitTouchCallout: 'none', overscrollBehavior: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={atualizarFaixaToque}
            onPointerMove={(e) => {
              if (e.buttons) atualizarFaixaToque(e);
            }}
            onPointerUp={limparFaixaToque}
            onPointerCancel={limparFaixaToque}
            onPointerLeave={limparFaixaToque}
          >
            {/* Trilho */}
            <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-slate-700/80" />
            <MoveHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            <MoveHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            {/* Alça neon sob o dedo */}
            {faixaToqueX !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-cyan-300 bg-cyan-400/25 shadow-[0_0_16px_rgba(34,211,238,0.8)]"
                style={{ left: faixaToqueX }}
              />
            )}
          </div>

          {!canhotoAtivo && temVertical && botoesVerticais}
          {!canhotoAtivo && botaoAcao}
        </footer>
      )}

      {/* CONTROLES TOUCH VIRTUAIS RESPONSIVOS PARA CELULAR */}
      {exibirTouch && !exibirArrastar && (
        <footer className="w-full max-w-xl grid grid-cols-2 gap-4 mt-2 px-3 py-2 z-20">
          {/* D-PAD VIRTUAL */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 bg-slate-900/90 rounded-full border-2 border-slate-700 shadow-xl flex items-center justify-center">
              {/* Botão Cima */}
              <button
                onTouchStart={handleTouchStart('cima')}
                onTouchEnd={handleTouchEnd('cima')}
                onMouseDown={handleTouchStart('cima')}
                onMouseUp={handleTouchEnd('cima')}
                className="absolute top-1 w-10 h-10 bg-slate-800 active:bg-red-600 active:scale-95 text-slate-300 rounded-t-lg flex items-center justify-center border border-slate-700"
              >
                <ArrowUp className="w-5 h-5" />
              </button>

              {/* Botão Baixo */}
              <button
                onTouchStart={handleTouchStart('baixo')}
                onTouchEnd={handleTouchEnd('baixo')}
                onMouseDown={handleTouchStart('baixo')}
                onMouseUp={handleTouchEnd('baixo')}
                className="absolute bottom-1 w-10 h-10 bg-slate-800 active:bg-red-600 active:scale-95 text-slate-300 rounded-b-lg flex items-center justify-center border border-slate-700"
              >
                <ArrowDown className="w-5 h-5" />
              </button>

              {/* Botão Esquerda */}
              <button
                onTouchStart={handleTouchStart('esquerda')}
                onTouchEnd={handleTouchEnd('esquerda')}
                onMouseDown={handleTouchStart('esquerda')}
                onMouseUp={handleTouchEnd('esquerda')}
                className="absolute left-1 w-10 h-10 bg-slate-800 active:bg-red-600 active:scale-95 text-slate-300 rounded-l-lg flex items-center justify-center border border-slate-700"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>

              {/* Botão Direita */}
              <button
                onTouchStart={handleTouchStart('direita')}
                onTouchEnd={handleTouchEnd('direita')}
                onMouseDown={handleTouchStart('direita')}
                onMouseUp={handleTouchEnd('direita')}
                className="absolute right-1 w-10 h-10 bg-slate-800 active:bg-red-600 active:scale-95 text-slate-300 rounded-r-lg flex items-center justify-center border border-slate-700"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>

              {/* Centro do D-Pad */}
              <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700" />
            </div>
          </div>

          {/* BOTÕES DE AÇÃO A e B */}
          <div className="flex items-center justify-center gap-4">
            {/* Botão B (Ação Secundária) */}
            <div className="flex flex-col items-center">
              <button
                onTouchStart={handleTouchStart('acao2')}
                onTouchEnd={handleTouchEnd('acao2')}
                onMouseDown={handleTouchStart('acao2')}
                onMouseUp={handleTouchEnd('acao2')}
                className="w-14 h-14 rounded-full bg-amber-600 active:bg-amber-400 active:scale-90 text-white font-bold text-sm shadow-[0_4px_0_#b45309] border border-amber-300 flex items-center justify-center transition-transform"
              >
                B
              </button>
              <span className="text-[8px] text-slate-400 mt-1">GOLPE</span>
            </div>

            {/* Botão A (Pular / Ação Primária) */}
            <div className="flex flex-col items-center">
              <button
                onTouchStart={handleTouchStart('acao')}
                onTouchEnd={handleTouchEnd('acao')}
                onMouseDown={handleTouchStart('acao')}
                onMouseUp={handleTouchEnd('acao')}
                className="w-16 h-16 rounded-full bg-red-600 active:bg-red-400 active:scale-90 text-white font-bold text-base shadow-[0_5px_0_#991b1b] border border-red-300 flex items-center justify-center transition-transform"
              >
                A
              </button>
              <span className="text-[8px] text-red-400 mt-1 font-bold">PULAR</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
