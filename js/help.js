import AudioManager from './audio.js';

const Help = (() => {
  function buildContent() {
    const screen = document.getElementById('helpScreen');
    screen.innerHTML = `
      <div class="help-box">
        <header class="help-head">
          <h2>🐎 Cum se joaca</h2>
          <p class="help-tagline">Cartea casei · bani imaginari, emotii reale</p>
        </header>

                                        <div class="help-grid">
          <section class="help-section help-about">
            <h3>Despre joc</h3>
            <p>Bine ai venit la <strong>Bulgăreasca Calu'</strong> — un joc de tip slots în care fructele normale pe care le vezi la aparatele ălea <em>beșite unde tot fuți palme</em> să-ți pice lămâi sau ceva de genu' au fost înlocuite cu cai și muzică bulgărească.</p>
            <p class="help-qa">De ce cai?<br>De ce muzică bulgărească?</p>
            <p>Nu știu. Totul a pornit de la un inside joke și, cumva, s-a ajuns la abominația asta.</p>
            <p>În rest, e o păcănea ca oricare alta: bagi bani (sau, mă rog, ți-i bagă jocu' direct), dai spin și vezi ce iese. Doar că aici, în loc să te uiți la cireșe și pepeni, te uiți la cai năzdrăvani.</p>
            <p class="help-tagline">Cam atât.<br><span class="help-signature">Bulgăreasca Calu'. Sănătate numai bile!</span></p>
          </section>

          <section class="help-section">
            <h3>Obiectiv</h3>
            <p>Incepi cu <strong>1000 LEI</strong>. Dai spin, faci combinatii pe randuri, coloane sau diagonale si strangi cat mai multi bani pana te duci pe apa sambetei.</p>
          </section>

          <section class="help-section">
            <h3>Controale</h3>
            <ul>
              <li><kbd>SPACE</kbd> — Spin</li>
              <li><kbd>←</kbd> / <kbd>→</kbd> — Modifica pariul</li>
            </ul>
          </section>

          <section class="help-section">
            <h3>Bonus Game 🎁</h3>
            <p>Daca nimeresti 3 <strong>BONUS</strong> pe o linie, se deschide un mini-joc cu casute. Alegi una si poti castiga <strong>5×, 30× sau 70×</strong> pariul. Sau nimic. Asa e viata.</p>
          </section>
        </div>

        <footer class="help-foot">
          <button id="helpCloseBtn" class="menu-btn">↩ Inapoi</button>
        </footer>
      </div>
    `;

    document.getElementById('helpCloseBtn').addEventListener('click', () => {
      AudioManager.playSFX('button');
      hide();
    });
  }

  function show() {
    const screen = document.getElementById('helpScreen');
    buildContent();
    screen.classList.remove('hidden');
    screen.classList.add('visible');
  }

  function hide() {
    const screen = document.getElementById('helpScreen');
    screen.classList.remove('visible');
    screen.classList.add('hidden');
    document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('menuScreen').classList.add('visible');
  }

  return { show, hide };
})();

export default Help;
