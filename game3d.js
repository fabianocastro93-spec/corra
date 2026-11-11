// game3d.js - Loop Principal 3D Three.js, Câmera em Terceira Pessoa, Movimento 360° e Sorteio

class Player3D {
    constructor(id, name, isHuman = false, shirtColor = 0x3b82f6, pantsColor = 0x1e293b, startX = 0, startZ = 0) {
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
        this.alive = true;
        this.maxHealth = 100;
        this.health = 100;

        // Mesh Roblox R6
        this.mesh = robloxFactory.createRobloxAvatar(shirtColor, pantsColor, 0xfed7aa, name, isHuman);
        this.mesh.position.set(startX, 0, startZ);

        // Física e Movimentação
        this.velocity = new THREE.Vector3();
        this.speed = isHuman ? 0.38 : 0.28;
        this.jumpForce = 0.58;
        this.gravity = 0.024;
        this.isGrounded = true;
        this.facingAngle = 0;

        // Esquiva / Dash Turbinado
        this.isDodging = false;
        this.dashTimer = 0;
        this.dashDirection = new THREE.Vector3();
        this.dodgeCooldown = 0;
        this.invulnerableTimer = 0;

        // Proteção
        this.isProtected = false;
        this.protectionReason = '';

        // IA
        this.aiDecisionTimer = Math.random() * 60;
        this.aiTargetPos = new THREE.Vector3(startX, 0, startZ);
    }

    takeDamage(amount, sourcePos = null) {
        if (!this.alive || this.isDodging || this.dashTimer > 0 || this.invulnerableTimer > 0) return;

        this.health -= amount;
        this.invulnerableTimer = 20;

        if (sounds) sounds.playHit();

        if (sourcePos) {
            const pushDir = new THREE.Vector3().subVectors(this.mesh.position, sourcePos).normalize();
            this.velocity.x += pushDir.x * 0.4;
            this.velocity.z += pushDir.z * 0.4;
        }

        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            this.mesh.rotation.z = Math.PI / 2; // Cai de lado estilo Roblox
            if (sounds) sounds.playExplosion();
        }

