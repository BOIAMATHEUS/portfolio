/* Efeitos de som do portfólio, sintetizados na hora com Web Audio (sem arquivo de áudio).
   Timbre macio: sinos, madeira e voz de gato com formantes, com um pouco de sala.
   O navegador só libera som depois do primeiro clique, toque ou tecla; antes disso tudo fica mudo.
   Uso: Som.toca('moeda'), Som.toca('miau', { gato: 0 }), Som.alterna(), Som.quando(fn). */
(function () {
  let ctx = null, saida = null, eco = null, ruido = null, medidor = null;
  let ligado = true;
  try { ligado = localStorage.getItem('som2') !== '0'; } catch (e) {}
  const ultimo = {}; let fila = [];

  function inicia() {
    if (ctx) return;
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    ctx = new C();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -15; comp.knee.value = 14; comp.ratio.value = 4; comp.attack.value = .003; comp.release.value = .22;
    saida = ctx.createGain(); saida.gain.value = 1.15;
    medidor = ctx.createAnalyser(); medidor.fftSize = 2048;
    saida.connect(comp); comp.connect(medidor); medidor.connect(ctx.destination);
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ruido = b;
    /* sala pequena: resposta ao impulso gerada aqui mesmo */
    const n = Math.floor(ctx.sampleRate * 1.2), ir = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const x = ir.getChannelData(c); let ant = 0; for (let i = 0; i < n; i++) { const r = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.4); ant = ant * .6 + r * .4; x[i] = ant; } }
    const conv = ctx.createConvolver(); conv.buffer = ir; eco = ctx.createGain(); eco.gain.value = .5; eco.connect(conv); conv.connect(saida);
  }
  const pronto = () => !!ctx && ctx.state === 'running';
  const avisa = () => { if (!pronto()) return; const f = fila; fila = []; f.forEach((fn) => { try { fn(); } catch (e) {} }); };
  const libera = () => { inicia(); if (!ctx) return; if (ctx.state !== 'running') ctx.resume().then(avisa, () => {}); else avisa(); };
  ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'].forEach((ev) => addEventListener(ev, libera, { passive: true, capture: true }));

  /* ---------- blocos ---------- */
  function liga(g, sala) { g.connect(saida); if (sala) { const s = ctx.createGain(); s.gain.value = sala; g.connect(s); s.connect(eco); } }
  function env(g, t, vol, at, dur, rel) {
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + at);
    g.gain.setValueAtTime(Math.max(.0002, vol), t + Math.max(at, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  /* tom simples com curva de altura. pts: [[tempo 0 a 1, freq], ...] */
  function tom(tipo, pts, dur, vol, o = {}) {
    const t = ctx.currentTime + (o.quando || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = tipo; osc.frequency.setValueAtTime(pts[0][1], t);
    pts.slice(1).forEach(([p, f]) => osc.frequency.exponentialRampToValueAtTime(Math.max(20, f), t + p * dur));
    env(g, t, vol, o.at || .008, dur, o.rel || dur * .6);
    let no = osc;
    if (o.filtro) { const f = ctx.createBiquadFilter(); f.type = o.filtro[0]; f.frequency.setValueAtTime(o.filtro[1], t); if (o.filtro[3]) f.frequency.exponentialRampToValueAtTime(o.filtro[3], t + dur); f.Q.value = o.filtro[2] || 1; no.connect(f); no = f; }
    if (o.trem) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.trem[0]; lg.gain.value = o.trem[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05); }
    no.connect(g); liga(g, o.sala === undefined ? .5 : o.sala); osc.start(t); osc.stop(t + dur + .05);
  }
  /* sino ou madeira: seno com modulação de frequência que morre rápido */
  function sino(f, dur, vol, o = {}) {
    const t = ctx.currentTime + (o.quando || 0), c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    c.type = 'sine'; c.frequency.setValueAtTime(f, t); if (o.cai) c.frequency.exponentialRampToValueAtTime(Math.max(30, f * o.cai), t + dur);
    m.type = 'sine'; m.frequency.setValueAtTime(f * (o.r || 3.01), t);
    mg.gain.setValueAtTime(f * (o.i === undefined ? 1.4 : o.i), t); mg.gain.exponentialRampToValueAtTime(Math.max(.01, f * .01), t + dur * (o.brilho || .45));
    m.connect(mg); mg.connect(c.frequency);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.at || .004)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    c.connect(g); liga(g, o.sala === undefined ? .7 : o.sala); c.start(t); m.start(t); c.stop(t + dur + .05); m.stop(t + dur + .05);
  }
  function chiado(dur, vol, filtro, o = {}) {
    const t = ctx.currentTime + (o.quando || 0), s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = ruido; s.loop = true; f.type = filtro[0]; f.frequency.setValueAtTime(filtro[1], t); if (filtro[3]) f.frequency.exponentialRampToValueAtTime(filtro[3], t + dur); f.Q.value = filtro[2] || 1;
    env(g, t, vol, o.at || .005, dur, o.rel || dur * .6);
    let no = f; s.connect(f);
    if (o.trem) { const l = ctx.createOscillator(), lg = ctx.createGain(), am = ctx.createGain(); am.gain.value = 1 - o.trem[1]; l.type = o.trem[2] || 'sine'; l.frequency.value = o.trem[0]; lg.gain.value = o.trem[1]; l.connect(lg); lg.connect(am.gain); f.connect(am); no = am; l.start(t); l.stop(t + dur + .05); }
    no.connect(g); liga(g, o.sala === undefined ? .3 : o.sala); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
  }
  /* voz de gato: serra passando por dois formantes que se movem (mi, a, u) */
  function voz(pts, dur, vol, o = {}) {
    const t = ctx.currentTime + (o.quando || 0), osc = ctx.createOscillator(), g = ctx.createGain(), mix = ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(pts[0][1], t);
    pts.slice(1).forEach(([p, f]) => osc.frequency.exponentialRampToValueAtTime(f, t + p * dur));
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.vib[0]; lg.gain.setValueAtTime(0.01, t); lg.gain.linearRampToValueAtTime(o.vib[1], t + dur * .5); l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05); }
    (o.formas || [[650, 1150, 520], [1700, 2500, 1300]]).forEach((fs, i) => {
      const f = ctx.createBiquadFilter(), fg = ctx.createGain(); f.type = 'bandpass'; f.Q.value = i ? 7 : 4.5; fg.gain.value = i ? .7 : 1;
      f.frequency.setValueAtTime(fs[0], t); f.frequency.linearRampToValueAtTime(fs[1], t + dur * .38); f.frequency.linearRampToValueAtTime(fs[2], t + dur);
      osc.connect(f); f.connect(fg); fg.connect(mix);
    });
    env(g, t, vol, o.at || .05, dur, o.rel || dur * .4);
    mix.connect(g); liga(g, .6); osc.start(t); osc.stop(t + dur + .05);
  }
  const nota = (n) => 440 * Math.pow(2, (n - 69) / 12);

  /* ---------- os sons ---------- */
  const SONS = {
    /* gatos */
    pulo: () => { tom('sine', [[0, 300], [1, 640]], .13, .17, { sala: .4 }); chiado(.09, .035, ['bandpass', 1400, 1, 3200]); },
    pouso: () => { sino(150, .16, .4, { i: .4, r: 1.5, cai: .42, sala: .25 }); chiado(.05, .06, ['lowpass', 900]); },
    patada: () => { chiado(.17, .34, ['bandpass', 480, 1.1, 3000], { at: .02 }); sino(210, .09, .3, { i: .6, r: 2.2, cai: .6, quando: .1, sala: .2 }); },
    toque: () => sino(920, .07, .22, { i: .9, r: 2.76, sala: .3 }),
    quique: (o) => sino(260 * (o.f || 1), .12, .55 * Math.min(1, o.v || 1), { i: 1.1, r: 2.4, cai: .55, sala: .35 }),
    volta: () => { tom('sine', [[0, 320], [1, 940]], .2, .24); sino(nota(84), .5, .34, { quando: .2 }); sino(nota(88), .7, .3, { quando: .29 }); },
    susto: () => { voz([[0, 700], [.35, 1250], [1, 900]], .2, .9, { at: .01, rel: .1, formas: [[900, 1500, 1100], [2400, 3200, 2600]] }); },
    /* miados: 0 Nacho (pidão, comprido), 1 Luna (ronrom), 2 Zoro (trinado curto) */
    miau: (o) => {
      const g = o.gato;
      if (g === 1) return SONS.ronrom();
      if (g === 2) return voz([[0, 560], [.45, 930], [1, 820]], .24, .9, { at: .02, rel: .1, vib: [27, 55], formas: [[800, 1300, 1000], [2100, 2900, 2400]] });
      voz([[0, 470], [.28, 760], [.7, 690], [1, 400]], .62, 1, { at: .06, rel: .26, vib: [6.5, 16] });
    },
    ronrom: () => { chiado(1.5, 1.1, ['bandpass', 260, .8], { trem: [24, .9, 'sawtooth'], at: .25, rel: .5, sala: .15 }); chiado(1.5, .6, ['bandpass', 520, .9], { trem: [24, .9, 'sawtooth'], at: .3, rel: .5, sala: .1 }); },
    espirro: () => { chiado(.09, .22, ['highpass', 1700], { at: .004 }); voz([[0, 800], [1, 420]], .1, .35, { at: .005, rel: .06 }); },
    coracao: () => { sino(nota(81), .3, .3); sino(nota(86), .5, .3, { quando: .09 }); },
    /* joguinho */
    moeda: (o) => { const b = 83 + Math.min(7, (o.combo || 1) - 1) * 2; sino(nota(b), .16, .34, { r: 2, i: 1 }); sino(nota(b + 5), .6, .38, { r: 2, i: 1, quando: .075 }); },
    troca: () => sino(nota(74), .12, .3, { r: 2.5, i: .8, sala: .3 }),
    nao: () => { sino(196, .14, .4, { r: 1.4, i: 1.6, cai: .8, sala: .2 }); sino(175, .2, .4, { r: 1.4, i: 1.6, cai: .8, quando: .12, sala: .2 }); },
    vitoria: () => { [72, 76, 79, 84].forEach((n, i) => sino(nota(n), .4, .34, { quando: i * .1, r: 2, i: 1.1 })); [72, 79, 84, 88].forEach((n) => sino(nota(n), 1.3, .22, { quando: .46, r: 2, i: .8 })); },
    /* interface */
    tique: () => sino(1500, .035, .08, { i: .5, r: 1.5, sala: .15 }),
    clique: () => { sino(430, .08, .4, { i: 1.2, r: 2.3, cai: .6, sala: .25 }); chiado(.02, .08, ['highpass', 3000]); },
    passo: () => sino(nota(76), .18, .3, { r: 2, i: .9 }),
    chegou: () => { sino(nota(79), .3, .34, { r: 2, i: 1 }); sino(nota(84), .9, .36, { r: 2, i: 1, quando: .11 }); },
    pop: () => tom('sine', [[0, 380], [1, 900]], .08, .34, { sala: .3 }),
    cortina: () => chiado(.55, .6, ['bandpass', 260, .8, 2200], { at: .18, rel: .3, sala: .4 }),
    /* a luz acende: o estalo do interruptor, a lâmpada falhando e um acorde abrindo */
    luz: () => {
      sino(1900, .03, .5, { i: 2, r: 1.41, sala: .2 }); chiado(.03, .3, ['highpass', 2500]);
      [.1, .22].forEach((q) => tom('sawtooth', [[0, 120], [1, 120]], .06, .16, { quando: q, filtro: ['bandpass', 900, 2], sala: .2 }));
      [60, 67, 72, 76].forEach((n, i) => tom('sine', [[0, nota(n)], [1, nota(n)]], 1.5, .16, { quando: .36 + i * .04, at: .25, rel: 1, sala: .9 }));
      sino(nota(88), 1.2, .14, { quando: .5, r: 2, i: .6 });
    },
  };
  const INTERVALO = { tique: 70, passo: 110, quique: 45, pop: 90, miau: 500, ronrom: 1800, moeda: 60, cortina: 400, clique: 60, pouso: 60, pulo: 60 };

  function toca(nome, o = {}) {
    if (!ligado || !pronto() || !SONS[nome] || document.hidden) return false;
    const agora = performance.now(), min = INTERVALO[nome] || 25;
    if (agora - (ultimo[nome] || 0) < min) return false; ultimo[nome] = agora;
    try { SONS[nome](o); } catch (e) { return false; }
    return true;
  }
  function alterna() { ligado = !ligado; try { localStorage.setItem('som2', ligado ? '1' : '0'); } catch (e) {} if (ligado) { libera(); setTimeout(() => toca('pop'), 80); } return ligado; }
  /* roda fn assim que o navegador liberar o áudio (na hora, se já liberou) */
  function quando(fn) { if (pronto()) fn(); else fila.push(fn); }
  /* pico do sinal que está saindo agora, de 0 a 1 (para conferir que há som) */
  function nivel() { if (!medidor) return 0; const d = new Float32Array(medidor.fftSize); medidor.getFloatTimeDomainData(d); let p = 0; for (let i = 0; i < d.length; i++) p = Math.max(p, Math.abs(d[i])); return p; }

  window.Som = { toca, alterna, quando, nivel, get ligado() { return ligado; }, get pronto() { return pronto(); }, nomes: () => Object.keys(SONS) };
})();
