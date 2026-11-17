# Gera as páginas de case (renova.html, good-green.html, rastreio.html) no mesmo desenho da página inicial.
# Uso: python build.py
SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M7 17 17 7M8 7h9v9"/></svg>'
BEHANCE = 'https://www.behance.net/gallery/258467439/App-Renova-Be-Rotina-recompensa-e-jogo-UXUI'


import datetime
import json
import re
from PIL import Image

BASE = 'https://boiamatheus.github.io/portfolio/'

_dim = {}


def medidas(html):
    def um(m):
        src = m.group(1)
        if src not in _dim:
            _dim[src] = Image.open(src).size
        w, h = _dim[src]
        return f'<img width="{w}" height="{h}" src="{src}"'
    return re.sub(r'<img src="([^"]+)"', um, html)


# ---------- peças ----------
def cap(rot, titulo, textos=(), extra='', cls=''):
    """capítulo: rótulo em pixel, título grande por linhas e texto ao lado"""
    ps = ''.join(f'<p>{t}</p>' for t in textos)
    lado = f'<div class="cs-p" data-sobe>{ps}</div>' if ps else ''
    return f'''<section class="cs {cls}" data-nav="{'claro' if 'escuro' in cls else 'escuro'}">
  <span class="rot" data-sobe>{rot}</span>
  <div class="cs-g"><h2 data-linhas>{titulo}</h2>{lado}</div>
  {extra}
</section>'''


def cards(itens):
    h = ''
    for i, c in enumerate(itens):
        corpo = f'<p>{c["p"]}</p>' if 'p' in c else '<ul>' + ''.join(f'<li>{x}</li>' for x in c['li']) + '</ul>'
        h += f'<div class="card{" dest" if c.get("dest") else ""}"><i>{c.get("n", f"{i + 1:02d}")}</i><b>{c["t"]}</b>{corpo}</div>'
    return f'<div class="cards c{len(itens)}">{h}</div>'


def frase(texto, cls=''):
    return f'<section class="frase {cls}" data-nav="claro"><p data-palavras>{texto}</p></section>'


SB = '<span class="fone-sb"><b>9:41</b><i></i></span>'


def aparelho(src, legenda, alt=None, web=False):
    tela = f'<div class="fone-t web">{SB}<div class="fone-v"><img src="{src}" alt="{alt or legenda}" loading="lazy"></div></div>' if web else f'<div class="fone-t"><img src="{src}" alt="{alt or legenda}" loading="lazy"></div>'
    return f'<figure class="aparelho"><div class="fone tela">{tela}</div><figcaption>{legenda}</figcaption></figure>'


def tela_alta(src, legenda):
    return f'<figure class="aparelho alta"><div class="tela-a" data-cur="passe<br>o mouse"><img src="{src}" alt="{legenda}" loading="lazy"></div><figcaption>{legenda}</figcaption></figure>'


def fita(itens, cls=''):
    return f'<section class="fita {cls}" data-nav="{"claro" if "escuro" in cls else "escuro"}"><div class="fita-t">{"".join(itens)}</div></section>'


def regras(itens):
    h = ''.join(f'<li><i>{n}</i><b>{t}</b><span>{p}</span></li>' for n, t, p in itens)
    return f'<ul class="regras">{h}</ul>'


def numeros(itens):
    def um(v, l):
        if str(v).isdigit():
            return f'<div><b data-conta="{v}">{v}</b><span>{l}</span></div>'
        return f'<div><b>{v}</b><span>{l}</span></div>'
    return f'<div class="numeros n{len(itens)}">{"".join(um(v, l) for v, l in itens)}</div>'


def fig(src, alt, cls='', leg=''):
    cap_ = f'<figcaption>{leg}</figcaption>' if leg else ''
    return f'<figure class="zoom {cls}"><img src="{src}" alt="{alt}" loading="lazy">{cap_}</figure>'


def grade(figs, cols=2):
    return f'<div class="grade g{cols}">{"".join(figs)}</div>'


def banda(src, rot, titulo, texto, cls=''):
    return f'''<section class="banda {cls}" data-nav="claro">
  <img class="banda-i" src="{src}" alt="" loading="lazy">
  <div class="banda-c"><span class="rot">{rot}</span><h2 data-linhas>{titulo}</h2><p data-sobe>{texto}</p></div>
</section>'''


def vitrine(rot, titulo, texto, nome, src_d, src_m, cls=''):
    cel = f'<div class="fone tela vitrine-cel"><div class="fone-t web">{SB}<div class="fone-v"><img src="{src_m}" alt="{nome} no celular" loading="lazy"></div></div></div>' if src_m else ''
    return f'''<section class="vitrine {cls}" data-nav="claro">
  <div class="vitrine-topo"><div><span class="rot">{rot}</span><h2>{titulo}</h2></div><p>{texto}</p></div>
  <div class="vitrine-p-l"><span class="px">role dentro da tela para ver o site</span><span class="px vitrine-p">0%</span></div>
  <div class="vitrine-palco">
    <div class="janela"><div class="janela-b"><i></i><i></i><i></i><span>{nome}</span></div><div class="barra-r"><i></i></div><div class="janela-v"><img src="{src_d}" alt="{nome} em desktop"></div></div>
    {cel}
  </div>
</section>'''


def prototipo(rot, titulo, textos, url, nome, cls=''):
    """protótipo de verdade dentro de um celular: carrega só quando a pessoa toca (js/site.js, "protótipo")"""
    ps = ''.join(f'<p>{t}</p>' for t in textos)
    return f'''<section class="proto {cls}" data-nav="{'claro' if 'escuro' in cls else 'escuro'}">
  <div class="proto-txt"><span class="rot" data-sobe>{rot}</span><h2 data-linhas>{titulo}</h2><div class="proto-p" data-sobe>{ps}</div>
    <a class="proto-fora" href="{url}" target="_blank" rel="noopener">Abrir em outra aba {SETA}</a></div>
  <div class="fone proto-fone"><div class="fone-t"><div class="proto-v" data-src="{url}" data-nome="{nome}"><button class="proto-b" type="button"><span class="px">toque para usar</span><b>Abrir o protótipo</b></button></div></div></div>
</section>'''


