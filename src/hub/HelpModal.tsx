/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Gamepad2, Award, Info, Keyboard } from 'lucide-react';
import { GameModule } from '../engine/types';

interface HelpModalProps {
  jogo?: GameModule;
  onFechar: () => void;
}

const CONTROLES_PADRAO = [
  'Setas / WASD / D-Pad: Mover o personagem',
  'Espaço / Tecla Z / Botão A: Ação principal / Pular',
  'Shift / Tecla X / Botão B: Ação secundária',
];

const CONTROLES_SISTEMA = [
  'Tecla P: Pausar / Continuar',
  'Tecla R: Reiniciar partida',
  'Tecla M: Ligar / desligar som',
  'Tecla ESC: Voltar ao catálogo (Hub)',
];

const chaveDoControle = (linha: string): string => {
  const separador = linha.indexOf(':');
  return (separador === -1 ? linha : linha.slice(0, separador)).trim().toLowerCase();
};

export const HelpModal: React.FC<HelpModalProps> = ({ jogo, onFechar }) => {
  const controlesDoJogo = jogo?.instrucoes?.controles;
  const controlesBase =
    controlesDoJogo && controlesDoJogo.length > 0 ? controlesDoJogo : CONTROLES_PADRAO;

  const chavesExistentes = new Set(controlesBase.map(chaveDoControle));
  const controlesCompletos = [
    ...controlesBase,
    ...CONTROLES_SISTEMA.filter((c) => !chavesExistentes.has(chaveDoControle(c))),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-sm font-arcade text-white">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-950 border-2 border-red-700/80 rounded-2xl p-5 shadow-[0_0_35px_rgba(239,68,68,0.3)]">
        {/* BOTÃO FECHAR */}
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* TÍTULO */}
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="w-5 h-5 text-red-500" />
          <h2 className="text-sm md:text-base font-bold text-red-400">
            {jogo ? `GUIA: ${jogo.titulo.toUpperCase()}` : 'MANUAL DO FLIPERAMA'}
          </h2>
        </div>

        {/* HISTÓRIA SE HOUVER */}
        {jogo?.instrucoes?.historia && (
          <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Info className="w-3.5 h-3.5" />
              HISTÓRIA & MISSÃO
            </h3>
            <p className="text-[9px] text-slate-300 leading-relaxed">
              {jogo.instrucoes.historia}
            </p>
          </div>
        )}

        {/* TABELA DE CONTROLES */}
        <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
          <h3 className="text-[10px] font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
            <Keyboard className="w-3.5 h-3.5" />
            CONTROLES DO TECLADO & CELULAR
          </h3>

          <div className="space-y-1.5 text-[9px]">
            {controlesCompletos.map((linha, idx) => {
              const separador = linha.indexOf(':');

              if (separador === -1) {
                return (
                  <div key={idx} className="text-slate-300 border-b border-slate-800/80 pb-1 last:border-0">
                    {linha}
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="flex justify-between gap-3 border-b border-slate-800/80 pb-1 last:border-0"
                >
                  <span className="text-slate-400">{linha.slice(0, separador + 1)}</span>
                  <span className="text-white font-bold text-right">
                    {linha.slice(separador + 1).trim()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABELA DE PONTOS */}
        {jogo?.instrucoes?.pontos && (
          <div className="mb-5 p-3 rounded-lg bg-slate-900 border border-slate-800">
            <h3 className="text-[10px] font-bold text-yellow-400 flex items-center gap-1.5 mb-2">
              <Award className="w-3.5 h-3.5" />
              TABELA DE PONTOS
            </h3>
            <div className="space-y-1 text-[9px]">
              {jogo.instrucoes.pontos.map((p, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-300">{p.acao}</span>
                  <span className="text-yellow-400 font-bold tabular-nums">+{p.pontos} PTS</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTÃO ENTENDI */}
        <button
          onClick={onFechar}
          className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg transition-transform active:scale-95 border border-red-400"
        >
          OK, VOLTAR AO JOGO
        </button>
      </div>
    </div>
  );
};
