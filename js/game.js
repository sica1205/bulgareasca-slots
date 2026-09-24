import AudioManager from './audio.js';
import Scoreboard   from './scoreboard.js';

const SYMBOLS = ['cherry', 'lemon', 'watermelon', 'bell', 'star', 'seven', 'bonus'];

const NORMAL_IMGS = {
  cherry:     'resources/images/cherry.webp',
  lemon:      'resources/images/lemon.webp',
  watermelon: 'resources/images/watermelon.webp',
  bell:       'resources/images/bell.webp',
  star:       'resources/images/star.webp',
  seven:      'resources/images/seven.webp',
  bonus:      'resources/images/bonus.webp',
};

const PAYOUT_IMGS = {
  cherry:     'resources/images/toggle_cherry.webp',
  lemon:      'resources/images/toggle_lemon.webp',
  watermelon: 'resources/images/toggle_watermelon.webp',
  bell:       'resources/images/toggle_bell.webp',
  star:       'resources/images/toggle_star.webp',
  seven:      'resources/images/toggle_seven.webp',
  bonus:      'resources/images/toggle_bonus.webp',
};

const PAYOUTS = {
  cherry_3:     2,
  lemon_3:      5,
  watermelon_3: 7,
  bell_3:       10,
  star_3:       15,
  seven_3:      30,
  bonus_3:      4,
};

const BET_STEPS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

let budget       = 0;
let score        = 0;
let bet          = 1;
let isSpinning   = false;
let autoSpinOn   = false;
let bonusActive  = false;
let autoTimeout  = null;
let spinTimer    = null;
let payoutsMode  = false;
let symbolImgs   = NORMAL_IMGS;

const $ = id => document.getElementById(id);
let cells, result, budgetDisplay, scoreDisplay,
    spinBtn, autoBtn, minusBtn, plusBtn, betDisplay, leverBtn;

function fmt(n) { return n.toLocaleString('de-DE'); }

function randSym() { return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; }

function nextBet(cur) {
  for (const s of BET_STEPS) if (s > cur) return s;
  return cur * 2;
}
function prevBet(cur) {
  if (cur > BET_STEPS[BET_STEPS.length - 1]) return Math.max(1, Math.floor(cur / 2));
  for (let i = BET_STEPS.length - 1; i >= 0; i--) if (BET_STEPS[i] < cur) return BET_STEPS[i];
  return 1;
}

function updateBetDisplay()    { betDisplay.textContent = `Bet: ${fmt(bet)} LEI`; }
function updateBudgetDisplay() { budgetDisplay.textContent = fmt(budget); }
function updateScoreDisplay()  { scoreDisplay.textContent = fmt(score); }

function setButtons(disabled) {
  spinBtn.disabled  = disabled;
  minusBtn.disabled = disabled;
  plusBtn.disabled  = disabled;
  if (leverBtn) leverBtn.disabled = disabled;
}

function clearGrid() {
  cells.forEach(c => {
    c.innerHTML = `<img src="${NORMAL_IMGS.cherry}" alt="cherry" data-symbol="cherry" />`;
    c.classList.remove('win-glow');
  });
}

function showMsg(msg, win = false, duration = 4500) {
  result.textContent = msg;
  result.classList.toggle('win', win);
  clearTimeout(result._timer);
  result._timer = setTimeout(() => { result.textContent = ''; }, duration);
}


const LEU_IMAGES   = ['leu_1.webp', 'leu_2.webp', 'leu_3.webp', 'leu_4.webp', 'leu_5.webp'];
const HORSE_IMAGES = ['calu2.gif', 'calul_frate.gif'];

