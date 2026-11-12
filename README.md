# Fliperama

Plataforma de jogos arcade retrô dos anos 80, feita em React + Canvas 2D, com controles de teclado, gamepad e toque, efeitos sonoros sintetizados via Web Audio API e recordes salvos localmente. Funciona como PWA instalável em desktop e celular.

## Jogos disponíveis

- **Salve a Hannah** (`src/games/hannah`): plataforma estilo arcade clássico. Suba as vigas, desvie dos barris e resgate Hannah do Grotão.
- **Tatu no Labirinto** (`src/games/tatu`): labirinto com coleta de sementes, pimentas de poder e quatro sombras com IA própria.
- **Retro Orb** (`src/games/_modelo`): jogo-modelo que também serve de template para criar novas máquinas.

## Requisitos

- Node.js 20+ (ou Bun)
- npm, pnpm ou bun

## Rodando localmente

```bash
npm install
npm run dev
```

O servidor de desenvolvimento abre em `http://localhost:3000`.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o Vite em modo desenvolvimento na porta 3000 |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Executa a verificação de tipos (`tsc --noEmit`) |
| `npm run clean` | Remove `dist` e `server.js` |

## Estrutura

```text
src/
  App.tsx              # Navegação entre hub, jogo, ranking e ajustes
  registry.ts          # Registro central de jogos
  engine/              # Motor compartilhado (loop, input, áudio, HUD, storage, colisão, sprites)
  games/               # Jogos registrados na plataforma
  hub/                 # Catálogo, ranking, configurações, ajuda e instalação PWA
  shared/              # Tipos e constantes compartilhadas
```

## Como adicionar um jogo

1. Crie `src/games/seu_jogo/index.ts` exportando um `GameModule` (contrato em `src/engine/types.ts`).
2. Implemente `criar(ctx: EngineContext): GameInstance` com `iniciar`, `atualizar`, `desenhar`, `pausar`, `retomar`, `reiniciar` e `destruir`.
3. Registre o módulo no array `JOGOS` em `src/registry.ts`.

O motor entrega automaticamente HUD, recordes, áudio, pausa, controles unificados, efeito CRT e interface do gabinete.

## Controles

- **Setas / WASD / D-Pad**: mover
- **Espaço / Z / Enter / Botão A**: ação principal / pular
- **Shift / X / Botão B**: ação secundária
- **P**: pausar / continuar
- **R**: reiniciar partida
- **M**: ligar / desligar som
- **ESC**: voltar ao catálogo

Em dispositivos com toque, o D-Pad e os botões A/B são exibidos automaticamente (configurável em Ajustes).

## Persistência

Recordes e o histórico das últimas 50 partidas ficam no `localStorage`. A opção **Limpar dados** em Ajustes remove tudo. A chave legada de recorde da Hannah é migrada automaticamente.

## PWA

O projeto usa `vite-plugin-pwa` para gerar o manifest e o service worker. Para o banner de instalação e os ícones funcionarem corretamente, adicione os PNGs `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png` e `apple-touch-icon.png` em `public/`.
