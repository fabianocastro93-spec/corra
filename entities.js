// entities.js - Classes de Jogadores (Humano e Bots com IA defensiva)

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
        this.rect(x, y, w, h);
    };
}

class Player {
    constructor(id, name, isHuman = false, x = 100, color = '#3b82f6', groundY = 550) {
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
        this.x = x;
        this.groundY = groundY;
        this.y = groundY - 40;
        this.width = 24;
        this.height = 38;

        this.vx = 0;
        this.vy = 0;
        this.speed = isHuman ? 4.8 : 3.8;
        this.jumpForce = -11.5;
        this.gravity = 0.52;
        this.isGrounded = false;
        this.facing = 1;

        // Vida e Resistência
        this.maxHealth = 100;
        this.health = 100;
        this.alive = true;

        // Estados defensivos
        this.isProtected = false;
        this.protectionReason = '';
        this.isDodging = false;
        this.dodgeTimer = 0;
        this.dodgeCooldown = 0;
        this.invulnerableTimer = 0;

        // Estética
        this.color = color;
        this.headColor = '#fcd34d';
        this.animFrame = 0;

        // IA dos Bots
        this.aiTargetX = this.x;
        this.aiState = 'wander'; // 'wander', 'flee_to_shelter', 'cower'
        this.aiDecisionTimer = Math.random() * 60;
        this.aiTargetShelter = null;
    }

