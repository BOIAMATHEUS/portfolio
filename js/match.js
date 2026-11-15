/* Mini Renova Match: combina 3 com as peças reais do jogo. window.MiniMatch(el, { aoCombinar }) */
(function () {
  const N = 6;
  const PECAS = ['peca-colageno', 'peca-hialuronico', 'peca-vitamina-c', 'peca-vitamina-e', 'peca-zinco', 'peca-biotina'];
  const esp = (ms) => new Promise((r) => setTimeout(r, ms));

  window.MiniMatch = function (tab, opc = {}) {
    const raiz = opc.raiz || 'assets/renova/';
    let g = [], sel = null, travado = false, arr = null, parado = 0, dica = null;
    const tipo = () => Math.floor(Math.random() * PECAS.length);

    function nova(t, l, c, deCima) {
      const el = document.createElement('div'); el.className = 'peca';
      const im = document.createElement('img'); im.src = raiz + PECAS[t] + '.webp'; im.alt = ''; im.draggable = false; el.appendChild(im);
      const p = { t, l, c, el }; el.p = p;
      tab.appendChild(el);
      if (deCima != null) { el.style.transition = 'none'; el.style.transform = `translate(${c * 100}%, ${-(deCima + 1) * 100}%)`; el.getBoundingClientRect(); el.style.transition = ''; }
      poe(p); return p;
    }
    const poe = (p) => { p.el.style.transform = `translate(${p.c * 100}%, ${p.l * 100}%)`; };

    function monta() {
      tab.querySelectorAll('.peca').forEach((e) => e.remove()); g = [];
      for (let l = 0; l < N; l++) { g[l] = []; for (let c = 0; c < N; c++) {
        let t; do { t = tipo(); } while ((c > 1 && g[l][c - 1].t === t && g[l][c - 2].t === t) || (l > 1 && g[l - 1][c].t === t && g[l - 2][c].t === t));
        g[l][c] = { t };
      } }
      for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) g[l][c] = nova(g[l][c].t, l, c);
      if (!temJogada()) monta();
    }

    function grupos() {
      const fora = new Set();
      for (let l = 0; l < N; l++) for (let c = 0; c < N - 2; c++) { const t = g[l][c].t; if (t === g[l][c + 1].t && t === g[l][c + 2].t) { let k = c; while (k < N && g[l][k].t === t) fora.add(g[l][k++]); } }
      for (let c = 0; c < N; c++) for (let l = 0; l < N - 2; l++) { const t = g[l][c].t; if (t === g[l + 1][c].t && t === g[l + 2][c].t) { let k = l; while (k < N && g[k][c].t === t) fora.add(g[k++][c]); } }
      return [...fora];
    }
    function troca(a, b) { g[a.l][a.c] = b; g[b.l][b.c] = a; [a.l, b.l] = [b.l, a.l]; [a.c, b.c] = [b.c, a.c]; }
    function jogadas() {
      const r = [];
      for (let l = 0; l < N; l++) for (let c = 0; c < N; c++) for (const [dl, dc] of [[0, 1], [1, 0]]) {
        const l2 = l + dl, c2 = c + dc; if (l2 >= N || c2 >= N) continue;
        const a = g[l][c], b = g[l2][c2]; troca(a, b); const ok = grupos().length > 0; troca(a, b); if (ok) r.push([a, b]);
      }
      return r;
    }
    const temJogada = () => jogadas().length > 0;

    async function resolve() {
      let combo = 0;
      for (;;) {
        const fora = grupos(); if (!fora.length) break;
        combo++;
        fora.forEach((p) => p.el.classList.add('some'));
        if (opc.aoCombinar) opc.aoCombinar(fora.length, combo, fora.map((p) => p.el));
        await esp(210);
        fora.forEach((p) => { p.el.remove(); g[p.l][p.c] = null; });
        for (let c = 0; c < N; c++) {
          let livre = N - 1;
          for (let l = N - 1; l >= 0; l--) if (g[l][c]) { const p = g[l][c]; if (l !== livre) { g[livre][c] = p; g[l][c] = null; p.l = livre; poe(p); } livre--; }
          for (let l = livre, k = 0; l >= 0; l--, k++) g[l][c] = nova(tipo(), l, c, k);
        }
        await esp(300);
      }
      if (!temJogada()) { await esp(300); monta(); }
    }

    async function tenta(a, b) {
      if (travado || !a || !b || a === b) return;
      if (Math.abs(a.l - b.l) + Math.abs(a.c - b.c) !== 1) return;
      travado = true; parado = 0; tiraDica();
      troca(a, b); poe(a); poe(b); await esp(240);
      if (grupos().length) await resolve();
      else { troca(a, b); poe(a); poe(b); await esp(240); }
      travado = false;
    }

    function escolhe(p) {
      if (travado) return;
      if (sel && sel !== p && Math.abs(sel.l - p.l) + Math.abs(sel.c - p.c) === 1) { const a = sel; a.el.classList.remove('sel'); sel = null; tenta(a, p); return; }
      if (sel) sel.el.classList.remove('sel');
      sel = sel === p ? null : p; if (sel) sel.el.classList.add('sel');
    }

    tab.addEventListener('pointerdown', (e) => { const el = e.target.closest('.peca'); if (!el) return; if (opc.aoTocar) opc.aoTocar(); arr = { p: el.p, x: e.clientX, y: e.clientY, foi: false }; parado = 0; });
    tab.addEventListener('pointermove', (e) => {
      if (!arr || arr.foi) return; const dx = e.clientX - arr.x, dy = e.clientY - arr.y; const lim = tab.clientWidth / N * .38;
      if (Math.abs(dx) < lim && Math.abs(dy) < lim) return;
      arr.foi = true; const dl = Math.abs(dy) > Math.abs(dx) ? Math.sign(dy) : 0, dc = dl ? 0 : Math.sign(dx);
      const l = arr.p.l + dl, c = arr.p.c + dc; if (l < 0 || c < 0 || l >= N || c >= N) return;
      if (sel) { sel.el.classList.remove('sel'); sel = null; } tenta(arr.p, g[l][c]);
    });
    addEventListener('pointerup', () => { if (arr && !arr.foi) escolhe(arr.p); arr = null; });

    function tiraDica() { if (dica) { dica.forEach((p) => { p.el.style.animation = ''; }); dica = null; } }
    setInterval(() => {
      if (travado || document.hidden) return; parado++;
      if (parado === 5) { const j = jogadas(); if (j.length) { dica = j[Math.floor(Math.random() * j.length)]; dica.forEach((p) => { p.el.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.22) rotate(6deg)' }, { transform: 'scale(1)' }], { duration: 700, iterations: 3 }); }); } }
      if (parado > 9) { parado = 0; tiraDica(); }
    }, 1000);

    /* joga sozinho uma vez, para mostrar que funciona */
    async function demo() { if (travado) return; const j = jogadas(); if (j.length) await tenta(j[0][0], j[0][1]); }

    monta();
    /* uma jogada que funciona agora, para o sinal de "dá para jogar" */
    const sugere = () => { if (travado) return null; const j = jogadas(); return j.length ? j[0] : null; };
    return { demo, monta, sugere };
  };
})();
