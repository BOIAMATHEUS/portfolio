# Gera as páginas de case (renova.html, good-green.html, rastreio.html). Uso: python build.py
import os, glob

SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M7 17 17 7M8 7h9v9"/></svg>'


def fig(src, alt, cls=''):
    return f'<figure class="{cls}"><img src="{src}" alt="{alt}" loading="lazy"></figure>'


def pagina(p):
    cards = ''.join(f'<div class="card{" dest" if c.get("dest") else ""}"><i>{i + 1:02d}</i><b>{c["t"]}</b><p>{c["p"]}</p></div>' for i, c in enumerate(p['cards']))
    meta = ''.join(f'<div><small>{k}</small><b>{v}</b></div>' for k, v in p['meta'])
    texto = ''.join(f'<p>{t}</p>' for t in p['texto'])
    return f'''<!doctype html>
<html lang="pt-BR" class="sem-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{p['titulo']} · Matheus Saboia</title>
<meta name="description" content="{p['desc']}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="{p['cor']}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/ZalandoSans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
<script>document.documentElement.classList.remove('sem-js')</script>
</head>
<body class="{p['tema']}">
<div class="cortina" id="cortina" style="transform:none;background:{p['cor']}"></div>
<div class="cur" id="cur"></div><div class="cur-r" id="cur-r"></div>
<header class="nav">
  <a class="nav-m" href="index.html" data-vai="#15120f"><b></b>Matheus Saboia</a>
  <nav class="nav-l"><a href="index.html#trabalhos" data-vai="#15120f">Trabalhos</a><a href="index.html#sobre" data-vai="#15120f">Sobre</a><a href="#contato">Contato</a><button class="som-b" id="som-b" type="button" aria-pressed="true" aria-label="Ligar ou desligar os sons"><i></i><span>som</span></button></nav>
</header>
<main>
<header class="ch" data-nav="{p['nav']}">
  <div class="ch-arte"><img src="{p['arte']}" alt=""></div>
  <div class="ch-c">
    <span class="rot">{p['rot']}</span>
    <h1>{p['h1']}</h1>
    <p class="ch-d">{p['d']}</p>
    <div class="meta">{meta}</div>
  </div>
</header>

<section class="cs" data-nav="escuro">
  <div class="cs-g"><h2 data-sobe>{p['h2']}</h2><div class="cs-p" data-sobe>{texto}</div></div>
  <div class="cards">{cards}</div>
</section>
{p['corpo']}
<a class="prox" href="{p['prox'][0]}" data-vai="{p['prox'][2]}" style="background:{p['prox'][2]};color:{p['prox'][3]}" data-cur="próximo<br>case" data-nav="{p['prox'][4]}"><small>Próximo case</small><b>{p['prox'][1]}</b></a>

<section class="contato" id="contato" data-nav="claro">
  <span class="rot">Contato</span>
  <h2 id="contato-t" aria-label="Vamos conversar?"><span aria-hidden="true">Vamos<br>conversar?</span></h2>
  <div class="contato-l" id="contato-l"></div>
  <div class="pe"><span>© 2026 Matheus Saboia</span><span class="px">Feito à mão, com três gatos em cima do teclado.</span></div>
</section>
</main>
<div class="luz" id="luz" aria-hidden="true"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="js/som.js"></script>
<script src="js/gatos-atlas.js"></script>
<script src="js/gatos.js"></script>
<script src="js/hero.js"></script>
<script src="js/site.js"></script>
</body>
</html>
'''


def galeria(titulo, sub, figs):
    return f'<section class="gal" data-nav="escuro"><div class="gal-t"><h2 data-sobe>{titulo}</h2><p data-sobe>{sub}</p></div>{"".join(figs)}</section>'


