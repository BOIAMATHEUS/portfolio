/* O Zoro no nome do Matheus.
   Mede as letras de verdade (altura do topo de cada glifo) para o gato pisar exatamente em cima delas,
   pula de letra em letra, senta no último "a" e derruba o pingo do "i" com uma patada de lado.
   O pingo é o glifo real do "i" recortado, então fica idêntico à letra. */
(function () {
  const cv = document.createElement('canvas').getContext('2d');

  function mede(el, ch) {
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    cv.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
    const m = cv.measureText(ch);
    let p = el.querySelector(':scope > .lb');
    if (!p) { p = document.createElement('span'); p.className = 'lb'; p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; el.appendChild(p); }
    const base = p.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
    return { fs, base, asc: m.actualBoundingBoxAscent, esq: -m.actualBoundingBoxLeft, dir: m.actualBoundingBoxRight };
  }

  window.medeLetra = mede;

  window.HeroZoro = function (o) {
    const { hero, G, calmo } = o;
    const pal = hero.querySelector('.l2 .pal'), zw = hero.querySelector('#zoro'), zc = hero.querySelector('#zoro-c');
    const pw = hero.querySelector('#pingo'), pg = pw && pw.querySelector('.pingo-g'), ph = pw && pw.querySelector('.pingo-h'), dica = hero.querySelector('#dica');
    const L = {}; pal.querySelectorAll('.c').forEach((c) => { L[c.dataset.l] = c; });
    if (!G || !zw || !pw || !L.i) return { gag() {} };
    let A = {}, fs = 100, s = .3, z = null, assento = null, caido = false, vezes = 0, ocupado = false, pronto = false, D = null;

    function medeTudo() {
      const anc = (k, ch, modo) => {
        const el = L[k], m = mede(el, ch); fs = m.fs;
        const x = el.offsetLeft + (modo === 'haste' ? m.esq + fs * .115 : (m.esq + m.dir) / 2);
        return { el, x, y: el.offsetTop + m.base - m.asc + fs * .006 };
      };
      A = { S: anc('S', 'S'), b: anc('b', 'b', 'haste'), o: anc('o', 'o'), a: anc('a2', 'a') };
      /* pingo: glifo "i" recortado logo acima da haste */
      const mi = mede(L.i, 'i'), mh = mede(L.i, 'ı');
      const d = mi.dir - mi.esq, topo = mi.base - mi.asc, corte = mi.base - mh.asc - Math.max(1, (mi.asc - mh.asc - d) * .5);
      pg.style.clipPath = `inset(0 0 calc(100% - ${corte}px) 0)`;
      D = { cx: (mi.esq + mi.dir) / 2, cy: topo + d / 2, d };
      pw.style.transformOrigin = `${D.cx}px ${D.cy}px`;
      const t = Math.max(44, d * 1.9);
      ph.style.cssText = `left:${D.cx - t / 2}px;top:${D.cy - t / 2}px;width:${t}px;height:${t}px`;
      /* gato: sentado ocupa ~0,29 em, que é o vão entre as duas linhas do nome */
      s = fs * (innerWidth < 900 ? .42 : .29) / (window.GATOS_ATLAS[G.ZORO].sit || 182);
      if (!z) z = G.cena(zc, G.ZORO, 'g7', { s }); else z.escala(s);
      if (assento) gsap.set(zw, { x: assento.x, y: assento.y });
    }

    /* o gato acompanha a letra quando ela sobe com o cursor */
    gsap.ticker.add(() => { if (assento) zw.style.translate = `0 ${gsap.getProperty(assento.el, 'y') || 0}px`; });

    function salto(t, de, para, dur) {
      const pico = Math.min(de.y, para.y) - Math.max(fs * .12, Math.abs(para.x - de.x) * .3);
      t.add(() => { assento = null; z.pose('n7').vira(para.x < de.x); })
        .to(zc, { scaleY: .8, scaleX: 1.14, duration: .11, ease: 'power2.in' })
        .add(() => z.pose(para.y < de.y - fs * .08 ? '4' : 'r0'))
        .to(zc, { scaleY: 1.1, scaleX: .93, rotation: -10, duration: .1, ease: 'power2.out' })
        .to(zw, { x: para.x, duration: dur, ease: 'none' }, '<')
        .to(zw, { y: pico, duration: dur * .48, ease: 'power2.out' }, '<')
        .to(zw, { y: para.y, duration: dur * .52, ease: 'power2.in' }, '>')
        .to(zc, { rotation: 12, duration: dur * .5, ease: 'none' }, '<')
        .add(() => { z.pose('n7'); assento = para; })
        .to(zc, { scaleY: .78, scaleX: 1.18, rotation: 0, duration: .07, ease: 'power2.out' })
        .to(zc, { scaleY: 1, scaleX: 1, duration: .26, ease: 'elastic.out(1, .5)' });
    }

    function quica(t, alvo, chao, alturas) {
      alturas.forEach((h, i) => {
        t.to(alvo, { scaleY: .68, scaleX: 1.26, duration: .05, ease: 'power2.out' })
          .to(alvo, { scaleY: 1, scaleX: 1, duration: .12, ease: 'power2.out' })
          .to(alvo, { y: chao - h, duration: .16 + i * -.02, ease: 'power2.out' }, '<')
          .to(alvo, { y: chao, duration: .16 + i * -.02, ease: 'power2.in' });
      });
      t.to(alvo, { scaleY: .82, scaleX: 1.14, duration: .05 }).to(alvo, { scaleY: 1, scaleX: 1, duration: .25, ease: 'elastic.out(1, .5)' });
    }

    function gag() {
      if (ocupado || caido || calmo) return; ocupado = true;
      if (!pronto) { medeTudo(); pronto = true; }
      const hr = hero.getBoundingClientRect(), pr = pw.getBoundingClientRect();
      const chao = hr.bottom - 7 - (pr.top + D.cy + D.d / 2);
      const primeira = vezes === 0;
      const t = gsap.timeline({ onComplete: () => { ocupado = false; } });
      if (primeira) {
        const fora = { x: -fs * .7, y: A.S.y + fs * .2 };
        gsap.set(zw, { x: fora.x, y: fora.y, opacity: 1 }); gsap.set(zc, { transformOrigin: '50% 100%' });
        salto(t, fora, A.S, .4); salto(t, A.S, A.b, .38); salto(t, A.b, A.o, .34); salto(t, A.o, A.a, .36);
        t.add(() => z.pose('g7').vira(true), '+=.12');
      } else t.add(() => z.pose('g7').vira(true));
      t.add(() => z.pose('g0'), '+=.4')
        .to(zc, { scaleY: .97, duration: .2, yoyo: true, repeat: 1, ease: 'sine.inOut' })
        .add(() => z.pose('g1'), '+=.15')
        .add(() => z.pose('g2'), '+=.2')
        .to(pw, { x: -fs * .028, duration: .07, ease: 'power2.out' })
        .to(pw, { x: 0, duration: .4, ease: 'elastic.out(1.2, .35)' })
        .add(() => z.pose('g1'), '-=.22')
        .add(() => z.pose('g2'), '+=.28')
        .add(() => { z.pose('g3'); caido = true; vezes++; }, '+=.07')
        .to(zc, { rotation: -4, duration: .08, yoyo: true, repeat: 1 })
        .to(pw, { x: -fs * (innerWidth < 900 ? .5 : .95), duration: 1.25, ease: 'power1.out' }, '<')
        .to(pw, { rotation: -180, duration: 1.05, ease: 'power1.out' }, '<')
        .to(pw, { y: -fs * .05, duration: .12, ease: 'power2.out' }, '<')
        .to(pw, { y: chao, duration: .5, ease: 'power2.in' }, '>');
      quica(t, pw, chao, [fs * .2, fs * .09, fs * .035]);
      t.add(() => z.pose('g4'), '-=.9')
        .add(() => z.pose('g5').vira(false), '+=.7')
        .add(() => { if (!primeira || !dica) return; const r = ph.getBoundingClientRect(); dica.style.left = Math.max(12, r.left + r.width / 2 - hr.left - 34) + 'px'; dica.style.top = r.top - hr.top - 58 + 'px'; gsap.fromTo(dica, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .4 }); gsap.to(dica, { opacity: 0, duration: .4, delay: 5 }); });
    }

    function devolve() {
      if (!caido || ocupado) return; ocupado = true; if (dica) gsap.to(dica, { opacity: 0, duration: .2 });
      const t = gsap.timeline({ onComplete: () => { ocupado = false; caido = false; if (vezes < 3) gsap.delayedCall(4.5 + Math.random() * 3, gag); else { z.pose('x4').vira(true); G.faixa.diz(G.ZORO, 'desisto', 2); } } });
      t.to(pw, { scaleY: .7, scaleX: 1.25, duration: .1 })
        .to(pw, { scaleY: 1.15, scaleX: .9, duration: .1 })
        .to(pw, { x: 0, rotation: 0, duration: .62, ease: 'power1.inOut' }, '<')
        .to(pw, { y: -fs * .16, duration: .4, ease: 'power2.out' }, '<')
        .to(pw, { y: 0, scaleY: 1, scaleX: 1, duration: .22, ease: 'power2.in' })
        .to(pw, { scaleY: .8, scaleX: 1.18, duration: .05 }).to(pw, { scaleY: 1, scaleX: 1, duration: .3, ease: 'elastic.out(1, .4)' })
        .add(() => z.pose('g6').vira(true), '-=.45')
        .to(zw, { y: '-=' + fs * .07, duration: .12, ease: 'power2.out' }, '<').to(zw, { y: () => A.a.y, duration: .14, ease: 'power2.in' })
        .add(() => z.pose('g7').vira(true), '+=.7');
    }
    ph.addEventListener('click', devolve);
    ph.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') devolve(); });

    let tr; addEventListener('resize', () => { clearTimeout(tr); tr = setTimeout(() => { if (pronto && !ocupado) medeTudo(); }, 200); });
    return { gag, voltou() { if (!caido && vezes && vezes < 3 && !ocupado) gsap.delayedCall(1.5, gag); }, medeTudo };
  };
})();
