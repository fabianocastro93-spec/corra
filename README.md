# ⚡ Arena 2D: O Escolhido (Survival & Invocation Arena)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Canvas API](https://img.shields.io/badge/Canvas_API-0284c7?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/API/Canvas_API)
[![Web Audio](https://img.shields.io/badge/Web_Audio_API-10b981?style=for-the-badge&logo=webaudio&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Audio_API)

Um jogo de sobrevivência 2D em uma arena plana com barreiras e abrigos defensivos, múltiplos jogadores com inteligência artificial e uma mecânica única de **Sorteio Periódico (1 minuto)**: o jogador sorteado pode digitar **qualquer palavra**, e ela se materializa na arena com poderes para tentar derrotar todos os sobreviventes!

---

## 🎮 Mecânicas do Jogo

- **Arena Plana e Abrigos**:
  - **Bunkers Alpha e Ômega (com Teto Blindado)**: Oferecem proteção 100% contra catástrofes aéreas (chuva de fogo, meteoros, relâmpagos e ataques orbitais).
  - **Barreiras Verticais**: Bloqueiam ataques horizontais, como a força das águas do **Tsunami** e o raio devastador do **Kamehameha**.
  - **Cúpula Central**: Abrigo com cobertura reforçada e pilares metálicos.
- **Sorteio do Escolhido (A cada 60 segundos)**:
  - Uma roleta animada escolhe um jogador vivo.
  - Se for você, abre-se uma tela interativa para você digitar o que deseja invocar na arena!
  - Se for um bot, ele escolhe uma catástrofe automaticamente.
- **Motor de Invocação Dinâmica**:
  - **Goku (Super Saiyajin)**: Voa com aura dourada, atira Ki Blasts, usa teletransporte e dispara um **Kamehameha** massivo pela tela.
  - **Chuva de Fogo / Meteoros**: Queima a superfície descoberta.
  - **Tsunami**: Enorme onda de água que empurra e esmaga quem não estiver atrás de barreiras.
  - **Godzilla**: Terremotos no chão e raio atômico roxo.
  - **Tornado, Raios, Nave Alienígena e Bomba Nuclear**.
  - **Gerador Procedural Universal**: Digite *qualquer palavra* (ex: `cadeira voadora`, `shrek`, `batata`) e um monstro exclusivo é gerado com base no texto, com projéteis temáticos e o nome em neon atacando todos!
- **Áudio Procedural Nativo**:
  - Efeitos sonoros gerados diretamente pela **Web Audio API** (sem arquivos externos ou dependências de carregamento).

---

## 🕹️ Controles
 
### 📱 No Celular / Dispositivos Móveis
- **Botões `◀` e `▶` (Canto inferior esquerdo)**: Movimentar o personagem.
- **Botão `▲ PULO` (Canto inferior direito, verde)**: Pular para alcançar abrigos ou esquivar de tremores.
- **Botão `⚡ DASH` (Canto inferior direito, dourado)**: Esquiva rápida com invulnerabilidade momentânea.
- **Toque na Tela**: Desbloqueia o som nativo no primeiro toque e permite digitar com o teclado virtual.
- **Multi-Touch Completo**: Você pode segurar para correr e apertar o pulo ao mesmo tempo com os dois polegares!

### 💻 No Computador
| Ação | Teclas |
| :--- | :--- |
| **Mover para Esquerda / Direita** | `A` / `D` ou `←` / `→` |
| **Pular** | `W`, `↑` ou `Espaço` |
| **Esquiva Rápida (Dash)** | `Shift` ou `E` |
| **Digitar Invocação** | Campo de texto do modal + tecla `Enter` |
| **Sorteio Imediato (Teste)** | Botão `🎲 SORTEAR AGORA` |

---

## 🌐 Como Jogar Online (Atualizações 100% Automáticas)

O projeto está configurado com **GitHub Actions** para **CI/CD contínuo**. Toda vez que você fizer um `git push` para a branch `main`, o GitHub atualiza o jogo online automaticamente sem você precisar fazer nada manualmente!

### 🔧 Ativação no GitHub (Feito uma única vez):
1. Suba o projeto para o seu repositório:
   ```bash
   git push -u origin main
   ```
2. No seu repositório no GitHub, vá em **Settings** > **Pages** (no menu lateral esquerdo).
3. Em **Build and deployment > Source**, selecione: **GitHub Actions**.
4. Pronto! A partir de agora, qualquer alteração que você commitar e enviar será publicada e atualizada **automaticamente** no ar em segundos!

---

## 📁 Estrutura de Arquivos

```
├── .github/
│   └── workflows/
│       └── deploy.yml # Workflow de atualização automática no GitHub Pages
├── index.html        # Estrutura visual, canvas, HUD e modais interativos
├── style.css         # Estilização arcade sci-fi, glassmorphism e animações
├── audio.js          # Sintetizador sonoro Web Audio API (100% autônomo)
├── shelters.js       # Gerenciador de barreiras, bunkers e verificação de proteção
├── entities.js       # Classes de Jogador (Humano e Bots com IA de fuga)
├── invocations.js    # Motor de invocações (Goku, Desastres e Gerador Universal)
├── game.js           # Loop principal 60 FPS, física e roleta de sorteio
├── .gitignore        # Arquivos ignorados pelo Git
└── README.md         # Documentação do projeto
```

---

Desenvolvido para máxima diversão e sobrevivência na arena! 🚀
