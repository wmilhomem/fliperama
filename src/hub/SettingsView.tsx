/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Volume2, Smartphone, Trash2, ArrowLeft, Check, AlertTriangle, UserRound } from 'lucide-react';
import { PlatformConfig } from '../shared/types';
import { RetroStorageService } from '../engine/storage';
import { lerJogador, limparJogador } from '../shared/player';

interface SettingsViewProps {
  config: PlatformConfig;
  onSalvarConfig: (novaConfig: PlatformConfig) => void;
  onVoltarAoHub: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSalvarConfig,
  onVoltarAoHub,
}) => {
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const jogador = lerJogador();

  const handleTrocarJogador = () => {
    limparJogador();
    window.location.reload();
  };

  const atualizar = <K extends keyof PlatformConfig>(chave: K, valor: PlatformConfig[K]) => {
    const nova = { ...config, [chave]: valor };
    onSalvarConfig(nova);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 1500);
  };

  const handleLimparDados = () => {
    const storage = new RetroStorageService();
    storage.limparDados();
    setMostrarConfirmacaoLimpar(false);
    alert('Todos os recordes e dados locais foram limpos com sucesso!');
    window.location.reload();
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6 font-arcade text-white">
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <button
          onClick={onVoltarAoHub}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
          <span>VOLTAR AO CATÁLOGO</span>
        </button>

        <div className="flex items-center gap-2 text-cyan-400">
          <Settings className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <h2 className="text-sm md:text-base font-bold tracking-wider">
            CONFIGURAÇÕES DO FLIPERAMA
          </h2>
        </div>
      </div>

      {salvoFeedback && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-600 rounded-lg text-emerald-400 text-xs">
          <Check className="w-4 h-4" />
          <span>Configuração atualizada com sucesso!</span>
        </div>
      )}

      {/* PAINEL DE OPÇÕES */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl divide-y divide-slate-800">
        {/* JOGADOR ATUAL */}
        <div className="py-4 first:pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                {jogador?.avatar ?? '👾'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">JOGADOR ATUAL</h3>
                <p className="text-[9px] text-slate-400">{jogador?.nome ?? 'Sem nome'} — assina suas pontuações no ranking</p>
              </div>
            </div>
            <button
              onClick={handleTrocarJogador}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800 transition-colors"
            >
              <UserRound className="w-3.5 h-3.5" />
              TROCAR JOGADOR
            </button>
          </div>
        </div>

        {/* ÁUDIO E VOLUME */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold text-white">ÁUDIO E EFEITOS SONOROS</h3>
                <p className="text-[9px] text-slate-400">Web Audio API sintetizada sem arquivos externos</p>
              </div>
            </div>
            <button
              onClick={() => atualizar('somAtivo', !config.somAtivo)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-colors ${
                config.somAtivo
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {config.somAtivo ? 'ATIVADO' : 'MUTADO'}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-[9px] text-slate-400 w-16">VOLUME:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.volume}
              onChange={(e) => atualizar('volume', parseFloat(e.target.value))}
              disabled={!config.somAtivo}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-emerald-400 w-12 text-right tabular-nums">
              {Math.round(config.volume * 100)}%
            </span>
          </div>
        </div>

        {/* CONTROLES TOUCH NA TELA */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-xs font-bold text-white">BOTÕES TOUCH PARA CELULAR</h3>
                <p className="text-[9px] text-slate-400">Exibir D-Pad e botões de ação na tela</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {(['auto', 'sempre', 'nunca'] as const).map((modo) => (
              <button
                key={modo}
                onClick={() => atualizar('controlesTouch', modo)}
                className={`py-2 px-3 rounded text-[9px] uppercase font-bold border text-center transition-all ${
                  config.controlesTouch === modo
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {modo === 'auto' ? 'Automático (Mobile)' : modo === 'sempre' ? 'Sempre Visível' : 'Nunca'}
              </button>
            ))}
          </div>
        </div>

        {/* LIMPAR DADOS */}
        <div className="py-4 last:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="text-xs font-bold text-red-400">ZONAR DADOS E RECORDES</h3>
                <p className="text-[9px] text-slate-400">Remove todos os recordes locais salvos no navegador</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarConfirmacaoLimpar(true)}
              className="px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800 text-[10px] font-bold transition-colors"
            >
              LIMPAR DADOS
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE LIMPEZA */}
      {mostrarConfirmacaoLimpar && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-950 border border-red-700 p-6 rounded-2xl max-w-sm text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-red-400 mb-2">APAGAR TODOS OS RECORDES?</h3>
            <p className="text-[10px] text-slate-300 leading-relaxed mb-5">
              Esta ação não pode ser desfeita. Todos os recordes locais de todos os jogos serão redefinidos para zero.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleLimparDados}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded text-xs shadow"
              >
                SIM, APAGAR TUDO
              </button>
              <button
                onClick={() => setMostrarConfirmacaoLimpar(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
