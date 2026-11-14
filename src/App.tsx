/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { GameRunner } from './engine/GameRunner';
import { RetroStorageService } from './engine/storage';
import { JOGOS, obterJogoPorId } from './registry';
import { DEFAULT_PLATFORM_CONFIG, STORAGE_KEYS } from './shared/constants';
import { PlatformConfig, PlatformView } from './shared/types';
import { CatalogView } from './hub/CatalogView';
import { HelpModal } from './hub/HelpModal';
import { HubHeader } from './hub/HubHeader';
import { RankingView } from './hub/RankingView';
import { SettingsView } from './hub/SettingsView';

export default function App() {
  const [visao, setVisao] = useState<PlatformView>('hub');
  const [jogoAtivoId, setJogoAtivoId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Configurações do Fliperama
  const [config, setConfig] = useState<PlatformConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_PLATFORM_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? { ...DEFAULT_PLATFORM_CONFIG, ...JSON.parse(saved) } : DEFAULT_PLATFORM_CONFIG;
    } catch {
      return DEFAULT_PLATFORM_CONFIG;
    }
  });

  // Recordes salvos
  const [recordes, setRecordes] = useState<Record<string, number>>({});

  const atualizarRecordes = () => {
    const storage = new RetroStorageService();
    setRecordes(storage.listarRanking());
  };

  useEffect(() => {
    atualizarRecordes();
  }, [visao]);

  const salvarConfig = (novaConfig: PlatformConfig) => {
    setConfig(novaConfig);
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(novaConfig));
    } catch {
      // ignore
    }
  };

  const handleAlternarCRT = () => {
    salvarConfig({ ...config, efeitoCRT: !config.efeitoCRT });
  };

  const handleAlternarSom = () => {
    salvarConfig({ ...config, somAtivo: !config.somAtivo });
  };

  const handleSelecionarJogo = (id: string) => {
    setJogoAtivoId(id);
    setVisao('jogo');
  };

  const handleVoltarAoHub = () => {
    setJogoAtivoId(null);
    setVisao('hub');
    atualizarRecordes();
  };

  const jogoAtivo = jogoAtivoId ? obterJogoPorId(jogoAtivoId) : null;

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-between p-2 md:p-4 select-none overflow-x-hidden font-arcade">
      {/* SE ESTIVER JOGANDO: RENDERIZA O RUNNER DO MOTOR */}
      {visao === 'jogo' && jogoAtivo ? (
        <GameRunner
          modulo={jogoAtivo}
          config={config}
          onVoltarAoHub={handleVoltarAoHub}
          onAbrirAjuda={() => setShowHelp(true)}
          onAlternarCRT={handleAlternarCRT}
          onAlternarSom={handleAlternarSom}
        />
      ) : (
        /* SE ESTIVER NO HUB: RENDERIZA AS TELAS DA PLATAFORMA */
        <div className="w-full flex flex-col items-center flex-1 max-w-5xl">
          <HubHeader
            visaoAtual={visao}
            onMudarVisao={(v) => setVisao(v)}
            config={config}
            onAlternarCRT={handleAlternarCRT}
            onAlternarSom={handleAlternarSom}
          />

          <main className="w-full flex-1 flex flex-col items-center justify-start py-2">
            {visao === 'hub' && (
              <CatalogView
                jogos={JOGOS}
                recordes={recordes}
                onSelecionarJogo={handleSelecionarJogo}
              />
            )}

            {visao === 'ranking' && (
              <RankingView
                jogos={JOGOS}
                onVoltarAoHub={() => setVisao('hub')}
                onSelecionarJogo={handleSelecionarJogo}
              />
            )}

            {visao === 'configuracoes' && (
              <SettingsView
                config={config}
                onSalvarConfig={salvarConfig}
                onVoltarAoHub={() => setVisao('hub')}
              />
            )}
          </main>

          {/* RODAPÉ DO FLIPERAMA */}
          <footer className="w-full text-center py-4 mt-6 border-t border-slate-900 text-slate-500 text-[9px] flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>FLIPERAMA ARCADE RETRÔ © 1984 - 2026</span>
            <span>MOTOR DE JOGOS 100% RETRÔ EM CANVAS 2D & WEB AUDIO API</span>
          </footer>
        </div>
      )}

      {/* MODAL DE AJUDA E CONTROLES */}
      {showHelp && (
        <HelpModal
          jogo={jogoAtivo || undefined}
          onFechar={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}
