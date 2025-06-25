// --- UI elementi ---
// Iegūst HTML elementus no dokumenta pēc to ID
const rulesSection = document.getElementById("rulesSection");
const rulesNextBtn = document.getElementById("rulesNextBtn");

const nameInputSection = document.getElementById("nameInputSection");
const playerNameInput = document.getElementById("playerName");
const confirmNameBtn = document.getElementById("confirmNameBtn");

const gameScreen = document.getElementById("gameScreen");
const startGameBtn = document.getElementById("startGameBtn");

const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

const gameOverModal = document.getElementById("gameOverModal");
const finalPlayerNameSpan = document.getElementById("finalPlayerName");
const finalScoreSpan = document.getElementById("finalScore");
const restartGameBtn = document.getElementById("restartGameBtn");
const showLeaderboardBtn = document.getElementById("showLeaderboardBtn");

const leaderboardModal = document.getElementById("leaderboardModal");
const closeLeaderboardBtn = document.getElementById("closeLeaderboard");
const leaderboardList = document.getElementById("leaderboardList");

const restartFromLeaderboardBtn = document.getElementById("restartFromLeaderboardBtn");

// Poga, lai restartētu spēli no rezultātu tabulas
restartFromLeaderboardBtn.onclick = () => {
  leaderboardModal.style.display = "none"; // Paslēpj rezultātu tabulu
  gameOverModal.style.display = "none"; // Paslēpj spēles beigu logu
  gameScreen.style.display = "block"; // Parāda spēles ekrānu
  startGameBtn.style.display = "none"; // Paslēpj "Sākt spēli" pogu
  startGame(); // Uzsāk spēli
};

// --- Spēles mainīgie ---
// Glabā spēlētāja vārdu, rezultātu, dzīvības un spēles stāvokli
let playerName = "";
let score = 0;
let lives = 3;
let gameInterval;
let gameStarted = false;
let itemsFallIntervals = []; // Saraksts ar intervāliem, lai varētu tos apturēt

// --- Pārejas starp sadaļām ---
// Kad nospiež "Tālāk" no noteikumiem — parāda vārda ievades lauku
rulesNextBtn.onclick = () => {
  rulesSection.style.display = "none";
  nameInputSection.style.display = "block";
};

// Kad apstiprina vārdu — pārbauda ievadi un pāriet uz spēles ekrānu
confirmNameBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert("Lūdzu, ievadiet vārdu!");
    return;
  }
  playerName = name;
  nameInputSection.style.display = "none";
  gameScreen.style.display = "block";
  startGameBtn.style.display = "inline-block";
};

// Kad nospiež "Sākt spēli", uzsāk spēli
startGameBtn.onclick = () => {
  startGameBtn.style.display = "none";
  startGame();
};

// --- Spēles uzsākšana ---
// Funkcija, kas inicializē spēli no jauna
function startGame() {
  score = 0;
  lives = 3;
  updateHUD(); // Atjauno punktus un dzīvības
  clearItems(); // Noņem iepriekšējos objektus, ja tādi bija
  player.style.left = (game.clientWidth - player.clientWidth) / 2 + "px"; // Centrē spēlētāju
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(dropItem, 1000); // Ik pēc 1s krīt jauns objekts
  gameStarted = true;
}

// --- Atjauno punktu skaitu un dzīvības ekrānā ---
function updateHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

// --- Noņem visus priekšmetus no spēles laukuma ---
function clearItems() {
  itemsFallIntervals.forEach((i) => clearInterval(i)); // Aptur kustību
  itemsFallIntervals = [];
  document.querySelectorAll(".item").forEach((i) => i.remove()); // Noņem HTML elementus
}

