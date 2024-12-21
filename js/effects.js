class ParticleSystem {
    constructor(context) {
        this.context = context;
        this.particles = [];
    }

    createBurstEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x,
                y,
                color,
                speed: Math.random() * 2 + 1,
                angle: Math.random() * Math.PI * 2,
                life: 1.0,
            });
        }
    }

    update() {
        this.particles.forEach((particle, index) => {
            particle.x += Math.cos(particle.angle) * particle.speed;
            particle.y += Math.sin(particle.angle) * particle.speed;
            particle.life -= 0.02;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    draw() {
        this.particles.forEach((particle) => {
            this.context.globalAlpha = particle.life;
            this.context.fillStyle = particle.color;
            this.context.beginPath();
            this.context.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.context.fill();
        });
        this.context.globalAlpha = 1;
    }
}
