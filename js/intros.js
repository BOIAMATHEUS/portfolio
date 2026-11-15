/* Introduções do hero no tema "arquivo de design" (prancheta), para escolher:
   ?intro=1 moldura, 2 wireframe, 3 texto, 4 gatos no arquivo.
   Todas recebem { hero, nome, letras, miudos, G, som, zoro, fino, fim } e chamam o.fim() no final. Nenhuma pede clique. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const TINTA = '#15120f', SEL = '#2f6bff';
  const pula = (G, c, v) => { const g = G && G.faixa.gatos[c]; if (g && g.modo === 'chao') { g.vy = -(v || 520); g.modo = 'ar'; g.amassa(1.12); } };
  const susto = (G) => { if (G) [0, 1, 2].forEach((c, i) => setTimeout(() => pula(G, c, 400 + Math.random() * 220), i * 90)); };
  const cel = () => innerWidth < 900;
  const novo = (pai, tag, cls, html) => { const d = document.createElement(tag); d.className = cls; if (html) d.innerHTML = html; pai.appendChild(d); return d; };
  const ic = (d) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const IC = {
    mover: ic('<circle cx="8" cy="8" r="4.2" fill="currentColor" stroke="none"/>'),
    moldura: ic('<path d="M4.5 1.5v13M11.5 1.5v13M1.5 4.5h13M1.5 11.5h13"/>'),
    caneta: ic('<path d="M3 13l1-4 6.5-6.5 3 3L7 12zM9 4l3 3"/>'),
    texto: ic('<path d="M3 4.2V2.5h10v1.7M8 2.5v11M6 13.5h4"/>'),
    balao: ic('<path d="M2.5 3h11v7.5H7.2L4 13v-2.5H2.5z"/>'),
  };

  function caixaNome(nome) {
    const rs = $$('.nome .pal').map((p) => p.getBoundingClientRect()), fs = parseFloat(getComputedStyle(nome).fontSize);
    const x0 = Math.min(...rs.map((r) => r.left)) - 14, y0 = Math.min(...rs.map((r) => r.top)) - fs * .06;
    return { x0, y0, w: Math.max(...rs.map((r) => r.right)) - x0 + 14, h: Math.max(...rs.map((r) => r.bottom)) - y0 + fs * .05, fs };
  }

  /* a interface da prancheta: grade, barra de ferramentas e camadas. Devolve ajudantes e a linha do tempo. */
  function base(o, cfg = {}) {
    const F = caixaNome(o.nome), ov = novo(document.body, 'div', 'intro-pr');
    const gr = novo(ov, 'div', 'pr-grade');
    const av = (cfg.avatares || [['M', SEL]]).map(([l, c]) => `<i style="background:${c}">${l}</i>`).join('');
    const cam = novo(ov, 'div', 'pr-cam px', `<div class="pr-cam-t"><b>portfolio.fig</b><span>${av}</span></div><div class="pr-cam-l"></div>`), lista = $('.pr-cam-l', cam);
    const itens = cfg.barra || [['mover', IC.mover], ['moldura', IC.moldura], ['caneta', IC.caneta], ['texto', IC.texto], ['balao', IC.balao]];
    const barra = novo(ov, 'div', 'pr-barra' + (cfg.barra ? ' seg px' : ''), itens.map(([f, h]) => `<span data-f="${f}">${h}</span>`).join('') + (cfg.barra ? '' : '<em class="px">100%</em>'));
    /* onde cabem os painéis: embaixo do nome no computador, em cima dele no celular */
    const embaixo = !cel(), yBarra = embaixo ? F.y0 + F.h + 34 : F.y0 - 62;
    barra.style.top = yBarra + 'px';
    cam.style.cssText = `left:${F.x0 + 14}px;top:${F.y0 + F.h + 22}px`;
    const tl = gsap.timeline();
    tl.fromTo(gr, { opacity: 0 }, { opacity: 1, duration: .4 }, 0)
      .fromTo(barra, { y: embaixo ? 70 : -50, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'back.out(1.5)' }, .05)
      .fromTo(cam, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'power3.out' }, .12);
    if (o.G) o.G.faixa.congelado = !!cfg.congela;
    return {
      ov, tl, F, barra, embaixo,
      ferramenta(n) { $$('span', barra).forEach((s) => s.classList.toggle('on', s.dataset.f === n)); },
      botao(n) { const r = $(`[data-f="${n}"]`, barra).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
      camada(txt, icone) { const d = novo(lista, 'div', 'pr-l', `<i>${icone || ''}</i>${txt}`); gsap.from(d, { opacity: 0, x: -8, duration: .25 }); return d; },
      /* põe um painel no canto livre: à direita embaixo do nome, ou acima da barra no celular */
      lugar(el) { const r = el.getBoundingClientRect(); el.style.left = (embaixo ? F.x0 + F.w - 14 - r.width : Math.max(12, (innerWidth - r.width) / 2)) + 'px'; el.style.top = (embaixo ? F.y0 + F.h + 22 : yBarra - r.height - 14) + 'px'; },
      guia(tipo, pos) { const g = novo(ov, 'div', 'pr-guia ' + tipo); g.style[tipo === 'v' ? 'left' : 'top'] = pos + 'px'; gsap.fromTo(g, { opacity: 1 }, { opacity: 0, duration: .5, delay: .25, onComplete: () => g.remove() }); },
      fecha(semMiudos) {
        tl.to(barra, { y: embaixo ? 80 : -60, opacity: 0, duration: .4, ease: 'power2.in' }, '+=.15')
          .to(cam, { x: -50, opacity: 0, duration: .35, ease: 'power2.in' }, '<')
          .to(gr, { opacity: 0, duration: .45 }, '<.05')
          .add(() => { ov.remove(); if (o.G) { o.G.faixa.congelado = false; o.G.faixa.mouse.vivo = false; } if (!semMiudos) gsap.to(o.miudos, { opacity: 1, y: 0, duration: .7, stagger: .07, ease: 'power3.out' }); o.fim(); });
      },
    };
  }
  /* cursor de quem está no arquivo: a bolinha com o nome ao lado */
  function cursor(ov, nome, cor, x, y, o, segue) {
    const el = novo(ov, 'span', 'pr-cur', `<u class="px">${nome}</u>`); el.style.setProperty('--c', cor);
    const P = { x, y, el, rot: $('u', el) };
    P.poe = () => { gsap.set(el, { x: P.x, y: P.y }); if (segue && o.G) { const m = o.G.faixa.mouse; m.x = P.x; m.y = P.y; m.vivo = true; } };
    P.poe(); return P;
  }
  function selecao(ov, rot) {
    const el = novo(ov, 'div', 'pr-sel', `<i></i><i></i><i></i><i></i><b class="px">${rot}</b><em class="px"></em>`);
    const s = { el, alcas: $$('i', el), tag: $('b', el), med: $('em', el) };
    s.poe = (x, y, w, h) => { el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; el.style.width = Math.max(0, w).toFixed(1) + 'px'; el.style.height = Math.max(0, h).toFixed(1) + 'px'; s.med.textContent = Math.round(Math.max(0, w)) + ' × ' + Math.round(Math.max(0, h)); };
    return s;
  }
  /* preenchimento que sobe pelas letras */
  const comContorno = (o) => { o.nome.classList.add('contorno', 'enche'); gsap.set([o.letras, $('.pingo-g')], { '--f': '0%' }); };
  const enche = (tl, o, pos) => tl.to(o.letras, { '--f': '100%', duration: .5, stagger: .032, ease: 'power2.inOut' }, pos).to($('.pingo-g'), { '--f': '100%', duration: .5, ease: 'power2.inOut' }, '<.38')
    .add(() => { o.nome.classList.remove('contorno', 'enche'); gsap.set([o.letras, $('.pingo-g')], { clearProps: '--f,opacity' }); });

  /* ---------- 1. Moldura ---------- */
  function moldura(o) {
    const { letras, som } = o, b = base(o), { tl, ov, F } = b, { x0, y0, w, h } = F;
    const sel = selecao(ov, 'Hero'), C = cursor(ov, 'Matheus', SEL, innerWidth * .78, innerHeight * .7, o, true);
    const pop = novo(ov, 'div', 'pr-pop px', '<small>Preenchimento</small><div><i style="background:#f4efe7"></i><i style="background:#b9e33b"></i><i style="background:#e8563a"></i><i style="background:#15120f"></i></div><b>#F4EFE7</b>');
    b.lugar(pop); const chip = $$('i', pop)[3].getBoundingClientRect();
    comContorno(o); gsap.set(letras, { opacity: 0 }); gsap.set([sel.el, pop], { opacity: 0 }); gsap.set([sel.alcas, sel.tag], { scale: 0 });
    letras.forEach((el) => { const r = el.getBoundingClientRect(); el._cx = r.left + r.width * .5; el._v = 0; });
    if (o.G) o.G.faixa.gatos[o.G.NACHO].t = .3;
    tl.add(() => b.ferramenta('moldura'), .35)
      .fromTo(C.el, { scale: 0 }, { scale: 1, duration: .3, ease: 'back.out(2)' }, .25)
      .to(C, { x: x0, y: y0, duration: .65, ease: 'power3.inOut', onUpdate: C.poe }, .45)
      .add(() => { som('toque'); sel.poe(x0, y0, 0, 0); gsap.set(sel.el, { opacity: 1 }); })
      .to(C.el, { scale: .72, duration: .1 })
      .to(C, { x: x0 + w, y: y0 + h, duration: 1, ease: 'power2.inOut', onUpdate: () => { C.poe(); sel.poe(x0, y0, C.x - x0, C.y - y0); letras.forEach((el) => { if (!el._v && el._cx < C.x - 4) { el._v = 1; gsap.to(el, { opacity: 1, duration: .16 }); } }); } })
      .add(() => { som('toque'); b.guia('v', x0 + w); b.guia('h', y0 + h); b.guia('v', x0); b.camada('Hero', IC.moldura); })
      .to(C.el, { scale: 1, duration: .15 })
      .to(sel.alcas, { scale: 1, duration: .25, stagger: .04, ease: 'back.out(3)' }, '<')
      .to(sel.tag, { scale: 1, duration: .25, ease: 'back.out(2)' }, '<')
      .add(() => b.camada('Matheus', IC.texto), '+=.02').add(() => b.camada('Saboia', IC.texto), '+=.09')
      .add(() => b.ferramenta('mover'))
      .fromTo(pop, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: 'power3.out' }, '<')
      .to(C, { x: chip.left + chip.width / 2, y: chip.top + chip.height / 2, duration: .5, ease: 'power3.inOut', onUpdate: C.poe }, '<.05')
      .add(() => { som('pop'); $$('i', pop)[3].classList.add('on'); $('b', pop).textContent = '#15120F'; })
      .to(C.el, { scale: .72, duration: .08, yoyo: true, repeat: 1 });
    enche(tl, o, '<');
    tl.to([sel.el, pop], { opacity: 0, duration: .3 }, '+=.3')
      .to(C, { x: innerWidth + 60, y: y0 + h + 40, duration: .5, ease: 'power2.in', onUpdate: C.poe }, '<');
    b.fecha();
  }

  /* ---------- 2. Wireframe: de baixa para alta fidelidade ---------- */
  function wire(o) {
    const { letras, som, G } = o, b = base(o, { barra: [['wire', 'wireframe'], ['cont', 'contorno'], ['final', 'final']], congela: true }), { tl, ov, F } = b;
    const C = cursor(ov, 'Matheus', SEL, innerWidth * .8, innerHeight * .62, o, false);
    comContorno(o); gsap.set(letras, { opacity: 0 });
    /* barras no lugar de cada linha do nome e de cada texto pequeno */
    const fortes = $$('.nome .pal').map((p) => { const r = p.getBoundingClientRect(), d = novo(ov, 'div', 'wf-b'); d.style.cssText = `left:${r.left}px;top:${r.top + r.height * .06}px;width:${r.width}px;height:${r.height * .9}px`; return d; });
    const finas = o.miudos.flatMap((m) => (m.classList.contains('hero-info') ? [...m.children] : [m])).map((m) => { const r = m.getBoundingClientRect(), d = novo(ov, 'div', 'wf-b fino'), a = Math.max(8, Math.min(22, r.height * .6)); d.style.cssText = `left:${r.left}px;top:${r.top - 14 + (r.height - a) / 2}px;width:${Math.max(40, r.width * .92)}px;height:${a}px`; return d; });
    /* os gatos ainda são imagens por carregar */
    const NOMES = ['nacho.png', 'luna.png', 'zoro.png'];
    /* a caixa de cada gato sai das medidas do motor (posição, escala e quadro), não do que já foi desenhado */
    const caixas = G ? G.faixa.gatos.map((g, i) => { const f = g.f || [0, 0, 180, 200], s = g.s || G.faixa.s, larg = f[2] * s + 10, alt = f[3] * s + 8, d = novo(ov, 'div', 'wf-img', `<u class="px">${NOMES[i]}</u>`); d.style.cssText = `left:${g.x - larg / 2}px;top:${G.faixa.chao - alt + 2}px;width:${larg}px;height:${alt}px`; return d; }) : [];
    if (G) gsap.set(G.faixa.el, { opacity: 0 });
    const p1 = b.botao('cont'), p2 = b.botao('final');
    tl.add(() => b.ferramenta('wire'), .3)
      .fromTo(fortes, { scaleX: 0 }, { scaleX: 1, duration: .55, stagger: .12, ease: 'power3.out' }, .3)
      .fromTo(finas, { scaleX: 0 }, { scaleX: 1, duration: .4, stagger: .05, ease: 'power3.out' }, .45)
      .fromTo(caixas, { scale: .5, opacity: 0 }, { scale: 1, opacity: 1, duration: .4, stagger: .07, ease: 'back.out(2)' }, .5)
      .add(() => { b.camada('nome', IC.moldura); b.camada('texto', IC.moldura); b.camada('3 imagens', IC.moldura); }, .6)
      .fromTo(C.el, { scale: 0 }, { scale: 1, duration: .3, ease: 'back.out(2)' }, .7)
      .to(C, { x: p1.x, y: p1.y, duration: .55, ease: 'power3.inOut', onUpdate: C.poe }, .9)
      .add(() => { som('toque'); b.ferramenta('cont'); })
      .to(C.el, { scale: .72, duration: .08, yoyo: true, repeat: 1 })
      .to(fortes, { opacity: 0, scaleY: .55, duration: .35, ease: 'power2.in' }, '<')
      .to(letras, { opacity: 1, duration: .2, stagger: .03 }, '<.12')
      .to(C, { x: p2.x, y: p2.y, duration: .45, ease: 'power3.inOut', onUpdate: C.poe }, '+=.3')
      .add(() => { som('pop'); b.ferramenta('final'); })
      .to(C.el, { scale: .72, duration: .08, yoyo: true, repeat: 1 });
    enche(tl, o, '<');
    tl.to(finas, { opacity: 0, duration: .3 }, '<-.75')
      .to(o.miudos, { opacity: 1, y: 0, duration: .6, stagger: .06, ease: 'power3.out' }, '<.05')
      .to(caixas, { scale: 1.12, opacity: 0, duration: .3, stagger: .08, ease: 'power2.in' }, '<')
      .add(() => { if (G) { gsap.to(G.faixa.el, { opacity: 1, duration: .25 }); G.faixa.congelado = false; susto(G); } som('chegou'); }, '<.15')
      .to(C, { x: innerWidth + 60, y: F.y0 + F.h, duration: .5, ease: 'power2.in', onUpdate: C.poe }, '+=.35');
    b.fecha(true);
  }

  /* ---------- 3. Texto: digitado fino e pequeno, depois peso, largura e tamanho ao vivo ---------- */
  function texto(o) {
    const { letras, som, nome } = o, b = base(o), { tl, ov, F } = b;
    const fsF = F.fs, fsInline = nome.style.fontSize, E = { peso: 400, larg: 100, tam: Math.max(30, fsF * .3), esp: 0 };
    const sel = selecao(ov, 'Texto'), caret = novo(ov, 'span', 'pr-caret');
    const LINHAS = [['Peso', 'peso', 300, 900, 850], ['Largura', 'larg', 75, 125, 125], ['Tamanho', 'tam', E.tam * .6, fsF * 1.1, fsF]];
    const prop = novo(ov, 'div', 'pr-prop px', '<div class="pr-prop-t"><b>Texto</b><span>Zalando Sans</span></div>' + LINHAS.map((l) => `<div class="pr-lin"><small>${l[0]}</small><div class="pr-tri"><i></i><b></b></div><em></em></div>`).join(''));
    b.lugar(prop);
    const linhas = LINHAS.map((l, i) => { const el = $$('.pr-lin', prop)[i], r = $('.pr-tri', el).getBoundingClientRect(); return { k: l[1], min: l[2], max: l[3], alvo: l[4], el, val: $('em', el), x: r.left, w: r.width, y: r.top + r.height / 2 }; });
    const frac = (l) => Math.max(0, Math.min(1, (E[l.k] - l.min) / (l.max - l.min)));
    const C = cursor(ov, 'Matheus', SEL, innerWidth * .75, innerHeight * .7, o, true);
    let vis = 0;
    function refaz() {
      const vs = letras.slice(0, Math.max(1, vis)).map((el) => el.getBoundingClientRect());
      const l = Math.min(...vs.map((r) => r.left)), t = Math.min(...vs.map((r) => r.top)), r2 = vis ? Math.max(...vs.map((r) => r.right)) : l, bt = Math.max(...vs.map((r) => r.bottom));
      sel.poe(l - 8, t - E.tam * .08, r2 - l + 16, bt - t + E.tam * .14);
      const u = vs[vs.length - 1]; caret.style.transform = `translate(${((vis ? u.right : u.left) + 2).toFixed(1)}px,${u.top.toFixed(1)}px)`; caret.style.height = u.height.toFixed(1) + 'px';
    }
    function aplica() {
      nome.style.fontWeight = Math.round(E.peso); nome.style.fontStretch = E.larg.toFixed(1) + '%'; nome.style.fontSize = E.tam.toFixed(1) + 'px'; nome.style.letterSpacing = E.esp.toFixed(4) + 'em';
      linhas.forEach((l) => { l.el.style.setProperty('--v', (frac(l) * 100).toFixed(1) + '%'); l.val.textContent = Math.round(E[l.k]); });
      refaz();
    }
    gsap.set(letras, { opacity: 0 }); gsap.set([sel.el, caret, prop], { opacity: 0 }); gsap.set(sel.alcas, { scale: 1 }); gsap.set(sel.tag, { scale: 1 });
    aplica();
    const r0 = letras[0].getBoundingClientRect();
    tl.add(() => b.ferramenta('texto'), .35)
      .fromTo(C.el, { scale: 0 }, { scale: 1, duration: .3, ease: 'back.out(2)' }, .25)
      .to(C, { x: r0.left + 4, y: r0.top + r0.height * .55, duration: .55, ease: 'power3.inOut', onUpdate: C.poe }, .45)
      .add(() => { som('toque'); gsap.set([sel.el, caret], { opacity: 1 }); b.camada('Texto', IC.texto); })
      .to(C.el, { scale: .72, duration: .08, yoyo: true, repeat: 1 });
    let t = tl.duration() + .12;
    letras.forEach((el, i) => { if (i === 7) t += .2; t += rand(.055, .1); tl.add(() => { vis = i + 1; gsap.set(el, { opacity: 1 }); refaz(); som('tique'); }, t); });
    tl.fromTo(prop, { y: 14 }, { y: 0, opacity: 1, duration: .3, ease: 'power3.out' }, t - .5).add(() => b.ferramenta('mover'), t);
    linhas.forEach((l, i) => {
      const para = { duration: .62, ease: 'power2.inOut', onUpdate: () => { aplica(); C.x = l.x + frac(l) * l.w; C.poe(); } }; para[l.k] = l.alvo; if (l.k === 'tam') para.esp = -.058;
      tl.to(C, { x: () => l.x + frac(l) * l.w, y: l.y, duration: i ? .26 : .45, ease: 'power3.inOut', onUpdate: C.poe }, i ? '+=.06' : t + .05)
        .add(() => som('toque')).to(C.el, { scale: .72, duration: .07 })
        .to(E, para)
        .to(C.el, { scale: 1, duration: .08 });
    });
    tl.add(() => { nome.style.fontWeight = ''; nome.style.fontStretch = ''; nome.style.letterSpacing = ''; nome.style.fontSize = fsInline; caret.remove(); refaz(); som('chegou'); susto(o.G); b.guia('v', F.x0 + 14); b.guia('h', F.y0 + F.h - fsF * .05); })
      .to([sel.el, prop], { opacity: 0, duration: .3 }, '+=.4')
      .to(C, { x: innerWidth + 60, y: F.y0 + F.h + 30, duration: .5, ease: 'power2.in', onUpdate: C.poe }, '<');
    b.fecha();
  }

  /* ---------- 4. Gatos no arquivo: três cursores arrumam as letras ---------- */
  function gatos(o) {
    const { letras, som, G } = o, b = base(o, { avatares: [['L', '#6c4f9c'], ['Z', TINTA], ['N', '#f2a03d']] }), { tl, ov, F } = b;
    const l1 = letras.filter((el) => el.closest('.l1')), l2 = letras.filter((el) => el.closest('.l2'));
    letras.forEach((el) => { const r = el.getBoundingClientRect(); el._hx = r.left + r.width / 2; el._hy = r.top + r.height / 2; el._tx = innerWidth * rand(.1, .9); el._ty = innerHeight * rand(.17, .72); gsap.set(el, { x: el._tx - el._hx, y: el._ty - el._hy, rotation: rand(-50, 50), scale: rand(.5, .8), opacity: 0 }); });
    const Z = cursor(ov, 'Zoro', TINTA, -40, innerHeight * .3, o, false), L = cursor(ov, 'Luna', '#6c4f9c', innerWidth + 40, innerHeight * .5, o, false), N = cursor(ov, 'Nacho', '#f2a03d', innerWidth * .4, innerHeight + 40, o, true);
    const fio = novo(ov, 'div', 'pr-fio px'); b.lugar(fio);
    const fala = (quem, cor, txt) => { const d = novo(fio, 'div', 'pr-fala', `<i style="background:${cor}">${quem}</i><span>${txt}</span>`); b.lugar(fio); gsap.from(d, { opacity: 0, y: 8, scale: .9, duration: .3, ease: 'back.out(2)' }); som('pop'); };
    if (G) G.faixa.gatos[G.NACHO].t = .3;
    const arruma = (C, cor, lista) => {
      const s = gsap.timeline();
      lista.forEach((el) => {
        s.to(C, { x: el._tx, y: el._ty, duration: .15, ease: 'power2.inOut', onUpdate: C.poe })
          .add(() => { el.classList.add('pego'); el.style.setProperty('--pc', cor); som('toque'); })
          .to(C, { x: el._hx, y: el._hy, duration: .24, ease: 'power3.inOut', onUpdate: C.poe })
          .to(el, { x: 0, y: 0, rotation: 0, scale: 1, duration: .24, ease: 'power3.inOut' }, '<')
          .add(() => { el.classList.remove('pego'); som('tique'); });
      });
      return s;
    };
    const fb = b.embaixo ? { x: F.x0 + F.w * .62, y: F.y0 + F.h + 60 } : { x: innerWidth * .5, y: F.y0 - 120 };
    tl.add(() => b.ferramenta('mover'), .3)
      .to(letras, { opacity: 1, duration: .3, stagger: .02 }, .25)
      .add(arruma(Z, TINTA, l1), .75)
      .add(arruma(L, '#6c4f9c', l2), .9)
      .add(() => b.camada('Matheus · Zoro', IC.texto), 1.2).add(() => b.camada('Saboia · Luna', IC.texto), 1.4)
      .to(N, { x: fb.x, y: fb.y, duration: .7, ease: 'power3.inOut', onUpdate: N.poe }, .6)
      .add(() => { b.ferramenta('balao'); fala('N', '#f2a03d', 'cadê a ração?'); b.camada('comentário · Nacho', IC.balao); }, 1.35)
      .add(() => fala('L', '#6c4f9c', 'zzz'), 2.3);
    const fimA = tl.duration(), pr = l1[0].closest('.pal').getBoundingClientRect(), pr2 = l2[0].closest('.pal').getBoundingClientRect();
    tl.add(() => { b.guia('h', pr.bottom); b.guia('h', pr2.bottom); b.guia('v', pr.left); som('chegou'); susto(G); }, fimA)
      .add(() => { gsap.set(letras, { clearProps: 'transform,opacity' }); }, fimA + .02);
    /* o Zoro já de olho no pingo */
    const pingo = $('.pingo-h'), pp = () => { const r = (pingo || l2[4]).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    tl.add(() => { if (o.zoro) o.zoro.medePingo(); }, fimA)
      .to(Z, { x: () => pp().x + 10, y: () => pp().y, duration: .4, ease: 'power3.inOut', onUpdate: Z.poe }, fimA + .1)
      .add(() => fala('Z', TINTA, 'posso derrubar o pingo?'))
      .to(Z, { x: '-=9', duration: .09, yoyo: true, repeat: 3, ease: 'sine.inOut', onUpdate: Z.poe })
      .to(Z, { x: -60, y: innerHeight * .2, duration: .5, ease: 'power2.in', onUpdate: Z.poe }, '+=.45')
      .to(L, { x: innerWidth + 60, y: innerHeight * .4, duration: .5, ease: 'power2.in', onUpdate: L.poe }, '<')
      .to(N, { x: innerWidth * .5, y: innerHeight + 60, duration: .5, ease: 'power2.in', onUpdate: N.poe }, '<')
      .to(fio, { opacity: 0, y: 10, duration: .3 }, '<.1');
    b.fecha();
  }

  window.Intros = { 1: moldura, 2: wire, 3: texto, 4: gatos, nomes: ['atual', 'moldura', 'wireframe', 'texto', 'gatos'] };
})();