# ---------- Renova ----------
mods = sorted(glob.glob('assets/renova/m-*.webp'))
mods = [m.replace('\\', '/') for m in mods if '00-capa' not in m]
renova = dict(
    tema='t-renova', nav='claro', cor='#e8563a', titulo='App Renova Be', desc='Case do app Renova Be: rotina, recompensa e jogo num app de autocuidado.',
    arte='assets/renova/key-A.webp', rot='01 · App e jogos', h1='App<br>Renova Be',
    d='Rotina, recompensa e jogo num app de autocuidado. Primeiro o app, depois os dois jogos.',
    meta=[('Papel', 'Product designer, de ponta a ponta'), ('Período', 'Outubro e novembro de 2026'), ('Plataforma', 'iOS e Android'), ('Ferramentas', 'Figma, React e IA no processo')],
    h2='O app era um espelho do site.',
    texto=['Loja, sacola e conta, como no site. O pedido foi direto: o app tem outra dinâmica e não pode ser uma cópia do site.',
           'Redesenhei para dar um motivo de abrir todo dia, sem atrapalhar a compra: uma loja mais curta, uma moeda em reais e dois jogos com a cara da marca.'],
    cards=[dict(t='Economia antes da arte', p='Tela bonita com regra furada vira prejuízo. A moeda vale dinheiro de verdade, com teto e validade.'),
           dict(t='O que não virou jogo', p='O registro diário da dose é a prova da garantia. Se rendesse moeda, o app incentivaria registrar sem tomar.', dest=True),
           dict(t='Protótipo no lugar de tela', p='Entreguei um protótipo funcionando no celular, com um documento por tela. O time implementou a partir dele.')],
    corpo='<section class="telas" data-nav="escuro">' + ''.join(fig(f'assets/renova/{n}.webp', a) for n, a in [('a01-home', 'Home do app'), ('a07-saldo', 'Saldo Renova'), ('g01-mapa', 'Mapa do Renova Match'), ('g02-partida', 'Partida do Renova Match')]) + '</section>'
    + galeria('O case completo', f'Toque numa imagem para ampliar. O case também está no <a href="https://www.behance.net/gallery/258467439/App-Renova-Be-Rotina-recompensa-e-jogo-UXUI" target="_blank" rel="noopener" style="text-decoration:underline">Behance</a>.', [fig(m, 'Módulo do case do app Renova Be') for m in mods]),
    prox=('good-green.html', 'Good Green', '#0f2e2f', '#f3f7ea', 'claro'),
)

# ---------- Good Green ----------
gg = dict(
    tema='t-gg', nav='claro', cor='#0f2e2f', titulo='Good Green', desc='Case Good Green: site completo e jornada de lançamento de uma marca nova de bebida verde.',
    arte='assets/gg/banner-pote-inclinado.webp', rot='02 · Site e lançamento', h1='Good<br><em>Green</em>',
    d='Site completo e jornada de lançamento de uma marca nova de bebida verde em pó.',
    meta=[('Papel', 'Product designer: site, jornada e direção visual'), ('Momento', '2026, pré-lançamento'), ('Entrega', 'Site, quiz, landing pages e pop-ups'), ('Ferramentas', 'Figma, HTML e CSS, IA no processo')],
    h2='Uma categoria nova para o Brasil.',
    texto=['Good Green é um suplemento em pó que vira bebida verde: uma medida em 300 ml de água. A categoria já é grande lá fora e pouca gente aqui conhece.',
           'O site precisava fazer duas coisas ao mesmo tempo: explicar o produto para quem nunca ouviu falar dele e parecer gostoso antes de parecer saudável.'],
    cards=[dict(t='Prazer antes de protocolo', p='A bebida tem que parecer gostosa antes de parecer saudável. O copo gelado vem antes da tabela.'),
           dict(t='Dor primeiro, produto depois', p='O quiz mostra só as dores que a pessoa marcou, a causa e um dado com fonte. A Good Green entra depois, como solução.', dest=True),
           dict(t='Figma antes do código', p='Cada tela nasce no Figma, em desktop e celular, e só depois vira página. Site e Figma andam iguais.')],
    corpo=galeria('O site', 'Home em desktop e no celular. As imagens rolam junto com a página.', ['<div class="rolo-m"><div class="rolo"><img src="assets/gg/home-d.webp" alt="Home da Good Green em desktop" loading="lazy"></div><div class="rolo"><img src="assets/gg/home-m.webp" alt="Home da Good Green no celular" loading="lazy"></div></div>'])
    + '<section class="cs" style="padding-top:0" data-nav="escuro"><div class="cs-g"><h2 data-sobe>O quiz monta o diagnóstico.</h2><div class="cs-p" data-sobe><p>São quatro perguntas seguidas, sem tela educativa no meio. O resultado mostra só as dores marcadas, com a causa de cada uma, e apresenta o produto no fim, como solução.</p><p>O pop-up da roleta e o carrinho seguem a mesma linguagem: vidro, foto real e pouco texto.</p></div></div></section>'
    + '<section class="telas" data-nav="escuro">' + ''.join(fig(f'assets/gg/{n}.webp', a) for n, a in [('quiz-m', 'Quiz de diagnóstico'), ('roleta-m', 'Roleta do pop-up'), ('carrinho-m', 'Carrinho'), ('pdp-m', 'Página de produto no celular')]) + '</section>'
    + galeria('A página de produto', 'A mesma estrutura da página de lançamento, sem a campanha.', ['<div class="rolo-m"><div class="rolo"><img src="assets/gg/pdp-d.webp" alt="Página de produto da Good Green" loading="lazy"></div><div class="rolo"><img src="assets/gg/lanc-m.webp" alt="Página de lançamento no celular" loading="lazy"></div></div>'])
    + galeria('A jornada de lançamento', 'Antes de a loja abrir, a marca precisa de lista: captação, calculadora de fibras e páginas de apoio.',
              ['<div class="duo">' + fig('assets/gg/capt-d.webp', 'Página de captação do lançamento') + fig('assets/gg/fibras-d.webp', 'Calculadora de fibras') + '</div>',
               '<div class="duo">' + fig('assets/gg/quiz-d.webp', 'Quiz em desktop') + fig('assets/gg/roleta-d.webp', 'Roleta em desktop') + '</div>',
               '<div class="duo">' + fig('assets/gg/ingr-d.webp', 'Página de ingredientes') + fig('assets/gg/loja-d.webp', 'Loja') + '</div>']),
    prox=('rastreio.html', 'Rastreio', '#ecd9cb', '#2b1d15', 'escuro'),
)

