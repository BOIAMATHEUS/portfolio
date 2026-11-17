# Cenários da Supervisão em pixel art: pintados em 320x200, iluminados em faixas com pontilhado,
# salvos em três camadas (fundo, meio, frente) e ligados ao index.html com as partes animadas em SVG.
import os
import random
import numpy as np
from PIL import Image, ImageDraw
os.chdir('C:/Users/Matheus/Projetos/portfolio')
os.makedirs('assets/cenas', exist_ok=True)
W, H, U = 320, 200, 2


def cor(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


class D:
    """tela de desenho: coordenadas em unidades de 2 px (160 x 100), meia unidade = 1 px"""

    def __init__(s):
        s.im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        s.d = ImageDraw.Draw(s.im)

    def r(s, x, y, w, h, c):
        x0, y0, x1, y1 = round(x * U), round(y * U), round((x + w) * U) - 1, round((y + h) * U) - 1
        if x1 >= x0 and y1 >= y0:
            s.d.rectangle([x0, y0, x1, y1], fill=cor(c))

    def el(s, cx, cy, rx, ry, c):
        s.d.ellipse([round((cx - rx) * U), round((cy - ry) * U), round((cx + rx) * U) - 1, round((cy + ry) * U) - 1], fill=cor(c))

    def poly(s, pts, c):
        s.d.polygon([(round(x * U), round(y * U)) for x, y in pts], fill=cor(c))

    def ln(s, x0, y0, x1, y1, c, e=1):
        s.d.line([(round(x0 * U), round(y0 * U)), (round(x1 * U), round(y1 * U))], fill=cor(c), width=e)

    def xad(s, x, y, w, h, c):
        """pontilhado em xadrez por cima"""
        for py in range(round(y * U), round((y + h) * U)):
            for px in range(round(x * U), round((x + w) * U)):
                if (px + py) % 2 == 0 and 0 <= px < W and 0 <= py < H:
                    s.im.putpixel((px, py), cor(c))

    def prop(s, fn, contorno='#140d1c'):
        """desenha um objeto com contorno escuro de 1 px em volta"""
        t = D()
        fn(t)
        a = np.array(t.im)
        al = a[..., 3] > 0
        dil = al.copy()
        dil[1:] |= al[:-1]
        dil[:-1] |= al[1:]
        dil[:, 1:] |= al[:, :-1]
        dil[:, :-1] |= al[:, 1:]
        o = np.zeros_like(a)
        o[dil & ~al] = cor(contorno)
        s.im.alpha_composite(Image.fromarray(o))
        s.im.alpha_composite(t.im)


# ---------- luz ----------
BAYER = np.tile((np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + .5) / 16 - .5, (H // 4, W // 4))
YY, XX = np.mgrid[0:H, 0:W]


def faixas(f, n):
    return np.clip(np.floor(f * n + .5 + BAYER * .95) / n, 0, 1)


def ponto(cx, cy, rx, ry, p=1.5):
    return np.clip(1 - np.hypot((XX - cx * U) / (rx * U), (YY - cy * U) / (ry * U)), 0, 1) ** p


def feixe(pts, topo=1, base=1):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([(round(x * U), round(y * U)) for x, y in pts], fill=255)
    ys = [p[1] * U for p in pts]
    t = np.clip((YY - min(ys)) / max(1, max(ys) - min(ys)), 0, 1)
    return np.asarray(m) / 255. * (topo + (base - topo) * t)


def vinheta():
    return np.clip(np.hypot((XX - W / 2) / (W * .62), (YY - H * .45) / (H * .7)) - .45, 0, 1) * 1.6


def ilumina(im, amb, luzes, mascara=None, n=5):
    a = np.asarray(im).astype(float)
    L = np.ones((H, W, 3)) * np.array(amb)
    for f, c, forca in luzes:
        q = faixas(f, n)
        if mascara is not None and forca > 0:
            q = q * mascara
        L += q[..., None] * np.array(c) * forca
    a[..., :3] = np.clip(a[..., :3] * L, 0, 255)
    return Image.fromarray(a.astype('uint8'))


def salva(im, nome):
    im.resize((W * 4, H * 4), Image.NEAREST).save(f'assets/cenas/{nome}.webp', lossless=True, method=6)
    return os.path.getsize(f'assets/cenas/{nome}.webp') // 1000


def objeto(arq, o):
    """objeto que se mexe: camada própria, do tamanho do cenário, transparente em volta"""
    return f'<img class="sup-o" data-o="{o}" src="assets/cenas/{arq}.webp" alt="" width="1280" height="800" loading="lazy">'


def alvo(i, x, y, w, h, cur, rotulo):
    """área de toque em cima de um objeto do cenário (coordenadas em unidades de 160 x 100)"""
    return (f'<button class="sup-i" type="button" data-i="{i}" data-cur="{cur}" aria-label="{rotulo}" '
            f'style="left:{x / 1.6:.2f}%;top:{y}%;width:{w / 1.6:.2f}%;height:{h}%"></button>')


def caixa(t, x, y, w, h, tom='a', rotulo=None, fita=True):
    c, luz, som = {'a': ('#c9995f', '#e0b780', '#a3733f'), 'b': ('#b98850', '#d3a468', '#925f33'), 'c': ('#a87843', '#c2915a', '#80562c'), 'az': ('#3d6ea8', '#5b8cc6', '#2a5285'), 'br': ('#e9e2d6', '#ffffff', '#c4bba9')}[tom]
    t.r(x, y, w, h, c)
    t.r(x, y, w, .5, luz)
    t.r(x, y, .5, h, luz)
    t.r(x + w - 1, y + .5, 1, h - .5, som)
    t.r(x, y + h - .5, w, .5, som)
    if fita:
        fx = x + w / 2 - 1
        t.r(fx, y, 2, h, '#ecdcb8')
        t.r(fx + 1.5, y, .5, h, '#cdbb92')
    if rotulo:
        rx, ry, rw, rh = rotulo
        t.r(x + rx, y + ry, rw, rh, '#f4efe7')
        for i in range(int(rw * 2) - 2):
            if i % 3 != 2:
                t.r(x + rx + .5 + i * .5, y + ry + rh - 2, .5, 1.5, '#2a2420')


# ================= Luna: quarto à noite =================
def luna():
    rnd = random.Random(7)
    f, m, p = D(), D(), D()
    for x in range(0, 160, 8):
        f.r(x, 0, 8, 56, '#1e2449' if (x // 8) % 2 else '#1a2043')
    for x in range(4, 160, 8):
        for y in range(4, 54, 8):
            f.r(x - .5, y + ((x // 8) % 2) * 4, .5, .5, '#2a3160')
    f.r(0, 56, 160, 14, '#232a56')
    f.r(0, 56, 160, 1, '#3d4786')
    f.r(0, 57, 160, .5, '#141936')
    for x in range(3, 160, 20):
        f.r(x, 59, 15, 9, '#1f2651')
        f.r(x, 59, 15, .5, '#151a3a')
        f.r(x, 59, .5, 9, '#151a3a')
        f.r(x, 67.5, 15, .5, '#313a72')
        f.r(x + 14.5, 59, .5, 9, '#313a72')
    f.r(0, 70, 160, 4, '#30386c')
    f.r(0, 70, 160, .5, '#4d589a')
    f.r(0, 73.5, 160, .5, '#10142c')
    # piso de tábuas
    f.r(0, 74, 160, 26, '#32284e')
    for i, y in enumerate((74, 80.5, 87, 93.5)):
        f.r(0, y, 160, .5, '#1d1630')
        f.r(0, y + .5, 160, .5, '#3d325c')
        for x in range(-40 + i * 17, 160, 44):
            f.r(x, y, .5, 6.5, '#1d1630')
            f.r(x + .5, y + .5, .5, 6, '#3d325c')
        for _ in range(16):
            gx, gy = rnd.uniform(0, 156), y + rnd.choice((2, 3, 4, 5))
            f.r(gx, gy, rnd.choice((2, 3, 5)), .5, '#2a2143')

    def janela(t):
        t.r(86, 9, 58, 48, '#56619f')
        t.r(86, 9, 58, 1, '#7885c8')
        t.r(86, 9, 1, 48, '#7885c8')
        t.r(143, 9, 1, 48, '#3a4377')
        t.r(88, 11, 54, 43, '#070b24')
        for y, c in ((28, '#0b1130'), (36, '#10173d'), (44, '#18204d')):
            t.xad(88, y - 1, 54, 1, c)
            t.r(88, y, 54, 54 - y, c)
        t.el(124, 25, 14, 14, '#10173d')
        t.el(124, 25, 11.5, 11.5, '#1a2354')
        t.el(124, 25, 9.5, 9.5, '#28336e')
        for k in range(3):
            t.poly([(91 + k * 4, 24), (92 + k * 4, 24), (100 + k * 4, 12), (99 + k * 4, 12)], '#121a42')
        t.el(124, 25, 8, 8, '#f7f2d6')
        t.el(125.5, 26.5, 6.5, 6.5, '#e6dfb9')
        t.el(121, 22, 1.5, 1.5, '#cfc79c')
        t.el(127.5, 28, 2, 1.5, '#cfc79c')
        t.r(123, 29.5, 1, 1, '#cfc79c')
        t.r(128, 21.5, 1, .5, '#cfc79c')
        t.r(119, 20, 1.5, .5, '#ffffff')
        for _ in range(26):
            x, y = rnd.uniform(89, 141), rnd.uniform(12, 44)
            if abs(x - 124) > 11 or abs(y - 25) > 11:
                t.r(x, y, .5, .5, rnd.choice(('#aab4ff', '#7c88d8', '#ffffff')))
        for x, y in ((97, 18), (135, 40), (104, 36)):
            t.r(x, y - .5, .5, 1.5, '#ffffff')
            t.r(x - .5, y, 1.5, .5, '#ffffff')
        for x, y, w in ((88, 47, 7), (95, 44, 6), (101, 49, 8), (109, 42, 7), (116, 46, 9), (125, 49, 6), (131, 43, 8), (139, 47, 3)):
            t.r(x, y, w, 54 - y, '#04071a')
            for _ in range(int(w)):
                if rnd.random() < .55:
                    t.r(x + rnd.randrange(1, max(2, int(w * 2) - 1)) / 2, y + rnd.randrange(2, max(3, int((54 - y) * 2) - 1)) / 2, .5, .5, rnd.choice(('#f6d27e', '#f6d27e', '#8fd1ff')))
        t.r(112, 39, .5, 3, '#04071a')
        t.r(134, 40, .5, 3, '#04071a')
        t.r(114, 11, 2, 43, '#56619f')
        t.r(114, 11, .5, 43, '#7885c8')
        t.r(88, 31, 54, 2, '#56619f')
        t.r(88, 31, 54, .5, '#7885c8')
        t.r(83, 56, 64, 3, '#6b78bc')
        t.r(83, 56, 64, .5, '#93a0e4')
        t.r(83, 58.5, 64, .5, '#3a4377')
    f.prop(janela)
    f.r(85, 59.5, 60, .5, '#121631')

    def cortinas(t):
        t.r(74, 5, 82, 1.5, '#8b7bc4')
        t.r(74, 5, 82, .5, '#b3a5e6')
        t.el(74, 5.75, 1.5, 1.5, '#b3a5e6')
        t.el(156, 5.75, 1.5, 1.5, '#b3a5e6')
        for x0 in (77, 141):
            for i in range(6):
                c = ('#5f4c96', '#4b3a78', '#3b2c63', '#54428a', '#42326e', '#33265a')[i]
                t.r(x0 + i * 2, 6.5, 2, 52 + (i % 2), c)
            t.r(x0, 6.5, 12, 1, '#7361ac')
            t.r(x0, 57.5, 12, .5, '#2a1f4c')
    f.prop(cortinas)

    def quadro(t):
        t.r(18, 9, 26, 20, '#7a6bb0')
        t.r(18, 9, 26, .5, '#a596dc')
        t.r(18, 9, .5, 20, '#a596dc')
        t.r(20, 11, 22, 16, '#0f1438')
        t.r(20, 22, 22, 5, '#141b46')
        t.el(30, 19, 5, 3, '#f2a03d')
        t.el(29, 18.5, 3.5, 1.6, '#f9bf62')
        t.poly([(34, 19), (38, 15.5), (38, 22.5)], '#e58a2b')
        t.poly([(29, 16.5), (32, 14.5), (32, 16.5)], '#e58a2b')
        t.r(27, 18.5, 1, 1, '#0f1438')
        t.r(27, 18.5, .5, .5, '#ffffff')
        for x, y in ((23.5, 15), (24.5, 12.5), (22.5, 18)):
            t.r(x, y, 1, 1, '#5d74d6')
    f.prop(quadro)

    def estante(t):
        t.r(12, 46, 42, 1.5, '#7a6bb0')
        t.r(12, 46, 42, .5, '#a596dc')
        t.r(14, 47.5, 1, 2.5, '#54458a')
        t.r(51, 47.5, 1, 2.5, '#54458a')
        x = 14
        for w, h, c, c2 in ((2, 9, '#c44f82', '#e079a6'), (1.5, 8, '#e0a13d', '#f5c46c'), (2, 10, '#3f7fd1', '#6aa2ea'), (1.5, 7.5, '#57b862', '#83d68c'), (2.5, 9, '#8b6cc0', '#b094e0'), (2, 8, '#d9432f', '#f0705c')):
            t.r(x, 46 - h, w, h, c)
            t.r(x, 46 - h, .5, h, c2)
            t.r(x + .5, 46 - h + 1.5, w - 1, .5, c2)
            x += w
        t.poly([(27, 46), (29, 46), (32.5, 38), (30.5, 37.5)], '#e0a13d')
        t.r(40, 41, 6, 5, '#c9541e')
        t.r(39.5, 40.5, 7, 1.5, '#e06a2c')
        for lx, ly, lh in ((41, 35, 6), (43, 33, 8), (45, 36, 5)):
            t.r(lx, ly, .5, lh, '#3f9b4b')
            t.r(lx - 1, ly + 1, 1, .5, '#57b862')
            t.r(lx + .5, ly + 2.5, 1, .5, '#57b862')
    f.prop(estante)

    # meio: tapete, almofadão e abajur
    m.el(42, 91.5, 42, 6.5, '#2c2254')
    m.el(42, 91, 41, 6, '#3d3070')
    m.el(42, 91, 37, 5, '#54459a')
    m.el(42, 91, 33, 4.1, '#3d3070')
    m.el(42, 91, 31, 3.6, '#4a3b88')

    def almofada(t):
        t.el(42, 87, 27, 7, '#4f3784')
        t.el(42, 84.5, 26.5, 6.2, '#9478cf')
        t.el(42, 85, 22, 4.6, '#8366c0')
        t.el(42, 85.5, 18, 3.4, '#7458b0')
        t.r(21, 81.5, 7, .5, '#bda6ea')
        t.r(55, 80.5, 6, .5, '#bda6ea')
        t.r(30, 79.5, 5, .5, '#bda6ea')
        for x in range(18, 67, 3):
            dy = 6.2 * (1 - ((x - 42) / 26.5) ** 2) ** .5
            t.r(x, 84.5 + dy * .82, 1, .5, '#4f3784')
    m.prop(almofada)

    def abajur(t):
        t.r(63, 66, 14, 2, '#6a5a9a')
        t.r(63, 66, 14, .5, '#9485c8')
        t.r(64.5, 68, 1.5, 8, '#4a3c6c')
        t.r(74, 68, 1.5, 8, '#4a3c6c')
        t.r(65, 72, 10, 1, '#4a3c6c')
        t.r(67.5, 65, 5, 1, '#b89a5a')
        t.r(69, 61, 2, 4, '#d9c08a')
        t.poly([(65.5, 61), (74.5, 61), (72.5, 52.5), (67.5, 52.5)], '#f9d67c')
        t.poly([(67, 61), (69, 61), (68.5, 52.5), (67.5, 52.5)], '#fff3c4')
        t.r(65.5, 60, 9, 1, '#e3ab45')
    m.prop(abajur)

    def novelo(t):
        t.el(134, 87, 6, 6, '#d95f92')
        t.el(132.8, 85.6, 3.6, 3.4, '#ee86b0')
        t.r(131, 83.5, 2, .5, '#ffc3da')
        for y, c in ((85, '#b8477a'), (88.5, '#b8477a'), (90.5, '#a53c6c')):
            t.ln(129, y + 1, 139, y - 1, c)
        t.ln(132, 81.5, 135.5, 92.5, '#f5a3c5')
    nv = D()
    nv.prop(novelo)
    for x, y, w in ((121, 92, 8), (117, 93, 4.5), (112, 92.5, 5.5), (109, 91.5, 3.5)):
        nv.r(x, y, w, .5, '#d95f92')
        nv.r(x, y + .5, w, .5, '#8f2f5c')

    def ratinho(t):
        t.el(100, 91.5, 3.6, 2.2, '#9aa0b8')
        t.el(99, 90.8, 2.2, 1.2, '#c0c5d8')
        t.el(98, 89.8, 1.2, 1.2, '#e59ab8')
        t.r(96.5, 91.5, .5, .5, '#140d1c')
        t.r(103.5, 91.5, 3.5, .5, '#d95f92')
    rt = D()
    rt.prop(ratinho)

    vidro = np.ones((H, W))
    vidro[11 * U:54 * U, 88 * U:142 * U] = 0
    luzes = [(ponto(70, 57, 36, 32), (1.0, .7, .32), .85), (feixe([(96, 57), (140, 57), (128, 100), (50, 100)], 1, .7), (.5, .58, 1.0), .34), (vinheta(), (1, 1, 1), -.3)]
    amb = (.8, .82, .98)
    k = [salva(ilumina(f.im, amb, luzes, vidro), 'luna-f'), salva(ilumina(m.im, amb, luzes), 'luna-m'), salva(ilumina(p.im, amb, luzes), 'luna-p'),
         salva(ilumina(nv.im, amb, luzes), 'luna-novelo'), salva(ilumina(rt.im, amb, luzes), 'luna-rato')]
    est = ''.join(f'<rect x="{x}" y="{y}" width=".9" height=".9" fill="#fff" class="st" style="animation-delay:-{i * .41 % 2.4:.2f}s"/>' for i, (x, y) in enumerate(((92, 16), (104, 14), (108, 27), (95, 36), (137, 15), (138, 34), (111, 19), (100, 42), (131, 38))))
    sv = dict(
        f='<defs><radialGradient id="g-lua"><stop offset="0" stop-color="#f3efcf" stop-opacity=".42"/><stop offset=".5" stop-color="#f3efcf" stop-opacity=".12"/><stop offset="1" stop-color="#f3efcf" stop-opacity="0"/></radialGradient></defs><circle cx="124" cy="25" r="13" fill="url(#g-lua)" class="brilho" shape-rendering="auto"/>' + est,
        m='<defs><radialGradient id="g-abajur"><stop offset="0" stop-color="#ffd98a" stop-opacity=".5"/><stop offset=".5" stop-color="#f6c860" stop-opacity=".14"/><stop offset="1" stop-color="#f6c860" stop-opacity="0"/></radialGradient></defs><circle cx="70" cy="57" r="17" fill="url(#g-abajur)" class="brilho luz-abajur" shape-rendering="auto"/>'
          '<polygon points="65.5,61 74.5,61 72.5,52.5 67.5,52.5" fill="#3b3466" class="abajur-off" opacity="0"/>'
,
        p='')
    sv['f'] += '<g class="cadente" opacity="0"><polygon points="0,0 9,-4.5 9.4,-3.6 .6,.9" fill="#fff8d8" shape-rendering="auto"/><rect x="-.6" y="-.6" width="1.6" height="1.6" fill="#fff"/></g>'
    ex = dict(
        f=alvo('janela', 88, 11, 54, 44, 'olhar<br>a lua', 'Olhar a lua'),
        m=alvo('abajur', 61, 50, 18, 27, 'mexer no<br>abajur', 'Mexer no abajur'),
        p=objeto('luna-novelo', 'novelo') + objeto('luna-rato', 'rato')
          + alvo('novelo', 125, 78, 18, 17, 'rolar o<br>novelo', 'Rolar o novelo') + alvo('rato', 93, 86, 15, 9, 'apertar o<br>ratinho', 'Apertar o ratinho'))
    return 'luna', sv, (42, 86), k, ex


# ================= Zoro: depósito =================
def zoro():
    rnd = random.Random(11)
    f, m, p = D(), D(), D()
    f.r(0, 0, 160, 74, '#231d1a')
    for i, y in enumerate(range(0, 58, 4)):
        for x in range(-6 + (i % 2) * 6, 160, 12):
            c = rnd.choice(('#352d28', '#3a312b', '#312a25', '#3d342d'))
            f.r(x + .5, y + .5, 11, 3, c)
            f.r(x + .5, y + .5, 11, .5, '#443a33')
            if rnd.random() < .12:
                f.r(x + .5, y + .5, 11, 3, '#2b2420')
    f.r(0, 58, 160, 4.5, '#e0b23c')
    for x in range(-6, 166, 8):
        f.poly([(x, 62.4), (x + 4, 62.4), (x + 8, 58), (x + 4, 58)], '#1c1815')
    f.r(0, 58, 160, .5, '#f6d680')
    f.r(0, 62, 160, .5, '#8a6a1c')
    f.r(0, 62.5, 160, 11.5, '#27211d')
    for _ in range(14):
        f.r(rnd.uniform(0, 156), rnd.uniform(64, 72), rnd.choice((2, 3, 4)), .5, '#2f2823')
    # canos
    f.r(0, 2.5, 160, 3, '#55606b')
    f.r(0, 2.5, 160, .5, '#8793a0')
    f.r(0, 5, 160, .5, '#363d45')
    for x in (20, 62, 104, 146):
        f.r(x, 1.5, 2, 5, '#363d45')
    f.r(86, 5.5, 3, 68.5, '#55606b')
    f.r(86, 5.5, .5, 68.5, '#8793a0')
    f.r(88.5, 5.5, .5, 68.5, '#363d45')
    f.r(85.5, 30, 4, 1.5, '#363d45')
    f.el(87.5, 44, 3, 3, '#c9432f')
    f.el(87.5, 44, 1.6, 1.6, '#7a2418')
    f.r(87, 41, 1, 6, '#e0604c')
    # piso
    f.r(0, 74, 160, 26, '#3f362f')
    f.r(0, 74, 160, .5, '#574b41')
    for x in (50, 110):
        f.r(x, 74.5, .5, 25.5, '#2c2520')
        f.r(x + .5, 74.5, .5, 25.5, '#4a4038')
    f.r(0, 87, 160, .5, '#2c2520')
    for _ in range(40):
        f.r(rnd.uniform(0, 158), rnd.uniform(75, 99), .5, .5, rnd.choice(('#4a4038', '#342c26')))
    f.el(120, 84, 9, 2, '#39302a')
    for x in range(0, 160, 14):
        f.r(x, 96.5, 9, 1.5, '#b08a2a')
        f.r(x, 96.5, 9, .5, '#d0aa46')
    cx, cy = 70, 80
    for dx, dy in ((2, 1), (2, .5), (1.5, 1.5), (2.5, .5), (1, 1.5)):
        f.ln(cx, cy, cx + dx, cy + dy, '#2a231e')
        cx, cy = cx + dx, cy + dy

    def cartaz(t):
        t.r(28, 12, 22, 18, '#f4efe7')
        t.r(28, 12, 22, .5, '#ffffff')
        t.r(28, 29, 22, 1, '#d5cdbf')
        t.el(39, 20, 6, 6, '#d9432f')
        t.el(39, 20, 4.4, 4.4, '#f4efe7')
        t.el(39, 20.5, 1.7, 1.7, '#15120f')
        t.ln(35, 24, 43, 16, '#d9432f', 3)
        t.r(31, 27, 16, 1, '#8c8478')
        t.r(27.5, 11, 2, 2, '#c9432f')
        t.r(48.5, 11, 2, 2, '#c9432f')
    f.prop(cartaz)

    def prancheta(t):
        t.r(70, 31, 11, 16, '#8a6a45')
        t.r(70, 31, .5, 16, '#a88558')
        t.r(71, 33, 9, 13, '#f4efe7')
        t.r(73.5, 30, 4, 2, '#8793a0')
        for y, w in ((35, 6), (37, 5), (39, 6), (41, 4), (43, 5.5)):
            t.r(73.5, y, w - .5, .5, '#a39a8c')
        for y in (35, 37, 39):
            t.r(72, y - .25, 1, 1, '#7fb21f')
        t.r(72, 41, 1, .5, '#d9432f')
    f.prop(prancheta)

    def prateleira(t):
        t.ln(96, 12, 150, 68, '#363d45')
        t.ln(150, 12, 96, 68, '#363d45')
        caixa(t, 98, 15.5, 14, 12.5, 'a', (1.5, 2.5, 6, 5))
        caixa(t, 113.5, 21, 11, 7, 'br', None, False)
        t.r(115, 23, 5, 2.5, '#3d6ea8')
        caixa(t, 127, 13.5, 19, 14.5, 'c', (11, 3, 6, 5))
        caixa(t, 97, 35.5, 22, 12.5, 'a')
        caixa(t, 121, 40, 12, 8, 'b', None, False)
        t.r(122.5, 42, 4, 3, '#f4efe7')
        caixa(t, 135.5, 33.5, 13.5, 14.5, 'c')
        caixa(t, 98, 55.5, 16, 12.5, 'c', (1.5, 3, 5.5, 5))
        caixa(t, 116, 58, 13, 10, 'az', (7, 2, 4.5, 4))
        caixa(t, 131.5, 53.5, 17, 14.5, 'b')
        t.r(102, 33.5, 2, 2, '#15120f')
        t.r(107, 33.5, 2, 2, '#15120f')
        t.r(112, 33.5, 2, 2, '#15120f')
        for y in (28, 48, 68):
            t.r(94, y, 58, 2, '#6b7682')
            t.r(94, y, 58, .5, '#a3afbc')
            t.r(94, y + 1.5, 58, .5, '#454e57')
        for x in (94, 150):
            t.r(x, 10, 2, 64, '#6b7682')
            t.r(x, 10, .5, 64, '#a3afbc')
            t.r(x + 1.5, 10, .5, 64, '#454e57')
            for y in range(14, 72, 6):
                t.r(x + .5, y, 1, .5, '#2a2f35')
    f.prop(prateleira)
    f.r(100, 38.5, 16, 6.5, '#f4efe7')
    f.r(100, 44.5, 16, .5, '#c9c0b0')
    for y in (30, 50):
        f.xad(96, y, 54, 1.5, '#171310')

    def pilha(t):
        t.r(2, 71, 36, 1.2, '#a07c52')
        t.r(2, 71, 36, .5, '#c09a6a')
        for x in (3, 18, 33):
            t.r(x, 72.2, 4, 2.3, '#6d5234')
        caixa(t, 4, 49, 28, 22, 'a')
        caixa(t, 8, 34.5, 20, 14.5, 'b', (2, 3, 6, 5))
        caixa(t, 18.5, 26, 11, 8.5, 'c')
        for x, y, w, h in ((8, 56, 5, .5), (8.5, 56.5, 4, 2), (10, 58.5, 1, 4), (8.5, 62.5, 4, .5), (24, 55.5, 1, 7), (22, 57.5, 5, .5), (23, 56.5, 3, .5), (20, 63, 9, .5)):
            t.r(x, y, w, h, '#7a5326')
    f.prop(pilha)
    f.prop(lambda t: caixa(t, 38, 60, 13, 14, 'c', (1.5, 3, 5, 4)))

    def luminaria(t):
        t.r(63, 5.5, 1, 5, '#15120f')
        t.poly([(58.5, 12.5), (68.5, 12.5), (72.5, 17), (54.5, 17)], '#6b7682')
        t.poly([(58.5, 12.5), (62, 12.5), (58, 17), (54.5, 17)], '#a3afbc')
        t.r(60, 10.5, 7, 2, '#454e57')
        t.r(54.5, 16.5, 18, .5, '#363d45')
        t.el(63.5, 17.5, 3.4, 1.7, '#fff6c8')
    f.prop(luminaria)

    # meio: sombra da caixa dele, pegadas e fita
    for x, y in ((20, 83), (27, 86.5), (34, 83.5), (40, 87)):
        m.el(x, y, 1.3, 1, '#574b41')
        for dx in (-1.2, 0, 1.2):
            m.r(x + dx - .25, y - 1.8, .5, .5, '#574b41')

    def fita(t):
        t.el(88, 84, 4.2, 4.2, '#ecdcb8')
        t.el(88, 84, 3.2, 3.2, '#d6c398')
        t.el(88, 84, 2, 2, '#8a6a45')
        t.el(88, 84, 1.2, 1.2, '#3f362f')
        t.r(85, 81, 2, .5, '#fff6dc')
        t.r(91.5, 87.5, 9, 1, '#ecdcb8')
        t.r(91.5, 88, 9, .5, '#bfae84')
    ft = D()
    ft.prop(fita)

    def aberta(t):
        t.poly([(118, 83), (112, 79.5), (114.5, 78), (120, 81.5)], '#dcb27a')
        t.poly([(146, 83), (152, 79.5), (149.5, 78), (144, 81.5)], '#c2915a')
        t.r(118, 79.5, 28, 3.5, '#a3733f')
        t.r(119.5, 80.5, 25, 2.5, '#4a321a')
        for x, y in ((122, 80), (126.5, 79.5), (131, 80.5), (136, 79.5), (140.5, 80), (128, 81.5), (138, 81.5)):
            t.r(x, y, 2, 1, '#f4efe7')
            t.r(x, y + .5, 2, .5, '#d5cdbf')
        t.r(118, 83, 28, 17, '#c9995f')
        t.r(118, 83, 28, .5, '#e0b780')
        t.r(145, 83.5, 1, 16.5, '#a3733f')
        t.r(131, 83, 2, 17, '#ecdcb8')
        t.r(132.5, 83, .5, 17, '#cdbb92')
        t.r(121, 87, 7, 5, '#f4efe7')
        for i in range(10):
            if i % 3 != 2:
                t.r(121.5 + i * .5, 89.5, .5, 2, '#2a2420')
    p.prop(aberta)

    luzes = [(feixe([(55, 17), (72, 17), (118, 100), (24, 100)], 1, .62), (1.0, .86, .55), .78), (ponto(63.5, 20, 30, 24), (1.0, .85, .55), .4), (vinheta(), (1, 1, 1), -.3)]
    amb = (.66, .64, .64)
    k = [salva(ilumina(f.im, amb, luzes), 'zoro-f'), salva(ilumina(m.im, amb, luzes), 'zoro-m'), salva(ilumina(p.im, amb, luzes), 'zoro-p'),
         salva(ilumina(ft.im, amb, luzes), 'zoro-fita')]
    sv = dict(
        f='<text x="108" y="43.6" font-size="3.6" text-anchor="middle" fill="#15120f" font-family="Pixelify Sans, monospace">PINGOS</text><rect width="160" height="100" fill="#0c0806" class="apaga"/>',
        m='',
        p='<g class="pingo"><circle cx="108" cy="92" r="2.7" fill="#140d1c"/><circle cx="108" cy="92" r="2.1" fill="#f4efe7"/><rect x="106.6" y="90.6" width="1" height="1" fill="#fff"/></g>'
          + ''.join(f'<g class="pingo-cai" opacity="0"><circle cx="{x}" cy="44" r="1.9" fill="#140d1c"/><circle cx="{x}" cy="44" r="1.4" fill="#f4efe7"/></g>' for x in (103, 108, 113)))
    ex = dict(
        f=alvo('luz', 50, 8, 28, 13, 'apagar<br>a luz', 'Apagar a luz') + alvo('pingos', 96, 32, 24, 17, 'derrubar<br>os pingos', 'Derrubar os pingos')
          + alvo('caixinha', 36, 58, 17, 18, 'caixa<br>nova', 'Caixa nova'),
        m=objeto('zoro-fita', 'fita') + alvo('fita', 82, 78, 21, 12, 'rolar<br>a fita', 'Rolar a fita'),
        p=alvo('caixa', 116, 76, 32, 22, 'bater na<br>caixa', 'Bater na caixa') + alvo('pingo', 102, 87, 11, 9, 'chutar<br>o pingo', 'Chutar o pingo'))
    return 'zoro', sv, (132, 97), k, ex


# ================= Nacho: cozinha de manhã =================
def nacho():
    rnd = random.Random(5)
    f, m, p = D(), D(), D()
    for x in range(0, 160, 6):
        f.r(x, 0, 6, 74, '#f6b04a' if (x // 6) % 2 else '#f8b858')
    f.r(0, 0, 160, 3.5, '#fcd591')
    f.r(0, 3.5, 160, .5, '#d98f2e')
    f.r(0, 0, 160, .5, '#fff0cf')
    # azulejos
    f.r(57, 37, 80, 24, '#e9b062')
    for ty in range(3):
        for tx in range(10):
            x, y = 57.5 + tx * 8, 37.5 + ty * 8
            f.r(x, y, 7.5, 7.5, '#ffdda2')
            f.r(x, y, 7.5, .5, '#fff3d6')
            f.r(x, y, .5, 7.5, '#fff3d6')
            if (tx + ty * 2) % 5 == 1:
                f.poly([(x + 3.75, y + 1.5), (x + 6, y + 3.75), (x + 3.75, y + 6), (x + 1.5, y + 3.75)], '#f2a03d')
                f.r(x + 3.25, y + 3.25, 1, 1, '#fff3d6')

    def janela(t):
        t.r(8, 9, 46, 40, '#fff6e0')
        t.r(8, 9, 46, .5, '#ffffff')
        t.r(53, 9, 1, 40, '#e0c890')
        t.r(10, 11, 42, 36, '#a9defc')
        for y, c in ((22, '#bfe8ff'), (32, '#d6f2ff')):
            t.xad(10, y - 1, 42, 1, c)
            t.r(10, y, 42, 47 - y, c)
        t.el(41, 22, 9.5, 9.5, '#e9f6d8')
        t.el(41, 22, 8, 8, '#fff9cf')
        t.el(41, 22, 6, 6, '#fff09a')
        t.el(40, 21, 3.5, 3.5, '#fffbe0')
        for x, y, w in ((14, 27, 13), (16, 25, 8), (17.5, 23.5, 4)):
            t.r(x, y, w, 2, '#ffffff')
        t.r(14, 28.5, 13, .5, '#cfeaf8')
        for x, y, w in ((32, 36, 9), (33.5, 34.5, 5)):
            t.r(x, y, w, 1.5, '#ffffff')
        g = D()
        g.el(20, 50, 18, 8, '#7ecb6a')
        g.el(45, 52, 17, 9, '#63b356')
        g.el(18, 46.5, 7, 2, '#98dd82')
        for x in range(10, 52, 4):
            g.r(x + ((x // 4) % 2), 44.5 + ((x // 4) % 3) * .5, .5, 1, '#4b9a43')
        ga = np.array(g.im)
        fora = np.ones((H, W), bool)
        fora[11 * U:47 * U, 10 * U:52 * U] = False
        ga[fora] = 0
        t.im.alpha_composite(Image.fromarray(ga))
        t.r(30, 11, 2, 36, '#fff6e0')
        t.r(31.5, 11, .5, 36, '#e0c890')
        t.r(10, 28, 42, 2, '#fff6e0')
        t.r(10, 29.5, 42, .5, '#e0c890')
        # sanefa xadrez
        for i in range(23):
            for j in range(3):
                t.r(8 + i * 2, 9 + j * 2, 2, 2, '#d9432f' if (i + j) % 2 else '#fff6e0')
        for i in range(0, 23, 2):
            t.r(8 + i * 2, 15, 2, 1, '#d9432f')
        t.r(6, 49, 50, 3, '#ffe2a8')
        t.r(6, 49, 50, .5, '#fff3d6')
        t.r(6, 51.5, 50, .5, '#d98f2e')
    f.prop(janela, '#7a431a')

    def vaso(t):
        t.poly([(12.5, 43), (20.5, 43), (19.5, 49), (13.5, 49)], '#c9541e')
        t.r(12, 42, 9, 1.5, '#e4703a')
        t.r(13.5, 44, 1, 4.5, '#e4703a')
        for x, y, h in ((14, 35, 7), (16.5, 32.5, 9.5), (19, 36, 6)):
            t.r(x, y, .5, h, '#3f9b4b')
        for x, y in ((12.5, 37), (15, 34.5), (17, 33.5), (19.5, 37.5), (14.5, 39), (17.5, 37)):
            t.el(x + .5, y, 1.5, 1, '#57b862')
        t.r(16, 31.5, 1.5, 1.5, '#ffd24a')
    f.prop(vaso, '#5a2a0c')

    def relogio(t):
        t.el(84, 20, 10.5, 10.5, '#8a4b1c')
        t.el(83.5, 19.5, 8.5, 8.5, '#b06a2c')
        t.el(84, 20, 8.3, 8.3, '#fffaf0')
        t.el(84.6, 20.6, 7.2, 7.2, '#f4ead6')
        t.el(84, 20, 7.2, 7.2, '#fffaf0')
        for a in range(12):
            import math
            x, y = 84 + math.sin(a * math.pi / 6) * 6.3, 20 - math.cos(a * math.pi / 6) * 6.3
            t.r(x - .25, y - .25, 1 if a % 3 == 0 else .5, 1 if a % 3 == 0 else .5, '#2b1705')
        t.r(84, 19.5, 4, 1, '#2b1705')
    f.prop(relogio, '#4a240a')

    def prateleira(t):
        t.r(100, 31, 34, 1.5, '#8a4b1c')
        t.r(100, 31, 34, .5, '#b06a2c')
        t.r(102, 32.5, 1, 2.5, '#5a2a0c')
        t.r(131, 32.5, 1, 2.5, '#5a2a0c')
        t.r(103, 23.5, 5.5, 7.5, '#fdebc4')
        t.r(103.5, 24, 1, 6.5, '#ffffff')
        t.r(102.5, 22, 6.5, 1.5, '#8a4b1c')
        t.r(104.5, 27, 2, 2, '#c7651c')
        t.r(110.5, 25, 4.5, 6, '#cfeeff')
        t.r(111, 25.5, .5, 5, '#ffffff')
        t.r(110, 23.5, 5.5, 1.5, '#3d7fd1')
        t.r(111.5, 28, 2.5, 2.5, '#57b862')
        for x, c, c2 in ((117.5, '#d9432f', '#f0705c'), (123.5, '#3d7fd1', '#6aa2ea'), (129, '#57b862', '#83d68c')):
            t.r(x, 33, 4, 4.5, c)
            t.r(x, 33, 1, 4.5, c2)
            t.r(x + 4, 34, 1, 2.5, c)
        t.r(118, 24, 2, 7, '#e0a13d')
        t.r(120, 23, 2, 8, '#c44f82')
        t.r(122, 24.5, 1.5, 6.5, '#fff6e0')
    f.prop(prateleira, '#4a240a')

    def geladeira(t):
        t.r(137, 10, 24, 64, '#fff8e6')
        t.r(137, 10, 1.5, 64, '#e6d2a6')
        t.r(137, 10, 24, .5, '#ffffff')
        t.r(137, 33, 24, 1, '#cbb88c')
        t.r(137, 34, 24, .5, '#ffffff')
        t.r(140.5, 20, 1.5, 10, '#b9a57a')
        t.r(140.5, 20, .5, 10, '#e0cfa4')
        t.r(140.5, 38, 1.5, 12, '#b9a57a')
        t.r(140.5, 38, .5, 12, '#e0cfa4')
        t.r(137, 72, 24, 2, '#cbb88c')
        t.r(146, 39, 10, 9, '#ffffff')
        t.r(146, 47.5, 10, .5, '#d5cdbf')
        t.el(150.5, 43.5, 2.6, 1.6, '#f2a03d')
        t.poly([(152.5, 43.5), (154.5, 42), (154.5, 45)], '#e58a2b')
        t.r(149, 43, .5, .5, '#2b1705')
        t.r(150, 38, 2, 2, '#d9432f')
        t.r(147, 17, 6, 2.5, '#3d7fd1')
        t.poly([(153, 18.25), (155, 16.5), (155, 20)], '#3d7fd1')
        t.r(146, 24, 6, 6, '#ffe66e')
        t.r(147, 25.5, 4, .5, '#8a6a1c')
        t.r(147, 27, 3, .5, '#8a6a1c')
        t.r(148, 23, 2, 2, '#57b862')
    f.prop(geladeira, '#7a5a2a')

    def balcao(t):
        t.r(56, 60, 82, 3, '#8a4b1c')
        t.r(56, 60, 82, .5, '#c07a36')
        t.r(56, 62.5, 82, .5, '#5a2a0c')
        t.r(58, 63, 79, 9, '#c7651c')
        for x0, w in ((59, 24), (84, 24), (109, 27)):
            t.r(x0, 64, w, 7, '#d67524')
            t.r(x0 + 1.5, 65.5, w - 3, 4, '#bd5d16')
            t.r(x0 + 1.5, 65.5, w - 3, .5, '#9c4a0e')
            t.r(x0 + 1.5, 65.5, .5, 4, '#9c4a0e')
            t.r(x0, 64, w, .5, '#eb9140')
            t.r(x0 + w / 2 - 2, 64.7, 4, 1, '#ffe2a8')
        t.r(60, 72, 76, 2, '#5a2a0c')
    f.prop(balcao, '#3a1a06')

    def racao(t):
        t.r(63, 43, 15, 17, '#d9432f')
        t.r(63, 43, 2, 17, '#ef6a56')
        t.r(76, 43, 2, 17, '#b02d1c')
        for i in range(8):
            t.poly([(63 + i * 1.875, 43), (63.94 + i * 1.875, 41.2), (64.875 + i * 1.875, 43)], '#b02d1c')
        t.r(65, 46.5, 11, 6, '#fff6e0')
        t.el(69.5, 56, 2.6, 1.5, '#fff6e0')
        t.poly([(71.5, 56), (73.5, 54.5), (73.5, 57.5)], '#fff6e0')
        t.r(68, 55.5, .5, .5, '#d9432f')
    f.prop(racao, '#5a1208')

    def pote(t):
        t.r(83, 50, 9, 10, '#fdebc4')
        t.r(83.5, 50.5, 1, 9, '#ffffff')
        t.r(91, 50, 1, 10, '#e6c98a')
        t.r(82.5, 48, 10, 2, '#8a4b1c')
        t.r(82.5, 48, 10, .5, '#c07a36')
        for x, y in ((85, 56.5), (88, 57.5), (86.5, 53.5), (89, 54.5), (84.5, 58.5)):
            t.r(x, y, 2, 1.5, '#c7651c')
            t.r(x, y, 2, .5, '#e58a3a')
    f.prop(pote, '#5a2a0c')

    def torradeira(t):
        t.r(99, 52, 17, 8, '#efe6d6')
        t.r(99, 52, 17, 1, '#ffffff')
        t.r(99, 58.5, 17, 1.5, '#c4b89e')
        t.r(100, 53.5, 1, 4, '#ffffff')
        t.r(102, 52, 5, .5, '#2b1705')
        t.r(109, 52, 5, .5, '#2b1705')
        t.r(116, 54, 1.5, 3, '#2b1705')
        t.r(100, 60, 2, .5, '#2b1705')
        t.r(113, 60, 2, .5, '#2b1705')
    f.prop(torradeira, '#5a4a30')

    def frutas(t):
        t.el(126, 55.5, 2.4, 2.4, '#f28a1e')
        t.el(130, 55, 2.4, 2.4, '#f6a53a')
        t.el(128, 53, 2.2, 2.2, '#f28a1e')
        t.r(127, 51.5, 1, .5, '#fffbe0')
        t.r(128, 50.3, .5, 1, '#3f9b4b')
        t.poly([(122, 56), (134, 56), (132, 60), (124, 60)], '#3d7fd1')
        t.r(122, 56, 12, .5, '#6aa2ea')
    f.prop(frutas, '#1f3d6a')

    # piso xadrez
    f.r(0, 74, 160, 26, '#cf7d22')
    for i, (y, h) in enumerate(((74, 8), (82, 9), (91, 9))):
        for j, x in enumerate(range(-14, 160, 14)):
            c, c2 = (('#f6ad4e', '#fbc878') if (i + j) % 2 else ('#e9912f', '#f1a548'))
            f.r(x + .5, y + .5, 13.5, h - .5, c)
            f.r(x + .5, y + .5, 13.5, .5, c2)
            f.r(x + .5, y + .5, .5, h - .5, c2)
    f.r(0, 72, 56, 2, '#d67f22')
    f.r(0, 72, 56, .5, '#f1a548')
    f.r(0, 74, 160, .5, '#a85f12')

    # meio: sombra e jogo americano do pote
    m.el(46, 93.2, 18, 2.8, '#b8650f')

    def tapetinho(t):
        t.r(86, 88, 38, 6, '#d9432f')
        t.r(86, 88, 38, .5, '#f0705c')
        t.r(86, 93.5, 38, .5, '#9c2414')
        for x in range(87, 123, 4):
            t.r(x, 89.5, 2, .5, '#fff6e0')
            t.r(x + 2, 92, 2, .5, '#fff6e0')
    m.prop(tapetinho, '#5a1208')

    def tigela(t):
        t.el(105, 83.5, 14, 2.4, '#6aa2ea')
        t.el(105, 83.5, 11.5, 1.5, '#17406f')
        t.poly([(91, 84), (119, 84), (115.5, 93), (94.5, 93)], '#3d7fd1')
        t.poly([(91, 84), (95, 84), (97, 93), (94.5, 93)], '#5c9be6')
        t.poly([(115, 84), (119, 84), (115.5, 93), (113.5, 93)], '#2c62aa')
        t.r(94.5, 92.5, 21, .5, '#2c62aa')
        t.r(98, 83.4, 4, .5, '#cfe3ff')
    p.prop(tigela, '#12305a')
    for x, y in ((126, 92), (129, 90.5), (82, 92.5), (132, 93), (79, 90)):
        p.r(x, y, 1, 1, '#7a431a')
        p.r(x, y, .5, .5, '#b06a2c')

    luzes = [(feixe([(8, 51), (54, 51), (110, 100), (40, 100)], 1, .8), (1.0, .95, .7), .3), (ponto(31, 30, 46, 38), (1.0, .96, .8), .16), (vinheta(), (1, .92, .8), -.24)]
    amb = (.93, .9, .86)
    k = [salva(ilumina(f.im, amb, luzes), 'nacho-f'), salva(ilumina(m.im, amb, luzes), 'nacho-m'), salva(ilumina(p.im, amb, luzes), 'nacho-p')]
    po = ''.join(f'<rect x="{x}" y="{y}" width=".8" height=".8" fill="#fff" class="po" style="animation-delay:-{i * 1.1:.1f}s"/>' for i, (x, y) in enumerate(((40, 62), (52, 72), (60, 84), (48, 90), (68, 94), (30, 70))))
    sv = dict(
        f='<defs><clipPath id="c-torr"><rect x="100" y="0" width="16" height="52"/></clipPath><radialGradient id="g-sol"><stop offset="0" stop-color="#fffbe0" stop-opacity=".8"/><stop offset=".5" stop-color="#fffbe0" stop-opacity=".2"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient></defs>'
          '<circle cx="41" cy="22" r="12" fill="url(#g-sol)" class="brilho" shape-rendering="auto"/>'
          '<g clip-path="url(#c-torr)"><g class="torrada"><rect x="102.5" y="47.5" width="4" height="6" fill="#d99a4a"/><rect x="102.5" y="47.5" width="4" height="1" fill="#b87a2e"/><rect x="109.5" y="47.5" width="4" height="6" fill="#d99a4a"/><rect x="109.5" y="47.5" width="4" height="1" fill="#b87a2e"/></g></g>'
          '<g class="pont"><rect x="83.6" y="13.6" width=".9" height="6.8" fill="#d9432f"/></g><rect x="83.3" y="19.3" width="1.5" height="1.5" fill="#2b1705"/>'
          '<text x="70.5" y="51.1" font-size="3.1" text-anchor="middle" fill="#2b1705" font-family="Pixelify Sans, monospace">RAÇÃO</text>' + po,
        m='',
        p='<g class="monte" opacity="0">' + ''.join(f'<rect x="{x}" y="{y}" width="2" height="1.5" fill="#c7651c"/><rect x="{x}" y="{y}" width="2" height=".5" fill="#e58a3a"/>' for x, y in ((97, 82.4), (100, 81.6), (103, 82), (106, 81.4), (109, 82.2), (111.5, 82.6), (101.5, 80.4), (105, 80), (108, 80.6), (103.5, 78.9), (106.5, 79.1))) + '</g>'
          '<g class="voa"></g><text x="105" y="90.3" font-size="3.3" text-anchor="middle" fill="#fff" font-family="Pixelify Sans, monospace">NACHO</text>')
    ex = dict(
        f=alvo('racao', 61, 39, 19, 22, 'servir<br>ração', 'Servir ração') + alvo('torradeira', 97, 49, 21, 12, 'fazer<br>torrada', 'Fazer torrada')
          + alvo('relogio', 72, 8, 23, 24, 'ver<br>a hora', 'Ver a hora'),
        p=alvo('tigela', 89, 79, 32, 16, 'olhar a<br>tigela', 'Olhar a tigela'))
    return 'nacho', sv, (46, 93), k, ex


# cargo, nome, frase principal e nota. Cada texto é uma frase curta: a hierarquia é cargo < nome > frase > nota.
TXT = {
    'luna': ('Diretora de sonecas', 'Luna', 'Dorme em cima de tudo que já foi aprovado.', 'Se ela levanta, tem coisa piscando demais.'),
    'zoro': ('Logística e caixas', 'Zoro', 'Testa toda caixa que chega e derruba o que estiver solto.', 'Inclusive os pingos dos is.'),
    'nacho': ('Atendimento', 'Nacho', 'Pede ração a cada vinte minutos.', 'Segue o cursor de quem parecer ter comida.'),
}


def sem_orfa(t):
    """prende as duas últimas palavras, para nenhuma sobrar sozinha na última linha"""
    p = t.rsplit(' ', 1)
    return '&nbsp;'.join(p) if len(p) == 2 else t
html = ''
for fn in (luna, zoro, nacho):
    nome, sv, (ax, ay), k, ex = fn()
    print(nome, 'KB', k)
    s, b, t, nota = TXT[nome]
    cam = lambda c, extra='': f'<div class="cam {c}"><img src="assets/cenas/{nome}-{c}.webp" alt="" width="1280" height="800" loading="lazy">' + (f'<svg viewBox="0 0 160 100" shape-rendering="crispEdges" aria-hidden="true">{sv[c]}</svg>' if sv[c] else '') + extra + '</div>'
    html += f'''    <article class="sup-c s-{nome}" data-sobe>
      <div class="cena">{cam('f', ex.get('f', ''))}{cam('m', ex.get('m', '') + f'<span class="sup-g" style="left:{ax / 1.6:.2f}%;top:{ay}%"></span>')}{cam('p', ex.get('p', ''))}</div>
      <div class="sup-tx"><small>{s}</small><b>{b}</b><p class="sup-f">{sem_orfa(t)}</p><p class="sup-n">{sem_orfa(nota)}</p></div>
    </article>
'''
t = open('index.html', encoding='utf-8').read()
a = t.index('<div class="sup">') + len('<div class="sup">')
b = t.index('<div class="ferr"')
fim = t.rindex('</div>', a, b)
t = t[:a] + '\n' + html + '  ' + t[fim:]
open('index.html', 'w', encoding='utf-8').write(t)
print('cenas ok')
