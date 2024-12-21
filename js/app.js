const GAME_CONFIG = {
    // Core visual settings
    canvasColor: "#EAEDDC",
    paddleWidth: {
        easy: 70,
        moderate: 50,
        hard: 40,
    },
    paddleHeight: 10,
    paddleColor: "#3498db",

    // Ball configuration
    ballRadius: 10,
    maxBalls: 100, // Maximum number of balls in play
    speedX: 5, // Horizontal movement speed
    ballSpeed: {
        easy: 1, // Reduced speed for better control
        moderate: 1.2, // Standard speed
        hard: 2, // Enhanced speed for challenge
    },

    // Game mechanics
    stepInterval: 60, // Interval for step counter updates

    // Game state management
    gameStates: {
        MENU: "menu",
        PLAYING: "playing",
        PAUSED: "paused",
        GAME_OVER: "gameOver",
    },
};

class Game {
    constructor() {
        this.canvas = document.getElementById("myCanvas");
        this.context = this.canvas.getContext("2d");
        this.balls = [];
        this.stats = {
            burst: 0,
            escaped: 0,
            steps: 0,
        };
        this.paddle = {
            x: 200,
            speed: 0,
        };
        this.difficulty = "easy";
        this.isRunning = false;
        this.gameLoop = null;
        this.gameState = GAME_CONFIG.gameStates.MENU;
        this.lastTime = 0;
        this.frameCount = 0; // Add frame counter
        this.particleSystem = new ParticleSystem(this.context); // Add particle system
        this.rafId = null; // Store requestAnimationFrame ID
        this.setupEventListeners();
        this.initialize(); // Initialize from constructor
    }

