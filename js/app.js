const GAME_CONFIG = {
    canvasColor: "#EAEDDC",
    paddleWidth: {
        easy: 70,
        moderate: 50,
        hard: 40,
    },
    paddleHeight: 10,
    paddleColor: "#3498db",
    ballRadius: 10,
    maxBalls: 50, // 공의 최대 개수 증가
    speedX: 5,
    ballSpeed: {
        easy: 0.5, // 속도 감소
        moderate: 1,
        hard: 1.2,
    },
    stepInterval: 30, // 스텝 카운터 간격 추가
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
        this.frameCount = 0; // 프레임 카운터 추가
        this.setupEventListeners();
        this.initialize(); // 생성자에서 초기화 호출
    }

    setupEventListeners() {
        // 키보드 컨트롤 추가
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
        }
    }

    reset() {
        this.stop();
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
        requestAnimationFrame((time) => this.animate(time));
    }

    update(deltaTime) {
        // 프레임 카운터 증가
        this.frameCount++;

        // stepInterval 프레임마다 스텝 증가
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
        // 난이도별 생성 주기 설정
        const spawnRate = {
            easy: 150, // 생성 주기 증가
            moderate: 120,
            hard: 100,
        };

        const rate = spawnRate[this.difficulty];

        // 프레임 카운터 기반으로 공 생���
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
        // 비활성화된 공 찾기
        const inactiveBalls = this.balls.filter((ball) => !ball.active);

        if (inactiveBalls.length > 0) {
            // 랜덤하게 비활성화된 공 선택
            const ball =
                inactiveBalls[Math.floor(Math.random() * inactiveBalls.length)];
            ball.active = true;
            ball.y = 0; // 시작 높이 초기화
            ball.x =
                Math.random() *
                    (this.canvas.width - 2 * GAME_CONFIG.ballRadius) +
                GAME_CONFIG.ballRadius;
        }
    }

    updateBalls(deltaTime) {
        // deltaTime 기반 속도 계산 수정
        const currentSpeed =
            GAME_CONFIG.ballSpeed[this.difficulty] * (deltaTime / 16);

        this.balls.forEach((ball, index) => {
            if (!ball.active) return;

            if (ball.y + ball.radius > this.canvas.height) {
                this.stats.escaped++;
                ball.active = false;
            } else {
                // 공 그리기
                this.context.fillStyle = ball.color;
                this.context.beginPath();
                this.context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                this.context.fill();
                ball.y += currentSpeed; // 수정된 속도 적용

                // 패들과 충돌 검사
                if (this.checkPaddleCollision(ball)) {
                    ball.active = false;
                    this.stats.burst++;
                }
            }
        });

        // 게임 종료 조건 체크
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
}

// 전역 변수로 game 인스턴스 선언
let game;

// 게임 시작 함수
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
        game.reset(); // 난이도 변경 시 게임 재시작
    }
}
