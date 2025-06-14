const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let score = 0;
let lives = 3;
let gameInterval;
let moveLeft = false;
let moveRight = false;

function startGame() {
  score = 0;
  lives = 3;
  updateHUD();
  clearItems();
  player.style.left = '275px';
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(dropItem, 1000);
}

function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function clearItems() {
  const items = document.querySelectorAll('.item');
  items.forEach(i => i.remove());
}

function dropItem() {
  const item = document.createElement('div');
  const isKabanos = Math.random() < 0.7;
  item.classList.add('item');
  item.classList.add(isKabanos ? 'kabanos' : 'brokoli');
  item.style.left = `${Math.random() * 570}px`;
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
        if (lives === 0) {
          alert('Spēle beigusies! Punkti: ' + score);
          clearInterval(gameInterval);
          clearItems();
        }
      }
      updateHUD();
    } else if (top > 400) {
      clearInterval(fall);
      item.remove();
    }
  }, 30);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') moveLeft = true;
  if (e.key === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') moveLeft = false;
  if (e.key === 'ArrowRight') moveRight = false;
});

function movePlayer() {
  const left = parseInt(player.style.left);
  if (moveLeft && left > 0) player.style.left = `${left - 5}px`;
  if (moveRight && left < 550) player.style.left = `${left + 5}px`;
  requestAnimationFrame(movePlayer);
}

movePlayer();