def tabela(cab, linhas):
    h = '<div class="tab-l cab">' + ''.join(f'<span>{c}</span>' for c in cab) + '</div>'
    for l in linhas:
        h += '<div class="tab-l">' + ''.join(f'<span>{c}</span>' if i else f'<b>{c}</b>' for i, c in enumerate(l)) + '</div>'
    return f'<div class="tabela" data-sobe>{h}</div>'


def versoes(itens):
    return '<div class="versoes">' + ''.join(f'<div class="ver{" dest" if i == len(itens) - 1 else ""}"><i>{v}</i><b>{t}</b><p>{p}</p></div>' for i, (v, t, p) in enumerate(itens)) + '</div>'


def pagina(p):
    url = BASE + p['arq']
    autor = {'@type': 'Person', '@id': BASE + '#matheus', 'name': 'Matheus Saboia', 'jobTitle': 'Product Designer', 'url': BASE}
    ld = json.dumps({'@context': 'https://schema.org', '@graph': [
        {'@type': 'CreativeWork', '@id': url + '#case', 'name': p['titulo'], 'headline': p['seo'], 'description': p['desc'], 'url': url, 'image': BASE + p['arte'], 'inLanguage': 'pt-BR',
         'genre': 'Case de product design', 'author': autor, 'creator': autor, 'about': p['sobre'], 'isPartOf': {'@id': BASE + '#site'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Matheus Saboia', 'item': BASE},
            {'@type': 'ListItem', 'position': 2, 'name': 'Trabalhos', 'item': BASE + '#trabalhos'},
            {'@type': 'ListItem', 'position': 3, 'name': p['titulo'], 'item': url}]},
    ]}, ensure_ascii=False)
    meta = ''.join(f'<div><small>{k}</small><b>{v}</b></div>' for k, v in p['meta'])
    return f'''<!doctype html>
<html lang="pt-BR" class="sem-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{p['seo']} · Matheus Saboia</title>
<meta name="description" content="{p['desc']}">
<meta name="author" content="Matheus Saboia">
<link rel="canonical" href="{url}">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="pt_BR">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Matheus Saboia">
<meta property="og:title" content="{p['seo']} · Matheus Saboia">
<meta property="og:description" content="{p['desc']}">
<meta property="og:image" content="https://boiamatheus.github.io/portfolio/assets/img/capa.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="627">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<script type="application/ld+json">{ld}</script>
<meta name="theme-color" content="{p['cor']}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="assets/fonts/ZalandoSans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/site.css">
<script>document.documentElement.classList.remove('sem-js')</script>
</head>
<body class="caso-p {p['tema']}">
<div class="cortina" id="cortina" style="transform:none;background:{p['cor']}"></div>
<div class="cur" id="cur"></div><div class="cur-r" id="cur-r"></div>
<header class="nav">
  <a class="nav-m" href="index.html" data-vai="#15120f"><b></b>Matheus Saboia</a>
  <nav class="nav-l"><a href="index.html#trabalhos" data-vai="#15120f">Trabalhos</a><a href="index.html#sobre" data-vai="#15120f">Sobre</a><a href="#contato">Contato</a></nav>
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
{p['corpo']}
<nav class="volta" data-nav="escuro" aria-label="Navegação entre cases"><a href="{p['volta'][0]}" data-vai="{p['volta'][2]}"><span>{p['volta'][3]}</span><b>← {p['volta'][1]}</b></a><a href="index.html#trabalhos" data-vai="#15120f"><span>Ver tudo</span><b>Todos os cases</b></a></nav>
<a class="prox" href="{p['prox'][0]}" data-vai="{p['prox'][2]}" style="background:{p['prox'][2]};color:{p['prox'][3]}" data-cur="{p['prox'][6] if len(p['prox']) > 6 else 'próximo<br>case'}" data-nav="{p['prox'][4]}"><small>{p['prox'][5] if len(p['prox']) > 5 else 'Próximo case'}</small><b>{p['prox'][1]}</b></a>

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
<script src="js/gatos-atlas.js"></script>
<script src="js/gatos.js"></script>
<script src="js/hero.js"></script>
<script src="js/site.js"></script>
</body>
</html>
'''


RN = 'assets/renova/'
GG = 'assets/gg/'
NH = 'assets/rastreio/'

