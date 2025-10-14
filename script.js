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
        this.maxTrail = 60; // Increased from 50 for longer, more visible trails
        this.speed = 0.002 + Math.random() * 0.001;
    }

    update(path, isInteracting, mouseX, mouseY) {
        // Move along the path
        this.progress += this.speed;
        if (this.progress >= 1) this.progress = 0;
        
        const point = this.getPointOnPath(path, this.progress);
        
        if (isInteracting) {
            // Add intense mouse influence with much greater range and force
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influenceRadius = 450; // Increased from 250 for wider spread
            
            if (dist < influenceRadius) {
                const forceFactor = (1 - dist / influenceRadius);
                const force = forceFactor * forceFactor * 120; // Increased from 80 for more dramatic effect
                point.x += (dx / dist) * force;
                point.y += (dy / dist) * force;
                
                // Add more randomness for wilder effect
                const chaos = force * 0.5; // Increased from 0.3
                point.x += (Math.random() - 0.5) * chaos;
                point.y += (Math.random() - 0.5) * chaos;
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
                const alpha = (i / this.trail.length) * 0.6; // Increased from 0.5 for more visible trails
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 2.5; // Increased from 2 for thicker, more visible trails
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
        
        // Add stronger glow for more visibility
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Increased from 0.3
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2); // Increased from 2
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
const numParticles = 15; // Increased from 12 for more dramatic, fuller effect

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

// Smooth scrolling for navigation links
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

// Carousel functionality
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const cards = track.querySelectorAll('.house-card');
    
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    function getCardWidth() {
        const card = cards[0];
        if (!card) return 300;
        const styles = window.getComputedStyle(card);
        const width = card.offsetWidth;
        const marginRight = parseFloat(styles.marginRight) || 0;
        return width + marginRight;
    }
    
    function getVisibleCards() {
        if (window.innerWidth > 1200) return 3;
        if (window.innerWidth > 768) return 2;
        return 1;
    }
    
    function getMaxIndex() {
        return Math.max(0, cards.length - 1);
    }

    function updateCarousel() {
        let offset = 0;
        
        if (isMobile()) {
            // On mobile, center each card in the viewport
            const card = cards[currentIndex];
            if (card) {
                const viewportWidth = window.innerWidth;
                const cardWidth = card.offsetWidth;
                const cardLeft = card.offsetLeft;
                
                // Calculate offset to center the current card
                offset = -(cardLeft - (viewportWidth / 2) + (cardWidth / 2));
            }
        } else {
            // On desktop, use standard grid scrolling
            const cardWidth = getCardWidth();
            offset = -currentIndex * cardWidth;
        }
        
        track.style.transform = `translateX(${offset}px)`;
        
        const maxIndex = getMaxIndex();
        
        // Disable buttons at extremes
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= maxIndex;
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.3' : '1';
    }

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        const maxIndex = getMaxIndex();
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Initial update
    setTimeout(updateCarousel, 100); // Small delay to ensure cards are rendered
    
    // Handle window resize for carousel
    let carouselResizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(carouselResizeTimer);
        carouselResizeTimer = setTimeout(() => {
            updateCarousel();
        }, 250);
    });
}

// Handle window resize for canvas
window.addEventListener('resize', () => {
    resizeCanvas();
    figurePath = createFigurePath();
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw particles
    particles.forEach(particle => {
        particle.update(figurePath, isMouseDown, mouseX, mouseY);
        particle.draw();
    });
    
    // Draw glowing eyes
    drawEyes();
    
    requestAnimationFrame(animate);
}

// Draw flickering ghostly eyes
let eyeFlickerTime = 0;
function drawEyes() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) * 0.35;
    
    // Eye positions (near top of hood)
    const eyeY = centerY - scale * 0.5;
    const eyeSpacing = scale * 0.15;
    const leftEyeX = centerX - eyeSpacing;
    const rightEyeX = centerX + eyeSpacing;
    
    // Flicker animation
    eyeFlickerTime += 0.05;
    const flicker1 = 0.7 + Math.sin(eyeFlickerTime * 3) * 0.15 + Math.random() * 0.15;
    const flicker2 = 0.7 + Math.sin(eyeFlickerTime * 2.7 + 1) * 0.15 + Math.random() * 0.15;
    
    // Draw left eye
    drawEye(leftEyeX, eyeY, flicker1);
    
    // Draw right eye
    drawEye(rightEyeX, eyeY, flicker2);
}

function drawEye(x, y, intensity) {
    // Outer glow (largest)
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Middle glow
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner glow
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.6})`;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Core (brightest)
    ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
}

animate();
