# Bubble Buster
Project Overview
-----------------------------------------
This project involves creating a simple graphical game using HTML5 Canvas, where users burst bubbles that fall vertically. The goal is to implement a game where the player controls a paddle to cut through and pop bubbles as they fall from the top of the screen. The game ends when all bubbles either hit the bottom or are burst by the paddle.

Key Features
-----------------------------------------
1. Bubbles: Bubbles fall from the top of the canvas at random x-coordinates and move vertically down. Each bubble has a fixed radius of 10px and moves down by 2 pixels every 50 milliseconds.
2. Paddle: The player controls a paddle that moves horizontally along a fixed y-coordinate of 250px. The paddle has a width of 50px and a height of 10px, and moves 20px to the left or right per key press. The paddle is restricted within the canvas boundaries.
3. Game Modes: The game offers three difficulty levels:
    - Easy: A new bubble appears every 35 steps.
    - Moderate: A new bubble appears every 20 steps.
    - Hard: A new bubble appears every 10 steps.
4. Statistics: The game displays real-time statistics at the bottom of the canvas, including the number of bubbles burst, the number of bubbles that escaped, and the total steps since the game started.
5. End of Game: The game ends when all 100 bubbles have either burst or hit the bottom. A success rate message is displayed at the end.