function launchConfetti(count = 40) {
  const container = $('moneyConfettiContainer');
  for (let i = 0; i < count; i++) {
    const ban = document.createElement('img');
    ban.className = 'moneyConfetti';
    ban.src       = `resources/images/${LEU_IMAGES[Math.floor(Math.random() * LEU_IMAGES.length)]}`;
    ban.alt       = '';
    ban.draggable = false;

    const angle  = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 500 + 350;
    ban.style.setProperty('--x', Math.cos(angle) * radius + 'px');
    ban.style.setProperty('--y', Math.sin(angle) * -radius + 'px');
    ban.style.animationDelay = `${Math.random() * 0.2}s`;
    ban.style.width = `${34 + Math.random() * 34}px`;
    container.appendChild(ban);
    setTimeout(() => ban.remove(), 4000);
  }
}

function runHorse(count = 16) {
  const container = $('horseRunContainer');
  for (let i = 0; i < count; i++) {
    const horse = document.createElement('img');
    horse.className = 'runningHorse';
    horse.src       = `resources/images/${HORSE_IMAGES[Math.floor(Math.random() * HORSE_IMAGES.length)]}`;
    horse.alt       = '';
    horse.draggable = false;

    horse.style.top = `${window.innerHeight - 150 + Math.random() * 90}px`;

    // gif-ul "frate" e aproape patrat, deci se dimensioneaza dupa latime
    if (horse.src.includes('calul_frate')) {
      horse.style.width  = `${110 + Math.random() * 70}px`;
      horse.style.height = 'auto';
    } else {
      horse.style.height = `${52 + Math.random() * 36}px`;
      horse.style.width  = 'auto';
    }

    horse.style.animationDuration = `${0.9 + Math.random() * 0.7}s`;
    horse.style.animationDelay    = `${Math.random() * 0.5}s`;
    container.appendChild(horse);
    horse.addEventListener('animationend', () => horse.remove());
  }
}

function calcWin(gridSyms) {
  let won = 0;
  const winCells = new Set();
  let bonusTriggered = false;

  function checkLine(syms, indices) {
    if (syms.every(s => s === syms[0])) {
      const key = syms[0] + '_3';
      if (PAYOUTS[key]) {
        won += bet * PAYOUTS[key];
        indices.forEach(i => winCells.add(i));
        if (syms[0] === 'bonus') bonusTriggered = true;
      }
    }
  }

  // rows
  for (let r = 0; r < 3; r++) checkLine(gridSyms.slice(r*3, r*3+3), [r*3, r*3+1, r*3+2]);
  // cols
  for (let c = 0; c < 3; c++) checkLine([gridSyms[c], gridSyms[c+3], gridSyms[c+6]], [c, c+3, c+6]);
  // diagonals
  checkLine([gridSyms[0], gridSyms[4], gridSyms[8]], [0,4,8]);
  checkLine([gridSyms[2], gridSyms[4], gridSyms[6]], [2,4,6]);

  return { won, winCells, bonusTriggered };
}

const BONUS_INTRO_MS = 2000;
let bonusTimer = null;

function startBonusGame() {
  bonusActive = true;
  setButtons(true);
  AudioManager.playSFX('horseReveal');

  const overlay = $('bonusOverlay');
  const intro   = overlay.querySelector('.bonus-intro');
  const boxes   = $('giftBoxes');
  const res     = $('bonusPrizeResult');
  const close   = $('bonusCloseBtn');

  clearTimeout(bonusTimer);

  overlay.classList.remove('picking');
  boxes.innerHTML = '';
  res.textContent = '';
  close.style.display = 'none';

  overlay.classList.remove('hidden');
  overlay.classList.add('visible');

  if (intro) {
    intro.style.animation = 'none';
    void intro.offsetWidth;
    intro.style.animation = '';
  }

  bonusTimer = setTimeout(() => {
    overlay.classList.add('picking');
    buildGiftBoxes(boxes, res, close);
  }, BONUS_INTRO_MS);
}

