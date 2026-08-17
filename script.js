/* =========================================
   VALOUR ARCADE
========================================= */

let currentGame = "aim";

let gameRunning = false;

let score = 0;
let timeLeft = 30;

let timer = null;

let soundEnabled = true;

let hits = 0;
let misses = 0;

let reactionStart = 0;

let numberCurrent = 1;

let clickCount = 0;


/* =========================================
   ELEMENTS
========================================= */

const gameArea =
  document.getElementById("gameArea");

const scoreElement =
  document.getElementById("score");

const timeElement =
  document.getElementById("gameTime");

const titleElement =
  document.getElementById("gameTitle");

const descriptionElement =
  document.getElementById("gameDescription");

const message =
  document.getElementById("gameMessage");


/* =========================================
   GAME DATA
========================================= */

const games = {

  aim: {
    title: "Aim Trainer",
    description:
      "Hit as many targets as possible in 30 seconds."
  },

  reaction: {
    title: "Reaction Test",
    description:
      "Wait for green, then click as fast as possible."
  },

  memory: {
    title: "Memory Challenge",
    description:
      "Remember the highlighted pattern."
  },

  precision: {
    title: "Precision Shot",
    description:
      "Hit small targets for maximum points."
  },

  numbers: {
    title: "Number Rush",
    description:
      "Click numbers in the correct order."
  },

  clicker: {
    title: "Speed Clicker",
    description:
      "Click as many times as possible."
  }

};


/* =========================================
   SELECT GAME
========================================= */

function selectGame(game) {

  if (gameRunning) {
    endGame();
  }

  currentGame = game;

  const data = games[game];

  titleElement.textContent =
    data.title;

  descriptionElement.textContent =
    data.description;

  document
    .querySelectorAll(".game-button")
    .forEach(button => {
      button.classList.remove("active");
    });

  event.currentTarget.classList.add("active");

  resetDisplay();
}


/* =========================================
   START GAME
========================================= */

function startGame() {

  if (gameRunning) {
    return;
  }

  gameRunning = true;

  score = 0;

  hits = 0;

  misses = 0;

  clickCount = 0;

  timeLeft = 30;

  numberCurrent = 1;

  updateDisplay();

  message.style.display = "none";

  gameArea.innerHTML = "";

  switch (currentGame) {

    case "aim":
      startAim(false);
      break;

    case "precision":
      startAim(true);
      break;

    case "reaction":
      startReaction();
      break;

    case "memory":
      startMemory();
      break;

    case "numbers":
      startNumbers();
      break;

    case "clicker":
      startClicker();
      break;
  }
}


/* =========================================
   TIMER
========================================= */

function startTimer(seconds = 30) {

  timeLeft = seconds;

  updateDisplay();

  timer = setInterval(() => {

    timeLeft -= .01;

    if (timeLeft <= 0) {

      timeLeft = 0;

      endGame();

      return;
    }

    updateDisplay();

  }, 10);
}


/* =========================================
   AIM TRAINER
========================================= */

function startAim(precision) {

  spawnAimTarget(precision);

  startTimer();
}


function spawnAimTarget(precision) {

  const target =
    document.createElement("div");

  target.className = "target";

  const size =
    precision
      ? 28
      : 50;

  target.style.width =
    `${size}px`;

  target.style.height =
    `${size}px`;

  const padding = 35;

  const x =
    padding +
    Math.random() *
    (gameArea.clientWidth -
      padding * 2);

  const y =
    padding +
    Math.random() *
    (gameArea.clientHeight -
      padding * 2);

  target.style.left =
    `${x}px`;

  target.style.top =
    `${y}px`;

  target.onclick = e => {

    e.stopPropagation();

    hits++;

    score +=
      precision
        ? 250
        : 100;

    playSound();

    target.remove();

    spawnAimTarget(precision);

    updateDisplay();
  };

  gameArea.appendChild(target);
}


/* =========================================
   REACTION TEST
========================================= */

function startReaction() {

  const wait =
    document.createElement("div");

  wait.className =
    "reaction-wait";

  wait.textContent =
    "WAIT...";

  gameArea.appendChild(wait);


  const delay =
    1500 +
    Math.random() * 3500;


  const timeout =
    setTimeout(() => {

      if (!gameRunning) {
        return;
      }

      wait.classList.add(
        "reaction-ready"
      );

      wait.textContent =
        "CLICK NOW!";

      reactionStart =
        performance.now();

      wait.onclick = () => {

        const reaction =
          performance.now() -
          reactionStart;

        score =
          Math.max(
            1,
            Math.round(
              1000 - reaction
            )
          );

        wait.remove();

        finishCurrentGame(
          `Reaction time: ${Math.round(reaction)} ms`
        );

      };

    }, delay);


  window.currentReactionTimeout =
    timeout;
}