# ================= Renova =================
pecas = ''.join(f'<div><img src="{RN}peca-{a}.webp" alt="" loading="lazy"><span>{n}</span></div>' for a, n in [('colageno', 'Colágeno'), ('hialuronico', 'Hialurônico'), ('vitamina-c', 'Vitamina C'), ('vitamina-e', 'Vitamina E'), ('zinco', 'Zinco'), ('biotina', 'Biotina')])
mundos = ''.join(f'<figure class="mundo"><img src="{RN}mundo{i}.webp" alt="Mundo {i} do Renova Match" loading="lazy"><img class="chefe" src="{RN}chefe-{i}.webp" alt="" loading="lazy"><figcaption>Mundo {i}</figcaption></figure>' for i in range(1, 7))
renova = dict(
    tema='t-renova', nav='claro', cor='#e8563a', titulo='App Renova Be', seo='App Renova Be: case de product design', sobre=['Aplicativo móvel', 'Gamificação', 'Programa de recompensas', 'Autocuidado'],
    desc='Case de product design do app Renova Be (iOS e Android), por Matheus Saboia: rotina de tratamento, moeda em reais e dois jogos num app de autocuidado.',
    arte=RN + 'key-A.webp', rot='01 · App', h1='App<br>Renova Be',
    d='Rotina, recompensa e jogo num app de autocuidado. Primeiro o app, depois os dois jogos.',
    meta=[('Papel', 'Product designer, de ponta a ponta'), ('Período', 'Outubro e novembro de 2026'), ('Plataforma', 'iOS e Android'), ('Ferramentas', 'Figma, protótipo navegável e IA no processo')],
    corpo=''.join([
        cap('01 · O problema', 'O app era um<br>espelho do site.',
            ['Loja, sacola e conta, como no site. O pedido foi direto: o app tem outra dinâmica e não pode ser uma cópia do site.',
             'Redesenhei para dar um motivo de abrir todo dia, sem atrapalhar a compra: uma loja mais curta, uma moeda em reais e dois jogos com a cara da marca.'],
            cards([dict(n='antes', t='O que o app tinha', li=['Loja, sacola e conta, as mesmas telas do site', 'As mesmas promoções do site, sem nada exclusivo', 'Nenhum motivo para abrir sem intenção de compra']),
                   dict(n='depois', t='O que faltava', li=['Uma rotina diária ligada ao tratamento', 'Recompensa com valor real, que chega ao checkout', 'Algo leve para fazer em um minuto, todo dia'], dest=True)])),
        frase('A decisão mais importante foi o que <em>não</em> virou jogo.'),
        cap('02 · Duas áreas', 'Tratamento é sério.<br>Ganhe é leve.',
            ['O registro diário da dose é a prova da garantia. Se rendesse moeda, o app incentivaria registrar sem tomar.', 'Por isso o app tem duas áreas que não se misturam.'],
            regras([('Sério', 'Tratamento', 'Rotina, trilha de 90 dias que nunca zera, desafio e face scan.'), ('Leve', 'Ganhe', 'Para todas as clientes: jogos, roleta, baú e missões.'), ('Regra', 'Uma não paga a outra', 'Registrar a dose nunca rende moeda.')])),
        fita([aparelho(RN + 'a01-home.webp', 'Home'), aparelho(RN + 'a10-rotina.webp', 'Rotina'), aparelho(RN + 'a17-rotina-trilha.webp', 'Trilha de 90 dias'), aparelho(RN + 'a06-ganhe.webp', 'Ganhe'), aparelho(RN + 'a07-saldo.webp', 'Saldo Renova'), aparelho(RN + 'a08-roleta.webp', 'Roleta'), aparelho(RN + 'a13-checkin-popup.webp', 'Check-in'), aparelho(RN + 'a04-pdp.webp', 'Produto')]),
        cap('03 · Economia', 'Uma moeda que vale<br>dinheiro de verdade.',
            ['Pontos abstratos viraram Renova Coins em reais, com teto e validade. O desconto chega de verdade ao checkout.'],
            numeros([('R$ 0,01', 'cada Coin, sempre em reais'), ('R$ 20', 'de teto por mês, até R$ 1 por dia'), ('60', 'dias de validade'), ('1', 'desconto por pedido')]) + fig(RN + 'key-moedas.webp', 'Renovinha comemorando com moedas e o Saldo Renova no celular', 'fig-p larga')),
        banda(RN + 'key-B2.webp', 'Parte 2', 'Os jogos.', 'Rotina, recompensa e um pouco de bagunça boa.'),
        cap('04 · Renova Match', '90 fases para 90 dias<br>de tratamento.',
            ['Um match-3 em que as peças são os ativos dos produtos da marca. Cada mundo tem um chefão, que é uma dor que o produto combate.'],
            f'<div class="pecas" data-sobe>{pecas}</div>', 'escuro'),
        fita([aparelho(RN + 'g01-mapa.webp', 'Mapa'), aparelho(RN + 'g02-partida.webp', 'Partida'), aparelho(RN + 'g10-vitoria.webp', 'Vitória'), aparelho(RN + 'g14-ranking.webp', 'Ranking'), aparelho(RN + 'a02-home-jogue.webp', 'Entrada pela home')], 'escuro'),
        cap('05 · Toc Toc, Mini Colágeno!', '30 segundos de jogo<br>para quem tem 30.',
            ['O segundo jogo é rápido de propósito: cabe na fila do café.', 'Ele usa a mesma linguagem do Match, para os dois jogos serem da mesma família.'],
            cards([dict(t='Martele os monstrinhos', p='São as dores: rugas, manchas, flacidez.'), dict(t='Não bata no Mini', p='A embalagem nunca é o vilão.'), dict(t='Pegue o dourado', p='Poder do Colágeno, pontos em dobro.', dest=True)])
            + fig(RN + 'key-toctoc.webp', 'Arte do jogo Toc Toc, Mini Colágeno', 'fig-p larga'), 'escuro'),
        prototipo('Protótipo', 'Use o app<br>aqui mesmo.', ['É o mesmo protótipo que as usuárias testaram. Jogue uma fase, marque a dose do dia ou monte um kit até o botão de pagar.', 'Nada é comprado: o botão de finalizar leva para a loja e para aí.'], 'https://renova-prototipo-rn.renova-black-preview.workers.dev/?teste=1', 'Protótipo do app Renova Be'),
        cap('06 · Teste com usuárias', 'Quatro mulheres,<br>três tarefas.',
            ['Pedi para 4 mulheres de 27 a 61 anos, que tomam ou já tomaram suplemento, usarem o protótipo sozinhas no próprio celular. Nenhuma era cliente da marca. Elas tentaram jogar uma fase, marcar a dose do dia e escolher colágeno para 3 meses até o botão de pagar, e deram uma nota de 1 (muito difícil) a 7 (muito fácil) para cada tarefa.',
             'Todas concluíram as três tarefas. As duas mais velhas concluíram com dificuldade.'],
            numeros([('5,0', 'jogar uma fase (média de 1 a 7)'), ('5,8', 'marcar a dose do dia'), ('5,0', 'escolher o kit')])
            + cards([dict(n='4 de 4', t='Ninguém entendeu o que ganha', p='Todas ficaram em dúvida sobre a recompensa. “A expressão ganhar dinheiro me fez pensar que poderia receber um valor na minha conta.” (61 anos)'),
                     dict(n='4 de 4', t='Todas pediram um lembrete', p='A rotina foi a tarefa mais fácil, mas faltou o aviso. Duas procuraram a rotina dentro da página do produto.'),
                     dict(n='3 de 4', t='Queriam ver a economia', p='Todas escolheram o kit de 3 potes, mas queriam o preço por pote e a economia lado a lado, e saber se o brinde já está incluído.', dest=True)])),
        frase('“Não entendi se é possível receber <em>dinheiro de verdade.</em>”'),
        cap('07 · Próximos ajustes', 'O que muda<br>a partir daqui.',
            ['As mudanças seguem o que travou mais de uma pessoa. Depois, testo de novo as mesmas tarefas.'],
            tabela(['O que apareceu', 'O que vou mudar'], [['A recompensa não fica clara', 'Trocar “ganhar dinheiro” por “saldo para usar nas compras”, com um exemplo em reais antes da primeira fase'], ['Falta lembrete', 'Pedir o horário do lembrete ao começar a rotina'], ['A economia do kit não aparece', 'Preço por pote e economia lado a lado em cada kit, e brinde com “incluso no valor”'], ['As mais velhas tiveram mais dificuldade', 'Letras e botões principais maiores e um tutorial curto no primeiro acesso']])
            + '<p class="fora" data-sobe>Acessibilidade (WCAG AA), medida no protótipo com um script de contraste e de área de toque:</p>'
            + tabela(['O que a auditoria apontou', 'O que vou mudar'], [['“Comprar agora” em 9 px, com contraste de 3,7:1', 'Mínimo de 12 px e contraste de 4,5:1 nos textos de botão'], ['Favoritar, atendimento e notificações com 30 a 36 px de área de toque', 'Área de toque de 44 px, mesmo com o ícone menor'], ['A página declarada em inglês para o leitor de tela', 'Idioma da página em português (pt-BR)']])),
        cap('08 · Processo', 'Protótipo no<br>lugar de tela.',
            ['Em vez de entregar só telas, entreguei um protótipo navegável no celular. O time implementou a partir dele.',
             'O protótipo foi construído com o Claude Code em React, a partir das telas do Figma: as regras da rotina, o carrinho que leva à loja de verdade e cada fase dos jogos. As artes do jogo saíram do ChatGPT e os fundos animados dos mapas do Google Flow, sempre a partir de uma referência aprovada.'],
            numeros([('39', 'telas no protótipo'), ('180', 'fases'), ('2', 'jogos')])
            + f'<p class="fora" data-sobe>O case também está no <a href="{BEHANCE}" target="_blank" rel="noopener">Behance {SETA}</a></p>'),
    ]),
    volta=('index.html', 'Início', '#efe9e1', 'Voltar'),
    prox=('good-green.html', 'Good Green', '#0f2e2f', '#f3f7ea', 'claro'),
)

