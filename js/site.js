/* Portfólio Matheus Saboia: animações e interações. */
(function () {
  const CONTATO = { behance: 'https://www.behance.net/matheusboia', linkedin: '', email: '' };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const temG = !!window.gsap;
  if (!temG) { document.documentElement.classList.add('sem-js'); $('#abre') && $('#abre').remove(); return; }
  gsap.registerPlugin(ScrollTrigger);
  const G = window.Gatos, grande = matchMedia('(min-width: 901px)');
  const seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  /* som: botão na navegação e sons de interface */
  const som = (n, o) => { if (window.Som) Som.toca(n, o); };
  const sb = $('#som-b');
  if (sb && window.Som) { const pinta = () => { sb.setAttribute('aria-pressed', Som.ligado ? 'true' : 'false'); sb.lastChild.textContent = Som.ligado ? 'som' : 'mudo'; }; pinta(); sb.addEventListener('click', () => { Som.alterna(); pinta(); }); }
  $$('a.btn, .nav-l a, .prox, .hero-lista a').forEach((el) => { el.addEventListener('pointerenter', () => som('tique')); el.addEventListener('click', () => som('clique')); });

  /* rolagem suave */
  let lenis = null;
  if (window.Lenis && !calmo) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const al = $(a.getAttribute('href')); if (!al) return; e.preventDefault(); lenis ? lenis.scrollTo(al, { duration: 1.4 }) : al.scrollIntoView({ behavior: 'smooth' }); }));

  /* troca de página com cortina na cor do destino */
  const cortina = $('#cortina');
  $$('a[data-vai]').forEach((a) => a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || calmo) return; e.preventDefault();
    cortina.style.background = a.dataset.vai || '#15120f'; som('cortina');
    gsap.fromTo(cortina, { yPercent: 101 }, { yPercent: 0, duration: .6, ease: 'power3.inOut', onComplete: () => { location.href = a.href; } });
  }));
  addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(cortina, { yPercent: 101 }); });

  /* cursor */
  const cur = $('#cur'), curR = $('#cur-r');
  if (cur && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const qx = gsap.quickTo(cur, 'x', { duration: .12 }), qy = gsap.quickTo(cur, 'y', { duration: .12 });
    const rx = gsap.quickTo(curR, 'x', { duration: .35, ease: 'power3' }), ry = gsap.quickTo(curR, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', (e) => { qx(e.clientX); qy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    $$('[data-cur]').forEach((el) => {
      el.addEventListener('pointerenter', () => { curR.innerHTML = el.dataset.cur; gsap.to(curR, { scale: 1, duration: .35, ease: 'back.out(2)' }); gsap.to(cur, { scale: 0, duration: .2 }); });
      el.addEventListener('pointerleave', () => { gsap.to(curR, { scale: 0, duration: .25 }); gsap.to(cur, { scale: 1, duration: .2 }); });
    });
  }

  /* cor da navegação conforme a seção que está por baixo dela */
  const nav = $('.nav'); let navT = 0;
  function corNav() { navT = 0; const els = document.elementsFromPoint(innerWidth / 2, 34); for (const el of els) { const d = el.closest && el.closest('[data-nav]'); if (d) { nav.classList.toggle('claro', d.dataset.nav === 'claro'); break; } } }
  let yAnt = 0;
  if (nav) { addEventListener('scroll', () => { if (!navT) navT = requestAnimationFrame(corNav); const y = scrollY; nav.classList.toggle('some', y > 240 && y > yAnt + 2); if (y < yAnt - 2 || y <= 240) nav.classList.remove('some'); yAnt = y; }, { passive: true }); setTimeout(corNav, 60); setInterval(corNav, 900); }

  /* gatos no pé da janela */
  if (G) G.faixa.inicia();

  /* revelar ao rolar */
  $$('[data-sobe]').forEach((el) => gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  /* contato */
  const cl = $('#contato-l');
  if (cl) {
    const itens = [['Behance', CONTATO.behance], ['LinkedIn', CONTATO.linkedin], ['E-mail', CONTATO.email && 'mailto:' + CONTATO.email]].filter((i) => i[1]);
    cl.innerHTML = itens.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n} ${seta}</a>`).join('');
    const t = $('#contato-t span');
    if (t) t.innerHTML = t.innerHTML.split('<br>').map((l) => [...l].map((c) => `<span class="c">${c}</span>`).join('')).join('<br>');
    gsap.from('#contato-t .c', { yPercent: 110, opacity: 0, duration: .8, stagger: .035, ease: 'power4.out', scrollTrigger: { trigger: '#contato-t', start: 'top 80%' } });
    /* o Nacho dorme em cima do "m" do título */
    if (G && window.medeLetra && t) document.fonts.ready.then(() => {
      const cs = $$('#contato-t .c'), acha = (ch, n = 0) => cs.filter((c) => c.textContent === ch)[n];
      const poe = (el, ch, gato, pose, vira) => {
        if (!el) return; const m = medeLetra(el, ch), sp = document.createElement('span');
        sp.style.cssText = `position:absolute;left:50%;top:${m.base - m.asc + m.fs * .012}px;translate:-50% -100%;pointer-events:none;letter-spacing:0;line-height:0`;
        el.style.position = 'relative'; el.appendChild(sp);
        const api = G.cena(sp, gato, pose, { s: m.fs * .46 / (window.GATOS_ATLAS[gato].sit || 180), respira: true, vira });
        gsap.set(sp, { autoAlpha: 0 });
        const cn = G.palco.cria(gato, { entra: () => gsap.fromTo(sp, { autoAlpha: 0, y: -m.fs * .4 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'bounce.out' }), sai: () => gsap.to(sp, { autoAlpha: 0, duration: .2 }) });
        ScrollTrigger.create({ trigger: '#contato-t', start: 'top 62%', end: 'bottom top', onToggle: (st) => G.palco.liga(cn, st.isActive) });
        return api;
      };
      const l = poe(acha('m'), 'm', G.NACHO, '5');
      if (l) { const z = document.createElement('span'); z.className = 'zzz'; z.style.color = '#b9e33b'; z.textContent = 'z'; l.el.parentElement.appendChild(z); }
    });
  }

  /* ================= página inicial ================= */
  const hero = $('#hero');
  if (hero) inicio();
  else { gsap.set(cortina, { yPercent: 0, background: getComputedStyle(document.body).getPropertyValue('--cor') || '#15120f' }); gsap.to(cortina, { yPercent: -101, duration: .8, ease: 'power3.inOut', delay: .15, onComplete: () => gsap.set(cortina, { yPercent: 101 }) }); caso(); }

  function inicio() {
    const abre = $('#abre'), n = $('#abre-n');
    const letras = $$('.nome .c');
    gsap.set(letras, { yPercent: 115 });
    gsap.set(['.hero-topo', '.hero-pe'], { opacity: 0 });
    gsap.set('.nome .pal', { display: 'inline-flex', overflow: 'hidden', paddingTop: '.2em', marginTop: '-.2em', paddingRight: '.06em' });

    /* o nome ocupa a largura toda (ou 36% da altura da janela, o que for menor) */
    const nome = $('.nome'), l1 = $('.nome .l1 .pal');
    function ajusta() { nome.style.fontSize = '100px'; const w = l1.getBoundingClientRect().width, cs = getComputedStyle(hero), larg = hero.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); nome.style.fontSize = Math.min(100 * larg / w * .992, innerHeight * (innerWidth < 900 ? .3 : .36)) + 'px'; }
    ajusta(); document.fonts.ready.then(ajusta); addEventListener('resize', ajusta);

    const zoro = window.HeroZoro ? HeroZoro({ hero, G, calmo }) : { gag() {}, voltou() {} };

    const conta = { v: 0 };
    const tl = gsap.timeline();
    if (calmo) { abre.remove(); gsap.set(letras, { yPercent: 0 }); gsap.set(['.hero-topo', '.hero-pe'], { opacity: 1 }); gsap.set('.nome .pal', { overflow: 'visible' }); }
    else {
      tl.to(conta, { v: 100, duration: .85, ease: 'power2.inOut', onUpdate: () => { n.textContent = String(Math.round(conta.v)).padStart(3, '0'); } })
        .to('.par i', { scaleY: .06, duration: .16, stagger: .05 }, '-=.1')
        .add(() => som('luz')).to(abre, { yPercent: -100, duration: .75, ease: 'power4.inOut' })
        .add(() => abre.remove())
        .to(letras, { yPercent: 0, duration: 1.05, stagger: .045, ease: 'power4.out' }, '-=.55')
        .to(['.hero-topo', '.hero-pe'], { opacity: 1, duration: .7, stagger: .08 }, '-=.6')
        .add(() => { gsap.set('.nome .pal', { overflow: 'visible' }); })
        .add(() => document.fonts.ready.then(() => zoro.gag()), '-=.9');
    }

    /* letras do nome sobem quando o cursor passa perto */
    if (!calmo && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const ls = letras.map((el) => ({ el, y: gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' }) }));
      let livre = false; tl.add(() => { livre = true; });
      hero.addEventListener('pointermove', (e) => { if (!livre) return; ls.forEach((l) => { const r = l.el.getBoundingClientRect(); const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); l.y(-Math.max(0, 1 - d / 260) * 26); }); });
      hero.addEventListener('pointerleave', () => ls.forEach((l) => l.y(0)));
    }

    /* o Zoro das letras é o mesmo do pé da janela: enquanto o nome aparece, ele fica aqui em cima */
    const zw = $('#zoro');
    if (G && zw && !calmo) { const cz = G.palco.cria(G.ZORO, { entra: () => { zw.style.visibility = 'visible'; }, sai: () => { zw.style.visibility = 'hidden'; } }); G.palco.liga(cz, true); ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom 45%', onToggle: (st) => G.palco.liga(cz, st.isActive) }); }
    ScrollTrigger.create({ trigger: hero, start: 'bottom 40%', onEnterBack: () => zoro.voltou() });

    /* nome reage à rolagem */
    if (!calmo) { gsap.to('.nome', { y: -70, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }); gsap.to(['.hero-topo', '.hero-pe'], { opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '40% top', scrub: true } }); }

    /* manifesto: palavras acendem */
    const mt = $('#mani-t');
    if (mt) {
      const anda = (no) => [...no.childNodes].map((c) => c.nodeType === 3 ? c.textContent.split(/(\s+)/).map((p) => p.trim() ? `<span class="w">${p}</span>` : p).join('') : `<em>${anda(c)}</em>`).join('');
      mt.innerHTML = anda(mt);
      gsap.to('#mani-t .w', { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: mt, start: 'top 82%', end: 'bottom 45%', scrub: .4 } });
    }
    $$('[data-conta]').forEach((b) => { const fim = +b.dataset.conta, o = { v: 0 }; gsap.to(o, { v: fim, duration: 1.6, ease: 'power3.out', onUpdate: () => { b.textContent = Math.round(o.v); }, scrollTrigger: { trigger: b, start: 'top 88%' } }); });

    /* letreiro */
    const let_ = $('#letreiro');
    if (let_ && !calmo) { let_.innerHTML += let_.innerHTML + let_.innerHTML; const larg = let_.scrollWidth / 3; const tw = gsap.to(let_, { x: -larg, duration: 26, ease: 'none', repeat: -1 }); ScrollTrigger.create({ onUpdate: (s) => { const v = Math.abs(s.getVelocity()) / 400; gsap.to(tw, { timeScale: 1 + Math.min(v, 5), duration: .3, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 1.2, delay: .3 }); } }); }

    jogo(); goodGreen(); rastreio(); sobre();
    if (lenis) ScrollTrigger.create({ onUpdate: (s) => { const v = s.getVelocity(); if (Math.abs(v) > 2600 && G) G.faixa.corre(G.ZORO, v > 0 ? 1 : -1); } });
    addEventListener('load', () => ScrollTrigger.refresh());
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
    const vis = $('#vis-renova');
    if (!calmo) $$('.moeda-f', vis).forEach((c, i) => { gsap.to(c, { y: +c.dataset.par, ease: 'none', scrollTrigger: { trigger: '.c-renova', start: 'top bottom', end: 'bottom top', scrub: true } }); gsap.to(c, { rotation: '+=14', duration: 2.4 + i * .5, yoyo: true, repeat: -1, ease: 'sine.inOut' }); });
    entra('.c-renova');
  }

  function entra(sel) {
    const s = $(sel); if (!s) return;
    const h = $('h3', s); h.innerHTML = h.innerHTML.split(/<br\s*\/?>/).map((l) => `<span style="display:block;overflow:hidden;padding:.12em 0 .06em;margin:-.12em 0 -.06em"><span class="lin" style="display:block">${l}</span></span>`).join('');
    gsap.from($$('.lin', s), { yPercent: 110, duration: 1, stagger: .09, ease: 'power4.out', scrollTrigger: { trigger: s, start: 'top 55%' } });
    gsap.from([$('.caso-n', s), $('.caso-d', s), $('.tags', s), $('.btn', s)], { y: 26, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 50%' } });
    gsap.from($('.caso-vis', s), { y: 80, opacity: 0, scale: .94, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 50%' } });
  }

  /* ---------- 02 Good Green ---------- */
  function goodGreen() {
    const rolo = $('#gg-rolo'); if (!rolo) return;
    const lj = $('#luna-janela'); if (G && lj) { G.cena(lj, G.LUNA, 'x1', { s: innerWidth < 900 ? .32 : .46, respira: true }); gsap.set(lj, { autoAlpha: 0 }); const cl = G.palco.cria(G.LUNA, { entra: () => gsap.fromTo(lj, { autoAlpha: 0, y: -22 }, { autoAlpha: 1, y: 0, duration: .5, ease: 'bounce.out' }), sai: () => gsap.to(lj, { autoAlpha: 0, duration: .2 }) }); ScrollTrigger.create({ trigger: '.c-gg', start: 'top 45%', endTrigger: '.c-nhv', end: 'top 55%', onToggle: (st) => G.palco.liga(cl, st.isActive) }); const z = document.createElement('span'); z.className = 'zzz'; z.style.color = '#78f624'; z.textContent = 'z'; lj.appendChild(z); }
    entra('.c-gg');
    const dist = () => Math.min(0, -(rolo.offsetHeight - rolo.parentElement.offsetHeight) * .62); rolo.addEventListener('load', () => ScrollTrigger.refresh());
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      gsap.timeline({ scrollTrigger: { trigger: '.c-gg', start: 'top top', end: '+=125%', scrub: .5, invalidateOnRefresh: true } })
        .to(rolo, { y: dist, ease: 'none' }, 0)
        .fromTo('#gg-fone', { yPercent: 30, rotation: 8 }, { yPercent: -8, rotation: -3, ease: 'none' }, 0)
        .fromTo('#gg-garrafa', { yPercent: 14, rotation: -10 }, { yPercent: -6, rotation: 4, ease: 'none' }, 0);
    });
    mm.add('(max-width: 900px)', () => { gsap.to(rolo, { y: dist, ease: 'none', scrollTrigger: { trigger: '#vis-gg', start: 'top 80%', end: 'bottom 20%', scrub: .5, invalidateOnRefresh: true } }); });
  }

  /* ---------- 03 Rastreio ---------- */
  function rastreio() {
    const cpf = $('#cpf'); if (!cpf) return;
    const TXT = '529.982.247-25', o = { n: 0 }, passos = $$('#rast-l .passo'), cz = $('#caixa-zoro'), selo = $('#selo');
    const zoro = G && G.cena(cz, G.ZORO, 'x8', { s: innerWidth < 900 ? .5 : .66 });
    if (G) { gsap.set(cz, { autoAlpha: 0 }); const cc = G.palco.cria(G.ZORO, { entra: () => gsap.to(cz, { autoAlpha: 1, duration: .3 }), sai: () => gsap.to(cz, { autoAlpha: 0, duration: .2 }) }); ScrollTrigger.create({ trigger: '.c-nhv', start: 'top 45%', endTrigger: '.sobre', end: 'top 55%', onToggle: (st) => G.palco.liga(cc, st.isActive) }); }
    entra('.c-nhv');
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    tl.to(o, { n: TXT.length, duration: 1.2, onUpdate: () => { cpf.textContent = TXT.slice(0, Math.round(o.n)); } })
      .add(() => $('#rast-b').classList.add('ok'), '+=.15').add(() => $('#rast-b').classList.remove('ok'), '+=.25')
      .to('#rast-p', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' })
      .to('#rast-l', { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, '-=.15');
    let tocado = -1;
    passos.forEach((p, i) => { tl.add(() => { if (i > tocado) { tocado = i; som(i === 4 ? 'chegou' : 'passo'); } p.classList.add('on'); if (selo) selo.textContent = ['pedido recebido', 'pagamento aprovado', 'em separação', 'caixa a caminho', 'chegou!'][i]; if (zoro) zoro.pose(i === 4 ? 'x9' : 'x8'); }, `+=${i ? .55 : .2}`); });
    tl.to({}, { duration: .5 });
    gsap.set(cz, { yPercent: -40 });
    const dur = tl.duration();
    const volta = () => { passos.forEach((p) => p.classList.remove('on')); if (zoro) zoro.pose('x8'); };
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => {
      const st = ScrollTrigger.create({ trigger: '.c-nhv', start: 'top top', end: '+=115%', scrub: .4, onUpdate: (s) => { const t = s.progress * dur, tras = t < tl.time(); if (tras) volta(); tl.time(0, true); tl.time(t, false); if (tras) tocado = passos.filter((p) => p.classList.contains('on')).length - 1; } });
      gsap.fromTo(cz, { yPercent: -40 }, { yPercent: 190, ease: 'none', scrollTrigger: { trigger: '.c-nhv', start: 'top top', end: '+=115%', scrub: .4 } });
      return () => st.kill();
    });
    mm.add('(max-width: 900px)', () => {
      const roda = () => { volta(); tocado = -1; tl.restart(); gsap.fromTo(cz, { yPercent: -40 }, { yPercent: 190, duration: dur, ease: 'none' }); };
      const st = ScrollTrigger.create({ trigger: '#vis-nhv', start: 'top 65%', onEnter: roda, onEnterBack: roda });
      const iv = setInterval(() => { if (st.isActive) roda(); }, (dur + 3) * 1000);
      return () => { st.kill(); clearInterval(iv); };
    });
  }

  /* ---------- sobre ---------- */
  function sobre() {
    if (!G) return;
    const s = innerWidth < 900 ? .72 : .86;
    const a = $('#sup-luna') && G.cena($('#sup-luna'), G.LUNA, 'x6', { s, respira: true }), b = $('#sup-zoro') && G.cena($('#sup-zoro'), G.ZORO, 'x8', { s, respira: true }), c = $('#sup-nacho') && G.cena($('#sup-nacho'), G.NACHO, 'x4', { s, respira: true });
    [['#sup-luna', G.LUNA], ['#sup-zoro', G.ZORO], ['#sup-nacho', G.NACHO]].forEach(([id, gato], i) => { const el = $(id); if (!el) return; gsap.set(el, { autoAlpha: 0 }); const cs = G.palco.cria(gato, { entra: () => gsap.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .5, delay: i * .08, ease: 'back.out(2)' }), sai: () => gsap.to(el, { autoAlpha: 0, duration: .2 }) }); ScrollTrigger.create({ trigger: '.sup', start: 'top 78%', end: 'bottom 22%', onToggle: (st) => G.palco.liga(cs, st.isActive) }); });
    const troca = (card, api, ns, f) => { if (!card || !api) return; card.addEventListener('pointerenter', () => api.ciclo(ns, f)); card.addEventListener('pointerleave', () => api.pose(ns[0])); };
    troca($('.s-luna'), a, ['x6', 'x4', 'x4', 'x6'], 2.5); troca($('.s-zoro'), b, ['x8', 'x9', 'x8', 'x9'], 4); troca($('.s-nacho'), c, ['x4', 'x8', 'x4', 'x7'], 3);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', () => { gsap.set('.sobre', { marginTop: '-100vh' }); return () => gsap.set('.sobre', { clearProps: 'marginTop' }); });
    ScrollTrigger.create({ trigger: '.contato', start: 'top 60%', onEnter: () => { if (G) { G.faixa.acorda(); G.faixa.diz(G.NACHO, 'chama ele!', 2.4); } } });
  }

  /* ================= páginas de case ================= */
  function caso() {
    const h = $('.ch h1');
    if (h) { h.innerHTML = h.innerHTML.split(/<br\s*\/?>/).map((l) => `<span style="display:block;overflow:hidden;padding:.14em 0 .08em;margin:-.14em 0 -.08em"><span class="lin" style="display:block">${l}</span></span>`).join(''); gsap.from('.ch .lin', { yPercent: 112, duration: 1.1, stagger: .1, ease: 'power4.out', delay: .55 }); gsap.from(['.ch-volta', '.ch .rot', '.ch-d', '.meta'], { y: 24, opacity: 0, duration: .8, stagger: .08, delay: .9, ease: 'power3.out' }); }
    const arte = $('.ch-arte img'); if (arte && !calmo) { gsap.fromTo(arte, { scale: 1.14 }, { scale: 1, duration: 2, ease: 'power3.out' }); gsap.to(arte, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.ch', start: 'top top', end: 'bottom top', scrub: true } }); }
    $$('.gal figure, .telas figure, .card, .rolo').forEach((f) => gsap.from(f, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: f, start: 'top 90%' } }));
    $$('.rolo').forEach((r) => { const im = $('img', r); im.addEventListener('load', () => ScrollTrigger.refresh()); gsap.to(im, { y: () => Math.min(0, -(im.offsetHeight - r.offsetHeight)), ease: 'none', scrollTrigger: { trigger: r, start: 'top 70%', end: 'bottom 10%', scrub: .6, invalidateOnRefresh: true } }); });
    const luz = $('#luz');
    if (luz) { $$('.gal figure img').forEach((im) => im.parentElement.addEventListener('click', () => { luz.innerHTML = `<img src="${im.currentSrc || im.src}" alt="">`; luz.classList.add('on'); luz.scrollTop = 0; lenis && lenis.stop(); })); luz.addEventListener('click', () => { luz.classList.remove('on'); lenis && lenis.start(); }); addEventListener('keydown', (e) => { if (e.key === 'Escape') luz.click(); }); }
    $$('[data-gato]').forEach((el) => { const [c, q, s] = el.dataset.gato.split(','); G && G.cena(el, +c, q, { s: +s || .5 }); });
    addEventListener('load', () => ScrollTrigger.refresh());
  }
})();
