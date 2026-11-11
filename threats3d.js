// threats3d.js - Motor de Ameaças 3D (Goku Roblox, Kamehameha Volumétrico, Meteoros e Bosses)

class ThreatManager3D {
    constructor(scene) {
        this.scene = scene;
        this.activeThreat = null;
        this.projectiles = [];
        this.particles = [];
        this.announcements = [];
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

        // QUALQUER OUTRA PALAVRA DIGITADA -> Boss Procedural 3D!
        return {
            type: 'procedural',
            name: rawText.toUpperCase(),
            raw: rawText
        };
    }

    // Invoca a ameaça 3D
    invoke(rawText, playerName) {
        // Remove ameaça anterior se houver
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

        if (info.type === 'goku') {
            this.initGoku();
        } else if (info.type === 'godzilla') {
            this.initGodzilla();
        } else if (info.type === 'procedural') {
            this.initProceduralBoss(info.raw);
        }

        this.addAnnouncement(`⚠️ ${playerName.toUpperCase()} INVOCOU: ${info.name.toUpperCase()}!`, '#ef4444');
    }

    // Inicializa Goku 3D
    initGoku() {
        const goku = robloxFactory.createRobloxGoku();
        goku.position.set(0, 14, 0);
        this.scene.add(goku);
        this.activeThreat.bossMesh = goku;

        // Cilindro do Kamehameha (inicialmente invisível)
        const beamGeo = new THREE.CylinderGeometry(2.2, 2.2, 140, 16);
        beamGeo.rotateX(Math.PI / 2);
        beamGeo.translate(0, 0, 70); // Origem nas mãos do Goku

        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);

        // Núcleo branco super concentrado
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

    // Inicializa Godzilla 3D
    initGodzilla() {
        const gz = robloxFactory.createRobloxAvatar(0x1e293b, 0x0f172a, 0x1e293b, '🦖 GODZILLA TITÂNICO', false);
        gz.scale.set(4.5, 4.5, 4.5);
        gz.position.set(-65, 0, -65);
        this.scene.add(gz);
        this.activeThreat.bossMesh = gz;
    }

    // Inicializa Boss Procedural 3D para qualquer palavra
    initProceduralBoss(word) {
        const boss = robloxFactory.createProceduralRobloxBoss(word);
        boss.position.set(0, 12, 0);
        this.scene.add(boss);
        this.activeThreat.bossMesh = boss;
    }

    addAnnouncement(text, color = '#ffffff') {
        this.announcements.push({
            text: text,
            color: color,
            alpha: 1.0,
            y: 120
        });
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
        // Notificações
        for (let i = this.announcements.length - 1; i >= 0; i--) {
            const a = this.announcements[i];
            a.alpha -= 0.007;
            if (a.alpha <= 0) this.announcements.splice(i, 1);
        }

        if (!this.activeThreat) return;

        const threat = this.activeThreat;
        threat.duration--;

        if (threat.duration <= 0) {
            this.addAnnouncement(`✅ O ATAQUE DE ${threat.name.toUpperCase()} TERMINOU!`, '#22c55e');
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
        } else if (threat.type === 'procedural') {
            this.updateProceduralBoss(threat, players, world3d, onScreenShake);
        }

        // Atualiza Projéteis 3D
        this.updateProjectiles(players, world3d);
    }

