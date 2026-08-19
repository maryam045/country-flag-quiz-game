// Country flags API

const API_URL =
  "https://api.restcountries.com/countries/v5?response_fields=names.common,codes.alpha_2&limit=100";
const API_KEY = "rc_live_757c1708e3134e6c941763f7810143f2";

const TOTAL_QUESTIONS = 10;
const TIME_LIMIT = 30;

// Local storage

function getHighScore() {
  const score = localStorage.getItem("flagQuizHighScore");
  return Number(score) || 0;
}

function setHighScore(score) {
  const oldScore = getHighScore();

  if (score > oldScore) {
    localStorage.setItem("flagQuizHighScore", score);
  }
}

function getLeaderboard() {
  const saved = localStorage.getItem("flagQuizLeaderboard");

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
}

function addToLeaderboard(name, score) {
  const board = getLeaderboard();

  board.push({ name, score });
  board.sort((a, b) => b.score - a.score);

  localStorage.setItem(
    "flagQuizLeaderboard",
    JSON.stringify(board.slice(0, 10))
  );
}

function getPlayerName() {
  return localStorage.getItem("flagQuizPlayerName") || "Player";
}

// Get countries

async function fetchCountries() {
  const cached = sessionStorage.getItem("flagQuizCountries");

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error("Could not get the countries");
    }

    const response = await res.json();

    const countries = response.data.objects
      .filter((c) => c.codes?.alpha_2 && c.names?.common)
      .map((c) => ({
        name: c.names.common,
        flag: `https://flagcdn.com/w320/${c.codes.alpha_2.toLowerCase()}.png`,
      }));

    if (countries.length < 4) {
      throw new Error("Not enough country data returned");
    }

    sessionStorage.setItem(
      "flagQuizCountries",
      JSON.stringify(countries)
    );

    return countries;
  } catch (err) {
    console.error("Country API fetch failed:", err);
    throw err;
  }
}

function shuffle(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function buildQuiz(countries, count) {
  const chosen = shuffle(countries).slice(0, count);

  return chosen.map((correct) => {
    const distractors = shuffle(
      countries.filter((c) => c.name !== correct.name)
    ).slice(0, 3);

    const options = shuffle([correct, ...distractors]).map(
      (o) => o.name
    );

    return {
      flag: correct.flag,
      answer: correct.name,
      options,
    };
  });
}

// Page setup

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "home") initHome();
  if (document.body.dataset.page === "quiz") initQuiz();
  if (document.body.dataset.page === "result") initResult();
  if (document.body.dataset.page === "leaderboard") initLeaderboard();
});

// Home page

function initHome() {
  const highScoreEl = document.getElementById("high-score");

  if (highScoreEl) {
    highScoreEl.textContent = getHighScore();
  }

  const startBtn = document.getElementById("start-btn");

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      let name = "";

      while (!name) {
        const input = window.prompt("Enter your name to start the quiz:");

        if (input === null) return;

        name = input.trim();

        if (!name) {
          window.alert("A name is required to play.");
        }
      }

      localStorage.setItem("flagQuizPlayerName", name);
      window.location.href = "quiz.html";
    });
  }
}

// Quiz page

