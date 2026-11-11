// roblox_model.js - Construtor de Modelos 3D Estilo Roblox R6 e Bosses no Three.js

class RobloxModelFactory {
    constructor() {
        this.faceTexture = this.createClassicRobloxFace();
    }

    // Gera textura procedural do clássico rosto sorridente do Roblox
    createClassicRobloxFace() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Fundo amarelo clássico
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(0, 0, 128, 128);

        // Olhos ovais pretos clássicos
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.ellipse(40, 52, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(88, 52, 9, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(43, 48, 3.5, 0, Math.PI * 2);
        ctx.arc(91, 48, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Sorriso curvo clássico
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(64, 68, 26, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // Cria placa flutuante 3D (Billboard) com Nome e Barra de Vida
    createBillboardUI(name, isHuman = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(3.5, 1.1, 1);
        sprite.position.y = 4.2;

        sprite.updateUI = (health, maxHealth, isProtected, protectionReason) => {
            ctx.clearRect(0, 0, 256, 80);

            // Nome
            ctx.font = isHuman ? 'bold 22px sans-serif' : 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = isHuman ? '#38bdf8' : '#ffffff';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.fillText(name, 128, 24);

            // Status de abrigo
            if (isProtected) {
                ctx.font = 'bold 15px sans-serif';
                ctx.fillStyle = '#4ade80';
                ctx.fillText(`🛡️ ${protectionReason}`, 128, 43);
            }

            // Fundo da barra de vida
            const hpW = 180;
            const hpH = 12;
            const hpX = (256 - hpW) / 2;
            const hpY = 52;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(hpX - 2, hpY - 2, hpW + 4, hpH + 4);

            // Barra de vida colorida
            const pct = Math.max(0, health / maxHealth);
            ctx.fillStyle = pct > 0.5 ? '#22c55e' : (pct > 0.25 ? '#eab308' : '#ef4444');
            ctx.fillRect(hpX, hpY, hpW * pct, hpH);

            texture.needsUpdate = true;
        };

        sprite.updateUI(100, 100, false, '');
        return sprite;
    }

    // Constrói avatar clássico Roblox R6 completo
    createRobloxAvatar(shirtColor = 0x3b82f6, pantsColor = 0x1e293b, skinColor = 0xfed7aa, name = 'Player', isHuman = false) {
        const root = new THREE.Group();

        const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 });
        const matShirt = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
        const matPants = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.6 });

        // Materiais da cabeça (frente tem o clássico rosto do Roblox)
        const headMaterials = [
            matSkin, // direita
            matSkin, // esquerda
            matSkin, // topo
            matSkin, // baixo
            new THREE.MeshStandardMaterial({ map: this.faceTexture, roughness: 0.5 }), // frente
            matSkin  // trás
        ];

        // 1. Tronco (Torso)
        const torsoGeo = new THREE.BoxGeometry(2.0, 2.0, 1.0);
        const torso = new THREE.Mesh(torsoGeo, matShirt);
        torso.position.y = 2.0;
        torso.castShadow = true;
        torso.receiveShadow = true;
        root.add(torso);

        // 2. Cabeça (Head)
        const headGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        const head = new THREE.Mesh(headGeo, headMaterials);
        head.position.y = 1.6;
        head.castShadow = true;
        torso.add(head);

        // 3. Braço Esquerdo (Left Arm com pivô no ombro)
        const armGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
        armGeo.translate(0, -0.8, 0); // Ajusta pivô para o topo

        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-1.5, 0.8, 0);
        const leftArm = new THREE.Mesh(armGeo, matShirt);
        leftArm.castShadow = true;
        leftArmGroup.add(leftArm);
        torso.add(leftArmGroup);

        // 4. Braço Direito (Right Arm)
        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(1.5, 0.8, 0);
        const rightArm = new THREE.Mesh(armGeo, matShirt);
        rightArm.castShadow = true;
        rightArmGroup.add(rightArm);
        torso.add(rightArmGroup);

