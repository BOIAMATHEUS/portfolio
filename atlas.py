# Monta as folhas de sprite dos gatos (assets/gatos/gato{0,1,2}.webp + js/gatos-atlas.js).
# Fonte: C:/Users/Matheus/GatosDesktop/sprites (pet da barra de tarefas) + fonte-gatos/*.png (quadros novos).
# Os grupos de quadro têm escalas nativas diferentes; tudo é igualado pela altura do gato andando (T).
import os, glob, re, json, math, statistics as st
from PIL import Image

T = 210
SP = 'C:/Users/Matheus/GatosDesktop/sprites/'
EXTRA = 'fonte-gatos/'


def carrega(f):
    im = Image.open(f).convert('RGBA')
    return im.crop(im.getbbox())


def area(im):
    return im.getchannel('A').point(lambda v: 255 if v > 110 else 0).histogram()[255]


def pes(im):
    """centro horizontal dos pés (faixa de baixo), para ancorar poses de braço estendido"""
    a = im.getchannel('A')
    h = im.height
    bb = a.crop((0, int(h * .86), im.width, h)).point(lambda v: 255 if v > 60 else 0).getbbox()
    return (bb[0] + bb[2]) / 2 if bb else im.width / 2


man = {}
for cat in '012':
    g = {}
    for f in glob.glob(SP + f'cat{cat}_*.png') + glob.glob(EXTRA + f'cat{cat}_*.png'):
        nome = re.match(r'cat\d_(.*)\.png', os.path.basename(f)).group(1)
        g[nome] = carrega(f)
    grp = lambda p: [g[k] for k in g if re.fullmatch(p + r'\d+', k)]
    k_old = T / g['1'].height
    sit = g['0'].height * k_old
    walks, runs = grp('w'), grp('r')
    k_w = T / (sum(i.height for i in walks) / len(walks))
    esc = {'': k_old, 'n': sit / ((g['n5'].height + g['n6'].height) / 2), 'w': k_w,
           'r': k_w * math.sqrt(st.median(area(i) for i in walks) / st.median(area(i) for i in runs)),
           'x': sit / g['x4'].height, 'd': sit / g['x4'].height}
    if 'g5' in g:
        esc['g'] = sit / g['g5'].height  # g5 = sentado de frente
    ims = {}
    for nome, im in g.items():
        k = esc[re.match(r'[a-z]*', nome).group(0)]
        ims[nome] = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    dx = {}
    for kind in 'wr':  # ciclos alinhados pelo focinho
        fr = {}
        for nome, im in ims.items():
            if re.fullmatch(kind + r'\d+', nome):
                a = im.getchannel('A')
                bb = a.crop((0, 0, im.width, int(im.height * .55))).point(lambda v: 255 if v > 60 else 0).getbbox()
                fr[nome] = (bb[2] if bb else im.width) - im.width / 2
        mid = st.median(fr.values())
        for k, v in fr.items():
            dx[k] = round(mid - v, 1)
    for nome, im in ims.items():  # poses novas ancoradas pelos pés
        if nome.startswith('g'):
            dx[nome] = round(im.width / 2 - pes(im), 1)
    W = 1800
    x = y = rowh = 0
    pos = {}
    for nome in sorted(ims):
        im = ims[nome]
        if x + im.width > W:
            x = 0; y += rowh + 2; rowh = 0
        pos[nome] = [x, y, im.width, im.height] + ([dx[nome]] if nome in dx else [])
        x += im.width + 2; rowh = max(rowh, im.height)
    H = y + rowh
    at = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for nome, im in ims.items():
        at.paste(im, tuple(pos[nome][:2]))
    at.save(f'assets/gatos/gato{cat}.webp', quality=90, method=6)
    # olhos (para a abertura no escuro): manchas verdes na cabeça dos quadros de frente
    olhos = {}
    for nome in ('0', 'x0', 'g5', 'x6'):
        if nome not in ims:
            continue
        import numpy as np
        from scipy import ndimage
        arr = np.asarray(ims[nome]).astype(int)
        r_, g_, b_, a_ = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
        m = (a_ > 200) & (g_ > 120) & (g_ - r_ > 25) & (g_ - b_ > 45)
        m[int(arr.shape[0] * .6):] = False
        lab, n = ndimage.label(m)
        if n < 2:
            continue
        tam = ndimage.sum(m, lab, range(1, n + 1))
        dois = sorted(sorted(range(n), key=lambda i: -tam[i])[:2], key=lambda i: ndimage.center_of_mass(m, lab, i + 1)[1])
        par = []
        for i in dois:
            ys, xs = np.nonzero(lab == i + 1)
            par.append([round(float(xs.mean()), 1), round(float(ys.mean()), 1), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)])
        olhos[nome] = par
    man[cat] = {'w': W, 'h': H, 'f': pos, 'sit': round(sit), 'olhos': olhos}
    print(cat, len(ims), W, H, os.path.getsize(f'assets/gatos/gato{cat}.webp'))
open('js/gatos-atlas.js', 'w').write('window.GATOS_ATLAS=' + json.dumps(man, separators=(',', ':')) + ';')
