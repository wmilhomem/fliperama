/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameCard } from './GameCard';
import { GameModule } from '../engine/types';
import { Sparkles } from 'lucide-react';

interface CatalogViewProps {
  jogos: GameModule[];
  recordes: Record<string, number>;
  onSelecionarJogo: (id: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  jogos,
  recordes,
  onSelecionarJogo,
}) => {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-6 font-arcade">
      {/* BANNER RETRÔ DE BOAS-VINDAS */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-red-950/70 via-slate-900 to-cyan-950/60 border-2 border-red-800/80 shadow-[0_0_35px_rgba(239,68,68,0.25)]">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 text-[9px] mb-3">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            CATÁLOGO OFICIAL DE FLIPERAMAS
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide mb-2">
            ESCOLHA UMA MÁQUINA E COMECE
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Plataforma 100% brasileira de clássicos dos anos 80. Todos os jogos contam com recordes salvos, suporte a toque para celular e controle unificado.
          </p>
        </div>

        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />
      </div>

      {/* SEÇÃO DE JOGOS DISPONÍVEIS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm animate-pulse" />
            <h3 className="text-xs md:text-sm font-bold text-red-400 tracking-wider">
              MÁQUINAS DISPONÍVEIS ({jogos.length})
            </h3>
          </div>
          <span className="text-[9px] text-slate-400">SELECIONE PARA JOGAR</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jogos.map((jogo) => (
            <GameCard
              key={jogo.id}
              jogo={jogo}              recorde={recordes[jogo.id] || 0}
              onJogar={onSelecionarJogo}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
