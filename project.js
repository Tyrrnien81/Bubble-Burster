var canvas, pen;
var canvasColor = '#EAEDDC';
var radius;
var cburst = 0;
var cescaped = 0;
var cstep = 0;
var myGamePiece;
var ballA = [];
var activeBalls = 0;
var difficulty;
var button1 = 200;
var button2 = 0;
var speedX = 5;
var celapsed = 0;

function startGame() { //Game Start
	Ballfilling();
	setInterval('drawing()', 50);
}

function Balls(x, y, radius, color, active) { //Ball Setting
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.color = color;
	this.attive = active;

}

function Ballfilling() { //Making Ball
	var color;
	var xStart;
	for (var i = 0; i <= 100; i++) {
		color = "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")";
		xStart = Math.floor(Math.random() * 450);
		ballA[i] = new Balls(xStart, 0, 10, color, false)
	}
}

function clearScreen() {
	canvas = document.getElementById('myCanvas');
	pen = canvas.getContext('2d');
	pen.fillStyle = canvasColor;
	pen.fillRect(0, 0, 450, 300);
}

function drawing() { //Drawing bubbles
	cstep++
	canvas = document.getElementById('myCanvas');
	pen = canvas.getContext('2d');
	pen.fillStyle = canvasColor;

	moveButton();
	clearScreen();

	pen.fillStyle = "rgb(0, 0, 255)";
	pen.fillRect(button1, 250, 50, 10);

	if (difficulty == "easy" && cstep % 35 == 0) {
		randomBubble();
	}

	if (difficulty == "moderate" && cstep % 20 == 0) {
		randomBubble();
	}

	if (difficulty == "hard" && cstep % 10 == 0) {
		randomBubble();
	}

	for (var i = 0; i <= 100; i++) {
		if (ballA[i] != null) {
			if (ballA[i].y + ballA[i].radius > 300) {
				cescaped++;
				ballA[i] = null;
			}
			else if (ballA[i].active == true) {
				pen.fillStyle = ballA[i].color;
				pen.beginPath();
				pen.arc(ballA[i].x, ballA[i].y, ballA[i].radius, 0, Math.PI * 2);
				pen.fill();
				ballA[i].y += 2;
			}
			if (Math.abs(ballA[i].x - button1 - 50 / 2) <= 35 && ballA[i].y > 240 && ballA[i].y < 270) {
				ballA[i] = null;
				cburst++
			}
			if ((cburst + cescaped) == 100) {
				document.getElementById('output') = 'Your hit rate was ' + cburst / 100 * cescaped;
			}
		}

		document.getElementById('steps').innerHTML = 'Steps elapsed:' + celapsed;
		document.getElementById('burst').innerHTML = 'Burst:' + cburst;
		document.getElementById('escaped').innerHTML = 'Escaped:' + cescaped;

		if (cburst + cescaped == 100) {
			document.getElementById('output').innerHTML = 'Game Over, your hit percentage was ' + cburst / 100 * 100 + '%';
		}

	}
}


function randomBubble() { //Place the bubble radomly
	var i = Math.floor(Math.random() * 100);

	while (ballA[i].active == true) {
		i = Math.floor(Math.random() * 100);
	}

	ballA[i].active = true;
	celapsed++
}

function check(v) {
	if (v == "easy") {
		difficulty = "easy";
	}
	else if (v == "moderate") {
		difficulty = "moderate";
	}
	else if (v == "hard") {
		difficulty = "hard";
	}

}

function moveButton() {
	if (button1 < 400 && button2 > 0) {
		button1 += button2;
	}
	if (button1 > 0 && button2 < 0) {
		button1 += button2;
	}
}

function moveLeft() {
	button2 = -speedX;
}

function moveRight() {
	button2 = speedX;
}

function stopMove() {
	button2 = 0;
}