# ================= Good Green =================
gg = dict(
    tema='t-gg', nav='claro', cor='#0f2e2f', titulo='Good Green', seo='Good Green: case de site e lançamento', sobre=['E-commerce', 'Site de marca', 'Quiz de diagnóstico', 'Lançamento de produto'],
    desc='Case de UX/UI da Good Green, por Matheus Saboia: site completo, quiz de diagnóstico e jornada de lançamento de uma marca nova de bebida verde em pó.',
    arte=GG + 'banner-pote-inclinado.webp', rot='02 · Site e lançamento', h1='Good<br><em>Green</em>',
    d='Site completo e jornada de lançamento de uma marca nova de bebida verde em pó.',
    meta=[('Papel', 'Product designer: site, jornada e direção visual'), ('Momento', '2026, pré-lançamento'), ('Entrega', 'Site, quiz, landing pages e pop-ups'), ('Ferramentas', 'Figma, protótipo navegável e IA no processo')],
    corpo=''.join([
        cap('01 · O desafio', 'Uma categoria nova<br>para o Brasil.',
            ['Good Green é um suplemento em pó que vira bebida verde: uma medida em 300 ml de água. A categoria já é grande lá fora e pouca gente aqui conhece.',
             'O site precisava fazer duas coisas ao mesmo tempo: explicar o produto para quem nunca ouviu falar dele e parecer gostoso antes de parecer saudável.'],
            cards([dict(t='Dor primeiro, produto depois', p='O quiz mostra só as dores que a pessoa marcou, a causa e um dado com fonte. A Good Green entra depois, como solução.', dest=True),
                   dict(t='Figma antes do código', p='Cada tela nasce no Figma, em desktop e celular, e só depois vira página. Site e Figma andam iguais.')])),
        vitrine('02 · O site', 'A home, do topo ao rodapé.', 'Role em cima da janela ou do celular para ver o site do topo ao rodapé. Fora deles, o case continua.', 'Good Green · home', GG + 'home-d.webp', GG + 'home-m.webp'),
        frase('A bebida tem que parecer <em>gostosa</em> antes de parecer saudável.', 'f-gg'),
        cap('03 · O quiz', 'O quiz monta<br>o diagnóstico.',
            ['São quatro perguntas seguidas, sem tela educativa no meio.', 'O pop-up da roleta e o carrinho seguem a mesma linguagem: vidro, foto real e pouco texto.'],
            regras([('1', 'Quatro perguntas', 'Uma atrás da outra, sem interrupção.'), ('2', 'Só as dores marcadas', 'O resultado mostra o que a pessoa respondeu, com a causa de cada dor.'), ('3', 'Um dado com fonte', 'Cada dor vem com um número real, sem citar a marca.'), ('4', 'O produto no fim', 'A Good Green só aparece depois, como solução.')])),
        fita([aparelho(GG + 'quiz-m.webp', 'Quiz', web=True), aparelho(GG + 'roleta-m.webp', 'Roleta do pop-up', web=True), aparelho(GG + 'carrinho-m.webp', 'Carrinho', web=True), aparelho(GG + 'pdp-m.webp', 'Produto', web=True), aparelho(GG + 'lanc-m.webp', 'Página de lançamento', web=True), aparelho(GG + 'home-m.webp', 'Home', web=True)]),
        cap('04 · Lançamento', 'Antes de a loja abrir,<br>a marca precisa de lista.',
            ['Desenhei as páginas de entrada do pré-lançamento: captação para o grupo, calculadora de fibras e as páginas de apoio do site.'],
            grade([fig(GG + 'capt-d.webp', 'Página de captação do lançamento', '', 'Captação'), fig(GG + 'fibras-d.webp', 'Calculadora de fibras', '', 'Calculadora de fibras')], 2)),
        prototipo('O site funcionando', 'Navegue pelo<br>site inteiro.', ['A versão de celular do site, com quiz, roleta, carrinho e página de produto. É o mesmo site que aparece nos prints acima.'], 'https://good-green-br.pages.dev/', 'Site da Good Green', 'escuro'),
        cap('05 · Com as pessoas', 'Metade achou<br>que era suco.',
            ['As mesmas 4 mulheres olharam o topo do site por 5 segundos, sem rolar, e disseram o que a marca vendia. Depois navegaram por 2 minutos e explicaram o produto com as próprias palavras.'],
            numeros([('2 de 4', 'disseram “suco” no teste de 5 segundos'), ('4 de 4', 'entenderam que é suplemento depois de navegar'), ('0 de 4', 'fizeram o quiz')])
            + cards([dict(n='5 segundos', t='O topo parece bebida', p='As duas mais velhas leram “suco” ou “bebida natural”. As duas mais novas leram “suplemento”.'),
                     dict(n='navegação', t='Faltou o modo de preparo', p='3 de 4 pediram instruções simples: quanto tomar, como preparar, quantas vezes. “Parei porque prefiro textos curtos e informações diretas.” (61 anos)'),
                     dict(n='quiz', t='O quiz assustou', p='Nenhuma começou. Não sabiam quanto tempo leva, se teriam de cadastrar dados ou se era obrigatório.', dest=True)])
            + tabela(['O que apareceu', 'O que vou mudar'], [['O topo parece suco', 'Subtítulo do topo dizendo que é suplemento de fibras em pó, uma medida na água'], ['Faltou o preparo', '“Como tomar” em 3 passos logo depois da foto, com a dose do dia'], ['Quiz sem contexto', '“4 perguntas, 1 minuto, sem cadastro” no botão do quiz'], ['Preço por dose', 'Custo por dose e por mês perto do botão de compra']])),
    ]),
    volta=('renova.html', 'App Renova Be', '#e8563a', 'Case anterior'),
    prox=('rastreio.html', 'Rastreio', '#ecd9cb', '#2b1d15', 'escuro'),
)

