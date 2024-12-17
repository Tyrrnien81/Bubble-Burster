const GAME_CONFIG = {
    // Visual configuration
    canvasColor: "#EAEDDC",
    paddleWidth: {
        easy: 70, // Wider paddle for beginners
        moderate: 50, // Standard width
        hard: 40, // Narrow paddle for experts
    },
    paddleHeight: 10,
    paddleColor: "#3498db",
    ballRadius: 10,
    maxBalls: 100, // Increased maximum number of balls
    speedX: 5,
    ballSpeed: {
        easy: 0.5, // Reduced speed
        moderate: 1,
        hard: 1.2,
    },
    stepInterval: 30, // Step counter interval
    gameStates: {
        INITIALIZING: "initializing",
        PLAYING: "playing",
        PAUSED: "paused",
        GAME_OVER: "gameOver",
    },
    // Scoring system configuration
    scoreSystem: {
        easy: 10, // Base points for easy mode
        moderate: 20, // Increased points for moderate
        hard: 30, // Maximum points for hard mode
    },
};

class Game {
    constructor() {
        // Initialize core game components
        this.canvas = document.getElementById("myCanvas");
        this.context = this.canvas.getContext("2d");

        // Game state tracking
        this.balls = [];
        this.stats = {
            burst: 0, // Successfully hit balls
            escaped: 0, // Missed balls
            steps: 0, // Game progression
        };

        this.paddle = {
            x: 200,
            speed: 0,
        };
        this.difficulty = "easy";
        this.isRunning = false;
        this.gameLoop = null;
        this.gameState = GAME_CONFIG.gameStates.PLAYING;
        this.lastTime = 0;
        this.frameCount = 0; // Add frame counter
        this.score = 0;
        this.highScore = 0;
        this.audioManager = new AudioManager(); // Add audio manager
        this.musicStarted = false; // Add music start state
        this.setupEventListeners();
        this.initialize(); // 생성자에서 초기화 호출
    }

    setupEventListeners() {
        // Add keyboard controls
        window.addEventListener("keydown", (e) => {
            // Start music on first key input
            if (!this.musicStarted) {
                this.audioManager.startBgMusic();
                this.musicStarted = true;
            }

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

        // Start music on click/touch as well
        this.canvas.addEventListener("click", () => {
            if (!this.musicStarted) {
                this.audioManager.startBgMusic();
                this.musicStarted = true;
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
            this.audioManager.stopBgMusic(); // Stop background music on pause
        } else if (this.gameState === GAME_CONFIG.gameStates.PAUSED) {
            this.gameState = GAME_CONFIG.gameStates.PLAYING;
            this.start();
            this.audioManager.startBgMusic(); // Resume background music
        }
    }

    initialize() {
        this.createBalls();
        this.start(); // 게임 자동 시작
    }

    createBalls() {
        this.balls = []; // 기존 공 배열 초기화
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
            clearInterval(this.gameLoop);
            this.audioManager.stopBgMusic(); // Stop background music when game stops
        }
    }

    reset() {
        this.stop();
        this.stats = { burst: 0, escaped: 0, steps: 0 };
        this.createBalls();
        this.updateStats();
        document.getElementById("output").innerHTML = "";
        this.start();
        this.audioManager.startBgMusic(); // Restart background music on reset
    }

    animate(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        requestAnimationFrame((time) => this.animate(time));
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
        // Set spawn rate by difficulty
        const spawnRate = {
            easy: 150, // Increased spawn interval
            moderate: 120,
            hard: 100,
        };

        const rate = spawnRate[this.difficulty];

        // Ball spawn logic
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
        const currentSpeed =
            GAME_CONFIG.ballSpeed[this.difficulty] * (deltaTime / 16);

        this.balls.forEach((ball, index) => {
            if (!ball.active) return;

            if (ball.y + ball.radius > this.canvas.height) {
                this.stats.escaped++;
                ball.active = false;
            } else {
                this.drawBall(ball);
                ball.y += currentSpeed;

                if (this.checkPaddleCollision(ball)) {
                    ball.active = false;
                    this.stats.burst++;
                    this.updateScore();
                    this.spawnPowerUp();
                    // Integrate with effects system
                    if (this.particleSystem) {
                        this.particleSystem.createBurstEffect(
                            ball.x,
                            ball.y,
                            ball.color
                        );
                    }
                }
            }
        });

        // 게임 종료 조건 체크
        if (
            this.stats.burst + this.stats.escaped >=
            GAME_CONFIG.maxBalls + 100
        ) {
            this.stop();
            document.getElementById(
                "output"
            ).innerHTML = `Game Over, your hit percentage was ${(
                (this.stats.burst / GAME_CONFIG.maxBalls) *
                100
            ).toFixed(2)}%`;
        }
    }

    // 패들 충돌 검사를 별도 메서드로 분리
    checkPaddleCollision(ball) {
        // 더 정확한 충돌 감지
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

    // 게임 재시작 기능
    restart() {
        this.gameState = GAME_CONFIG.gameStates.PLAYING;
        this.stats = { burst: 0, escaped: 0, steps: 0 };
        this.createBalls();
        this.start();
    }

    loadHighScore() {
        return parseInt(localStorage.getItem("bubbleBursterHighScore")) || 0;
    }

    saveHighScore() {
        localStorage.setItem("bubbleBursterHighScore", this.score);
    }

    spawnPowerUp() {
        if (Math.random() < 0.05) {
            // 5% chance to spawn power-up
            // Power-up item implementation
        }
    }

    updateScore() {
        const baseScore = GAME_CONFIG.scoreSystem[this.difficulty];
        this.score +=
            this.powerUpActive === GAME_CONFIG.powerUps.MULTI_SCORE
                ? baseScore * 2
                : baseScore;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }
}

// Declare game instance as global variable
let game;

// Game start function
window.onload = function () {
    game = new Game();
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
        game.reset(); // Restart game when difficulty changes
    }
}