    // Aplica dano ao jogador com efeito de recuo
    takeDamage(amount, sourceX = null, threatType = '') {
        if (!this.alive || this.isDodging || this.invulnerableTimer > 0) return false;

        this.health -= amount;
        this.invulnerableTimer = 20; // 0.3s de imunidade

        if (sounds) sounds.playHit();

        // Recuo (knockback)
        if (sourceX !== null) {
            const dir = this.x > sourceX ? 1 : -1;
            this.vx = dir * 6;
            this.vy = -3;
        }

        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            if (sounds) sounds.playExplosion();
        }
        return true;
    }

    // Ação de esquiva / Dash (desvia de ataques e fica invulnerável por um instante)
    dodge(dir = 1) {
        if (this.dodgeCooldown > 0 || !this.alive) return;
        this.isDodging = true;
        this.dodgeTimer = 14;
        this.dodgeCooldown = 60;
        this.vx = dir * 10;
        this.vy = -1.5;
        if (sounds) sounds.playDash();
    }

    // Pulo
    jump() {
        if (this.isGrounded && this.alive) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            if (sounds) sounds.playJump();
        }
    }

    // Atualização da IA dos Bots
    updateAI(shelterManager, activeThreat) {
        if (this.isHuman || !this.alive) return;

        this.aiDecisionTimer--;

        // Se há uma ameaça ativa atacando a arena
        if (activeThreat && activeThreat.isActive) {
            const preferRoof = activeThreat.type === 'sky_hazard' || activeThreat.name.toLowerCase().includes('fogo') || activeThreat.name.toLowerCase().includes('meteoro') || activeThreat.name.toLowerCase().includes('raio');
            
            // Busca o melhor abrigo
            if (!this.aiTargetShelter || this.aiDecisionTimer <= 0) {
                this.aiTargetShelter = shelterManager.getNearestShelter(this.x, preferRoof);
                this.aiDecisionTimer = 40 + Math.random() * 30;
            }

            if (this.aiTargetShelter) {
                const targetX = this.aiTargetShelter.x;
                const diff = targetX - this.x;

                if (Math.abs(diff) > 15) {
                    this.vx = (diff > 0 ? 1 : -1) * (this.speed * 1.15);
                    this.facing = diff > 0 ? 1 : -1;

                    // Pula se encontrar uma parede bloqueando ou se precisar subir em plataforma
                    if (this.isGrounded && (Math.random() < 0.05 || Math.abs(this.vx) < 0.5)) {
                        this.jump();
                    }
                } else {
                    // Já está no abrigo! Permanece agachado/protegido
                    this.vx *= 0.5;
                }
            }

            // Esquiva de emergência se estiver prestes a ser atingido
            if (activeThreat.boss && Math.abs(this.x - activeThreat.boss.x) < 80 && this.dodgeCooldown <= 0) {
                const dodgeDir = this.x > activeThreat.boss.x ? 1 : -1;
                this.dodge(dodgeDir);
            }

        } else {
            // Sem perigo imediato: patrulha livremente pela arena
            if (this.aiDecisionTimer <= 0) {
                this.aiDecisionTimer = 60 + Math.random() * 120;
                this.aiTargetX = 60 + Math.random() * 1080;
            }

            const diff = this.aiTargetX - this.x;
            if (Math.abs(diff) > 20) {
                this.vx = (diff > 0 ? 1 : -1) * (this.speed * 0.65);
                this.facing = diff > 0 ? 1 : -1;

                // Chance de pular ocasionalmente
                if (this.isGrounded && Math.random() < 0.015) {
                    this.jump();
                }
            } else {
                this.vx *= 0.8;
            }
        }
    }

    // Atualização da física e colisões
    update(keys, shelterManager, activeThreat) {
        if (!this.alive) return;

        // Atualiza contadores
        if (this.invulnerableTimer > 0) this.invulnerableTimer--;
        if (this.dodgeCooldown > 0) this.dodgeCooldown--;
        if (this.dodgeTimer > 0) {
            this.dodgeTimer--;
            if (this.dodgeTimer <= 0) this.isDodging = false;
        }

        // Controle do jogador Humano
        if (this.isHuman) {
            let moveDir = 0;
            if (keys['KeyA'] || keys['ArrowLeft']) moveDir -= 1;
            if (keys['KeyD'] || keys['ArrowRight']) moveDir += 1;

            if (moveDir !== 0) {
                this.vx = moveDir * this.speed;
                this.facing = moveDir;
                this.animFrame += 0.2;
            } else {
                this.vx *= 0.65;
            }

            // Pulo
            if ((keys['KeyW'] || keys['ArrowUp'] || keys['Space']) && this.isGrounded) {
                this.jump();
            }

            // Esquiva / Dash (Shift ou tecla E)
            if ((keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyE']) && this.dodgeCooldown <= 0) {
                this.dodge(this.facing);
            }
        } else {
            // IA do Bot
            this.updateAI(shelterManager, activeThreat);
            if (Math.abs(this.vx) > 0.5) this.animFrame += 0.18;
        }

        // Aplica gravidade
        this.vy += this.gravity;
        if (this.vy > 14) this.vy = 14;

        // Atualiza posição preliminar
        this.x += this.vx;
        this.y += this.vy;

        // Limites da arena
        if (this.x < 15) { this.x = 15; this.vx = 0; }
        if (this.x > 1185 - this.width) { this.x = 1185 - this.width; this.vx = 0; }

        // Colisão com o Chão Plano
        this.isGrounded = false;
        if (this.y + this.height >= this.groundY) {
            this.y = this.groundY - this.height;
            this.vy = 0;
            this.isGrounded = true;
        }

        // Colisão com sólidos dos Abrigos (teto e paredes)
        const colliders = shelterManager.getSolidColliders();
        colliders.forEach(c => {
            // Verifica sobreposição
            if (this.x + this.width > c.x && this.x < c.x + c.w &&
                this.y + this.height > c.y && this.y < c.y + c.h) {

                // Colisão de cima (pousar no teto da estrutura)
                if (c.type === 'roof' && this.vy > 0 && this.y + this.height - this.vy <= c.y + 10) {
                    this.y = c.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                }
                // Colisão lateral com barreiras ou paredes do bunker
                else if (c.type === 'barrier' || c.type === 'wall' || c.type === 'pillar') {
                    if (this.vx > 0 && this.x + this.width - this.vx <= c.x + 8) {
                        this.x = c.x - this.width;
                        this.vx = 0;
                    } else if (this.vx < 0 && this.x - this.vx >= c.x + c.w - 8) {
                        this.x = c.x + c.w;
                        this.vx = 0;
                    }
                }
            }
        });

        // Avaliação de Proteção Atual
        this.isProtected = false;
        this.protectionReason = '';

        if (shelterManager.isInsideBunker(this.x + this.width / 2, this.y + this.height / 2)) {
            this.isProtected = true;
            this.protectionReason = 'Bunker Total';
        } else if (shelterManager.isProtectedFromAbove(this.x + this.width / 2, this.y)) {
            this.isProtected = true;
            this.protectionReason = 'Sob Teto';
        }
    }

    // Renderização visual do jogador
    render(ctx, activeThreatActive) {
        if (!this.alive) {
            // Marcador de jogador eliminado
            ctx.save();
            ctx.fillStyle = '#64748b';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("💀 ELIMINADO", this.x + this.width / 2, this.groundY - 6);
            ctx.restore();
            return;
        }

        ctx.save();

        const centerX = this.x + this.width / 2;
        const feetY = this.y + this.height;

        // Efeito de invulnerabilidade / dano (piscar)
        if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // Aura de Esquiva (Dash)
        if (this.isDodging) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, this.y + this.height / 2, 24, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Indicador de Proteção (Escudo Neon)
        if (this.isProtected) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.beginPath();
            ctx.arc(centerX, this.y + this.height / 2, 26, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Desenho do Corpo do Jogador
        // Pernas (com animação de caminhada)
        ctx.fillStyle = '#1e293b';
        const legOffset = Math.sin(this.animFrame) * 5;
        ctx.fillRect(centerX - 8, feetY - 14, 6, 14 + (this.isGrounded ? legOffset : 0));
        ctx.fillRect(centerX + 2, feetY - 14, 6, 14 - (this.isGrounded ? legOffset : 0));

        // Torso / Roupa
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(centerX - 9, this.y + 12, 18, 16, 4);
        ctx.fill();

        // Cinto / Detalhe tático
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(centerX - 9, this.y + 24, 18, 4);

        // Cabeça
        ctx.fillStyle = this.headColor;
        ctx.beginPath();
        ctx.arc(centerX, this.y + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Olhos / Visor com direção
        ctx.fillStyle = this.isHuman ? '#0284c7' : '#ef4444';
        const eyeOffset = this.facing * 3;
        ctx.fillRect(centerX + eyeOffset - 2, this.y + 6, 4, 3);

        // Capacete / Cabelo
        ctx.fillStyle = this.isHuman ? '#1e3a8a' : '#334155';
        ctx.beginPath();
        ctx.arc(centerX, this.y + 5, 8, Math.PI, 2 * Math.PI);
        ctx.fill();

        // Placa de Nome e Barra de Vida
        const hpPercent = Math.max(0, this.health / this.maxHealth);
        const barW = 38;
        const barH = 5;
        const barX = centerX - barW / 2;
        const barY = this.y - 18;

        // Fundo da barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

        // Barra de Vida colorida
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : (hpPercent > 0.25 ? '#eab308' : '#ef4444');
        ctx.fillRect(barX, barY, barW * hpPercent, barH);

        // Nome do Jogador
        ctx.font = this.isHuman ? 'bold 11px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = this.isHuman ? '#38bdf8' : '#e2e8f0';
        ctx.fillText(this.name, centerX, barY - 4);

        // Indicador de Perigo/Proteção
        if (activeThreatActive) {
            ctx.font = 'bold 9px sans-serif';
            if (this.isProtected) {
                ctx.fillStyle = '#4ade80';
                ctx.fillText(`🛡️ ${this.protectionReason}`, centerX, barY - 15);
            } else {
                ctx.fillStyle = '#f87171';
                ctx.fillText('⚠️ EXPOSTO!', centerX, barY - 15);
            }
        }

        ctx.restore();
    }
}
