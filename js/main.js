import Loading      from './loading.js';
import AudioManager from './audio.js';
import Menu         from './menu.js';

async function boot() {

  await Loading.run(3000);

  AudioManager.startMusic();

  Menu.init();

  Menu.showMenu();
}

boot();
