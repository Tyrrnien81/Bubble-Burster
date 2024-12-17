class TouchController {
    constructor(game) {
        // Initialize touch control system
        this.game = game;
        this.touchStartX = 0; // Initial touch position

        this.setupTouchEvents();
    }

    setupTouchEvents() {
        // Handle touch start events for mobile input
        this.game.canvas.addEventListener("touchstart", (e) => {
            this.touchStartX = e.touches[0].clientX;
        });

        // Handle continuous touch movement for paddle control
        this.game.canvas.addEventListener("touchmove", (e) => {
            const touchX = e.touches[0].clientX;
            const diff = touchX - this.touchStartX;

            // Apply movement with smooth dampening factor
            this.game.paddle.x += diff * 0.5;
            this.touchStartX = touchX;

            // Prevent screen scrolling while playing
            e.preventDefault();
        });
    }
}