# ================= Rastreio =================
nhv = dict(
    tema='t-nhv', nav='escuro', cor='#7d5b49', titulo='Rastreio de pedido · New Hair', seo='Rastreio de pedido da New Hair: case de UX', sobre=['Pós-compra', 'Rastreio de pedido', 'E-commerce', 'Design system'],
    desc='Case de UX da tela de rastreio de pedido da New Hair, por Matheus Saboia: achar todos os pedidos só com o CPF e pagar o Pix pendente na mesma tela.',
    arte=NH + 'hero.webp', rot='03 · Pós-compra · New Hair', h1='Rastreio<br><em>de pedido</em>',
    d='Encontrar todos os pedidos só com o CPF e saber, em uma frase, onde cada um está e quando chega.',
    meta=[('Papel', 'Design e produto'), ('Marca', 'New Hair'), ('Entrega', 'Tela de rastreio, design system e protótipo navegável'), ('Ferramentas', 'Figma e protótipo navegável')],
    corpo=''.join([
        cap('01 · Descoberta', '“Cadê o meu<br>pedido?”',
            ['É a pergunta mais repetida no atendimento de qualquer e-commerce. Na loja nova da New Hair não existia um lugar para a cliente acompanhar a entrega sem login.',
             'O caminho era uma área de conta genérica, e o link de rastreio salvo no pedido nem sempre levava ao lugar certo.'],
            cards([dict(t='Problema', li=['A cliente não sabe onde está o pedido e pergunta no WhatsApp.', 'Rastrear exigia login, senha e o código certo da transportadora.']),
                   dict(t='Objetivo', p='Achar todos os pedidos só com o CPF e entender em uma frase onde cada um está e quando chega.', dest=True),
                   dict(t='Como medir', li=['Menos contatos de “onde está meu pedido”.', 'Uso da tela de rastreio.', 'Pix pendente pago a partir da própria tela.'])])),
        cap('02 · Pesquisa', 'Como o mercado<br>resolve.',
            ['Olhei transportadoras e lojas que deixam rastrear sem login. O padrão: só CPF existe nas transportadoras, sempre com captcha. As lojas pedem um segundo dado e escondem dados pessoais.',
             'O que levei: só CPF, como a cliente pediu, mas com a régua da Shopify. Mostrar o mínimo (cidade e primeiro nome), a mesma resposta para CPF com e sem pedido, e limite de buscas.'],
            tabela(['Quem', 'O que pede', 'O que mostra', 'Proteção'], [['Correios', 'Código, ou CPF com login', 'Objetos dos últimos 180 dias', 'Captcha e login'], ['Jadlog', 'Código ou CPF', 'Todas as remessas do CPF', 'reCAPTCHA'], ['Loggi', 'Código + CPF como 2º fator', 'Mapa e quem recebeu', '2º fator'], ['Magalu', 'Pedido + 4 dígitos do CPF', 'Rastreio do pedido', 'Dado parcial'], ['Shopify', 'Pedido + e-mail ou telefone', 'Itens, total e status', 'Esconde endereço e rastreio'], ['VTEX', 'Código de 6 dígitos por e-mail', 'Pedidos e detalhe', 'Login sem senha']])),
        cap('03 · Viabilidade', 'O dado manda<br>no desenho.',
            ['Três descobertas sobre os dados do pedido mudaram a tela.'],
            cards([dict(t='A busca por CPF existe', p='A plataforma de pedidos busca por documento: dá para listar todos os pedidos de uma pessoa, filtrando pelo CPF exato.'),
                   dict(t='O rastreio detalhado ainda não chega', p='Os eventos da transportadora não vêm pela API hoje. A linha do tempo foi desenhada para recebê-los quando a integração existir.'),
                   dict(t='O Pix pendente é uma oportunidade', p='O pedido traz o código copia e cola e a validade. A tela vira um lugar para concluir o pagamento, não só para acompanhar.', dest=True)])),
        cap('Dado de caixa', 'Por que o Pix<br>entrou no rastreio.',
            ['Enquanto analisava o rastreio, fui olhar também os pagamentos. Revisitei os dados de quem comprava e de quem não comprava, pelo caixa da Yampi e não pelo pixel: 9.882 pedidos de agosto a novembro de 2026, separados por forma de pagamento.',
             'Com cartão, quase todo pedido vira pagamento. Com Pix, que é metade dos pedidos, mais de 4 em cada 10 nunca são pagos. O problema não estava na tela do checkout, e sim no Pix que fica para depois. Levei esse dado para a equipe.'],
            '<div class="pgx" data-sobe role="img" aria-label="Pedidos pagos por forma de pagamento: Visa 98,8%, Mastercard 98,6%, Elo 96,6%, Pix 57,4%">'
            + ''.join(f'<div class="pgx-l{" alerta" if n == "Pix" else ""}"><span class="pgx-n">{n}</span><span class="pgx-t"><i style="width:{v}%"></i></span><b>{str(v).replace(".", ",")}%</b></div>' for n, v in [('Visa', 98.8), ('Mastercard', 98.6), ('Elo', 96.6), ('Pix', 57.4)])
            + '<p class="pgx-leg">Pedidos pagos sobre pedidos criados, por forma de pagamento. Pix é 53% dos pedidos.</p></div>'
            + cards([dict(n='decisão', t='Não redesenhar o checkout', p='Ele aprovava 99% no cartão. Mexer na tela não traria o Pix de volta.'),
                     dict(n='o que fiz', t='Avisei a equipe', p='Com os números na mão, o time de CRM melhorou o fluxo de Pix abandonado. No rastreio, quem volta para saber do pedido encontra o Pix pendente com o código copia e cola e a validade.'),
                     dict(n='hoje', t='6 em cada 10 Pix pagam', p='Contra 44% no começo de agosto. A subida maior veio antes desta análise, por isso ela entra aqui como contexto, não como resultado meu.', dest=True)])),
        frase('O problema não era a tela do checkout. Era o Pix que <em>ficava para depois.</em>', 'f-nhv'),
        cap('04 · Baixa fidelidade', 'Primeiro a ordem,<br>depois a cor.',
            ['Três telas em cinza para validar a hierarquia no celular. A cliente quer saber, nessa ordem: quando chega, onde está e os detalhes.'],
            fig(NH + 't-wireframes.webp', 'Wireframes em cinza das três telas: busca, lista e pedido aberto', 'fig-p larga')
            + regras([('Busca', 'Um campo, um botão', 'O botão só liga com CPF válido. A nota de segurança fica colada no campo: é ali que nasce a dúvida.'), ('Lista', 'O produto é o destaque', 'Não o número de 16 dígitos. Pílula de status e barrinha de 4 etapas: dá para ler sem abrir.'), ('Pedido', 'A previsão vem em cima', 'É o que a pessoa veio ver. Depois, uma linha do tempo só, e código, endereço e itens por último.')])),
        cap('05 · Iteração', 'Quatro versões<br>até a final.',
            ['Cada rodada de feedback virou uma versão nova, já com os dados reais do pedido.'],
            versoes([('v1', 'A base', 'Busca por CPF, lista de pedidos e linha do tempo.'), ('v2', 'Uma linha do tempo só', 'Os eventos da transportadora entram dentro de “Enviado”. Ícones em cada etapa e a situação no topo do pedido.'), ('v3', 'Mais New Hair, mobile first', 'Caramelo e nudes da marca, título em itálico. Produto como destaque, pílula com ícone, botões de 44 px.'), ('v4', 'A partir das referências', 'Previsão grande (“Chega amanhã”), painéis e faixa de atendimento em caramelo cheio. Ajustes finos no pé e na nota do CPF.')])),
        fita([tela_alta(NH + 't-busca.webp', 'Busca'), tela_alta(NH + 't-lista.webp', 'Lista de pedidos'), tela_alta(NH + 't-a-caminho.webp', 'Pedido a caminho'), tela_alta(NH + 't-pix-pendente.webp', 'Pix pendente'), tela_alta(NH + 't-entregue.webp', 'Entregue'), tela_alta(NH + 't-sem-pedidos.webp', 'CPF sem pedidos')]),
        cap('06 · Desktop e sistema', 'No desktop, o título<br>ao lado da busca.',
            ['Na tela larga, o pedido aberto ganha duas colunas: a linha do tempo à esquerda, o código e os detalhes à direita.', 'Cada peça é um componente com variantes no Figma, com os mesmos nomes e cores usados no desenvolvimento: pílula de status nos 5 estados do pedido, botões (incluindo o estado “copiado”), etapa da linha do tempo feita, atual e pendente, cartão do pedido, faixa de atendimento e 22 ícones no desenho do Lucide.'],
            grade([fig(NH + 't-desktop.webp', 'Tela de rastreio em desktop', 'fig-p', 'Desktop'), fig(NH + 't-componentes.webp', 'Componentes do design system do rastreio', 'fig-p', 'Componentes')], '2 iguais')),
        cap('07 · Resultado', 'No ar, com<br>dados reais.', [],
            cards([dict(t='O que foi entregue', li=['Rastreio só com o CPF, publicado na loja nova.', 'Todos os estados: Pix pendente, separação, a caminho, entregue, cancelado, sem pedidos, erro e limite.', 'Design system com tokens, componentes e ícones.']),
                   dict(t='Decisões que pesaram', li=['Segurança: só cidade, a mesma resposta para CPF sem pedido, limite de buscas.', 'O Pix pendente dentro do rastreio: acompanhar vira também concluir o pagamento.', 'Uma linha do tempo só, com a transportadora dentro dela.'], dest=True),
                   dict(t='Próximos passos', li=['Eventos da transportadora em tempo real, pela integração interna.', 'Aviso de “saiu para entrega”.', 'Medir os contatos de rastreio no atendimento antes e depois.'])])
            + '<p class="fora" data-sobe>Acessibilidade (WCAG AA), conferida na tela no ar:</p>'
            + numeros([('37 de 37', 'textos com contraste AA'), ('54 px', 'altura do botão principal'), ('100%', 'campos com rótulo e imagens com texto alternativo')])
            + '<p class="fora" data-sobe>Próximo ajuste: os botões do modo de demonstração e o do WhatsApp têm 36 a 40 px de altura, abaixo dos 44 px recomendados para toque.</p>'),
        prototipo('Teste você', 'Busque um<br>pedido.', ['A tela no ar, em modo de demonstração: escolha um cenário (Pix pendente, a caminho, entregue) e busque. Os dados são fictícios, nenhum pedido real aparece.'], 'https://www.newhair.com.br/rastreio?demo=1', 'Rastreio da New Hair em demonstração'),
        cap('08 · Com as clientes', 'Entenderam<br>sem explicação.',
            ['Mostrei a tela no ar para as mesmas 4 mulheres, duas delas clientes da New Hair, e perguntei o que precisavam fazer ali, só olhando.'],
            numeros([('4 de 4', 'entenderam na hora que é para digitar o CPF'), ('6,3', 'facilidade média (de 1 a 7)'), ('4 de 4', 'já perguntaram “cadê meu pedido?” a alguma loja')])
            + cards([dict(n='primeira olhada', t='Uma função só ajuda', p='Foi a experiência mais fácil para 3 das 4. “Tem uma função só.” (61 anos)'),
                     dict(n='confiança', t='O CPF ainda gera receio', p='3 de 4 queriam saber por que o CPF é pedido e como os dados são protegidos antes de digitar.'),
                     dict(n='expectativa', t='Queriam ver o caminho antes', p='Sem buscar, não sabiam que a tela mostra a linha do tempo, a transportadora e a previsão. Uma pediu um botão grande para o WhatsApp.', dest=True)])
            + tabela(['O que apareceu', 'O que vou mudar'], [['Receio com o CPF', 'Nota curta ao lado do campo: para que o CPF é usado e o que a tela mostra'], ['Não sabiam o que vem depois', 'Uma prévia do resultado embaixo da busca: previsão, etapas e transportadora'], ['Querem falar com alguém', 'Botão de WhatsApp visível também antes da busca']])),
    ]),
    volta=('good-green.html', 'Good Green', '#0f2e2f', 'Case anterior'),
    prox=('vira-cam.html', 'Vira Cam', '#0f0e0e', '#ffffff', 'claro'),
)