    setupEventListeners() {
        // Add keyboard controls
        window.addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowLeft":
                    this.paddle.speed = -GAME_CONFIG.speedX;
                    break;
                case "ArrowRight":
                    this.paddle.speed = GAME_CONFIG.speedX;
                    break;
                case "p":
                    this.togglePause();
                    break;
            }
        });

        window.addEventListener("keyup", (e) => {
            if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                this.paddle.speed = 0;
            }
        });
    }

    togglePause() {
        if (this.gameState === GAME_CONFIG.gameStates.PLAYING) {
            this.gameState = GAME_CONFIG.gameStates.PAUSED;
            this.stop();
        } else if (this.gameState === GAME_CONFIG.gameStates.PAUSED) {
            this.gameState = GAME_CONFIG.gameStates.PLAYING;
            this.start();
        }
    }

    initialize() {
        this.createBalls();
        this.start(); // Auto-start game
    }

    createBalls() {
        this.balls = []; // Reset ball array
        for (let i = 0; i < GAME_CONFIG.maxBalls; i++) {
            const color = `rgb(${(Math.random() * 256) | 0},${
                (Math.random() * 256) | 0
            },${(Math.random() * 256) | 0})`;
            this.balls.push({
                x: Math.random() * this.canvas.width,
                y: 0,
                radius: GAME_CONFIG.ballRadius,
                color: color,
                active: false,
            });
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameState = GAME_CONFIG.gameStates.PLAYING;
            this.animate();
        }
    }

    stop() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }
    }

    reset() {
        this.stop();
        this.frameCount = 0; // Reset frame counter
        this.lastTime = 0; // Reset time reference
        this.stats = { burst: 0, escaped: 0, steps: 0 };
        this.createBalls();
        this.updateStats();
        document.getElementById("output").innerHTML = "";
        this.start();
    }

    animate(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.rafId = requestAnimationFrame((time) => this.animate(time));
    }

    update(deltaTime) {
        // Increase frame counter
        this.frameCount++;

        // Increase step every stepInterval frames
        if (this.frameCount % GAME_CONFIG.stepInterval === 0) {
            this.stats.steps++;
        }

        this.updatePaddle();
        this.clearScreen();
        this.drawPaddle();
        this.spawnBalls();
        this.updateBalls(deltaTime);
        this.particleSystem.update(); // Update particle system
        this.particleSystem.draw(); // Draw particle system
        this.updateStats();
    }

    updatePaddle() {
        if (
            this.paddle.x <
                this.canvas.width - GAME_CONFIG.paddleWidth[this.difficulty] &&
            this.paddle.speed > 0
        ) {
            this.paddle.x += this.paddle.speed;
        }
        if (this.paddle.x > 0 && this.paddle.speed < 0) {
            this.paddle.x += this.paddle.speed;
        }
    }

    clearScreen() {
        this.context.fillStyle = GAME_CONFIG.canvasColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPaddle() {
        this.context.fillStyle = GAME_CONFIG.paddleColor;
        this.context.fillRect(
            this.paddle.x,
            this.canvas.height - GAME_CONFIG.paddleHeight,
            GAME_CONFIG.paddleWidth[this.difficulty],
            GAME_CONFIG.paddleHeight
        );
    }

    spawnBalls() {
        // Set spawn rate by difficulty level
        const spawnRate = {
            easy: 100, // Increase spawn interval
            moderate: 80,
            hard: 50,
        };

        const rate = spawnRate[this.difficulty];

        // Generate balls based on frame counter
        if (this.frameCount % rate === 0) {
            const count = {
                easy: 1,
                moderate: 1,
                hard: 1,
            };

            for (let i = 0; i < count[this.difficulty]; i++) {
                this.activateRandomBall();
            }
        }
    }

    activateRandomBall() {
        // Find inactive balls
        const inactiveBalls = this.balls.filter((ball) => !ball.active);

        if (inactiveBalls.length > 0) {
            // Randomly select an inactive ball
            const ball =
                inactiveBalls[Math.floor(Math.random() * inactiveBalls.length)];
            ball.active = true;
            ball.y = 0; // Reset starting height
            ball.x =
                Math.random() *
                    (this.canvas.width - 2 * GAME_CONFIG.ballRadius) +
                GAME_CONFIG.ballRadius;
        }
    }

    updateBalls(deltaTime) {
        // Modify speed calculation based on deltaTime
        const currentSpeed =
            GAME_CONFIG.ballSpeed[this.difficulty] * (deltaTime / 16);

        this.balls.forEach((ball, index) => {
            if (!ball.active) return;

            if (ball.y + ball.radius > this.canvas.height) {
                this.stats.escaped++;
                ball.active = false;
            } else {
                // Draw ball
                this.context.fillStyle = ball.color;
                this.context.beginPath();
                this.context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                this.context.fill();
                ball.y += currentSpeed; // Apply modified speed

                // Check collision with paddle
                if (this.checkPaddleCollision(ball)) {
                    ball.active = false;
                    this.stats.burst++;
                    this.particleSystem.createBurstEffect(
                        ball.x,
                        ball.y,
                        ball.color
                    ); // Add particle effect
                }
            }
        });

        // Check game end condition
        if (this.stats.burst + this.stats.escaped >= GAME_CONFIG.maxBalls) {
            this.stop();
            document.getElementById(
                "output"
            ).innerHTML = `Game Over, your hit percentage was ${(
                (this.stats.burst / GAME_CONFIG.maxBalls) *
                100
            ).toFixed(2)}%`;
        }
    }

    // Check paddle collision separately
    checkPaddleCollision(ball) {
        // More accurate collision detection
        const paddleLeft = this.paddle.x;
        const paddleRight =
            this.paddle.x + GAME_CONFIG.paddleWidth[this.difficulty];
        const paddleTop = this.canvas.height - GAME_CONFIG.paddleHeight;

        return (
            ball.x + ball.radius > paddleLeft &&
            ball.x - ball.radius < paddleRight &&
            ball.y + ball.radius > paddleTop &&
            ball.y - ball.radius < paddleTop + GAME_CONFIG.paddleHeight
        );
    }

    updateStats() {
        document.getElementById(
            "steps"
        ).innerHTML = `Steps elapsed: ${this.stats.steps}`;
        document.getElementById(
            "burst"
        ).innerHTML = `Burst: ${this.stats.burst}`;
        document.getElementById(
            "escaped"
        ).innerHTML = `Escaped: ${this.stats.escaped}`;
    }

    // Game restart functionality
    restart() {
        this.gameState = GAME_CONFIG.gameStates.PLAYING;
        this.stats = { burst: 0, escaped: 0, steps: 0 };
        this.createBalls();
        this.start();
    }
}

// Declare game instance as global variable
let game;

// Game initialization function
window.onload = function () {
    game = new Game();
    addEffectsToGame(game); // Add particle system
};

function moveLeft() {
    game.paddle.speed = -GAME_CONFIG.speedX;
}
function moveRight() {
    game.paddle.speed = GAME_CONFIG.speedX;
}
function stopMove() {
    game.paddle.speed = 0;
}
function check(value) {
    if (game) {
        game.difficulty = value;
        game.reset(); // Restart game on difficulty change
    }
}

// Method for extending Game class
function addEffectsToGame(game) {
    game.particleSystem = new ParticleSystem(game.context);

    // Store original update method
    const originalUpdate = game.update.bind(game);

    // Extend update method
    game.update = function (deltaTime) {
        originalUpdate(deltaTime);
        if (this.particleSystem) {
            this.particleSystem.update();
            this.particleSystem.draw();
        }
    };
}
