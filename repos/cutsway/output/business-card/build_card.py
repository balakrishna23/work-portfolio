"""Cutsway / Raw Pile business card. Run from the project root."""
from pathlib import Path
from functools import lru_cache
import argparse, base64, html, io, json, re
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from playwright.sync_api import sync_playwright
import qrcode
import fitz
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
PAPER, NIGHT, SOFT, YELLOW = '#f4f2ec', '#07070a', '#c4c4d0', '#fddf4b'
COLORS = ['#272ed2','#1c4cdd','#108ae8','#03c0f4','#5ae2e8','#a9f0dc','#e8f8cd','#fcf397','#fddf4b','#fcb51c','#fc8020','#fb3b27','#e21c2f','#a81d30','#761a2b']

@lru_cache(None)
def font(weight=500, width=100):
    f = TTFont(ROOT / 'videos/reel/assets/fonts/archivo-latin.woff2')
    axes = {a.axisTag: (weight if a.axisTag == 'wght' else width) for a in f['fvar'].axes}
    return f.getGlyphSet(location=axes), f.getBestCmap(), f['head'].unitsPerEm

def text(s, x, y, size, weight=500, width=100, fill=NIGHT, tracking=0, maxwidth=None):
    gs,cmap,units=font(weight,width)
    advance=sum(gs[cmap[ord(c)]].width for c in s)*size/units + max(0,len(s)-1)*tracking
    scale=min(1,maxwidth/advance) if maxwidth else 1
    pos=0; paths=[]
    for c in s:
        g=gs[cmap[ord(c)]]; pen=SVGPathPen(gs); g.draw(pen)
        paths.append(f'<path transform="translate({pos},0)" d="{pen.getCommands()}"/>')
        pos+=g.width + tracking*units/size
    return f'<g aria-label="{html.escape(s)}" fill="{fill}" transform="translate({x},{y}) scale({size/units*scale}, {-size/units})">'+''.join(paths)+'</g>'

def rect(x,y,w,h,fill): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'

logo=(ROOT/'launch/rawpile/shared/logo.svg').read_text(encoding='utf-8')
def mark(x,y,w,mono=False):
    v=logo
    if mono: v=v.replace('fill="url(#s)"',f'fill="{NIGHT}"')
    return v.replace('<svg ', f'<svg x="{x}" y="{y}" width="{w}" height="{w/8.001}" ',1)

def wrap(content,bg,bleed=False):
    box='-30 -30 960 610' if bleed else '0 0 900 550'
    mm=('96mm','61mm') if bleed else ('90mm','55mm')
    stops=''.join(f'<stop offset="{i/(len(COLORS)-1):.4f}" stop-color="{c}"/>' for i,c in enumerate(COLORS))
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{mm[0]}" height="{mm[1]}" viewBox="{box}"><defs><linearGradient id="spectrum">{stops}</linearGradient></defs>'+rect(-30,-30,960,610,bg)+content+'</svg>'

def build(name,role,phone,email):
    front=mark(52,48,258)
    front+=text('VIDEO EDITING',684,55,12,600,fill=SOFT,tracking=1)
    front+=text('& SOCIAL MEDIA',684,74,12,600,fill=SOFT,tracking=.65)
    front+=text('FROM YOUR RAW PILE.',54,157,13,600,fill=SOFT,tracking=2)
    front+=text('KEEP THE',47,269,111,900,125,PAPER,maxwidth=780)
    front+=text('GOOD PART.',47,382,111,900,125,PAPER,maxwidth=755)
    # A single edit seam: bright, angular and deliberate, like a razor cut.
    front+='<path d="M864 -30H889L822 580H797Z" fill="url(#spectrum)"/>'
    front+=rect(54,437,704,1,'#37373d')
    for i in range(41):
        x=54+i*17.5
        front+=rect(x,437,1,8 if i%5 else 14,'#68686f')
    front+='<path d="M564 425l7 11 7-11Z" fill="#fddf4b"/>'
    front+=text('THE PART WORTH WATCHING.',54,492,12,650,fill=PAPER,tracking=.6)
    front+=text('cutsway.com',636,492,16,650,fill=PAPER)

    back=mark(54,49,230,True)
    back+=text('LET\'S MAKE THE CUT.',582,68,13,650,tracking=.8,maxwidth=260)
    for i,c in enumerate(COLORS): back+=rect(54+i*52.8,104,50.3,7,c)
    back+=text(name.upper(),50,211,61,850,115,maxwidth=775)
    back+=text(role,54,246,22,500,maxwidth=740)
    back+=rect(54,279,792,1,'#c9c7c0')
    back+=text('SAY HELLO',54,319,11,650,tracking=1.5,fill='#5a5a60')
    back+=text(phone,54,355,24,650)
    back+=text(email,54,386,21.5,500,maxwidth=566)
    back+=text('cutsway.com',54,418,24,750)
    back+=text('HYDERABAD / WORLDWIDE',54,491,11,600,tracking=1,fill='#5a5a60')
    qr=qrcode.QRCode(version=None,error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=1,border=4)
    qr.add_data('https://cutsway.com/');qr.make(fit=True); mat=qr.get_matrix(); n=len(mat); unit=159/n
    back+=rect(686,300,159,159,PAPER)
    for r,row in enumerate(mat):
        for c,bit in enumerate(row):
            if bit: back+=rect(686+c*unit,300+r*unit,unit+.005,unit+.005,NIGHT)
    back+=text('SCAN FOR THE GOOD PART.',677,491,9,650,tracking=.35,maxwidth=175)
    return front,back

