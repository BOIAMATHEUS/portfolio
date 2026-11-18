/* Introdução do hero: a página abre como um arquivo de design em baixa fidelidade
   (barras no lugar do nome e dos textos, gatos como imagens por carregar) e o cursor
   passa de "wireframe" para "contorno" e "final". Dura perto de 2 segundos e não pede clique.
   O contorno é uma cópia do nome passada por um filtro que deixa só a borda da forma inteira
   (sem traço cruzando onde as letras se encostam). O preenchimento é a tinta se espalhando
   a partir do ponto em que o cursor clica.
   Uso: Intros.wire({ nome, letras, miudos, G, som, revela, fim }). o.revela() é chamado quando o nome ganha tinta
   (é quando o Zoro entra pulando pelo lado) e o.fim() quando a prancheta termina de sair. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const novo = (pai, tag, cls, html) => { const d = document.createElement(tag); d.className = cls; if (html) d.innerHTML = html; pai.appendChild(d); return d; };
  const QUADRO = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4.5 1.5v13M11.5 1.5v13M1.5 4.5h13M1.5 11.5h13"/></svg>';
  const pula = (G, c, v) => { const g = G && G.faixa.gatos[c]; if (g && g.modo === 'chao') { g.vy = -v; g.modo = 'ar'; g.amassa(1.12); } };

  function wire(o) {
    const { nome, som, G } = o, tl = gsap.timeline();
    const rs = $$('.nome .pal').map((p) => p.getBoundingClientRect()), cs = getComputedStyle(nome), fs = parseFloat(cs.fontSize);
    const x0 = Math.min(...rs.map((r) => r.left)), yB = Math.max(...rs.map((r) => r.bottom)) + fs * .05, yT = Math.min(...rs.map((r) => r.top)) - fs * .06, embaixo = innerWidth >= 900;
    const ov = novo(document.body, 'div', 'intro-pr'), gr = novo(ov, 'div', 'pr-grade');
    const ICONE = { nome: QUADRO, texto: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 3.5h10M8 3.5v10"/></svg>', imagens: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><rect x="1.8" y="2.5" width="12.4" height="11" rx="2"/><circle cx="5.8" cy="6.3" r="1.2"/><path d="M2.4 12.2l3.7-3.5 2.6 2.4 2-1.8 2.9 2.6"/></svg>' };
    const cam = novo(ov, 'div', 'pr-cam px', `<div class="pr-cam-t"><b>portfolio.fig</b><i>M</i></div><div class="pr-cam-s">Camadas</div>${[['nome', 'nome'], ['texto', 'texto'], ['imagens', '2 imagens']].map(([k, t]) => `<div class="pr-l" data-l="${k}">${ICONE[k]}<span>${t}</span></div>`).join('')}`);
    const barra = novo(ov, 'div', 'pr-barra px', '<span data-f="wire">wireframe</span><span data-f="cont">contorno</span><span data-f="final">final</span>');
    barra.style.top = (embaixo ? yB + 34 : yT - 62) + 'px'; cam.style.cssText = `left:${x0}px;top:${yB + 22}px`; cam.style.top = Math.max(yT, Math.min(yB + 22, innerHeight - cam.offsetHeight - 36)) + 'px'; /* o painel nunca encosta no pé da tela */
    const etapa = (n) => { $$('span', barra).forEach((s) => s.classList.toggle('on', s.dataset.f === n)); $$('.pr-l', cam).forEach((l) => l.classList.toggle('on', n === 'final' || (n === 'cont' && l.dataset.l === 'nome'))); };
    const botao = (n) => { const r = $(`[data-f="${n}"]`, barra).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const cur = novo(ov, 'span', 'pr-cur', '<u class="px">Matheus</u>'), P = { x: innerWidth * .78, y: (embaixo ? yB : yT) - 40 }, poe = () => gsap.set(cur, { x: P.x, y: P.y });
    poe(); etapa('wire');
    const p1 = botao('cont'), p2 = botao('final');

    /* barras no lugar de cada linha do nome e de cada texto pequeno */
    const fortes = rs.map((r) => { const d = novo(ov, 'div', 'wf-b'); d.style.cssText = `left:${r.left}px;top:${r.top + r.height * .06}px;width:${r.width}px;height:${r.height * .9}px`; return d; });
    const finas = o.miudos.flatMap((m) => (m.classList.contains('hero-info') ? [...m.children] : [m])).map((m) => { const r = m.getBoundingClientRect(), d = novo(ov, 'div', 'wf-b fino'), a = Math.max(8, Math.min(22, r.height * .6)); d.style.cssText = `left:${r.left}px;top:${r.top - 14 + (r.height - a) / 2}px;width:${Math.max(40, r.width * .92)}px;height:${a}px`; return d; });
    /* os gatos ainda são imagens por carregar: a caixa sai das medidas do motor (posição, escala e quadro) */
    const NOMES = ['nacho.png', 'luna.png', 'zoro.png'];
    const caixas = G ? G.faixa.gatos.map((g, i) => { if (g.x < 0) return null; const f = g.f || [0, 0, 180, 200], s = g.s || G.faixa.s, larg = f[2] * s + 10, alt = f[3] * s + 8, d = novo(ov, 'div', 'wf-img', `<u class="px">${NOMES[i]}</u>`); d.style.cssText = `left:${g.x - larg / 2}px;top:${G.faixa.chao - alt + 2}px;width:${larg}px;height:${alt}px`; return d; }).filter(Boolean) : [];
    if (G) { G.faixa.congelado = true; gsap.set(G.faixa.el, { opacity: 0 }); }

    /* contorno: cópia do nome, por cima, com o filtro de borda */
    const filtro = novo(document.body, 'div', 'intro-filtro', '<svg width="0" height="0" aria-hidden="true"><filter id="f-contorno" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="erode" radius="1.25" result="dentro"/><feComposite in="SourceGraphic" in2="dentro" operator="out"/></filter></svg>');
    const folga = fs * .3, lado = fs * .1;
    const copia = nome.cloneNode(true); copia.removeAttribute('id'); $$('[id]', copia).forEach((e) => e.removeAttribute('id')); copia.setAttribute('aria-hidden', 'true'); copia.classList.add('nome-c');
    Object.assign(copia.style, { position: 'absolute', left: (nome.offsetLeft - lado) + 'px', top: (nome.offsetTop - folga) + 'px', width: (nome.offsetWidth + lado * 2) + 'px', margin: 0, padding: `${folga}px ${lado}px`, opacity: 1 });
    (nome.offsetParent || document.body).appendChild(copia);
    gsap.set(copia, { '--p': '-6%' });
    /* tinta: o nome de verdade, revelado por uma máscara que cresce do clique. A folga impede a máscara de cortar o topo das letras. */
    const nr = nome.getBoundingClientRect(), mt = parseFloat(cs.marginTop) || 0, mb = parseFloat(cs.marginBottom) || 0, ml = parseFloat(cs.marginLeft) || 0, mr = parseFloat(cs.marginRight) || 0;
    Object.assign(nome.style, { paddingTop: folga + 'px', paddingBottom: folga + 'px', paddingLeft: lado + 'px', paddingRight: lado + 'px', marginTop: (mt - folga) + 'px', marginBottom: (mb - folga) + 'px', marginLeft: (ml - lado) + 'px', marginRight: (mr - lado) + 'px' });
    const ox = p2.x - (nr.left - lado), oy = p2.y - (nr.top - folga), W = nr.width + lado * 2, H = nr.height + folga * 2;
    const raio = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)) + 90;
    nome.style.setProperty('--ox', ox.toFixed(1) + 'px'); nome.style.setProperty('--oy', oy.toFixed(1) + 'px'); gsap.set(nome, { '--r': '0px' }); nome.classList.add('tinge');
    const limpa = () => { copia.remove(); filtro.remove(); nome.classList.remove('tinge'); ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach((k) => { nome.style[k] = ''; }); ['--ox', '--oy', '--r'].forEach((k) => nome.style.removeProperty(k)); };

    const clique = { scale: .72, duration: .06, yoyo: true, repeat: 1 };
    tl.fromTo(gr, { opacity: 0 }, { opacity: 1, duration: .25 }, 0)
      .fromTo(barra, { y: embaixo ? 50 : -40, opacity: 0 }, { y: 0, opacity: 1, duration: .32, ease: 'back.out(1.5)' }, 0)
      .fromTo(cam, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: .3, ease: 'power3.out' }, .05)
      .fromTo(fortes, { scaleX: 0 }, { scaleX: 1, duration: .38, stagger: .07, ease: 'power3.out' }, .05)
      .fromTo(finas, { scaleX: 0 }, { scaleX: 1, duration: .3, stagger: .03, ease: 'power3.out' }, .12)
      .fromTo(caixas, { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .28, stagger: .04, ease: 'back.out(2)' }, .15)
      .fromTo(cur, { scale: 0 }, { scale: 1, duration: .2, ease: 'back.out(2)' }, .22)
      /* contorno: as barras somem e o traço é desenhado da esquerda para a direita */
      .to(P, { x: p1.x, y: p1.y, duration: .34, ease: 'power3.inOut', onUpdate: poe }, .36)
      .add(() => { som('toque'); etapa('cont'); })
      .to(cur, clique)
      .to(fortes, { opacity: 0, scaleY: .55, duration: .24, ease: 'power2.in' }, '<')
      .to(copia, { '--p': '104%', duration: .42, ease: 'power2.inOut' }, '<.04')
      /* final: a tinta se espalha a partir do clique */
      .to(P, { x: p2.x, y: p2.y, duration: .26, ease: 'power3.inOut', onUpdate: poe }, '<.3')
      .add(() => { som('pop'); etapa('final'); })
      .to(cur, clique)
      .addLabel('final', '<')
      .to(nome, { '--r': raio.toFixed(0) + 'px', duration: .62, ease: 'power2.out' }, 'final')
      .to(finas, { opacity: 0, duration: .22 }, 'final')
      .to(o.miudos, { opacity: 1, y: 0, duration: .5, stagger: .04, ease: 'power3.out' }, 'final+=.04')
      .to(caixas, { scale: 1.12, opacity: 0, duration: .22, stagger: .05, ease: 'power2.in' }, 'final+=.04')
      .add(() => { if (G) { gsap.to(G.faixa.el, { opacity: 1, duration: .2 }); G.faixa.congelado = false; [0, 1].forEach((c, i) => setTimeout(() => pula(G, c, 400 + Math.random() * 220), i * 80)); } som('chegou'); if (o.revela) o.revela(); }, 'final+=.22')
      .add(limpa, 'final+=.64')
      /* a prancheta sai */
      .to(P, { x: innerWidth + 60, y: yB, duration: .34, ease: 'power2.in', onUpdate: poe }, 'final+=.42')
      .to(barra, { y: embaixo ? 60 : -50, opacity: 0, duration: .3, ease: 'power2.in' }, 'final+=.52')
      .to(cam, { x: -40, opacity: 0, duration: .28, ease: 'power2.in' }, '<')
      .to(gr, { opacity: 0, duration: .35 }, '<')
      .add(() => { ov.remove(); o.fim(); });
    return limpa;
  }

  window.Intros = { wire };
})();
