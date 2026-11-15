/* Quatro introduções do hero, para escolher: ?intro=1 (queda), 2 (caixa), 3 (prancheta), 4 (8 bits).
   Todas recebem o mesmo pacote { hero, nome, letras, miudos, G, som, zoro, fino, fim } e chamam o.fim()
   quando o nome está no lugar. Nenhuma pede clique. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const TINTA = '#15120f';
  const pula = (G, c, v) => { const g = G && G.faixa.gatos[c]; if (g && g.modo === 'chao') { g.vy = -(v || 520); g.modo = 'ar'; g.amassa(1.12); } };
  const susto = (G) => { if (G) [0, 1, 2].forEach((c, i) => setTimeout(() => pula(G, c, 400 + Math.random() * 220), i * 90)); };
  const solta = (G) => { if (G) G.faixa.congelado = false; };
  const miudos = (o) => gsap.to(o.miudos, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out' });
  const cria = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; document.body.appendChild(d); return d; };

  /* ---------- 1. Queda: as letras despencam de cima, com peso ---------- */
  function queda(o) {
    const { letras, G, som } = o, pg = $('.pingo-g'), tl = gsap.timeline();
    if (o.zoro) o.zoro.medePingo();
    solta(G);
    gsap.set(letras, { transformOrigin: '50% 86%' });
    letras.forEach((el, i) => {
      const r = el.getBoundingClientRect(), t = .2 + i * .1 + rand(0, .1), d = .52 + rand(0, .12);
      gsap.set(el, { y: -(r.bottom + 90), rotation: rand(-34, 34) });
      tl.to(el, { y: 0, duration: d, ease: 'power2.in' }, t)
        .to(el, { rotation: 0, duration: d, ease: 'power1.in' }, t)
        .add(() => { som('quique', { v: .45 + Math.random() * .4, f: .7 + Math.random() * .6 }); if (i === 0) susto(G); if (i === 8) pula(G, 0, 560); gsap.fromTo(o.hero, { y: 3 + Math.random() * 4 }, { y: 0, duration: .28, ease: 'power2.out', overwrite: true }); }, t + d)
        .fromTo(el, { scaleY: .68, scaleX: 1.15 }, { scaleY: 1, scaleX: 1, duration: .65, ease: 'elastic.out(1.15, .38)', immediateRender: false }, t + d);
    });
    const fimL = tl.duration();
    if (pg) { gsap.set(pg, { y: -innerHeight }); tl.to(pg, { y: 0, duration: .95, ease: 'bounce.out' }, fimL - .35).add(() => som('toque'), fimL - .02); }
    tl.add(() => G && G.faixa.diz(G.NACHO, 'eita!', 1.3), .8)
      .add(() => { gsap.set(letras, { clearProps: 'transform' }); gsap.set(o.hero, { clearProps: 'transform' }); if (pg) gsap.set(pg, { clearProps: 'transform' }); miudos(o); o.fim(); }, '+=.05');
  }

  /* ---------- 2. Caixa: uma caixa cai, treme, abre e o nome sai de dentro ---------- */
  function caixa(o) {
    const { letras, G, som } = o, tl = gsap.timeline();
    const chao = G ? G.faixa.chao : innerHeight - 8, larg = Math.max(150, Math.min(300, innerWidth * .2)), alt = larg * 176 / 208;
    const topo = chao - alt * 84 / 88 + 2, bx = innerWidth / 2, by = topo + alt * 37 / 88;
    if (G) { const n = G.faixa.gatos[G.NACHO]; n.x = innerWidth * (innerWidth < 700 ? .14 : .3); }
    solta(G);
    const cx = cria('intro-cx', '<img src="assets/intro/caixa-fechada.webp" alt=""><img src="assets/intro/caixa-aberta.webp" alt="">');
    cx.style.cssText = `width:${larg}px;left:${bx - larg / 2}px;top:${topo}px`;
    const [f, a] = cx.children; a.style.opacity = 0;
    gsap.set(letras, { opacity: 0 });
    tl.fromTo(cx, { y: -(topo + alt + 60), rotation: -9 }, { y: 0, rotation: 0, duration: .62, ease: 'power2.in' }, .2)
      .add(() => { som('pouso'); susto(G); })
      .fromTo(cx, { scaleY: .78, scaleX: 1.12 }, { scaleY: 1, scaleX: 1, duration: .55, ease: 'elastic.out(1.1, .4)' })
      .to(cx, { rotation: 5, duration: .07, yoyo: true, repeat: 5, ease: 'sine.inOut' }, '+=.1')
      .to(cx, { y: -18, duration: .13, ease: 'power2.out' }, '+=.16').to(cx, { y: 0, duration: .12, ease: 'power2.in' })
      .add(() => som('quique', { v: .5 }))
      .to(cx, { rotation: -8, duration: .055, yoyo: true, repeat: 7, ease: 'sine.inOut' })
      .add(() => { f.style.opacity = 0; a.style.opacity = 1; som('pop'); G && G.faixa.diz(G.ZORO, 'caixa!', 1.2); })
      .fromTo(cx, { scaleY: 1.16, scaleX: .93 }, { scaleY: 1, scaleX: 1, duration: .45, ease: 'elastic.out(1.2, .45)' })
      .addLabel('sai', '-=.3');
    letras.forEach((el, i) => {
      const r = el.getBoundingClientRect(), t = `sai+=${(i * .05).toFixed(2)}`;
      tl.set(el, { opacity: 1, x: bx - (r.left + r.width / 2), y: by - (r.top + r.height / 2), scale: .04, rotation: rand(-170, 170) }, t)
        .to(el, { x: 0, duration: .85, ease: 'power2.out' }, t)
        .to(el, { y: 0, duration: .85, ease: 'back.out(1.5)' }, t)
        .to(el, { scale: 1, rotation: 0, duration: .72, ease: 'power3.out' }, t)
        .add(() => som('pulo'), t);
    });
    tl.add(() => {
      for (let k = 0; k < 16; k++) {
        const fl = cria('intro-floco'); gsap.set(fl, { x: bx + rand(-larg * .25, larg * .25), y: by, rotation: rand(0, 180) });
        const dx = rand(-1, 1) * innerWidth * .22, sobe = rand(.25, .6) * innerHeight, dur = rand(.9, 1.5);
        gsap.to(fl, { x: '+=' + dx, rotation: '+=' + rand(-400, 400), duration: dur, ease: 'power1.out' });
        gsap.timeline({ onComplete: () => fl.remove() }).to(fl, { y: by - sobe, duration: dur * .4, ease: 'power2.out' }).to(fl, { y: chao - 4, duration: dur * .6, ease: 'bounce.out' }).to(fl, { opacity: 0, duration: .5 }, '+=.5');
      }
    }, 'sai')
      .add(() => susto(G), 'sai+=.35')
      .to(cx, { y: alt + 80, rotation: 16, duration: .5, ease: 'power2.in' }, '-=.3')
      .add(() => { cx.remove(); gsap.set(letras, { clearProps: 'transform,opacity' }); miudos(o); o.fim(); });
  }

  /* ---------- 3. Prancheta: o nome é desenhado como num arquivo de design ---------- */
  function prancheta(o) {
    const { letras, G, som, nome } = o, tl = gsap.timeline();
    const rs = $$('.nome .pal').map((p) => p.getBoundingClientRect()), fs = parseFloat(getComputedStyle(nome).fontSize);
    const x0 = Math.min(...rs.map((r) => r.left)) - 14, y0 = Math.min(...rs.map((r) => r.top)) - fs * .06, w = Math.max(...rs.map((r) => r.right)) - x0 + 14, h = Math.max(...rs.map((r) => r.bottom)) - y0 + fs * .05;
    const ov = cria('intro-pr', '<div class="pr-grade"></div><div class="pr-sel"><i></i><i></i><i></i><i></i><b class="px">Matheus Saboia</b><em class="px">0 × 0</em></div><span class="pr-cur"><u class="px">Matheus</u></span>');
    const gr = $('.pr-grade', ov), sel = $('.pr-sel', ov), cur = $('.pr-cur', ov), med = $('em', sel), alcas = $$('i', sel), tag = $('b', sel);
    nome.classList.add('contorno'); gsap.set(letras, { opacity: 0 });
    letras.forEach((el) => { const r = el.getBoundingClientRect(); el._cx = r.left + r.width * .5; el._v = 0; });
    gsap.set(sel, { x: x0, y: y0, width: 0, height: 0, opacity: 0 }); gsap.set([alcas, tag, med], { scale: 0 });
    const P = { x: innerWidth * .8, y: innerHeight * .8 };
    const poe = () => { gsap.set(cur, { x: P.x, y: P.y }); if (G) { const m = G.faixa.mouse; m.x = P.x; m.y = P.y; m.vivo = true; } };
    poe(); solta(G); if (G) G.faixa.gatos[G.NACHO].t = .3;
    const arrasta = () => {
      poe(); const ww = Math.max(0, P.x - x0), hh = Math.max(0, P.y - y0);
      sel.style.width = ww + 'px'; sel.style.height = hh + 'px'; med.textContent = Math.round(ww) + ' × ' + Math.round(hh);
      letras.forEach((el) => { if (!el._v && el._cx < P.x - 4) { el._v = 1; gsap.to(el, { opacity: 1, duration: .16 }); } });
    };
    tl.fromTo(gr, { opacity: 0 }, { opacity: 1, duration: .4 }, 0)
      .fromTo(cur, { scale: 0 }, { scale: 1, duration: .3, ease: 'back.out(2)' }, .1)
      .to(P, { x: x0, y: y0, duration: .7, ease: 'power3.inOut', onUpdate: poe }, .3)
      .add(() => som('toque'))
      .to(cur, { scale: .72, duration: .1 })
      .set(sel, { opacity: 1 })
      .to(P, { x: x0 + w, y: y0 + h, duration: 1, ease: 'power2.inOut', onUpdate: arrasta })
      .add(() => som('toque'))
      .to(cur, { scale: 1, duration: .15 })
      .to(alcas, { scale: 1, duration: .25, stagger: .04, ease: 'back.out(3)' }, '<')
      .to([tag, med], { scale: 1, duration: .25, ease: 'back.out(2)' }, '<')
      .to(P, { x: x0 + w * .5, y: y0 + h * .56, duration: .5, ease: 'power3.inOut', onUpdate: poe }, '+=.18')
      .add(() => { som('pop'); $('u', cur).textContent = 'preencher #15120F'; })
      .to(cur, { scale: 1.5, duration: .12, yoyo: true, repeat: 1 })
      .to(letras, { color: TINTA, duration: .22, stagger: { each: .03, from: 'center' }, ease: 'power1.in' }, '<')
      .add(() => { nome.classList.remove('contorno'); gsap.set(letras, { clearProps: 'color,opacity' }); })
      .to(sel, { opacity: 0, duration: .3 }, '+=.3')
      .to(P, { x: innerWidth + 60, y: y0 + h + 60, duration: .55, ease: 'power2.in', onUpdate: poe }, '<')
      .to(ov, { opacity: 0, duration: .4 }, '<.1')
      .add(() => { ov.remove(); if (G) G.faixa.mouse.vivo = false; miudos(o); o.fim(); });
  }

  /* ---------- 4. 8 bits: o nome nasce em blocos e ganha resolução ---------- */
  function bits(o) {
    const { letras, G, som, nome } = o;
    const cs = getComputedStyle(nome), fs = parseFloat(cs.fontSize);
    const rs = $$('.nome .pal').map((p) => p.getBoundingClientRect());
    const L = Math.floor(Math.min(...rs.map((r) => r.left)) - 10), T = Math.floor(Math.min(...rs.map((r) => r.top)) - fs * .22);
    const W = Math.ceil(Math.max(...rs.map((r) => r.right)) - L + 10), H = Math.ceil(Math.max(...rs.map((r) => r.bottom)) - T + fs * .12);
    /* o nome desenhado em tamanho real, letra por letra, no lugar exato de cada uma */
    const src = document.createElement('canvas'); src.width = W; src.height = H;
    const sx = src.getContext('2d', { willReadFrequently: true });
    sx.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    if ('fontStretch' in sx) sx.fontStretch = 'extra-expanded';
    sx.fillStyle = TINTA; sx.textBaseline = 'alphabetic';
    letras.forEach((el) => { const r = el.getBoundingClientRect(), ch = el.classList.contains('i-zoro') ? 'i' : el.textContent.trim(), m = window.medeLetra(el, ch); sx.fillText(ch, r.left - L, r.top - T + m.base); });
    const px = sx.getImageData(0, 0, W, H).data;
    const cv = document.createElement('canvas'); cv.className = 'intro-px'; cv.width = W; cv.height = H; cv.style.cssText = `left:${L}px;top:${T}px;width:${W}px;height:${H}px`;
    document.body.appendChild(cv);
    const cx = cv.getContext('2d');
    const barra = cria('intro-barra px', '<span></span><b>0%</b>'); barra.style.cssText = `left:${L + 10}px;top:${T + H + Math.max(10, fs * .06)}px`;
    const CORES = ['#e8563a', '#78f624', '#b9e33b', '#7d5b49'];
    gsap.set(nome, { opacity: 0 });
    solta(G);

    function blocos(b) { /* quais quadrados de lado b estão cheios o bastante */
      const out = [];
      for (let y = 0; y < H; y += b) for (let x = 0; x < W; x += b) {
        let s = 0, n = 0;
        for (let yy = y; yy < Math.min(H, y + b); yy += 2) for (let xx = x; xx < Math.min(W, x + b); xx += 2) { s += px[(yy * W + xx) * 4 + 3]; n++; }
        if (n && s / n > 96) out.push([x, y]);
      }
      return out;
    }
    function pinta(b, lista, cor) {
      const g = b >= 10 ? Math.max(1, Math.round(b * .07)) : 0;
      lista.forEach(([x, y]) => { cx.fillStyle = Math.random() < cor ? CORES[Math.floor(Math.random() * CORES.length)] : TINTA; cx.fillRect(x, y, b - g, b - g); });
    }
    const b0 = Math.max(14, Math.round(fs * .19));
    const degraus = [...new Set([1, .68, .46, .3, .19, .11, .06].map((k) => Math.max(2, Math.round(b0 * k))))];
    const prog = (p) => { barra.firstChild.textContent = 'renderizando ' + '▮'.repeat(Math.round(p * 10)) + '▯'.repeat(10 - Math.round(p * 10)); barra.lastChild.textContent = Math.round(p * 100) + '%'; };
    prog(0);
    /* primeiro degrau: os blocos vão pipocando */
    const prim = blocos(degraus[0]).sort(() => Math.random() - .5), est = { n: 0 };
    const tl = gsap.timeline();
    tl.to(est, { n: prim.length, duration: .7, ease: 'none', onUpdate: () => { const ate = Math.round(est.n); pinta(degraus[0], prim.slice(est.feito || 0, ate), .16); est.feito = ate; prog(.12 * est.n / prim.length); } }, .25)
      .add(() => som('tique'));
    degraus.slice(1).forEach((b, i) => {
      tl.add(() => { cx.clearRect(0, 0, W, H); pinta(b, blocos(b), Math.max(0, .12 - i * .03)); prog(.12 + .88 * (i + 1) / degraus.length); som('tique'); }, '+=' + (i === 0 ? .32 : .2));
    });
    tl.add(() => { cv.remove(); gsap.set(nome, { opacity: 1 }); prog(1); barra.firstChild.textContent = 'pronto.'; som('chegou'); susto(G); }, '+=.2')
      .fromTo(nome, { scale: 1.012 }, { scale: 1, duration: .5, ease: 'power3.out', clearProps: 'scale' })
      .to(barra, { opacity: 0, duration: .35 }, '+=.25')
      .add(() => { barra.remove(); miudos(o); o.fim(); });
  }

  window.Intros = { 1: queda, 2: caixa, 3: prancheta, 4: bits, nomes: ['atual', 'queda', 'caixa', 'prancheta', '8 bits'] };
})();