function buildGiftBoxes(boxes, res, close) {
  const prizes = ['big', 'medium', 'small', 'empty', 'empty'];
  for (let i = prizes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [prizes[i], prizes[j]] = [prizes[j], prizes[i]];
  }

  const labels = { big: '70× 🐴', medium: '30× 🐴', small: '5× 🐴', empty: '🌾' };

  prizes.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gift-box';
    btn.dataset.prize = p;
    btn.textContent = '🎁';

    btn.addEventListener('click', function onPick() {
      const mult  = p === 'big' ? 70 : p === 'medium' ? 30 : p === 'small' ? 5 : 0;
      const prize = bet * mult;

      document.querySelectorAll('.gift-box').forEach(b => {
        b.disabled = true;
        b.textContent = labels[b.dataset.prize];
        b.classList.add(b === btn ? 'gift-picked' : 'gift-miss');
      });

      if (prize > 0) {
        budget += prize; score += prize;
        updateBudgetDisplay(); updateScoreDisplay();
        res.textContent = `🎉 Esti zeu! Ai castigat ${fmt(prize)} LEI!`;
        AudioManager.playSFX('win');
        launchConfetti(30);
      } else {
        res.textContent = 'Pulica, mai incearca.';
        AudioManager.playSFX('uhoh');
      }

      close.style.display = 'inline-block';
    }, { once: true });

    boxes.appendChild(btn);
  });

  close.onclick = endBonusRound;
}

function endBonusRound() {
  const overlay = $('bonusOverlay');
  clearTimeout(bonusTimer);

  overlay.classList.add('hidden');
  overlay.classList.remove('visible');
  overlay.classList.remove('picking');

  bonusActive = false;
  isSpinning  = false;

  if (budget <= 0) {
    setButtons(true);
    autoSpinOn = false;
    promptSubmitScore();
    return;
  }

  if (autoSpinOn) { scheduleAutoSpin(); return; }

  setButtons(false);
  if (bet > budget) bet = budget;
  updateBetDisplay();
}

function finalizeSpin() {
  document.querySelector('.slot-machine')?.classList.remove('spinning');

  const gridSyms = Array.from(cells).map(c => c.querySelector('img').dataset.symbol);
  const { won, winCells, bonusTriggered } = calcWin(gridSyms);

  winCells.forEach(i => cells[i].classList.add('win-glow'));

  if (won > 0) {
    budget += won; score += won;
    updateBudgetDisplay(); updateScoreDisplay();
    showMsg(`Bineee maaa: +${fmt(won)} LEI! 🎉`, true);
    AudioManager.playSFX(won > bet * 20 ? 'bigWin' : 'win');
    launchConfetti(50);
    runHorse(30);
  } else {
    showMsg(`Vai de capul tau: -${fmt(bet)} LEI.`, false);
  }

  if (bonusTriggered) {
    AudioManager.playSFX('debug');
    startBonusGame();
    return;
  }

  isSpinning = false;

  if (budget <= 0) {
    setButtons(true);
    autoSpinOn = false;
    promptSubmitScore();
    return;
  }

  if (autoSpinOn) { scheduleAutoSpin(); return; }

  setButtons(false);
  if (bet > budget) bet = budget;
  updateBetDisplay();
}

function spin() {
  if (isSpinning || bonusActive) return;
  if (bet > budget) { showMsg('Sefule esti chiar saracie.'); return; }

  isSpinning = true;
  budget -= bet;
  updateBudgetDisplay();
  AudioManager.playSFX('button');
  setButtons(true);
  cells.forEach(c => c.classList.remove('win-glow'));
  result.textContent = '';
  document.querySelector('.slot-machine')?.classList.add('spinning');

  let count = 0;
  const total = 15;
  spinTimer = setInterval(() => {
    cells.forEach(c => {
      const sym = randSym();
      c.innerHTML = `<img src="${symbolImgs[sym]}" alt="${sym}" data-symbol="${sym}" />`;
    });
    if (++count >= total) {
      clearInterval(spinTimer);
      spinTimer = null;
      finalizeSpin();
    }
  }, 70);
}

function scheduleAutoSpin() {
  if (!autoSpinOn || bonusActive) return;
  autoTimeout = setTimeout(() => {
    if (budget < bet) {
      showMsg('Bugetul a iesit pe geam. Auto-spin oprit.');
      toggleAuto();
      return;
    }
    spin();
  }, 400);
}

