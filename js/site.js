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
    /* a previsão e a etapa atual andam juntas com a linha do tempo: nunca "chega amanhã" com o pedido já entregue (print dele, 16/11) */
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
    /* Supervisão: cada gato vive no próprio cenário. Tem uma rotina (anda, pula, dorme, sobe na janela)
       e reage aos objetos que a pessoa toca (pedido dele, 17/11: "os gatos fazendo mais coisas, os itens interativos").
       Coordenadas em unidades do cenário: 160 de largura, 100 de altura, medidas na camada do meio. */
    const PARA = {};
    const quadro = () => new Promise((r) => requestAnimationFrame(r));
    const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
    const sorte = (a) => a[Math.floor(Math.random() * a.length)];
    const anima = (el, k, o) => (el && el.animate ? el.animate(k, Object.assign({ fill: 'forwards' }, typeof o === 'number' ? { duration: o } : o)) : null);
    const cenario = (sel, c, cfg) => {
      const card = $(sel); if (!card) return;
      const m = $('.cam.m', card), g = G.faixa.gatos[c];
      const st = { x: cfg.casa[0], y: cfg.casa[1], p: cfg.pose, esq: !!cfg.esq, k: 1 };
      let ficha = 0, ocupado = 0;
      const tela = (x, y) => { const r = m.getBoundingClientRect(); return { x: r.left + x * r.width / 160, y: r.top + y * r.height / 100 }; };
      const cena = G.palco.cria(c, {
        ponto: () => tela(st.x, st.y), s: () => card.getBoundingClientRect().width / 570 * .86 * st.k,
        pose: () => st.p, vira: () => st.esq, aoSair: () => { g.el.style.clipPath = ''; },
      });
      const aqui = () => cena.ativo && g.ancora === cena;
      const vivo = (t) => { if (t !== ficha || !cena.ativo) throw PARA; };
      const tempo = async (ms, f, t) => { const t0 = performance.now(); for (;;) { vivo(t); const u = Math.min(1, (performance.now() - t0) / ms); if (f) f(u); if (u >= 1) return; await quadro(); } };
      const a = {
        st, card,
        espera: (ms, t) => tempo(ms, null, t),
        pose: (p, ms, t) => { st.p = p; return tempo(ms, null, t); },
        vai: (x, y, ms, t) => { const x0 = st.x, y0 = st.y; return tempo(ms, (u) => { const k = u * u * (3 - 2 * u); st.x = x0 + (x - x0) * k; st.y = y0 + (y - y0) * k; }, t); },
        olha: (x) => { if (Math.abs(x - st.x) > .5) st.esq = x < st.x; },
        diz: (txt, seg = 1.6) => { if (aqui()) g.diz(txt, seg); },
        sobe: (txt, cor = '#e8563a') => { if (aqui()) g.sobe(txt, cor); },
        /* anda ou corre em linha reta, trocando os quadros pela distância percorrida */
        anda: async (x, y, t, o = {}) => {
          const x0 = st.x, y0 = st.y, d = Math.hypot(x - x0, (y - y0) * 1.6); if (d < .6) return;
          const v = o.corre ? 62 : 21, passo = o.corre ? 5.2 : 2.6, q = o.corre ? 'r' : 'w';
          st.esq = x < x0;
          await tempo(d / v * 1000, (u) => { st.x = x0 + (x - x0) * u; st.y = y0 + (y - y0) * u; st.p = q + (Math.floor(d * u / passo) % 8); }, t);
        },
        /* pulo em arco: agacha, sobe esticado, cai e amortece */
        pula: async (x, y, t, o = {}) => {
          const x0 = st.x, y0 = st.y, H = (o.alto != null ? o.alto : 7) + Math.abs(y - y0) * .55;
          if (Math.abs(x - x0) > 1) st.esq = x < x0;
          st.p = 'n7'; if (aqui()) g.amassa(.8); await tempo(150, null, t);
          if (aqui()) g.amassa(1.12);
          const ms = o.ms || 380 + Math.hypot(x - x0, y - y0) * 4.5;
          await tempo(ms, (u) => {
            st.x = x0 + (x - x0) * u; st.y = y0 + (y - y0) * u - 4 * H * u * (1 - u);
            const sobe = (y - y0) - 4 * H * (1 - 2 * u) < 0;
            st.p = Math.abs(x - x0) < 6 || (sobe && y < y0 - 6) ? '4' : '3';
          }, t);
          st.p = 'n7'; if (aqui()) g.amassa(.74); await tempo(140, null, t);
        },
      };
      a.ir = async (x, y, t, o = {}) => { if (Math.abs(y - st.y) > 4) await a.pula(x, y, t, o); else await a.anda(x, y, t, o); };

      /* rotina sozinha; um toque interrompe e o gato reage; depois a rotina recomeça de onde ele estiver */
      const reage = async (fn) => {
        const t = ++ficha; ocupado = t;
        try { await fn(a, t); } catch (e) { if (e !== PARA) throw e; }
        if (ocupado === t) ocupado = 0;
      };
      (async () => {
        for (;;) {
          if (ocupado || !cena.ativo) { await dormir(250); continue; }
          const t = ficha, f = cfg.segue && a.em ? cfg.segue : cfg.rotina;
          try { await f(a, t); } catch (e) { if (e !== PARA) throw e; await dormir(30); }
          await quadro();
        }
      })();
      card.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && cfg.segue) { a.em = true; if (!ocupado) ficha++; } });
      card.addEventListener('pointerleave', () => { if (cfg.segue) { a.em = false; if (!ocupado) ficha++; } });
      card.addEventListener('pointermove', (e) => {
        const r = m.getBoundingClientRect(); a.mx = (e.clientX - r.left) / r.width * 160;
        /* o cenário tem profundidade: as camadas se deslocam conforme o mouse */
        if (fino) { const q = card.getBoundingClientRect(); card.style.setProperty('--px', ((e.clientX - q.left) / q.width * 2 - 1).toFixed(3)); card.style.setProperty('--py', ((e.clientY - q.top) / q.height * 2 - 1).toFixed(3)); }
      }, { passive: true });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--px', 0); card.style.setProperty('--py', 0); });

      /* o que fica na frente (caixa, tigela) esconde a parte do gato que está atrás dela */
      if (cfg.frente) {
        let ligado = false;
        const corta = () => {
          if (g.ancora === cena && g.modo === 'preso') {
            const r = m.getBoundingClientRect(), ux = r.width / 160, uy = r.height / 100, O = '-5000px -5000px';
            const furos = cfg.frente.map(([x0, y0, x1, y1]) => { const l = (x0 * ux + r.left - g.x).toFixed(1), d = (x1 * ux + r.left - g.x).toFixed(1), tp = (y0 * uy + r.top - g.y).toFixed(1), b = (y1 * uy + r.top - g.y).toFixed(1); return `${l}px ${tp}px,${d}px ${tp}px,${d}px ${b}px,${l}px ${b}px,${l}px ${tp}px,${O}`; });
            g.el.style.clipPath = `polygon(evenodd,${O},5000px -5000px,5000px 5000px,-5000px 5000px,${O},${furos.join(',')})`; ligado = true;
          } else if (ligado) { g.el.style.clipPath = ''; ligado = false; }
          requestAnimationFrame(corta);
        };
        requestAnimationFrame(corta);
      }

      /* objetos: cada área de toque chama a reação do cenário */
      const botoes = [...card.querySelectorAll('.sup-i')];
      botoes.forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation(); card.dataset.mexeu = '1'; botoes.forEach((x) => x.classList.remove('dica'));
        const fn = cfg.toque[b.dataset.i]; if (fn) fn(a, reage, b);
      }));
      /* sinal de que dá para tocar: um anel acende num objeto de cada vez até a primeira vez que a pessoa mexe */
      let vez = Math.floor(Math.random() * botoes.length);
      setInterval(() => {
        if (card.dataset.mexeu || !cena.ativo || !botoes.length) return;
        botoes.forEach((x) => x.classList.remove('dica')); const b = botoes[vez++ % botoes.length]; void b.offsetWidth; b.classList.add('dica');
      }, 2600);
      cenaRolagem(cena, { trigger: '.sup', start: 'top 72%', end: 'bottom 24%' });
      return a;
    };

    /* ---------- Luna: quarto à noite ---------- */
    {
      const card = $('.s-luna'); let pisca = null, nx = 0, rx = 0;
      const ALMOFADA = [42, 86], CHAO = 91, PEITORIL = [104, 55.5];
      const casa = async (a, t) => { if (Math.hypot(a.st.x - ALMOFADA[0], a.st.y - ALMOFADA[1]) > 2) { if (a.st.y < 80) await a.pula(80, CHAO, t); await a.anda(64, CHAO - 1, t); await a.pula(ALMOFADA[0], ALMOFADA[1], t, { alto: 4 }); } };
      const janela = async (a, t) => { if (a.st.y > 70) { await a.ir(84, CHAO, t); await a.pula(PEITORIL[0], PEITORIL[1], t); } a.st.esq = false; };
      const luz = (on) => { const off = card && $('.abajur-off', card), brilho = card && $('.luz-abajur', card); if (off) off.setAttribute('opacity', on ? 0 : 1); if (brilho) brilho.style.opacity = on ? '' : 0; };
      if (card) cenario('.s-luna', G.LUNA, {
        casa: ALMOFADA, pose: '5',
        rotina: async (a, t) => {
          await casa(a, t);
          await a.pose(sorte(['5', 'x1']), 5500 + Math.random() * 3000, t);
          await a.pose('n6', 900, t); await a.pose('x6', 1800, t);
          const r = Math.random();
          if (r < .4) {
            await a.pose('7', 1000, t); await janela(a, t);
            await a.pose('x5', 3200, t); await a.pose('0', 1400, t); await a.pose('n5', 1600, t);
          } else if (r < .7) { await a.pose('n5', 2000, t); await a.pose('x6', 1500, t); }
          else { await a.pose('6', 1600, t); await a.pose('x0', 1300, t); await a.pose('x6', 1200, t); }
        },
        toque: {
          /* o abajur pisca até ela levantar e dar um tapa nele: "se ela levanta, tem coisa piscando demais" */
          abajur: (a, reage) => {
            if (pisca) return; let on = true;
            pisca = setInterval(() => { on = !on; luz(on); }, 140);
            const fim = () => { clearInterval(pisca); pisca = null; luz(true); };
            setTimeout(() => { if (pisca) fim(); }, 6000);
            reage(async (a, t) => {
              a.diz('!'); await a.pose('n6', 600, t);
              if (a.st.y < 70) await a.pula(80, CHAO, t);
              await a.ir(56, CHAO, t); a.st.esq = false;
              await a.pose('n8', 380, t); fim(); a.sobe('♥'); await a.pose('n8', 400, t);
              await a.pose('x2', 900, t); await casa(a, t); await a.pose('5', 600, t);
            });
          },
          /* o novelo rola; ela corre atrás, pula em cima e brinca de barriga para cima */
          novelo: (a, reage, b) => {
            const ob = $('[data-o="novelo"]', card), de = nx; nx = nx > -10 ? -26 : 0;
            anima(ob, [{ transform: `translateX(${de * .625}%)` }, { transform: `translateX(${nx * .625}%) rotate(${nx < de ? -8 : 8}deg)`, offset: .7 }, { transform: `translateX(${nx * .625}%)` }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.3,1)' });
            b.style.translate = `${nx * 100 / 18}% 0`;
            reage(async (a, t) => {
              const x = 134 + nx;
              if (a.st.y < 80) await a.pula(Math.min(a.st.x + 20, x - 14), CHAO, t);
              await a.anda(x - 16, CHAO, t, { corre: true }); await a.pula(x - 4, CHAO, t, { alto: 9 });
              a.sobe('♥'); await a.pose('6', 1500, t); await a.pose('x0', 1100, t); await a.pose('x6', 1200, t);
            });
          },
          /* o ratinho apita e escorrega; ela agacha, mira e dá o bote */
          rato: (a, reage, b) => {
            const ob = $('[data-o="rato"]', card), de = rx; rx = rx > -4 ? -12 : 0;
            anima(ob, [{ transform: `translate(${de * .625}%, 0)` }, { transform: `translate(${(de + (rx - de) * .5) * .625}%, -3%)`, offset: .35 }, { transform: `translate(${rx * .625}%, 0)` }], { duration: 650, easing: 'ease-out' });
            b.style.translate = `${rx * 100 / 15}% 0`;
            reage(async (a, t) => {
              const x = 100 + rx; a.diz('?');
              if (a.st.y < 80) await a.pula(Math.max(a.st.x - 24, 60), CHAO, t);
              await a.anda(x > a.st.x ? x - 26 : x + 26, CHAO, t); a.olha(x);
              await a.pose('n4', 1100, t); await a.pose('7', 420, t);
              await a.pula(x + (a.st.x < x ? -5 : 5), CHAO, t, { alto: 11 });
              await a.pose('x2', 1000, t); a.diz('prrr'); await a.pose('0', 900, t);
            });
          },
          /* estrela cadente: ela sobe no peitoril para ver */
          janela: (a, reage) => {
            const s = card && $('.cadente', card);
            if (s) anima(s, [{ transform: 'translate(122px, 12px)', opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .7 }, { transform: 'translate(96px, 26px)', opacity: 0 }], { duration: 1300, easing: 'ease-in' });
            reage(async (a, t) => { await a.pose('n6', 500, t); await janela(a, t); await a.pose('x5', 2600, t); a.sobe('♥', '#fff3c4'); await a.pose('x5', 1400, t); await a.pose('0', 900, t); });
          },
        },
      });
    }

    /* ---------- Zoro: depósito. Mora na caixa da frente e só a cabeça aparece ---------- */
    {
      const card = $('.s-zoro'); let fx = 0, px = 0;
      const BORDA = 83, NA = [132, 97], FUNDO = [132, 116], CHAO = 91;
      const dentro = (a) => a.st.x > 117 && a.st.x < 147 && a.st.y > BORDA + 4;
      const sai = async (a, t, x = 104) => { if (dentro(a)) { a.st.p = 'g5'; await a.vai(a.st.x, NA[1], 260, t); await a.pula(x, CHAO, t, { alto: 10 }); } else if (a.st.y < 80) await a.pula(Math.max(30, Math.min(110, a.st.x)), CHAO, t); };
      const entra = async (a, t) => { if (!dentro(a)) { await a.ir(108, CHAO, t); await a.pula(NA[0], NA[1], t, { alto: 14 }); } };
      const treme = (el, n = 3, d = .6) => anima(el, Array.from({ length: n * 2 + 1 }, (_, i) => ({ transform: i === n * 2 ? 'none' : `translate(${(i % 2 ? -d : d)}%, 0)` })), { duration: n * 90, fill: 'none' });
      if (card) cenario('.s-zoro', G.ZORO, {
        casa: NA, pose: 'g5', frente: [[117.5, BORDA, 146.5, 140]],
        rotina: async (a, t) => {
          await entra(a, t);
          a.st.p = 'g5'; await a.vai(a.st.x, FUNDO[1], 420, t); await a.espera(1200 + Math.random() * 1800, t);
          await a.vai(a.st.x, NA[1], 380, t); await a.espera(900, t);
          await a.pose('g1', 900, t); a.olha(100); await a.pose('g0', 800, t);
          const r = Math.random();
          if (r < .35) { a.st.p = 'g5'; await a.vai(a.st.x, FUNDO[1], 300, t); await a.espera(700, t); a.st.p = 'g6'; await a.vai(a.st.x, NA[1] - 2, 200, t); a.diz('!'); await a.espera(900, t); }
          else if (r < .7) {
            await sai(a, t); await a.anda(64, 90, t); await a.pose('d5', 2600, t); await a.pose('7', 900, t);
            await a.anda(56, 66, t); await a.pula(44.5, 59.5, t); await a.pose('g5', 1400, t); a.diz('opa'); await a.pose('x4', 1100, t);
            await a.pula(60, CHAO, t); await a.anda(100, CHAO, t);
          } else {
            await sai(a, t); await a.anda(96, CHAO, t); a.olha(88); await a.pose('g3', 500, t); await a.pose('g2', 500, t); await a.pose('g3', 500, t); await a.pose('0', 900, t);
          }
        },
        toque: {
          caixa: (a, reage) => {
            treme($('.cam.p > img', card));
            reage(async (a, t) => {
              if (dentro(a)) { a.st.p = 'g5'; await a.vai(a.st.x, FUNDO[1], 220, t); await a.espera(500, t); a.st.p = 'g6'; await a.vai(a.st.x, NA[1] - 4, 180, t); a.diz('!'); await a.espera(1000, t); await a.pose('g5', 800, t); }
              else { a.diz('caixa?'); await entra(a, t); await a.pose('g6', 700, t); }
            });
          },
          fita: (a, reage, b) => {
            const ob = $('[data-o="fita"]', card), de = fx; fx = fx > -10 ? -24 : 0;
            anima(ob, [{ transform: `translateX(${de * .625}%)` }, { transform: `translateX(${fx * .625}%)` }], { duration: 900, easing: 'cubic-bezier(.2,.7,.3,1)' });
            b.style.translate = `${fx * 100 / 21}% 0`;
            reage(async (a, t) => {
              const x = 88 + fx; await sai(a, t, 104);
              await a.anda(x + 18, CHAO, t, { corre: true }); await a.pula(x + 4, CHAO, t, { alto: 10 });
              a.diz('pega'); await a.pose('d4', 1300, t); await a.pose('d7', 900, t); await a.pose('g5', 700, t);
            });
          },
          pingo: (a, reage, b) => {
            const ob = $('.pingo', card), de = px; px = px > -20 ? -46 : 0;
            anima(ob, [{ transform: `translateX(${de}px)` }, { transform: `translateX(${px}px)` }], { duration: 1200, easing: 'cubic-bezier(.15,.7,.3,1)' });
            b.style.translate = `${px * 100 / 11}% 0`;
            reage(async (a, t) => {
              const x = 108 + px; await sai(a, t, 104);
              await a.anda(x + 9, CHAO, t, { corre: true }); a.olha(x); await a.pose('g3', 420, t); a.diz('uhuul'); await a.pose('g2', 500, t); await a.pose('0', 900, t);
            });
          },
          /* os pingos dos is caem da prateleira e ele derruba de vez */
          pingos: (a, reage) => {
            [...card.querySelectorAll('.pingo-cai')].forEach((el, i) => {
              const dx = [-30, -12, 8][i], ms = 900 + i * 140;
              anima(el, [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${dx * .5}px, 49px)`, opacity: 1, offset: .55, easing: 'ease-in' }, { transform: `translate(${dx * .8}px, 42px)`, opacity: 1, offset: .72, easing: 'ease-out' }, { transform: `translate(${dx}px, 49px)`, opacity: 1, offset: .86 }, { transform: `translate(${dx}px, 49px)`, opacity: 0 }], { duration: ms + 1600, delay: i * 120, fill: 'none' });
            });
            reage(async (a, t) => {
              await sai(a, t, 104); await a.anda(96, CHAO, t, { corre: true }); a.olha(80);
              await a.pose('g3', 400, t); await a.pose('g2', 400, t); await a.pose('g3', 400, t); a.diz('opa'); await a.pose('x4', 1000, t);
            });
          },
          /* a lâmpada falha e ele arrepia */
          luz: (a, reage) => {
            anima($('.apaga', card), [0, .9, .2, .95, .95, 0].map((o) => ({ opacity: o })), { duration: 1500, easing: 'steps(1)', fill: 'none' });
            reage(async (a, t) => {
              await a.espera(250, t);
              if (dentro(a)) await a.vai(a.st.x, NA[1] - 3, 160, t);
              a.st.p = 'g6'; a.diz('!'); await a.espera(1500, t); await a.pose('g1', 700, t);
            });
          },
          /* caixa nova: ele vai testar */
          caixinha: (a, reage) => {
            reage(async (a, t) => { a.diz('caixa?'); await sai(a, t, 100); await a.anda(58, 88, t, { corre: true }); await a.pula(44.5, 59.5, t); await a.pose('g5', 900, t); await a.pose('x4', 1200, t); });
          },
        },
      });
    }

    /* ---------- Nacho: cozinha de manhã. Segue o cursor como quem tem comida ---------- */
    {
      const card = $('.s-nacho'); let cheio = false;
      const SOL = [46, 93], TIGELA = [77, 91.5], PEITORIL = [38, 50.5], CHAO = 92;
      const desce = async (a, t) => { if (a.st.y < 80) await a.pula(Math.min(a.st.x + 18, 70), CHAO, t); };
      const come = async (a, t) => {
        await desce(a, t); await a.anda(TIGELA[0], TIGELA[1], t, { corre: true }); a.st.esq = false;
        a.diz('nham!'); await a.pose('n4', 1500, t); a.sobe('♥'); await a.pose('n4', 1500, t);
        cheio = false; anima($('.monte', card), [{ opacity: 1 }, { opacity: 0 }], 600);
        await a.pose('x8', 1100, t); await a.pose('x0', 1600, t);
      };
      if (card) cenario('.s-nacho', G.NACHO, {
        casa: SOL, pose: 'x0',
        rotina: async (a, t) => {
          if (cheio) return come(a, t);
          await desce(a, t); await a.ir(SOL[0], SOL[1], t); await a.pose('x0', 3500 + Math.random() * 2000, t);
          await a.pose('n6', 900, t);
          const r = Math.random();
          if (r < .4) { await a.anda(TIGELA[0], TIGELA[1], t); a.st.esq = false; await a.pose('n4', 1300, t); await a.pose('x4', 400, t); a.diz(sorte(['ração?', 'vazia...', 'fome...'])); await a.pose('x4', 1400, t); await a.pose('x9', 1200, t); }
          else if (r < .7) { await a.anda(54, CHAO, t); await a.pula(PEITORIL[0], PEITORIL[1], t); a.st.esq = true; await a.pose('x0', 3800, t); await a.pose('n5', 1600, t); await a.pula(60, CHAO, t); }
          else { await a.pose('x7', 300, t); a.diz('miaaau'); await a.pose('x7', 1300, t); await a.pose('n5', 1800, t); }
        },
        /* com o mouse no cartão ele anda até onde o cursor está e fica olhando */
        segue: async (a, t) => {
          await desce(a, t);
          for (;;) {
            const x = Math.max(22, Math.min(140, a.mx || a.st.x)), d = x - a.st.x;
            if (Math.abs(d) > 5) await a.anda(a.st.x + Math.sign(d) * Math.min(9, Math.abs(d)), CHAO, t, { corre: Math.abs(d) > 40 });
            else { a.olha(a.st.x + (a.st.esq ? -1 : 1)); await a.pose(Math.random() < .02 ? 'x4' : 'x9', 120, t); }
          }
        },
        toque: {
          /* a ração voa do pacote para a tigela */
          racao: (a, reage) => {
            const voa = $('.voa', card); if (!voa) return;
            for (let i = 0; i < 12; i++) {
              const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'), x1 = 97 + Math.random() * 16, y1 = 80 + Math.random() * 2.5, sx = 70 + Math.random() * 4, sy = 46;
              r.setAttribute('width', 2); r.setAttribute('height', 1.5); r.setAttribute('fill', i % 3 ? '#c7651c' : '#e58a3a'); voa.appendChild(r);
              const k = Array.from({ length: 9 }, (_, j) => { const u = j / 8; return { transform: `translate(${sx + (x1 - sx) * u}px, ${sy + (y1 - sy) * u - 26 * u * (1 - u) * 4 * .5}px) rotate(${u * 360}deg)` }; });
              const an = anima(r, k, { duration: 700, delay: i * 55, easing: 'linear', fill: 'both' }); if (an) an.onfinish = () => r.remove();
            }
            setTimeout(() => { cheio = true; anima($('.monte', card), [{ opacity: 0 }, { opacity: 1 }], 300); }, 900);
            reage(async (a, t) => { a.diz('!'); await a.espera(500, t); await come(a, t); });
          },
          /* a torrada pula alto e ele se assusta */
          torradeira: (a, reage) => {
            anima($('.torrada', card), [{ transform: 'translateY(5px)' }, { transform: 'translateY(-24px)', offset: .35, easing: 'ease-in' }, { transform: 'translateY(-24px)', offset: .5 }, { transform: 'translateY(5px)', easing: 'ease-in' }], { duration: 1100, easing: 'ease-out', fill: 'none' });
            reage(async (a, t) => { await a.espera(250, t); a.diz('!'); await a.pula(a.st.x, a.st.y, t, { alto: 12 }); await a.pose('x9', 1200, t); await a.pose('x5', 900, t); });
          },
          /* os ponteiros correm: hora da ração */
          relogio: (a, reage) => {
            const p = $('.pont', card), an = p && p.getAnimations ? p.getAnimations()[0] : null;
            if (an) { an.playbackRate = 40; setTimeout(() => { an.playbackRate = 1; }, 1300); }
            reage(async (a, t) => { await a.espera(600, t); await a.pose('x7', 300, t); a.diz('hora da ração!', 2); await a.pose('x7', 1400, t); await a.pose('x4', 1000, t); });
          },
          tigela: (a, reage) => {
            reage(async (a, t) => {
              if (cheio) return come(a, t);
              await desce(a, t); await a.anda(TIGELA[0], TIGELA[1], t, { corre: true }); a.st.esq = false;
              await a.pose('n4', 1100, t); await a.pose('x4', 300, t); a.diz('vazia...'); await a.pose('x4', 1400, t); await a.pose('x9', 1000, t);
            });
          },
        },
      });
    }
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
    /* fita de celulares: passam de lado com a rolagem; o do meio vem para a frente e os dos lados recuam e giram */
    const mm = gsap.matchMedia();
    $$('.fita').forEach((ft) => {
      const tr = $('.fita-t', ft), aps = $$('.aparelho', ft), corpos = aps.map((a) => a.firstElementChild);
      const info = document.createElement('div'); info.className = 'fita-i px'; info.innerHTML = `<span>01</span><i><b></b></i><span>${String(aps.length).padStart(2, '0')}</span>`; ft.insertBefore(info, tr);
      const num = info.firstChild, barra = $('b', info);
      const foco = (prog) => {
        const meio = innerWidth / 2, larg = innerWidth < 900 ? innerWidth * .62 : innerWidth * .5, peq = innerWidth < 900; let perto = 0, menor = 9;
        aps.forEach((a, i) => {
          const r = a.getBoundingClientRect(), d = Math.max(-1.3, Math.min(1.3, (r.left + r.width / 2 - meio) / larg)), k = Math.min(1, Math.abs(d));
          if (Math.abs(d) < menor) { menor = Math.abs(d); perto = i; }
          gsap.set(corpos[i], { scale: 1 - k * (peq ? .1 : .13), rotation: d * (peq ? 3 : 5), y: k * k * (peq ? 14 : 44), transformOrigin: '50% 62%' });
          a.style.setProperty('--f', (1 - k * .6).toFixed(2));
        });
        num.textContent = String(perto + 1).padStart(2, '0'); barra.style.transform = `scaleX(${Math.max(.04, prog).toFixed(3)})`;
      };
      mm.add('(min-width: 901px)', () => {
        const d = () => -(tr.scrollWidth - ft.clientWidth + parseFloat(getComputedStyle(ft).paddingLeft) * 2);
        gsap.to(tr, { x: d, ease: 'none', onUpdate() { foco(this.progress()); }, scrollTrigger: { trigger: ft, start: 'center center', end: () => '+=' + Math.abs(d()) * 1.15, pin: true, scrub: .9, invalidateOnRefresh: true, anticipatePin: 1, onRefresh: () => foco(0) } });
        foco(0);
      });
      mm.add('(max-width: 900px)', () => {
        const rola = () => foco(ft.scrollLeft / Math.max(1, ft.scrollWidth - ft.clientWidth));
        ft.addEventListener('scroll', rola, { passive: true }); rola(); addEventListener('load', rola);
        return () => ft.removeEventListener('scroll', rola);
      });
      aps.forEach((a, i) => gsap.from(a, { y: 90 + (i % 2) * 40, opacity: 0, duration: 1, delay: i * .07, ease: 'power3.out', scrollTrigger: { trigger: ft, start: 'top 82%' } }));
    });
    /* site de verdade dentro da janela e do celular (pedido dele, 16/11): a página não prende mais. Rolar em cima da janela
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
    /* rolar dentro do celular (pedido dele, 16/11): quem rola com o cursor ou o dedo em cima da tela do aparelho
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
        fr.allow = 'clipboard-write'; v.appendChild(fr); v.classList.add('on'); ajusta();
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
