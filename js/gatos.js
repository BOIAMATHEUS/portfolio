/* Luna, Zoro e Nacho: os três gatos do Matheus andando no pé da janela.
   Quadros: '0' senta, '5' dorme, '6' rola, '7' espreguiça, w0..w7 anda, r0..r7 corre,
   n4 come, n5 lambe, n6 boceja, n7 agacha, n8 dá patada, x* e d* são poses de cada gato. */
(function () {
  const A = window.GATOS_ATLAS;
  if (!A) return;
  const RAIZ = (document.currentScript && document.currentScript.dataset.raiz) || '';
  const url = (c) => `${RAIZ}assets/gatos/gato${c}.webp`;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NACHO = 0, LUNA = 1, ZORO = 2;

  function quadro(el, c, nome, s) {
    const f = A[c].f[nome];
    if (!f) return;
    el.style.width = f[2] * s + 'px';
    el.style.height = f[3] * s + 'px';
    el.style.backgroundImage = `url(${url(c)})`;
    el.style.backgroundSize = `${A[c].w * s}px ${A[c].h * s}px`;
    el.style.backgroundPosition = `${-f[0] * s}px ${-f[1] * s}px`;
  }

  /* gato de cena: um sprite parado ou em ciclo dentro de qualquer elemento */
  function cena(alvo, c, nomes, opc = {}) {
    let s = opc.s || 0.4, virado = !!opc.vira, nome = [].concat(nomes)[0];
    const fps = opc.fps || 8;
    alvo.classList.add('gato-cena');
    let i = alvo.querySelector('i');
    if (!i) { i = document.createElement('i'); alvo.appendChild(i); }
    let k = 0, t = null;
    const poe = (n) => { nome = n; quadro(i, c, n, s); const f = A[c].f[n], dx = (f && f[4] || 0) * s; i.style.transform = `translateX(${virado ? -dx : dx}px)` + (virado ? ' scaleX(-1)' : ''); };
    const api = {
      el: i,
      pose(n) { clearInterval(t); t = null; poe(n); return api; },
      ciclo(ns, f = fps) { clearInterval(t); k = 0; poe(ns[0]); if (!calmo) t = setInterval(() => { k = (k + 1) % ns.length; poe(ns[k]); }, 1000 / f); return api; },
      vira(v) { virado = !!v; poe(nome); return api; },
      escala(v) { s = v; poe(nome); return api; },
      para() { clearInterval(t); t = null; return api; },
    };
    const lista = [].concat(nomes);
    poe(lista[0]);
    if (lista.length > 1) api.ciclo(lista);
    if (opc.respira) alvo.classList.add('resp');
    return api;
  }

  const ANDA = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'];
  const CORRE = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'];
  const JEITO = {
    [NACHO]: { nome: 'Nacho', fala: ['miau?', 'comida?', 'ração?', 'fome...', 'miaaau'], toque: ['nham!', 'miau', 'purr'], vel: 46,
      pesos: { anda: 30, senta: 12, pede: 26, pao: 10, espirra: 8, lambe: 8, dorme: 6 } },
    [LUNA]: { nome: 'Luna', fala: ['zzz', 'prrr'], toque: ['prrr', '♥', 'mais'], vel: 34,
      pesos: { dorme: 34, pao: 20, senta: 14, anda: 16, boceja: 10, lambe: 6 } },
    [ZORO]: { nome: 'Zoro', fala: ['!', 'caixa?', 'opa'], toque: ['!', 'uhuul', 'pega'], vel: 58,
      pesos: { anda: 24, corre: 20, pose: 14, laco: 10, torto: 12, espreguica: 8, boceja: 6, senta: 6 } },
  };

  class Gato {
    constructor(c, faixa) {
      this.c = c; this.j = JEITO[c]; this.faixa = faixa;
      this.el = document.createElement('div'); this.el.className = 'gato'; this.el.setAttribute('aria-hidden', 'true');
      this.sp = document.createElement('div'); this.sp.className = 'gato-s';
      this.bal = document.createElement('div'); this.bal.className = 'balao';
      this.so = document.createElement('div'); this.so.className = 'gato-so'; this.el.append(this.so, this.sp, this.bal); faixa.el.appendChild(this.el);
      this.x = innerWidth * (0.18 + c * 0.3); this.dir = c === LUNA ? -1 : 1; this.q = 0; this.tq = 0;
      this.estado = 'senta'; this.t = 1 + c; this.nome = '0'; this.alvo = null;
      this.el.addEventListener('pointerdown', (e) => { e.preventDefault(); this.toque(); });
      this.el.addEventListener('pointerenter', () => { if (c === LUNA && this.estado !== 'anda') { this.poe('x4'); this.sobe('♥', '#e8563a'); this.t = Math.max(this.t, 1.6); } });
      this.desenha();
    }
    get s() { return this.faixa.s; }
    poe(n) { this.nome = n; quadro(this.sp, this.c, n, this.s); }
    diz(txt, seg = 1.8) { this.bal.textContent = txt; const w = this.bal.offsetWidth / 2 + 8; this.bal.style.marginLeft = (Math.max(0, w - this.x) - Math.max(0, this.x + w - innerWidth)) + 'px'; this.bal.classList.add('on'); clearTimeout(this.tb); this.tb = setTimeout(() => this.bal.classList.remove('on'), seg * 1000); }
    sobe(txt, cor) { const e = document.createElement('span'); e.className = 'sobe'; e.textContent = txt; if (cor) e.style.color = cor; this.el.appendChild(e); setTimeout(() => e.remove(), 1100); }
    toque() {
      const f = this.j.toque; this.diz(f[Math.floor(Math.random() * f.length)], 1.2); this.sobe('♥', '#e8563a');
      if (this.c === ZORO) { this.dir = this.x > innerWidth / 2 ? -1 : 1; this.muda('corre', 1.6); }
      else if (this.c === NACHO) this.muda('lambe', 1.4);
      else { this.poe('x4'); this.estado = 'pose'; this.t = 1.8; }
    }
    muda(e, t) {
      this.estado = e; this.q = 0; this.tq = 0;
      const r = (a, b) => a + Math.random() * (b - a);
      const fix = { senta: ['0', r(2, 5)], dorme: [this.c === LUNA && Math.random() < .5 ? 'x1' : '5', r(7, 14)], pao: [this.c === LUNA ? 'x6' : 'x0', r(4, 8)],
        lambe: ['n5', r(1.6, 3)], boceja: [this.c === ZORO ? 'x1' : 'n6', 1.3], espreguica: ['7', 1.6], espirra: ['x7', .9], pose: ['x4', r(2.5, 5)],
        torto: ['d' + Math.floor(Math.random() * 10), r(6, 11)], pede: ['x4', r(2.4, 4)] };
      if (fix[e]) { this.poe(fix[e][0]); this.t = t || fix[e][1]; if (e === 'espirra') this.diz('atchim!', .9); if (e === 'pede') this.diz(this.j.fala[Math.floor(Math.random() * this.j.fala.length)], 2); return; }
      if (e === 'anda' || e === 'laco') { this.t = t || r(3, 7); if (Math.random() < .5 && !t) this.dir *= -1; }
      if (e === 'corre') { this.t = t || r(1.2, 2.6); }
      if (e === 'vai') { this.t = 6; }
    }
    escolhe() {
      const m = this.faixa.mouse;
      if (this.c === NACHO && m.vivo && Math.abs(m.x - this.x) > 90 && Math.random() < .62) { this.alvo = m.x; return this.muda('vai'); }
      const p = this.j.pesos; let tot = 0; for (const k in p) tot += p[k];
      let n = Math.random() * tot; for (const k in p) { n -= p[k]; if (n <= 0) return this.muda(k); }
    }
    passo(dt) {
      this.t -= dt;
      const anda = this.estado === 'anda' || this.estado === 'laco' || this.estado === 'vai', corre = this.estado === 'corre';
      if (anda || corre) {
        if (this.estado === 'vai') {
          const m = this.faixa.mouse; if (m.vivo) this.alvo = m.x;
          const d = this.alvo - this.x; this.dir = d > 0 ? 1 : -1;
          if (Math.abs(d) < 46) { this.dir = d > 0 ? 1 : -1; this.muda('pede'); return this.desenha(); }
        }
        const v = (corre ? this.j.vel * 3.4 : this.j.vel) * (this.s / .4);
        this.x += this.dir * v * dt;
        const borda = 40 * (this.s / .4);
        if (this.x < borda) { this.x = borda; this.dir = 1; } if (this.x > innerWidth - borda) { this.x = innerWidth - borda; this.dir = -1; }
        this.tq += dt; const fps = corre ? 15 : 9;
        if (this.tq > 1 / fps) { this.tq = 0; this.q = (this.q + 1) % 8; }
        const n = corre ? CORRE[this.q] : (this.estado === 'laco' && this.c === ZORO && this.q % 2 ? 'x0' : ANDA[this.q]);
        if (n !== this.nome) this.poe(n);
      }
      if (this.t <= 0) this.escolhe();
      this.desenha();
    }
    desenha() {
      this.el.style.transform = `translate3d(${this.x}px,0,0) translateX(-50%)`;
      const f = A[this.c].f[this.nome], dx = (f && f[4] || 0) * this.s * this.dir; this.sp.style.transform = `translateX(${dx}px)` + (this.dir < 0 ? ' scaleX(-1)' : '');
      this.sp.classList.toggle('resp', !(this.estado === 'anda' || this.estado === 'laco' || this.estado === 'vai' || this.estado === 'corre'));
      if (this.estado === 'dorme' || this.estado === 'torto') { if (!this.z) { this.z = document.createElement('span'); this.z.className = 'zzz'; this.z.textContent = 'z'; this.el.appendChild(this.z); } }
      else if (this.z) { this.z.remove(); this.z = null; }
    }
  }

  const faixa = {
    el: null, gatos: [], s: .5, mouse: { x: 0, vivo: false },
    inicia() {
      if (this.el) return this;
      this.el = document.createElement('div'); this.el.id = 'gatos'; document.body.appendChild(this.el);
      this.mede();
      this.gatos = [new Gato(NACHO, this), new Gato(LUNA, this), new Gato(ZORO, this)];
      addEventListener('resize', () => { this.mede(); this.gatos.forEach((g) => g.poe(g.nome)); });
      let tm; addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; this.mouse.x = e.clientX; this.mouse.vivo = true; clearTimeout(tm); tm = setTimeout(() => { this.mouse.vivo = false; }, 5000); }, { passive: true });
      let ult = performance.now();
      const laco = (agora) => { const dt = Math.min(.05, (agora - ult) / 1000); ult = agora; if (!document.hidden) this.gatos.forEach((g) => g.passo(dt)); requestAnimationFrame(laco); };
      if (calmo) this.gatos.forEach((g) => { g.poe(g.c === LUNA ? '5' : '0'); g.desenha(); }); else requestAnimationFrame(laco);
      return this;
    },
    mede() { this.s = innerWidth < 700 ? .28 : innerWidth < 1200 ? .34 : .4; },
    diz(c, txt, seg) { const g = this.gatos[c]; if (g) g.diz(txt, seg); },
    corre(c, dir) { const g = this.gatos[c]; if (g && g.estado !== 'dorme') { g.dir = dir; g.muda('corre', 1.4); } },
    acorda() { this.gatos.forEach((g) => { if (g.estado === 'dorme' || g.estado === 'torto') g.muda('boceja'); }); },
  };

  window.Gatos = { cena, quadro, faixa, NACHO, LUNA, ZORO, ANDA, CORRE };
})();