# ---------- Rastreio ----------
rm = [m.replace('\\', '/') for m in sorted(glob.glob('assets/rastreio/*.webp')) if '00-capa' not in m and '01-capa' not in m and 'hero' not in m]
nhv = dict(
    tema='t-nhv', nav='escuro', cor='#7d5b49', titulo='Rastreio de pedido · New Hair', desc='Case de rastreio de pedido da New Hair: achar todos os pedidos só com o CPF.',
    arte='assets/rastreio/hero.webp', rot='03 · Pós-compra · New Hair', h1='Rastreio<br><em>de pedido</em>',
    d='Encontrar todos os pedidos só com o CPF e saber, em uma frase, onde cada um está e quando chega.',
    meta=[('Papel', 'Design e produto'), ('Marca', 'New Hair'), ('Entrega', 'Tela de rastreio, design system e protótipo em código'), ('Ferramentas', 'Figma e React')],
    h2='“Cadê o meu pedido?”',
    texto=['É a pergunta mais repetida no atendimento de qualquer e-commerce. Na loja nova da New Hair não existia um lugar para a cliente acompanhar a entrega sem login.',
           'O objetivo era achar todos os pedidos só com o CPF, em segundos, e entender em uma frase onde cada um está e quando chega.'],
    cards=[dict(t='O dado manda no desenho', p='Antes de desenhar, conferi o que a plataforma entrega de verdade. Três descobertas mudaram a tela.'),
           dict(t='Pix pendente é oportunidade', p='O pedido traz o código copia e cola. A tela de rastreio virou também um lugar para concluir o pagamento.', dest=True),
           dict(t='Quatro versões em um dia', p='Com protótipo em código e dados reais, cada rodada de feedback virou uma versão nova no ar.')],
    corpo=galeria('O case completo', 'Toque numa imagem para ampliar.', [fig(m, 'Módulo do case de rastreio de pedido') for m in rm]),
    prox=('renova.html', 'App Renova Be', '#e8563a', '#fff', 'claro'),
)

for nome, p in [('renova.html', renova), ('good-green.html', gg), ('rastreio.html', nhv)]:
    open(nome, 'w', encoding='utf-8').write(pagina(p))
    print(nome, 'ok')
