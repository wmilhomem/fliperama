/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gamepad2, Trophy, Settings, Volume2, VolumeX } from 'lucide-react';
import { PlatformView, PlatformConfig } from '../shared/types';
import { PLATFORM_NAME } from '../shared/constants';
import { PWAInstallButton } from './PWAInstallButton';

interface HubHeaderProps {
  visaoAtual: PlatformView;
  onMudarVisao: (visao: PlatformView) => void;
  config: PlatformConfig;
  onAlternarSom: () => void;
}

export const HubHeader: React.FC<HubHeaderProps> = ({
  visaoAtual,
  onMudarVisao,
  config,
  onAlternarSom,
}) => {
  return (
    <header className="w-full max-w-5xl px-3 py-3 mb-4 bg-slate-950/85 border-b-2 border-red-700/80 shadow-[0_4px_30px_rgba(239,68,68,0.25)] rounded-b-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3 font-arcade">
      {/* LOGO E LETREIRO NEON */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onMudarVisao('hub')}
      >
        <div className="relative w-8 h-8 md:w-9 md:h-9 bg-red-600 rounded-lg flex items-center justify-center border-2 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.7)] group-hover:scale-105 transition-transform">
          <Gamepad2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
        </div>
        <div>
          <h1 className="text-base md:text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-cyan-400 drop-shadow-[0_2px_8px_rgba(239,68,68,0.6)]">
            {PLATFORM_NAME}
          </h1>
          <p className="text-[8px] md:text-[9px] text-slate-400 tracking-wider">
            GABINETE RETRÔ DOS ANOS 80
          </p>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE TELAS DO HUB */}
      <nav className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={() => onMudarVisao('hub')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-xs transition-all ${
            visaoAtual === 'hub'
              ? 'bg-red-600/90 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] border border-red-400 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>JOGOS</span>
        </button>

        <button
          onClick={() => onMudarVisao('ranking')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-xs transition-all ${
            visaoAtual === 'ranking'
              ? 'bg-amber-500/90 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-300 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>RANKING</span>
        </button>

        <button
          onClick={() => onMudarVisao('configuracoes')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-xs transition-all ${
            visaoAtual === 'configuracoes'
              ? 'bg-cyan-600/90 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-400 font-bold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>AJUSTES</span>
        </button>
      </nav>

      {/* AÇÕES GLOBAIS (PWA, SOM) */}
      <div className="flex items-center gap-2">
        <PWAInstallButton />

        <button
          onClick={onAlternarSom}
          title={config.somAtivo ? 'Silenciar som global' : 'Ativar som global'}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          {config.somAtivo ? (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          )}
        </button>
      </div>
    </header>
  );
};
