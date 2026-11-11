// game.js - Loop Principal, Sorteio a cada 1 Minuto e Coordenação do Jogo

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.groundY = 550;

        // Gerenciadores
        this.shelters = new ShelterManager(this.groundY);
        this.threatManager = new ThreatManager(this.groundY);

        // Teclas pressionadas
        this.keys = {};
        this.setupInput();

        // Lista de Jogadores
        this.players = [];
        this.humanPlayer = null;
        this.initPlayers();

        // Sistema de Sorteio (60 segundos)
        this.raffleInterval = 60; // 1 minuto
        this.raffleTimer = this.raffleInterval;
        this.isRaffling = false;
        this.isInputModalOpen = false;

        // Efeito de Tremores de Tela
        this.shakeIntensity = 0;

        // Início do Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));

        // Inicia contagem regressiva do sorteio
        this.startRaffleCountdown();
    }

    // Inicialização dos Jogadores (1 Humano + 5 Bots)
    initPlayers() {
        this.players = [
            new Player('p1', 'Você (P1)', true, 260, '#38bdf8', this.groundY),
            new Player('bot_lucas', 'Bot Lucas', false, 120, '#10b981', this.groundY),
            new Player('bot_bia', 'Bot Bia', false, 420, '#f59e0b', this.groundY),
            new Player('bot_max', 'Bot Max', false, 620, '#ec4899', this.groundY),
            new Player('bot_leo', 'Bot Leo', false, 820, '#8b5cf6', this.groundY),
            new Player('bot_ana', 'Bot Ana', false, 1020, '#06b6d4', this.groundY)
        ];
        this.humanPlayer = this.players[0];
        this.updateSurvivorUI();
    }

    // Configuração dos controles de teclado
    setupInput() {
        window.addEventListener('keydown', (e) => {
            // Evita interceptar teclas se o modal de texto estiver aberto
            if (this.isInputModalOpen) return;

            this.keys[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
            if (sounds) sounds.ensureContext();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    // Tremor de tela
    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    // Contagem regressiva do Sorteio (1 minuto)
    startRaffleCountdown() {
        setInterval(() => {
            if (this.isRaffling || this.isInputModalOpen) return;

            this.raffleTimer--;
            this.updateTimerUI();

            if (this.raffleTimer <= 0) {
                this.triggerRaffle();
            }
        }, 1000);
    }

    // Forçar sorteio imediato (botão da interface)
    forceRaffleNow() {
        if (this.isRaffling || this.isInputModalOpen) return;
        this.raffleTimer = 0;
        this.triggerRaffle();
    }

    // Dispara a roleta de Sorteio
    triggerRaffle() {
        const livingPlayers = this.players.filter(p => p.alive);
        if (livingPlayers.length === 0) return;

        this.isRaffling = true;
        const modal = document.getElementById('raffleModal');
        const candidateEl = document.getElementById('raffleCandidate');
        modal.classList.remove('hidden');

        let ticks = 0;
        const maxTicks = 24; // 24 giros da roleta
        let currentIdx = 0;

        const interval = setInterval(() => {
            currentIdx = (currentIdx + 1) % livingPlayers.length;
            const candidate = livingPlayers[currentIdx];
            candidateEl.textContent = candidate.name;
            candidateEl.style.color = candidate.color;

            if (sounds) sounds.playTick();
            ticks++;

            if (ticks >= maxTicks) {
                clearInterval(interval);
                this.finishRaffle(candidate);
            }
        }, 90);
    }

    // Conclui o sorteio e abre o prompt ou aciona o bot
    finishRaffle(chosenPlayer) {
        if (sounds) sounds.playWinner();

        const candidateEl = document.getElementById('raffleCandidate');
        candidateEl.textContent = `🎉 ${chosenPlayer.name.toUpperCase()} FOI O ESCOLHIDO!`;
        candidateEl.style.color = '#facc15';

        setTimeout(() => {
            document.getElementById('raffleModal').classList.add('hidden');
            this.isRaffling = false;
            this.raffleTimer = this.raffleInterval;

            if (chosenPlayer.isHuman) {
                this.openHumanInputModal();
            } else {
                this.executeBotInvocation(chosenPlayer);
            }
        }, 1500);
    }

    // Abre modal para o Jogador Humano digitar qualquer coisa
    openHumanInputModal() {
        this.isInputModalOpen = true;
        const modal = document.getElementById('inputModal');
        const inputField = document.getElementById('invocationInput');
        modal.classList.remove('hidden');
        inputField.value = '';
        inputField.focus();

        // Temporizador de 15 segundos para digitar
        let timeRemaining = 15;
        const timerEl = document.getElementById('inputCountdown');
        timerEl.textContent = `${timeRemaining}s`;

        this.inputCountdownInterval = setInterval(() => {
            timeRemaining--;
            timerEl.textContent = `${timeRemaining}s`;
            if (timeRemaining <= 0) {
                clearInterval(this.inputCountdownInterval);
                this.submitInvocation(inputField.value || 'Goku');
            }
        }, 1000);
    }

    // Submete a palavra digitada pelo Humano
    submitInvocation(text) {
        if (!this.isInputModalOpen) return;
        clearInterval(this.inputCountdownInterval);
        this.isInputModalOpen = false;
        document.getElementById('inputModal').classList.add('hidden');

        const chosenText = (text && text.trim().length > 0) ? text.trim() : 'Goku';
        this.threatManager.invoke(chosenText, this.humanPlayer.name);
    }

    // Executa a escolha de um Bot sorteado
    executeBotInvocation(bot) {
        const botOptions = [
            'Goku',
            'Chuva de Fogo',
            'Tsunami',
            'Godzilla',
            'Tornado',
            'Tempestade de Raios',
            'Nave Alienígena',
            'Meteoro Devastador',
            'Bomba Nuclear',
            'Megatron Titânico',
            'Dragão do Fogo',
            'Robô Assassino'
        ];
        const choice = botOptions[Math.floor(Math.random() * botOptions.length)];
        this.threatManager.invoke(choice, bot.name);
    }

    // Atualiza o HUD de tempo
    updateTimerUI() {
        const timerEl = document.getElementById('timerText');
        const progressBar = document.getElementById('timerBar');
        if (timerEl) {
            timerEl.textContent = `${this.raffleTimer}s`;
        }
        if (progressBar) {
            const percent = ((this.raffleInterval - this.raffleTimer) / this.raffleInterval) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    // Atualiza a lista de sobreviventes na interface lateral
    updateSurvivorUI() {
        const listEl = document.getElementById('survivorsList');
        if (!listEl) return;

        listEl.innerHTML = '';
        this.players.forEach(p => {
            const row = document.createElement('div');
            row.className = `survivor-item ${p.alive ? '' : 'dead'}`;
            const hpWidth = Math.max(0, p.health);

            row.innerHTML = `
                <div class="survivor-header">
                    <span style="color: ${p.color}; font-weight: bold;">${p.name}</span>
                    <span class="hp-num">${p.alive ? Math.round(p.health) + ' HP' : 'MORTO'}</span>
                </div>
                <div class="hp-bar-bg">
                    <div class="hp-bar-fill" style="width: ${hpWidth}%; background-color: ${p.health > 50 ? '#22c55e' : (p.health > 25 ? '#eab308' : '#ef4444')};"></div>
                </div>
            `;
            listEl.appendChild(row);
        });

        const aliveCount = this.players.filter(p => p.alive).length;
        document.getElementById('aliveCount').textContent = aliveCount;
    }

    // Reiniciar partida
    restartGame() {
        this.initPlayers();
        this.threatManager.activeThreat = null;
        this.threatManager.projectiles = [];
        this.threatManager.particles = [];
        this.raffleTimer = this.raffleInterval;
        document.getElementById('gameOverModal').classList.add('hidden');
    }

    // Loop de Jogo a 60 FPS
    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Atualização da lógica
        this.update();

        // Renderização
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    // Atualização de física e entidades
    update() {
        // Reduz o tremor de tela
        if (this.shakeIntensity > 0) {
            this.shakeIntensity *= 0.9;
            if (this.shakeIntensity < 0.2) this.shakeIntensity = 0;
        }

        // Atualiza os jogadores
        this.players.forEach(p => {
            p.update(this.keys, this.shelters, this.threatManager.activeThreat);
        });

        // Atualiza a ameaça ativa
        this.threatManager.update(
            this.players,
            this.shelters,
            (intensity) => this.shake(intensity)
        );

        // Atualiza HUD de sobreviventes
        this.updateSurvivorUI();

        // Verifica Game Over se o jogador humano morrer ou todos morrerem
        if (!this.humanPlayer.alive && !document.getElementById('gameOverModal').classList.contains('active')) {
            const modal = document.getElementById('gameOverModal');
            document.getElementById('gameOverTitle').textContent = "VOCÊ FOI ELIMINADO!";
            document.getElementById('gameOverDesc').textContent = "As ameaças da arena superaram seus reflexos e abrigos.";
            modal.classList.remove('hidden');
            modal.classList.add('active');
        } else {
            const living = this.players.filter(p => p.alive);
            if (living.length === 1 && living[0].isHuman && !document.getElementById('gameOverModal').classList.contains('active')) {
                const modal = document.getElementById('gameOverModal');
                document.getElementById('gameOverTitle').textContent = "🏆 VITÓRIA REAL!";
                document.getElementById('gameOverDesc').textContent = "Você foi o único sobrevivente a resistir a todas as catástrofes e invocações!";
                modal.classList.remove('hidden');
                modal.classList.add('active');
            }
        }
    }

    // Renderização do cenário e entidades
    render() {
        this.ctx.save();

        // Aplica o tremor de tela (Screen Shake)
        if (this.shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity * 2;
            const dy = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.ctx.translate(dx, dy);
        }

        // 1. Céu e Atmosfera da Arena Plana
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.groundY);
        if (this.threatManager.activeThreat && this.threatManager.activeThreat.type === 'fire_rain') {
            skyGrad.addColorStop(0, '#450a0a');
            skyGrad.addColorStop(1, '#7f1d1d');
        } else if (this.threatManager.activeThreat && this.threatManager.activeThreat.type === 'lightning') {
            skyGrad.addColorStop(0, '#0f172a');
            skyGrad.addColorStop(1, '#1e1b4b');
        } else {
            skyGrad.addColorStop(0, '#090d16');
            skyGrad.addColorStop(0.7, '#131b2e');
            skyGrad.addColorStop(1, '#1e293b');
        }
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid futurista e montanhas distantes de fundo
        this.renderBackgroundGrid();

        // 2. Chão Plano Metálico / Concreto Reforçado
        this.renderFlatGround();

        // 3. Abrigos, Bunkers e Barreiras
        this.shelters.render(this.ctx);

        // 4. Jogadores e Bots
        const hasThreat = this.threatManager.activeThreat !== null;
        this.players.forEach(p => {
            p.render(this.ctx, hasThreat);
        });

        // 5. Ameaças (Goku, Tsunami, Projéteis, Partículas, Anúncios)
        this.threatManager.render(this.ctx);

        this.ctx.restore();
    }

    // Desenha grid futurista no horizonte
    renderBackgroundGrid() {
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        this.ctx.lineWidth = 1;

        // Linhas verticais convergentes
        for (let x = 0; x <= this.canvas.width; x += 60) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 180);
            this.ctx.lineTo(x, this.groundY);
            this.ctx.stroke();
        }

        // Linhas horizontais com perspectiva
        for (let y = 180; y <= this.groundY; y += 35) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // Desenha o piso da arena perfeitamente plano com placas de titânio
    renderFlatGround() {
        const gY = this.groundY;
        const gH = this.canvas.height - gY;

        // Placas de superfície
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, gY, this.canvas.width, gH);

        // Linha de luz neon da superfície
        this.ctx.strokeStyle = '#0284c7';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, gY);
        this.ctx.lineTo(this.canvas.width, gY);
        this.ctx.stroke();

        // Faixas de segurança amarelas/pretas nas bordas do chão
        this.ctx.fillStyle = '#eab308';
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.fillRect(x, gY + 4, 20, 4);
        }

        // Detalhes de placas de piso
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1.5;
        for (let x = 0; x < this.canvas.width; x += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, gY);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
}

// Inicializa quando a página carregar
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