# ================= Vira Cam =================
VC = 'assets/vira/'
APP = 'https://vira-cam.renova-black-preview.workers.dev/'
vira = dict(
    tema='t-vira', nav='claro', cor='#0f0e0e', titulo='Vira Cam · câmera do celular no OBS', seo='Vira Cam: web app feito com IA e testado ao vivo', sobre=['Produto digital', 'Web app', 'Live', 'IA no processo', 'Design system'],
    desc='Case de produto de Matheus Saboia: Vira Cam, web app que transforma qualquer celular em câmera do OBS pelo Wi-Fi. Feito do zero com IA e testado numa live de verdade.',
    arte=VC + 'hero.webp', rot='04 · Produto próprio · feito com IA', h1='Vira<br><em>Cam</em>',
    d='Qualquer celular vira câmera do OBS pelo Wi-Fi, sem instalar nada. Feito do zero com IA e testado numa live de verdade.',
    meta=[('Papel', 'Produto, UX/UI e direção'), ('Período', 'Outubro e novembro de 2026'), ('Plataforma', 'Web app: celular e computador'), ('Ferramentas', 'IA, design system e protótipo')],
    corpo=''.join([
        cap('01 · Problema', 'Duas câmeras<br>que não conversavam.',
            ['Nas lives da marca, um iPhone entrava por cabo e outro pelo Wi-Fi, cada um com um aplicativo e um programa diferente no computador. Na hora da live, as duas câmeras não ficavam conectadas juntas.',
             'Era preciso usar vários celulares como câmera, em pé, sem instalar nada e sem cair numa live de horas.'],
            cards([dict(t='Problema', li=['Dois aplicativos e dois programas para duas câmeras.', 'Conexão que caía no meio da live.']),
                   dict(t='Objetivo', p='Abrir um link no celular e ele virar câmera do OBS, em 9:16, com até 5 celulares ao mesmo tempo.', dest=True),
                   dict(t='Restrições', li=['Nada para instalar no celular.', 'Uma live dura horas: tudo precisa se recuperar sozinho.'])])),
        cap('02 · Pesquisa', 'O cabo não era<br>o caminho.',
            ['Antes de desenhar, pesquisei como um celular pode mandar vídeo para o computador e o que derruba uma câmera no meio da live.'],
            cards([dict(n='achado', t='O navegador não manda vídeo por cabo', p='Toda webcam de celular por cabo depende de aplicativo e de programa no computador. Para uma página, o cabo só serve como rede.'),
                   dict(n='achado', t='No mesmo Wi-Fi, o vídeo vai direto', p='Do celular para o computador, sem passar por servidor. A internet só ajuda os dois a se encontrarem.'),
                   dict(n='achado', t='O que derruba a câmera', p='Wi-Fi que oscila, ligação que toma a câmera, tela que apaga. Cada caso ganhou uma saída automática.', dest=True)])),
        frase('O celular abre um link e <em>vira câmera.</em>', 'f-vira'),
        cap('03 · No celular', 'Uma câmera,<br>não um formulário.',
            ['A tela ao vivo é um visor: a imagem ocupa a tela, o estado fica numa pílula que acende em vermelho quando o OBS recebe a imagem, e os controles ficam ao alcance do polegar.',
             'Para quem está no tripé, um toque apaga a tela sem desligar a câmera. Para quem vai entrar ao vivo, o botão “Ver como no Instagram” mostra o que a live cobre por cima da imagem.'],
            ''),
        fita([aparelho(VC + 'c-tutorial.webp', 'Primeira vez'), aparelho(VC + 'c-entrada.webp', 'Entrada'), aparelho(VC + 'c-ao-vivo.webp', 'Ao vivo'), aparelho(VC + 'c-guia.webp', 'Ver como no Instagram'), aparelho(VC + 'c-ajustes.webp', 'Ajustes'), aparelho(VC + 'c-trocar.webp', 'Trocar de câmera'), aparelho(VC + 'c-bloqueada.webp', 'Câmera bloqueada'), aparelho(VC + 'c-apagada.webp', 'Tela apagada')]),
        cap('04 · No computador', 'Para quem<br>opera o OBS.',
            ['Quem usa OBS está no computador. O painel mostra as 5 câmeras lado a lado: a câmera livre mostra o próprio QR, então basta apontar o celular para ela.',
             'Cada câmera tem o link pronto para colar no OBS, um passo a passo de como ligar, e um clique abre a imagem grande sem pedir outro vídeo ao celular.'],
            grade([fig(VC + 'd-painel.webp', 'Painel com as cinco câmeras, três conectadas e duas com QR', 'fig-p', 'Câmeras'), fig(VC + 'd-foco.webp', 'Câmera aberta em tamanho grande no painel', 'fig-p', 'Câmera grande'), fig(VC + 'd-obs.webp', 'Passo a passo para ligar a câmera no OBS', 'fig-p', 'Ligar no OBS'), fig(VC + 'd-conta.webp', 'Tela de entrar na conta no computador', 'fig-p', 'Conta')], '2 iguais')),
        cap('05 · Decisões', 'O que pesou<br>no desenho.', [],
            regras([('Equipe', 'Uma chave por equipe', 'Ela vai junto no QR e no link do OBS. Nenhuma outra tela consegue puxar a câmera de quem está ao vivo.'),
                    ('Zoom', 'O zoom acontece no OBS', 'O celular manda a imagem inteira e o OBS aplica o zoom e o enquadramento. A prévia no celular é igual ao que vai ao ar.'),
                    ('Vidro', 'Leve durante a live', 'Fora da transmissão, o vidro tem desfoque. Durante a live, vira uma camada translúcida simples, para a imagem seguir a 30 quadros por segundo.')])),
        cap('06 · Design system', 'Um sistema<br>só.',
            ['Celular, painel e conta usam as mesmas peças: paleta escura com o vermelho reservado para o que está no ar, Helvetica, pílulas de vidro e quatro durações de movimento.',
             'Todas as transições estão mapeadas, com duração, curva e o que dispara cada uma.'],
            grade([fig(VC + 's-cor.webp', 'Paleta do Vira Cam em pílulas', 'fig-p', 'Cor'), fig(VC + 's-comp.webp', 'Componentes do Vira Cam', 'fig-p', 'Componentes'), fig(VC + 's-mov.webp', 'Tabela de transições do Vira Cam', 'fig-p', 'Movimento')], 3)
            + f'<p class="fora" data-sobe><a class="proto-fora" href="{APP}sistema" target="_blank" rel="noopener">Abrir o design system {SETA}</a></p>'),
        cap('07 · Processo', 'Feito do zero<br>com IA.',
            ['Eu defini o problema, pesquisei, desenhei o fluxo e a interface e revisei cada tela. O código, os testes e as imagens foram feitos com IA, a partir das minhas instruções.'],
            cards([dict(n='código', t='App e testes com IA', p='A interface, a conexão entre celular e computador e um teste que liga 5 celulares e 5 OBS simulados a cada mudança.'),
                   dict(n='imagens', t='Pessoas geradas no ChatGPT', p='As cinco pessoas que aparecem nas câmeras de exemplo e as variações do ícone.'),
                   dict(n='meu papel', t='Produto e design', p='Problema, pesquisa, fluxo, interface, design system, revisão e o teste na live.', dest=True)])),
        cap('08 · Resultado', 'Testado<br>ao vivo.',
            ['O Vira Cam rodou a live de lançamento de outubro da New Hair, do começo ao fim, no lugar dos dois aplicativos.'],
            numeros([('5', 'celulares ao mesmo tempo'), ('30', 'quadros por segundo em cada câmera'), ('0', 'aplicativos para instalar')])
            + cards([dict(t='O que foi entregue', li=['Câmera no celular, painel no computador e conta.', 'Tutorial da primeira vez e todos os estados de erro.', 'Design system com movimento mapeado.']),
                     dict(t='Próximos passos', li=['Contas de verdade, ligadas ao painel.', 'Versão para iPhone e Android nas lojas.', 'Teste com outras equipes de live.'], dest=True)])
            + f'<p class="fora" data-sobe><a class="proto-fora" href="{APP}" target="_blank" rel="noopener">Abrir o app no celular {SETA}</a> &nbsp; <a class="proto-fora" href="{APP}painel" target="_blank" rel="noopener">Abrir o painel {SETA}</a></p>'),
    ]),
    volta=('rastreio.html', 'Rastreio', '#7d5b49', 'Case anterior'),
    prox=('index.html#supervisao', 'Supervisão', '#15120f', '#efe9e1', 'claro', 'Último case · agora, quem aprova cada tela', 'conhecer'),
)