function toggleAuto() {
  if (autoSpinOn) {
    autoSpinOn = false;
    clearTimeout(autoTimeout);
    autoBtn.textContent = 'Auto';
    spinBtn.disabled  = false;
    minusBtn.disabled = false;
    plusBtn.disabled  = false;
    if (leverBtn) leverBtn.disabled = false;
  } else {
    if (bet > budget) { showMsg('Pe bune ma sefule?'); return; }
    autoSpinOn = true;
    autoBtn.textContent = 'STOP';
    spinBtn.disabled  = true;
    minusBtn.disabled = true;
    plusBtn.disabled  = true;
    if (leverBtn) leverBtn.disabled = true;
    scheduleAutoSpin();
  }
}

function changeBet(dir) {
  if (autoSpinOn || isSpinning) return;
  if (dir > 0) {
    bet = Math.min(nextBet(bet), budget);
    AudioManager.playSFX('betUp');
  } else {
    bet = prevBet(bet);
    AudioManager.playSFX('betDown');
  }
  if (bet < 1) bet = 1;
  updateBetDisplay();
}

function promptSubmitScore() {
  if (score === 0) {
    showMsg('Ai pierdut tot. Zero. Nimic. Gata.', false, 8000);
  }

  const modal = $('submitModal');
  const input = $('submitNameInput');
  const err   = $('submitNameError');
  const ok    = $('submitConfirmBtn');
  const cancel = $('submitCancelBtn');

  input.value = '';
  err.textContent = '';
  modal.classList.remove('hidden');
  modal.classList.add('visible');

  ok.onclick = () => {
    const name = input.value.trim();
    if (!name) { err.textContent = 'Balegosule, pune un nume.'; return; }
    if (name.length > 20) { err.textContent = 'Max 20 caractere.'; return; }
    Scoreboard.submit(name, score);
    modal.classList.add('hidden');
    modal.classList.remove('visible');
    input.value = '';
  };

  cancel.onclick = () => {
    modal.classList.add('hidden');
    modal.classList.remove('visible');
  };
}

function initOptionsPanel() {
  $('inGameOptionsBtn')?.addEventListener('click', () => {
    AudioManager.playSFX('button');
    $('inGameOptions').classList.remove('hidden');
    $('inGameOptions').classList.add('visible');
  });

  $('inGameOptionsClose')?.addEventListener('click', () => {
    AudioManager.playSFX('button');
    $('inGameOptions').classList.add('hidden');
    $('inGameOptions').classList.remove('visible');
  });

  const fxSl = $('inGameFxSlider');
  const muSl = $('inGameMuSlider');
  if (fxSl) { fxSl.value = AudioManager.fxVol; fxSl.addEventListener('input', e => AudioManager.setFxVolume(parseFloat(e.target.value))); }
  if (muSl) { muSl.value = AudioManager.muVol; muSl.addEventListener('input', e => AudioManager.setMusicVolume(parseFloat(e.target.value))); }

  const sel = $('inGameTrackSelect');
  if (sel) {
    sel.innerHTML = AudioManager.tracks.map((t, i) => `<option value="${i}">${t.label}</option>`).join('');
    sel.value = AudioManager.trackIdx;
    sel.addEventListener('change', e => AudioManager.setTrack(parseInt(e.target.value, 10)));
  }

  $('inGamePayoutToggle')?.addEventListener('click', () => {
    payoutsMode = !payoutsMode;
    symbolImgs  = payoutsMode ? PAYOUT_IMGS : NORMAL_IMGS;
    $('inGamePayoutToggle').textContent = payoutsMode ? '✔ Payouts: PORNIT' : '✖ Payouts: OPRIT';
    cells.forEach(c => {
      const img = c.querySelector('img');
      if (img) img.src = symbolImgs[img.dataset.symbol];
    });
  });

}

function exitToMenu() {
  stopGameActivity();
  hideAllOverlays();

  $('gameScreen').classList.add('hidden');
  $('gameScreen').classList.remove('visible');

  // dynamic import avoids circular dep
  import('./menu.js').then(m => m.default.showMenu());
}

