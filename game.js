const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let gameTime = 0;
const playerSize = 40;
let playerSpeed = 2;
const asteroidSize = 50;
let asteroidSpeed = 3;
const maxAsteroidNumber = 50;
let asteroidSpawnTime = 1100;
const asteroidChangePathTime = 20000;
const asteroids = [];

const gameStages = [
  { time: 140000, spawnTime: 200, playerSpeed: 5.5, asteroidSpeed: 6.5 },
  { time: 120000, spawnTime: 300, playerSpeed: 5, asteroidSpeed: 6 },
  { time: 100000, spawnTime: 400, playerSpeed: 4.5, asteroidSpeed: 5.5 },
  { time: 80000, spawnTime: 450, playerSpeed: 4, asteroidSpeed: 5 },
  { time: 60000, spawnTime: 700, playerSpeed: 3.5, asteroidSpeed: 4.5 },
  { time: 40000, spawnTime: 900, playerSpeed: 3, asteroidSpeed: 4 },
  { time: 20000, spawnTime: 1000, playerSpeed: 2.5, asteroidSpeed: 3.5 },
];

canvas.width = window.innerWidth * 0.99;
canvas.height = window.innerHeight * 0.99;
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;
let startTime = new Date().getTime();
let bestTime = localStorage.getItem("bestTime") || 0;

let keys = {};
document.addEventListener("keydown", function (event) {
  keys[event.key] = true;
});

document.addEventListener("keyup", function (event) {
  keys[event.key] = false;
});

function movePlayer() {
  if (keys["ArrowUp"] && keys["ArrowRight"]) {
    playerX += playerSpeed / Math.sqrt(2);
    playerY -= playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowUp"] && keys["ArrowLeft"]) {
    playerX -= playerSpeed / Math.sqrt(2);
    playerY -= playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowDown"] && keys["ArrowRight"]) {
    playerX += playerSpeed / Math.sqrt(2);
    playerY += playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowDown"] && keys["ArrowLeft"]) {
    playerX -= playerSpeed / Math.sqrt(2);
    playerY += playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowUp"]) {
    playerY -= playerSpeed;
  } else if (keys["ArrowDown"]) {
    playerY += playerSpeed;
  } else if (keys["ArrowRight"]) {
    playerX += playerSpeed;
  } else if (keys["ArrowLeft"]) {
    playerX -= playerSpeed;
  }
}

function gameLoop() {
  update();
  render();
}

function update() {
  checkCollision();
  movePlayer();
  gameTime = new Date().getTime() - startTime;

  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    asteroid.x += asteroid.dx;
    asteroid.y += asteroid.dy;
  }

  for (let i = 0; i < gameStages.length; i++) {
    if (gameTime > gameStages[i].time) {
      asteroidSpawnTime = gameStages[i].spawnTime;
      playerSpeed = gameStages[i].playerSpeed;
      asteroidSpeed = gameStages[i].asteroidSpeed;
      break;
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  
  for (let i = 0; i < asteroids.length; i++) drawAsteroid(asteroids[i]);

  displayTime();
  displayBestTime();
  requestAnimationFrame(gameLoop);
}

function generateAsteroids() {
  let x, y, dx, dy;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) {
    // Lijevo
    x = -asteroidSize;
    y = Math.random() * canvas.height;
  } else if (side === 1) {
    // Desno
    x = canvas.width + asteroidSize;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    // Gore
    x = Math.random() * canvas.width;
    y = -asteroidSize;
  } else {
    // Dole
    x = Math.random() * canvas.width;
    y = canvas.height + asteroidSize;
  }

  const angleToPlayer = Math.atan2(playerY - y, playerX - x);

  // Dodaj random varijaciju od +- 30 stupnjeva na kut prema igraču
  const angleVariation = (Math.random() - 0.5) * (Math.PI / 6);
  const finalAngle = angleToPlayer + angleVariation;

  // Izračun promjene u x i y smjeru
  dx = Math.cos(finalAngle) * asteroidSpeed;
  dy = Math.sin(finalAngle) * asteroidSpeed;

  asteroids.push({ x, y, dx, dy });

  // za sprječavanje eventualnog zagušenja, da ne bi bilo previše asteroida van canvasa
  if (asteroids.length > maxAsteroidNumber) asteroids.splice(0, 1);
}

function checkCollision() {
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];

    const playerLeft = playerX - playerSize / 2;
    const playerRight = playerX + playerSize / 2;
    const playerTop = playerY - playerSize / 2;
    const playerBottom = playerY + playerSize / 2;

    const asteroidLeft = asteroid.x - asteroidSize / 2;
    const asteroidRight = asteroid.x + asteroidSize / 2;
    const asteroidTop = asteroid.y - asteroidSize / 2;
    const asteroidBottom = asteroid.y + asteroidSize / 2;

    if (
      playerLeft < asteroidRight &&
      playerRight > asteroidLeft &&
      playerTop < asteroidBottom &&
      playerBottom > asteroidTop
    ) {
      endGame();
      break;
    }
  }
}

function changeAsteroidPath() {
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].dx = Math.cos(Math.random() * Math.PI * 2) * asteroidSpeed;
    asteroids[i].dy = Math.sin(Math.random() * Math.PI * 2) * asteroidSpeed;
  }
}

function endGame() {
  if (gameTime > parseFloat(bestTime) || bestTime === 0)
    localStorage.setItem("bestTime", gameTime);

  location.reload();
}

function drawPlayer() {
  ctx.shadowColor = "rgba(128, 128, 128, 0.7)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "red";
  ctx.fillRect(
    playerX - playerSize / 2,
    playerY - playerSize / 2,
    playerSize,
    playerSize
  );
}

function drawAsteroid(asteroid) {
  ctx.shadowColor = "rgba(128, 128, 128, 0.7)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "gray";
  ctx.fillRect(
    asteroid.x - asteroidSize / 2,
    asteroid.y - asteroidSize / 2,
    asteroidSize,
    asteroidSize
  );
}

function formatTime(time) {
  const minutes = Math.floor(time / 60000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((time % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const milliseconds = (time % 1000).toString().padStart(3, "0");
  return `${minutes}:${seconds}.${milliseconds}`;
}

function displayBestTime() {
  const bestTimeFromStorage = parseFloat(localStorage.getItem("bestTime") || 0);
  const bestTimeText = "Najbolje vrijeme: " + formatTime(bestTimeFromStorage);
  const x = canvas.width - ctx.measureText(bestTimeText).width - 10;
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(bestTimeText, x, 30);
}

function displayTime() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  const timeText = "Vrijeme: " + formatTime(gameTime);
  const x = canvas.width - ctx.measureText(timeText).width - 10;
  ctx.fillText(timeText, x, 60);
}

for (let i = 0; i < 2; i++) generateAsteroids();
requestAnimationFrame(gameLoop);
setInterval(generateAsteroids, asteroidSpawnTime);
setInterval(changeAsteroidPath, asteroidChangePathTime);