async function initQuiz() {
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const flagImg = document.getElementById("quiz-flag");
  const statusEl = document.getElementById("quiz-status");
  const answerBtns = Array.from(
    document.querySelectorAll(".answer-btn")
  );
  const hintBtn = document.getElementById("hint-btn");
  const nextBtn = document.getElementById("next-btn");

  let score = 0;
  let currentIndex = 0;
  let timeLeft = TIME_LIMIT;
  let timerId = null;
  let answered = false;
  let quiz = [];

  toggleAnswerButtons(true);
  nextBtn.disabled = true;
  hintBtn.disabled = true;

  if (statusEl) {
    statusEl.textContent = "Loading flags…";
  }

  try {
    const countries = await fetchCountries();

    quiz = buildQuiz(countries, TOTAL_QUESTIONS);

    if (statusEl) {
      statusEl.textContent = "";
    }

    loadQuestion();
  } catch (err) {
    console.error(err);

    if (statusEl) {
      statusEl.textContent =
        "Couldn't load flags from the API. Check your connection and refresh.";
    }
  }

  function loadQuestion() {
    answered = false;

    const q = quiz[currentIndex];

    flagImg.src = q.flag;
    flagImg.alt = "Flag to identify";

    answerBtns.forEach((btn, i) => {
      btn.textContent = q.options[i];
      btn.classList.remove("correct", "wrong");
    });

    toggleAnswerButtons(false);

    nextBtn.disabled = true;
    hintBtn.disabled = false;

    if (statusEl) {
      statusEl.textContent =
        `Question ${currentIndex + 1} of ${quiz.length}`;
    }

    resetTimer();
  }

  function toggleAnswerButtons(disabled) {
    answerBtns.forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  function resetTimer() {
    clearInterval(timerId);

    timeLeft = TIME_LIMIT;
    timerEl.textContent = `${timeLeft}s`;
    timerEl.classList.remove("timer-warning");

    timerId = setInterval(() => {
      timeLeft--;

      timerEl.textContent = `${timeLeft}s`;

      if (timeLeft <= 10 && timeLeft > 0) {
        timerEl.classList.add("timer-warning");
      }
    
      if (timeLeft <= 0) {
        clearInterval(timerId);
        lockAnswer(null);
      }
    }, 1000);
  }


  answerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;

      lockAnswer(btn);
    });
  });

  function lockAnswer(selectedBtn) {
    answered = true;

    clearInterval(timerId);

    const q = quiz[currentIndex];

    answerBtns.forEach((btn) => {
      btn.disabled = true;

      if (btn.textContent === q.answer) {
        btn.classList.add("correct");
      }
    });

    if (selectedBtn && selectedBtn.textContent === q.answer) {
      score++;
      scoreEl.textContent = score;
    } else if (selectedBtn) {
      selectedBtn.classList.add("wrong");
    }

    hintBtn.disabled = true;
    nextBtn.disabled = false;
  }

  
  nextBtn.addEventListener("click", () => {
    currentIndex++;

    if (currentIndex >= quiz.length) {
      finishQuiz();
    } else {
      loadQuestion();
    }
  });

  function finishQuiz() {
    clearInterval(timerId);

    setHighScore(score);
    addToLeaderboard(getPlayerName(), score);

    localStorage.setItem("flagQuizLastScore", String(score));
    localStorage.setItem("flagQuizLastTotal", String(quiz.length));

    window.location.href = "result.html";
  }
}

// Result page

function initResult() {
  const score =
    Number(localStorage.getItem("flagQuizLastScore")) || 0;

  const total =
    Number(localStorage.getItem("flagQuizLastTotal")) ||
    TOTAL_QUESTIONS;

  const scoreEl = document.getElementById("result-score");
  const totalEl = document.getElementById("result-total");
  const highScoreEl = document.getElementById("result-high-score");

  if (scoreEl) {
    scoreEl.textContent = score;
  }

  if (totalEl) {
    totalEl.textContent = total;
  }

  if (highScoreEl) {
    highScoreEl.textContent = getHighScore();
  }

  const playAgainBtn = document.getElementById("play-again-btn");

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      window.location.href = "quiz.html";
    });
  }

  const homeBtn = document.getElementById("result-home-btn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

// Leaderboard

function initLeaderboard() {
  const board = getLeaderboard();
  const tbody = document.getElementById("leaderboard-body");

  if (tbody) {
    tbody.innerHTML = "";

    if (board.length === 0) {
      const row = document.createElement("tr");

      row.innerHTML =
        `<td colspan="3">No scores yet — play a game!</td>`;

      tbody.appendChild(row);
    } else {
      board.forEach((entry, i) => {
        const row = document.createElement("tr");

        row.innerHTML =
          `<td>${i + 1}</td><td>${escapeHtml(entry.name)}</td><td>${entry.score}</td>`;

        tbody.appendChild(row);
      });
    }
  }

  const homeBtn = document.getElementById("leaderboard-home-btn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");

  div.textContent = str;

  return div.innerHTML;
}
