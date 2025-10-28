// ELEMENTOS
const startBtn = document.getElementById('startBtn');
const categoriesEl = document.getElementById('categories');
const catButtons = document.querySelectorAll('.cat');
const timePerQ = document.getElementById('timePerQ');
const menu = document.getElementById('menu');
const game = document.getElementById('game');
const end = document.getElementById('end');
const scoresCard = document.getElementById('scoresCard');

const catLabel = document.getElementById('catLabel');
const qIndex = document.getElementById('qIndex');
const qTotal = document.getElementById('qTotal');
const timerEl = document.getElementById('timer');
const questionText = document.getElementById('questionText');
const answersEl = document.getElementById('answers');
const scoreEl = document.getElementById('score');
const nextBtn = document.getElementById('nextBtn');
const quitBtn = document.getElementById('quitBtn');

const finalScore = document.getElementById('finalScore');
const playerName = document.getElementById('playerName');
const saveScore = document.getElementById('saveScore');
const playAgain = document.getElementById('playAgain');
const backMenu = document.getElementById('backMenu');

const viewScores = document.getElementById('viewScores');
const scoresList = document.getElementById('topList');
const closeTop = document.getElementById('closeTop');
const clearTop = document.getElementById('clearTop');

const STORAGE_KEY = 'quiz_expo_top_scores_v1';

// BANCO DE PREGUNTAS (puedes editar/añadir)
const QUESTION_BANK = {
  deportes: [
    {q: "¿En qué deporte se usa un aro y una pelota grande?", a:["Baloncesto","Fútbol","Tenis","Vóley"], correct:0},
    {q: "¿Cuántos jugadores tiene un equipo de fútbol en cancha (por equipo)?", a:["9","10","11","12"], correct:2},
    {q: "¿Qué país ganó la Copa Mundial de Fútbol en 2018?", a:["Alemania","Francia","Brasil","Argentina"], correct:1},
    {q: "¿Cuál es la distancia de una maratón oficial en km?", a:["42.195 km","40 km","26.2 km","50 km"], correct:0}
  ],
  tecnologia: [
    {q:"¿Qué significa HTML?", a:["HyperText Markup Language","HighText Markup Language","Hyperlink Text Mark Language","Hyper Tool Markup Lang"], correct:0},
    {q:"¿Cuál es un sistema operativo de código abierto muy popular?", a:["Windows","macOS","Linux","iOS"], correct:2},
    {q:"¿Qué compañía creó el lenguaje Java?", a:["Microsoft","Sun Microsystems","Google","Apple"], correct:1},
    {q:"¿Qué es Git?", a:["Un framework","Un sistema de control de versiones","Un lenguaje de programación","Un IDE"], correct:1}
  ],
  historia: [
    {q:"¿En qué año comenzó la Segunda Guerra Mundial?", a:["1939","1914","1945","1929"], correct:0},
    {q:"¿Quién fue el primer emperador romano?", a:["Nerón","Augusto","Julio César","Trajano"], correct:1},
    {q:"¿Qué civilización construyó Machu Picchu?", a:["Azteca","Maya","Inca","Olmeca"], correct:2},
    {q:"¿En qué año llegó Cristóbal Colón a América?", a:["1492","1500","1485","1519"], correct:0}
  ],
  general: [
    {q:"¿Cuál es el planeta más cercano al Sol?", a:["Venus","Mercurio","Marte","Tierra"], correct:1},
    {q:"¿Qué idioma se habla en Brasil principalmente?", a:["Español","Portugués","Inglés","Francés"], correct:1},
    {q:"¿Cuál es la capital de Japón?", a:["Seúl","Beijing","Tokio","Bangkok"], correct:2},
    {q:"¿Qué instrumento tiene teclas y cuerdas?", a:["Flauta","Guitarra","Piano","Batería"], correct:2}
  ]
};

// ESTADO
let selectedCat = 'deportes';
let questions = [];
let currentIndex = 0;
let score = 0;
let timeRemaining = 15;
let timerId = null;
let canAnswer = true;

// FUNCIONES
function setActiveCategory(catBtn) {
  catButtons.forEach(b => b.classList.remove('active'));
  catBtn.classList.add('active');
  selectedCat = catBtn.dataset.cat;
}

categoriesEl.addEventListener('click', (e) => {
  if (e.target.classList.contains('cat')) setActiveCategory(e.target);
});

startBtn.addEventListener('click', startGame);
viewScores.addEventListener('click', showTop);

function startGame() {
  // preparar preguntas (aleatorias)
  const bank = QUESTION_BANK[selectedCat] || [];
  questions = shuffleArray(bank).slice(); // copia mezclada
  currentIndex = 0;
  score = 0;
  scoreEl.textContent = score;
  menu.hidden = true;
  game.hidden = false;
  catLabel.textContent = capitalize(selectedCat);
  qTotal.textContent = questions.length;
  nextQuestion();
}

