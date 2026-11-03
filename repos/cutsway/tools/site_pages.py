"""Cutsway's plain pages beside the 3D home page: one per service, plus the work page.

They are what search engines can rank for specific searches ("gaming video editing", "podcast editing in Hyderabad"),
so each has its own title, headline, copy, turnaround, FAQ and structured data. No 3D: they load fast and read anywhere.
Called by build_launch.py for the live site (rawpile); every claim here matches the home page and shared/site-config.js.
"""
import html as htmllib, json, re
from pathlib import Path

DOMAIN = 'https://cutsway.com'
LANGS = 'English, Hindi and Telugu'
ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><use href="#arrow"/></svg>'
PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18" stroke="currentColor" stroke-width="2.5" fill="none"/></svg>'

# answers every page shares, so they read the same wherever Google quotes them
FAQ_LANG = ('Do you work in Hindi and Telugu?', f"Yes. We're based in Hyderabad and work in {LANGS}, with creators anywhere in India or abroad.")
FAQ_REV = ('How many revisions?', 'Two rounds on every edit, left as notes on the exact frame.')
FAQ_START = ('How do we start?', "Book a call or message us on WhatsApp. Tell us about your channel and what you need, and we'll get back to you within a day.")

SERVICES = [
    {
        'slug': 'gaming-video-editing', 'nav': 'Gaming video editing', 'need': 'video',
        'title': 'Gaming Video Editing for YouTube Creators | Cutsway',
        'desc': f'Gaming and long-form YouTube video editing from Cutsway in Hyderabad: story, pacing, sound design and the thumbnail, back in 36 hours. In {LANGS}.',
        'kicker': 'Cutsway · gaming & long-form YouTube editing', 'h1': 'gaming video editing',
        'lede': "Send the whole session: hours of gameplay, the clips you aren't sure about, the facecam. We cut it down to the part people finish.",
        'service': 'Gaming and long-form YouTube video editing',
        'cards': [
            ('Story and pacing', 'Loading screens, dead air, the twenty minutes where nothing happens: gone. The keepers go in the order that holds a viewer.'),
            ('Sound design', 'Music, effects and levels set so the big moments hit and the quiet ones never drag.'),
            ('The thumbnail, made alongside', 'Designed while we edit, so the thumbnail and the video promise the same thing.'),
            ('Stream VODs', 'One VOD becomes a highlight video and a shorts pack from the same session.'),
            ('Posted for you', 'If you want, we schedule and post it, with a title and description written for it.'),
        ],
        'faq': [('What do I send you?', 'The whole raw pile. Recordings, VODs, the clips you are not sure about. Cutting is our job.'),
                ('Can you work from a stream VOD?', 'Yes. One VOD becomes a highlight video and a shorts pack from the same session.'),
                ('How fast is it back?', 'Thirty-six hours from when your files land: the first cut at 12 hours, your notes at 18, the final at 36.'),
                FAQ_REV, FAQ_LANG, FAQ_START],
    },
    {
        'slug': 'shorts-reels-editing', 'nav': 'Shorts & reels', 'need': 'shorts',
        'title': 'YouTube Shorts, Reels and TikTok Editing | Cutsway',
        'desc': f'Shorts and reels editing from Cutsway: clips reframed to vertical and captioned for the first second, for YouTube Shorts, Instagram Reels, TikTok and X. Back in 12 hours.',
        'kicker': 'Cutsway · shorts, reels and TikTok editing', 'h1': 'shorts & reels editing',
        'lede': 'The best moments of your videos and streams, reframed to vertical and captioned for the first second of a scroll.',
        'service': 'Short-form video editing for YouTube Shorts, Instagram Reels, TikTok and X',
        'cards': [
            ('Reframed to vertical', 'Gameplay, facecam and guests rebuilt for a 9:16 screen, not just cropped from the middle.'),
            ('Captions that land', 'Captioned for the first second, because that is where a scroll decides.'),
            ('A shorts pack from one source', 'One stream VOD or long video becomes a set of shorts from the same session.'),
            ('Every platform', 'Delivered for YouTube Shorts, Instagram Reels, TikTok and X, each with its own title and caption.'),
            ('Posted on schedule', 'If you want, we post them for you, timed for when your audience is awake.'),
        ],
        'faq': [('What do I send you?', 'A stream VOD, a finished long video or the raw clips. We find the moments worth a short.'),
                ('How fast is it back?', 'Twelve hours from when your files land: cut and captioned at 10 hours, delivered at 12.'),
                ('Which platforms?', 'YouTube Shorts, Instagram Reels, TikTok and X, each with its own title and caption.'),
                FAQ_REV, FAQ_LANG, FAQ_START],
    },
    {
        'slug': 'podcast-editing', 'nav': 'Podcast editing', 'need': 'podcast',
        'title': 'Video Podcast Editing and Podcast Clips | Cutsway',
        'desc': f'Video podcast editing from Cutsway in Hyderabad: multi-mic, multi-camera episodes cut clean, plus the clips that bring new listeners in. In {LANGS}.',
        'kicker': 'Cutsway · video podcast editing', 'h1': 'podcast editing',
        'lede': 'Three mics, two cameras, one clean episode, plus the clips that bring new listeners in.',
        'service': 'Video podcast editing and podcast clips',
        'cards': [
            ('One clean episode', 'Every mic and camera brought together into one episode that flows, with the dead air taken out.'),
            ('Camera cuts that follow the talk', 'Multi-camera edits that cut to whoever is speaking and to the reaction worth seeing.'),
            ('Clips for shorts and reels', 'The moments that travel, cut vertical and captioned to bring new listeners to the full episode.'),
            ('Episode thumbnails', 'Thumbnails made with the episode, from first concept to final polish.'),
            ('Posted for you', 'The episode and its clips scheduled and posted, each with its own title and caption.'),
        ],
        'faq': [('What do I send you?', 'Every mic track and camera angle from the recording, however raw.'),
                ('How fast is it back?', 'Forty-eight hours from when the recording lands: the episode cut at 20 hours, your notes at 26, the final at 48.'),
                ('Do you cut clips from the episode?', 'Yes. The moments that travel become vertical clips for shorts and reels, captioned for the first second.'),
                FAQ_REV, FAQ_LANG, FAQ_START],
    },
    {
        'slug': 'thumbnail-design', 'nav': 'Thumbnails', 'need': 'thumb',
        'title': 'YouTube Thumbnail Design for Creators | Cutsway',
        'desc': 'YouTube thumbnail design from Cutsway: three concepts in three hours and final art in eight, for gaming videos, podcasts and long-form.',
        'kicker': 'Cutsway · YouTube thumbnail design', 'h1': 'thumbnail design',
        'lede': 'Three concepts in three hours, final art in eight. Made to promise what the video delivers.',
        'service': 'YouTube thumbnail design',
        'cards': [
            ('Three concepts first', 'Three directions to choose from within three hours of your brief.'),
            ('Final art in eight hours', 'The chosen concept finished, polished and sized for YouTube.'),
            ('Made with the edit', 'When we cut the video too, the thumbnail is designed alongside it, so the two match.'),
            ('A polish pass', 'Light, colour and glow worked over until it reads at the size people actually see it.'),
        ],
        'faq': [('How fast is it back?', 'Three concepts within three hours of your brief, final art within eight.'),
                ('Can I order thumbnails on their own?', 'Yes. Thumbnails come with every edit we do, and you can book them on their own too.'),
                FAQ_REV, FAQ_LANG, FAQ_START],
    },
    {
        'slug': 'social-media-management', 'nav': 'Posting & scheduling', 'need': None,
        'title': 'Social Media Posting and Scheduling for Creators | Cutsway',
        'desc': 'Social media posting for creators from Cutsway: YouTube, Instagram, TikTok and X, each with its own title and caption, scheduled for when your audience is awake.',
        'kicker': 'Cutsway · social media posting & scheduling', 'h1': 'posting & scheduling',
        'lede': 'Sorted into YouTube, Instagram, TikTok and X, each with its own title and caption, scheduled for when your audience is awake.',
        'service': 'Social media posting and scheduling for creators',
        'cards': [
            ('Every platform', 'YouTube, Instagram, TikTok and X, posted from one place so nothing slips.'),
            ('Titles and captions per platform', 'Written for each platform, not pasted from one to the next.'),
            ('Timed for your audience', 'Scheduled for when the people who watch you are awake.'),
            ('Fed by the edit', 'The shorts and clips we cut go straight into the schedule.'),
        ],
        'faq': [('Do you post it for me?', 'Yes. We schedule and post with titles and captions written for each platform.'),
                ('Which platforms?', 'YouTube, Instagram, TikTok and X.'),
                FAQ_LANG, FAQ_START],
    },
]

