// Canvas Setup
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const container = canvas.parentElement;

function resizeCanvas() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Physics-based animation
class Particle {
    constructor(pathIndex, totalParticles) {
        this.pathIndex = pathIndex;
        this.totalParticles = totalParticles;
        this.progress = pathIndex / totalParticles;
        this.x = 0;
        this.y = 0;
        this.radius = 3;
        this.trail = [];
        this.maxTrail = 30;
        this.speed = 0.002 + Math.random() * 0.001;
    }

    update(path, isInteracting, mouseX, mouseY) {
        // Move along the path
        this.progress += this.speed;
        if (this.progress >= 1) this.progress = 0;
        
        const point = this.getPointOnPath(path, this.progress);
        
        if (isInteracting) {
            // Add mouse influence
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (1 - dist / 150) * 30;
                point.x += (dx / dist) * force;
                point.y += (dy / dist) * force;
            }
        }
        
        this.x = point.x;
        this.y = point.y;
        
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
    }

    getPointOnPath(path, progress) {
        const totalPoints = path.length;
        const index = progress * totalPoints;
        const currentIndex = Math.floor(index);
        const nextIndex = (currentIndex + 1) % totalPoints;
        const t = index - currentIndex;
        
        const current = path[currentIndex];
        const next = path[nextIndex];
        
        return {
            x: current.x + (next.x - current.x) * t,
            y: current.y + (next.y - current.y) * t
        };
    }

    draw() {
        // Draw trail
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();

        // Draw particle
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create hooded figure outline path
function createFigurePath() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.35;
    
    const path = [];
    
    // Top of hood (rounded)
    for (let i = 0; i <= 20; i++) {
        const angle = Math.PI + (i / 20) * Math.PI;
        const x = centerX + Math.cos(angle) * scale * 0.35;
        const y = centerY - scale * 0.7 + Math.sin(angle) * scale * 0.2;
        path.push({x, y});
    }
    
    // Right side of hood/shoulder
    for (let i = 0; i <= 15; i++) {
        const t = i / 15;
        const x = centerX + scale * 0.35 + t * scale * 0.25;
        const y = centerY - scale * 0.5 + t * scale * 0.4;
        path.push({x, y});
    }
    
    // Right side of cloak (widens)
    for (let i = 0; i <= 25; i++) {
        const t = i / 25;
        const x = centerX + scale * 0.6 + t * scale * 0.15;
        const y = centerY - scale * 0.1 + t * scale * 0.9;
        path.push({x, y});
    }
    
    // Bottom of cloak
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const x = centerX + scale * 0.75 - t * scale * 1.5;
        const y = centerY + scale * 0.8;
        path.push({x, y});
    }
    
    // Left side of cloak
    for (let i = 0; i <= 25; i++) {
        const t = i / 25;
        const x = centerX - scale * 0.75 + t * scale * 0.15;
        const y = centerY + scale * 0.8 - t * scale * 0.9;
        path.push({x, y});
    }
    
    // Left side of hood/shoulder
    for (let i = 0; i <= 15; i++) {
        const t = i / 15;
        const x = centerX - scale * 0.6 + t * scale * 0.25;
        const y = centerY - scale * 0.1 - t * scale * 0.4;
        path.push({x, y});
    }
    
    return path;
}

let figurePath = createFigurePath();

// Create particles
const particles = [];
const numParticles = 8;

for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(i, numParticles));
}

// Mouse interaction
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let isMouseDown = false;

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    isMouseDown = true;
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    figurePath = createFigurePath();
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update(figurePath, isMouseDown, mouseX, mouseY);
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();
