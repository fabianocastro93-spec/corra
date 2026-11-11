// threats3d.js - Motor de Ameaças 3D com Notificações Visuais em Tempo Real

class ThreatManager3D {
    constructor(scene) {
        this.scene = scene;
        this.activeThreat = null;
        this.projectiles = [];
        this.particles = [];
        this.announcements = [];

        // Elementos visuais do HUD
        this.hudBarEl = document.getElementById('threatHudBar');
        this.hudNameEl = document.getElementById('threatHudName');
        this.hudAuthorEl = document.getElementById('threatHudAuthor');
        this.hudTimerEl = document.getElementById('threatHudCountdown');
    }

    // Identifica o tipo de catástrofe ou boss baseado no texto digitado
    parseInvocationText(rawText) {
        const text = rawText.trim().toLowerCase();

        if (text.includes('goku') || text.includes('kakaroto') || text.includes('sayajin') || text.includes('saiyajin') || text.includes('dragon ball')) {
            return { type: 'goku', name: 'Goku Roblox (Super Saiyajin)', raw: rawText };
        }
        if (text.includes('fogo') || text.includes('meteoro') || text.includes('chama') || text.includes('lava') || text.includes('inferno') || text.includes('cometa')) {
            return { type: 'fire_rain', name: 'Chuva de Meteoros 3D', raw: rawText };
        }
        if (text.includes('agua') || text.includes('água') || text.includes('tsunami') || text.includes('enchente') || text.includes('onda') || text.includes('maremoto')) {
            return { type: 'tsunami', name: 'Tsunami 3D Gigante', raw: rawText };
        }
        if (text.includes('godzilla') || text.includes('monstro') || text.includes('dragao') || text.includes('dragão') || text.includes('kaiju') || text.includes('dinossauro')) {
            return { type: 'godzilla', name: 'Godzilla Roblox Titânico', raw: rawText };
        }
        if (text.includes('tornado') || text.includes('vento') || text.includes('furacao') || text.includes('furacão')) {
            return { type: 'tornado', name: 'Tornado de Blocos 3D', raw: rawText };
        }
        if (text.includes('alien') || text.includes('ovni') || text.includes('ufo') || text.includes('disco voador')) {
            return { type: 'alien', name: 'Nave Alienígena 3D', raw: rawText };
        }
        if (text.includes('bomba') || text.includes('nuclear') || text.includes('nuke')) {
            return { type: 'nuke', name: 'Bomba Nuclear 3D', raw: rawText };
        }

        // QUALQUER OUTRA PALAVRA DIGITADA -> Boss Procedural 3D!
        return {
            type: 'procedural',
            name: rawText.toUpperCase(),
            raw: rawText
        };
    }

    // Invoca a ameaça 3D
    invoke(rawText, playerName) {
        this.cleanup();

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
            bossMesh: null,
            subState: 'hover',
            actionTimer: 0
        };

        if (sounds) sounds.playAlert();

        // Atualiza e exibe a barra HUD compacta de ameaça no topo da tela
        if (this.hudBarEl && this.hudNameEl && this.hudAuthorEl && this.hudTimerEl) {
            this.hudNameEl.textContent = `AMEAÇA: ${info.name.toUpperCase()}`;
            this.hudAuthorEl.textContent = `Por: ${playerName}`;
            this.hudTimerEl.textContent = `${durationSeconds}s`;
            this.hudBarEl.classList.remove('hidden');
        }

