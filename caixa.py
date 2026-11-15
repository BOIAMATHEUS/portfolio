# Pinta a caixa de papelão da introdução "Caixa" (fechada e aberta) em pixel art. Uso: python caixa.py
import os
import numpy as np
from PIL import Image, ImageDraw
os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.makedirs('assets/intro', exist_ok=True)
W, H, U = 208, 176, 2


def cor(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


class D:
    def __init__(s):
        s.im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        s.d = ImageDraw.Draw(s.im)

    def r(s, x, y, w, h, c):
        x0, y0, x1, y1 = round(x * U), round(y * U), round((x + w) * U) - 1, round((y + h) * U) - 1
        if x1 >= x0 and y1 >= y0:
            s.d.rectangle([x0, y0, x1, y1], fill=cor(c))

    def poly(s, pts, c):
        s.d.polygon([(round(x * U), round(y * U)) for x, y in pts], fill=cor(c))

    def xad(s, x, y, w, h, c):
        for py in range(round(y * U), round((y + h) * U)):
            for px in range(round(x * U), round((x + w) * U)):
                if (px + py) % 2 == 0 and s.im.getpixel((px, py))[3]:
                    s.im.putpixel((px, py), cor(c))

    def contorno(s, c='#2a1a0c'):
        a = np.array(s.im)
        al = a[..., 3] > 0
        dil = al.copy()
        dil[1:] |= al[:-1]
        dil[:-1] |= al[1:]
        dil[:, 1:] |= al[:, :-1]
        dil[:, :-1] |= al[:, 1:]
        o = np.zeros_like(a)
        o[dil & ~al] = cor(c)
        base = Image.fromarray(o)
        base.alpha_composite(s.im)
        s.im = base
        s.d = ImageDraw.Draw(s.im)


K, LUZ, SOM, ESC = '#c9995f', '#e3bb85', '#a3733f', '#7d5429'
FITA, FITA2 = '#f0e2c0', '#cdbb92'


def corpo(t):
    t.r(18, 42, 68, 42, K)
    t.r(18, 42, 68, 1, LUZ)
    t.r(18, 42, 1, 42, LUZ)
    t.r(79, 43, 7, 41, SOM)
    t.xad(76, 43, 3, 41, SOM)
    t.r(18, 80, 68, 4, SOM)
    t.xad(18, 77, 68, 3, SOM)
    # fita na frente
    t.r(48, 42, 8, 16, FITA)
    t.r(54.5, 42, 1.5, 16, FITA2)
    for x in (48, 50, 52, 54):
        t.r(x, 58, 1, 1, FITA)
    # etiqueta de envio
    t.r(58, 60, 20, 14, '#f7f2e8')
    t.r(58, 73, 20, 1, '#d5cdbf')
    t.r(60, 62, 10, 1, '#2a2420')
    t.r(60, 64.5, 14, .5, '#8c8478')
    t.r(60, 66, 11, .5, '#8c8478')
    for i in range(26):
        if i % 4 != 3 and i % 7 != 5:
            t.r(60 + i * .5, 68.5, .5, 3.5, '#2a2420')
    # frágil e para cima
    for x, y, w, h in ((24, 62, 7, 1), (25, 63, 5, 3), (27, 66, 1, 5), (25, 71, 5, 1), (36, 61, 1, 11), (34, 63, 5, 1), (35, 62, 3, 1), (32, 73, 9, 1)):
        t.r(x, y, w, h, ESC)
    # patinha carimbada
    for x, y, w, h in ((27, 49, 4, 3), (26, 46.5, 1.5, 1.5), (28.2, 45.5, 1.5, 1.5), (30.5, 46.5, 1.5, 1.5)):
        t.r(x, y, w, h, '#b07d47')


def fechada():
    t = D()
    corpo(t)
    t.poly([(18, 42), (86, 42), (78, 31), (26, 31)], LUZ)
    t.poly([(18, 42), (86, 42), (85, 40.5), (19, 40.5)], '#d6ab72')
    t.r(26, 31, 52, .5, '#f1d3a4')
    t.poly([(48, 42), (56, 42), (55, 31), (49, 31)], FITA)
    t.poly([(54.5, 42), (56, 42), (55, 31), (54, 31)], FITA2)
    t.poly([(51.6, 42), (52.4, 42), (52.2, 31), (51.8, 31)], '#b89c6a')
    t.contorno()
    return t.im


def aberta():
    t = D()
    # aba de trás, de pé
    t.poly([(26, 31), (78, 31), (74, 14), (30, 14)], '#b58449')
    t.poly([(30, 14), (74, 14), (73.5, 15.5), (30.5, 15.5)], '#d2a468')
    # boca escura
    t.poly([(18, 42), (86, 42), (78, 31), (26, 31)], '#3f2a14')
    t.poly([(21, 40), (83, 40), (77.5, 32.5), (26.5, 32.5)], '#2c1c0c')
    corpo(t)
    # abas dos lados abertas para fora
    t.poly([(18, 42), (26, 31), (9, 25), (1, 35)], '#dab57f')
    t.poly([(18, 42), (1, 35), (1.5, 36.5), (17, 43)], SOM)
    t.poly([(86, 42), (78, 31), (95, 25), (103, 35)], '#b98850')
    t.poly([(86, 42), (103, 35), (102.5, 36.5), (87, 43)], ESC)
    # aba da frente dobrada para baixo
    t.poly([(18, 42), (86, 42), (83, 53), (21, 53)], LUZ)
    t.poly([(21, 52), (83, 52), (83, 53), (21, 53)], SOM)
    t.poly([(48, 42), (56, 42), (55.5, 53), (48.5, 53)], FITA)
    # flocos de isopor
    for x, y in ((30, 36), (37, 34), (45, 37), (58, 34.5), (66, 37), (73, 35), (52, 33.5)):
        t.r(x, y, 3, 1.5, '#f7f2e8')
        t.r(x, y + 1, 3, .5, '#d5cdbf')
    t.contorno()
    return t.im


for nome, im in (('caixa-fechada', fechada()), ('caixa-aberta', aberta())):
    im.resize((W * 4, H * 4), Image.NEAREST).save(f'assets/intro/{nome}.webp', lossless=True, method=6)
    print(nome, os.path.getsize(f'assets/intro/{nome}.webp') // 1000, 'KB')
