/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STORAGE_KEYS } from '../shared/constants';
import { StorageService } from './types';

/**
 * Serviço de persistência de recordes e ranking local.
 * Garante pontuações inteiras (sempre Math.floor) e compatibilidade com versões legadas.
 */
export class RetroStorageService implements StorageService {
  private recordsCache: Record<string, number> = {};

  constructor() {
    this.carregarCache();
  }

  private carregarCache(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.entries(parsed).forEach(([key, val]) => {
            const num = typeof val === 'number' ? val : parseFloat(String(val));
            if (Number.isFinite(num)) {
              this.recordsCache[key] = Math.floor(num);
            }
          });
        }
      }

      // Migração de chaves legadas se aplicável
      if (!this.recordsCache['hannah']) {
        const legacyHannah = localStorage.getItem(STORAGE_KEYS.LEGACY_HANNAH) || localStorage.getItem(STORAGE_KEYS.LEGACY_LIA);
        if (legacyHannah) {
          const parsed = parseFloat(legacyHannah);
          if (Number.isFinite(parsed)) {
            this.recordsCache['hannah'] = Math.floor(parsed);
            this.persistirCache();
          }
        }
      }
    } catch {
      // Ignora falhas de parse de localStorage
    }
  }

  private persistirCache(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(this.recordsCache));
    } catch {
      // Quota excedida ou modo anônimo estrito
    }
  }

  salvarRecorde(jogoId: string, pontuacao: number): boolean {
    const pontuacaoInt = Math.floor(pontuacao);
    const atual = this.lerRecorde(jogoId);

    if (pontuacaoInt > atual) {
      this.recordsCache[jogoId] = pontuacaoInt;
      this.persistirCache();

      // Se for hannah, sincroniza também com chave legada para retrocompatibilidade
      if (jogoId === 'hannah' && typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.LEGACY_HANNAH, pontuacaoInt.toString());
        } catch {
          // ignore
        }
      }

      return true;
    }

    return false;
  }

  lerRecorde(jogoId: string): number {
    if (this.recordsCache[jogoId] !== undefined) {
      return Math.floor(this.recordsCache[jogoId]);
    }

    if (typeof window !== 'undefined') {
      try {
        if (jogoId === 'hannah') {
          const legacy = localStorage.getItem(STORAGE_KEYS.LEGACY_HANNAH) || localStorage.getItem(STORAGE_KEYS.LEGACY_LIA);
          if (legacy) {
            const parsed = parseFloat(legacy);
            if (Number.isFinite(parsed)) {
              const intVal = Math.floor(parsed);
              this.recordsCache['hannah'] = intVal;
              return intVal;
            }
          }
        }
      } catch {
        // ignore
      }
    }

    return 0;
  }

  listarRanking(): Record<string, number> {
    const copia: Record<string, number> = {};
    Object.entries(this.recordsCache).forEach(([k, v]) => {
      copia[k] = Math.floor(v);
    });
    return copia;
  }

  salvarPontuacaoHistorico(jogoId: string, pontuacao: number, nome = 'JOGADOR', avatar?: string): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCORES_HISTORY);
      const historico = raw ? JSON.parse(raw) : [];
      historico.unshift({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        jogoId,
        pontuacao: Math.floor(pontuacao),
        nome,
        ...(avatar ? { avatar } : {}),
        data: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      // Manter últimos 50 registros
      const limitado = historico.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.SCORES_HISTORY, JSON.stringify(limitado));
    } catch {
      // ignore
    }
  }

  limparDados(): void {
    this.recordsCache = {};
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.RECORDS);
      localStorage.removeItem(STORAGE_KEYS.SCORES_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_HANNAH);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_LIA);
    } catch {
      // ignore
    }
  }
}
