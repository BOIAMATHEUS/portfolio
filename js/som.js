/* Efeitos de som do portfólio, sintetizados na hora com Web Audio (estilo 8 bits, sem arquivo de áudio).
   O navegador só libera som depois do primeiro toque ou clique; antes disso tudo fica mudo.
   Uso: Som.toca('moeda'), Som.toca('miau', { gato: 0 }), Som.alterna(). */
(function () {
  let ctx = null, saida = null, ruido = null;
  let ligado = true;
  try { ligado = localStorage.getItem('som') !== '0'; } catch (e) {}
  const ultimo = {};

  function inicia() {
    if (ctx) return;
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    ctx = new C();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5;
    saida = ctx.createGain(); saida.gain.value = .5; saida.connect(comp); comp.connect(ctx.destination);
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ruido = b;
  }
  const libera = () => { inicia(); if (ctx && ctx.state === 'suspended') ctx.resume(); };
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, libera, { passive: true }));

  /* blocos */
  function env(g, t, vol, at, dur, rel) {
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + at);
    g.gain.setValueAtTime(Math.max(.0002, vol), t + Math.max(at, dur - rel));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  function tom(tipo, pts, dur, vol, o = {}) { /* pts: [[tempoRelativo0a1, freq], ...] */
    const t = ctx.currentTime + (o.quando || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = tipo; osc.frequency.setValueAtTime(pts[0][1], t);
    pts.slice(1).forEach(([p, f]) => osc.frequency.exponentialRampToValueAtTime(Math.max(20, f), t + p * dur));
    env(g, t, vol, o.at || .008, dur, o.rel || dur * .5);
    let no = osc;
    if (o.filtro) { const f = ctx.createBiquadFilter(); f.type = o.filtro[0]; f.frequency.setValueAtTime(o.filtro[1], t); if (o.filtro[3]) f.frequency.exponentialRampToValueAtTime(o.filtro[3], t + dur); f.Q.value = o.filtro[2] || 1; no.connect(f); no = f; }
    if (o.trem) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = o.trem[0]; lg.gain.value = o.trem[1]; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05); }
    no.connect(g); g.connect(saida); osc.start(t); osc.stop(t + dur + .05);
  }
  function chiado(dur, vol, filtro, o = {}) {
    const t = ctx.currentTime + (o.quando || 0), s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = ruido; s.loop = true; f.type = filtro[0]; f.frequency.setValueAtTime(filtro[1], t); if (filtro[3]) f.frequency.exponentialRampToValueAtTime(filtro[3], t + dur); f.Q.value = filtro[2] || 1;
    env(g, t, vol, o.at || .005, dur, o.rel || dur * .6);
    let no = f; s.connect(f);
    if (o.trem) { const l = ctx.createOscillator(), lg = ctx.createGain(), am = ctx.createGain(); am.gain.value = 1 - o.trem[1]; l.frequency.value = o.trem[0]; lg.gain.value = o.trem[1]; l.connect(lg); lg.connect(am.gain); f.connect(am); no = am; l.start(t); l.stop(t + dur + .05); }
    no.connect(g); g.connect(saida); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
  }
  const nota = (n) => 440 * Math.pow(2, (n - 69) / 12);

  const SONS = {
    pulo: () => tom('triangle', [[0, 330], [1, 720]], .11, .16),
    pouso: () => { tom('sine', [[0, 170], [1, 62]], .1, .3); chiado(.04, .06, ['highpass', 2500]); },
    patada: () => chiado(.16, .2, ['bandpass', 500, 1.2, 2600]),
    toque: () => tom('square', [[0, 1100], [1, 900]], .035, .07),
    quique: (o) => tom('sine', [[0, 200 * (o.f || 1)], [1, 80]], .09, .26 * (o.v || 1)),
    volta: () => { tom('triangle', [[0, 300], [1, 900]], .22, .14); tom('square', [[0, 1320], [1, 1320]], .09, .06, { quando: .24 }); },
    susto: () => tom('sawtooth', [[0, 900], [.3, 1500], [1, 700]], .2, .1, { filtro: ['bandpass', 1900, 3], trem: [34, 40] }),
    /* miados: 0 Nacho (pidão, agudo), 1 Luna (ronrom), 2 Zoro (trinado curto) */
    miau: (o) => {
      const g = o.gato;
      if (g === 1) return chiado(1.05, .2, ['lowpass', 240, 1], { trem: [23, .85], at: .15, rel: .35 });
      if (g === 2) return tom('triangle', [[0, 860], [.5, 1320], [1, 1180]], .2, .14, { trem: [30, 60], filtro: ['bandpass', 1600, 2] });
      tom('sawtooth', [[0, 620], [.3, 1020], [1, 520]], .42, .11, { at: .03, rel: .16, filtro: ['bandpass', 1300, 2.6, 2100], trem: [26, 14] });
    },
    ronrom: () => chiado(1.3, .2, ['lowpass', 230, 1], { trem: [23, .85], at: .2, rel: .45 }),
    espirro: () => { chiado(.07, .22, ['highpass', 1800]); tom('square', [[0, 700], [1, 240]], .07, .05); },
    coracao: () => { tom('sine', [[0, 880], [1, 880]], .08, .1); tom('sine', [[0, 1175], [1, 1175]], .14, .1, { quando: .08 }); },
    moeda: (o) => { const b = 83 + Math.min(7, (o.combo || 1) - 1) * 2; tom('square', [[0, nota(b)], [1, nota(b)]], .07, .08); tom('square', [[0, nota(b + 5)], [1, nota(b + 5)]], .26, .08, { quando: .07, rel: .22 }); },
    troca: () => tom('triangle', [[0, 520], [1, 700]], .06, .1),
    nao: () => tom('square', [[0, 220], [1, 160]], .12, .07),
    vitoria: () => [72, 76, 79, 84, 79, 84].forEach((n, i) => tom('square', [[0, nota(n)], [1, nota(n)]], i === 5 ? .4 : .11, .08, { quando: i * .11, rel: i === 5 ? .3 : .05 })),
    tique: () => tom('square', [[0, 1500], [1, 1500]], .02, .03),
    clique: () => { tom('triangle', [[0, 700], [1, 420]], .06, .12); },
    passo: () => tom('triangle', [[0, 640], [1, 820]], .07, .1),
    chegou: () => { tom('triangle', [[0, nota(79)], [1, nota(79)]], .1, .12); tom('triangle', [[0, nota(84)], [1, nota(84)]], .34, .12, { quando: .1, rel: .28 }); },
    pop: () => tom('sine', [[0, 420], [1, 900]], .07, .13),
    cortina: () => chiado(.5, .12, ['bandpass', 300, .8, 1800], { at: .15, rel: .3 }),
    luz: () => { tom('square', [[0, 180], [1, 120]], .03, .1); tom('triangle', [[0, 440], [1, 1320]], .5, .07, { quando: .05, at: .2, rel: .25 }); },
  };
  const INTERVALO = { tique: 60, passo: 110, quique: 40, pop: 90, miau: 500, moeda: 60, cortina: 400 };

  function toca(nome, o = {}) {
    if (!ligado || !ctx || ctx.state !== 'running' || !SONS[nome] || document.hidden) return;
    const agora = performance.now(), min = INTERVALO[nome] || 25;
    if (agora - (ultimo[nome] || 0) < min) return; ultimo[nome] = agora;
    try { SONS[nome](o); } catch (e) {}
  }
  function alterna() { ligado = !ligado; try { localStorage.setItem('som', ligado ? '1' : '0'); } catch (e) {} if (ligado) { libera(); setTimeout(() => toca('pop'), 60); } return ligado; }

  window.Som = { toca, alterna, get ligado() { return ligado; } };
})();
