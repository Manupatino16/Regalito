// ===== ELEMENTOS DEL DOM =====
const giftBox = document.getElementById('giftBox');
const giftLid = document.getElementById('giftLid');
const contentWrapper = document.getElementById('contentWrapper');
const backBtn = document.getElementById('backBtn');
const letterDisplay = document.getElementById('letterDisplay');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

// ===== VARIABLES GLOBALES =====
let giftOpened = false;
let startDate = new Date('2026-02-09T00:00:00'); // Fecha fija de inicio

// ===== LOCALIZACIÓN DEL REGALO =====
giftBox.addEventListener('click', openGift);

function openGift() {
  if (!giftOpened) {
    giftOpened = true;
    giftBox.classList.add('opened');
    
    // Esperar a que termine la animación del regalo
    setTimeout(() => {
      giftBox.style.display = 'none';
      document.querySelector('.gift-subtitle').style.display = 'none';
      contentWrapper.classList.add('visible');
      
      // Cargar datos guardados
      loadSavedLetter();
      updateTimeCounter();
    }, 800);
  }
}

// ===== VOLVER AL REGALO =====
backBtn.addEventListener('click', () => {
  giftOpened = false;
  contentWrapper.classList.remove('visible');
  giftBox.classList.remove('opened');
  giftBox.style.display = 'block';
  document.querySelector('.gift-subtitle').style.display = 'block';
});

// ===== CARTA =====
function loadSavedLetter() {
  const savedLetter = localStorage.getItem('myLetter');
  if (savedLetter && letterDisplay) {
    letterDisplay.textContent = savedLetter;
  }
}

// ===== CONTADOR DE TIEMPO =====
function updateTimeCounter() {
  const now = new Date();
  const diff = now - startDate;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Actualizar tiempo cada segundo
setInterval(updateTimeCounter, 1000);

// ===== MINI JUEGO =====
const gameArea = document.getElementById('gameArea');
const vase = document.getElementById('vase');
const startGameBtn = document.getElementById('startGameBtn');
const flowersCaughtEl = document.getElementById('flowersCaught');
const finalScene = document.getElementById('finalScene');
const gameStatus = document.getElementById('gameStatus');

const totalFlowers = 9;
let gameActive = false;
let flowersCaught = 0;
let fallingFlowers = [];
let totalCreated = 0;
let gameAnimationId;
let vasePosition = 50;

function updateGameStatus() {
  flowersCaughtEl.textContent = flowersCaught;
  gameStatus.textContent = `Flores atrapadas: ${flowersCaught}/${totalFlowers}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function moveVase(normalizedX) {
  vasePosition = clamp(normalizedX, 5, 90);
  vase.style.left = `${vasePosition}%`;
}

const flowerTypes = ['🌸', '🌺', '🌼', '🌻', '🌷', '💮'];
const flowerColors = ['#ff9bca', '#ffcc80', '#d39dff', '#ff7eb9', '#ffe37a'];

function createFlower() {
  if (totalCreated >= totalFlowers) {
    return;
  }
  const flower = document.createElement('div');
  flower.className = 'flower';
  const flowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
  flower.textContent = flowerType;
  flower.style.left = `${Math.random() * 80 + 5}%`;
  flower.style.top = '-50px';
  flower.dataset.speed = (Math.random() * 1.2 + 1.2).toString();
  flower.style.color = flowerType === '🌻' ? '#ffe06f' : '#fff';
  flower.style.fontSize = `${Math.random() * 4 + 20}px`;
  flower.style.background = flowerColors[Math.floor(Math.random() * flowerColors.length)];
  flower.style.boxShadow = `0 0 18px rgba(255, 255, 255, 0.18)`;
  gameArea.appendChild(flower);
  fallingFlowers.push(flower);
  totalCreated += 1;
}

function spawnFlowers(count) {
  for (let i = 0; i < count; i += 1) {
    createFlower();
  }
}

function resetGame() {
  fallingFlowers.forEach((flower) => flower.remove());
  fallingFlowers = [];
  flowersCaught = 0;
  totalCreated = 0;
  gameActive = true;
  finalScene.classList.remove('visible');
  moveVase(50);
  updateGameStatus();
  startGameBtn.textContent = 'Juego en marcha';
  startGameBtn.disabled = true;
}

function endGame() {
  gameActive = false;
  startGameBtn.textContent = 'Reiniciar juego';
  startGameBtn.disabled = false;
  if (flowersCaught >= totalFlowers) {
    gameStatus.textContent = '¡Lo lograste! Ven y reclamas tu beso 💋';
    finalScene.classList.add('visible');
  }
}

function handleCollision(flowerRect, vaseRect) {
  return (
    flowerRect.left + flowerRect.width > vaseRect.left &&
    flowerRect.left < vaseRect.right &&
    flowerRect.top + flowerRect.height > vaseRect.top &&
    flowerRect.top < vaseRect.bottom
  );
}

function updateFlowers() {
  const vaseRect = vase.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();

  fallingFlowers = fallingFlowers.filter((flower) => {
    const speed = parseFloat(flower.dataset.speed) || 2;
    const currentTop = parseFloat(flower.style.top) || 0;
    const nextTop = currentTop + speed;
    flower.style.top = `${nextTop}px`;

    const flowerRect = flower.getBoundingClientRect();
    if (handleCollision(flowerRect, vaseRect)) {
      flower.remove();
      flowersCaught += 1;
      updateGameStatus();
      return false;
    }

    if (nextTop > areaRect.height) {
      flower.remove();
      return false;
    }

    return true;
  });

  if (flowersCaught >= totalFlowers) {
    endGame();
    return;
  }

  if (fallingFlowers.length === 0 && totalCreated < totalFlowers) {
    spawnFlowers(Math.min(3, totalFlowers - totalCreated));
  }

  if (fallingFlowers.length === 0 && totalCreated >= totalFlowers && flowersCaught < totalFlowers) {
    endGame();
    return;
  }

  gameAnimationId = requestAnimationFrame(updateFlowers);
}

function startGame() {
  resetGame();
  spawnFlowers(3);
  updateFlowers();
}

function handleGameMove(event) {
  if (!gameActive) return;
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const areaRect = gameArea.getBoundingClientRect();
  const normalized = ((x - areaRect.left) / areaRect.width) * 100;
  moveVase(normalized);
}

gameArea.addEventListener('mousemove', handleGameMove);
gameArea.addEventListener('touchmove', handleGameMove, { passive: true });

document.addEventListener('keydown', (event) => {
  if (!gameActive) return;
  if (event.key === 'ArrowLeft') {
    moveVase(vasePosition - 8);
  }
  if (event.key === 'ArrowRight') {
    moveVase(vasePosition + 8);
  }
});

startGameBtn.addEventListener('click', startGame);

// ===== INICIALIZACIÓN =====
window.addEventListener('DOMContentLoaded', () => {
  updateTimeCounter();
  loadSavedLetter();
});