THUMB_ALT = {
    'wealthy': ('10 Things to Become Wealthy', 'Long-form YouTube thumbnail'),
    'stocks': ('Top 10 Rising Stocks', 'Long-form YouTube thumbnail'),
    'creator': ('Day in the Life of a Content Creator', 'Episode thumbnail'),
    'rawtalks': ('Podcast episode', 'Thumbnail after the glow pass'),
    'rawtalks-plain': ('Podcast episode', 'The same thumbnail before the glow pass'),
}


def esc(s):
    return htmllib.escape(s, quote=True)


def turnaround():
    """The promised steps per job, read from site-config.js: {'video': [('Raw in', 0), ...], ...}."""
    cfg = (Path(__file__).resolve().parent.parent / 'prototypes' / 'shared' / 'site-config.js').read_text(encoding='utf-8')
    block = re.search(r'turnaround: \{(.*?)\n  \},', cfg, re.S).group(1)
    return {k: [(s, int(h)) for s, h in re.findall(r"\['([^']+)', (\d+)", v)] for k, v in re.findall(r'(\w+): \[(.*?)\]\],', block)}


def faq_html(items):
    return ''.join(f'<details><summary>{esc(q)}{PLUS}</summary><p>{esc(a)}</p></details>' for q, a in items)


def page(*, path, title, desc, body, sprite, ver, schema, og_alt):
    url = DOMAIN + path
    css = ''.join(f'<link rel="stylesheet" href="/shared/{f}?v={ver(f)}">' for f in ('page.css', 'brand.css', 'pages.css'))
    services = ''.join(f'<a href="/{s["slug"]}/">{esc(s["nav"])}</a>' for s in SERVICES)
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="theme-color" content="#07070a">
<link rel="canonical" href="{url}">
<link rel="icon" href="/shared/favicon.ico?v={ver('favicon.ico')}" sizes="48x48">
<link rel="icon" href="/shared/favicon.svg?v={ver('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="/shared/apple-touch-icon.png?v={ver('apple-touch-icon.png')}">
<link rel="manifest" href="/shared/site.webmanifest?v={ver('site.webmanifest')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cutsway">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{DOMAIN}/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(og_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{DOMAIN}/og.jpg">
<script type="application/ld+json">{json.dumps({'@context': 'https://schema.org', '@graph': schema}, ensure_ascii=False)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
{css}
</head>
<body class="page">
<a class="skip" href="#main">Skip to content</a>
{sprite}
<header class="nav">
  <a class="nav__logo" href="/" aria-label="Cutsway home"><svg viewBox="0 0 800.1 100" role="img" aria-label="Cutsway"><use href="#logo"/></svg></a>
  <nav class="nav__links" aria-label="Main"><a href="/#long-form">What we cut</a><a href="/work/">Our work</a><a href="/#turnaround">Turnaround</a></nav>
  <div class="nav__cta"><a class="pill" href="#book" data-book data-magnet="0.25">Book a call {ARROW}</a><button class="nav__burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><i></i><i></i></button></div>
</header>
<div class="menu" id="menu">
  <nav aria-label="Menu"><a href="/">Home</a><a href="/work/">Our work</a>{services}<a href="#book" data-book>Book a call</a></nav>
  <a class="menu__mail" data-email href="mailto:cutsway.socialmanager@gmail.com">cutsway.socialmanager@gmail.com</a>
  <a class="menu__mail" data-whatsapp href="https://wa.me/916281301476">WhatsApp +91 62813 01476</a>
</div>
<main class="sub" id="main">
{body}
</main>
<footer class="foot" id="book" aria-labelledby="book-h">
  <h2 class="display" id="book-h"><a href="#book" data-book="direct" data-magnet="0.08">book a call.</a></h2>
  <p>Send us the pile. Twenty minutes on a call and we'll tell you what we'd keep.</p>
  <div class="foot__grid">
    <div class="foot__talk"><span class="foot__k">Talk to us</span><a data-email href="mailto:cutsway.socialmanager@gmail.com">cutsway.socialmanager@gmail.com</a><a data-whatsapp href="https://wa.me/916281301476">WhatsApp +91 62813 01476</a><span class="foot__where">Hyderabad, India · {LANGS}</span></div>
    <div><span class="foot__k">Follow</span><nav aria-label="Social"><a data-social="youtube" href="#">YouTube</a><a data-social="instagram" href="#">Instagram</a><a data-social="tiktok" href="#">TikTok</a><a data-social="x" href="#">X</a><a data-social="discord" href="#">Discord</a></nav></div>
    <div><span class="foot__k">Services</span><nav aria-label="Services">{services}<a href="/work/">Our work</a></nav></div>
  </div>
  <div class="foot__row"><span>© 2026 Cutsway · video editing for gaming creators, streamers and podcasters</span><a href="#main">Back to top ↑</a></div>
</footer>
<script src="/shared/site-config.js?v={ver('site-config.js')}"></script>
<script src="/shared/ui.js?v={ver('ui.js')}"></script>
</body>
</html>
'''


def crumbs(path, name):
    return (f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Cutsway</a><span aria-hidden="true">/</span><span aria-current="page">{esc(name)}</span></nav>',
            {'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Cutsway', 'item': DOMAIN + '/'},
                {'@type': 'ListItem', 'position': 2, 'name': name, 'item': DOMAIN + path}]})


def service_page(s, steps, sprite, ver, work_img):
    path = f'/{s["slug"]}/'
    nav, crumb_ld = crumbs(path, s['nav'])
    cards = ''.join(f'<article class="glass card"><h3>{esc(t)}</h3><p>{esc(d)}</p></article>' for t, d in s['cards'])
    sched = ''
    if s['need'] and s['need'] in steps:
        rows = steps[s['need']]
        lis = ''.join(f'<li><span>{esc(n)}</span><span>{"when your files land" if h == 0 else f"{h} hours"}</span></li>' for n, h in rows)
        sched = f'''<section class="band" aria-labelledby="t-h"><h2 class="display" id="t-h">when it's back</h2>
<div class="glass sched"><p class="due">From the moment your files land, it's yours in<strong class="num">{rows[-1][1]} hours</strong></p><ol class="splits num">{lis}</ol>
<p class="note">Two rounds of revisions on every edit, left as notes on the exact frame.</p></div></section>'''
    others = ''.join(f'<a class="pill" href="/{o["slug"]}/">{esc(o["nav"])} {ARROW}</a>' for o in SERVICES if o is not s)
    body = f'''{nav}
<h1 class="display"><span class="h1__k">{esc(s["kicker"])}</span>{esc(s["h1"])}</h1>
<p class="sub__lede">{esc(s["lede"])}</p>
<div class="sub__cta"><a class="pill pill--solid" href="#book" data-book>Book a call {ARROW}</a><a class="pill" data-whatsapp href="https://wa.me/916281301476">WhatsApp us {ARROW}</a></div>
<p class="sub__where">Based in Hyderabad, working with creators anywhere, in {LANGS}.</p>
<section class="band" aria-labelledby="w-h"><h2 class="display" id="w-h">what you get</h2><div class="cards">{cards}</div></section>
{sched}
{work_img}
<section class="band" aria-labelledby="q-h"><h2 class="display" id="q-h">fair questions</h2><div class="glass faq">{faq_html(s["faq"])}</div></section>
<section class="band" aria-labelledby="o-h"><h2 class="display" id="o-h">also from cutsway</h2><div class="links">{others}<a class="pill" href="/work/">Our work {ARROW}</a></div></section>'''
    schema = [{'@type': 'Service', '@id': DOMAIN + path + '#service', 'name': s['service'], 'serviceType': s['service'], 'url': DOMAIN + path,
               'description': s['desc'], 'provider': {'@id': DOMAIN + '/#org'},
               'areaServed': [{'@type': 'City', 'name': 'Hyderabad'}, {'@type': 'Country', 'name': 'India'}, 'Worldwide']},
              {'@type': 'WebPage', '@id': DOMAIN + path, 'url': DOMAIN + path, 'name': s['title'], 'isPartOf': {'@id': DOMAIN + '/#website'},
               'about': {'@id': DOMAIN + path + '#service'}, 'inLanguage': 'en'}, crumb_ld]
    return path, page(path=path, title=s['title'], desc=s['desc'], body=body, sprite=sprite, ver=ver, schema=schema,
                      og_alt=f'Cutsway: {s["nav"].lower()} for creators, streamers and podcasters')


def work_figure(key, wv, size=(1024, 576)):
    t, k = THUMB_ALT[key]
    return (f'<figure><img src="/assets/work/thumb-{key}.jpg?v={wv(f"thumb-{key}.jpg")}" width="{size[0]}" height="{size[1]}" loading="lazy" decoding="async" '
            f'alt="{esc(f"{k} designed by Cutsway: {t}")}"><figcaption>{esc(t)}<span>{esc(k)}</span></figcaption></figure>')


def work_page(sprite, ver, wv):
    path = '/work/'
    nav, crumb_ld = crumbs(path, 'Our work')
    reel = f'/assets/work/reel-podcast.mp4?v={wv("reel-podcast.mp4")}'
    poster = f'/assets/work/reel-podcast-poster.jpg?v={wv("reel-podcast-poster.jpg")}'
    body = f'''{nav}
<h1 class="display"><span class="h1__k">Cutsway · thumbnails, shorts and podcast edits</span>our work</h1>
<p class="sub__lede">A few of the thumbnails and edits we've made for creators. Everything here was cut and designed by the Cutsway team in Hyderabad.</p>
<div class="sub__cta"><a class="pill pill--solid" href="#book" data-book>Book a call {ARROW}</a></div>
<section class="band" aria-labelledby="th-h"><h2 class="display" id="th-h">thumbnails</h2>
<div class="work">{work_figure('wealthy', wv)}{work_figure('stocks', wv)}{work_figure('creator', wv)}</div>
<p class="more"><a href="/thumbnail-design/">How we design thumbnails →</a></p></section>
<section class="band" aria-labelledby="pd-h"><h2 class="display" id="pd-h">podcasts</h2>
<div class="work work--pod">
<figure class="reel"><video src="{reel}" poster="{poster}" width="432" height="768" muted loop playsinline autoplay preload="metadata" aria-label="Podcast short edited by Cutsway"></video><figcaption>Podcast short<span>Vertical clip, cut and captioned for shorts and reels</span></figcaption></figure>
<div class="pair">{work_figure('rawtalks-plain', wv)}{work_figure('rawtalks', wv)}</div>
</div>
<p class="more"><a href="/podcast-editing/">How we edit podcasts →</a> · <a href="/shorts-reels-editing/">Shorts &amp; reels →</a></p></section>'''
    schema = [{'@type': 'CollectionPage', '@id': DOMAIN + path, 'url': DOMAIN + path, 'name': 'Our work | Cutsway', 'isPartOf': {'@id': DOMAIN + '/#website'},
               'about': {'@id': DOMAIN + '/#org'}, 'inLanguage': 'en'},
              {'@type': 'VideoObject', 'name': 'Podcast short edited by Cutsway', 'description': 'A vertical podcast clip cut and captioned by Cutsway for shorts and reels.',
               'thumbnailUrl': DOMAIN + '/assets/work/reel-podcast-poster.jpg', 'contentUrl': DOMAIN + '/assets/work/reel-podcast.mp4',
               'uploadDate': '2026-11-01', 'duration': 'PT11S', 'publisher': {'@id': DOMAIN + '/#org'}},
              crumb_ld]
    return path, page(path=path, title='Our Work: Thumbnails, Shorts and Podcast Edits | Cutsway',
                      desc='Thumbnails, shorts and podcast edits by Cutsway, the Hyderabad video editing agency for gaming creators, streamers and podcasters.',
                      body=body, sprite=sprite, ver=ver, schema=schema, og_alt='Cutsway: thumbnails, shorts and podcast edits')


def build_all(home_html, ver, wv):
    """[(path, html)] for every plain page; images per path for the sitemap."""
    sprite = re.search(r'<svg width="0" height="0" style="position:absolute" aria-hidden="true">.*?</svg>\n', home_html, re.S).group(0)
    steps = turnaround()
    shots = {'gaming-video-editing': ['wealthy', 'stocks'], 'thumbnail-design': ['creator', 'wealthy'], 'podcast-editing': ['rawtalks']}
    out, images = [], {}
    for s in SERVICES:
        keys = shots.get(s['slug'], [])
        work = (f'<section class="band" aria-labelledby="s-h"><h2 class="display" id="s-h">from the work</h2><div class="work">{"".join(work_figure(k, wv) for k in keys)}</div>'
                f'<p class="more"><a href="/work/">See more of our work →</a></p></section>') if keys else ''
        out.append(service_page(s, steps, sprite, ver, work))
        images[f'/{s["slug"]}/'] = [f'assets/work/thumb-{k}.jpg' for k in keys]
    out.append(work_page(sprite, ver, wv))
    images['/work/'] = [f'assets/work/thumb-{k}.jpg' for k in ('wealthy', 'stocks', 'creator', 'rawtalks', 'rawtalks-plain')]
    return out, images
