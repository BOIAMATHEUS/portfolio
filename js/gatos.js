/* Luna, Zoro e Nacho: os três gatos do Matheus.
   Existem só três, sempre. Cada um é um corpo com posição, velocidade e gravidade:
   anda no pé da janela com aceleração e freada, pula até as cenas da página (letras, janela, caixa, cartões)
   e volta, e pode ser pego com o mouse e solto.
   Quadros: '0' senta, '4' pulo, '5' dorme, '7' espreguiça, w0..w7 anda, r0..r7 corre,
   n2/n3 pendurado, n5 lambe, n6 boceja, n7 agacha, x* e d* poses de cada gato, g* poses novas do Zoro. */
(function () {
  const A = window.GATOS_ATLAS;
  if (!A) return;
  const RAIZ = (document.currentScript && document.currentScript.dataset.raiz) || '';
  const url = (c) => `${RAIZ}assets/gatos/gato${c}.webp`;
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NACHO = 0, LUNA = 1, ZORO = 2;
  const GRAV = 2700;
  const som = (n, o) => { if (window.Som) Som.toca(n, o); };
  const val = (v) => (typeof v === 'function' ? v() : v);
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const suave = (u) => u * u * (3 - 2 * u);

  const ANDA = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'];
  const CORRE = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7'];
  const JEITO = {
    [NACHO]: { nome: 'Nacho', fala: ['miau?', 'comida?', 'ração?', 'fome...', 'miaaau'], toque: ['nham!', 'miau', 'purr'], vel: 54,
      pesos: { anda: 30, senta: 12, pede: 22, pao: 12, espirra: 6, lambe: 8, dorme: 8 } },
    [LUNA]: { nome: 'Luna', fala: ['zzz', 'prrr'], toque: ['prrr', '♥', 'mais'], vel: 40,
      pesos: { dorme: 34, pao: 20, senta: 14, anda: 16, boceja: 10, lambe: 6 } },
    [ZORO]: { nome: 'Zoro', fala: ['!', 'caixa?', 'opa'], toque: ['!', 'uhuul', 'pega'], vel: 64,
      pesos: { anda: 24, corre: 18, pose: 14, laco: 10, torto: 10, espreguica: 8, boceja: 6, senta: 10 } },
  };
  const PARADO = { senta: ['0', 2, 5], dorme: ['5', 7, 14], pao: ['x0', 4, 8], lambe: ['n5', 1.6, 3], boceja: ['n6', 1.2, 1.4], espreguica: ['7', 1.4, 1.8], espirra: ['x7', .8, 1], pose: ['x4', 2.5, 5], torto: ['d0', 6, 11], pede: ['x4', 2.4, 4], pouso: ['n7', .2, .26], vira: ['0', .1, .14] };

  class Gato {
    constructor(c, faixa) {
      this.c = c; this.j = JEITO[c]; this.faixa = faixa;
      const d = (cl) => { const e = document.createElement('div'); e.className = cl; return e; };
      this.el = d('gato'); this.el.setAttribute('aria-hidden', 'true');
      this.so = d('gato-so'); this.corpo = d('gato-c'); this.sp = d('gato-s'); this.bal = d('balao');
      this.corpo.appendChild(this.sp); this.el.append(this.so, this.corpo, this.bal); faixa.el.appendChild(this.el);
      this.x = innerWidth * (0.2 + c * 0.3); this.y = faixa.chao; this.vx = 0; this.vy = 0;
      this.s = faixa.s; this.sAlvo = faixa.s; this.dir = c === LUNA ? -1 : 1; this.quer = this.dir;
      this.sq = 1; this.sqV = 0; this.rot = 0; this.dist = 0;
      this.modo = 'chao'; this.estado = 'senta'; this.t = 1 + c; this.nome = '';
      this.cena = null; this.ancora = null; this.salto = null; this.ficha = 0; this.parado = false;
      this.poe('0');
      this.el.addEventListener('pointerdown', (e) => this.pega(e));
      this.el.addEventListener('pointerenter', () => { if (this.c === LUNA && this.modo === 'chao' && Math.abs(this.vx) < 4 && this.estado !== 'dorme') { this.poe('x4'); this.pq = 'x4'; this.sobe('♥', '#e8563a'); this.t = Math.max(this.t, 1.6); som('ronrom'); } });
    }

    /* ---------- desenho ---------- */
    poe(n) {
      if (n === this.nome) return; const f = A[this.c].f[n]; if (!f) return; this.nome = n; this.f = f;
      this.sp.style.width = f[2] + 'px'; this.sp.style.height = f[3] + 'px';
      this.sp.style.backgroundImage = `url(${url(this.c)})`;
      this.sp.style.backgroundSize = `${A[this.c].w}px ${A[this.c].h}px`;
      this.sp.style.backgroundPosition = `${-f[0]}px ${-f[1]}px`;
    }
    desenha() {
      const f = this.f, s = this.s, dx = (f[4] || 0) * this.dir, sx = (2 - this.sq) * s, sy = this.sq * s;
      const topo = this.modo === 'mao';
      this.el.style.transform = `translate3d(${this.x.toFixed(1)}px,${this.y.toFixed(1)}px,0)`;
      this.corpo.style.transformOrigin = topo ? '50% 12%' : '50% 100%';
      this.corpo.style.transform = `translate(${-f[2] / 2 + dx}px,${topo ? -f[3] * .12 : -f[3]}px) rotate(${this.rot.toFixed(2)}deg) scale(${(sx * this.dir).toFixed(3)},${sy.toFixed(3)})`;
      const alt = f[3] * s * (topo ? .1 : 1);
      this.bal.style.bottom = alt + 8 + 'px';
      if (this.z) this.z.style.bottom = alt * .8 + 'px';
      const h = this.faixa.chao - this.y, noChao = this.modo === 'chao' || (this.modo === 'ar' && h < 220);
      this.so.style.opacity = noChao ? lim(1 - h / 200, 0, 1) : 0;
      this.so.style.transform = `translate(-50%, ${h}px) scale(${(s / .4 * lim(1 - h / 320, .4, 1)).toFixed(2)})`;
      const dorme = this.nome === '5' || this.nome === 'x1' || /^d\d/.test(this.nome);
      if (dorme && !this.z) { this.z = document.createElement('span'); this.z.className = 'zzz'; this.z.textContent = 'z'; this.el.appendChild(this.z); }
      if (!dorme && this.z) { this.z.remove(); this.z = null; }
      this.sp.classList.toggle('resp', this.modo !== 'ar' && this.modo !== 'salto' && this.modo !== 'mao' && Math.abs(this.vx) < 4);
    }
    diz(txt, seg = 1.8) { this.bal.textContent = txt; const w = this.bal.offsetWidth / 2 + 8; this.bal.style.marginLeft = (Math.max(0, w - this.x) - Math.max(0, this.x + w - innerWidth)) + 'px'; this.bal.classList.add('on'); clearTimeout(this.tb); this.tb = setTimeout(() => this.bal.classList.remove('on'), seg * 1000); }
    sobe(txt, cor) { const e = document.createElement('span'); e.className = 'sobe'; e.textContent = txt; if (cor) e.style.color = cor; e.style.bottom = this.f[3] * this.s + 'px'; this.el.appendChild(e); setTimeout(() => e.remove(), 1100); }
    amassa(v) { this.sq = v; this.sqV = 0; }

    /* ---------- chão ---------- */
    muda(e, t) {
      this.estado = e; const r = (a, b) => a + Math.random() * (b - a);
      const p = PARADO[e];
      if (p) {
        let q = p[0];
        if (e === 'dorme' && this.c === LUNA && Math.random() < .5) q = 'x1';
        if (e === 'pao' && this.c === LUNA) q = 'x6';
        if (e === 'boceja' && this.c === ZORO) q = 'x1';
        if (e === 'torto') q = this.c === ZORO ? 'd' + Math.floor(Math.random() * 10) : '5';
        this.pq = q; this.t = t || r(p[1], p[2]);
        if (e === 'espirra') { this.diz('atchim!', .9); som('espirro'); this.amassa(.86); }
        if (e === 'pede') { this.diz(this.j.fala[Math.floor(Math.random() * this.j.fala.length)], 2); const ag = performance.now(); if (ag - (this.tm || 0) > 9000) { this.tm = ag; som('miau', { gato: this.c }); } }
        return;
      }
      if (e === 'anda' || e === 'laco') { this.t = t || r(3, 7); if (!t && Math.random() < .5) this.quer = -this.dir; }
      if (e === 'corre') this.t = t || r(1.2, 2.4);
      if (e === 'vai') this.t = t || 7;
    }
    escolhe() {
      const m = this.faixa.mouse;
      if (this.c === NACHO && m.vivo && Math.abs(m.x - this.x) > 90 && Math.random() < .6) { this.alvoX = null; return this.muda('vai'); }
      const p = this.j.pesos; let tot = 0; for (const k in p) tot += p[k];
      let n = Math.random() * tot; for (const k in p) { n -= p[k]; if (n <= 0) return this.muda(k); }
    }
    passoChao(dt) {
      const k = this.s / .4, e = this.estado;
      this.t -= dt;
      let vel = 0;
      if (e === 'anda' || e === 'laco') vel = this.j.vel * k;
      else if (e === 'corre') vel = this.j.vel * 4.6 * k;
      else if (e === 'vai') {
        const m = this.faixa.mouse, ax = this.alvoX != null ? this.alvoX : (m.vivo ? m.x : this.x), d = ax - this.x;
        this.quer = d > 0 ? 1 : -1;
        if (Math.abs(d) < (this.alvoX != null ? 14 : 48) * k) { if (this.aoChegar) { const f = this.aoChegar; this.aoChegar = null; this.alvoX = null; this.muda('senta', .3); f(); return; } this.dir = this.quer; this.muda('pede'); }
        else vel = this.j.vel * (this.alvoX != null ? 4.6 : Math.abs(d) > 420 ? 3.2 : 1.25) * k;
      }
      const borda = 46 * k;
      if (this.alvoX == null) { if (this.x < borda) this.quer = 1; if (this.x > innerWidth - borda) this.quer = -1; }
      /* vira só depois de frear */
      let alvo = vel * this.quer;
      if (vel && this.quer !== this.dir) { alvo = 0; if (Math.abs(this.vx) < 10 * k) { this.dir = this.quer; this.amassa(.95); } }
      const ac = (Math.abs(alvo) > Math.abs(this.vx) ? (e === 'corre' || this.alvoX != null ? 1500 : 260) : 900) * k;
      this.vx += lim(alvo - this.vx, -ac * dt, ac * dt);
      this.x += this.vx * dt;
      if (this.alvoX == null) this.x = lim(this.x, borda * .6, innerWidth - borda * .6);
      const v = Math.abs(this.vx);
      if (v > 7 * k) {
        /* passo amarrado à distância percorrida: o pé não patina */
        const corre = v > this.j.vel * 2.2 * k;
        this.dist += v * dt;
        const passo = (corre ? 210 : 66) * k, q = Math.floor(this.dist / (passo / 8)) % 8;
        this.poe(corre ? CORRE[q] : (e === 'laco' && this.c === ZORO && q % 2 ? 'x0' : ANDA[q]));
        this.rot += ((corre ? -3 * this.dir : 0) - this.rot) * Math.min(1, dt * 10);
      } else { this.rot += (0 - this.rot) * Math.min(1, dt * 12); if (PARADO[e]) this.poe(this.pq || '0'); else if (!vel) this.poe('0'); }
      if (this.t <= 0 && !this.parado) this.escolhe();
    }

    /* ---------- ar: queda livre com gravidade ---------- */
    passoAr(dt) {
      const chao = this.faixa.chao;
      this.vy += GRAV * dt; this.x += this.vx * dt; this.y += this.vy * dt;
      this.s += (this.sAlvo - this.s) * Math.min(1, dt * 7);
      const m = 30 * this.s / .4;
      if (this.x < m) { this.x = m; this.vx = Math.abs(this.vx) * .5; } if (this.x > innerWidth - m) { this.x = innerWidth - m; this.vx = -Math.abs(this.vx) * .5; }
      if (Math.abs(this.vx) > 30) this.dir = this.vx > 0 ? 1 : -1;
      this.poe(this.vy < -120 ? '4' : 'r0');
      const alvoRot = lim(this.vy / 60, -22, 26) * this.dir;
      this.rot += (alvoRot - this.rot) * Math.min(1, dt * 9);
      if (this.y >= chao) {
        this.y = chao;
        if (this.vy > 620) { this.vy = -this.vy * .24; this.vx *= .6; this.amassa(.66); som('pouso'); }
        else { this.vy = 0; this.vx *= .5; this.modo = 'chao'; this.rot = 0; this.amassa(.72); som('pouso'); this.quer = this.dir; this.muda('pouso'); if (this.aoPousar) { const f = this.aoPousar; this.aoPousar = null; f(); } }
      }
    }

    /* ---------- salto guiado até um ponto (que pode se mexer com a rolagem) ---------- */
    saltaPara(ponto, o = {}) {
      if (this.salto && this.salto.fim) this.salto.fim(false);
      return new Promise((fim) => {
        const a0 = val(ponto), x0 = this.x, y0 = this.y, dx = a0.x - x0;
        const topo = Math.min(y0, a0.y) - Math.max(o.alt || 0, 46 * this.s / .4, Math.abs(dx) * .26);
        const tS = Math.sqrt(2 * (y0 - topo) / GRAV), tD = Math.sqrt(2 * (a0.y - topo) / GRAV);
        this.salto = { ponto, a0, x0, y0, topo, tS, T: tS + tD, t: -(o.prep != null ? o.prep : .12), s0: this.s, s1: o.s != null ? o.s : this.s, fim, partiu: false };
        if (Math.abs(dx) > 6) this.dir = dx > 0 ? 1 : -1;
        this.modo = 'salto'; this.vx = 0; this.vy = 0; this.poe('n7'); this.amassa(.8);
      });
    }
    passoSalto(dt) {
      const j = this.salto; j.t += dt;
      if (j.t < 0) { if (this.ancora) { const p = val(this.ancora.ponto); this.x = p.x; this.y = p.y; } return; }
      if (!j.partiu) {
        j.partiu = true; this.ancora = null; j.a0 = val(j.ponto); j.x0 = this.x; j.y0 = this.y;
        const dx = j.a0.x - j.x0; j.topo = Math.min(j.y0, j.a0.y) - Math.max(46 * this.s / .4, Math.abs(dx) * .26);
        j.tS = Math.sqrt(2 * (j.y0 - j.topo) / GRAV); j.T = j.tS + Math.sqrt(2 * (j.a0.y - j.topo) / GRAV);
        if (Math.abs(dx) > 6) this.dir = dx > 0 ? 1 : -1;
        som('pulo'); this.amassa(1.14);
      }
      const t = Math.min(j.t, j.T), u = t / j.T, agora = val(j.ponto), k = suave(u);
      const y = t < j.tS ? j.y0 - (GRAV * j.tS * t - .5 * GRAV * t * t) : j.topo + .5 * GRAV * (t - j.tS) * (t - j.tS);
      this.x = j.x0 + (j.a0.x - j.x0) * u + (agora.x - j.a0.x) * k;
      this.y = y + (agora.y - j.a0.y) * k;
      this.s = j.s0 + (j.s1 - j.s0) * k;
      const sobe = t < j.tS, vyAgora = sobe ? -(GRAV * (j.tS - t)) : GRAV * (t - j.tS);
      this.poe(sobe && vyAgora < -500 ? '4' : 'r0');
      this.rot += (lim(vyAgora / 55, -24, 24) * this.dir - this.rot) * Math.min(1, dt * 12);
      if (j.t >= j.T) { this.x = agora.x; this.y = agora.y; this.s = j.s1; this.rot = 0; this.salto = null; this.amassa(.72); som('pouso'); this.poe('n7'); j.fim(true); }
    }
    cancela() { this.ficha++; if (this.salto) { const f = this.salto.fim; this.salto = null; f(false); } this.aoChegar = null; this.aoPousar = null; this.alvoX = null; }

    /* ---------- cenas ---------- */
    prende(a) { this.ancora = a; this.modo = 'preso'; this.vx = this.vy = 0; }
    passoPreso() {
      const a = this.ancora, p = val(a.ponto);
      this.x = p.x; this.y = p.y; this.s = val(a.s) || this.s; this.rot = 0;
      if (a.vira != null) this.dir = val(a.vira) ? -1 : 1;
      this.poe(val(a.pose) || '0');
    }
    vaiCena(cena) {
      this.cancela(); this.cena = cena; const ficha = this.ficha; this.parado = false;
      if (calmo) { this.prende(cena); return; }
      if (this.modo === 'mao') return;
      if (cena.roteiro) { cena.roteiro(this, () => this.ficha === ficha); return; }
      const p = val(cena.ponto);
      if (p.y < -260 || p.y > innerHeight + 260) { this.x = p.x; this.y = p.y; this.s = val(cena.s); this.prende(cena); return; }
      this.saltaPara(cena.ponto, { s: val(cena.s), prep: this.modo === 'ar' ? 0 : .12 }).then((ok) => { if (ok && this.ficha === ficha) { this.prende(cena); if (cena.aoChegar) cena.aoChegar(this); } });
    }
    desce() {
      this.cancela(); this.cena = null; if (this.modo === 'chao' || this.modo === 'ar' || this.modo === 'mao') return;
      const meio = innerWidth / 2;
      this.ancora = null; this.modo = 'ar'; this.sAlvo = this.faixa.s;
      this.vy = this.y > this.faixa.chao - 120 ? -520 : -380; this.vx = (this.x < meio ? 1 : -1) * (90 + Math.random() * 120);
      if (this.y < -200) { this.y = -120; this.vy = 0; }
      this.x = lim(this.x, 40, innerWidth - 40);
      som('pulo');
    }
    /* corre no chão até um x (pode ser fora da tela) e avisa */
    correAte(x) { return new Promise((fim) => { const ficha = this.ficha; this.alvoX = x; this.aoChegar = () => fim(this.ficha === ficha); this.muda('vai', 6); }); }

    /* ---------- pegar com o mouse ---------- */
    pega(e) {
      if (calmo || this.faixa.congelado) return; e.preventDefault();
      const p0 = { x: e.clientX, y: e.clientY, t: performance.now() }; let arrastou = false, ult = { ...p0 }, vel = { x: 0, y: 0 };
      const move = (ev) => {
        if (!arrastou && Math.hypot(ev.clientX - p0.x, ev.clientY - p0.y) > 7) { arrastou = true; const cena = this.cena; this.cancela(); this.cena = cena; this.ancora = null; this.modo = 'mao'; this.mao = { x: ev.clientX, y: ev.clientY }; this.el.classList.add('pego'); this.diz(['ei!', 'me solta', 'miau!'][this.c], 1.2); som('miau', { gato: this.c }); }
        if (arrastou) { const ag = performance.now(), dt = Math.max(8, ag - ult.t) / 1000; vel = { x: (ev.clientX - ult.x) / dt * .5 + vel.x * .5, y: (ev.clientY - ult.y) / dt * .5 + vel.y * .5 }; ult = { x: ev.clientX, y: ev.clientY, t: ag }; this.mao = { x: ev.clientX, y: ev.clientY }; }
      };
      const solta = () => {
        removeEventListener('pointermove', move); removeEventListener('pointerup', solta); removeEventListener('pointercancel', solta);
        if (!arrastou) return this.toque();
        this.el.classList.remove('pego'); this.modo = 'ar'; this.sAlvo = this.faixa.s;
        this.y += this.f[3] * this.s * .88; this.vx = lim(vel.x, -1900, 1900); this.vy = lim(vel.y, -2100, 1700);
        const cena = this.cena; if (cena) this.aoPousar = () => setTimeout(() => { if (this.cena === cena && this.modo === 'chao') this.vaiCena(cena); }, 1600);
      };
      addEventListener('pointermove', move); addEventListener('pointerup', solta); addEventListener('pointercancel', solta);
    }
    passoMao(dt) {
      const m = this.mao, ax = m.x, ay = m.y + 6;
      const vxA = (ax - this.x) / Math.max(dt, .001);
      this.x += (ax - this.x) * Math.min(1, dt * 26); this.y += (ay - this.y) * Math.min(1, dt * 26);
      this.s += (this.faixa.s * 1.1 - this.s) * Math.min(1, dt * 8);
      this.rot += (lim(-vxA / 28, -38, 38) - this.rot) * Math.min(1, dt * 7);
      this.poe(Math.abs(this.rot) > 12 ? 'n3' : 'n2');
    }
    toque() {
      const f = this.j.toque; this.diz(f[Math.floor(Math.random() * f.length)], 1.2); this.sobe('♥', '#e8563a'); som('miau', { gato: this.c }); this.amassa(.86);
      if (this.modo !== 'chao') return;
      if (this.c === ZORO) { this.quer = this.x > innerWidth / 2 ? -1 : 1; this.muda('corre', 1.5); }
      else if (this.c === NACHO) this.muda('lambe', 1.4);
      else { this.muda('pose', 1.8); }
    }

    passo(dt) {
      if (this.modo === 'chao') { this.y = this.faixa.chao; this.s += (this.sAlvo - this.s) * Math.min(1, dt * 8); this.passoChao(dt); }
      else if (this.modo === 'ar') this.passoAr(dt);
      else if (this.modo === 'salto') this.passoSalto(dt);
      else if (this.modo === 'preso') this.passoPreso();
      else if (this.modo === 'mao') this.passoMao(dt);
      /* mola do amassa e estica */
      const fa = (1 - this.sq) * 190 - this.sqV * 15; this.sqV += fa * dt; this.sq += this.sqV * dt;
      this.desenha();
    }
  }

  const faixa = {
    el: null, gatos: [], s: .4, chao: 0, mouse: { x: 0, y: 0, vivo: false }, congelado: false,
    inicia(o = {}) {
      if (this.el) return this;
      this.el = document.createElement('div'); this.el.id = 'gatos'; document.body.appendChild(this.el);
      this.mede();
      this.gatos = [new Gato(NACHO, this), new Gato(LUNA, this), new Gato(ZORO, this)];
      if (o.abertura) { this.congelado = true; [[NACHO, .5, 'x0'], [LUNA, .8, '0'], [ZORO, .19, '0']].forEach(([c, fx, q]) => { const g = this.gatos[c]; g.x = innerWidth * fx; g.dir = 1; g.quer = 1; g.pq = q; g.poe(q); g.estado = 'senta'; g.t = 99; }); }
      addEventListener('resize', () => { this.mede(); this.gatos.forEach((g) => { if (g.modo === 'chao') g.sAlvo = this.s; }); });
      let tm; addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.vivo = true; clearTimeout(tm); tm = setTimeout(() => { this.mouse.vivo = false; }, 5000); }, { passive: true });
      let ult = performance.now();
      const laco = (agora) => {
        const dt = Math.min(.034, (agora - ult) / 1000); ult = agora;
        if (!document.hidden) { if (!this.congelado) this.separa(); this.gatos.forEach((g) => { if (this.congelado && g.modo === 'chao') { g.y = this.chao; g.desenha(); } else g.passo(dt); }); }
        requestAnimationFrame(laco);
      };
      if (calmo) this.gatos.forEach((g) => { g.poe(g.c === LUNA ? '5' : '0'); g.y = this.chao; g.desenha(); }); else requestAnimationFrame(laco);
      return this;
    },
    mede() { this.s = innerWidth < 700 ? .28 : innerWidth < 1200 ? .34 : .4; this.chao = innerHeight - 5; },
    /* dois gatos parados não ficam um em cima do outro */
    separa() {
      const g = this.gatos.filter((x) => x.modo === 'chao' && Math.abs(x.vx) < 5 && x.alvoX == null);
      for (let i = 0; i < g.length; i++) for (let k = i + 1; k < g.length; k++) {
        const a = g[i], b = g[k], d = b.x - a.x, min = 78 * this.s / .4;
        if (Math.abs(d) < min) { const quem = (a.estado === 'dorme' || a.estado === 'torto') ? b : a; if (quem.estado === 'dorme' || quem.estado === 'torto') continue; quem.quer = (quem === a ? -1 : 1) * (d >= 0 ? 1 : -1); quem.muda('anda', 1.4); }
      }
    },
    solta() { this.congelado = false; this.gatos.forEach((g, i) => { if (g.modo === 'chao') g.t = .6 + i * .5; }); },
    diz(c, txt, seg) { const g = this.gatos[c]; if (g) g.diz(txt, seg); },
    corre(c, dir) { const g = this.gatos[c]; if (g && g.modo === 'chao' && g.estado !== 'dorme' && g.alvoX == null) { g.quer = dir; g.muda('corre', 1.3); } },
    acorda() { this.gatos.forEach((g) => { if (g.modo === 'chao' && (g.estado === 'dorme' || g.estado === 'torto')) g.muda('boceja'); }); },
  };

  /* palco: quando uma cena da página pede um gato, ele pula do chão até lá; quando a cena sai, ele desce.
     Se duas cenas pedem o mesmo gato, vale a que foi ligada por último. */
  const palco = {
    cenas: [], n: 0, atual: {},
    cria(c, def) { const x = Object.assign({ c, ativo: false, ordem: 0, s: () => faixa.s }, def); this.cenas.push(x); return x; },
    liga(x, on) { if (!x || x.ativo === !!on) return; x.ativo = !!on; x.ordem = ++this.n; this.resolve(x.c); },
    resolve(c) {
      const dona = this.cenas.filter((x) => x.c === c && x.ativo).sort((a, b) => b.ordem - a.ordem)[0] || null;
      if (dona === (this.atual[c] || null)) return;
      const ant = this.atual[c]; this.atual[c] = dona; const g = faixa.gatos[c]; if (!g) return;
      if (ant && ant.aoSair) ant.aoSair(g);
      if (dona) g.vaiCena(dona); else g.desce();
    },
  };

  window.Gatos = { faixa, palco, NACHO, LUNA, ZORO, A, calmo };
})();
