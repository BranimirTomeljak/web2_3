const canvas = document.getElementById("canvas"); // Dobivanje reference na canvas element
const ctx = canvas.getContext("2d");
let gameTime = 0; // Inicijalizacija vremena igre
const playerSize = 40; // Veličina igrača
let playerSpeed = 2; // Brzina igrača
const asteroidSize = 50; // Veličina asteroida
let asteroidSpeed = 3; // Brzina asteroida
const maxAsteroidNumber = 50; // Maksimalan broj asteroida
let asteroidSpawnTime = 1100; // Vrijeme između generiranja asteroida
const asteroidChangePathTime = 20000; // Vrijeme za nasumičnu promjenu putanje asteroida
const asteroids = []; // Array u koji spremamo asteroide

canvas.width = window.innerWidth * 0.99;
canvas.height = window.innerHeight * 0.99;
let playerX = canvas.width / 2; // Početna X pozicija igrača na sredini canvasa
let playerY = canvas.height / 2; // Početna Y pozicija igrača na sredini canvasa
let startTime = new Date().getTime(); // Početno vrijeme igre
let bestTime = localStorage.getItem("bestTime") || 0; // Dohvaćanje najboljeg vremena iz local storagea

// Faze igre, svaka faza ima svoje parametre.
const gameStages = [
  { time: 140000, spawnTime: 200, playerSpeed: 5.5, asteroidSpeed: 6.5 },
  { time: 120000, spawnTime: 300, playerSpeed: 5, asteroidSpeed: 6 },
  { time: 100000, spawnTime: 350, playerSpeed: 4.5, asteroidSpeed: 5.5 },
  { time: 80000, spawnTime: 400, playerSpeed: 4, asteroidSpeed: 5 },
  { time: 60000, spawnTime: 550, playerSpeed: 3.5, asteroidSpeed: 4.5 },
  { time: 40000, spawnTime: 800, playerSpeed: 3, asteroidSpeed: 4 },
  { time: 20000, spawnTime: 1000, playerSpeed: 2.5, asteroidSpeed: 3.5 },
];

let keys = {}; // Objekt za praćenje pritisnutih tipki

document.addEventListener("keydown", function (event) {
  keys[event.key] = true; // Postavljanje pritisnute tipke na true
});

document.addEventListener("keyup", function (event) {
  keys[event.key] = false; // Postavljanje otpuštene tipke na false
});

function movePlayer() {
  if (keys["ArrowUp"] && keys["ArrowRight"]) {
    // Pomak igrača prema gore desno
    playerX += playerSpeed / Math.sqrt(2);
    playerY -= playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowUp"] && keys["ArrowLeft"]) {
    // Pomak igrača prema gore lijevo
    playerX -= playerSpeed / Math.sqrt(2);
    playerY -= playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowDown"] && keys["ArrowRight"]) {
    // Pomak igrača prema dolje desno
    playerX += playerSpeed / Math.sqrt(2);
    playerY += playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowDown"] && keys["ArrowLeft"]) {
    // Pomak igrača prema dolje lijevo
    playerX -= playerSpeed / Math.sqrt(2);
    playerY += playerSpeed / Math.sqrt(2);
  } else if (keys["ArrowUp"]) {
    // Pomak igrača prema gore
    playerY -= playerSpeed;
  } else if (keys["ArrowDown"]) {
    // Pomak igrača prema dolje
    playerY += playerSpeed;
  } else if (keys["ArrowRight"]) {
    // Pomak igrača u desno
    playerX += playerSpeed;
  } else if (keys["ArrowLeft"]) {
    // Pomak igrača u lijevo
    playerX -= playerSpeed;
  }
}

function gameLoop() {
  update(); // Ažuriranje stanja igre
  render(); // Crtanje igre
}

function update() {
  checkCollision(); // Provjeravanje sudara
  movePlayer(); // Pomak igrača
  gameTime = new Date().getTime() - startTime; // Ažuriranje vremena igre

  // Ažuriranje pozicija asteroida
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    asteroid.x += asteroid.dx;
    asteroid.y += asteroid.dy;
  }

  // Promjena parametara igre prema fazama
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
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Brisanje prethodnog kadra
  drawPlayer(); // Crtanje igrača

  for (let i = 0; i < asteroids.length; i++) drawAsteroid(asteroids[i]); // Crtanje asteroida

  displayTime(); // Prikaz vremena igre
  displayBestTime(); // Prikaz najboljeg vremena
  requestAnimationFrame(gameLoop); // Ponovni poziv glavne petlje za animaciju
}

function generateAsteroids() {
  let x, y, dx, dy;
  const side = Math.floor(Math.random() * 4);

  if (side === 0) {
    // Asteroid dolazi s lijeva
    x = -asteroidSize;
    y = Math.random() * canvas.height;
  } else if (side === 1) {
    // Asteroid dolazi s desna
    x = canvas.width + asteroidSize;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    // Asteroid dolazi odozgo
    x = Math.random() * canvas.width;
    y = -asteroidSize;
  } else {
    // Asteroid dolazi odozdo
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

  // Za sprječavanje eventualnog zagušenja, da ne bi bilo previše asteroida van canvasa
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
      endGame(); // Završetak igre u slučaju sudara
      break;
    }
  }
}

function changeAsteroidPath() {
  for (let i = 0; i < asteroids.length; i++) {
    // Nasumična promjena smjera kretanja asteroida
    asteroids[i].dx = Math.cos(Math.random() * Math.PI * 2) * asteroidSpeed;
    asteroids[i].dy = Math.sin(Math.random() * Math.PI * 2) * asteroidSpeed;
  }
}

function endGame() {
  if (gameTime > parseFloat(bestTime) || bestTime === 0)
    localStorage.setItem("bestTime", gameTime); // Ažuriranje najboljeg vremena ako je trenutno vrijeme bolje.

  location.reload(); // Ponovno učitavanje igre nakon završetka
}

// Funkcija za crtanje igrača
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

// Funkcija za crtanje asteroida
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

// Funkcija za formatiranje vremena
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

// Funkcija za prikazivanje najboljeg vremena
function displayBestTime() {
  const bestTimeFromStorage = parseFloat(localStorage.getItem("bestTime") || 0);
  const bestTimeText = "Najbolje vrijeme: " + formatTime(bestTimeFromStorage);
  const x = canvas.width - ctx.measureText(bestTimeText).width - 10;
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(bestTimeText, x, 30);
}

// Funkcija za prikazivanje trenutnog vremena
function displayTime() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  const timeText = "Vrijeme: " + formatTime(gameTime);
  const x = canvas.width - ctx.measureText(timeText).width - 10;
  ctx.fillText(timeText, x, 60);
}

for (let i = 0; i < 2; i++) generateAsteroids(); // Generiranje početnih asteroida
requestAnimationFrame(gameLoop); // Pokretanje glavne petlje za animaciju
setInterval(generateAsteroids, asteroidSpawnTime); // Interval za generiranje asteroida
setInterval(changeAsteroidPath, asteroidChangePathTime); // Interval za promjenu nasumične putanje asteroida
