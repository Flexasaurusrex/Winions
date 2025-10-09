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
        this.maxTrail = 50; // Increased from 30 for more visible trails
        this.speed = 0.002 + Math.random() * 0.001;
    }

    update(path, isInteracting, mouseX, mouseY) {
        // Move along the path
        this.progress += this.speed;
        if (this.progress >= 1) this.progress = 0;
        
        const point = this.getPointOnPath(path, this.progress);
        
        if (isInteracting) {
            // Add intense mouse influence with greater range and force
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influenceRadius = 250; // Increased from 150
            
            if (dist < influenceRadius) {
                const forceFactor = (1 - dist / influenceRadius);
                const force = forceFactor * forceFactor * 80; // Increased from 30, squared for more dramatic effect
                point.x += (dx / dist) * force;
                point.y += (dy / dist) * force;
                
                // Add some randomness for wild effect
                point.x += (Math.random() - 0.5) * force * 0.3;
                point.y += (Math.random() - 0.5) * force * 0.3;
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
        // Draw trail with gradient opacity for better effect
        if (this.trail.length > 1) {
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 0.5;
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                ctx.stroke();
            }
        }

        // Draw particle with glow effect
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
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
const numParticles = 12; // Increased from 8 for more dramatic effect

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

// Touch interaction for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', () => {
    isMouseDown = false;
});

// Hamburger menu functionality
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');

if (hamburger && mobileMenu && closeMenu) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });

    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    // Close menu when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('active');
        }
    });
}

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
