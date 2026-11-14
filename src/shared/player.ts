/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Jogador local do Fliperama.
 * Perguntado uma única vez (primeiro acesso) e salvo no localStorage;
 * usado para assinar as pontuações do histórico. Pode ser trocado em Ajustes.
 */

import { AVATAR_PADRAO, AVATARES, NOME_PADRAO, STORAGE_KEYS } from './constants';
import { PlayerProfile } from './types';

const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9 _\-]{1,12}$/;

export function sanitizarNome(nome: string): string {
  const limpo = nome.trim().replace(/\s+/g, ' ');
  if (REGEX_NOME.test(limpo)) return limpo.toUpperCase();
  return NOME_PADRAO;
}

export function sanitizarAvatar(avatar: string): string {
  return AVATARES.includes(avatar) ? avatar : AVATAR_PADRAO;
}

/** Perfil salvo no navegador (null se ainda não foi perguntado). */
export function lerJogador(): PlayerProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      nome: sanitizarNome(String(parsed.nome ?? '')),
      avatar: sanitizarAvatar(String(parsed.avatar ?? '')),
    };
  } catch {
    return null;
  }
}

export function salvarJogador(perfil: PlayerProfile): PlayerProfile {
  const limpo: PlayerProfile = {
    nome: sanitizarNome(perfil.nome),
    avatar: sanitizarAvatar(perfil.avatar),
  };
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(limpo));
  } catch {
    // Quota/modo anônimo: mantém o perfil em memória para a sessão
  }
  return limpo;
}

export function limparJogador(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLAYER);
  } catch {
    // ignore
  }
}
