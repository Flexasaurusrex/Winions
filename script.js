// Canvas setup
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
}

resizeCanvas();

// Hooded figure shape (bell-shaped cloak with hood)
const figureShape = {
    hood: [
        { x: 0.5, y: 0.15 },
        { x: 0.45, y: 0.18 },
        { x: 0.42, y: 0.22 },
        { x: 0.40, y: 0.26 },
        { x: 0.58, y: 0.26 },
        { x: 0.60, y: 0.22 },
        { x: 0.55, y: 0.18 }
    ],
    shoulders: [
        { x: 0.35, y: 0.30 },
        { x: 0.65, y: 0.30 }
    ],
    body: [
        { x: 0.32, y: 0.40 },
        { x: 0.28, y: 0.55 },
        { x: 0.25, y: 0.70 },
        { x: 0.23, y: 0.85 },
        { x: 0.77, y: 0.85 },
        { x: 0.75, y: 0.70 },
        { x: 0.72, y: 0.55 },
        { x: 0.68, y: 0.40 }
    ]
};

const allPoints = [
    ...figureShape.hood,
    ...figureShape.shoulders,
    ...figureShape.body
];

class Particle {
    constructor(index) {
        this.targetIndex = index;
        this.updateTarget();
        this.x = this.targetX;
        this.y = this.targetY;
        this.vx = 0;
        this.vy = 0;
        this.trail = [];
    }

    updateTarget() {
        const point = allPoints[this.targetIndex];
        this.targetX = point.x * canvas.width;
        this.targetY = point.y * canvas.height;
    }

    update(mouseX, mouseY, isMouseDown) {
        this.updateTarget();

        if (isMouseDown) {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 450) {
                const force = (1 - distance / 450) ** 2 * 120;
                const angle = Math.atan2(dy, dx);
                const chaos = (Math.random() - 0.5) * 1.0;
                this.vx += Math.cos(angle + chaos) * force;
                this.vy += Math.sin(angle + chaos) * force;
            }
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * 0.02;
        this.vy += dy * 0.02;

        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 60) {
            this.trail.shift();
        }
    }

    draw() {
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            
            const gradient = ctx.createLinearGradient(
                this.trail[0].x, this.trail[0].y,
                this.x, this.y
            );
            gradient.addColorStop(0, 'rgba(255, 26, 26, 0)');
            gradient.addColorStop(1, 'rgba(255, 26, 26, 0.6)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff1a1a';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

const particles = [];
for (let i = 0; i < 15; i++) {
    const index = Math.floor((i / 15) * allPoints.length);
    particles.push(new Particle(index));
}

const eyes = [
    { x: 0.45, y: 0.20, phase: 0 },
    { x: 0.55, y: 0.20, phase: Math.PI }
];

function drawEyes() {
    eyes.forEach(eye => {
        const eyeX = eye.x * canvas.width;
        const eyeY = eye.y * canvas.height;
        
        eye.phase += 0.1 + Math.random() * 0.05;
        const flicker = 0.6 + Math.sin(eye.phase) * 0.2 + Math.random() * 0.2;
        
        for (let i = 0; i < 4; i++) {
            const size = 8 - i * 1.5;
            const alpha = (0.3 - i * 0.05) * flicker;
            
            ctx.fillStyle = `rgba(255, 26, 26, ${alpha})`;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * flicker})`;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

let mouseX = 0;
let mouseY = 0;
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

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isMouseDown = false;
});

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update(mouseX, mouseY, isMouseDown);
        particle.draw();
    });

    drawEyes();

    requestAnimationFrame(animate);
}

animate();

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('active');
});

closeMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
});

mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentIndex = 0;
const totalCards = document.querySelectorAll('.house-card').length;

function getCardsPerView() {
    if (window.innerWidth <= 768) {
        return 3;
    }
    return 3;
}

function updateCarousel() {
    const cardsPerView = getCardsPerView();
    const cardWidth = document.querySelector('.house-card').offsetWidth;
    const gap = window.innerWidth <= 768 ? 15 : 30;
    const offset = currentIndex * (cardWidth + gap);
    
    track.style.transform = `translateX(-${offset}px)`;
}

prevBtn.addEventListener('click', () => {
    const cardsPerView = getCardsPerView();
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

nextBtn.addEventListener('click', () => {
    const cardsPerView = getCardsPerView();
    const maxIndex = totalCards - cardsPerView;
    if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
    }
});

window.addEventListener('resize', () => {
    resizeCanvas();
    currentIndex = 0;
    updateCarousel();
});
