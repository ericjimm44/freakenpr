// script.js

// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Paddle Object
function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.speed = 10; // Paddle speed
  this.dy = 0; // Vertical movement direction

  this.draw = function() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Ball Object
function Ball(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.dx = 5; // Horizontal speed
  this.dy = 5; // Vertical speed

  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
}

// Initialization
canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;

// Create Player 1 Paddle
const player1 = new Paddle(30, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight); // Adjusted x for visibility

// Create Player 2 Paddle
const player2 = new Paddle(canvas.width - paddleWidth - 30, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight); // Adjusted x for visibility

// Create Ball
const ball = new Ball(canvas.width / 2, canvas.height / 2, 7);

// Score
let player1Score = 0;
let player2Score = 0;
const player1ScoreElement = document.getElementById('player1-score');
const player2ScoreElement = document.getElementById('player2-score');

// Paddle Movement Logic
function movePaddles() {
  // Player 1
  player1.y += player1.dy;
  // Keep paddle within canvas bounds
  if (player1.y < 0) {
    player1.y = 0;
  }
  if (player1.y + player1.height > canvas.height) {
    player1.y = canvas.height - player1.height;
  }

  // Player 2
  player2.y += player2.dy;
  // Keep paddle within canvas bounds
  if (player2.y < 0) {
    player2.y = 0;
  }
  if (player2.y + player2.height > canvas.height) {
    player2.y = canvas.height - player2.height;
  }
}

// Ball Movement and Collision Logic
function updateBall() {
  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall Collision (top/bottom)
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Paddle Collision
  // Player 1 (left paddle)
  if (ball.x - ball.radius < player1.x + player1.width &&
      ball.y > player1.y &&
      ball.y < player1.y + player1.height &&
      ball.dx < 0) { // Check if ball is moving towards player1
    ball.dx *= -1;
    // Optional: Increase speed
    // ball.dx *= 1.1;
    // ball.dy *= 1.1;
  }

  // Player 2 (right paddle)
  if (ball.x + ball.radius > player2.x &&
      ball.y > player2.y &&
      ball.y < player2.y + player2.height &&
      ball.dx > 0) { // Check if ball is moving towards player2
    ball.dx *= -1;
    // Optional: Increase speed
    // ball.dx *= 1.1;
    // ball.dy *= 1.1;
  }

  // Scoring
  if (ball.x - ball.radius < 0) { // Player 2 scores
    player2Score++;
    player2ScoreElement.textContent = `Player 2: ${player2Score}`;
    resetBall(-1); // Ball moves towards player 1
  } else if (ball.x + ball.radius > canvas.width) { // Player 1 scores
    player1Score++;
    player1ScoreElement.textContent = `Player 1: ${player1Score}`;
    resetBall(1); // Ball moves towards player 2
  }
}

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 5 * direction; // Control initial horizontal direction
  // Randomize vertical direction slightly
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3 + 2); // Random speed between 2 and 5
}


// Keyboard event listeners
document.addEventListener('keydown', function(event) {
  // Player 1 controls
  if (event.key === 'w' || event.key === 'W') {
    player1.dy = -player1.speed;
  } else if (event.key === 's' || event.key === 'S') {
    player1.dy = player1.speed;
  }
  // Player 2 controls
  if (event.key === 'ArrowUp') {
    player2.dy = -player2.speed;
  } else if (event.key === 'ArrowDown') {
    player2.dy = player2.speed;
  }
});

document.addEventListener('keyup', function(event) {
  // Player 1 controls
  if ((event.key === 'w' || event.key === 'W') && player1.dy < 0) {
    player1.dy = 0;
  } else if ((event.key === 's' || event.key === 'S') && player1.dy > 0) {
    player1.dy = 0;
  }
  // Player 2 controls
  if (event.key === 'ArrowUp' && player2.dy < 0) {
    player2.dy = 0;
  } else if (event.key === 'ArrowDown' && player2.dy > 0) {
    player2.dy = 0;
  }
});


// Game Loop
function gameLoop() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move Paddles
  movePaddles();

  // Update Ball (includes movement, collision, scoring)
  updateBall();

  // Draw elements
  player1.draw();
  player2.draw();
  ball.draw();

  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Start the game loop
console.log("script.js loaded - Full game logic implemented");
player1ScoreElement.textContent = `Player 1: ${player1Score}`;
player2ScoreElement.textContent = `Player 2: ${player2Score}`;
gameLoop();
