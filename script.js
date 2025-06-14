// Ссылки на элементы
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
let moveLeft = false;
let moveRight = false;
let gameStarted = false;

let itemsFallIntervals = [];

// Переход от правил к вводу имени
rulesNextBtn.onclick = () => {
  rulesSection.style.display = 'none';
  nameInputSection.style.display = 'block';
};

// Подтверждение имени игрока
confirmNameBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Lūdzu, ievadiet vārdu!');
    return;
  }
  playerName = name;
  nameInputSection.style.display = 'none';
  gameScreen.style.display = 'block';
  startGameBtn.style.display = 'inline-block';
};

// Запуск игры по кнопке
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
  const items = document.querySelectorAll('.item');
  items.forEach(i => i.remove());
}

function dropItem() {
  const item = document.createElement('div');
  const isKabanos = Math.random() < 0.7;
  item.classList.add('item');
  item.classList.add(isKabanos ? 'kabanos' : 'brokoli');
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

      if (item.classList.contains('kabanos')) {
        score++;
      } else {
        lives--;
        if (lives < 0) lives = 0;
        if (lives === 0) {
          endGame();
          return;
        }
      }
      updateHUD();
    } else if (top > 400) {
      if (item.classList.contains('kabanos')) {
        lives--;
        if (lives < 0) lives = 0;
        if (lives === 0) {
          clearInterval(fall);
          item.remove();
          endGame();
          return;
        }
      }
      clearInterval(fall);
      item.remove();
      updateHUD();
    }
  }, 30);

  itemsFallIntervals.push(fall);
}

document.addEventListener('keydown', (e) => {
  if (!gameStarted) return;
  if (e.key === 'ArrowLeft') moveLeft = true;
  if (e.key === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', (e) => {
  if (!gameStarted) return;
  if (e.key === 'ArrowLeft') moveLeft = false;
  if (e.key === 'ArrowRight') moveRight = false;
});

function movePlayer() {
  if (!gameStarted) {
    requestAnimationFrame(movePlayer);
    return;
  }
  const left = parseInt(player.style.left);
  if (moveLeft && left > 0) player.style.left = `${left - 5}px`;
  if (moveRight && left < 550) player.style.left = `${left + 5}px`;
  requestAnimationFrame(movePlayer);
}

movePlayer();

function endGame() {
  gameStarted = false;
  clearInterval(gameInterval);
  clearItems();

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

// Таблица лидеров
function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboardModal() {
  leaderboardList.innerHTML = '';
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<li>Nav ierakstu</li>';
  } else {
    leaderboard.forEach((entry, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${entry.name} - ${entry.score}`;
      leaderboardList.appendChild(li);
    });
  }
  leaderboardModal.style.display = 'block';
}

closeLeaderboardBtn.onclick = () => {
  leaderboardModal.style.display = 'none';
};

window.onclick = (event) => {
  if (event.target === leaderboardModal) {
    leaderboardModal.style.display = 'none';
  }
  if (event.target === gameOverModal) {
    gameOverModal.style.display = 'none';
  }
};
