import AudioManager from './audio.js';
import Help         from './help.js';
import Scoreboard   from './scoreboard.js';
import { startGame } from './game.js';

const Menu = (() => {
  function show(id)  { document.getElementById(id)?.classList.remove('hidden'); document.getElementById(id)?.classList.add('visible'); }
  function hide(id)  { document.getElementById(id)?.classList.add('hidden');    document.getElementById(id)?.classList.remove('visible'); }

  function buildSettings() {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    const fxSlider    = document.getElementById('settingFxVol');
    const muSlider    = document.getElementById('settingMuVol');
    const trackSelect = document.getElementById('settingTrack');

    if (fxSlider) {
      fxSlider.value = AudioManager.fxVol;
      fxSlider.addEventListener('input', e => AudioManager.setFxVolume(parseFloat(e.target.value)));
    }
    if (muSlider) {
      muSlider.value = AudioManager.muVol;
      muSlider.addEventListener('input', e => AudioManager.setMusicVolume(parseFloat(e.target.value)));
    }
    if (trackSelect) {
      trackSelect.innerHTML = AudioManager.tracks
        .map((t, i) => `<option value="${i}">${t.label}</option>`)
        .join('');
      trackSelect.value = AudioManager.trackIdx;
      trackSelect.addEventListener('change', e => AudioManager.setTrack(parseInt(e.target.value, 10)));
    }

    document.getElementById('shuffleTrackBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      const idx = AudioManager.shuffleTrack();
      if (trackSelect) trackSelect.value = idx;
    });

    document.getElementById('clearScoresBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      if (confirm('Stergi Scorurile? Nu mai poti recupera nimic daca faci asta.')) {
        Scoreboard.clear();
        renderLeaderboard();
      }
    });

    document.getElementById('settingsCloseBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      hide('settingsPanel');
    });
  }

  function renderLeaderboard() {
    const ol = document.getElementById('menuLeaderboardList');
    if (!ol) return;
    const entries = Scoreboard.getAll();
    if (entries.length === 0) {
      ol.innerHTML = '<li class="lb-empty">Nu ai nici un scor aici. Joaca pentru a face unul!</li>';
      return;
    }
    ol.innerHTML = entries.map((e, i) => `
      <li class="lb-entry ${i === 0 ? 'lb-gold' : i === 1 ? 'lb-silver' : i === 2 ? 'lb-bronze' : ''}">
        <span class="lb-rank">#${i + 1}</span>
        <span class="lb-name">${e.name}</span>
        <span class="lb-score">${e.score.toLocaleString('de-DE')} LEI</span>
      </li>`).join('');
  }

  function init() {
    // START
    document.getElementById('menuStartBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      hide('menuScreen');
      startGame();
    });

    document.getElementById('menuScoresBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      renderLeaderboard();
      show('menuScoresModal');
    });

    document.getElementById('menuScoresClose')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      hide('menuScoresModal');
    });

    document.getElementById('menuHelpBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      hide('menuScreen');
      Help.show();
    });

    document.getElementById('menuSettingsBtn')?.addEventListener('click', () => {
      AudioManager.playSFX('button');
      buildSettings();
      show('settingsPanel');
    });

    renderLeaderboard();
  }

  function showMenu() {
    renderLeaderboard();
    show('menuScreen');
  }

  return { init, showMenu };
})();

export default Menu;