        this.updateUI();
    }

    jump() {
        if (this.isGrounded && this.alive) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            if (sounds) sounds.playJump();
        }
    }

    dodge(targetAngle = null) {
        if (this.dodgeCooldown > 0 || !this.alive) return;
        this.isDodging = true;
        this.dashTimer = 18; // 18 frames de propulsão supersônica (~0.3s)
        this.dodgeCooldown = 32; // ~0.53s de recarga rápida
        this.invulnerableTimer = 25; // Invulnerável durante o dash

        // Define ângulo e vetor direcional do dash
        const angle = (targetAngle !== null) ? targetAngle : this.facingAngle;
        this.facingAngle = angle;
        this.dashDirection.set(Math.sin(angle), 0, Math.cos(angle)).normalize();

        // Leve impulso vertical para vencer atrito
        if (this.isGrounded) {
            this.velocity.y = 0.14;
            this.isGrounded = false;
        }

        if (sounds) sounds.playDash();
    }

    updateUI() {
        if (this.mesh.parts && this.mesh.parts.billboard) {
            this.mesh.parts.billboard.updateUI(this.health, this.maxHealth, this.isProtected, this.protectionReason);
        }
    }

    // Atualização da IA dos Bots
    updateAI(world3d, activeThreat) {
        if (this.isHuman || !this.alive) return;

        this.aiDecisionTimer--;

        // Se há perigo ativo na arena, corre para o abrigo mais próximo!
        if (activeThreat && activeThreat.isActive) {
            if (!this.aiTargetPos || this.aiDecisionTimer <= 0) {
                const shelter = world3d.getNearestShelter(this.mesh.position, true);
                if (shelter) {
                    this.aiTargetPos = new THREE.Vector3(shelter.x, 0, shelter.z);
                }
                this.aiDecisionTimer = 60;
            }
        } else {
            // Sem perigo: patrulha livremente pela baseplate
            if (this.aiDecisionTimer <= 0) {
                this.aiTargetPos = new THREE.Vector3(
                    (Math.random() - 0.5) * 120,
                    0,
                    (Math.random() - 0.5) * 120
                );
                this.aiDecisionTimer = 120 + Math.random() * 120;
            }
        }

        if (this.aiTargetPos) {
            const diff = new THREE.Vector3().subVectors(this.aiTargetPos, this.mesh.position);
            diff.y = 0;
            if (diff.length() > 2.0) {
                const moveDir = diff.normalize();
                this.velocity.x = moveDir.x * this.speed;
                this.velocity.z = moveDir.z * this.speed;
                this.facingAngle = Math.atan2(moveDir.x, moveDir.z);
            } else {
                this.velocity.x *= 0.5;
                this.velocity.z *= 0.5;
            }
        }
    }

    // Atualização física e animações
    update(world3d, activeThreat, time) {
        if (!this.alive) return;

        if (this.dodgeCooldown > 0) this.dodgeCooldown--;
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;

        // Execução do Dash Turbinado
        if (this.dashTimer > 0) {
            this.dashTimer--;
            // Velocidade supersônica de impulso (quase 4x mais rápida que a caminhada)
            this.velocity.x = this.dashDirection.x * 1.45;
            this.velocity.z = this.dashDirection.z * 1.45;

            // Inclina o personagem para frente durante o dash
            if (this.mesh) {
                this.mesh.rotation.x = 0.35;
            }

            if (this.dashTimer <= 0) {
                this.isDodging = false;
                if (this.mesh) this.mesh.rotation.x = 0;
            }
        } else {
            if (this.mesh && this.mesh.rotation.x !== 0) {
                this.mesh.rotation.x = 0;
            }
        }

        // Gravidade e Pulo
        this.velocity.y -= this.gravity;
        this.mesh.position.y += this.velocity.y;

        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Movimento horizontal
        this.mesh.position.x += this.velocity.x;
        this.mesh.position.z += this.velocity.z;

        // Fricção do chão (se não estiver no meio do dash)
        if (this.dashTimer <= 0) {
            this.velocity.x *= 0.82;
            this.velocity.z *= 0.82;
        }

        // Rotação suave do personagem para onde está caminhando
        this.mesh.rotation.y = this.facingAngle;

        // Colisões com o mundo
        world3d.resolveCollision(this.mesh.position, 1.2);

        // Animação de caminhada clássica do Roblox
        const horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);
        this.mesh.animateWalk(horizontalSpeed, time);

        // Avaliação de proteção em abrigos
        this.isProtected = false;
        this.protectionReason = '';

        if (world3d.isInsideBunker(this.mesh.position)) {
            this.isProtected = true;
            this.protectionReason = 'Bunker Total';
        } else if (world3d.isProtectedFromAbove(this.mesh.position)) {
            this.isProtected = true;
            this.protectionReason = 'Sob Teto';
        }

        this.updateUI();
    }
}

// Classe Principal do Jogo 3D
class Game3D {
    constructor() {
        this.container = document.getElementById('webgl-container');
        this.setupThree();

        this.world3d = new World3D(this.scene);
        this.threatManager = new ThreatManager3D(this.scene);

        this.players = [];
        this.humanPlayer = null;
        this.initPlayers();

        // Câmera em Terceira Pessoa (Visão ampla e afastada estilo Roblox)
        this.cameraAngle = { yaw: 0, pitch: 0.52 };
        this.cameraDistance = 28;
        this.isDraggingCamera = false;
        this.previousPointerPos = { x: 0, y: 0 };

        // Controles de entrada
        this.keys = {};
        this.joystickVector = { x: 0, y: 0 };
        this.setupInputs();

        // Sorteio a cada 1 minuto
        this.raffleInterval = 60;
        this.raffleTimer = this.raffleInterval;
        this.isRaffling = false;
        this.isInputModalOpen = false;

        // Efeito de Tremor de Câmera
        this.shakeIntensity = 0;

        // Loop
        this.clock = new THREE.Clock();
        this.startRaffleCountdown();
        this.animate();
    }

    setupThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        this.scene.fog = new THREE.FogExp2(0x0f172a, 0.0035);

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    initPlayers() {
        // Jogador Humano (Você)
        this.humanPlayer = new Player3D('p1', 'Você (P1)', true, 0x0284c7, 0x1e293b, 0, 15);
        this.players.push(this.humanPlayer);
        this.scene.add(this.humanPlayer.mesh);

        // 5 Bots Autônomos com cores e posições variadas
        const botConfigs = [
            { id: 'b1', name: 'Bot Lucas', shirt: 0x10b981, pants: 0x064e3b, x: -25, z: 10 },
            { id: 'b2', name: 'Bot Bia', shirt: 0xf59e0b, pants: 0x78350f, x: 25, z: 10 },
            { id: 'b3', name: 'Bot Max', shirt: 0xec4899, pants: 0x831843, x: -10, z: -20 },
            { id: 'b4', name: 'Bot Leo', shirt: 0x8b5cf6, pants: 0x4c1d95, x: 10, z: -20 },
            { id: 'b5', name: 'Bot Ana', shirt: 0x06b6d4, pants: 0x164e63, x: 0, z: -10 }
        ];

        botConfigs.forEach(cfg => {
            const bot = new Player3D(cfg.id, cfg.name, false, cfg.shirt, cfg.pants, cfg.x, cfg.z);
            this.players.push(bot);
            this.scene.add(bot.mesh);
        });

        this.updateSurvivorUI();
    }

