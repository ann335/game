const rulesSection = document.getElementById('rulesSection');
const rulesNextBtn = document.getElementById('rulesNextBtn');
const nameInputSection = document.getElementById('nameInputSection');
const playerNameInput = document.getElementById('playerName');
const confirmNameBtn = document.getElementById('confirmNameBtn');
const gameScreen = document.getElementById('gameScreen');
const startGameBtn = document.getElementById('startGameBtn');
const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverModal = document.getElementById('gameOverModal');
const finalPlayerNameSpan = document.getElementById('finalPlayerName');
const finalScoreSpan = document.getElementById('finalScore');
const restartGameBtn = document.getElementById('restartGameBtn');
const showLeaderboardBtn = document.getElementById('showLeaderboardBtn');
const leaderboardModal = document.getElementById('leaderboardModal');
const closeLeaderboardBtn = document.getElementById('closeLeaderboard');
const leaderboardList = document.getElementById('leaderboardList');

let playerName = '';
let score = 0;
let lives = 3;
let gameInterval;
let gameStarted = false;
let itemsFallIntervals = [];

// Правила → ввод имени
rulesNextBtn.onclick = () => {
  rulesSection.style.display = 'none';
  nameInputSection.style.display = 'block';
};

// Имя → экран игры
confirmNameBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) return alert('Lūdzu, ievadiet vārdu!');
  playerName = name;
  nameInputSection.style.display = 'none';
  gameScreen.style.display = 'block';
  startGameBtn.style.display = 'inline-block';
};

startGameBtn.onclick = () => {
  startGameBtn.style.display = 'none';
  startGame();
};

function startGame() {
  score = 0;
  lives = 3;
  updateHUD();
  clearItems();
  player.style.left = '275px';
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(dropItem, 1000);
  gameStarted = true;
}

function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function clearItems() {
  itemsFallIntervals.forEach(i => clearInterval(i));
  itemsFallIntervals = [];
  document.querySelectorAll('.item').forEach(i => i.remove());
}

function dropItem() {
  const item = document.createElement('div');
  const isKabanos = Math.random() < 0.7;
  item.classList.add('item', isKabanos ? 'kabanos' : 'brokoli');
  item.style.left = `${Math.random() * 570}px`;
  item.style.top = '0px';
  game.appendChild(item);

  let top = 0;
  const fall = setInterval(() => {
    top += 5;
    item.style.top = `${top}px`;

    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      itemRect.bottom >= playerRect.top &&
      itemRect.left < playerRect.right &&
      itemRect.right > playerRect.left
    ) {
      clearInterval(fall);
      item.remove();
      if (item.classList.contains('kabanos')) score++;
      else lives--;
      if (lives <= 0) return endGame();
      updateHUD();
    } else if (top > 400) {
      if (item.classList.contains('kabanos')) {
        lives--;
        if (lives <= 0) return endGame();
      }
      clearInterval(fall);
      item.remove();
      updateHUD();
    }
  }, 30);

  itemsFallIntervals.push(fall);
}

function endGame() {
  gameStarted = false;
  clearInterval(gameInterval);
  clearItems();
  if (lives < 0) lives = 0;
  saveScore(playerName, score);
  finalPlayerNameSpan.textContent = playerName;
  finalScoreSpan.textContent = score;
  gameOverModal.style.display = 'block';
}

restartGameBtn.onclick = () => {
  gameOverModal.style.display = 'none';
  startGameBtn.style.display = 'inline-block';
};

showLeaderboardBtn.onclick = () => {
  gameOverModal.style.display = 'none';
  showLeaderboardModal();
};

function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboardModal() {
  leaderboardList.innerHTML = '';
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.length
    ? leaderboard.forEach((e, i) => {
        const li = document.createElement('li');
        li.textContent = `${i + 1}. ${e.name} - ${e.score}`;
        leaderboardList.appendChild(li);
      })
    : (leaderboardList.innerHTML = '<li>Nav ierakstu</li>');
  leaderboardModal.style.display = 'block';
}

closeLeaderboardBtn.onclick = () => leaderboardModal.style.display = 'none';

window.onclick = (event) => {
  if (event.target === leaderboardModal) leaderboardModal.style.display = 'none';
  if (event.target === gameOverModal) gameOverModal.style.display = 'none';
};

// 👇 Мобильное управление
let touchStartX = null;
game.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});
game.addEventListener('touchmove', (e) => {
  if (!gameStarted || touchStartX === null) return;
  const touchX = e.touches[0].clientX;
  const dx = touchX - touchStartX;
  const currentLeft = parseInt(player.style.left);
  let newLeft = currentLeft + dx;
  if (newLeft < 0) newLeft = 0;
  if (newLeft > 550) newLeft = 550;
  player.style.left = `${newLeft}px`;
  touchStartX = touchX;
});