for nome, p in [('renova.html', renova), ('good-green.html', gg), ('rastreio.html', nhv), ('vira-cam.html', vira)]:
    p['arq'] = nome
    open(nome, 'w', encoding='utf-8').write(medidas(pagina(p)))
    print(nome, 'ok')

# ---------- carimbo de versão ----------
# Todo css e js local sai com ?v=<resumo do conteúdo> nas quatro páginas (a inicial inclusive).
# Sem isso o navegador mistura arquivo novo com antigo em cache e o site se comporta errado por alguns minutos.
import glob
import hashlib

resumo = hashlib.md5()
for f in sorted(glob.glob('css/*.css') + glob.glob('js/*.js')):
    resumo.update(open(f, 'rb').read())
V = resumo.hexdigest()[:8]
for nome in ('index.html', 'renova.html', 'good-green.html', 'rastreio.html', 'vira-cam.html'):
    t = open(nome, encoding='utf-8').read()
    t = re.sub(r'((?:href|src)="(?:css|js)/[\w\-]+\.(?:css|js))(?:\?v=\w+)?"', rf'\1?v={V}"', t)
    open(nome, 'w', encoding='utf-8').write(t)
print('versão', V)

# ---------- mapa do site (a data muda sozinha a cada geração) ----------
hoje = datetime.date.today().isoformat()
urls = [('', '1.0'), ('renova.html', '0.8'), ('good-green.html', '0.8'), ('rastreio.html', '0.8'), ('vira-cam.html', '0.8')]
open('sitemap.xml', 'w', encoding='utf-8', newline='\n').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + ''.join(f'  <url><loc>{BASE}{u}</loc><lastmod>{hoje}</lastmod><priority>{pr}</priority></url>\n' for u, pr in urls)
    + '</urlset>\n')
print('sitemap', hoje)
