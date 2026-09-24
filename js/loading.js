const Loading = (() => {
  const images = [
    'resources/images/cherry.webp',
    'resources/images/lemon.webp',
    'resources/images/watermelon.webp',
    'resources/images/bell.webp',
    'resources/images/star.webp',
    'resources/images/seven.webp',
    'resources/images/bonus.webp',
    'resources/images/border.webp',
    'resources/images/85247.webp',
    'resources/images/toggle_cherry.webp',
    'resources/images/toggle_lemon.webp',
    'resources/images/toggle_watermelon.webp',
    'resources/images/toggle_bell.webp',
    'resources/images/toggle_star.webp',
    'resources/images/toggle_seven.webp',
    'resources/images/toggle_bonus.webp',
  ];

  const FILES = [
    'index.html',
    'css/style.css',
    'css/fonts.css',
    'js/main.js',
    'js/loading.js',
    'js/menu.js',
    'js/scoreboard.js',
    'js/help.js',
    'js/audio.js',
    'js/game.js',
    'resources/images/cherry.webp',
    'resources/images/lemon.webp',
    'resources/images/watermelon.webp',
    'resources/images/bell.webp',
    'resources/images/star.webp',
    'resources/images/seven.webp',
    'resources/images/bonus.webp',
    'resources/images/calu2.gif',
    'resources/images/calul_frate.gif',
    'resources/images/horse-alert.gif',
    'resources/images/leu_1.webp',
    'resources/images/leu_2.webp',
    'resources/images/leu_3.webp',
    'resources/images/leu_4.webp',
    'resources/images/leu_5.webp',
    'resources/images/85247.webp',
    'resources/images/border.webp',
    'resources/audio/horse-reveal.mp3',
    'resources/audio/win-chime.mp3',
    'resources/audio/spin-start.mp3',
  ];

  function preloadImages() {
    return Promise.all(
      images.map(src => new Promise(res => {
        const img = new Image();
        img.onload = img.onerror = res;
        img.src = src;
      }))
    );
  }

  function run(minMs = 8000) {
    return new Promise(resolve => {
      const screen  = document.getElementById('loadingScreen');
      const bar     = document.getElementById('loadingBar');
      const tip     = document.getElementById('loadingTip');

      const perFile = FILES.length > 0 ? minMs / FILES.length : 600;

      let idx = 0;
      tip.textContent = `Se incarca fisierul: ${FILES[idx]}`;
      const tipTimer = setInterval(() => {
        idx = (idx + 1) % FILES.length;
        tip.textContent = `Se incarca fisierul: ${FILES[idx]}`;
      }, perFile);

      let progress = 0;
      const barTimer = setInterval(() => {
        progress = Math.min(progress + Math.random() * 12, 90);
        bar.style.width = progress + '%';
      }, 120);

      const start = Date.now();

      preloadImages().then(() => {
        clearInterval(barTimer);
        bar.style.width = '100%';

        const elapsed = Date.now() - start;
        const wait    = Math.max(0, minMs - elapsed);

        setTimeout(() => {
          clearInterval(tipTimer);
          tip.textContent = 'Jocul este Incarcat!.';
          screen.classList.add('fade-out');

          let finished = false;
          const finishLoading = () => {
            if (finished) return;
            finished = true;
            screen.style.display = 'none';
            resolve();
          };

          screen.addEventListener('transitionend', event => {
            if (event.target === screen) finishLoading();
          });
          setTimeout(finishLoading, 800);
        }, wait);
      });
    });
  }

  return { run };
})();

export default Loading;
