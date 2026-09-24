const AudioManager = (() => {
    const tracks = [
    { label: 'Kuchek d-ăsta nebun',   file: 'kuchek2.ogg' },
    { label: 'Klarinet Kuchek',        file: 'klarinet.ogg' },
    { label: 'Bulgareasca Calu\' OG',  file: 'bulgareasca-calu.ogg' },
    { label: 'Alta bulgareasca',       file: 'alta-bulgareasca.ogg' },
  ];

  const sfx = {
    button:      new Audio('resources/audio/sounds/button.mp3'),
    betUp:       new Audio('resources/audio/sounds/bet-up.mp3'),
    betDown:     new Audio('resources/audio/sounds/bet-down.mp3'),
    win:         new Audio('resources/audio/sounds/win_cal2.mp3'),
    bigWin:      new Audio('resources/audio/sounds/win_cal.mp3'),
    horseReveal: new Audio('resources/audio/sounds/horse-reveal.mp3'),
    uhoh:        new Audio('resources/audio/sounds/uhoh.mp3'),
    debug:       new Audio('resources/audio/sounds/debug.mp3'),
  };

  const music = new Audio();
  music.loop = true;

  let fxVol   = parseFloat(localStorage.getItem('fxVolume')   ?? '0.35');
  let muVol   = parseFloat(localStorage.getItem('musicVolume') ?? '0.10');
  let trackIdx = parseInt(localStorage.getItem('musicTrack')  ?? '0', 10);
  let musicStarted = false;

  function applyVolumes() {
    music.volume = muVol;
    Object.values(sfx).forEach(a => { a.volume = fxVol; });
  }

  function loadTrack(idx) {
    trackIdx = ((idx % tracks.length) + tracks.length) % tracks.length;
    music.src = `resources/audio/music/${tracks[trackIdx].file}`;
    localStorage.setItem('musicTrack', trackIdx);
  }

  function startMusic() {
    if (musicStarted) return;
    loadTrack(trackIdx);
    music.volume = muVol;
    music.play()
      .then(() => { musicStarted = true; })
      .catch(() => {
        document.addEventListener('pointerdown', startMusic, { once: true });
        document.addEventListener('keydown',     startMusic, { once: true });
      });
  }

  function unlock() {
    Object.values(sfx).forEach(a => {
      a.muted = true;
      a.play().catch(() => {});
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    });

    startMusic();
  }

  function playSFX(name) {
    const a = sfx[name];
    if (!a) return;
    a.currentTime = 0;
    a.volume = fxVol;
    a.play().catch(() => {});
  }

  function setFxVolume(v) {
    fxVol = v;
    Object.values(sfx).forEach(a => { a.volume = fxVol; });
    localStorage.setItem('fxVolume', fxVol);
  }

  function setMusicVolume(v) {
    muVol = v;
    music.volume = muVol;
    localStorage.setItem('musicVolume', muVol);
  }

  function setTrack(idx) {
    loadTrack(idx);
    if (musicStarted) music.play().catch(() => {});
  }

  function shuffleTrack() {
    let next = trackIdx;
    if (tracks.length > 1) {
      while (next === trackIdx) next = Math.floor(Math.random() * tracks.length);
    }
    setTrack(next);
    return next;
  }

  function stopMusic() {
    music.pause();
    musicStarted = false;
  }

  function resumeMusic() {
    if (!musicStarted) startMusic();
    else music.play().catch(() => {});
  }

  applyVolumes();

  return {
    tracks,
    get fxVol()     { return fxVol; },
    get muVol()     { return muVol; },
    get trackIdx()  { return trackIdx; },
    startMusic,
    stopMusic,
    resumeMusic,
    unlock,
    playSFX,
    setFxVolume,
    setMusicVolume,
    setTrack,
    shuffleTrack,
  };
})();

export default AudioManager;
