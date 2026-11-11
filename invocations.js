// invocations.js - Motor de Invocações Dinâmicas (Goku, Desastres Elementais e Gerador Procedural Universal)

class ThreatManager {
    constructor(groundY = 550) {
        this.groundY = groundY;
        this.activeThreat = null;
        this.projectiles = [];
        this.particles = [];
        this.announcements = [];
    }

    // Identifica o tipo de ameaça com base no que foi digitado
    parseInvocationText(rawText) {
        const text = rawText.trim().toLowerCase();

        if (text.includes('goku') || text.includes('kakaroto') || text.includes('sayajin') || text.includes('saiyajin') || text.includes('dragon ball')) {
            return { type: 'goku', name: 'Goku (Super Saiyajin)', raw: rawText };
        }
        if (text.includes('fogo') || text.includes('meteoro') || text.includes('chama') || text.includes('lava') || text.includes('inferno') || text.includes('cometa')) {
            return { type: 'fire_rain', name: 'Chuva de Meteoros e Fogo', raw: rawText };
        }
        if (text.includes('agua') || text.includes('água') || text.includes('tsunami') || text.includes('enchente') || text.includes('onda') || text.includes('maremoto')) {
            return { type: 'tsunami', name: 'Tsunami Devastador', raw: rawText };
        }
        if (text.includes('vento') || text.includes('tornado') || text.includes('furacão') || text.includes('furacao') || text.includes('ciclone') || text.includes('tempestade')) {
            return { type: 'tornado', name: 'Tornado Furioso', raw: rawText };
        }
        if (text.includes('godzilla') || text.includes('monstro') || text.includes('dragao') || text.includes('dragão') || text.includes('kaiju') || text.includes('dinossauro')) {
            return { type: 'godzilla', name: 'Godzilla Titânico', raw: rawText };
        }
        if (text.includes('raio') || text.includes('trovao') || text.includes('trovão') || text.includes('thor') || text.includes('eletricidade') || text.includes('tempestade eletrica')) {
            return { type: 'lightning', name: 'Tempestade Elétrica Divina', raw: rawText };
        }
        if (text.includes('alien') || text.includes('ovni') || text.includes('ufo') || text.includes('disco voador') || text.includes('et')) {
            return { type: 'alien', name: 'Nave Mãe Alienígena', raw: rawText };
        }
        if (text.includes('bomba') || text.includes('nuke') || text.includes('nuclear') || text.includes('explosao') || text.includes('explosão')) {
            return { type: 'nuke', name: 'Ogiva Nuclear Tática', raw: rawText };
        }

        // QUALQUER OUTRA COISA DIGITADA -> Gerador Procedural Universal!
        return {
            type: 'procedural',
            name: rawText.toUpperCase(),
            raw: rawText
        };
    }

    // Invoca a ameaça escolhida
    invoke(rawText, playerName) {
        const info = this.parseInvocationText(rawText);
        const durationSeconds = 18;

        this.activeThreat = {
            isActive: true,
            type: info.type,
            name: info.name,
            invokedBy: playerName,
            duration: durationSeconds * 60,
            maxDuration: durationSeconds * 60,
            timer: 0,
            state: 'intro',
            boss: null
        };

        if (sounds) sounds.playAlert();

        if (info.type === 'goku') {
            this.initGoku();
        } else if (info.type === 'godzilla') {
            this.initGodzilla();
        } else if (info.type === 'tornado') {
            this.initTornado();
        } else if (info.type === 'alien') {
            this.initAlien();
        } else if (info.type === 'procedural') {
            this.initProceduralBoss(info.raw);
        }

        this.addAnnouncement(`⚠️ ${playerName.toUpperCase()} INVOCOU: ${info.name.toUpperCase()}!`, '#ef4444');
    }

    // Inicializa Boss Goku
    initGoku() {
        this.activeThreat.boss = {
            x: 600,
            y: 180,
            targetX: 600,
            targetY: 180,
            vx: 0,
            vy: 0,
            facing: 1,
            auraHue: 50,
            actionTimer: 0,
            subState: 'hover',
            beamWidth: 0,
            beamY: 0,
            beamDir: 1
        };
    }

    // Inicializa Boss Godzilla
    initGodzilla() {
        this.activeThreat.boss = {
            x: -120,
            y: this.groundY - 180,
            targetX: 80,
            width: 160,
            height: 180,
            facing: 1,
            actionTimer: 0,
            subState: 'stomping',
            breathTimer: 0
        };
    }

