/* O Zoro no nome do Matheus.
   Mede as letras de verdade (altura do topo de cada glifo) para o gato pisar exatamente em cima delas.
   O Zoro é o mesmo gato do pé da janela: sai correndo, sobe pelo "S", pula de letra em letra,
   senta no último "a" e derruba o pingo do "i" com uma patada de lado.
   O pingo é o glifo real do "i" recortado e cai como um corpo de verdade: gravidade, quique, atrito e giro. */
(function () {
  const cv = document.createElement('canvas').getContext('2d');
  const som = () => {}; /* o site não tem som */
  const lim = (v, a, b) => Math.max(a, Math.min(b, v));
  const GRAV = 2700;

  function mede(el, ch) {
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    cv.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    if ('fontStretch' in cv) { const p = parseFloat(cs.fontStretch); cv.fontStretch = p >= 124 ? 'extra-expanded' : p >= 112 ? 'expanded' : p <= 76 ? 'extra-condensed' : 'normal'; }
    const m = cv.measureText(ch);
    let p = el.querySelector(':scope > .lb');
    if (!p) { p = document.createElement('span'); p.className = 'lb'; p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; el.appendChild(p); }
    const base = p.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
    return { fs, base, asc: m.actualBoundingBoxAscent, esq: -m.actualBoundingBoxLeft, dir: m.actualBoundingBoxRight };
  }
  window.medeLetra = mede;

  /* devolve uma função que dá, em coordenadas da janela, o ponto do topo do glifo (onde o gato pisa) */
  window.pontoLetra = function (el, ch, modo) {
    let m = null, larg = -1;
    return () => {
      const r = el.getBoundingClientRect();
      if (!m || Math.abs(r.width - larg) > .5) { m = mede(el, ch); larg = r.width; }
      return { x: r.left + (modo === 'haste' ? m.esq + m.fs * .115 : (m.esq + m.dir) / 2), y: r.top + m.base - m.asc + m.fs * .008, fs: m.fs };
    };
  };

  window.HeroZoro = function (o) {
    const { hero, G } = o;
    const pal = hero.querySelector('.l2 .pal'), pw = hero.querySelector('#pingo'), dica = hero.querySelector('#dica');
    if (!G || !pal || !pw) return null;
    const pg = pw.querySelector('.pingo-g'), ph = pw.querySelector('.pingo-h');
    const L = {}; pal.querySelectorAll('.c').forEach((c) => { L[c.dataset.l] = c; });
    const P = { S: pontoLetra(L.S, 'S'), b: pontoLetra(L.b, 'b', 'haste'), o: pontoLetra(L.o, 'o'), a: pontoLetra(L.a2, 'a') };
    const sit = (G.A[G.ZORO].sit || 182);
    const fs = () => parseFloat(getComputedStyle(L.i).fontSize);
    const escala = () => fs() * (innerWidth < 700 ? .6 : innerWidth < 900 ? .42 : .29) / sit;
    const espera = (ms, vivo) => new Promise((r) => setTimeout(() => r(vivo()), ms));

    /* ---------- pingo ---------- */
    let D = null;
    const B = { x: 0, y: 0, vx: 0, vy: 0, a: 0, w: 0, sq: 1, sqV: 0, ox: 0, oxV: 0, solto: false, repouso: true, volta: null };
    function medePingo() {
      const mi = mede(L.i, 'i'), mh = mede(L.i, 'ı');
      const d = mi.dir - mi.esq, topo = mi.base - mi.asc, corte = mi.base - mh.asc - Math.max(1, (mi.asc - mh.asc - d) * .5);
      pg.style.clipPath = `inset(0 0 calc(100% - ${corte}px) 0)`;
      D = { cx: (mi.esq + mi.dir) / 2, cy: topo + (corte - topo) / 2, d, h: corte - topo };
      pw.style.transformOrigin = `${D.cx}px ${D.cy}px`;
      const t = Math.max(44, d * 1.9);
      ph.style.cssText = `left:${D.cx - t / 2}px;top:${D.cy - t / 2}px;width:${t}px;height:${t}px`;
    }
    function limites() { /* chão e paredes do pingo, em deslocamento a partir do lugar dele no "i" */
      const hr = hero.getBoundingClientRect(), ir = L.i.getBoundingClientRect();
      const cxAbs = ir.left + D.cx, baixoAbs = ir.top + D.cy + D.h / 2;
      /* o chão do pingo é a borda de baixo do navegador (com a página no topo), nunca abaixo do fim do hero */
      return { chao: Math.min(hr.bottom, hr.top + innerHeight) - baixoAbs, esq: hr.left + D.d - cxAbs, dir: hr.right - D.d - cxAbs };
    }
    function pinta() { pw.style.transform = `translate(${(B.x + B.ox).toFixed(1)}px,${B.y.toFixed(1)}px) rotate(${B.a.toFixed(1)}deg) scale(${(2 - B.sq).toFixed(3)},${B.sq.toFixed(3)})`; }
    function solta(vx, vy, w) { B.solto = true; B.repouso = false; B.vx = vx; B.vy = vy; B.w = w; }
    function fisica(dt) {
      if (!D) return;
      /* mola do toque de teste e do amassa */
      const fo = -B.ox * 420 - B.oxV * 14; B.oxV += fo * dt; B.ox += B.oxV * dt;
      const fq = (1 - B.sq) * 260 - B.sqV * 17; B.sqV += fq * dt; B.sq += B.sqV * dt;
      if (B.volta) {
        const v = B.volta; v.t += dt; const u = Math.min(1, v.t / v.T), k = u * u * (3 - 2 * u);
        B.x = v.x0 * (1 - k); B.y = v.y0 * (1 - k) - Math.sin(Math.PI * u) * v.alt; B.a = v.a0 * (1 - k);
        if (u >= 1) { B.volta = null; B.x = B.y = B.a = 0; B.solto = false; B.repouso = true; B.sq = .7; B.sqV = 0; som('toque'); if (v.fim) v.fim(); }
      } else if (B.solto && !B.repouso) {
        const lm = limites();
        B.vy += GRAV * dt; B.x += B.vx * dt; B.y += B.vy * dt; B.a += B.w * dt;
        if (B.x < lm.esq) { B.x = lm.esq; B.vx = Math.abs(B.vx) * .5; B.w = -B.w * .5; } if (B.x > lm.dir) { B.x = lm.dir; B.vx = -Math.abs(B.vx) * .5; B.w = -B.w * .5; }
        if (B.y >= lm.chao) {
          B.y = lm.chao;
          if (B.vy > 150) { som('quique', { v: lim(B.vy / 1500, .15, 1), f: 1 }); B.sq = lim(1 - B.vy / 3200, .6, .95); B.sqV = 0; B.vy = -B.vy * .44; B.vx *= .7; B.w = B.vx * 1.6; }
          else { B.vy = 0; B.vx *= Math.max(0, 1 - 9 * dt); B.w = B.vx * 1.6; if (Math.abs(B.vx) < 10) { B.vx = 0; B.w = 0; B.repouso = true; B.a = Math.round(B.a / 180) * 180; if (B.aoParar) { const f = B.aoParar; B.aoParar = null; f(); } } }
        }
      } else if (B.solto && B.repouso) {
        /* um gato andando chuta o pingo */
        const r = ph.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (cy > 0 && cy < innerHeight) for (const g of G.faixa.gatos) if (g.modo === 'chao' && Math.abs(g.vx) > 28 && Math.abs(g.x - cx) < 30 * g.s / .4 && Math.abs(g.y - cy) < 70) { solta((g.vx > 0 ? 1 : -1) * (240 + Math.random() * 200), -(360 + Math.random() * 180), 0); som('toque'); break; }
      }
      pinta();
    }
    gsap.ticker.add((t, dms) => fisica(Math.min(.034, dms / 1000)));

    /* ---------- roteiro do Zoro ---------- */
    let pose = 'g7', virado = true, jaSubiu = false, chegou = false, vezes = 0, ocupado = false, ativo = false;
    const poe = (p, v) => { pose = p; if (v != null) virado = v; };
    const ancora = (ponto, p, v) => ({ ponto, s: escala, pose: () => p || pose, vira: () => (v != null ? v : virado) });

    async function roteiro(g, vivo) {
      await document.fonts.ready; if (!vivo()) return;
      medePingo();
      if (!jaSubiu) {
        const f = fs(), pS = P.S();
        if (o.peloAlto && !chegou) { chegou = true; g.x = Math.min(-90, pS.x - f * .85); g.y = pS.y - f * .95; }
        else {
          if (g.modo === 'chao') { g.quer = -1; const ok = await g.correAte(-80); if (!ok || !vivo()) return; }
          else if (g.modo === 'ar') { await espera(700, vivo); if (!vivo()) return; }
          g.x = pS.x - f * .7; g.y = pS.y + f * .22;
        }
        g.s = escala(); g.sAlvo = g.s; g.dir = 1;
        for (const k of ['S', 'b', 'o', 'a']) {
          const ok = await g.saltaPara(P[k], { s: escala(), prep: k === 'S' ? 0 : .1 }); if (!ok || !vivo()) return;
          g.prende(ancora(P[k], 'n7', false));
          if (!(await espera(k === 'a' ? 130 : 70, vivo))) return;
        }
        jaSubiu = true;
      } else {
        const ok = await g.saltaPara(P.a, { s: escala() }); if (!ok || !vivo()) return;
      }
      poe('g7', true); g.prende(ancora(P.a));
      if (!B.solto && vezes < 3) piada(g, vivo);
    }

    async function piada(g, vivo) {
      if (ocupado) return; ocupado = true;
      const fim = (r) => { ocupado = false; return r; };
      poe('g7', true); if (!(await espera(420, vivo))) return fim();
      poe('g0'); if (!(await espera(480, vivo))) return fim();
      poe('g1'); if (!(await espera(190, vivo))) return fim();
      poe('g2'); som('toque'); B.ox = -fs() * .03; B.oxV = 0; if (!(await espera(300, vivo))) return fim();
      poe('g1'); if (!(await espera(260, vivo))) return fim();
      poe('g2'); if (!(await espera(60, vivo))) return fim();
      const f = fs(), pequeno = innerWidth < 900;
      poe('g3'); g.amassa(1.08); som('patada'); vezes++;
      solta(-f * (pequeno ? 1.0 : 1.45), -f * 1.05, -420);
      const primeira = vezes === 1;
      B.aoParar = () => { if (!primeira || !dica) return; const r = ph.getBoundingClientRect(), hr = hero.getBoundingClientRect(); dica.style.left = lim(r.left + r.width / 2 - hr.left - 34, 12, hr.width - 250) + 'px'; dica.style.top = r.top - hr.top - 58 + 'px'; gsap.fromTo(dica, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4 }); gsap.to(dica, { opacity: 0, duration: .4, delay: 5 }); };
      if (!(await espera(520, vivo))) return fim();
      poe('g4'); if (!(await espera(1100, vivo))) return fim();
      poe('g5', false); som('miau', { gato: G.ZORO });
      fim();
    }

    function devolve() {
      if (!B.solto || B.volta) return; if (dica) gsap.to(dica, { opacity: 0, duration: .2 });
      som('volta'); B.repouso = false; B.aoParar = null;
      B.volta = { t: 0, T: .6, x0: B.x, y0: B.y, a0: B.a, alt: fs() * .22, fim: () => {
        const g = G.faixa.gatos[G.ZORO]; if (!ativo || g.modo !== 'preso') return;
        const ficha = g.ficha, vivo = () => g.ficha === ficha && ativo;
        poe('g6', true); g.amassa(1.2); som('susto');
        setTimeout(() => { if (!vivo()) return; poe('g7', true); if (vezes < 3) setTimeout(() => { if (vivo() && !B.solto) piada(g, vivo); }, 3800 + Math.random() * 2600); else { poe('x4', true); G.faixa.diz(G.ZORO, 'desisto', 2); } }, 750);
      } };
    }
    ph.addEventListener('click', devolve);
    ph.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); devolve(); } });
    let tr; addEventListener('resize', () => { clearTimeout(tr); tr = setTimeout(() => { if (D) { medePingo(); if (B.solto && B.repouso) { const lm = limites(); B.y = lm.chao; B.x = lim(B.x, lm.esq, lm.dir); } } }, 220); });

    const cena = G.palco.cria(G.ZORO, { roteiro, ponto: P.a, s: escala, pose: () => pose, vira: () => virado, aoSair: () => { ativo = false; ocupado = false; } });
    return { cena, liga(v) { ativo = !!v; G.palco.liga(cena, v); }, medePingo };
  };
})();
