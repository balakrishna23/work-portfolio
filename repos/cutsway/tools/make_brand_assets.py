"""Render the square icon set (shared/icon-*.png, favicon.ico, apple-touch-icon) and Raw Pile's 1200x630 share card (rawpile/og.jpg).
Run from the project root: python tools/make_brand_assets.py"""
import pathlib, base64
from playwright.sync_api import sync_playwright
from PIL import Image
P = pathlib.Path('prototypes'); SH = P / 'shared'
fav = (SH / 'favicon.svg').read_text(encoding='utf-8')
logo = (SH / 'logo.svg').read_text(encoding='utf-8')
thumbs = [base64.b64encode((P / f'assets/work/thumb-{k}.jpg').read_bytes()).decode() for k in ('wealthy', 'rawtalks', 'stocks')]
SPEC = '#272ed2,#1c4cdd,#108ae8,#03c0f4,#5ae2e8,#a9f0dc,#e8f8cd,#fcf397,#fddf4b,#fcb51c,#fc8020,#fb3b27,#e21c2f,#a81d30,#761a2b'
logo64 = base64.b64encode(logo.encode()).decode()
CARD = f'''<html><head><link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
<style>*{{margin:0;box-sizing:border-box}} body{{width:1200px;height:630px;background:#07070a;color:#f4f2ec;font-family:Archivo,sans-serif;overflow:hidden;position:relative}}
.glow{{position:absolute;inset:auto -10% -55% -10%;height:520px;background:radial-gradient(60% 60% at 50% 50%,rgba(3,192,244,.22),transparent 70%),radial-gradient(40% 50% at 80% 60%,rgba(251,59,39,.2),transparent 70%)}}
.logo{{position:absolute;left:72px;top:64px;width:780px;aspect-ratio:8.001/1;background:linear-gradient(90deg,{SPEC});-webkit-mask:url(data:image/svg+xml;base64,{logo64}) left/contain no-repeat}}
.line{{position:absolute;left:72px;top:184px;font-weight:800;font-stretch:112%;font-size:40px;line-height:1.12;letter-spacing:-.01em;max-width:900px}}
.k{{position:absolute;left:72px;top:296px;font-size:22px;font-weight:600;color:#a3a3b5;letter-spacing:.01em}}
.row{{position:absolute;left:72px;right:72px;bottom:52px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}}
.row img{{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:14px;box-shadow:0 0 0 1px rgba(244,242,236,.12)}}
.bar{{position:absolute;left:0;right:0;bottom:0;height:8px;background:linear-gradient(90deg,{SPEC})}}</style></head>
<body><div class="glow"></div><div class="logo"></div>
<div class="line">Video editing for gaming creators,<br>streamers and podcasters.</div>
<div class="k">Long-form · Shorts &amp; reels · Podcasts · Thumbnails · Posting  —  cutsway.com</div>
<div class="row">{''.join(f'<img src="data:image/jpeg;base64,{t}">' for t in thumbs)}</div><div class="bar"></div></body></html>'''
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 512, 'height': 512})
    pg.set_content(f'<html><body style="margin:0;background:#07070a">{fav.replace("<svg ", "<svg width=512 height=512 ", 1)}</body></html>')
    pg.screenshot(path=str(SH / 'icon-512.png'), clip={'x': 0, 'y': 0, 'width': 512, 'height': 512})
    pg = b.new_page(viewport={'width': 1200, 'height': 630})
    pg.set_content(CARD); pg.wait_for_timeout(1500)
    pg.screenshot(path=str(P / 'rawpile/og.png'))
    b.close()
big = Image.open(SH / 'icon-512.png').convert('RGB')
big.resize((192, 192), Image.LANCZOS).save(SH / 'icon-192.png', optimize=True)
big.resize((180, 180), Image.LANCZOS).save(SH / 'apple-touch-icon.png', optimize=True)
big.save(SH / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
Image.open(P / 'rawpile/og.png').convert('RGB').save(P / 'rawpile/og.jpg', quality=88, optimize=True, progressive=True)
(P / 'rawpile/og.png').unlink()
for f in ['icon-512.png', 'icon-192.png', 'apple-touch-icon.png', 'favicon.ico']: print(f, (SH / f).stat().st_size, 'B')
print('og.jpg', (P / 'rawpile/og.jpg').stat().st_size, 'B')