    // Inicializa Tornado
    initTornado() {
        this.activeThreat.tornado = {
            x: 100,
            y: this.groundY,
            dir: 1,
            speed: 3.2,
            radius: 70
        };
    }

    // Inicializa Alien
    initAlien() {
        this.activeThreat.boss = {
            x: 600,
            y: 90,
            dir: 1,
            actionTimer: 0,
            laserCharge: 0
        };
    }

    // Inicializa Boss Procedural para QUALQUER palavra digitada
    initProceduralBoss(word) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = (hash << 5) - hash + word.charCodeAt(i);
            hash |= 0;
        }
        const absHash = Math.abs(hash);

        const hues = [0, 45, 120, 180, 270, 310];
        const auraHue = hues[absHash % hues.length];
        const patterns = ['barrage', 'slammer', 'lasers', 'meteorite'];
        const pattern = patterns[absHash % patterns.length];

        this.activeThreat.boss = {
            x: 600,
            y: 160,
            targetX: 600,
            targetY: 160,
            word: word,
            hash: absHash,
            auraHue: auraHue,
            pattern: pattern,
            actionTimer: 0,
            subState: 'idle'
        };
    }

    addAnnouncement(text, color = '#ffffff') {
        this.announcements.push({
            text: text,
            color: color,
            alpha: 1.0,
            y: 120
        });
    }

    addProjectile(p) {
        this.projectiles.push(p);
    }

    addParticle(p) {
        this.particles.push(p);
    }

    // Atualização principal da ameaça e ataques
    update(players, shelterManager, onScreenShake) {
        for (let i = this.announcements.length - 1; i >= 0; i--) {
            const a = this.announcements[i];
            a.y -= 0.3;
            a.alpha -= 0.008;
            if (a.alpha <= 0) this.announcements.splice(i, 1);
        }

        if (!this.activeThreat) return;

        const threat = this.activeThreat;
        threat.duration--;

        if (threat.duration <= 0) {
            this.addAnnouncement(`✅ O ATAQUE DE ${threat.name.toUpperCase()} TERMINOU!`, '#22c55e');
            this.activeThreat = null;
            return;
        }

        if (threat.type === 'goku') {
            this.updateGoku(threat, players, shelterManager, onScreenShake);
        } else if (threat.type === 'fire_rain') {
            this.updateFireRain(players, shelterManager, onScreenShake);
        } else if (threat.type === 'tsunami') {
            this.updateTsunami(threat, players, shelterManager, onScreenShake);
        } else if (threat.type === 'tornado') {
            this.updateTornado(threat, players, shelterManager);
        } else if (threat.type === 'godzilla') {
            this.updateGodzilla(threat, players, shelterManager, onScreenShake);
        } else if (threat.type === 'lightning') {
            this.updateLightning(players, shelterManager, onScreenShake);
        } else if (threat.type === 'alien') {
            this.updateAlien(threat, players, shelterManager);
        } else if (threat.type === 'nuke') {
            this.updateNuke(threat, players, shelterManager, onScreenShake);
        } else if (threat.type === 'procedural') {
            this.updateProceduralBoss(threat, players, shelterManager, onScreenShake);
        }

        this.updateProjectiles(players, shelterManager, onScreenShake);
        this.updateParticles();
    }

    // LÓGICA DO GOKU
    updateGoku(threat, players, shelterManager, onScreenShake) {
        const b = threat.boss;
        b.actionTimer++;

        for (let i = 0; i < 2; i++) {
            this.addParticle({
                x: b.x + (Math.random() - 0.5) * 30,
                y: b.y + (Math.random() - 0.5) * 45,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -Math.random() * 3 - 1,
                radius: Math.random() * 3.5 + 1.5,
                color: Math.random() > 0.3 ? '#facc15' : '#ffffff',
                alpha: 1,
                life: 25
            });
        }

        if (b.subState === 'hover') {
            const living = players.filter(p => p.alive);
            const targetX = living.length > 0 ? living[0].x : 600;
            b.x += (targetX - b.x) * 0.04;
            b.y = 170 + Math.sin(Date.now() / 250) * 20;

            if (b.actionTimer % 45 === 0) {
                const target = living[Math.floor(Math.random() * living.length)];
                if (target) {
                    const angle = Math.atan2(target.y - b.y, target.x - b.x);
                    this.addProjectile({
                        x: b.x,
                        y: b.y + 10,
                        vx: Math.cos(angle) * 7.5,
                        vy: Math.sin(angle) * 7.5,
                        radius: 8,
                        damage: 18,
                        type: 'ki_blast',
                        color: '#facc15'
                    });
                    if (sounds) sounds.playJump();
                }
            }

            if (b.actionTimer > 280) {
                b.subState = 'charging_kamehameha';
                b.actionTimer = 0;
                b.x = Math.random() > 0.5 ? 90 : 1110;
                b.y = this.groundY - 60;
                b.facing = b.x < 600 ? 1 : -1;
                if (sounds) {
                    sounds.playTeleport();
                    sounds.playChargeEnergy(2.0);
                }
                this.addAnnouncement("GOKU: KA... ME... HA... ME...", '#38bdf8');
            }

        } else if (b.subState === 'charging_kamehameha') {
            for (let i = 0; i < 4; i++) {
                const ang = Math.random() * Math.PI * 2;
                const dist = 50 + Math.random() * 40;
                this.addParticle({
                    x: b.x + Math.cos(ang) * dist,
                    y: b.y + Math.sin(ang) * dist,
                    vx: -Math.cos(ang) * 4,
                    vy: -Math.sin(ang) * 4,
                    radius: 3,
                    color: '#38bdf8',
                    alpha: 1,
                    life: 15
                });
            }

            if (b.actionTimer > 110) {
                b.subState = 'firing_kamehameha';
                b.actionTimer = 0;
                this.addAnnouncement("GOKU: ...HAAAAAAAA!!!", '#0284c7');
                if (sounds) sounds.playKamehamehaBlast();
            }

        } else if (b.subState === 'firing_kamehameha') {
            if (onScreenShake) onScreenShake(8);

            const beamHeight = 65;
            const beamY = b.y - beamHeight / 2;
            const beamX = b.facing === 1 ? b.x : 0;
            const beamW = b.facing === 1 ? (1200 - b.x) : b.x;

            for (let xx = beamX; xx < beamX + beamW; xx += 60) {
                this.addParticle({
                    x: xx + (Math.random() - 0.5) * 30,
                    y: beamY + Math.random() * beamHeight,
                    vx: b.facing * 5,
                    vy: (Math.random() - 0.5) * 4,
                    radius: Math.random() * 5 + 2,
                    color: Math.random() > 0.4 ? '#ffffff' : '#38bdf8',
                    alpha: 1,
                    life: 12
                });
            }

            players.forEach(p => {
                if (!p.alive) return;
                if (p.y + p.height > beamY && p.y < beamY + beamHeight) {
                    const inBeamPath = b.facing === 1 ? p.x > b.x : p.x < b.x;
                    if (inBeamPath) {
                        const protectedByWall = shelterManager.isProtectedFromSide(p.x, p.y, b.x);
                        if (!protectedByWall) {
                            p.takeDamage(1.5, b.x, 'kamehameha');
                        }
                    }
                }
            });

            if (b.actionTimer > 100) {
                b.subState = 'hover';
                b.actionTimer = 0;
            }
        }
    }

    // LÓGICA DA CHUVA DE FOGO E METEOROS
    updateFireRain(players, shelterManager, onScreenShake) {
        if (Math.random() < 0.45) {
            this.addProjectile({
                x: Math.random() * 1200,
                y: -10,
                vx: (Math.random() - 0.5) * 2.5,
                vy: Math.random() * 4.5 + 4.5,
                radius: Math.random() * 7 + 5,
                damage: 22,
                type: 'fire_meteor',
                color: '#ef4444'
            });
        }

        this.addParticle({
            x: Math.random() * 1200,
            y: Math.random() * 550,
            vx: (Math.random() - 0.5) * 1,
            vy: -Math.random() * 2,
            radius: Math.random() * 3 + 1,
            color: '#f97316',
            alpha: 0.6,
            life: 30
        });
    }

    // LÓGICA DO TSUNAMI
    updateTsunami(threat, players, shelterManager, onScreenShake) {
        if (!threat.wave) {
            threat.wave = { x: -100, vx: 5.5, height: 210, dir: 1 };
            if (sounds) sounds.playWaterSplash();
        }

        const wave = threat.wave;
        wave.x += wave.vx;

        if (onScreenShake) onScreenShake(3);

        for (let i = 0; i < 5; i++) {
            this.addParticle({
                x: wave.x + (Math.random() - 0.5) * 40,
                y: this.groundY - Math.random() * wave.height,
                vx: wave.vx * 0.8 + (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 6 + 3,
                color: '#38bdf8',
                alpha: 0.8,
                life: 20
            });
        }

        players.forEach(p => {
            if (!p.alive) return;
            if (Math.abs(p.x - wave.x) < 45 && p.y + p.height > this.groundY - wave.height) {
                const protectedByWall = shelterManager.isProtectedFromSide(p.x, p.y, wave.x - wave.vx * 20);
                if (!protectedByWall) {
                    p.takeDamage(1.2, wave.x - 20, 'tsunami');
                    p.vx = wave.vx * 1.5;
                    p.vy = -5;
                }
            }
        });

        if (wave.x > 1350) {
            wave.x = -150;
            if (sounds) sounds.playWaterSplash();
        }
    }

    // LÓGICA DO TORNADO
    updateTornado(threat, players, shelterManager) {
        const t = threat.tornado;
        t.x += t.dir * t.speed;

        if (t.x < 80) { t.x = 80; t.dir = 1; }
        if (t.x > 1120) { t.x = 1120; t.dir = -1; }

        for (let i = 0; i < 4; i++) {
            const h = Math.random() * 260;
            const w = (h / 260) * t.radius;
            const ang = Date.now() / 150 + h;
            this.addParticle({
                x: t.x + Math.sin(ang) * w,
                y: this.groundY - h,
                vx: Math.cos(ang) * 4,
                vy: -Math.random() * 3 - 1,
                radius: Math.random() * 4 + 2,
                color: '#94a3b8',
                alpha: 0.7,
                life: 25
            });
        }

        players.forEach(p => {
            if (!p.alive) return;
            const dist = p.x - t.x;
            if (Math.abs(dist) < 240) {
                if (!p.isProtected) {
                    p.vx -= (dist > 0 ? 1 : -1) * 1.4;
                    if (Math.abs(dist) < 60) {
                        p.vy -= 1.8;
                        p.takeDamage(1.0, t.x, 'tornado');
                    }
                }
            }
        });
    }

    // LÓGICA DO GODZILLA
    updateGodzilla(threat, players, shelterManager, onScreenShake) {
        const gz = threat.boss;
        gz.actionTimer++;

        if (gz.x < gz.targetX) {
            gz.x += 1.5;
        }

        if (gz.actionTimer % 210 === 0) {
            if (onScreenShake) onScreenShake(12);
            if (sounds) sounds.playExplosion();
            this.addAnnouncement("🦖 GODZILLA PISOU COM FORÇA! TERREMOTO NO SOLO!", '#f97316');

            players.forEach(p => {
                if (p.alive && p.isGrounded && !p.isProtected) {
                    p.takeDamage(25, gz.x, 'stomp');
                    p.vy = -8;
                }
            });
        }

        if (gz.actionTimer % 420 > 300) {
            for (let i = 0; i < 3; i++) {
                this.addParticle({
                    x: gz.x + 30 + Math.random() * 20,
                    y: gz.y + Math.random() * 80,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -Math.random() * 4,
                    radius: 4,
                    color: '#8b5cf6',
                    alpha: 1,
                    life: 20
                });
            }

            if (gz.actionTimer % 420 === 360) {
                if (sounds) sounds.playKamehamehaBlast();
                this.addAnnouncement("🦖 RAIO ATÔMICO DO GODZILLA!", '#8b5cf6');
            }

            if (gz.actionTimer % 420 >= 360) {
                if (onScreenShake) onScreenShake(6);
                const beamY = this.groundY - 70;
                players.forEach(p => {
                    if (p.alive && p.y + p.height > beamY - 30 && p.y < beamY + 30) {
                        if (!shelterManager.isProtectedFromSide(p.x, p.y, gz.x)) {
                            p.takeDamage(2.0, gz.x, 'atomic_breath');
                        }
                    }
                });
            }
        }
    }

    // LÓGICA DO RAIO
    updateLightning(players, shelterManager, onScreenShake) {
        if (Math.random() < 0.08) {
            const strikeX = 40 + Math.random() * 1120;
            if (onScreenShake) onScreenShake(9);
            if (sounds) sounds.playExplosion();

            for (let yy = 0; yy < this.groundY; yy += 30) {
                this.addParticle({
                    x: strikeX + (Math.random() - 0.5) * 20,
                    y: yy,
                    vx: (Math.random() - 0.5) * 5,
                    vy: Math.random() * 5,
                    radius: Math.random() * 4 + 2,
                    color: '#38bdf8',
                    alpha: 1,
                    life: 18
                });
            }

            players.forEach(p => {
                if (p.alive && Math.abs(p.x - strikeX) < 65) {
                    if (!shelterManager.isProtectedFromAbove(p.x, p.y)) {
                        p.takeDamage(35, strikeX, 'lightning');
                    }
                }
            });
        }
    }

    // LÓGICA DO ALIEN
    updateAlien(threat, players, shelterManager) {
        const ufo = threat.boss;
        ufo.x += ufo.dir * 3.5;
        if (ufo.x < 150) { ufo.x = 150; ufo.dir = 1; }
        if (ufo.x > 1050) { ufo.x = 1050; ufo.dir = -1; }

        ufo.actionTimer++;
        if (ufo.actionTimer % 50 === 0) {
            this.addProjectile({
                x: ufo.x,
                y: ufo.y + 20,
                vx: (Math.random() - 0.5) * 2,
                vy: 8,
                radius: 6,
                damage: 20,
                type: 'plasma_laser',
                color: '#10b981'
            });
            if (sounds) sounds.playJump();
        }
    }

    // LÓGICA DA BOMBA NUCLEAR
    updateNuke(threat, players, shelterManager, onScreenShake) {
        threat.timer++;
        const remainingFrames = threat.maxDuration - threat.timer;
        const remainingSec = Math.max(0, Math.ceil(remainingFrames / 60));

        if (threat.timer % 60 === 0 && remainingSec <= 5) {
            this.addAnnouncement(`☢️ DETONAÇÃO NUCLEAR EM: ${remainingSec}s! CORRAM PARA OS BUNKERS!`, '#ef4444');
            if (sounds) sounds.playAlert();
        }

        if (remainingFrames === 60) {
            if (onScreenShake) onScreenShake(25);
            if (sounds) sounds.playExplosion();
            this.addAnnouncement("💥 EXPLOSÃO NUCLEAR DETONADA!", '#ffffff');

            players.forEach(p => {
                if (!p.alive) return;
                if (!shelterManager.isInsideBunker(p.x + p.width / 2, p.y + p.height / 2)) {
                    p.takeDamage(75, 600, 'nuke');
                }
            });
        }
    }

    // LÓGICA DO CHEFE PROCEDURAL UNIVERSAL (QUALQUER PALAVRA DIGITADA!)
    updateProceduralBoss(threat, players, shelterManager, onScreenShake) {
        const b = threat.boss;
        b.actionTimer++;

        b.x += Math.sin(b.actionTimer / 30) * 4;
        b.y = 170 + Math.cos(b.actionTimer / 40) * 25;

        this.addParticle({
            x: b.x + (Math.random() - 0.5) * 50,
            y: b.y + (Math.random() - 0.5) * 50,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            radius: Math.random() * 4 + 1.5,
            color: `hsl(${b.auraHue}, 90%, 60%)`,
            alpha: 0.9,
            life: 20
        });

        if (b.pattern === 'barrage' && b.actionTimer % 35 === 0) {
            for (let i = -1; i <= 1; i++) {
                this.addProjectile({
                    x: b.x,
                    y: b.y + 20,
                    vx: i * 3.5,
                    vy: 6.5,
                    radius: 7,
                    damage: 16,
                    type: 'procedural_orb',
                    color: `hsl(${b.auraHue}, 100%, 50%)`
                });
            }
            if (sounds) sounds.playJump();

        } else if (b.pattern === 'slammer' && b.actionTimer % 180 === 0) {
            this.addAnnouncement(`⚡ ${b.word.toUpperCase()} DESFERIU UM IMPACTO SÍSMICO!`, `hsl(${b.auraHue}, 100%, 70%)`);
            if (onScreenShake) onScreenShake(10);
            if (sounds) sounds.playExplosion();

            players.forEach(p => {
                if (p.alive && p.isGrounded && !p.isProtected) {
                    p.takeDamage(20, b.x, 'seismic');
                    p.vy = -6;
                }
            });

        } else if (b.pattern === 'lasers' && b.actionTimer % 70 === 0) {
            const living = players.filter(p => p.alive);
            const target = living[Math.floor(Math.random() * living.length)];
            if (target) {
                const angle = Math.atan2(target.y - b.y, target.x - b.x);
                this.addProjectile({
                    x: b.x,
                    y: b.y,
                    vx: Math.cos(angle) * 8.5,
                    vy: Math.sin(angle) * 8.5,
                    radius: 8,
                    damage: 20,
                    type: 'laser_bolt',
                    color: `hsl(${b.auraHue}, 100%, 65%)`
                });
                if (sounds) sounds.playJump();
            }

        } else if (b.pattern === 'meteorite' && b.actionTimer % 40 === 0) {
            this.addProjectile({
                x: Math.random() * 1200,
                y: -10,
                vx: (Math.random() - 0.5) * 3,
                vy: 6,
                radius: 8,
                damage: 22,
                type: 'meteor_fragment',
                color: `hsl(${b.auraHue}, 100%, 50%)`
            });
        }
    }

    // Atualiza projéteis e colisões com abrigos/jogadores
    updateProjectiles(players, shelterManager, onScreenShake) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx;
            p.y += p.vy;

            let destroyed = false;

            // Colisão com teto dos abrigos
            if (p.vy > 0 && (shelterManager.hitsRoof(p.x, p.y) || shelterManager.isProtectedFromAbove(p.x, p.y))) {
                destroyed = true;
                for (let k = 0; k < 6; k++) {
                    this.addParticle({
                        x: p.x,
                        y: p.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: -Math.random() * 4,
                        radius: 3,
                        color: '#60a5fa',
                        alpha: 1,
                        life: 15
                    });
                }
            }

            // Colisão com o chão da arena
            if (p.y >= this.groundY) {
                destroyed = true;
                for (let k = 0; k < 8; k++) {
                    this.addParticle({
                        x: p.x,
                        y: this.groundY,
                        vx: (Math.random() - 0.5) * 6,
                        vy: -Math.random() * 5,
                        radius: Math.random() * 4 + 2,
                        color: p.color,
                        alpha: 1,
                        life: 18
                    });
                }
            }

            // Colisão com jogadores
            if (!destroyed) {
                for (const player of players) {
                    if (player.alive && Math.abs(player.x + player.width / 2 - p.x) < player.width / 2 + p.radius &&
                        Math.abs(player.y + player.height / 2 - p.y) < player.height / 2 + p.radius) {
                        
                        const isAerial = p.vy > 1.5;
                        if (isAerial && shelterManager.isProtectedFromAbove(player.x + player.width / 2, player.y)) {
                            destroyed = true;
                            break;
                        }

                        player.takeDamage(p.damage, p.x, p.type);
                        destroyed = true;
                        break;
                    }
                }
            }

            if (destroyed || p.x < -50 || p.x > 1250 || p.y > 700) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 1 / pt.life;
            if (pt.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();

        this.projectiles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        this.particles.forEach(pt => {
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = Math.max(0, pt.alpha);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        if (this.activeThreat) {
            const threat = this.activeThreat;

            if (threat.type === 'goku' && threat.boss) {
                this.renderGoku(ctx, threat.boss);
            } else if (threat.type === 'tsunami' && threat.wave) {
                this.renderTsunami(ctx, threat.wave);
            } else if (threat.type === 'godzilla' && threat.boss) {
                this.renderGodzilla(ctx, threat.boss);
            } else if (threat.type === 'procedural' && threat.boss) {
                this.renderProceduralBoss(ctx, threat.boss);
            } else if (threat.type === 'alien' && threat.boss) {
                this.renderAlien(ctx, threat.boss);
            }
        }

        this.announcements.forEach(a => {
            ctx.save();
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = a.color;
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 8;
            ctx.globalAlpha = Math.max(0, a.alpha);
            ctx.fillText(a.text, 600, a.y);
            ctx.restore();
        });

        ctx.restore();
    }

    renderGoku(ctx, b) {
        ctx.save();

        const auraSize = 38 + Math.sin(Date.now() / 80) * 6;
        const grad = ctx.createRadialGradient(b.x, b.y, 10, b.x, b.y, auraSize);
        grad.addColorStop(0, 'rgba(255, 235, 59, 0.9)');
        grad.addColorStop(0.6, 'rgba(251, 191, 36, 0.45)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, auraSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(b.x - 12, b.y - 2, 24, 26, 4);
        ctx.fill();

        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(b.x - 12, b.y + 12, 24, 5);

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(b.x, b.y - 12, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(b.x - 15, b.y - 14);
        ctx.lineTo(b.x - 22, b.y - 28);
        ctx.lineTo(b.x - 12, b.y - 22);
        ctx.lineTo(b.x - 6, b.y - 36);
        ctx.lineTo(b.x + 2, b.y - 24);
        ctx.lineTo(b.x + 10, b.y - 38);
        ctx.lineTo(b.x + 14, b.y - 22);
        ctx.lineTo(b.x + 24, b.y - 26);
        ctx.lineTo(b.x + 16, b.y - 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(b.x - 5, b.y - 14, 3, 3);
        ctx.fillRect(b.x + 2, b.y - 14, 3, 3);

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText("⚡ GOKU (SUPER SAIYAJIN)", b.x, b.y - 44);

        if (b.subState === 'firing_kamehameha') {
            const beamHeight = 55;
            const beamY = b.y - beamHeight / 2;
            const beamX = b.facing === 1 ? b.x : 0;
            const beamW = b.facing === 1 ? (1200 - b.x) : b.x;

            ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 25;
            ctx.fillRect(beamX, beamY, beamW, beamHeight);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(beamX, beamY + 12, beamW, beamHeight - 24);

            ctx.beginPath();
            ctx.arc(b.x, b.y, 35, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }

    renderTsunami(ctx, wave) {
        ctx.save();
        const grad = ctx.createLinearGradient(wave.x - 80, 0, wave.x + 40, 0);
        grad.addColorStop(0, 'rgba(2, 132, 199, 0)');
        grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(wave.x - 100, this.groundY);
        ctx.quadraticCurveTo(wave.x, this.groundY - wave.height * 1.1, wave.x + 30, this.groundY - wave.height);
        ctx.lineTo(wave.x + 40, this.groundY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("🌊 TSUNAMI", wave.x, this.groundY - wave.height - 10);
        ctx.restore();
    }

    renderGodzilla(ctx, gz) {
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(gz.x, gz.y + gz.height);
        ctx.lineTo(gz.x + 20, gz.y + 40);
        ctx.lineTo(gz.x + 70, gz.y);
        ctx.lineTo(gz.x + 110, gz.y + 30);
        ctx.lineTo(gz.x + 140, gz.y + gz.height);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8b5cf6';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 15;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(gz.x + 30 + i * 20, gz.y + 20 + i * 15);
            ctx.lineTo(gz.x + 40 + i * 20, gz.y - 15 + i * 10);
            ctx.lineTo(gz.x + 50 + i * 20, gz.y + 25 + i * 15);
            ctx.fill();
        }

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(gz.x + 100, gz.y + 25, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("🦖 GODZILLA TITÂNICO", gz.x + 70, gz.y - 25);
        ctx.restore();
    }

    renderAlien(ctx, ufo) {
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath();
        ctx.arc(ufo.x, ufo.y - 8, 20, Math.PI, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(ufo.x, ufo.y, 45, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();

        const lightCols = ['#ef4444', '#facc15', '#10b981', '#38bdf8'];
        for (let i = -3; i <= 3; i++) {
            ctx.fillStyle = lightCols[(Math.abs(i) + Math.floor(Date.now() / 150)) % lightCols.length];
            ctx.beginPath();
            ctx.arc(ufo.x + i * 11, ufo.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("🛸 NAVE MÃE ALIENÍGENA", ufo.x, ufo.y - 32);
        ctx.restore();
    }

    renderProceduralBoss(ctx, b) {
        ctx.save();
        const hue = b.auraHue;

        const grad = ctx.createRadialGradient(b.x, b.y, 10, b.x, b.y, 50);
        grad.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
        grad.addColorStop(0.7, `hsla(${hue}, 90%, 50%, 0.3)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsl(${hue}, 80%, 25%)`;
        ctx.beginPath();
        const sides = 5 + (b.hash % 4);
        const radius = 28;
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides + Date.now() / 400;
            const px = b.x + Math.cos(angle) * radius;
            const py = b.y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `hsl(${hue}, 100%, 65%)`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(b.x - 7, b.y - 3, 4, 0, Math.PI * 2);
        ctx.arc(b.x + 7, b.y - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(`👑 [${b.word.toUpperCase()}]`, b.x, b.y - 45);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText("INVOCAÇÃO DINÂMICA", b.x, b.y - 32);

        ctx.restore();
    }
}
