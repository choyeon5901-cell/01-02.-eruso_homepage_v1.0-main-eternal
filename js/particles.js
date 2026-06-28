// ===== Particle Animation System =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(91, 155, 213, ',  // Blue
            'rgba(126, 203, 178, ', // Green
            'rgba(255, 255, 255, '  // White
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color + particle.opacity + ')';
            this.ctx.fill();
        });
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(91, 155, 213, ${0.15 * (1 - distance / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.2;
                particle.vy -= (dy / distance) * force * 0.2;
            }

            // Boundaries
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Speed limit
            const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > 2) {
                particle.vx = (particle.vx / speed) * 2;
                particle.vy = (particle.vy / speed) * 2;
            }

            // Friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawConnections();
        this.drawParticles();
        this.updateParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-particles');
    if (canvas) {
        new ParticleSystem(canvas);
    }
    
    // ===== Smooth Video Loop =====
    const heroVideo = document.querySelector('.hero-bg-video');
    const fallbackImage = document.querySelector('.hero-bg-image');
    
    if (heroVideo) {
        // 비디오 로딩 실패 시 fallback 이미지 표시
        heroVideo.addEventListener('error', function() {
            console.log('비디오 로딩 실패, fallback 이미지로 전환');
            this.style.display = 'none';
            if (fallbackImage) {
                fallbackImage.style.display = 'block';
            }
        });
        
        // 비디오 끝나기 직전에 페이드아웃 효과
        heroVideo.addEventListener('timeupdate', function() {
            const timeRemaining = this.duration - this.currentTime;
            
            // 마지막 0.5초에 부드러운 전환
            if (timeRemaining <= 0.5 && timeRemaining > 0) {
                this.style.opacity = timeRemaining * 2; // 0.5초 동안 페이드아웃
            } else if (this.currentTime < 0.5) {
                this.style.opacity = this.currentTime * 2; // 시작 0.5초 동안 페이드인
            } else {
                this.style.opacity = '1.0';
            }
        });
        
        // 비디오 로드 완료 시 부드럽게 시작
        heroVideo.addEventListener('loadeddata', function() {
            console.log('비디오 로드 완료');
            this.style.opacity = '0';
            setTimeout(() => {
                this.style.opacity = '1.0';
            }, 100);
        });
        
        // 비디오 재생 가능 확인
        heroVideo.addEventListener('canplay', function() {
            console.log('비디오 재생 가능');
        });
        
        // 비디오 루프 시 부드러운 전환
        heroVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }
});