    setupInputs() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            if (this.isInputModalOpen) return;
            this.keys[e.code] = true;
            if (sounds) sounds.ensureContext();

            // Pulo imediato no Espaço
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.humanPlayer) this.humanPlayer.jump();
            }

            // Dash imediato no Shift, Q, E, C ou F
            if (['ShiftLeft', 'ShiftRight', 'KeyE', 'KeyQ', 'KeyC', 'KeyF'].includes(e.code)) {
                e.preventDefault();
                if (this.humanPlayer) {
                    let moveX = 0, moveZ = 0;
                    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
                    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
                    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
                    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

                    if (moveX !== 0 || moveZ !== 0) {
                        const angle = Math.atan2(moveX, moveZ) + this.cameraAngle.yaw;
                        this.humanPlayer.dodge(angle);
                    } else {
                        this.humanPlayer.dodge();
                    }
                }
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Rotação da Câmera com Mouse (Arrastar na tela)
        const canvas = this.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => {
            this.isDraggingCamera = true;
            this.previousPointerPos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDraggingCamera) return;
            const deltaX = e.clientX - this.previousPointerPos.x;
            const deltaY = e.clientY - this.previousPointerPos.y;

            this.cameraAngle.yaw -= deltaX * 0.006;
            this.cameraAngle.pitch += deltaY * 0.006;
            this.cameraAngle.pitch = Math.max(0.08, Math.min(1.2, this.cameraAngle.pitch));

            this.previousPointerPos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => {
            this.isDraggingCamera = false;
        });

        // Zoom da Câmera
        window.addEventListener('wheel', (e) => {
            this.cameraDistance += e.deltaY * 0.02;
            this.cameraDistance = Math.max(12, Math.min(65, this.cameraDistance));
        });

        // ================= TOUCH JOYSTICK 360° PARA CELULAR =================
        this.setupMobileControls();
    }

    setupMobileControls() {
        const joystickBase = document.getElementById('joystickBase');
        const joystickStick = document.getElementById('joystickStick');
        const touchCameraArea = document.getElementById('touchCameraArea');
        const btnJump = document.getElementById('btnTouchJump');
        const btnDash = document.getElementById('btnTouchDash');

        let touchId = null;
        let baseCenter = { x: 0, y: 0 };

        if (joystickBase) {
            joystickBase.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (sounds) sounds.ensureContext();
                const touch = e.changedTouches[0];
                touchId = touch.identifier;
                const rect = joystickBase.getBoundingClientRect();
                baseCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                this.updateJoystick(touch.clientX, touch.clientY, joystickStick, baseCenter);
            }, { passive: false });

            joystickBase.addEventListener('touchmove', (e) => {
                e.preventDefault();
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.identifier === touchId) {
                        this.updateJoystick(touch.clientX, touch.clientY, joystickStick, baseCenter);
                    }
                }
            }, { passive: false });

            const resetJoy = () => {
                touchId = null;
                this.joystickVector = { x: 0, y: 0 };
                if (joystickStick) joystickStick.style.transform = `translate(0px, 0px)`;
            };

            joystickBase.addEventListener('touchend', resetJoy);
            joystickBase.addEventListener('touchcancel', resetJoy);
        }

        // Arrastar tela para girar câmera no celular
        let camTouchId = null;
        let prevCamPos = { x: 0, y: 0 };

        if (touchCameraArea) {
            touchCameraArea.addEventListener('touchstart', (e) => {
                const touch = e.changedTouches[0];
                camTouchId = touch.identifier;
                prevCamPos = { x: touch.clientX, y: touch.clientY };
            }, { passive: true });

            touchCameraArea.addEventListener('touchmove', (e) => {
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.identifier === camTouchId) {
                        const dx = touch.clientX - prevCamPos.x;
                        const dy = touch.clientY - prevCamPos.y;

                        this.cameraAngle.yaw -= dx * 0.008;
                        this.cameraAngle.pitch += dy * 0.008;
                        this.cameraAngle.pitch = Math.max(0.08, Math.min(1.2, this.cameraAngle.pitch));

                        prevCamPos = { x: touch.clientX, y: touch.clientY };
                    }
                }
            }, { passive: true });
        }

        // Botões de Ação na Tela (Funciona em Celular no Toque e no PC no Clique!)
        const setupActionBtn = (btn, action) => {
            if (!btn) return;
            const handler = (e) => {
                if (e && e.cancelable) e.preventDefault();
                if (sounds) sounds.ensureContext();
                action();
            };
            btn.addEventListener('pointerdown', handler);
            btn.addEventListener('touchstart', handler, { passive: false });
        };

        setupActionBtn(btnJump, () => {
            if (this.humanPlayer) this.humanPlayer.jump();
        });

        setupActionBtn(btnDash, () => {
            if (this.humanPlayer) {
                // Se estiver usando joystick, da o dash na direção do joystick!
                if (Math.hypot(this.joystickVector.x, this.joystickVector.y) > 0.1) {
                    const angle = Math.atan2(this.joystickVector.x, this.joystickVector.y) + this.cameraAngle.yaw;
                    this.humanPlayer.dodge(angle);
                } else {
                    this.humanPlayer.dodge();
                }
            }
        });
    }

    updateJoystick(cx, cy, stick, baseCenter) {
        const dx = cx - baseCenter.x;
        const dy = cy - baseCenter.y;
        const maxDist = 35;
        const dist = Math.hypot(dx, dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxDist) {
            clampedX = (dx / dist) * maxDist;
            clampedY = (dy / dist) * maxDist;
        }

        stick.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
        this.joystickVector = {
            x: clampedX / maxDist,
            y: clampedY / maxDist
        };
    }

    // Sorteio a cada 1 minuto
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

    triggerImmediateRaffle() {
        if (sounds) sounds.ensureContext();
        this.openHumanInputModal();
    }

    forceRaffleNow() {
        if (this.isRaffling || this.isInputModalOpen) return;
        this.raffleTimer = 0;
        this.triggerRaffle();
    }

    triggerRaffle() {
        const living = this.players.filter(p => p.alive);
        if (living.length === 0) return;

        this.isRaffling = true;
        const modal = document.getElementById('raffleModal');
        const candidateEl = document.getElementById('raffleCandidate');
        modal.classList.remove('hidden');

        let ticks = 0;
        const maxTicks = 24;
        let currentIdx = 0;

        const interval = setInterval(() => {
            currentIdx = (currentIdx + 1) % living.length;
            const candidate = living[currentIdx];
            candidateEl.textContent = candidate.name;
            candidateEl.style.color = candidate.isHuman ? '#38bdf8' : '#ffffff';

            if (sounds) sounds.playTick();
            ticks++;

            if (ticks >= maxTicks) {
                clearInterval(interval);
                this.finishRaffle(candidate);
            }
        }, 90);
    }

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

    openHumanInputModal() {
        this.isInputModalOpen = true;
        const modal = document.getElementById('inputModal');
        const inputField = document.getElementById('invocationInput');
        modal.classList.remove('hidden');
        inputField.value = '';
        inputField.focus();

        let timeRemaining = 15;
        const timerEl = document.getElementById('inputCountdown');
        timerEl.textContent = `${timeRemaining}s`;

        if (this.inputCountdownInterval) clearInterval(this.inputCountdownInterval);
        this.inputCountdownInterval = setInterval(() => {
            timeRemaining--;
            timerEl.textContent = `${timeRemaining}s`;
            if (timeRemaining <= 0) {
                clearInterval(this.inputCountdownInterval);
                this.submitInvocation(inputField.value || 'Goku');
            }
        }, 1000);
    }

    submitInvocation(text) {
        if (this.inputCountdownInterval) clearInterval(this.inputCountdownInterval);
        this.isInputModalOpen = false;
        const modal = document.getElementById('inputModal');
        if (modal) modal.classList.add('hidden');

        const chosenText = (text && text.trim().length > 0) ? text.trim() : 'Goku';
        this.threatManager.invoke(chosenText, this.humanPlayer ? this.humanPlayer.name : 'Você (P1)');
    }

    executeBotInvocation(bot) {
        const botOptions = [
            'Goku',
            'Chuva de Fogo',
            'Tsunami',
            'Godzilla',
            'Tornado',
            'Meteoro Devastador',
            'Robô Assassino',
            'Dragão do Fogo'
        ];
        const choice = botOptions[Math.floor(Math.random() * botOptions.length)];
        this.threatManager.invoke(choice, bot.name);
    }

    updateTimerUI() {
        const timerEl = document.getElementById('timerText');
        const progressBar = document.getElementById('timerBar');
        if (timerEl) timerEl.textContent = `${this.raffleTimer}s`;
        if (progressBar) {
            const percent = ((this.raffleInterval - this.raffleTimer) / this.raffleInterval) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

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
                    <span style="font-weight: bold;">${p.name}</span>
                    <span class="hp-num">${p.alive ? Math.round(p.health) + ' HP' : 'MORTO'}</span>
                </div>
                <div class="hp-bar-bg">
                    <div class="hp-bar-fill" style="width: ${hpWidth}%; background-color: ${p.health > 50 ? '#22c55e' : (p.health > 25 ? '#eab308' : '#ef4444')};"></div>
                </div>
            `;
            listEl.appendChild(row);
        });

        const aliveCount = this.players.filter(p => p.alive).length;
        const countEl = document.getElementById('aliveCount');
        if (countEl) countEl.textContent = aliveCount;
    }

    restartGame() {
        this.threatManager.cleanup();
        this.players.forEach(p => this.scene.remove(p.mesh));
        this.players = [];
        this.initPlayers();
        this.raffleTimer = this.raffleInterval;
        document.getElementById('gameOverModal').classList.add('hidden');
    }

    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    // Loop de Animação 3D a 60 FPS
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Atualiza Movimentação do Jogador Humano relativa à Câmera 3D
        if (this.humanPlayer && this.humanPlayer.alive) {
            let moveX = 0;
            let moveZ = 0;

            // Teclado WASD / Setas
            if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
            if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

            // Joystick Touch Mobile
            if (Math.hypot(this.joystickVector.x, this.joystickVector.y) > 0.1) {
                moveX = this.joystickVector.x;
                moveZ = this.joystickVector.y;
            }

            const hasMove = (moveX !== 0 || moveZ !== 0);

            // Apenas aplica velocidade normal de caminhada se NÃO estiver em Dash ativo!
            if (this.humanPlayer.dashTimer <= 0) {
                if (hasMove) {
                    // Converte vetor de movimento para o espaço da Câmera
                    const angle = Math.atan2(moveX, moveZ);
                    const worldAngle = angle + this.cameraAngle.yaw;

                    this.humanPlayer.velocity.x = Math.sin(worldAngle) * this.humanPlayer.speed;
                    this.humanPlayer.velocity.z = Math.cos(worldAngle) * this.humanPlayer.speed;
                    this.humanPlayer.facingAngle = worldAngle;
                }
            }

            if (this.keys['Space']) this.humanPlayer.jump();
        }

        // 2. Atualiza Bots
        this.players.forEach(p => {
            if (!p.isHuman) {
                p.updateAI(this.world3d, this.threatManager.activeThreat);
            }
            p.update(this.world3d, this.threatManager.activeThreat, time);
        });

        // 3. Atualiza Ameaças 3D (Goku, Meteoros, etc.)
        this.threatManager.update(this.players, this.world3d, (intensity) => this.shake(intensity));

        // 4. Posiciona Câmera em Terceira Pessoa ao redor do Jogador
        if (this.humanPlayer) {
            const targetPos = this.humanPlayer.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0));

            const camX = targetPos.x + Math.sin(this.cameraAngle.yaw) * Math.cos(this.cameraAngle.pitch) * this.cameraDistance;
            const camY = targetPos.y + Math.sin(this.cameraAngle.pitch) * this.cameraDistance;
            const camZ = targetPos.z + Math.cos(this.cameraAngle.yaw) * Math.cos(this.cameraAngle.pitch) * this.cameraDistance;

            this.camera.position.set(camX, camY, camZ);

            // Tremor de Câmera
            if (this.shakeIntensity > 0) {
                this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity * 0.15;
                this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity * 0.15;
                this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity * 0.15;
                this.shakeIntensity *= 0.92;
                if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
            }

            this.camera.lookAt(targetPos);
        }

        // 5. Atualiza UI e HUD
        this.updateSurvivorUI();

        // 6. Renderiza Cena 3D WebGL
        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game3D();
});