function stopGameActivity() {
  clearTimeout(autoTimeout);
  clearInterval(spinTimer);

  autoTimeout = null;
  spinTimer   = null;

  autoSpinOn  = false;
  isSpinning  = false;
  bonusActive = false;

  if (autoBtn) autoBtn.textContent = 'Auto';

  document.querySelector('.slot-machine')?.classList.remove('spinning');
}

function hideAllOverlays() {
  clearTimeout(bonusTimer);
  bonusTimer = null;

  const overlay = $('bonusOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('visible', 'picking');
  }

  const boxes = $('giftBoxes');
  if (boxes) boxes.innerHTML = '';

  const res = $('bonusPrizeResult');
  if (res) res.textContent = '';

  ['exitConfirmModal', 'submitModal', 'inGameOptions'].forEach(id => {
    const el = $(id);
    if (el) { el.classList.add('hidden'); el.classList.remove('visible'); }
  });
}

function initExitConfirm() {
  const modal = $('exitConfirmModal');
  if (!modal) return;

  let wasAuto = false;

  const closeModal = () => {
    modal.classList.add('hidden');
    modal.classList.remove('visible');
  };

  $('inGameMenuBtn')?.addEventListener('click', () => {
    AudioManager.playSFX('button');

    wasAuto = autoSpinOn;
    if (autoSpinOn) {
      autoSpinOn = false;
      clearTimeout(autoTimeout);
      autoTimeout = null;
    }

    modal.classList.remove('hidden');
    modal.classList.add('visible');
  });

  $('exitConfirmNo')?.addEventListener('click', () => {
    AudioManager.playSFX('button');
    closeModal();

    if (wasAuto) {
      wasAuto    = false;
      autoSpinOn = true;
      scheduleAutoSpin();
    }
  });

  $('exitConfirmYes')?.addEventListener('click', () => {
    AudioManager.playSFX('button');
    closeModal();
    exitToMenu();
  });
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const gameScreen = $('gameScreen');
    if (!gameScreen || gameScreen.classList.contains('hidden')) return;
    if (autoSpinOn || isSpinning || bonusActive) return;
    if (e.code === 'Space')       { e.preventDefault(); spin(); }
    if (e.code === 'ArrowLeft')   { e.preventDefault(); changeBet(-1); }
    if (e.code === 'ArrowRight')  { e.preventDefault(); changeBet(1); }
  });
}

function startGame() {
  // cache DOM
  cells         = document.querySelectorAll('.slot-cell');
  result        = $('result');
  budgetDisplay = $('budgetDisplay');
  scoreDisplay  = $('scoreDisplay');
  spinBtn       = $('spinBtn');
  autoBtn       = $('autoSpinBtn');
  minusBtn      = $('minusBetBtn');
  plusBtn       = $('plusBetBtn');
  betDisplay    = $('betDisplay');
  leverBtn      = $('spinLever');

  stopGameActivity();

  budget = 100; score = 0; bet = 1;
  isSpinning = false; autoSpinOn = false; bonusActive = false; payoutsMode = false;
  symbolImgs = NORMAL_IMGS;

  updateBudgetDisplay();
  updateScoreDisplay();
  updateBetDisplay();
  clearGrid();
  result.textContent = '';
  setButtons(false);
  hideAllOverlays();

  $('gameScreen').classList.remove('hidden');
  $('gameScreen').classList.add('visible');

  if (!startGame._wired) {
    startGame._wired = true;
    spinBtn.addEventListener('click', spin);
    autoBtn.addEventListener('click', toggleAuto);
    minusBtn.addEventListener('click', () => changeBet(-1));
    plusBtn.addEventListener('click', () => changeBet(1));

    leverBtn?.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      spin();
    });
    leverBtn?.addEventListener('click', spin);
    initOptionsPanel();
    initExitConfirm();
    setupKeyboard();
  }
}

export { startGame };
