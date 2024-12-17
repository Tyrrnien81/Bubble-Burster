class AudioManager {
    constructor() {
        // Initialize audio assets with proper volume levels
        this.sounds = {
            pop: new Audio("assets/sounds/pop.mp3"), // Ball burst sound
            powerup: new Audio("assets/sounds/powerup.mp3"), // Power-up collection
            gameOver: new Audio("assets/sounds/gameover.mp3"), // Game end sound
        };

        // Background music configuration
        this.bgMusic = new Audio("assets/sounds/bgm.mp3");
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.3; // Default volume level for background music
    }

    playSound(soundName) {
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play();
    }

    startBgMusic() {
        // Check for user interaction
        const promise = this.bgMusic.play();
        if (promise !== undefined) {
            promise.catch((error) => {
                console.log("Auto-play was prevented");
            });
        }
    }

    stopBgMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
}