    // Lógica do Goku 3D (Super Saiyajin)
    updateGoku(threat, players, world3d, onScreenShake) {
        const goku = threat.bossMesh;
        threat.actionTimer++;

        // Rotação suave da aura dourada
        if (goku.auraMesh) {
            goku.auraMesh.rotation.y += 0.04;
            goku.auraMesh.scale.setScalar(1 + Math.sin(Date.now() / 150) * 0.12);
        }

        const living = players.filter(p => p.alive);
        const targetPlayer = living[0] || null;

        if (threat.subState === 'hover') {
            // Voa suavemente sobre os jogadores
            if (targetPlayer) {
                goku.position.x += (targetPlayer.mesh.position.x - goku.position.x) * 0.03;
                goku.position.z += (targetPlayer.mesh.position.z - goku.position.z) * 0.03;
                goku.lookAt(targetPlayer.mesh.position.x, goku.position.y, targetPlayer.mesh.position.z);
            }
            goku.position.y = 13 + Math.sin(Date.now() / 300) * 2;

            // Disparos de Esferas de Ki 3D ocasionais
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

            // A cada 5.5 segundos prepara o KAMEHAMEHA!
            if (threat.actionTimer > 320) {
                threat.subState = 'charging_kamehameha';
                threat.actionTimer = 0;

                // Teleporta para um ponto estratégico elevado da arena
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
                this.addAnnouncement("GOKU: KA... ME... HA... ME...", '#38bdf8');
            }

        } else if (threat.subState === 'charging_kamehameha') {
            if (threat.actionTimer > 110) {
                threat.subState = 'firing_kamehameha';
                threat.actionTimer = 0;
                threat.kamehamehaBeam.visible = true;
                this.addAnnouncement("GOKU: ...HAAAAAAAA!!!", '#0284c7');
                if (sounds) sounds.playKamehamehaBlast();
            }

        } else if (threat.subState === 'firing_kamehameha') {
            if (onScreenShake) onScreenShake(7);

            // Posiciona e orienta o raio a partir do Goku
            const beam = threat.kamehamehaBeam;
            beam.position.copy(goku.position);
            beam.rotation.copy(goku.rotation);

            // Varre suavemente a direção do feixe
            goku.rotation.y += Math.sin(threat.actionTimer * 0.05) * 0.015;

            // Vetor de direção do feixe
            const beamDir = new THREE.Vector3(0, 0, 1).applyEuler(goku.rotation);

            // Dano contínuo a quem estiver na trajetória do raio
            players.forEach(p => {
                if (!p.alive) return;
                const toPlayer = new THREE.Vector3().subVectors(p.mesh.position, goku.position);
                const proj = toPlayer.dot(beamDir);

                if (proj > 0 && proj < 130) {
                    const perp = new THREE.Vector3().subVectors(toPlayer, beamDir.clone().multiplyScalar(proj));
                    if (perp.length() < 5.0) {
                        // Verifica se uma barreira sólida ou bunker protege o jogador
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
                // Se estiver abrigado no bunker, a água não arrasta
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

    // Lógica do Godzilla 3D
    updateGodzilla(threat, players, world3d, onScreenShake) {
        const gz = threat.bossMesh;
        threat.actionTimer++;

        // Terremoto a cada 4 segundos
        if (threat.actionTimer % 240 === 0) {
            if (onScreenShake) onScreenShake(14);
            if (sounds) sounds.playExplosion();
            this.addAnnouncement("🦖 GODZILLA PISOU! TERREMOTO NO SOLO 3D!", '#f97316');

            players.forEach(p => {
                if (p.alive && p.mesh.position.y < 0.2 && !world3d.isInsideBunker(p.mesh.position)) {
                    p.takeDamage(25, gz.position);
                }
            });
        }
    }

    // Lógica do Boss Procedural 3D
    updateProceduralBoss(threat, players, world3d, onScreenShake) {
        const b = threat.bossMesh;
        threat.actionTimer++;

        b.position.x = Math.sin(threat.actionTimer * 0.03) * 35;
        b.position.z = Math.cos(threat.actionTimer * 0.03) * 35;
        b.position.y = 10 + Math.sin(threat.actionTimer * 0.05) * 2;

        if (threat.actionTimer % 40 === 0) {
            const living = players.filter(p => p.alive);
            const target = living[Math.floor(Math.random() * living.length)];
            if (target) {
                const orbGeo = new THREE.SphereGeometry(1.0, 10, 10);
                const orbMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
                const orb = new THREE.Mesh(orbGeo, orbMat);
                orb.position.copy(b.position);

                const dir = new THREE.Vector3().subVectors(target.mesh.position, b.position).normalize();
                this.addProjectile(orb, dir.multiplyScalar(0.85), 18, 'procedural_orb');
                if (sounds) sounds.playJump();
            }
        }
    }

    // Atualiza movimento e impacto de projéteis 3D
    updateProjectiles(players, world3d) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.position.add(p.velocity);

            let hit = false;

            // Se for meteoro e colidir com teto blindado de um bunker
            if (p.projectileType === 'meteor' && world3d.isProtectedFromAbove(p.position)) {
                hit = true;
            }

            // Colisão com o chão
            if (p.position.y <= 0) {
                hit = true;
            }

            // Colisão com jogadores
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

    // Limpeza de meshes ao fim da ameaça
    cleanup() {
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

        this.projectiles.forEach(p => this.scene.remove(p));
        this.projectiles = [];
        this.activeThreat = null;
    }
}