        // 5. Perna Esquerda (Left Leg com pivô no quadril)
        const legGeo = new THREE.BoxGeometry(1.0, 2.0, 1.0);
        legGeo.translate(0, -0.8, 0);

        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.5, -1.0, 0);
        const leftLeg = new THREE.Mesh(legGeo, matPants);
        leftLeg.castShadow = true;
        leftLegGroup.add(leftLeg);
        torso.add(leftLegGroup);

        // 6. Perna Direita (Right Leg)
        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.5, -1.0, 0);
        const rightLeg = new THREE.Mesh(legGeo, matPants);
        rightLeg.castShadow = true;
        rightLegGroup.add(rightLeg);
        torso.add(rightLegGroup);

        // UI Billboard flutuante
        const billboard = this.createBillboardUI(name, isHuman);
        root.add(billboard);

        // Armazena referências para animação
        root.parts = {
            torso,
            head,
            leftArmGroup,
            rightArmGroup,
            leftLegGroup,
            rightLegGroup,
            billboard
        };

        // Função para atualizar animação de caminhada estilo Roblox
        root.animateWalk = (speed, time) => {
            if (speed > 0.05) {
                const angle = Math.sin(time * 12) * 0.7;
                leftLegGroup.rotation.x = angle;
                rightLegGroup.rotation.x = -angle;
                leftArmGroup.rotation.x = -angle;
                rightArmGroup.rotation.x = angle;
                torso.position.y = 2.0 + Math.abs(Math.sin(time * 12)) * 0.15;
            } else {
                leftLegGroup.rotation.x = 0;
                rightLegGroup.rotation.x = 0;
                leftArmGroup.rotation.x = 0;
                rightArmGroup.rotation.x = 0;
                torso.position.y = 2.0;
            }
        };

        return root;
    }

    // Constrói Goku Roblox Super Saiyajin em blocos 3D com cabelo dourado espetado
    createRobloxGoku() {
        const goku = this.createRobloxAvatar(0xea580c, 0xea580c, 0xfed7aa, '⚡ GOKU (SUPER SAIYAJIN)', false);

        // Adiciona faixa azul no kimono
        const beltGeo = new THREE.BoxGeometry(2.05, 0.35, 1.05);
        const matBelt = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
        const belt = new THREE.Mesh(beltGeo, matBelt);
        belt.position.y = -0.5;
        goku.parts.torso.add(belt);

        // Botas azuis nas pernas
        const bootGeo = new THREE.BoxGeometry(1.02, 0.6, 1.02);
        const leftBoot = new THREE.Mesh(bootGeo, matBelt);
        leftBoot.position.y = -1.5;
        goku.parts.leftLegGroup.children[0].add(leftBoot);

        const rightBoot = new THREE.Mesh(bootGeo, matBelt);
        rightBoot.position.y = -1.5;
        goku.parts.rightLegGroup.children[0].add(rightBoot);

        // Cabelo Super Saiyajin Dourado Espetado (Feito de múltiplos blocos e cones estilizados)
        const matHair = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xeab308,
            emissiveIntensity: 0.35,
            roughness: 0.3
        });

        const hairGroup = new THREE.Group();

        // Base do cabelo
        const hairBase = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), matHair);
        hairBase.position.y = 0.7;
        hairGroup.add(hairBase);

        // Espetos dourados estilo anime em blocos
        const spikeOffsets = [
            { x: 0, y: 1.2, z: 0, s: [0.6, 1.1, 0.6], rx: 0.1, rz: 0 },
            { x: -0.4, y: 1.0, z: -0.2, s: [0.5, 0.9, 0.5], rx: -0.2, rz: -0.3 },
            { x: 0.4, y: 1.0, z: -0.2, s: [0.5, 0.9, 0.5], rx: -0.2, rz: 0.3 },
            { x: -0.6, y: 0.7, z: 0.1, s: [0.5, 0.8, 0.5], rx: 0, rz: -0.5 },
            { x: 0.6, y: 0.7, z: 0.1, s: [0.5, 0.8, 0.5], rx: 0, rz: 0.5 },
            { x: 0, y: 0.8, z: -0.5, s: [0.5, 0.8, 0.5], rx: -0.5, rz: 0 }
        ];

        spikeOffsets.forEach(sp => {
            const spike = new THREE.Mesh(new THREE.BoxGeometry(sp.s[0], sp.s[1], sp.s[2]), matHair);
            spike.position.set(sp.x, sp.y, sp.z);
            spike.rotation.set(sp.rx, 0, sp.rz);
            hairGroup.add(spike);
        });

        goku.parts.head.add(hairGroup);

        // Aura Dourada Super Saiyajin (Luz e Esfera translúcida pulsante)
        const auraGeo = new THREE.SphereGeometry(3.5, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({
            color: 0xfde047,
            transparent: true,
            opacity: 0.25,
            wireframe: true
        });
        const auraMesh = new THREE.Mesh(auraGeo, auraMat);
        auraMesh.position.y = 1.0;
        goku.add(auraMesh);
        goku.auraMesh = auraMesh;

        // Eleva o billboard para ficar visível acima do cabelo espetado
        if (goku.parts && goku.parts.billboard) {
            goku.parts.billboard.position.y = 5.8;
        }

        return goku;
    }

    // Constrói Boss Procedural 3D para qualquer palavra livre digitada
    createProceduralRobloxBoss(word) {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = (hash << 5) - hash + word.charCodeAt(i);
            hash |= 0;
        }
        const absHash = Math.abs(hash);

        const hues = [0, 45, 120, 180, 270, 310];
        const hue = hues[absHash % hues.length];
        const colorHex = new THREE.Color(`hsl(${hue}, 90%, 55%)`).getHex();
        const darkColorHex = new THREE.Color(`hsl(${hue}, 70%, 25%)`).getHex();

        const boss = this.createRobloxAvatar(darkColorHex, 0x111827, colorHex, `👑 [${word.toUpperCase()}]`, false);
        boss.scale.set(2.2, 2.2, 2.2); // Chefe gigante

        // Adiciona chifres/coroa de blocos baseada no hash
        const matHorn = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.4
        });

        const horn1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), matHorn);
        horn1.position.set(-0.6, 1.0, 0);
        horn1.rotation.z = -0.4;
        boss.parts.head.add(horn1);

        const horn2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), matHorn);
        horn2.position.set(0.6, 1.0, 0);
        horn2.rotation.z = 0.4;
        boss.parts.head.add(horn2);

        boss.word = word;
        boss.hue = hue;

        if (boss.parts && boss.parts.billboard) {
            boss.parts.billboard.position.y = 5.4;
        }

        return boss;
    }
}

const robloxFactory = new RobloxModelFactory();
