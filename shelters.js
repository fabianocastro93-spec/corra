// shelters.js - Gerenciamento de Barreiras, Bunkers e Abrigos da Arena Plana

class ShelterManager {
    constructor(groundY = 550) {
        this.groundY = groundY;
        this.structures = [
            // Bunker 1 (Alpha - Esquerda): Bunker com teto reforçado e paredes laterais
            {
                id: 'bunker_alpha',
                name: 'Bunker Alpha',
                type: 'bunker',
                x: 80,
                y: this.groundY - 140,
                w: 170,
                h: 140,
                roofThickness: 22,
                wallThickness: 20,
                doorX: 110,
                doorW: 110,
                color: '#2a3b4c',
                accentColor: '#00e5ff'
            },
            // Barreira 1 (Muralha de Aço Vertical - Esquerda/Centro)
            {
                id: 'wall_beta',
                name: 'Barreira Anti-Impacto',
                type: 'barrier',
                x: 350,
                y: this.groundY - 120,
                w: 32,
                h: 120,
                color: '#4a5568',
                accentColor: '#f59e0b'
            },
            // Abrigo Central (Cúpula Reforçada com Pilares e Teto Arqueado)
            {
                id: 'pavilion_gamma',
                name: 'Cúpula Central',
                type: 'pavilion',
                x: 480,
                y: this.groundY - 150,
                w: 220,
                h: 150,
                roofThickness: 26,
                pillarW: 18,
                color: '#1f2937',
                accentColor: '#10b981'
            },
            // Barreira 2 (Muralha Anti-Tsunami / Ondas - Direita/Centro)
            {
                id: 'wall_delta',
                name: 'Barreira de Choque',
                type: 'barrier',
                x: 790,
                y: this.groundY - 120,
                w: 32,
                h: 120,
                color: '#4a5568',
                accentColor: '#f59e0b'
            },
            // Bunker 2 (Ômega - Direita): Bunker Blindado Pesado
            {
                id: 'bunker_omega',
                name: 'Bunker Ômega',
                type: 'bunker',
                x: 930,
                y: this.groundY - 140,
                w: 180,
                h: 140,
                roofThickness: 24,
                wallThickness: 20,
                doorX: 960,
                doorW: 120,
                color: '#2a3b4c',
                accentColor: '#8b5cf6'
            }
        ];
    }

    // Retorna todos os sólidos para colisão do jogador/entidades
    getSolidColliders() {
        const colliders = [];
        this.structures.forEach(s => {
            if (s.type === 'barrier') {
                colliders.push({ x: s.x, y: s.y, w: s.w, h: s.h, type: 'barrier' });
            } else if (s.type === 'bunker') {
                // Teto transitável (pode subir por cima)
                colliders.push({ x: s.x, y: s.y, w: s.w, h: s.roofThickness, type: 'roof' });
                // Parede esquerda
                colliders.push({ x: s.x, y: s.y + s.roofThickness, w: s.wallThickness, h: s.h - s.roofThickness, type: 'wall' });
                // Parede direita
                colliders.push({ x: s.x + s.w - s.wallThickness, y: s.y + s.roofThickness, w: s.wallThickness, h: s.h - s.roofThickness, type: 'wall' });
            } else if (s.type === 'pavilion') {
                // Teto da cúpula
                colliders.push({ x: s.x, y: s.y, w: s.w, h: s.roofThickness, type: 'roof' });
                // Pilares (colisão fina)
                colliders.push({ x: s.x, y: s.y + s.roofThickness, w: s.pillarW, h: s.h - s.roofThickness, type: 'pillar' });
                colliders.push({ x: s.x + s.w - s.pillarW, y: s.y + s.roofThickness, w: s.pillarW, h: s.h - s.roofThickness, type: 'pillar' });
            }
        });
        return colliders;
    }

    // Verifica se o ponto (px, py) atinge o topo do teto de um abrigo (para destruir projéteis)
    hitsRoof(px, py) {
        for (const s of this.structures) {
            if (s.type === 'bunker' || s.type === 'pavilion') {
                if (px >= s.x && px <= s.x + s.w && py >= s.y - 10 && py <= s.y + s.roofThickness + 10) {
                    return true;
                }
            }
        }
        return false;
    }

    // Verifica se o ponto (px, py) está protegido contra ataques do céu (chuva de fogo, meteoro, raio, etc.)
    isProtectedFromAbove(px, py) {
        for (const s of this.structures) {
            if (s.type === 'bunker' || s.type === 'pavilion') {
                if (px >= s.x && px <= s.x + s.w && py >= s.y + s.roofThickness - 5 && py <= s.y + s.h + 20) {
                    return true;
                }
            }
        }
        return false;
    }