/* =========================================
   MEMORY GAME
========================================= */

let memoryPattern = [];

let memoryStep = 0;


function startMemory() {

  gameArea.innerHTML = "";

  const grid =
    document.createElement("div");

  grid.className =
    "memory-grid";

  gameArea.appendChild(grid);

  memoryPattern = [];

  memoryStep = 0;


  for (let i = 0; i < 9; i++) {

    const tile =
      document.createElement("button");

    tile.className =
      "memory-tile";

    tile.dataset.index =
      i;

    tile.onclick = () =>
      memoryClick(tile);

    grid.appendChild(tile);
  }


  addMemoryStep();
}


function addMemoryStep() {

  const tiles =
    document.querySelectorAll(
      ".memory-tile"
    );

  const next =
    Math.floor(
      Math.random() * 9
    );

  memoryPattern.push(next);

  showMemoryPattern(
    tiles
  );
}


function showMemoryPattern(tiles) {

  let i = 0;

  const interval =
    setInterval(() => {

      if (i > 0) {
        tiles[
          memoryPattern[i - 1]
        ].classList.remove("active");
      }

      if (
        i >= memoryPattern.length
      ) {

        clearInterval(interval);

        return;
      }

      tiles[
        memoryPattern[i]
      ].classList.add("active");

      i++;

    }, 500);
}


function memoryClick(tile) {

  if (!gameRunning) {
    return;
  }

  const expected =
    memoryPattern[memoryStep];

  const clicked =
    Number(tile.dataset.index);


  if (clicked !== expected) {

    endGame();

    return;
  }


  tile.classList.add("active");

  setTimeout(() => {
    tile.classList.remove("active");
  }, 150);


  memoryStep++;

  score += 100;

  playSound();


  if (
    memoryStep >=
    memoryPattern.length
  ) {

    memoryStep = 0;

    setTimeout(
      addMemoryStep,
      300
    );
  }

  updateDisplay();
}


/* =========================================
   NUMBER RUSH
========================================= */

function startNumbers() {

  numberCurrent = 1;

  spawnNumber();

  startTimer();
}


function spawnNumber() {

  const target =
    document.createElement("div");

  target.className =
    "number-target";

  target.textContent =
    numberCurrent;

  const x =
    40 +
    Math.random() *
    (gameArea.clientWidth - 80);

  const y =
    40 +
    Math.random() *
    (gameArea.clientHeight - 80);

  target.style.left =
    `${x}px`;

  target.style.top =
    `${y}px`;


  target.onclick = e => {

    e.stopPropagation();

    numberCurrent++;

    score += 150;

    playSound();

    target.remove();

    spawnNumber();

    updateDisplay();
  };


  gameArea.appendChild(target);
}


/* =========================================
   SPEED CLICKER
========================================= */

function startClicker() {

  const clickButton =
    document.createElement("button");

  clickButton.className =
    "primary-btn";

  clickButton.style.fontSize =
    "25px";

  clickButton.style.padding =
    "25px 50px";

  clickButton.textContent =
    "CLICK!";

  clickButton.onclick = () => {

    clickCount++;

    score += 10;

    playSound();

    updateDisplay();
  };


  gameArea.appendChild(
    clickButton
  );


  startTimer();
}


/* =========================================
   GAME AREA MISS
========================================= */

gameArea.addEventListener(
  "click",
  event => {

    if (!gameRunning) {
      return;
    }

    if (
      currentGame === "aim" ||
      currentGame === "precision"
    ) {

      if (
        !event.target.classList.contains(
          "target"
        )
      ) {

        misses++;

        score =
          Math.max(
            0,
            score - 10
          );

        updateDisplay();
      }
    }
  }
);


/* =========================================
   END GAME
========================================= */

function endGame() {

  if (!gameRunning) {
    return;
  }

  gameRunning = false;

  clearInterval(timer);

  if (
    window.currentReactionTimeout
  ) {

    clearTimeout(
      window.currentReactionTimeout
    );
  }


  const target =
    document.querySelector(
      ".target"
    );

  if (target) {
    target.remove();
  }


  saveScore();

  message.style.display =
    "grid";

  message.innerHTML = `
    <h2>Game Over</h2>

    <p>
      Final Score:
      <strong>${score}</strong>
    </p>

    <button
      class="primary-btn"
      onclick="startGame()"
    >
      Play Again
    </button>
  `;

  updateDisplay();
}


/* =========================================
   FINISH REACTION
========================================= */

function finishCurrentGame(text) {

  gameRunning = false;

  clearInterval(timer);

  saveScore();

  message.style.display =
    "grid";

  message.innerHTML = `
    <h2>Great!</h2>

    <p>
      ${text}<br>
      Score:
      <strong>${score}</strong>
    </p>

    <button
      class="primary-btn"
      onclick="startGame()"
    >
      Play Again
    </button>
  `;

  updateDisplay();
}


