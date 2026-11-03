"""Package a Cutsway prototype as a standalone site you can upload as-is (Netlify, Cloudflare Pages, Vercel, any static host).

    python tools/build_launch.py            # builds launch/nightshift and launch/rawpile
    python tools/build_launch.py rawpile    # just one

Each output folder is self-contained: index.html at the root, shared/ and assets/ beside it,
plus robots.txt, sitemap.xml, a 404 page and cache headers. Edit shared/site-config.js in the
output (or in prototypes/shared before building) to set the booking link, email and socials.
"""
import datetime, hashlib, html as htmllib, json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROTO = ROOT / 'prototypes'
OUT = ROOT / 'launch'
DOMAIN = 'https://cutsway.com'
# IndexNow (Bing, Yandex, Seznam...): proves the site is ours when pinging new URLs; served as /<key>.txt
INDEXNOW_KEY = '2fb9768b8df264a3b35a01701eda6b17'

SHARED = ['page.css', 'brand.css', 'site-config.js', 'page.js', 'ui.js', 'kit.js', 'brand.js', 'platforms.js', 'work.js',
          'favicon.svg', 'favicon.ico', 'logo.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'site.webmanifest', 'pages.css']
# Cutsway's own work (thumbnails, the reel), shown inside the worlds
WORK = lambda *names: {f'assets/work/{n}': f'assets/work/{n}' for n in names}
THUMBS = [f'thumb-{k}.jpg' for k in ('wealthy', 'stocks', 'creator', 'rawtalks', 'rawtalks-plain')]
PAGES = {
    'nightshift': {'files': ['editor.js', 'og.jpg', 'poster.jpg'], 'assets': {'assets/models/editor.glb': 'assets/models/editor.glb', **WORK(*THUMBS[:4], 'reel-podcast-sm.mp4')}},
    # rawpile is the live site at cutsway.com: it also gets the plain service and work pages (tools/site_pages.py)
    'rawpile': {'files': ['og.jpg', 'poster.jpg'], 'subpages': True,
                'assets': WORK(*THUMBS, 'raw-frames.jpg', 'reel-podcast.mp4', 'reel-podcast-sm.mp4', 'reel-podcast-poster.jpg')},
}

NOT_FOUND = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Not found · Cutsway</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#07070a">
<link rel="icon" href="/shared/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/shared/page.css">
<link rel="stylesheet" href="/shared/brand.css">
<style>
  body { min-height: 100svh; display: grid; align-content: end; gap: 24px; padding: var(--m); background: radial-gradient(70% 50% at 15% 110%, rgb(28 76 221 / 0.35), transparent 70%), radial-gradient(70% 50% at 90% 110%, rgb(251 59 39 / 0.3), transparent 70%), var(--night); }
  h1 { font-size: var(--step-giant); }
  p { margin: 0; max-width: 36ch; font-size: var(--step-lead); font-weight: 500; }
</style>
</head>
<body>
  <h1 class="display">cut.</h1>
  <p>This page didn't make the edit. The rest of the site is still here.</p>
  <a class="pill pill--solid" href="/">Back to Cutsway</a>
</body>
</html>
'''

HEADERS = '''/assets/*
  Cache-Control: public, max-age=31536000, immutable
/shared/*
  Cache-Control: public, max-age=3600
/*.jpg
  Cache-Control: public, max-age=86400
/assets/models/*.glb
  Content-Type: model/gltf-binary
'''

HOSTINGER_CONFIG = '''# Static Rawpile/Night Shift deployment on Hostinger (Apache/LiteSpeed).
DirectoryIndex index.html
ErrorDocument 404 /404.html
Options -Indexes
AddType video/mp4 .mp4
AddType image/svg+xml .svg
AddType model/gltf-binary .glb
AddType application/manifest+json .webmanifest
# one address: https, without www
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off [OR]
  RewriteCond %{HTTP_HOST} ^www\\. [NC]
  RewriteCond %{HTTP_HOST} ^(?:www\\.)?(.+)$ [NC]
  RewriteRule ^ https://%1%{REQUEST_URI} [L,R=301]
</IfModule>
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml text/plain application/xml
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 hour"
  ExpiresByType application/javascript "access plus 1 hour"
  ExpiresByType text/javascript "access plus 1 hour"
  ExpiresByType image/jpeg "access plus 1 day"
  ExpiresByType image/png "access plus 1 day"
  ExpiresByType image/svg+xml "access plus 1 day"
  ExpiresByType video/mp4 "access plus 1 day"
</IfModule>
'''


def bake_links(html):
    """Write the profile links from site-config.js into the HTML (page.js sets them too), so crawlers see them without
    running scripts; profiles left empty are hidden from the start."""
    cfg = (PROTO / 'shared' / 'site-config.js').read_text(encoding='utf-8')
    socials = dict(re.findall(r"(\w+): '([^']*)'", re.search(r'socials: \{([^}]*)\}', cfg).group(1)))
    def one(m):
        url = socials.get(m.group(1), '')
        return f'<a data-social="{m.group(1)}" href="{url}" target="_blank" rel="noopener me">' if url else f'<a data-social="{m.group(1)}" href="#" hidden>'
    return re.sub(r'<a data-social="(\w+)" href="#">', one, html)


def add_faq_schema(html):
    """FAQPage structured data, built from the page's own <details> questions so the two never drift apart."""
    qa = [(htmllib.unescape(re.sub(r'<[^>]+>', '', q)).strip(), htmllib.unescape(re.sub(r'<[^>]+>', '', a)).strip())
          for q, a in re.findall(r'<details><summary>(.*?)<svg.*?</summary><p>(.*?)</p></details>', html, re.S)]
    if not qa:
        return html
    data = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in qa]}
    return html.replace('</head>', f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>\n</head>', 1)


def build(name):
    cfg, src, dst = PAGES[name], PROTO / name, OUT / name
    dst.mkdir(parents=True, exist_ok=True)
    for old in dst.iterdir():   # empty it rather than delete it, so a server running inside it survives a rebuild
        shutil.rmtree(old) if old.is_dir() else old.unlink()
    (dst / 'shared').mkdir()
    for f in SHARED:
        shutil.copy2(PROTO / 'shared' / f, dst / 'shared' / f)
    for f in cfg['files']:
        shutil.copy2(src / f, dst / f)
    for a, b in cfg['assets'].items():
        (dst / b).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(PROTO / a, dst / b)
        if b.endswith('.jpg') and '/work/' not in b:   # photos ship at the size they are drawn, not the camera's (the work files already do)
            from PIL import Image
            im = Image.open(dst / b)
            if im.width > 1280:
                im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS).convert('RGB').save(dst / b, quality=82, optimize=True, progressive=True)
    # the work files keep their names when replaced, so work.js asks for them by content hash (same reason as below)
    work = (dst / 'shared' / 'work.js').read_text(encoding='utf-8')
    for b in cfg['assets']:
        if b.startswith('assets/work/'):
            n = b.rsplit('/', 1)[1]
            work = work.replace(f"'{n}'", f"'{n}?v={hashlib.md5((dst / b).read_bytes()).hexdigest()[:8]}'")
    (dst / 'shared' / 'work.js').write_text(work, encoding='utf-8')

    html = (src / 'index.html').read_text(encoding='utf-8')
    # './' keeps module imports valid (bare 'shared/x.js' is not a legal import specifier)
    html = html.replace('../shared/', './shared/').replace('../assets/', './assets/')
    html = html.replace('../awwwards/_shared/img/', './assets/img/')
    html = add_faq_schema(bake_links(html))
    # the CDN and browsers keep shared files for days: a content hash in each URL makes an update fetch only what changed,
    # and never pairs a new page with an old stylesheet
    for f in SHARED:
        v = hashlib.md5((dst / 'shared' / f).read_bytes()).hexdigest()[:8]
        html = re.sub(rf"(\./shared/{re.escape(f)})(?=[\"'])", rf'\g<1>?v={v}', html)
    left = re.findall(r'\.\./[\w/._-]+', html)
    assert not left, f'{name}: paths still point outside the site: {left}'
    (dst / 'index.html').write_text(html, encoding='utf-8')

    pages, page_images = [], {'/': [b for b in cfg['assets'] if re.search(r'work/thumb-[\w-]+\.jpg$', b)]}
    if cfg.get('subpages'):
        import site_pages
        h8 = lambda p: hashlib.md5(p.read_bytes()).hexdigest()[:8]
        pages, more = site_pages.build_all(html, lambda f: h8(dst / 'shared' / f), lambda n: h8(dst / 'assets' / 'work' / n))
        page_images.update(more)
        for path, page in pages:
            (dst / path.strip('/')).mkdir(parents=True, exist_ok=True)
            (dst / path.strip('/') / 'index.html').write_text(add_faq_schema(bake_links(page)), encoding='utf-8')

    (dst / '404.html').write_text(NOT_FOUND, encoding='utf-8')
    (dst / '_headers').write_text(HEADERS, encoding='utf-8')
    (dst / '.htaccess').write_text(HOSTINGER_CONFIG, encoding='utf-8')
    shutil.copy2(PROTO / 'shared' / 'favicon.ico', dst / 'favicon.ico')   # browsers ask for /favicon.ico whatever the page says
    (dst / f'{INDEXNOW_KEY}.txt').write_text(INDEXNOW_KEY, encoding='utf-8')
    (dst / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n', encoding='utf-8')
    # every page, with the work it shows (the home page draws its work on a canvas, so image search learns of it here)
    today = datetime.date.today().isoformat()
    urls = ''.join(f'  <url><loc>{DOMAIN}{path}</loc><lastmod>{today}</lastmod>'
                   + ''.join(f'\n    <image:image><image:loc>{DOMAIN}/{b}</image:loc></image:image>' for b in imgs) + '\n  </url>\n'
                   for path, imgs in page_images.items())
    (dst / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
        f'{urls}</urlset>\n', encoding='utf-8')
    size = sum(p.stat().st_size for p in dst.rglob('*') if p.is_file())
    print(f'{name}: {dst} ({size / 1024:.0f} KB)')


def build_preview():
    """launch/preview: a picker page at the root with both designs beside it, for one shareable link."""
    dst = OUT / 'preview'
    dst.mkdir(parents=True, exist_ok=True)
    for old in dst.iterdir():
        shutil.rmtree(old) if old.is_dir() else old.unlink()
    for name in PAGES:
        shutil.copytree(OUT / name, dst / name)
    (dst / 'shared').mkdir()
    for f in ['page.css', 'brand.css', 'favicon.svg', 'logo.svg', 'apple-touch-icon.png']:
        shutil.copy2(PROTO / 'shared' / f, dst / 'shared' / f)
    shutil.copy2(ROOT / 'tools' / 'preview_index.html', dst / 'index.html')
    (dst / '404.html').write_text(NOT_FOUND, encoding='utf-8')
    (dst / '_headers').write_text(HEADERS + '/*\n  X-Robots-Tag: noindex\n', encoding='utf-8')
    (dst / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')   # a preview, not the live site
    size = sum(p.stat().st_size for p in dst.rglob('*') if p.is_file())
    print(f'preview: {dst} ({size / 1024:.0f} KB)')


if __name__ == '__main__':
    names = sys.argv[1:] or list(PAGES)
    for n in names:
        build(n)
    if not sys.argv[1:]:
        build_preview()
