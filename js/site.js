/* Portfólio Matheus Saboia: animações e interações. */
(function () {
  const CONTATO = { whatsapp: 'https://wa.me/5519991463731', behance: 'https://www.behance.net/matheusboia', linkedin: 'https://www.linkedin.com/in/msaboia/', email: '' };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap) { document.documentElement.classList.add('sem-js'); document.documentElement.classList.remove('abrindo'); return; }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const curto = () => innerWidth < 700;
  const G = window.Gatos, fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  const som = () => {}; /* o site não tem som */
  const hero = $('#hero');

  /* ---------- rolagem suave ---------- */
  let lenis = null;
  if (window.Lenis && !calmo) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const al = $(a.getAttribute('href')); if (!al) return; e.preventDefault(); lenis ? lenis.scrollTo(al, { duration: 1.4 }) : al.scrollIntoView({ behavior: 'smooth' }); }));

  /* ---------- troca de página com cortina na cor do destino ---------- */
  const cortina = $('#cortina');
  $$('a[data-vai]').forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || calmo) return; e.preventDefault();
    cortina.style.background = a.dataset.vai || '#15120f'; som('cortina');
    gsap.fromTo(cortina, { yPercent: 101 }, { yPercent: 0, duration: .6, ease: 'power3.inOut', onComplete: () => { location.href = a.href; } });
  }));
  addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(cortina, { yPercent: 101 }); });

  /* ---------- cursor: só a bolinha, sem a seta ---------- */
  const cur = $('#cur'), curR = $('#cur-r');
  if (cur && fino) {
    document.documentElement.classList.add('cur-on');
    const qx = gsap.quickTo(cur, 'x', { duration: .1, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: .1, ease: 'power3' });
    const rx = gsap.quickTo(curR, 'x', { duration: .3, ease: 'power3' }), ry = gsap.quickTo(curR, 'y', { duration: .3, ease: 'power3' });
    let visto = false, estado = '', aperta = false, mx = 0, my = 0;
    const olha = () => { if (!visto) return; const el = document.elementFromPoint(mx, my); if (el) pinta(el); };
    const pinta = (alvo) => {
      let e = 'ponto', txt = '';
      if (alvo) {
        const g = alvo.closest('.gato'), c = alvo.closest('[data-cur]');
        if (g) { e = 'rotulo'; txt = g.classList.contains('pego') ? 'soltar' : 'fazer<br>carinho'; }
        else if (c) { e = 'rotulo'; txt = c.dataset.cur; }
        else if (alvo.closest('.peca')) e = 'medio';
        else if (alvo.closest('a, button, [role=button], figure.zoom')) e = 'grande';
      }
      const chave = e + txt; if (chave === estado) return; estado = chave;
      if (e === 'rotulo') { curR.innerHTML = txt; gsap.to(curR, { scale: 1, duration: .35, ease: 'back.out(2)' }); gsap.to(cur, { scale: 0, duration: .2 }); }
      else { gsap.to(curR, { scale: 0, duration: .22 }); gsap.to(cur, { scale: (e === 'grande' ? 3.6 : e === 'medio' ? 1.5 : 1) * (aperta ? .75 : 1), duration: .3, ease: 'power3.out' }); }
    };
    addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; if (!visto) { visto = true; gsap.set([cur, curR], { x: e.clientX, y: e.clientY }); gsap.to(cur, { opacity: 1, duration: .2 }); } mx = e.clientX; my = e.clientY; qx(mx); qy(my); rx(mx); ry(my); pinta(e.target); }, { passive: true });
    addEventListener('pointerdown', () => { aperta = true; estado = ''; }); addEventListener('pointerup', () => { aperta = false; estado = ''; setTimeout(olha, 30); });
    setInterval(olha, 160);
    document.addEventListener('pointerleave', () => { gsap.to([cur, curR], { opacity: 0, duration: .2 }); visto = false; estado = ''; });
    document.addEventListener('pointerenter', () => gsap.to(curR, { opacity: 1, duration: .2 }));
    addEventListener('scroll', olha, { passive: true });
  }

  /* ---------- cor da navegação conforme a seção que está por baixo dela ---------- */
  const nav = $('.nav'); let navT = 0, yAnt = 0;
  function corNav() { navT = 0; const els = document.elementsFromPoint(innerWidth / 2, 34); for (const el of els) { const d = el.closest && el.closest('[data-nav]'); if (d) { nav.classList.toggle('claro', d.dataset.nav === 'claro'); break; } } }
  if (nav) { addEventListener('scroll', () => { if (!navT) navT = requestAnimationFrame(corNav); const y = scrollY; nav.classList.toggle('rolou', y > 24); nav.classList.toggle('some', y > 240 && y > yAnt + 2); if (y < yAnt - 2 || y <= 240) nav.classList.remove('some'); yAnt = y; }, { passive: true }); setTimeout(corNav, 60); setInterval(corNav, 900); }

  /* ---------- gatos ---------- */
  const abertura = !!(hero && !calmo && window.Intros && document.documentElement.classList.contains('abrindo'));
  window.__intro = 1; if (!abertura) document.documentElement.classList.remove('abrindo');
  if (G) G.faixa.inicia({ abertura });
  const cenaRolagem = (cena, cfg) => ScrollTrigger.create(Object.assign({ onToggle: (st) => G.palco.liga(cena, st.isActive) }, cfg));
  /* celular, página inicial: na prateleira e nos painéis dos cases os gatos saem do pé da tela para não cobrir títulos */
  if (G && hero && innerWidth < 700 && document.getElementById('trabalhos') && document.querySelector('.sobre')) ScrollTrigger.create({ trigger: '#trabalhos', start: 'top 85%', endTrigger: '.sobre', end: 'top 85%', onToggle: (st) => gsap.to(G.faixa.el, { autoAlpha: st.isActive ? 0 : 1, y: st.isActive ? 60 : 0, duration: .5, overwrite: true }) });

  /* ---------- revelar ao rolar e títulos por linha ---------- */
  $$('[data-sobe]').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  function linhas(h, cfg) {
    h.innerHTML = h.innerHTML.split(/<br\s*\/?>/).map((l) => `<span class="lin-f"><span class="lin">${l}</span></span>`).join('');
    gsap.from($$('.lin', h), Object.assign({ yPercent: 112, duration: 1.05, stagger: .09, ease: 'power4.out' }, cfg));
  }
  $$('[data-linhas]').forEach((h) => linhas(h, { scrollTrigger: { trigger: h, start: 'top 86%' } }));
  function palavras(el, cfg) {
    const anda = (no) => [...no.childNodes].map((c) => c.nodeType === 3 ? c.textContent.split(/([ \t\n]+)/).map((p) => p.trim() ? `<span class="w">${p}</span>` : p).join('') : c.nodeName === 'BR' ? '<br>' : `<em>${anda(c)}</em>`).join('');
    el.innerHTML = anda(el);
    gsap.to($$('.w', el), { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: Object.assign({ trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: .4 }, cfg) });
  }
  $$('[data-palavras]').forEach((el) => palavras(el));
  $$('[data-conta]').forEach((b) => { const fim = +b.dataset.conta, o = { v: 0 }; gsap.to(o, { v: fim, duration: 1.6, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v); }, scrollTrigger: { trigger: b, start: 'top 88%' } }); });

  /* ---------- contato ---------- */
  const cl = $('#contato-l');
  if (cl) {
    const itens = [['WhatsApp', CONTATO.whatsapp], ['Behance', CONTATO.behance], ['LinkedIn', CONTATO.linkedin], ['E-mail', CONTATO.email && 'mailto:' + CONTATO.email]].filter((i) => i[1]);
    cl.innerHTML = itens.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n} ${seta}</a>`).join('');
    const t = $('#contato-t span');
    if (t) t.innerHTML = t.innerHTML.split('<br>').map((l) => [...l].map((c) => `<span class="c">${c}</span>`).join('')).join('<br>');
    gsap.from('#contato-t .c', { yPercent: 110, opacity: 0, duration: .8, stagger: .035, ease: 'power4.out', scrollTrigger: { trigger: '#contato-t', start: 'top 80%' } });
    /* o Nacho sobe para dormir em cima do "m" */
    const m = $$('#contato-t .c').find((c) => c.textContent === 'm');
    if (G && window.pontoLetra && m && !G.calmo) document.fonts.ready.then(() => {
      const p = pontoLetra(m, 'm');
      const cn = G.palco.cria(G.NACHO, { ponto: p, s: () => p().fs * .46 / (G.A[G.NACHO].sit || 200), pose: '5' });
      cenaRolagem(cn, { trigger: '#contato-t', start: 'top 62%', end: 'bottom top' });
    });
    ScrollTrigger.create({ trigger: '.contato', start: 'top 60%', onEnter: () => { if (G) G.faixa.acorda(); } });
  }

  /* galeria em CDs: clique abre a caixa, o disco sai girando e só então a cortina leva para o case */
  const gal = $('.galeria.cds');
  if (gal) {
    const chao = () => { const p = $('.cd-palco', gal); if (!p) return; const g = gal.getBoundingClientRect(), r = p.getBoundingClientRect(); gal.style.setProperty('--chao', (r.bottom - g.top - 2) + 'px'); };
    chao(); addEventListener('resize', chao); addEventListener('load', chao); new ResizeObserver(chao).observe(gal); new IntersectionObserver((es) => { if (es[0].isIntersecting) chao(); }).observe(gal);
    $$('.cd', gal).forEach((cd) => cd.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey) return; e.preventDefault();
      if (cd.classList.contains('abre')) return;
      cd.classList.add('abre'); som('pop');
      const vai = () => { location.href = cd.href; };
      if (calmo) return vai();
      gsap.delayedCall(1.05, () => { cortina.style.background = cd.dataset.cor; som('cortina'); gsap.fromTo(cortina, { yPercent: 101 }, { yPercent: 0, duration: .6, ease: 'power3.inOut', onComplete: vai }); });
    }));
    addEventListener('pageshow', () => $$('.cd.abre', gal).forEach((cd) => cd.classList.remove('abre')));
  }
  if (hero) inicio(); else caso();

  /* ================= página inicial ================= */
  function inicio() {
    const nome = $('.nome'), l1 = $('.nome .l1 .pal'), letras = $$('.nome .c');

    /* o nome ocupa a largura toda (ou 36% da altura da janela, o que for menor) */
    function ajusta() {
      const antes = nome.style.fontStretch; nome.style.fontStretch = '125%'; nome.style.fontSize = '100px';
      const w = l1.getBoundingClientRect().width, cs = getComputedStyle(hero), larg = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      nome.style.fontSize = Math.min(100 * larg / w * .992, innerHeight * (innerWidth < 900 ? .3 : .36)) + 'px'; nome.style.fontStretch = antes;
    }
    ajusta(); document.fonts.ready.then(ajusta);
    let largAnt = innerWidth; addEventListener('resize', () => { if (innerWidth === largAnt && !fino) return; largAnt = innerWidth; ajusta(); });

    const zoro = window.HeroZoro && G && !G.calmo ? HeroZoro({ hero, G, peloAlto: abertura }) : null;
    const acende = () => {
      if (G) G.faixa.solta();
      if (zoro) { zoro.liga(true); ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom 45%', onToggle: (st) => zoro.liga(st.isActive) }); }
    };

    const miudos = $$('.hero-topo > *, .hero-pe > *');
    /* introdução: o hero abre em wireframe e ganha fidelidade (js/intros.js). Não roda ao voltar pelo histórico nem com âncora. */
    if (!abertura) acende();
    else {
      history.scrollRestoration = 'manual'; scrollTo(0, 0); lenis && lenis.stop();
      gsap.set(miudos, { opacity: 0, y: 14 }); gsap.set(nome, { opacity: 0 });
      document.fonts.ready.then(() => {
        ajusta(); gsap.set(nome, { opacity: 1 });
        const fim = () => { lenis && lenis.start(); };
        /* durante a introdução o Zoro fica fora da tela; ele entra pulando quando o nome ganha tinta (revela) */
        if (G) G.faixa.gatos[G.ZORO].x = -500;
        try { Intros.wire({ nome, letras, miudos, G, som, revela: acende, fim }); }
        catch (e) { console.error(e); $$('.intro-pr, .nome-c, .intro-filtro').forEach((x) => x.remove()); nome.classList.remove('tinge'); nome.removeAttribute('style'); ajusta(); acende(); gsap.set(miudos, { opacity: 1, y: 0 }); if (G) { G.faixa.congelado = false; gsap.set(G.faixa.el, { opacity: 1 }); } fim(); }
        document.documentElement.classList.remove('abrindo');
      });
    }

    /* letras do nome sobem quando o cursor passa perto */
    if (!calmo && fino) {
      const ls = letras.map((el) => ({ el, y: gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' }) }));
      hero.addEventListener('pointermove', (e) => { ls.forEach((l) => { const r = l.el.getBoundingClientRect(); const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); l.y(-Math.max(0, 1 - d / 260) * 26); }); });
      hero.addEventListener('pointerleave', () => ls.forEach((l) => l.y(0)));
    }
    if (!calmo) { gsap.to(nome, { y: -70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }); gsap.fromTo(['.hero-topo', '.hero-pe'], { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: hero, start: '2% top', end: '40% top', scrub: true } }); }

    /* letreiro */
    const let_ = $('#letreiro');
    if (let_ && !calmo) { let_.innerHTML += let_.innerHTML + let_.innerHTML; const larg = let_.scrollWidth / 3; const tw = gsap.to(let_, { x: -larg, duration: 26, ease: 'none', repeat: -1 }); ScrollTrigger.create({ onUpdate: (s) => { const v = Math.abs(s.getVelocity()) / 400; gsap.to(tw, { timeScale: 1 + Math.min(v, 5), duration: .3, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 1.2, delay: .3 }); } }); }

    jogo(); goodGreen(); rastreio(); sobre();
    if (lenis) ScrollTrigger.create({ onUpdate: (s) => { const v = s.getVelocity(); if (Math.abs(v) > 2600 && G) G.faixa.corre(G.ZORO, v > 0 ? 1 : -1); } });
    addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* entrada de um painel de case da página inicial */
  function entra(sel) {
    const s = $(sel); if (!s) return;
    linhas($('h3', s), { scrollTrigger: { trigger: s, start: 'top 55%' } });
    gsap.from([$('.caso-n', s), $('.caso-d', s), $('.tags', s), $('.btn', s)], { y: 26, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 50%' } });
    gsap.from($('.caso-vis', s), { y: 80, opacity: 0, scale: .94, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 50%' } });
  }

  /* ---------- 01 Renova: mini Match ---------- */
  function jogo() {
    const tab = $('#tab'); if (!tab || !window.MiniMatch) return;
    const nEl = $('#moedas-n'), msg = $('#jogo-msg'), rv = $('#renovinha'), alvo = $('#jogo-moedas'), mb = $('#meta-b'), mn = $('#meta-n'), fn = $('#fase-n'); let moedas = 0, primeira = true, tr, fase = 1, META = 150, fim = false;
    const frases = ['Boa!', 'Combo!', 'Que jogada!', 'Mais uma!'];
    /* sinal de que dá para jogar, em forma de tutorial: o tabuleiro escurece, duas peças ficam acesas e trocam de lugar
       por um instante, com um ponto de toque fazendo o gesto. Sem desenho de mão. Para no primeiro toque da pessoa. */
    const cria = (cls, html) => { const e = document.createElement('span'); e.className = cls; if (html) e.innerHTML = html; tab.appendChild(e); return e; };
    const toque = cria('toque'), tut = cria('tut px', 'arraste');
    let jogou = false, laco = 0, naTela = false, tlToque = null, alvos = [], anims = [];
    const apaga = () => { anims.forEach((x) => x.cancel()); anims = []; alvos.forEach((e) => e.classList.remove('alvo')); alvos = []; };
    const passo = () => {
      if (jogou || !naTela || document.hidden) return; const j = m.sugere(); if (!j) return;
      const k = tab.clientWidth / 6, pt = (p) => ({ x: (p.c + .5) * k, y: (p.l + .5) * k }), a = pt(j[0]), b = pt(j[1]), dx = b.x - a.x, dy = b.y - a.y, w = k * .66;
      apaga(); alvos = [j[0].el, j[1].el]; alvos.forEach((e) => e.classList.add('alvo'));
      tab.classList.add('tutor'); tut.style.top = (a.y + b.y) / 2 > k * 3 ? '5%' : '86%'; gsap.to(tut, { opacity: 1, duration: .3 });
      Object.assign(toque.style, { width: w + 'px', height: w + 'px', margin: `${-w / 2}px 0 0 ${-w / 2}px` });
      /* as duas peças trocam de lugar e voltam, junto com o ponto de toque */
      const vai = (el, x, y) => el.firstChild.animate([{ translate: '0 0', offset: 0 }, { translate: `${x}px ${y}px`, offset: .38 }, { translate: `${x}px ${y}px`, offset: .72 }, { translate: '0 0', offset: 1 }], { duration: 1500, delay: 520, easing: 'cubic-bezier(.45, 0, .2, 1)' });
      anims = [vai(j[0].el, dx, dy), vai(j[1].el, -dx, -dy)];
      tlToque = gsap.timeline().set(toque, { x: a.x, y: a.y, opacity: 0, scale: 1.5 }).to(toque, { opacity: 1, scale: 1, duration: .28 }).to(toque, { scale: .8, duration: .12 }, '+=.1')
        .to(toque, { x: b.x, y: b.y, duration: .56, ease: 'power2.inOut' }).to(toque, { scale: 1.25, opacity: 0, duration: .3 }, '+=.45');
    };
    const inicia = () => { gsap.delayedCall(.7, () => m.demo()); gsap.delayedCall(2.4, () => { if (jogou) return; passo(); laco = setInterval(passo, 2800); }); };
    const tocou = () => { if (jogou) return; jogou = true; clearInterval(laco); if (tlToque) tlToque.kill(); gsap.to([toque, tut], { opacity: 0, duration: .2 }); apaga(); tab.classList.remove('tutor'); };
    const m = MiniMatch(tab, { aoTocar: tocou, aoCombinar(q, combo, els) {
      moedas += q * 5 * combo; const o = { v: +nEl.textContent };
      gsap.to(o, { v: moedas, duration: .5, onUpdate: () => { nEl.textContent = Math.round(o.v); } });
      gsap.fromTo(alvo, { scale: 1 }, { scale: 1.18, duration: .15, yoyo: true, repeat: 1 });
      msg.textContent = combo > 1 ? `Combo x${combo}!` : frases[Math.floor(Math.random() * frases.length)]; som('moeda', { combo });
      const a = alvo.getBoundingClientRect();
      els.slice(0, 3).forEach((el, i) => { const r = el.getBoundingClientRect(); const c = document.createElement('img'); c.src = 'assets/renova/moeda-junior-frente.webp'; c.style.cssText = `position:fixed;z-index:90;width:26px;height:26px;left:${r.left + r.width / 2 - 13}px;top:${r.top + r.height / 2 - 13}px;pointer-events:none`; document.body.appendChild(c); gsap.to(c, { x: a.left + 14 - (r.left + r.width / 2), y: a.top + 14 - (r.top + r.height / 2), scale: .5, duration: .6, delay: i * .06, ease: 'power2.in', onComplete: () => c.remove() }); });
      if (rv) { rv.src = 'assets/renova/renovinha-nb-comemora.webp'; clearTimeout(tr); tr = setTimeout(() => { rv.src = 'assets/renova/renovinha-nb-aponta.webp'; }, 1100); gsap.fromTo(rv, { y: 0 }, { y: -18, duration: .2, yoyo: true, repeat: 1, ease: 'power2.out' }); }
      if (primeira && G) { primeira = false; G.faixa.diz(G.NACHO, 'isso é de comer?', 2.4); }
      mb.style.width = Math.min(100, moedas / META * 100) + '%'; mn.textContent = `${Math.min(moedas, META)}/${META}`;
      if (moedas >= META && !fim) { fim = true; gsap.delayedCall(.9, venceu); }
    } });
    function venceu() {
      msg.textContent = 'Fase concluída!'; som('vitoria'); clearTimeout(tr); if (rv) rv.src = 'assets/renova/renovinha-nb-comemora.webp';
      const f = $('#vis-renova .fone').getBoundingClientRect();
      for (let i = 0; i < 16; i++) { const c = document.createElement('img'); c.src = 'assets/renova/moeda-junior-frente.webp'; const t = 22 + Math.random() * 26; c.style.cssText = `position:fixed;z-index:90;width:${t}px;height:${t}px;left:${f.left + f.width / 2}px;top:${f.top + f.height * .45}px;pointer-events:none`; document.body.appendChild(c); const a = Math.random() * Math.PI * 2, d = 140 + Math.random() * 240; gsap.to(c, { x: Math.cos(a) * d, y: Math.sin(a) * d - 80, rotation: Math.random() * 360, duration: .9, ease: 'power3.out' }); gsap.to(c, { y: '+=320', opacity: 0, duration: .8, delay: .85, ease: 'power2.in', onComplete: () => c.remove() }); }
      if (G) { G.faixa.corre(G.NACHO, 1); G.faixa.diz(G.NACHO, 'deixa que eu guardo!', 2.4); }
      gsap.delayedCall(2.6, () => { fase++; moedas = 0; fim = false; META += 50; fn.textContent = 'FASE ' + fase; nEl.textContent = '0'; mb.style.width = '0%'; mn.textContent = `0/${META}`; msg.textContent = 'Troque duas peças vizinhas'; if (rv) rv.src = 'assets/renova/renovinha-nb-aponta.webp'; m.monta(); });
    }
    new Image().src = 'assets/renova/renovinha-nb-comemora.webp';
    /* quando o tabuleiro aparece: joga uma vez sozinho e depois o dedo fica mostrando a próxima troca */
    ScrollTrigger.create({ trigger: tab, start: 'top 82%', end: 'bottom 10%', onToggle: (st) => { naTela = st.isActive; } });
    ScrollTrigger.create({ trigger: tab, start: 'top 72%', once: true, onEnter: inicia });
    if (!calmo) $$('.moeda-f', $('#vis-renova')).forEach((c, i) => { gsap.to(c, { y: +c.dataset.par, ease: 'none', scrollTrigger: { trigger: '.c-renova', start: 'top bottom', end: 'bottom top', scrub: true } }); gsap.to(c, { rotation: '+=14', duration: 2.4 + i * .5, yoyo: true, repeat: -1, ease: 'sine.inOut' }); });
    entra('.c-renova');
  }

  /* site dentro de uma janela: começa no topo e rola junto com a página */
  function janelaSite(img, barra, cfg) {
    const dist = () => Math.min(0, -(img.offsetHeight - img.parentElement.offsetHeight) * (cfg.ate || 1));
    img.addEventListener('load', () => ScrollTrigger.refresh());
    gsap.set(img, { y: 0 });
    const tl = gsap.timeline({ scrollTrigger: Object.assign({ scrub: .35, invalidateOnRefresh: true }, cfg.gatilho) });
    const espera = cfg.espera || 0;
    tl.to(img, { y: dist, ease: 'none', duration: 1 - espera }, espera);
    if (barra) tl.fromTo(barra, { scaleY: .04 }, { scaleY: cfg.ate || 1, ease: 'none', duration: 1 - espera }, espera);
    return tl;
  }

  /* ---------- 02 Good Green ---------- */
  function goodGreen() {
    const rolo = $('#gg-rolo'); if (!rolo) return;
    const janela = $('#vis-gg .janela');
    if (G && !G.calmo) { const cl = G.palco.cria(G.LUNA, { ponto: () => { const r = janela.getBoundingClientRect(); return { x: r.left + r.width * .17, y: r.top + 3 }; }, s: () => (innerWidth < 900 ? .3 : .44), pose: 'x1' }); cenaRolagem(cl, { trigger: '.c-gg', start: 'top 45%', endTrigger: '.c-nhv', end: 'top 60%' }); }
    entra('.c-gg');
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const tl = janelaSite(rolo, $('#gg-barra'), { ate: .2, espera: .1, gatilho: { trigger: '.c-gg', start: 'top top', end: '+=92%' } });
      tl.fromTo('#gg-fone', { yPercent: 26, rotation: 7 }, { yPercent: -8, rotation: -3, ease: 'none', duration: 1 }, 0).fromTo('#gg-garrafa', { yPercent: 12, rotation: -9 }, { yPercent: -6, rotation: 4, ease: 'none', duration: 1 }, 0);
    });
    mm.add('(max-width: 900px)', () => { janelaSite(rolo, $('#gg-barra'), { ate: .16, espera: .1, gatilho: { trigger: janela, start: 'top 24%', end: '+=60%' } }); });
  }

  /* ---------- 03 Rastreio ---------- */
  function rastreio() {
    const cpf = $('#cpf'); if (!cpf) return;
    const TXT = '529.982.247-25', o = { n: 0 }, passos = $$('#rast-l .passo'), selo = $('#selo'), fone = $('#vis-nhv .fone');
    let prog = 0, chegou = false, tocado = -1;
    if (G && !G.calmo) { const cc = G.palco.cria(G.ZORO, { ponto: () => { const r = fone.getBoundingClientRect(); return { x: r.right + r.width * .1, y: r.top + r.height * (.36 + .46 * prog) }; }, s: () => (innerWidth < 900 ? .5 : .66), pose: () => (chegou ? 'x9' : 'x8') }); cenaRolagem(cc, { trigger: '.c-nhv', start: 'top 45%', endTrigger: '.sobre', end: 'top 60%' }); }
    entra('.c-nhv');
    entra('.c-vira');
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    tl.to(o, { n: TXT.length, duration: 1.2, onUpdate: () => { cpf.textContent = TXT.slice(0, Math.round(o.n)); } })
      .add(() => $('#rast-b').classList.add('ok'), '+=.15').add(() => $('#rast-b').classList.remove('ok'), '+=.25')
      .to('#rast-p', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' })
      .to('#rast-l', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, '-=.15');
    /* a previsão e a etapa atual andam juntas com a linha do tempo: nunca "chega amanhã" com o pedido já entregue */
    const prev = $('#rast-p'), prevT = $('#rast-p b'), prevS = $('#rast-p small');
    const PREV = [['Previsão de entrega', 'Em até 5 dias úteis'], ['Previsão de entrega', 'Em até 4 dias úteis'], ['Previsão de entrega', 'Em até 3 dias úteis'], ['Previsão de entrega', 'Chega amanhã'], ['Pedido entregue', 'Chegou hoje, 14:32']];
    const marca = (i) => {
      passos.forEach((q, j) => { q.classList.toggle('on', j <= i); q.classList.toggle('atual', j === i && i < 4); });
      if (prevT) { prevS.textContent = PREV[Math.max(0, i)][0]; prevT.textContent = PREV[Math.max(0, i)][1]; prev.classList.toggle('ok', i === 4); }
    };
    passos.forEach((p, i) => { tl.add(() => { if (i > tocado) { tocado = i; som(i === 4 ? 'chegou' : 'passo'); } marca(i); chegou = i === 4; if (selo) selo.textContent = ['pedido recebido', 'pagamento aprovado', 'em separação', 'caixa a caminho', 'chegou!'][i]; }, `+=${i ? .55 : .2}`); });
    tl.to({}, { duration: .5 });
    const dur = tl.duration();
    const volta = () => { marca(-1); chegou = false; };
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const st = ScrollTrigger.create({ trigger: '.c-nhv', start: 'top top', end: '+=92%', scrub: .4, onUpdate: (s) => { prog = s.progress; const t = s.progress * dur, tras = t < tl.time(); if (tras) volta(); tl.time(0, true); tl.time(t, false); if (tras) tocado = passos.filter((p) => p.classList.contains('on')).length - 1; } });
      return () => st.kill();
    });
    mm.add('(max-width: 900px)', () => {
      const pr = { v: 0 };
      const roda = () => { volta(); tocado = -1; tl.restart(); gsap.fromTo(pr, { v: 0 }, { v: 1, duration: dur, ease: 'none', onUpdate: () => { prog = pr.v; } }); };
      const st = ScrollTrigger.create({ trigger: '#vis-nhv', start: 'top 65%', onEnter: roda, onEnterBack: roda });
      const iv = setInterval(() => { if (st.isActive) roda(); }, (dur + 3) * 1000);
      return () => { st.kill(); clearInterval(iv); };
    });
  }

  /* ---------- sobre ---------- */
  function sobre() {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => { gsap.set('.sobre', { marginTop: '-100vh' }); return () => gsap.set('.sobre', { clearProps: 'marginTop' }); });
    if (!G || G.calmo) return;
    /* os três sobem para os cartões da Supervisão */
    /* cada um tem uma rotina de poses (pose, milissegundos) que roda sozinha, e uma reação quando o mouse entra no cartão */
    const ROTINA = {
      luna: [['x1', 2600], ['5', 2200], ['x1', 1800], ['x6', 1400], ['n6', 700], ['x6', 1200], ['x4', 1500], ['n5', 900], ['x6', 900], ['5', 2400]],
      zoro: [['x8', 1800], ['x9', 520], ['x8', 380], ['x9', 520], ['x8', 2200], ['x9', 900], ['x8', 1600]],
      nacho: [['x9', 1300], ['x4', 600], ['x9', 500], ['x4', 600], ['x8', 900], ['x9', 1200], ['n5', 700], ['x9', 260], ['n5', 700], ['0', 1500], ['n6', 800], ['x1', 2200], ['x9', 900], ['x5', 650], ['x9', 700]],
    };
    const REACAO = { luna: [['n6', 700], ['x6', 900], ['x4', 800]], zoro: [['x9', 380], ['x8', 260]], nacho: [['x4', 380], ['x8', 380]] };
    const toca = (seq, t) => { const tot = seq.reduce((a, [, d]) => a + d, 0); let r = t % tot; for (const [p, d] of seq) { if (r < d) return p; r -= d; } return seq[0][0]; };
    [['.s-luna', G.LUNA, 'luna'], ['.s-zoro', G.ZORO, 'zoro'], ['.s-nacho', G.NACHO, 'nacho']].forEach(([sel, gato, quem]) => {
      const poses = { rotina: ROTINA[quem], reacao: REACAO[quem] }, t0 = Math.random() * 6000;
      const card = $(sel), lugar = card && $('.sup-g', card); if (!lugar) return; let em = false;
      card.addEventListener('pointerenter', () => { em = true; });
      card.addEventListener('pointerleave', () => { em = false; card.style.setProperty('--px', 0); card.style.setProperty('--py', 0); });
      /* o cenário tem profundidade: as camadas se deslocam conforme o mouse */
      if (fino) card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(); card.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); card.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
      const cs = G.palco.cria(gato, { ponto: () => { const r = lugar.getBoundingClientRect(); return { x: r.left, y: r.top }; }, s: () => card.getBoundingClientRect().width / 570 * .86, pose: () => (em ? toca(poses.reacao, performance.now()) : toca(poses.rotina, performance.now() + t0)) });
      cenaRolagem(cs, { trigger: '.sup', start: 'top 72%', end: 'bottom 24%' });
    });
  }

  /* ================= páginas de case ================= */
  function caso() {

  /* ---------- design system do Vira Cam: peças que reagem ao toque ---------- */
  (function vds() {
    const box = document.querySelector('.vds'); if (!box) return;
    box.querySelectorAll('.vds-seg button').forEach((b) => b.addEventListener('click', () => box.querySelectorAll('.vds-seg button').forEach((x) => x.classList.toggle('on', x === b))));
    const tog = box.querySelector('.vds-tog'); if (tog) tog.addEventListener('click', () => tog.classList.toggle('off'));
    const alvo = box.querySelector('#vdsAlvo'); if (!alvo) return;
    const S = 'cubic-bezier(.2,.8,.2,1)';
    const A = {
      toque: [[{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }], 260, 'cubic-bezier(.34,1.4,.64,1)'],
      cascata: [[{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], 480, S],
      visor: [[{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], 480, S],
      folha: [[{ opacity: .4, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], 240, S],
      aviso: [[{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], 200, S],
      ar: [[{ background: 'rgba(255,255,255,.08)' }, { background: '#fe2e4b' }, { background: 'rgba(255,255,255,.08)' }], 1600, 'ease-in-out'],
      conectou: [[{ borderColor: 'rgba(255,255,255,.18)', boxShadow: 'none' }, { borderColor: 'rgba(254,46,75,.9)', boxShadow: '0 18px 40px -14px rgba(254,46,75,.8)' }], 320, S],
    };
    box.querySelectorAll('.vds-m').forEach((b) => b.addEventListener('click', () => {
      box.querySelectorAll('.vds-m').forEach((x) => x.classList.toggle('on', x === b));
      const [k, d, e] = A[b.dataset.m]; alvo.lastChild.textContent = b.querySelector('b').textContent;
      alvo.animate(k, { duration: d, easing: e, fill: 'both' });
    }));
  })();
    /* nos cases os gatos não disputam a leitura: ao sair do topo eles descem e somem aos poucos, presos à rolagem; perto do fim voltam do mesmo jeito */
    if (G && G.faixa && G.faixa.el && $('.ch') && $('.volta')) {
      const fx = G.faixa.el, cel = innerWidth < 700, RAMPA = cel ? 160 : 520;
      ScrollTrigger.create({ trigger: '.ch', start: cel ? 'top top' : 'bottom 85%', endTrigger: '.volta', end: 'top bottom', onUpdate: (st) => {
        const total = st.end - st.start, px = st.progress * total, vis = 1 - Math.min(1, (cel ? total - px : Math.min(px, total - px)) / RAMPA);
        gsap.set(fx, { opacity: vis, y: (1 - vis) * 90, visibility: vis < .02 ? 'hidden' : 'visible' });
      }, onLeave: () => gsap.set(fx, { opacity: 1, y: 0, visibility: 'visible' }), onLeaveBack: () => { if (!cel) gsap.set(fx, { opacity: 1, y: 0, visibility: 'visible' }); } });
      if (cel) gsap.set(fx, { opacity: 0, y: 90, visibility: 'hidden' });
    }
    gsap.set(cortina, { yPercent: 0 }); gsap.to(cortina, { yPercent: -101, duration: .8, ease: 'power3.inOut', delay: .15, onComplete: () => gsap.set(cortina, { yPercent: 101 }) });
    const h = $('.ch h1');
    if (h) { linhas(h, { delay: .55 }); gsap.from(['.ch .rot', '.ch-d', '.meta'], { y: 24, opacity: 0, duration: .8, stagger: .08, delay: .9, ease: 'power3.out' }); }
    const arte = $('.ch-arte img'); if (arte && !calmo) { gsap.fromTo(arte, { scale: 1.1, transformOrigin: '100% 50%' }, { scale: 1, duration: 1.6, ease: 'power3.out' }); gsap.to(arte, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.ch', start: 'top top', end: 'bottom top', scrub: true } }); }
    /* cartões e figuras entram em escada */
    $$('.cards, .grade, .regras, .versoes, .numeros').forEach((gr) => gsap.from(gr.children, { y: 54, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: gr, start: 'top 84%' } }));
    $$('.fig-p').forEach((f) => gsap.fromTo(f, { y: 70, scale: .96 }, { y: -30, scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: .5 } }));
    /* telas de celular: retas, lado a lado, sobem em escada ao entrar */
    $$('.fita').forEach((ft) => gsap.from($$('.aparelho', ft), { y: 50, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: ft, start: 'top 85%' } }));
    /* site ao vivo (Good Green): o iframe carrega perto da tela e é desenhado na largura real do aparelho, reduzido para caber */
    $$('.vivo-c iframe').forEach((fr) => {
      const caixa = fr.parentElement, base = +fr.dataset.base || 1440;
      const ajusta = () => { const k = caixa.clientWidth / base; if (!k) return; fr.style.width = base + 'px'; fr.style.height = (caixa.clientHeight / k) + 'px'; fr.style.transform = `scale(${k})`; };
      new ResizeObserver(ajusta).observe(caixa); ajusta();
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { fr.src = fr.dataset.src; io.disconnect(); } }, { rootMargin: '600px 0px' });
      io.observe(caixa);
    });
    /* site de verdade dentro da janela e do celular: a página não prende mais. Rolar em cima da janela
       ou do celular percorre o site; rolar fora deles segue o case. O número mostra até onde a pessoa foi no site. */
    $$('.vitrine').forEach((v) => {
      const rot = $('.vitrine-p', v), barra = $('.barra-r i', v);
      if (barra) gsap.set(barra, { scaleY: .04 });
      $$('.janela-v, .vitrine-cel .fone-v', v).forEach((c) => {
        c.classList.add('livre');
        c.addEventListener('scroll', () => {
          const f = c.scrollTop / Math.max(1, c.scrollHeight - c.clientHeight);
          if (rot) rot.textContent = Math.round(f * 100) + '%';
          if (barra && c.classList.contains('janela-v')) gsap.set(barra, { scaleY: Math.max(.04, f) });
        }, { passive: true });
      });
    });
    /* rolar dentro do celular: quem rola com o cursor ou o dedo em cima da tela do aparelho
       assume o controle dela. A animação presa à página sai, a tela rola livre e, no fim dela, a rolagem volta para a página. */
    $$('.fone-v, .tela-a, .janela-v').forEach((caixa) => {
      const img = $('img', caixa); if (!img) return;
      let livre = false, alvo = 0;
      const solta = () => {
        if (livre) return; livre = true;
        const y = new DOMMatrixReadOnly(getComputedStyle(img).transform === 'none' ? undefined : getComputedStyle(img).transform).m42;
        gsap.getTweensOf(img).forEach((t) => t.kill());
        caixa.classList.add('livre'); gsap.set(img, { clearProps: 'transform' });
        if (y < 0) caixa.scrollTop = -y;
        alvo = caixa.scrollTop;
        /* na janela do computador, a barra de rolagem desenhada passa a seguir a rolagem dela */
        const br = caixa.closest('.janela') && $('.barra-r i', caixa.closest('.janela'));
        if (br) { gsap.getTweensOf(br).forEach((t) => t.kill()); const pinta = () => gsap.set(br, { scaleY: Math.max(.04, caixa.scrollTop / Math.max(1, caixa.scrollHeight - caixa.clientHeight)) }); caixa.addEventListener('scroll', pinta, { passive: true }); pinta(); }
      };
      caixa.addEventListener('wheel', (e) => {
        const max = caixa.scrollHeight - caixa.clientHeight; if (max < 4) return;
        solta();
        const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? caixa.clientHeight : 1);
        if ((d < 0 && caixa.scrollTop <= 0) || (d > 0 && caixa.scrollTop >= max - 1)) return; // na borda: a página segue
        e.preventDefault(); e.stopPropagation();
        alvo = Math.max(0, Math.min(max, (gsap.isTweening(caixa) ? alvo : caixa.scrollTop) + d));
        gsap.to(caixa, { scrollTop: alvo, duration: .45, ease: 'power2.out', overwrite: true });
      }, { passive: false });
      caixa.addEventListener('touchstart', () => { if (caixa.scrollHeight - caixa.clientHeight > 4) solta(); }, { passive: true });
    });
    /* protótipo: o iframe só entra quando a pessoa toca, numa tela de celular de 390 px reduzida para caber no aparelho */
    $$('.proto-v').forEach((v) => {
      const b = $('.proto-b', v); let fr = null;
      const ajusta = () => { if (!fr) return; const k = v.clientWidth / 390; fr.style.transform = `scale(${k})`; fr.style.height = (v.clientHeight / k) + 'px'; };
      b.addEventListener('click', () => {
        fr = document.createElement('iframe'); fr.src = v.dataset.src; fr.title = v.dataset.nome; fr.loading = 'lazy';
        fr.allow = v.dataset.allow || 'clipboard-write'; v.appendChild(fr); v.classList.add('on'); ajusta();
      });
      new ResizeObserver(ajusta).observe(v);
    });
    /* ampliar imagem */
    const luz = $('#luz');
    if (luz) { $$('figure.zoom img').forEach((im) => im.parentElement.addEventListener('click', () => { luz.innerHTML = `<img src="${im.dataset.cheia || im.currentSrc || im.src}" alt="">`; luz.classList.add('on'); luz.scrollTop = 0; lenis && lenis.stop(); })); const fecha = () => { luz.classList.remove('on'); lenis && lenis.start(); }; luz.addEventListener('click', fecha); addEventListener('keydown', (e) => { if (e.key === 'Escape') fecha(); }); }
    addEventListener('load', () => ScrollTrigger.refresh());
    let rt = 0; $$('img[loading=lazy]').forEach((im) => { if (!im.complete) im.addEventListener('load', () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 250); }, { once: true }); });
  }
})();
