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
  Tv,
  HelpCircle,
  Pause,
  Play,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Gamepad2,
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

interface GameRunnerProps {
  modulo: GameModule;
  config: PlatformConfig;
  onVoltarAoHub: () => void;
  onAbrirAjuda: () => void;
  onAlternarCRT: () => void;
  onAlternarSom: () => void;
}

export const GameRunner: React.FC<GameRunnerProps> = ({
  modulo,
  config,
  onVoltarAoHub,
  onAbrirAjuda,
  onAlternarCRT,
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

  // Atualizar áudio caso config mude
  useEffect(() => {
    audioRef.current.definirMudo(!config.somAtivo);
    audioRef.current.definirVolume(config.volume);
    setSomLigado(config.somAtivo);
  }, [config.somAtivo, config.volume]);

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
      finalizarJogo: (motivo) => {
        if (motivo === 'gameOver') {
          audioRef.current.tocar('gameOver');
        } else {
          audioRef.current.tocar('vitoria');
        }
        const pontuacaoFinal = hudRef.current.obterEstado().pontuacao;
        storageRef.current.salvarRecorde(modulo.id, pontuacaoFinal);
        storageRef.current.salvarPontuacaoHistorico(modulo.id, pontuacaoFinal);
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
        const inputState: InputState = input.obterEstado();

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

  const exibirTouch =
    config.controlesTouch === 'sempre' ||
    (config.controlesTouch === 'auto' && dispositivoTouch);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-between w-full h-full min-h-[92vh] select-none p-2 md:p-4 text-white font-arcade"
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

          {/* Efeito CRT */}
          <button
            onClick={onAlternarCRT}
            title="Alternar efeito retrô CRT"
            className={`p-1.5 rounded transition-colors ${
              config.efeitoCRT
                ? 'bg-amber-600/30 text-amber-400 border border-amber-600/50'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
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

      {/* ÁREA CENTRAL DO GABINETE & CANVAS COM ESCALA NÍTIDA */}
      <main className="relative flex flex-col items-center justify-center w-full max-w-3xl flex-1 min-h-0">
        <div
          className="relative rounded-xl overflow-hidden p-2 md:p-3 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 shadow-[0_0_40px_rgba(239,68,68,0.25)] flex items-center justify-center max-w-full"
          style={{ borderColor: modulo.corTema }}
        >
          {config.efeitoCRT && (
            <div className="absolute inset-0 crt-overlay z-10 pointer-events-none rounded-lg" />
          )}

          <canvas
            ref={canvasRef}
            width={modulo.largura}
            height={modulo.altura}
            style={{
              aspectRatio: `${modulo.largura}/${modulo.altura}`,
            }}
            className="pixelated w-auto max-w-full max-h-[64vh] sm:max-h-[72vh] md:max-h-[78vh] lg:max-h-[82vh] bg-black rounded shadow-2xl cursor-pointer"
          />

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

      {/* CONTROLES TOUCH VIRTUAIS RESPONSIVOS PARA CELULAR */}
      {exibirTouch && (
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