function nextQuestion() {
  clearInterval(timerId);
  canAnswer = true;
  if (currentIndex >= questions.length) return endGame();
  const q = questions[currentIndex];
  qIndex.textContent = currentIndex + 1;
  questionText.textContent = q.q;
  answersEl.innerHTML = '';
  q.a.forEach((ans, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = ans;
    btn.dataset.idx = i;
    btn.addEventListener('click', () => selectAnswer(i));
    answersEl.appendChild(btn);
  });

  // temporizador
  timeRemaining = parseInt(timePerQ.value, 10);
  timerEl.textContent = timeRemaining;
  timerId = setInterval(() => {
    timeRemaining--;
    timerEl.textContent = timeRemaining;
    if (timeRemaining <= 0) {
      clearInterval(timerId);
      timeoutAnswer();
    }
  }, 1000);
}

function selectAnswer(index) {
  if (!canAnswer) return;
  canAnswer = false;
  clearInterval(timerId);
  const q = questions[currentIndex];
  const buttons = answersEl.querySelectorAll('.answer-btn');
  buttons.forEach(b => b.disabled = true);
  // marcar
  if (index === q.correct) {
    buttons[index].classList.add('correct');
    const gained = 10 + Math.max(0, Math.floor(timeRemaining)); // más puntos por rapidez
    score += gained;
    scoreEl.textContent = score;
  } else {
    buttons[index].classList.add('wrong');
    buttons[q.correct].classList.add('correct');
  }
  currentIndex++;
  // auto avanzar tras 1.2s
  setTimeout(() => {
    if (currentIndex < questions.length) nextQuestion();
    else endGame();
  }, 1200);
}

function timeoutAnswer() {
  canAnswer = false;
  const q = questions[currentIndex];
  const buttons = answersEl.querySelectorAll('.answer-btn');
  buttons.forEach(b => b.disabled = true);
  buttons[q.correct].classList.add('correct');
  currentIndex++;
  setTimeout(() => {
    if (currentIndex < questions.length) nextQuestion();
    else endGame();
  }, 1200);
}

function endGame() {
  clearInterval(timerId);
  game.hidden = true;
  end.hidden = false;
  finalScore.textContent = score;
}

// BOTONES
nextBtn.addEventListener('click', () => {
  // opción manual (si la quieres)
  if (currentIndex < questions.length) {
    clearInterval(timerId);
    nextQuestion();
  } else endGame();
});
quitBtn.addEventListener('click', () => {
  if (confirm('Abandonar el quiz y volver al menú?')) {
    resetToMenu();
  }
});
playAgain.addEventListener('click', () => {
  end.hidden = true;
  startGame();
});
backMenu.addEventListener('click', () => {
  resetToMenu();
});

// RANKING (localStorage)
saveScore.addEventListener('click', () => {
  const name = playerName.value.trim() || 'Anon';
  const top = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  top.push({ name, score, category: selectedCat, date: new Date().toISOString() });
  // ordenar por score descendente
  top.sort((a,b)=> b.score - a.score);
  const top5 = top.slice(0,5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
  alert('Guardado en Top 5!');
  playerName.value = '';
});

function showTop() {
  menu.hidden = true;
  scoresCard.hidden = false;
  renderTop();
}
closeTop.addEventListener('click', () => {
  scoresCard.hidden = true;
  menu.hidden = false;
});
clearTop.addEventListener('click', () => {
  if (confirm('Borrar todos los puntajes guardados?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderTop();
  }
});

function renderTop() {
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  scoresList.innerHTML = '';
  if (!arr.length) {
    scoresList.innerHTML = '<li class="muted">No hay puntajes guardados.</li>';
    return;
  }
  arr.forEach((s,i) => {
    const li = document.createElement('li');
    li.innerHTML = `<div>#${i+1} ${escapeHtml(s.name)} — <small class="muted">${capitalize(s.category)}</small></div><div><strong>${s.score}</strong></div>`;
    scoresList.appendChild(li);
  });
}

// UTILIDADES
function shuffleArray(a){ return a.slice().sort(()=>Math.random()-0.5); }
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
function escapeHtml(t){ return t.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function resetToMenu(){ clearInterval(timerId); game.hidden=true; end.hidden=true; scoresCard.hidden=true; menu.hidden=false; }

// TECLA para accesibilidad
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // volver al menú rápido
    if (!menu.hidden) return;
    if (!game.hidden) resetToMenu();
    if (!end.hidden) resetToMenu();
    if (!scoresCard.hidden) resetToMenu();
  }
});
