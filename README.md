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

## Teste manual — piloto de controles por gestos ("arrastar")

O piloto de controles por gestos (o esquema "arrastar": arrastar na faixa move; o botão principal dispara a ação) está disponível — exclusivamente em aparelhos de toque — em **Invasores Cósmicos 84** (ATIRAR), **Defesa Aurora** (FOGO), **Asa Rasante** (ATIRAR + ▲▼ acelerar/frear), **Rali Estrada Sem Fim** (ACELERAR + ▲▼) e **Hidro Rio Abaixo** (ATIRAR + ▲▼). **Todos os outros jogos continuam com o D-pad e os botões A/B de sempre.**

A chave de segurança do piloto fica em `NOVA_ENTRADA_TOUCH`, em `src/shared/constants.ts` (padrão: `true`). Com `false`, o Invasores volta a usar o controle clássico e nada do piloto atua.

Preferências do piloto (esquema por jogo, modo de tiro, sensibilidade, canhoto, vibração, diagnóstico de toque e a dica de primeiro uso) ficam em `fliperama_controles_v1` no `localStorage`.

### Roteiro de teste manual (celular ou emulação de toque no DevTools)

1. **Arrastar com um polegar**: abra o Invasores, deslize o dedo para a esquerda/direita na faixa — o canhão acompanha proporcionalmente e para na hora ao soltar.
2. **Arrastar e atirar com os dois dedos**: com um dedo arrastando, toque no botão ATIRAR — o tiro é disparado sem soltar a faixa.
3. **Alternar o esquema durante a partida**: na barra superior (ícone ⇄) ou em "?" → CONTROLE DE TOQUE, alterne "Arrastar (novo)" e "Botões na tela (reserva)" — aplica na hora, sem reiniciar a partida; no desktop o seletor não aparece.
4. **Pausar e retomar com o dedo na tela**: com o dedo na faixa, pressione P (ou o botão de pausa) — nada fica preso; ao retomar, a faixa responde normalmente.
5. **Teclado no computador**: Setas/A/D movem o canhão e Espaço atira; não há widgets de toque na tela.
6. **Outros jogos**: Salve a Hannah, Tatu, pinball etc. continuam com o D-pad e os botões A/B exatamente como antes, sem nenhuma mudança.

Diagnóstico de toque: Ajustes → Avançado → "Mostrar diagnóstico de toque" sobrepõe sobre o jogo os ponteiros ativos (pointerId), o arrasteDX, o modo de tiro e a latência estimada (descartes devem ficar em zero).

Vibração (Invasores): tiros/acertos/explosões/dano/fim de jogo emitem padrões curtos via `navigator.vibrate` quando disponível. Em navegadores sem a API (Safari do iPhone), nada acontece e não há erros.
