/* Portfólio Matheus Saboia: animações e interações. */
(function () {
  const CONTATO = { whatsapp: 'https://wa.me/5519991463731', behance: 'https://www.behance.net/matheusboia', linkedin: '', email: '' };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap) { document.documentElement.classList.add('sem-js'); $('#abre') && $('#abre').remove(); return; }
  gsap.registerPlugin(ScrollTrigger);
  const G = window.Gatos, fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  const som = (n, o) => { if (window.Som) Som.toca(n, o); };
  const hero = $('#hero');

  /* ---------- som ---------- */
  const sb = $('#som-b');
  if (sb && window.Som) {
    /* 'ligar som' enquanto o navegador ainda não liberou o áudio: o primeiro clique só libera, não desliga */
    const pinta = () => { const on = Som.ligado; sb.setAttribute('aria-pressed', on ? 'true' : 'false'); sb.lastChild.textContent = !on ? 'sem som' : Som.pronto ? 'com som' : 'ligar som'; sb.classList.toggle('pede', on && !Som.pronto); };
    let pedia = false; pinta(); Som.quando(pinta);
    sb.addEventListener('pointerdown', () => { pedia = sb.classList.contains('pede'); });
    sb.addEventListener('click', () => { if (pedia) { pedia = false; Som.quando(() => { pinta(); Som.toca('pop'); }); return; } Som.alterna(); pinta(); if (Som.ligado) Som.quando(pinta); });
  }
  document.addEventListener('pointerover', (e) => { const a = e.target.closest && e.target.closest('a, button, [role=button]'); if (a && a !== document.sobre) { document.sobre = a; som('tique'); } if (!a) document.sobre = null; });
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a, button, [role=button]')) som('clique'); });

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
        if (g) { e = 'rotulo'; txt = g.classList.contains('pego') ? 'soltar' : 'pegar'; }
        else if (c) { e = 'rotulo'; txt = c.dataset.cur; }
        else if (alvo.closest('.peca')) e = 'medio';
        else if (alvo.closest('a, button, [role=button], figure.zoom')) e = 'grande';
      }
      const chave = e + txt; if (chave === estado) return; estado = chave;
      if (e === 'rotulo') { curR.innerHTML = txt; gsap.to(curR, { scale: 1, duration: .35, ease: 'back.out(2)' }); gsap.to(cur, { scale: 0, duration: .2 }); }
      else { gsap.to(curR, { scale: 0, duration: .22 }); gsap.to(cur, { scale: (e === 'grande' ? 3.6 : e === 'medio' ? 2 : 1) * (aperta ? .75 : 1), duration: .3, ease: 'power3.out' }); }
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
  if (nav) { addEventListener('scroll', () => { if (!navT) navT = requestAnimationFrame(corNav); const y = scrollY; nav.classList.toggle('some', y > 240 && y > yAnt + 2); if (y < yAnt - 2 || y <= 240) nav.classList.remove('some'); yAnt = y; }, { passive: true }); setTimeout(corNav, 60); setInterval(corNav, 900); }

  /* ---------- gatos ---------- */
  const abertura = !!(hero && $('#abre') && !calmo);
  if (G) G.faixa.inicia({ abertura });
  const cenaRolagem = (cena, cfg) => ScrollTrigger.create(Object.assign({ onToggle: (st) => G.palco.liga(cena, st.isActive) }, cfg));

  /* ---------- revelar ao rolar e títulos por linha ---------- */
  $$('[data-sobe]').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));
  function linhas(h, cfg) {
    h.innerHTML = h.innerHTML.split(/<br\s*\/?>/).map((l) => `<span class="lin-f"><span class="lin">${l}</span></span>`).join('');
    gsap.from($$('.lin', h), Object.assign({ yPercent: 112, duration: 1.05, stagger: .09, ease: 'power4.out' }, cfg));
  }
  $$('[data-linhas]').forEach((h) => linhas(h, { scrollTrigger: { trigger: h, start: 'top 86%' } }));
  function palavras(el, cfg) {
    const anda = (no) => [...no.childNodes].map((c) => c.nodeType === 3 ? c.textContent.split(/(\s+)/).map((p) => p.trim() ? `<span class="w">${p}</span>` : p).join('') : `<em>${anda(c)}</em>`).join('');
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

  if (hero) inicio(); else caso();

  /* ================= página inicial ================= */
  function inicio() {
    const abre = $('#abre'), n = $('#abre-n'), nome = $('.nome'), l1 = $('.nome .l1 .pal'), letras = $$('.nome .c');

    /* o nome ocupa a largura toda (ou 36% da altura da janela, o que for menor) */
    function ajusta() {
      const antes = nome.style.fontStretch; nome.style.fontStretch = '125%'; nome.style.fontSize = '100px';
      const w = l1.getBoundingClientRect().width, cs = getComputedStyle(hero), larg = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      nome.style.fontSize = Math.min(100 * larg / w * .992, innerHeight * (innerWidth < 900 ? .3 : .36)) + 'px'; nome.style.fontStretch = antes;
    }
    ajusta(); document.fonts.ready.then(ajusta); addEventListener('resize', ajusta);

    const zoro = window.HeroZoro && G && !G.calmo ? HeroZoro({ hero, G }) : null;
    const acende = () => {
      if (G) G.faixa.solta();
      if (zoro) { zoro.liga(true); ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom 45%', onToggle: (st) => zoro.liga(st.isActive) }); }
    };

    const miudos = $$('.hero-topo > *, .hero-pe > *');
    if (!abertura) { if (abre) abre.remove(); acende(); }
    else {
      gsap.set(letras, { yPercent: 118 }); gsap.set(miudos, { opacity: 0, y: 14 }); gsap.set(nome, { fontStretch: '78%' });
      gsap.set('.nome .pal', { display: 'inline-flex', overflow: 'hidden', paddingTop: '.2em', marginTop: '-.2em', paddingRight: '.06em' });
      lenis && lenis.stop();
      /* no escuro só aparecem os olhos, e são os olhos dos três gatos sentados no chão */
      const olhos = [];
      G && G.faixa.gatos.forEach((g) => {
        const par = (G.A[g.c].olhos || {})[g.nome]; if (!par) return;
        par.forEach(([ex, ey, ew, eh]) => { const o = document.createElement('i'); o.className = 'olho'; const w = Math.max(11, Math.max(ew, eh) * 1.25) * g.s * 2.1, h = w * .86; o.style.cssText = `left:${g.x + (ex - g.f[2] / 2) * g.s - w / 2}px;top:${G.faixa.chao - (g.f[3] - ey) * g.s - h / 2}px;width:${w}px;height:${h}px;animation-delay:${(Math.random() * 2.4).toFixed(2)}s`; o.innerHTML = '<b></b>'; abre.appendChild(o); olhos.push(o); });
      });
      const segue = (e) => olhos.forEach((o) => { const r = o.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, k = r.width * .2; o.firstChild.style.transform = `translate(${dx / d * k}px, ${dy / d * k * .6}px)`; });
      addEventListener('pointermove', segue, { passive: true });

      const conta = { v: 0 }, chama = $('#abre-c');
      gsap.to(conta, { v: 100, duration: 1.05, ease: 'power2.inOut', onUpdate: () => { n.textContent = String(Math.round(conta.v)).padStart(3, '0'); }, onComplete: () => {
        let foi = false, tm = 0;
        const vai = (e) => { if (foi) return; foi = true; clearTimeout(tm); removeEventListener('pointerdown', vai); removeEventListener('keydown', vai); if (e && window.Som) Som.quando(() => som('luz')); gsap.to(chama, { opacity: 0, duration: .12 }); acendeLuz.play(); };
        if (chama) { chama.textContent = (fino ? 'clique' : 'toque') + ' para acender a luz'; gsap.to(chama, { opacity: 1, duration: .5 }); }
        addEventListener('pointerdown', vai); addEventListener('keydown', vai); tm = setTimeout(vai, 6000);
      } });
      const acendeLuz = gsap.timeline({ paused: true })
        .to(abre, { opacity: .2, duration: .05 }, .08).to(abre, { opacity: 1, duration: .08 }).to(abre, { opacity: .08, duration: .05 }).to(abre, { opacity: 1, duration: .1 })
        .to(abre, { opacity: 0, duration: .32, ease: 'power2.out' })
        .add(() => { removeEventListener('pointermove', segue); abre.remove(); lenis && lenis.start(); acende(); })
        .to(nome, { fontStretch: '125%', duration: 1.25, ease: 'power4.out' }, '-=.25')
        .to(letras, { yPercent: 0, duration: 1.05, stagger: .04, ease: 'power4.out' }, '<')
        .to(miudos, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out' }, '-=.6')
        .add(() => { gsap.set('.nome .pal', { overflow: 'visible' }); gsap.set(nome, { clearProps: 'fontStretch' }); });
    }

    /* letras do nome sobem quando o cursor passa perto */
    if (!calmo && fino) {
      const ls = letras.map((el) => ({ el, y: gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' }) }));
      hero.addEventListener('pointermove', (e) => { if ($('#abre')) return; ls.forEach((l) => { const r = l.el.getBoundingClientRect(); const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); l.y(-Math.max(0, 1 - d / 260) * 26); }); });
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
    const m = MiniMatch(tab, { aoCombinar(q, combo, els) {
      moedas += q * 5 * combo; const o = { v: +nEl.textContent };
      gsap.to(o, { v: moedas, duration: .5, onUpdate: () => { nEl.textContent = Math.round(o.v); } });
      gsap.fromTo(alvo, { scale: 1 }, { scale: 1.18, duration: .15, yoyo: true, repeat: 1 });
      msg.textContent = combo > 1 ? `Combo x${combo}!` : frases[Math.floor(Math.random() * frases.length)]; som('moeda', { combo });
      const a = alvo.getBoundingClientRect();
      els.slice(0, 3).forEach((el, i) => { const r = el.getBoundingClientRect(); const c = document.createElement('img'); c.src = 'assets/renova/moeda-junior-frente.webp'; c.style.cssText = `position:fixed;z-index:90;width:26px;height:26px;left:${r.left + r.width / 2 - 13}px;top:${r.top + r.height / 2 - 13}px;pointer-events:none`; document.body.appendChild(c); gsap.to(c, { x: a.left + 14 - (r.left + r.width / 2), y: a.top + 14 - (r.top + r.height / 2), scale: .5, duration: .6, delay: i * .06, ease: 'power2.in', onComplete: () => c.remove() }); });
      if (rv) { rv.src = 'assets/renova/renovinha-nb-comemora.webp'; clearTimeout(tr); tr = setTimeout(() => { rv.src = 'assets/renova/renovinha-nb-aponta.webp'; }, 1100); gsap.fromTo(rv, { y: 0 }, { y: -18, duration: .2, yoyo: true, repeat: 1, ease: 'power2.out' }); }
      if (primeira && G) { primeira = false; G.faixa.diz(G.NACHO, 'moedas?!', 2.2); }
      mb.style.width = Math.min(100, moedas / META * 100) + '%'; mn.textContent = `${Math.min(moedas, META)}/${META}`;
      if (moedas >= META && !fim) { fim = true; gsap.delayedCall(.9, venceu); }
    } });
    function venceu() {
      msg.textContent = 'Fase concluída!'; som('vitoria'); clearTimeout(tr); if (rv) rv.src = 'assets/renova/renovinha-nb-comemora.webp';
      const f = $('#vis-renova .fone').getBoundingClientRect();
      for (let i = 0; i < 16; i++) { const c = document.createElement('img'); c.src = 'assets/renova/moeda-junior-frente.webp'; const t = 22 + Math.random() * 26; c.style.cssText = `position:fixed;z-index:90;width:${t}px;height:${t}px;left:${f.left + f.width / 2}px;top:${f.top + f.height * .45}px;pointer-events:none`; document.body.appendChild(c); const a = Math.random() * Math.PI * 2, d = 140 + Math.random() * 240; gsap.to(c, { x: Math.cos(a) * d, y: Math.sin(a) * d - 80, rotation: Math.random() * 360, duration: .9, ease: 'power3.out' }); gsap.to(c, { y: '+=320', opacity: 0, duration: .8, delay: .85, ease: 'power2.in', onComplete: () => c.remove() }); }
      if (G) { G.faixa.corre(G.NACHO, 1); G.faixa.diz(G.NACHO, 'é tudo meu!', 2.4); }
      gsap.delayedCall(2.6, () => { fase++; moedas = 0; fim = false; META += 50; fn.textContent = 'FASE ' + fase; nEl.textContent = '0'; mb.style.width = '0%'; mn.textContent = `0/${META}`; msg.textContent = 'Troque duas peças vizinhas'; if (rv) rv.src = 'assets/renova/renovinha-nb-aponta.webp'; m.monta(); });
    }
    new Image().src = 'assets/renova/renovinha-nb-comemora.webp';
    ScrollTrigger.create({ trigger: '.c-renova', start: 'top 30%', once: true, onEnter: () => gsap.delayedCall(.9, () => m.demo()) });
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
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    tl.to(o, { n: TXT.length, duration: 1.2, onUpdate: () => { cpf.textContent = TXT.slice(0, Math.round(o.n)); } })
      .add(() => $('#rast-b').classList.add('ok'), '+=.15').add(() => $('#rast-b').classList.remove('ok'), '+=.25')
      .to('#rast-p', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' })
      .to('#rast-l', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, '-=.15');
    passos.forEach((p, i) => { tl.add(() => { if (i > tocado) { tocado = i; som(i === 4 ? 'chegou' : 'passo'); } p.classList.add('on'); chegou = i === 4; if (selo) selo.textContent = ['pedido recebido', 'pagamento aprovado', 'em separação', 'caixa a caminho', 'chegou!'][i]; }, `+=${i ? .55 : .2}`); });
    tl.to({}, { duration: .5 });
    const dur = tl.duration();
    const volta = () => { passos.forEach((p) => p.classList.remove('on')); chegou = false; };
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
    [['.s-luna', G.LUNA, ['x6', 'x4']], ['.s-zoro', G.ZORO, ['x8', 'x9']], ['.s-nacho', G.NACHO, ['x4', 'x8']]].forEach(([sel, gato, poses]) => {
      const card = $(sel), lugar = card && $('.sup-g', card); if (!lugar) return; let em = false;
      card.addEventListener('pointerenter', () => { em = true; });
      card.addEventListener('pointerleave', () => { em = false; card.style.setProperty('--px', 0); card.style.setProperty('--py', 0); });
      /* o cenário tem profundidade: as camadas se deslocam conforme o mouse */
      if (fino) card.addEventListener('pointermove', (e) => { const r = card.getBoundingClientRect(); card.style.setProperty('--px', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); card.style.setProperty('--py', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
      const cs = G.palco.cria(gato, { ponto: () => { const r = lugar.getBoundingClientRect(); return { x: r.left, y: r.top }; }, s: () => card.getBoundingClientRect().width / 570 * .86, pose: () => (em && Math.floor(performance.now() / 380) % 2 ? poses[1] : poses[0]) });
      cenaRolagem(cs, { trigger: '.sup', start: 'top 72%', end: 'bottom 24%' });
    });
  }

  /* ================= páginas de case ================= */
  function caso() {
    gsap.set(cortina, { yPercent: 0 }); gsap.to(cortina, { yPercent: -101, duration: .8, ease: 'power3.inOut', delay: .15, onComplete: () => gsap.set(cortina, { yPercent: 101 }) });
    const h = $('.ch h1');
    if (h) { linhas(h, { delay: .55 }); gsap.from(['.ch .rot', '.ch-d', '.meta'], { y: 24, opacity: 0, duration: .8, stagger: .08, delay: .9, ease: 'power3.out' }); }
    const arte = $('.ch-arte img'); if (arte && !calmo) { gsap.fromTo(arte, { scale: 1.14 }, { scale: 1, duration: 2, ease: 'power3.out' }); gsap.to(arte, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.ch', start: 'top top', end: 'bottom top', scrub: true } }); }
    /* cartões e figuras entram em escada */
    $$('.cards, .grade, .regras, .versoes, .numeros').forEach((gr) => gsap.from(gr.children, { y: 54, opacity: 0, duration: .9, stagger: .09, ease: 'power3.out', scrollTrigger: { trigger: gr, start: 'top 84%' } }));
    $$('.fig-p').forEach((f) => gsap.fromTo(f, { y: 70, scale: .96 }, { y: -30, scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: .5 } }));
    /* fita: os celulares passam de lado enquanto a página rola */
    const mm = gsap.matchMedia();
    $$('.fita').forEach((ft) => {
      const tr = $('.fita-t', ft);
      mm.add('(min-width: 901px)', () => { const d = () => -(tr.scrollWidth - ft.clientWidth + parseFloat(getComputedStyle(ft).paddingLeft) * 2); gsap.to(tr, { x: d, ease: 'none', scrollTrigger: { trigger: ft, start: 'center center', end: () => '+=' + Math.abs(d()) * 1.1, pin: true, scrub: .5, invalidateOnRefresh: true, anticipatePin: 1 } }); });
      $$('.aparelho', ft).forEach((a, i) => gsap.from(a, { y: 80 + (i % 2) * 50, opacity: 0, duration: 1, delay: i * .06, ease: 'power3.out', scrollTrigger: { trigger: ft, start: 'top 80%' } }));
    });
    /* site de verdade dentro da janela, preso no meio da tela enquanto rola do topo até o fim */
    $$('.vitrine').forEach((v) => {
      const img = $('.janela-v img', v), barra = $('.barra-r i', v), rot = $('.vitrine-p', v);
      mm.add('(min-width: 901px)', () => { const tl = janelaSite(img, barra, { gatilho: { trigger: v, start: 'top top', end: () => '+=' + Math.min(3600, Math.max(900, (img.offsetHeight || 3000) * .5)), pin: true, anticipatePin: 1, onUpdate: (s) => { if (rot) rot.textContent = Math.round(s.progress * 100) + '%'; } } }); const cel = $('.vitrine-cel img', v); if (cel) tl.to(cel, { y: () => Math.min(0, -(cel.offsetHeight - cel.parentElement.offsetHeight)), ease: 'none' }, 0); });
      mm.add('(max-width: 900px)', () => { janelaSite(img, barra, { ate: .6, gatilho: { trigger: v, start: 'top 12%', end: '+=120%', onUpdate: (s) => { if (rot) rot.textContent = Math.round(s.progress * 100) + '%'; } } }); });
    });
    /* ampliar imagem */
    const luz = $('#luz');
    if (luz) { $$('figure.zoom img').forEach((im) => im.parentElement.addEventListener('click', () => { luz.innerHTML = `<img src="${im.dataset.cheia || im.currentSrc || im.src}" alt="">`; luz.classList.add('on'); luz.scrollTop = 0; lenis && lenis.stop(); })); const fecha = () => { luz.classList.remove('on'); lenis && lenis.start(); }; luz.addEventListener('click', fecha); addEventListener('keydown', (e) => { if (e.key === 'Escape') fecha(); }); }
    addEventListener('load', () => ScrollTrigger.refresh());
    let rt = 0; $$('img[loading=lazy]').forEach((im) => { if (!im.complete) im.addEventListener('load', () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 250); }, { once: true }); });
  }
})();