/* =========================================
   DISPLAY
========================================= */

function updateDisplay() {

  scoreElement.textContent =
    score;

  timeElement.textContent =
    Math.ceil(timeLeft);
}


/* =========================================
   SOUND
========================================= */

function toggleSound() {

  soundEnabled =
    !soundEnabled;

  document.getElementById(
    "soundButton"
  ).textContent =
    soundEnabled
      ? "🔊 Sound On"
      : "🔇 Sound Off";
}


function playSound() {

  if (!soundEnabled) {
    return;
  }

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const context =
    new AudioContext();

  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.frequency.value =
    650;

  oscillator.type =
    "sine";

  gain.gain.setValueAtTime(
    .06,
    context.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    .001,
    context.currentTime + .08
  );

  oscillator.connect(gain);

  gain.connect(
    context.destination
  );

  oscillator.start();

  oscillator.stop(
    context.currentTime + .08
  );
}


/* =========================================
   LEADERBOARD
========================================= */

const defaultLeaderboard = [

  {
    player: "Sule",
    game: "Aim Trainer",
    score: 4820
  },

  {
    player: "Yasir",
    game: "Precision Shot",
    score: 4550
  },

  {
    player: "ValourGhost",
    game: "Reaction Test",
    score: 4310
  },

  {
    player: "Reaper",
    game: "Number Rush",
    score: 4080
  },

  {
    player: "Viper",
    game: "Aim Trainer",
    score: 3940
  },

  {
    player: "Nova",
    game: "Speed Clicker",
    score: 3760
  },

  {
    player: "Shadow",
    game: "Memory Challenge",
    score: 3510
  },

  {
    player: "Ace",
    game: "Aim Trainer",
    score: 3320
  }

];


function getLeaderboard() {

  const saved =
    localStorage.getItem(
      "valourLeaderboard"
    );

  if (!saved) {

    localStorage.setItem(
      "valourLeaderboard",
      JSON.stringify(
        defaultLeaderboard
      )
    );

    return [
      ...defaultLeaderboard
    ];
  }

  return JSON.parse(saved);
}


function saveScore() {

  const leaderboard =
    getLeaderboard();

  const username =
    localStorage.getItem(
      "valourUsername"
    ) || "Guest";


  leaderboard.push({

    player: username,

    game: games[currentGame].title,

    score: score

  });


  leaderboard.sort(
    (a, b) =>
      b.score - a.score
  );


  localStorage.setItem(
    "valourLeaderboard",

    JSON.stringify(
      leaderboard.slice(0, 100)
    )
  );


  renderLeaderboard();
}


function renderLeaderboard() {

  const leaderboard =
    getLeaderboard();

  const list =
    document.getElementById(
      "leaderboardList"
    );


  list.innerHTML = "";


  leaderboard
    .slice(0, 100)
    .forEach(
      (player, index) => {

        const row =
          document.createElement(
            "div"
          );

        row.className =
          "leader-row";


        let rank =
          index + 1;

        if (rank === 1) {
          rank = "👑";
        }

        else if (rank === 2) {
          rank = "🥈";
        }

        else if (rank === 3) {
          rank = "🥉";
        }


        row.innerHTML = `

          <span class="rank">
            ${rank}
          </span>

          <span class="player">
            ${escapeHTML(
              player.player
            )}
          </span>

          <span class="player-game">
            ${escapeHTML(
              player.game
            )}
          </span>

          <span class="player-score">
            ${player.score}
          </span>

        `;


        list.appendChild(row);

      }
    );
}


/* =========================================
   USERNAME
========================================= */

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================
   DEMO DISCORD USER
========================================= */

if (
  !localStorage.getItem(
    "valourUsername"
  )
) {

  localStorage.setItem(
    "valourUsername",
    "Guest"
  );
}


/* =========================================
   ONLINE COUNTER
========================================= */

function updateOnlineMembers() {

  const base = 45;

  const random =
    Math.floor(
      Math.random() * 7
    ) - 3;

  document.getElementById(
    "onlineMembers"
  ).textContent =
    base + random;
}


setInterval(
  updateOnlineMembers,
  30000
);


/* =========================================
   RESET DISPLAY
========================================= */

function resetDisplay() {

  clearInterval(timer);

  gameRunning = false;

  score = 0;

  timeLeft = 30;

  updateDisplay();

  gameArea.innerHTML = "";

  gameArea.appendChild(message);

  message.style.display =
    "grid";

  message.innerHTML = `

    <h2>Ready?</h2>

    <p>
      ${games[currentGame].description}
    </p>

    <button
      class="primary-btn"
      onclick="startGame()"
    >
      Start Game
    </button>

  `;
}


/* =========================================
   INITIALIZE
========================================= */

renderLeaderboard();

updateDisplay();

updateOnlineMembers();