def main():
    a=argparse.ArgumentParser(); a.add_argument('--name',default='Your name');a.add_argument('--role',default='Your role')
    a.add_argument('--phone',default='+91 62813 01476');a.add_argument('--email',default='cutsway.socialmanager@gmail.com');args=a.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    faces=build(args.name,args.role,args.phone,args.email)
    for side,content,bg in zip(('front','back'),faces,(NIGHT,PAPER)):
        (OUT/f'{side}.svg').write_text(wrap(content,bg),encoding='utf-8')
        (OUT/f'{side}-bleed.svg').write_text(wrap(content,bg,True),encoding='utf-8')
    with sync_playwright() as p:
        browser=p.chromium.launch(); page=browser.new_page(viewport={'width':1440,'height':916},device_scale_factor=1)
        for side in ('front','back'):
            svg=(OUT/f'{side}.svg').read_text(encoding='utf-8')
            page.set_content('<style>*{margin:0}svg{width:1440px;height:880px;display:block}</style>'+svg)
            page.locator('svg').first.screenshot(path=str(OUT/f'{side}.png'))
        for bleed,filename in ((False,'cutsway-card-trim.pdf'),(True,'cutsway-card-bleed.pdf')):
            w,h=('96mm','61mm') if bleed else ('90mm','55mm')
            svgs=[wrap(c,bg,bleed) for c,bg in zip(faces,(NIGHT,PAPER))]
            page.set_content(f'<style>@page{{size:{w} {h};margin:0}}*{{margin:0}}svg{{display:block;break-after:page}}</style>'+''.join(svgs))
            page.pdf(path=str(OUT/filename),width=w,height=h,print_background=True,prefer_css_page_size=True)
        browser.close()
    # Render final PDF to inspect the actual delivered pages.
    doc=fitz.open(OUT/'cutsway-card-bleed.pdf')
    assert len(doc)==2
    for i,pg in enumerate(doc):
        pg.get_pixmap(matrix=fitz.Matrix(4,4)).save(OUT/f'pdf-check-{i+1}.png')
        pg.set_trimbox(fitz.Rect(30/10*72/25.4,30/10*72/25.4,93*72/25.4,58*72/25.4))
    doc.save(OUT/'cutsway-card-bleed-boxes.pdf');doc.close()
    # Spacious presentation board showing both faces at equal, readable size.
    board=Image.new('RGB',(1800,1780),'#e4e2dc')
    from PIL import ImageDraw,ImageFont
    draw=ImageDraw.Draw(board)
    regular=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',19)
    bold=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',24)
    draw.text((95,54),'CUTSWAY  /  THE KEEPER CARD',fill=NIGHT,font=bold)
    draw.text((95,94),'RAW PILE IDENTITY  /  TWO-SIDED PERSONAL CARD',fill='#66666b',font=regular)
    for side,x,y in [('front',95,170),('back',580,1010)]:
        im=Image.open(OUT/f'{side}.png').convert('RGB').resize((1125,688),Image.Resampling.LANCZOS)
        shadow=Image.new('RGBA',board.size); sd=ImageDraw.Draw(shadow);sd.rectangle((x+8,y+18,x+1133,y+706),fill=(0,0,0,45));shadow=shadow.filter(ImageFilter.GaussianBlur(24))
        board=Image.alpha_composite(board.convert('RGBA'),shadow).convert('RGB');board.paste(im,(x,y))
    board.save(OUT/'preview.png')
    (OUT/'details.json').write_text(json.dumps(vars(args),indent=2),encoding='utf-8')
    (OUT/'README.txt').write_text('CUTSWAY - THE KEEPER CARD\n90 x 55 mm. Two sides. 3 mm bleed on all edges.\nUse cutsway-card-bleed-boxes.pdf for printer review; includes TrimBox.\nSVGs contain outlined text and the original vector logo. QR opens https://cutsway.com/.\nRGB artwork: have the print provider proof colours on the chosen stock before production.\nSuggested finish: 400 gsm stock, matte or soft-touch lamination, square corners.\nPersonal details marked Your name / Your role are placeholders until supplied.\n',encoding='utf-8')
    print('Built card in',OUT)

if __name__=='__main__': main()