// --- Izveido jaunu krītošu objektu ---
function dropItem() {
  const item = document.createElement("div");
  const isKabanos = Math.random() < 0.7; // 70% iespēja, ka tas būs kabanoss

  item.classList.add("item", isKabanos ? "kabanos" : "brokoli");
  item.style.left = Math.random() * (game.clientWidth - 90) + "px";

  // Ja objekts ir kabanoss — pievieno trīs dažādus attēlus
  if (isKabanos) {
    for (let i = 1; i <= 3; i++) {
      const img = document.createElement("img");
      img.src = `images/sos${i}.png`;
      img.style.width = "30px";
      img.style.height = "30px";
      item.appendChild(img);
    }
  } else {
    // Brokoļu gadījumā izmanto sushi attēlu
    const sushina = document.createElement("img");
    sushina.src = "images/sushi.png";
    sushina.style.width = "30px";
    sushina.style.height = "30px";
    item.appendChild(sushina);
  }

  game.appendChild(item);

  // Krītoša objekta animācija
  let top = 0;
  const fall = setInterval(() => {
    top += 5;
    item.style.top = top + "px";

    // Kolīzijas pārbaude starp objektu un spēlētāju
    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (
      itemRect.bottom >= playerRect.top &&
      itemRect.left < playerRect.right &&
      itemRect.right > playerRect.left
    ) {
      clearInterval(fall);
      item.remove();
      if (item.classList.contains("kabanos")) {
        score++;
      } else {
        lives--;
      }
      updateHUD();
      if (lives <= 0) endGame();
    } else if (top > game.clientHeight) {
      clearInterval(fall);
      item.remove();
      if (item.classList.contains("kabanos")) {
        lives--;
        updateHUD();
        if (lives <= 0) endGame();
      }
    }
  }, 30);

  itemsFallIntervals.push(fall);
}

// --- Spēles beigas ---
function endGame() {
  gameStarted = false;
  clearInterval(gameInterval);
  clearItems();
  saveScore(playerName, score); // Saglabā rezultātu localStorage
  finalPlayerNameSpan.textContent = playerName;
  finalScoreSpan.textContent = score;
  gameOverModal.style.display = "block";
}

// --- Spēles restartēšana ---
restartGameBtn.onclick = () => {
  gameOverModal.style.display = "none";
  startGameBtn.style.display = "inline-block";
};

// --- Parādīt rezultātu tabulu ---
showLeaderboardBtn.onclick = () => {
  gameOverModal.style.display = "none";
  showLeaderboardModal();
};

// --- Saglabā rezultātus localStorage un kārto top10 ---
function saveScore(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score); // Kārto pēc punktiem dilstoši
  leaderboard = leaderboard.slice(0, 10); // Glabā tikai top 10
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

// --- Parāda rezultātu tabulu modal logā ---
function showLeaderboardModal() {
  leaderboardList.innerHTML = "";
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = "<li>Nav ierakstu</li>";
  } else {
    leaderboard.forEach((entry, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${entry.name} - ${entry.score}`;
      leaderboardList.appendChild(li);
    });
  }
  leaderboardModal.style.display = "block";
}

// --- Aizver rezultātu tabulu ---
closeLeaderboardBtn.onclick = () => {
  leaderboardModal.style.display = "none";
};

// --- Klaviatūras vadība ---
// Reģistrē taustiņu nospiešanu
let moveLeft = false;
let moveRight = false;

document.addEventListener("keydown", (e) => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") moveLeft = true;
  if (e.key === "ArrowRight") moveRight = true;
});

document.addEventListener("keyup", (e) => {
  if (!gameStarted) return;
  if (e.key === "ArrowLeft") moveLeft = false;
  if (e.key === "ArrowRight") moveRight = false;
});

// --- Spēlētāja kustība pa horizontāli (atkārtojas ar requestAnimationFrame) ---
function movePlayer() {
  if (gameStarted) {
    const left = parseInt(player.style.left || "0");
    if (moveLeft && left > 0) {
      player.style.left = left - 5 + "px";
    }
    if (moveRight && left < game.clientWidth - player.clientWidth) {
      player.style.left = left + 5 + "px";
    }
  }
  requestAnimationFrame(movePlayer); // Nepārtraukta spēlētāja kustība
}
movePlayer();

// --- Pieskārienu vadība mobilajām ierīcēm ---
game.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touchX = e.touches[0].clientX;
  movePlayerTo(touchX);
});

game.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touchX = e.touches[0].clientX;
  movePlayerTo(touchX);
});

// Pārvieto spēlētāju pēc pieskāriena koordinātēm
function movePlayerTo(clientX) {
  const gameRect = game.getBoundingClientRect();
  let newLeft = clientX - gameRect.left - player.clientWidth / 2;
  if (newLeft < 0) newLeft = 0;
  if (newLeft > game.clientWidth - player.clientWidth) {
    newLeft = game.clientWidth - player.clientWidth;
  }
  player.style.left = newLeft + "px";
}