        // 3. Inicializa entidade 3D correspondente
        if (info.type === 'goku') {
            this.initGoku();
        } else if (info.type === 'godzilla') {
            this.initGodzilla();
        } else if (info.type === 'nuke') {
            this.initNuke();
        } else if (info.type === 'fire_rain') {
            this.initFireRain();
        } else if (info.type === 'tsunami') {
            this.initTsunami();
        } else if (info.type === 'tornado') {
            this.initTornado();
        } else if (info.type === 'alien') {
            this.initAlien();
        } else {
            this.initProceduralBoss(info.raw);
        }
    }

    // 1. Inicializa Goku 3D (Hoverando na altura ideal em frente à arena)
    initGoku() {
        const goku = robloxFactory.createRobloxGoku();
        goku.position.set(0, 8, -14);
        this.scene.add(goku);
        this.activeThreat.bossMesh = goku;

        // Cilindro do Kamehameha
        const beamGeo = new THREE.CylinderGeometry(2.2, 2.2, 140, 16);
        beamGeo.rotateX(Math.PI / 2);
        beamGeo.translate(0, 0, 70);

        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);

        const innerBeamGeo = new THREE.CylinderGeometry(1.2, 1.2, 140, 16);
        innerBeamGeo.rotateX(Math.PI / 2);
        innerBeamGeo.translate(0, 0, 70);
        const innerBeamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const innerBeam = new THREE.Mesh(innerBeamGeo, innerBeamMat);
        beamMesh.add(innerBeam);

        beamMesh.visible = false;
        this.scene.add(beamMesh);
        this.activeThreat.kamehamehaBeam = beamMesh;
    }

    // 2. Inicializa Godzilla 3D Titânico bem na frente dos jogadores
    initGodzilla() {
        const gz = robloxFactory.createRobloxGodzilla();
        gz.position.set(0, 0, -32);
        gz.rotation.y = 0; // Olhando de frente para os jogadores
        this.scene.add(gz);
        this.activeThreat.bossMesh = gz;
    }

    // 3. Inicializa Bomba Nuclear 3D caindo lentamente do céu com alerta
    initNuke() {
        const nuke = robloxFactory.createNuclearBomb();
        nuke.position.set(0, 75, 0);
        this.scene.add(nuke);
        this.activeThreat.bossMesh = nuke;
        this.activeThreat.hasDetonated = false;
    }

    // 4. Inicializa Chuva de Meteoros 3D
    initFireRain() {
        // Criada dinamicamente no updateFireRain
    }

    // 5. Inicializa Tsunami 3D
    initTsunami() {
        const waveGeo = new THREE.BoxGeometry(160, 12, 5);
        const waveMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);

        // Crista de espuma branca no topo da onda
        const foamGeo = new THREE.BoxGeometry(160, 1.5, 5.5);
        const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const foam = new THREE.Mesh(foamGeo, foamMat);
        foam.position.y = 6.0;
        wave.add(foam);

        wave.position.set(0, 6, -75);
        this.scene.add(wave);
        this.activeThreat.waveMesh = wave;
        if (sounds) sounds.playWaterSplash();
    }

    // 6. Inicializa Tornado 3D
    initTornado() {
        const tornado = robloxFactory.createTornadoGroup();
        tornado.position.set(0, 0, -20);
        this.scene.add(tornado);
        this.activeThreat.bossMesh = tornado;
    }

    // 7. Inicializa Nave Alienígena 3D
    initAlien() {
        const ufoGroup = new THREE.Group();
        const diskGeo = new THREE.CylinderGeometry(5, 7, 1.5, 16);
        const diskMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
        const disk = new THREE.Mesh(diskGeo, diskMat);
        ufoGroup.add(disk);

        const domeGeo = new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 0.75;
        ufoGroup.add(dome);

        ufoGroup.position.set(0, 14, -15);
        this.scene.add(ufoGroup);
        this.activeThreat.bossMesh = ufoGroup;
    }

    // 8. Inicializa Boss Procedural 3D para qualquer palavra livre (bem na frente e na altura dos olhos)
    initProceduralBoss(word) {
        const boss = robloxFactory.createProceduralRobloxBoss(word);
        boss.position.set(0, 3.5, -18);
        this.scene.add(boss);
        this.activeThreat.bossMesh = boss;
    }

    // Adiciona projétil 3D
    addProjectile(mesh, velocity, damage, type) {
        mesh.velocity = velocity;
        mesh.damage = damage;
        mesh.projectileType = type;
        this.scene.add(mesh);
        this.projectiles.push(mesh);
    }

    // Atualização principal da ameaça 3D
    update(players, world3d, onScreenShake) {
        if (!this.activeThreat) return;

        const threat = this.activeThreat;
        threat.duration--;

        // Atualiza contador em tempo real no HUD
        if (this.hudTimerEl) {
            const sec = Math.max(0, Math.ceil(threat.duration / 60));
            this.hudTimerEl.textContent = `${sec}s`;
        }

        if (threat.duration <= 0) {
            this.cleanup();
            return;
        }

        if (threat.type === 'goku') {
            this.updateGoku(threat, players, world3d, onScreenShake);
        } else if (threat.type === 'fire_rain') {
            this.updateFireRain(players, world3d, onScreenShake);
        } else if (threat.type === 'tsunami') {
            this.updateTsunami(threat, players, world3d, onScreenShake);
        } else if (threat.type === 'godzilla') {
            this.updateGodzilla(threat, players, world3d, onScreenShake);
        } else if (threat.type === 'alien') {
            this.updateAlien(threat, players, world3d);
        } else if (threat.type === 'nuke') {
            this.updateNuke(threat, players, world3d, onScreenShake);
        } else if (threat.type === 'tornado') {
            this.updateTornado(threat, players, world3d, onScreenShake);
        } else if (threat.type === 'procedural') {
            this.updateProceduralBoss(threat, players, world3d, onScreenShake);
        }

        this.updateProjectiles(players, world3d);
    }

    // Lógica do Goku 3D
    updateGoku(threat, players, world3d, onScreenShake) {
        const goku = threat.bossMesh;
        threat.actionTimer++;

        if (goku.auraMesh) {
            goku.auraMesh.rotation.y += 0.04;
            goku.auraMesh.scale.setScalar(1 + Math.sin(Date.now() / 150) * 0.12);
        }

        const living = players.filter(p => p.alive);
        const targetPlayer = living[0] || null;

        if (threat.subState === 'hover') {
            if (targetPlayer) {
                goku.position.x += (targetPlayer.mesh.position.x - goku.position.x) * 0.03;
                goku.position.z += (targetPlayer.mesh.position.z - goku.position.z) * 0.03;
                goku.lookAt(targetPlayer.mesh.position.x, goku.position.y, targetPlayer.mesh.position.z);
            }
            goku.position.y = 13 + Math.sin(Date.now() / 300) * 2;

            if (threat.actionTimer % 45 === 0 && targetPlayer) {
                const target = living[Math.floor(Math.random() * living.length)];
                const orbGeo = new THREE.SphereGeometry(0.8, 12, 12);
                const orbMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
                const orbMesh = new THREE.Mesh(orbGeo, orbMat);
                orbMesh.position.copy(goku.position);

                const dir = new THREE.Vector3().subVectors(target.mesh.position, goku.position).normalize();
                this.addProjectile(orbMesh, dir.multiplyScalar(0.9), 18, 'ki_blast');
                if (sounds) sounds.playJump();
            }

            if (threat.actionTimer > 300) {
                threat.subState = 'charging_kamehameha';
                threat.actionTimer = 0;

                const angles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
                const ang = angles[Math.floor(Math.random() * angles.length)];
                goku.position.set(Math.cos(ang) * 45, 6, Math.sin(ang) * 45);

                if (targetPlayer) {
                    goku.lookAt(targetPlayer.mesh.position.x, 2, targetPlayer.mesh.position.z);
                }

                if (sounds) {
                    sounds.playTeleport();
                    sounds.playChargeEnergy(2.0);
                }

                if (this.hudNameEl) this.hudNameEl.textContent = "GOKU: KA... ME... HA... ME...";
            }

        } else if (threat.subState === 'charging_kamehameha') {
            if (threat.actionTimer > 110) {
                threat.subState = 'firing_kamehameha';
                threat.actionTimer = 0;
                threat.kamehamehaBeam.visible = true;
                if (sounds) sounds.playKamehamehaBlast();
                if (this.hudNameEl) this.hudNameEl.textContent = "GOKU: ...HAAAAAAAA!!!";
            }

        } else if (threat.subState === 'firing_kamehameha') {
            if (onScreenShake) onScreenShake(7);

            const beam = threat.kamehamehaBeam;
            beam.position.copy(goku.position);
            beam.rotation.copy(goku.rotation);

            goku.rotation.y += Math.sin(threat.actionTimer * 0.05) * 0.015;

            const beamDir = new THREE.Vector3(0, 0, 1).applyEuler(goku.rotation);

            players.forEach(p => {
                if (!p.alive) return;
                const toPlayer = new THREE.Vector3().subVectors(p.mesh.position, goku.position);
                const proj = toPlayer.dot(beamDir);

                if (proj > 0 && proj < 130) {
                    const perp = new THREE.Vector3().subVectors(toPlayer, beamDir.clone().multiplyScalar(proj));
                    if (perp.length() < 5.0) {
                        const isProtected = world3d.isProtectedFromThreat(p.mesh.position, goku.position);
                        if (!isProtected) {
                            p.takeDamage(1.5, goku.position);
                        }
                    }
                }
            });

            if (threat.actionTimer > 105) {
                beam.visible = false;
                threat.subState = 'hover';
                threat.actionTimer = 0;
                if (this.hudNameEl) this.hudNameEl.textContent = `AMEAÇA: ${threat.name.toUpperCase()}`;
            }
        }
    }

    // Lógica da Chuva de Meteoros 3D
    updateFireRain(players, world3d, onScreenShake) {
        if (Math.random() < 0.25) {
            const rx = (Math.random() - 0.5) * 150;
            const rz = (Math.random() - 0.5) * 150;

            const meteorGeo = new THREE.DodecahedronGeometry(1.2, 1);
            const meteorMat = new THREE.MeshStandardMaterial({
                color: 0xef4444,
                emissive: 0xf97316,
                emissiveIntensity: 0.6
            });
            const meteor = new THREE.Mesh(meteorGeo, meteorMat);
            meteor.position.set(rx, 45, rz);

            const vel = new THREE.Vector3((Math.random() - 0.5) * 0.2, -0.85, (Math.random() - 0.5) * 0.2);
            this.addProjectile(meteor, vel, 22, 'meteor');
        }
    }

    // Lógica do Tsunami 3D
    updateTsunami(threat, players, world3d, onScreenShake) {
        if (!threat.waveMesh) {
            const waveGeo = new THREE.BoxGeometry(160, 10, 4);
            const waveMat = new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                transparent: true,
                opacity: 0.75,
                roughness: 0.2
            });
            const wave = new THREE.Mesh(waveGeo, waveMat);
            wave.position.set(0, 5, -80);
            this.scene.add(wave);
            threat.waveMesh = wave;
            if (sounds) sounds.playWaterSplash();
        }

        const wave = threat.waveMesh;
        wave.position.z += 0.8;
        if (onScreenShake) onScreenShake(2);

        players.forEach(p => {
            if (!p.alive) return;
            if (Math.abs(p.mesh.position.z - wave.position.z) < 3.5) {
                if (!world3d.isInsideBunker(p.mesh.position)) {
                    p.takeDamage(1.5, wave.position);
                    p.mesh.position.z += 1.8;
                }
            }
        });

        if (wave.position.z > 85) {
            wave.position.z = -85;
            if (sounds) sounds.playWaterSplash();
        }
    }

    // Lógica do Godzilla 3D (Caminha, ruge, treme o chão e dispara Sopro Atômico)
    updateGodzilla(threat, players, world3d, onScreenShake) {
        const gz = threat.bossMesh;
        if (!gz) return;
        threat.actionTimer++;

        const living = players.filter(p => p.alive);
        const target = living.find(p => p.isHuman) || living[0] || null;

        // 1. Caminhada em direção ao alvo
        if (target) {
            const toTarget = new THREE.Vector3().subVectors(target.mesh.position, gz.position);
            toTarget.y = 0;
            const dist = toTarget.length();

            if (dist > 8) {
                toTarget.normalize();
                gz.position.addScaledVector(toTarget, 0.12);
                gz.rotation.y = Math.atan2(toTarget.x, toTarget.z);
            }
        }

        // Animação de caminhada (pernas, braços e cauda)
        const walkCycle = Math.sin(threat.actionTimer * 0.12);
        if (gz.parts.leftLegGroup) gz.parts.leftLegGroup.rotation.x = walkCycle * 0.5;
        if (gz.parts.rightLegGroup) gz.parts.rightLegGroup.rotation.x = -walkCycle * 0.5;
        if (gz.parts.leftArmGroup) gz.parts.leftArmGroup.rotation.x = -walkCycle * 0.35;
        if (gz.parts.rightArmGroup) gz.parts.rightArmGroup.rotation.x = walkCycle * 0.35;
        if (gz.parts.tailGroup) gz.parts.tailGroup.rotation.y = Math.sin(threat.actionTimer * 0.08) * 0.3;

        // Passos pesados que tremem o chão
        if (threat.actionTimer % 35 === 0) {
            if (onScreenShake) onScreenShake(4);
            if (sounds) sounds.playHit();
        }

        // Ciclo do Sopro Atômico (a cada 200 frames)
        const cycle = threat.actionTimer % 200;

        // Carregamento de energia nas placas dorsais (azul neon brilhante)
        if (cycle >= 120 && cycle < 160) {
            if (gz.parts.dorsalSpikes) {
                const pulse = 1.0 + Math.sin(threat.actionTimer * 0.4) * 0.8;
                gz.parts.dorsalSpikes.forEach(s => s.material.emissiveIntensity = pulse * 1.5);
            }
            if (cycle === 120 && sounds) sounds.playChargeEnergy(1.2);
        } else if (cycle >= 160 && cycle < 200) {
            // DISPARO DO SOPRO ATÔMICO
            if (gz.parts.breathMesh) gz.parts.breathMesh.visible = true;
            gz.rotation.y += Math.sin(threat.actionTimer * 0.06) * 0.02;

            if (threat.actionTimer % 6 === 0) {
                if (onScreenShake) onScreenShake(7);
                if (sounds) sounds.playKamehamehaBlast();
            }

            // Dano a qualquer jogador na direção do raio
            const breathDir = new THREE.Vector3(0, 0, 1).applyEuler(gz.rotation);
            living.forEach(p => {
                const toP = new THREE.Vector3().subVectors(p.mesh.position, gz.position);
                const dist = toP.length();
                if (dist < 85) {
                    toP.normalize();
                    if (breathDir.dot(toP) > 0.85) {
                        const isSafe = world3d.isInsideBunker(p.mesh.position) || world3d.isProtectedFromThreat(p.mesh.position, gz.position);
                        if (!isSafe) {
                            p.takeDamage(1.8, gz.position);
                        }
                    }
                }
            });
        } else {
            if (gz.parts.breathMesh) gz.parts.breathMesh.visible = false;
            if (gz.parts.dorsalSpikes) {
                gz.parts.dorsalSpikes.forEach(s => s.material.emissiveIntensity = 0.5);
            }
        }
    }

    // Lógica da Nave Alienígena 3D
    updateAlien(threat, players, world3d) {
        const ufo = threat.bossMesh;
        if (!ufo) return;
        threat.actionTimer++;

        ufo.position.x = Math.sin(threat.actionTimer * 0.02) * 40;
        ufo.position.z = Math.cos(threat.actionTimer * 0.02) * 40;
        ufo.rotation.y += 0.05;

        if (threat.actionTimer % 45 === 0) {
            const living = players.filter(p => p.alive);
            const target = living[Math.floor(Math.random() * living.length)];
            if (target) {
                const laserGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
                const laserMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
                const laser = new THREE.Mesh(laserGeo, laserMat);
                laser.position.copy(ufo.position);

                const dir = new THREE.Vector3().subVectors(target.mesh.position, ufo.position).normalize();
                this.addProjectile(laser, dir.multiplyScalar(0.9), 18, 'laser');
                if (sounds) sounds.playJump();
            }
        }
    }

    // Lógica da Bomba Nuclear 3D (Desce do céu, toca alarme e gera cogumelo de fogo titânico)
    updateNuke(threat, players, world3d, onScreenShake) {
        const nuke = threat.bossMesh;
        threat.actionTimer++;

        if (nuke && !threat.hasDetonated) {
            // Desce gradualmente do céu em direção ao chão
            nuke.position.y -= 0.28;
            nuke.rotation.y += 0.03;

            // Alerta sonoro periódico
            if (threat.actionTimer % 60 === 0 && sounds) {
                sounds.playAlert();
            }

            // Impacto no chão -> DETONAÇÃO NUCLEAR!
            if (nuke.position.y <= 1.2) {
                threat.hasDetonated = true;
                nuke.visible = false;

                // Cria esfera de bola de fogo nuclear titânica
                const fireballGeo = new THREE.SphereGeometry(3, 24, 24);
                const fireballMat = new THREE.MeshBasicMaterial({
                    color: 0xff3b00,
                    transparent: true,
                    opacity: 0.95
                });
                const fireball = new THREE.Mesh(fireballGeo, fireballMat);
                fireball.position.set(nuke.position.x, 2, nuke.position.z);
                this.scene.add(fireball);
                threat.fireballMesh = fireball;

                if (onScreenShake) onScreenShake(30);
                if (sounds) sounds.playExplosion();

                // Dano massivo a todos fora dos Bunkers
                players.forEach(p => {
                    if (p.alive && !world3d.isInsideBunker(p.mesh.position)) {
                        p.takeDamage(85, fireball.position);
                    }
                });
            }
        }

        // Expansão da onda de choque de fogo
        if (threat.fireballMesh) {
            threat.fireballMesh.scale.addScalar(0.9);
            threat.fireballMesh.material.opacity *= 0.95;
            if (threat.fireballMesh.scale.x > 35) {
                this.scene.remove(threat.fireballMesh);
                threat.fireballMesh = null;
            }
        }
    }

    // Lógica do Tornado 3D (Vórtice giratório de blocos)
    updateTornado(threat, players, world3d, onScreenShake) {
        const tornado = threat.bossMesh;
        if (!tornado) return;
        threat.actionTimer++;

        // Movimento circular pelo mapa
        tornado.position.x = Math.sin(threat.actionTimer * 0.015) * 36;
        tornado.position.z = Math.cos(threat.actionTimer * 0.015) * 36;

        // Rotação dos blocos do vórtice
        if (tornado.blocks) {
            tornado.blocks.forEach(b => {
                b.userData.angle += b.userData.speed;
                const r = b.userData.baseRadius + Math.sin(threat.actionTimer * 0.05 + b.userData.layer) * 0.4;
                b.position.x = Math.cos(b.userData.angle) * r;
                b.position.z = Math.sin(b.userData.angle) * r;
                b.rotation.x += 0.04;
                b.rotation.y += 0.04;
            });
        }

        if (threat.actionTimer % 20 === 0 && onScreenShake) {
            onScreenShake(2);
        }

        // Puxa e arremessa jogadores desprotegidos
        players.forEach(p => {
            if (!p.alive) return;
            const dist = p.mesh.position.distanceTo(tornado.position);
            if (dist < 14 && !world3d.isInsideBunker(p.mesh.position)) {
                p.takeDamage(0.8, tornado.position);
                p.velocity.y = 0.35; // Arremessa para o alto
                const pullDir = new THREE.Vector3().subVectors(tornado.position, p.mesh.position).normalize();
                p.velocity.x += pullDir.x * 0.15;
                p.velocity.z += pullDir.z * 0.15;
            }
        });
    }

    // Lógica do Boss Procedural 3D para qualquer palavra livre digitada
    updateProceduralBoss(threat, players, world3d, onScreenShake) {
        const b = threat.bossMesh;
        if (!b) return;
        threat.actionTimer++;

        // Movimento suave a nível dos olhos (y = 3.5 a 4.5)
        b.position.x = Math.sin(threat.actionTimer * 0.025) * 30;
        b.position.z = Math.cos(threat.actionTimer * 0.025) * 30;
        b.position.y = 3.5 + Math.sin(threat.actionTimer * 0.04) * 1.0;

        const living = players.filter(p => p.alive);
        const target = living.find(p => p.isHuman) || living[0] || null;
        if (target) {
            b.lookAt(target.mesh.position.x, b.position.y, target.mesh.position.z);
        }

        // Disparo de esferas de energia mágicas
        if (threat.actionTimer % 40 === 0 && living.length > 0) {
            const randTarget = living[Math.floor(Math.random() * living.length)];
            const orbGeo = new THREE.SphereGeometry(1.2, 12, 12);
            const orbMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
            const orb = new THREE.Mesh(orbGeo, orbMat);
            orb.position.copy(b.position);

            const dir = new THREE.Vector3().subVectors(randTarget.mesh.position, b.position).normalize();
            this.addProjectile(orb, dir.multiplyScalar(0.75), 18, 'procedural_orb');
            if (sounds) sounds.playJump();
        }
    }

    // Atualiza movimento e impacto de projéteis 3D
    updateProjectiles(players, world3d) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.position.add(p.velocity);

            let hit = false;

            if (p.projectileType === 'meteor' && world3d.isProtectedFromAbove(p.position)) {
                hit = true;
            }

            if (p.position.y <= 0) {
                hit = true;
            }

            if (!hit) {
                for (const player of players) {
                    if (player.alive && p.position.distanceTo(player.mesh.position) < 2.0) {
                        player.takeDamage(p.damage, p.position);
                        hit = true;
                        break;
                    }
                }
            }

            if (hit || p.position.length() > 150) {
                this.scene.remove(p);
                this.projectiles.splice(i, 1);
            }
        }
    }

    cleanup() {
        if (this.hudBarEl) this.hudBarEl.classList.add('hidden');

        if (!this.activeThreat) return;

        if (this.activeThreat.bossMesh) {
            this.scene.remove(this.activeThreat.bossMesh);
        }
        if (this.activeThreat.kamehamehaBeam) {
            this.scene.remove(this.activeThreat.kamehamehaBeam);
        }
        if (this.activeThreat.waveMesh) {
            this.scene.remove(this.activeThreat.waveMesh);
        }
        if (this.activeThreat.fireballMesh) {
            this.scene.remove(this.activeThreat.fireballMesh);
        }

        this.projectiles.forEach(p => this.scene.remove(p));
        this.projectiles = [];
        this.activeThreat = null;
    }
}