    // Verifica se o ponto (px, py) está protegido contra um ataque que vem da direção X (threatX)
    isProtectedFromSide(px, py, threatX) {
        const minX = Math.min(px, threatX);
        const maxX = Math.max(px, threatX);

        for (const s of this.structures) {
            if (s.type === 'barrier') {
                if (s.x > minX && s.x < maxX && py >= s.y - 10) {
                    return true;
                }
            } else if (s.type === 'bunker') {
                if (px >= s.x + s.wallThickness && px <= s.x + s.w - s.wallThickness && py >= s.y + s.roofThickness) {
                    return true;
                }
                if (s.x > minX && s.x + s.w < maxX) {
                    return true;
                }
            }
        }
        return false;
    }

    // Verifica se está dentro de um bunker seguro
    isInsideBunker(px, py) {
        for (const s of this.structures) {
            if (s.type === 'bunker') {
                if (px >= s.x + s.wallThickness && px <= s.x + s.w - s.wallThickness &&
                    py >= s.y + s.roofThickness && py <= s.y + s.h) {
                    return true;
                }
            }
        }
        return false;
    }

    // Localiza o abrigo seguro mais próximo de uma posição (usado pela IA dos bots)
    getNearestShelter(px, preferRoof = true) {
        let best = null;
        let bestDist = Infinity;

        this.structures.forEach(s => {
            let targetX = s.x + s.w / 2;
            let dist = Math.abs(px - targetX);
            if (preferRoof && (s.type === 'bunker' || s.type === 'pavilion')) {
                dist -= 80;
            }
            if (dist < bestDist) {
                bestDist = dist;
                best = { x: targetX, y: this.groundY, structure: s };
            }
        });
        return best;
    }

    // Renderização visual dos abrigos e barreiras
    render(ctx) {
        ctx.save();

        this.structures.forEach(s => {
            if (s.type === 'barrier') {
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(s.x, s.y, s.w, s.h);

                ctx.fillStyle = s.accentColor;
                ctx.fillRect(s.x, s.y, s.w, 8);
                ctx.fillRect(s.x, s.y + s.h - 8, s.w, 8);

                ctx.strokeStyle = '#475569';
                ctx.lineWidth = 2;
                ctx.strokeRect(s.x, s.y, s.w, s.h);

                for (let yy = s.y + 20; yy < s.y + s.h - 10; yy += 25) {
                    ctx.beginPath();
                    ctx.moveTo(s.x + 4, yy);
                    ctx.lineTo(s.x + s.w - 4, yy);
                    ctx.stroke();

                    ctx.fillStyle = '#94a3b8';
                    ctx.fillRect(s.x + 4, yy - 2, 4, 4);
                    ctx.fillRect(s.x + s.w - 8, yy - 2, 4, 4);
                }

                ctx.fillStyle = '#f59e0b';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("BARREIRA", s.x + s.w / 2, s.y - 6);

            } else if (s.type === 'bunker') {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(s.x + s.wallThickness, s.y + s.roofThickness, s.w - s.wallThickness * 2, s.h - s.roofThickness);

                ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
                ctx.lineWidth = 1;
                for (let xx = s.x + s.wallThickness + 15; xx < s.x + s.w - s.wallThickness; xx += 20) {
                    ctx.beginPath();
                    ctx.moveTo(xx, s.y + s.roofThickness);
                    ctx.lineTo(xx, s.y + s.h);
                    ctx.stroke();
                }

                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 8;
                ctx.fillRect(s.x + s.w / 2 - 25, s.y + s.roofThickness + 4, 50, 4);
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#1e293b';
                ctx.fillRect(s.x, s.y + s.roofThickness, s.wallThickness, s.h - s.roofThickness);
                ctx.fillRect(s.x + s.w - s.wallThickness, s.y + s.roofThickness, s.wallThickness, s.h - s.roofThickness);

                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.moveTo(s.x - 6, s.y + s.roofThickness);
                ctx.lineTo(s.x + 8, s.y);
                ctx.lineTo(s.x + s.w - 8, s.y);
                ctx.lineTo(s.x + s.w + 6, s.y + s.roofThickness);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = s.accentColor;
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = s.accentColor;
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`🛡️ ${s.name.toUpperCase()} (TETO BLINDADO)`, s.x + s.w / 2, s.y - 8);

            } else if (s.type === 'pavilion') {
                ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
                ctx.fillRect(s.x + s.pillarW, s.y + s.roofThickness, s.w - s.pillarW * 2, s.h - s.roofThickness);

                ctx.fillStyle = '#1e293b';
                ctx.fillRect(s.x, s.y + s.roofThickness, s.pillarW, s.h - s.roofThickness);
                ctx.fillRect(s.x + s.w - s.pillarW, s.y + s.roofThickness, s.pillarW, s.h - s.roofThickness);

                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.arc(s.x + s.w / 2, s.y + s.roofThickness + 30, s.w / 2, Math.PI, 2 * Math.PI, false);
                ctx.fill();

                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText("🛡️ CÚPULA DE DEFESA", s.x + s.w / 2, s.y - 12);
            }
        });

        ctx.restore();
    }
}
