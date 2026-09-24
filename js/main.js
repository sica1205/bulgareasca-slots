import Loading      from './loading.js';
import AudioManager from './audio.js';
import Menu         from './menu.js';

function showGate() {
  const gate = document.getElementById('gateScreen');
  const play = document.getElementById('playNowBtn');

  if (!gate || !play) {
    Menu.showMenu();
    return;
  }

  gate.classList.remove('hidden');
  gate.classList.add('visible');

  play.addEventListener('click', () => {
    AudioManager.unlock();
    AudioManager.playSFX('button');

    gate.classList.add('hidden');
    gate.classList.remove('visible');

    Menu.showMenu();
  }, { once: true });
}

async function boot() {

  await Loading.run(3000);

  Menu.init();

  showGate();
}

boot();
