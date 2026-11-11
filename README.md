# 🧱 Arena 3D: O Escolhido (Roblox Style Survival Arena)

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-3D-990000?style=for-the-badge&logo=webgl&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/API/WebGL_API)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Web Audio](https://img.shields.io/badge/Web_Audio_API-10b981?style=for-the-badge&logo=webaudio&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Audio_API)

Um jogo de sobrevivência em **Terceira Dimensão (3D Real)** no estilo clássico do **Roblox**:
- **Avatares em Blocos R6**: Modelos com corpo em blocos, clássica carinha sorridente amarela, animação característica de passos (braços e pernas balançando) e placas de vida flutuantes em 3D.
- **Movimentação Livre 360° e Câmera em Terceira Pessoa**: Ande para qualquer lugar pelo mapa amplo e gire a câmera livremente ao redor do seu personagem.
- **Baseplate com Textura de Pinos (Studs)**: Chão plano clássico do Roblox com shaders de luz solar, sombras suaves e névoa.
- **Abrigos e Bunkers 3D**: Bunkers sólidos com telhados blindados que protegem de ataques do céu, cúpula central e muralhas de impacto.
- **Sorteio do Escolhido a cada 1 Minuto**: Um jogador vivo é sorteado para escrever **qualquer palavra**, e ela se materializa em 3D para atacar a arena!
- **Goku 3D Super Saiyajin**: Feito em blocos com cabelo dourado espetado, kimono laranja, teletransporte e **Kamehameha volumétrico 3D** varrendo o mapa!

---

## 🕹️ Controles

### 💻 No Computador
| Ação | Controle |
| :--- | :--- |
| **Mover 360°** | Teclas `W`, `A`, `S`, `D` ou `Setas` |
| **Girar Câmera 3D** | Clicar e arrastar com o botão esquerdo do Mouse |
| **Zoom da Câmera** | Roda do Mouse (Scroll) |
| **Pular** | Barra de `Espaço` |
| **Esquiva Rápida (Dash)** | `Shift` ou `E` |
| **Sorteio Imediato (Teste)** | Botão `🎲 SORTEAR AGORA` |

### 📱 No Celular / Dispositivos Móveis
- **Joystick Virtual 360° (Canto inferior esquerdo)**: Movimente seu avatar em qualquer direção com o polegar esquerdo.
- **Girar Câmera 3D**: Deslize o dedo livremente no lado direito da tela para olhar para onde quiser.
- **Botão `▲ PULO` (Verde)**: Pular obstáculos e desviar de terremotos.
- **Botão `⚡ DASH` (Dourado)**: Esquiva veloz com invulnerabilidade temporária.
- **Suporte Multi-Touch Total**: Você pode correr, pular e girar a câmera simultaneamente!

---

## 🌐 Atualizações 100% Automáticas (GitHub Pages + Actions)

O projeto está configurado com **GitHub Actions** (`.github/workflows/deploy.yml`). Toda vez que você fizer `git push`, o jogo atualiza automaticamente na nuvem:

1. Suba o código para o seu repositório:
   ```bash
   git push -u origin main
   ```
2. No repositório do GitHub, vá em **Settings** > **Pages**.
3. Em **Build and deployment > Source**, escolha **GitHub Actions**.
4. Pronto! O site 3D estará no ar e será atualizado a cada commit.

---

## 📁 Estrutura de Arquivos 3D

```
├── .github/
│   └── workflows/
│       └── deploy.yml   # CI/CD de deploy automático no GitHub Pages
├── index.html          # Viewport WebGL Three.js, HUD e Joystick virtual
├── style.css           # Estilos modernos, HUD translúcido e modais
├── audio.js            # Sintetizador sonoro Web Audio API (100% nativo)
├── roblox_model.js     # Construtor de avatares Roblox R6, animação de andar e Goku
├── world3d.js          # Baseplate com textura de studs, iluminação e bunkers 3D
├── threats3d.js        # Boss Goku 3D, Kamehameha volumétrico, meteoros e desastres
├── game3d.js           # Engine Three.js, câmera 3ª pessoa e ciclo de sorteio
├── .gitignore          # Arquivos ignorados pelo Git
└── README.md           # Documentação completa
```
