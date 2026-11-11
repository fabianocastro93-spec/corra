// world3d.js - Cenário 3D com Baseplate Roblox (Studs), Bunkers com Tetos e Barreiras

class World3D {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.structures = [];

        this.createBaseplate();
        this.createShelters();
        this.createLighting();
    }

    // Textura procedural clássica de pinos (Studs) do Roblox
    createStudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Cor de base cinza ardósia clássico do Roblox
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 0, 64, 64);

        // Borda sutil do bloco
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 64, 64);

        // Pinos (Studs) circulares clássicos
        const drawStud = (cx, cy) => {
            // Sombra do stud
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(cx + 1, cy + 1, 9, 0, Math.PI * 2);
            ctx.fill();

            // Corpo do stud
            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(cx, cy, 9, 0, Math.PI * 2);
            ctx.fill();

            // Brilho no topo do stud
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.arc(cx - 1, cy - 1, 6, 0, Math.PI * 2);
            ctx.fill();
        };

        drawStud(16, 16);
        drawStud(48, 16);
        drawStud(16, 48);
        drawStud(48, 48);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);
        return texture;
    }

    // Cria a grande baseplate plana do Roblox
    createBaseplate() {
        const studTex = this.createStudTexture();
        const groundGeo = new THREE.PlaneGeometry(180, 180);
        const groundMat = new THREE.MeshStandardMaterial({
            map: studTex,
            roughness: 0.8,
            metalness: 0.1
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Cercas neon na borda do mapa
        const borderGeo = new THREE.BoxGeometry(180, 2.5, 1.5);
        const borderMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            emissive: 0x0284c7,
            emissiveIntensity: 0.4
        });

        const b1 = new THREE.Mesh(borderGeo, borderMat);
        b1.position.set(0, 1.25, 90);
        const b2 = new THREE.Mesh(borderGeo, borderMat);
        b2.position.set(0, 1.25, -90);
        const b3 = new THREE.Mesh(borderGeo, borderMat);
        b3.rotation.y = Math.PI / 2;
        b3.position.set(90, 1.25, 0);
        const b4 = new THREE.Mesh(borderGeo, borderMat);
        b4.rotation.y = Math.PI / 2;
        b4.position.set(-90, 1.25, 0);

        this.scene.add(b1, b2, b3, b4);
    }

    // Iluminação do cenário 3D
    createLighting() {
        // Luz ambiente
        const ambient = new THREE.AmbientLight(0xffffff, 0.45);
        this.scene.add(ambient);

        // Luz solar principal com projeção de sombras suaves
        const sun = new THREE.DirectionalLight(0xfffaed, 0.95);
        sun.position.set(50, 80, 40);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 200;
        sun.shadow.camera.left = -90;
        sun.shadow.camera.right = 90;
        sun.shadow.camera.top = 90;
        sun.shadow.camera.bottom = -90;
        this.scene.add(sun);

        // Luz de preenchimento azulada da atmosfera
        const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.35);
        this.scene.add(hemiLight);
    }

    // Cria Bunkers 3D com Telhados Blindados e Paredes de Proteção
    createShelters() {
        const matConcrete = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const matRoof = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.3 });
        const matWallAccent = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.3 });
        const matWarning = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.2 });

        // Helper para construir um Bunker Completo com Telhado e Porta
        const buildBunker = (id, name, x, z, width, depth, height, accentColor) => {
            const group = new THREE.Group();
            group.position.set(x, 0, z);

            const wallThickness = 1.2;
            const roofThickness = 1.0;
            const doorWidth = 5.0;

            const matCustomAccent = new THREE.MeshStandardMaterial({
                color: accentColor,
                emissive: accentColor,
                emissiveIntensity: 0.4
            });

            // 1. Teto Blindado (Protege 100% de ataques aéreos)
            const roofGeo = new THREE.BoxGeometry(width + 1.0, roofThickness, depth + 1.0);
            const roof = new THREE.Mesh(roofGeo, matRoof);
            roof.position.set(0, height + roofThickness / 2, 0);
            roof.castShadow = true;
            roof.receiveShadow = true;
            group.add(roof);

            // Faixa neon no teto
            const roofStripe = new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.2, 0.6), matCustomAccent);
            roofStripe.position.set(0, height + roofThickness + 0.1, depth / 2);
            group.add(roofStripe);

            // 2. Parede Traseira
            const backWallGeo = new THREE.BoxGeometry(width, height, wallThickness);
            const backWall = new THREE.Mesh(backWallGeo, matConcrete);
            backWall.position.set(0, height / 2, -depth / 2 + wallThickness / 2);
            backWall.castShadow = true;
            backWall.receiveShadow = true;
            group.add(backWall);

            // 3. Paredes Laterais (Esquerda e Direita)
            const sideWallGeo = new THREE.BoxGeometry(wallThickness, height, depth);
            const leftWall = new THREE.Mesh(sideWallGeo, matConcrete);
            leftWall.position.set(-width / 2 + wallThickness / 2, height / 2, 0);
            leftWall.castShadow = true;
            leftWall.receiveShadow = true;
            group.add(leftWall);

            const rightWall = new THREE.Mesh(sideWallGeo, matConcrete);
            rightWall.position.set(width / 2 - wallThickness / 2, height / 2, 0);
            rightWall.castShadow = true;
            rightWall.receiveShadow = true;
            group.add(rightWall);

            // 4. Parede Frontal com Abertura para Porta
            const frontWallW = (width - doorWidth) / 2;
            const frontWallGeo = new THREE.BoxGeometry(frontWallW, height, wallThickness);

            const frontLeft = new THREE.Mesh(frontWallGeo, matConcrete);
            frontLeft.position.set(-doorWidth / 2 - frontWallW / 2, height / 2, depth / 2 - wallThickness / 2);
            frontLeft.castShadow = true;
            group.add(frontLeft);

            const frontRight = new THREE.Mesh(frontWallGeo, matConcrete);
            frontRight.position.set(doorWidth / 2 + frontWallW / 2, height / 2, depth / 2 - wallThickness / 2);
            frontRight.castShadow = true;
            group.add(frontRight);

            // Luz interior do bunker (indica área segura)
            const interiorLight = new THREE.PointLight(accentColor, 1.2, 16);
            interiorLight.position.set(0, height - 1.0, 0);
            group.add(interiorLight);

            this.scene.add(group);

            const bunkerData = {
                id,
                name,
                type: 'bunker',
                x,
                z,
                w: width,
                d: depth,
                h: height,
                bounds: {
                    minX: x - width / 2,
                    maxX: x + width / 2,
                    minZ: z - depth / 2,
                    maxZ: z + depth / 2,
                    roofY: height + roofThickness
                },
                innerBounds: {
                    minX: x - width / 2 + wallThickness,
                    maxX: x + width / 2 - wallThickness,
                    minZ: z - depth / 2 + wallThickness,
                    maxZ: z + depth / 2 - wallThickness,
                    height: height
                }
            };

            this.structures.push(bunkerData);
            return bunkerData;
        };

        // Bunker 1: Alpha (Lado Esquerdo)
        buildBunker('bunker_alpha', 'Bunker Alpha', -45, 0, 18, 16, 6.5, 0x00e5ff);

        // Bunker 2: Ômega (Lado Direito)
        buildBunker('bunker_omega', 'Bunker Ômega', 45, 0, 18, 16, 6.5, 0xa855f7);

        // 3. Cúpula Central de Defesa (com 4 Colunas e Teto)
        const buildDome = (x, z) => {
            const group = new THREE.Group();
            group.position.set(x, 0, z);

            const colGeo = new THREE.CylinderGeometry(0.8, 0.8, 7.5, 12);
            const matCol = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });

            const offsets = [[-8, -8], [8, -8], [-8, 8], [8, 8]];
            offsets.forEach(([cx, cz]) => {
                const col = new THREE.Mesh(colGeo, matCol);
                col.position.set(cx, 7.5 / 2, cz);
                col.castShadow = true;
                group.add(col);
            });

            // Teto da Cúpula
            const domeGeo = new THREE.SphereGeometry(12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const matDome = new THREE.MeshStandardMaterial({
                color: 0x10b981,
                roughness: 0.3,
                metalness: 0.5,
                side: THREE.DoubleSide
            });
            const dome = new THREE.Mesh(domeGeo, matDome);
            dome.position.y = 7.5;
            dome.castShadow = true;
            group.add(dome);

            this.scene.add(group);

            this.structures.push({
                id: 'dome_central',
                name: 'Cúpula Central',
                type: 'dome',
                x,
                z,
                radius: 12,
                roofY: 8.5,
                bounds: {
                    minX: x - 12,
                    maxX: x + 12,
                    minZ: z - 12,
                    maxZ: z + 12
                }
            });
        };

        buildDome(0, -35);

        // 4. Barreiras Verticais Anti-Impacto (Blocos maciços para bloquear Kamehameha e Tsunami)
        const buildBarrier = (id, name, x, z, w, h, d, color = 0xf59e0b) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x, h / 2, z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Listra de alerta
            const stripeGeo = new THREE.BoxGeometry(w + 0.1, 0.8, d + 0.1);
            const matStripe = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
            const stripe = new THREE.Mesh(stripeGeo, matStripe);
            stripe.position.y = h / 2 - 0.5;
            mesh.add(stripe);

            this.scene.add(mesh);

            this.structures.push({
                id,
                name,
                type: 'barrier',
                x,
                z,
                w,
                h,
                d,
                bounds: {
                    minX: x - w / 2,
                    maxX: x + w / 2,
                    minZ: z - d / 2,
                    maxZ: z + d / 2,
                    height: h
                }
            });
        };

        // Barreiras de choque no quadrante sul
        buildBarrier('barrier_1', 'Barreira de Choque Alpha', -22, 28, 16, 5.5, 2.5, 0xf59e0b);
        buildBarrier('barrier_2', 'Barreira de Choque Ômega', 22, 28, 16, 5.5, 2.5, 0xf59e0b);
    }

    // Verifica se a posição 3D do personagem está protegida contra ataques do céu
    isProtectedFromAbove(pos) {
        for (const s of this.structures) {
            if (s.type === 'bunker') {
                if (pos.x >= s.bounds.minX && pos.x <= s.bounds.maxX &&
                    pos.z >= s.bounds.minZ && pos.z <= s.bounds.maxZ &&
                    pos.y <= s.bounds.roofY) {
                    return true;
                }
            } else if (s.type === 'dome') {
                const dist = Math.hypot(pos.x - s.x, pos.z - s.z);
                if (dist <= s.radius && pos.y <= s.roofY) {
                    return true;
                }
            }
        }
        return false;
    }

    // Verifica se há uma barreira sólida ou parede entre o jogador e a origem da ameaça (ex: Kamehameha)
    isProtectedFromThreat(pos, threatPos) {
        // Se estiver no interior de um bunker, está totalmente protegido
        if (this.isInsideBunker(pos)) return true;

        const rayDir = new THREE.Vector3().subVectors(threatPos, pos).normalize();
        const distToThreat = pos.distanceTo(threatPos);

        for (const s of this.structures) {
            if (s.type === 'barrier') {
                // Testa se a linha reta entre o jogador e a ameaça cruza os limites da barreira
                const midX = (pos.x + threatPos.x) / 2;
                const midZ = (pos.z + threatPos.z) / 2;
                if (Math.abs(s.x - midX) < s.w && Math.abs(s.z - midZ) < 8) {
                    return true;
                }
            }
        }
        return false;
    }

    // Verifica se está no interior de um bunker
    isInsideBunker(pos) {
        for (const s of this.structures) {
            if (s.type === 'bunker') {
                if (pos.x >= s.innerBounds.minX && pos.x <= s.innerBounds.maxX &&
                    pos.z >= s.innerBounds.minZ && pos.z <= s.innerBounds.maxZ &&
                    pos.y <= s.innerBounds.height) {
                    return true;
                }
            }
        }
        return false;
    }

    // Encontra o abrigo seguro mais próximo para a IA dos Bots correr
    getNearestShelter(pos, preferRoof = true) {
        let best = null;
        let bestDist = Infinity;

        this.structures.forEach(s => {
            let dist = Math.hypot(pos.x - s.x, pos.z - s.z);
            if (preferRoof && s.type === 'bunker') {
                dist -= 15; // Prioriza bunkers fechados
            }
            if (dist < bestDist) {
                bestDist = dist;
                best = { x: s.x, z: s.z, structure: s };
            }
        });
        return best;
    }

    // Resolve colisão simples contra paredes e limites do mapa
    resolveCollision(pos, radius = 1.0) {
        // Limites da baseplate
        const maxDist = 86;
        pos.x = Math.max(-maxDist, Math.min(maxDist, pos.x));
        pos.z = Math.max(-maxDist, Math.min(maxDist, pos.z));

        // Colisão com barreiras
        this.structures.forEach(s => {
            if (s.type === 'barrier') {
                const b = s.bounds;
                if (pos.x + radius > b.minX && pos.x - radius < b.maxX &&
                    pos.z + radius > b.minZ && pos.z - radius < b.maxZ) {
                    
                    const overlapX = (pos.x > s.x) ? (b.maxX - (pos.x - radius)) : ((pos.x + radius) - b.minX);
                    const overlapZ = (pos.z > s.z) ? (b.maxZ - (pos.z - radius)) : ((pos.z + radius) - b.minZ);

                    if (overlapX < overlapZ) {
                        pos.x += (pos.x > s.x) ? overlapX : -overlapX;
                    } else {
                        pos.z += (pos.z > s.z) ? overlapZ : -overlapZ;
                    }
                }
            }
        });
    }
}
