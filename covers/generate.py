from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1280, 720
OUT = r"C:\Users\SAGESH\Desktop\claude-projects\prismiq\covers"

def get_font(size, bold=False):
    candidates_bold = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
    ]
    candidates = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    pool = candidates_bold if bold else candidates
    for path in pool:
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

def gradient_h(img, x0, y0, x1, y1, c1, c2):
    region = Image.new('RGBA', (x1 - x0, y1 - y0))
    draw = ImageDraw.Draw(region)
    steps = x1 - x0
    for i in range(steps):
        t = i / max(steps - 1, 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        draw.line([(i, 0), (i, y1 - y0)], fill=(r, g, b, 255))
    img.paste(region, (x0, y0), region)

def add_glow(img, cx, cy, radius, color, opacity=50):
    glow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    for r in range(radius, 0, -max(1, radius // 80)):
        alpha = int(opacity * (1 - r / radius) ** 2)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, alpha))
    img.paste(glow, (0, 0), glow)

def draw_grid(draw):
    for x in range(0, W, 80):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 7), width=1)
    for y in range(0, H, 80):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 7), width=1)

def pill(draw, img, x, y, w, h, text, text_color, bg_color, border_color, grad=None, grad_c2=None):
    r = h // 2
    if grad and grad_c2:
        region = Image.new('RGBA', (w, h), (0,0,0,0))
        rd = ImageDraw.Draw(region)
        for i in range(w):
            t = i / max(w-1,1)
            rc = tuple(int(grad[j] + (grad_c2[j] - grad[j]) * t) for j in range(3))
            rd.line([(i,0),(i,h)], fill=(*rc,255))
        mask = Image.new('L', (w, h), 0)
        ImageDraw.Draw(mask).rounded_rectangle([(0,0),(w-1,h-1)], radius=r, fill=255)
        region.putalpha(mask)
        img.paste(region, (x, y), region)
    else:
        draw.rounded_rectangle([x, y, x+w, y+h], radius=r, fill=bg_color, outline=border_color, width=1)
    f = get_font(14, bold=True)
    draw.text((x + w//2, y + h//2), text, font=f, fill=text_color, anchor="mm")

def feature_row(draw, x, y, text, dot_color, font):
    draw.ellipse([x, y+3, x+12, y+15], fill=(*dot_color, 180))
    draw.text((x + 22, y), text, font=font, fill=(255, 255, 255, 190))

# ── STARTER ──────────────────────────────────────────────────────────────────
def make_starter():
    img = Image.new('RGBA', (W, H), (6, 6, 14, 255))
    draw = ImageDraw.Draw(img, 'RGBA')
    draw_grid(draw)

    add_glow(img, 180, 300, 420, (90, 30, 200), 55)
    add_glow(img, 700, 100, 300, (150, 30, 180), 30)

    # Left content zone (fits before Gumroad's card covers right ~45%)
    LX = 80

    # Badge
    pill(draw, img, LX, 120, 170, 36, "STARTER PLAN", (180, 150, 255, 255), (80, 30, 180, 50), (120, 70, 240, 80))

    # Big name
    draw.text((LX, 180), "Prismiq", font=get_font(86, bold=True), fill=(255, 255, 255, 255))
    draw.text((LX, 270), "Starter", font=get_font(60, bold=True), fill=(167, 139, 250, 230))

    # Accent line
    gradient_h(img, LX, 350, LX + 220, 354, (167, 139, 250), (244, 114, 182))

    # Price prominent
    draw.text((LX, 370), "$3.99", font=get_font(54, bold=True), fill=(255, 255, 255, 255))
    draw.text((LX + 145, 395), "/ month", font=get_font(20), fill=(255, 255, 255, 100))

    # Scan count
    draw.rounded_rectangle([LX, 440, LX + 200, 476], radius=10, fill=(100, 40, 220, 60), outline=(160, 100, 255, 80), width=1)
    draw.text((LX + 100, 458), "5 scans / day", font=get_font(18, bold=True), fill=(200, 180, 255, 230), anchor="mm")

    # Features
    ff = get_font(17)
    feats = ["YouTube, Websites, PDFs & Images", "Summarize & Study Notes", "Q&A, Flashcards & Quiz", "Download results"]
    for i, f in enumerate(feats):
        feature_row(draw, LX, 500 + i * 36, f, (139, 92, 246), ff)

    # Bottom
    draw.text((LX, 670), "prismiqai.vercel.app", font=get_font(14), fill=(255, 255, 255, 45))
    draw.text((W - 80, 670), "by Ctrl Labs", font=get_font(14), fill=(255, 255, 255, 45), anchor="rm")

    # Right side — subtle decorative orb (will be partly covered, that's fine)
    add_glow(img, 1050, 360, 280, (120, 50, 240), 25)

    img.save(os.path.join(OUT, "prismiq-starter.png"), "PNG")
    print("Done: prismiq-starter.png")

# ── PRO ──────────────────────────────────────────────────────────────────────
def make_pro():
    img = Image.new('RGBA', (W, H), (6, 5, 16, 255))
    draw = ImageDraw.Draw(img, 'RGBA')
    draw_grid(draw)

    add_glow(img, 200, 280, 450, (100, 20, 220), 60)
    add_glow(img, 650, 80, 320, (180, 30, 160), 35)

    LX = 80

    # Badge — gradient pill
    pill(draw, img, LX, 118, 210, 38, "  MOST POPULAR", (255,255,255,255), None, None, grad=(124,58,237), grad_c2=(236,72,153))

    draw.text((LX, 180), "Prismiq", font=get_font(86, bold=True), fill=(255, 255, 255, 255))

    # "Pro" gradient text
    pro_w, pro_h = 200, 80
    pro_layer = Image.new('RGBA', (pro_w, pro_h), (0,0,0,0))
    gradient_h(pro_layer, 0, 0, pro_w, pro_h, (167,139,250), (244,114,182))
    mask = Image.new('RGBA', (pro_w, pro_h), (0,0,0,0))
    ImageDraw.Draw(mask).text((0, 0), "Pro", font=get_font(72, bold=True), fill=(255,255,255,255))
    pro_layer.putalpha(mask.split()[0])
    img.paste(pro_layer, (LX, 268), pro_layer)

    gradient_h(img, LX, 358, LX + 240, 362, (167,139,250), (244,114,182))

    draw.text((LX, 376), "$8.99", font=get_font(54, bold=True), fill=(255, 255, 255, 255))
    draw.text((LX + 158, 400), "/ month", font=get_font(20), fill=(255, 255, 255, 100))

    draw.rounded_rectangle([LX, 442, LX + 210, 478], radius=10, fill=(100, 40, 220, 60), outline=(160, 100, 255, 80), width=1)
    draw.text((LX + 105, 460), "20 scans / day", font=get_font(18, bold=True), fill=(200, 180, 255, 230), anchor="mm")

    ff = get_font(17)
    feats = ["Everything in Starter", "AI Chat with your content", "Glossary generation", "Priority processing"]
    for i, f in enumerate(feats):
        feature_row(draw, LX, 500 + i * 36, f, (167, 139, 250), ff)

    draw.text((LX, 670), "prismiqai.vercel.app", font=get_font(14), fill=(255, 255, 255, 45))
    draw.text((W - 80, 670), "by Ctrl Labs", font=get_font(14), fill=(255, 255, 255, 45), anchor="rm")

    add_glow(img, 1050, 360, 280, (140, 60, 255), 22)

    img.save(os.path.join(OUT, "prismiq-pro.png"), "PNG")
    print("Done: prismiq-pro.png")

# ── UNLIMITED ────────────────────────────────────────────────────────────────
def make_unlimited():
    img = Image.new('RGBA', (W, H), (7, 6, 5, 255))
    draw = ImageDraw.Draw(img, 'RGBA')
    draw_grid(draw)

    add_glow(img, 200, 300, 420, (160, 100, 0), 55)
    add_glow(img, 680, 100, 300, (180, 90, 0), 30)

    LX = 80

    pill(draw, img, LX, 118, 180, 36, "UNLIMITED", (255, 210, 80, 255), (160, 100, 0, 45), (220, 150, 0, 90))

    draw.text((LX, 180), "Prismiq", font=get_font(86, bold=True), fill=(255, 255, 255, 255))

    # "Unlimited" gradient text
    unl_w, unl_h = 500, 75
    unl_layer = Image.new('RGBA', (unl_w, unl_h), (0,0,0,0))
    gradient_h(unl_layer, 0, 0, unl_w, unl_h, (251,191,36), (251,146,60))
    mask = Image.new('RGBA', (unl_w, unl_h), (0,0,0,0))
    ImageDraw.Draw(mask).text((0, 0), "Unlimited", font=get_font(62, bold=True), fill=(255,255,255,255))
    unl_layer.putalpha(mask.split()[0])
    img.paste(unl_layer, (LX, 268), unl_layer)

    gradient_h(img, LX, 356, LX + 240, 360, (245,158,11), (251,146,60))

    draw.text((LX, 374), "$15.99", font=get_font(54, bold=True), fill=(255, 255, 255, 255))
    draw.text((LX + 183, 398), "/ month", font=get_font(20), fill=(255, 255, 255, 100))

    draw.rounded_rectangle([LX, 440, LX + 240, 476], radius=10, fill=(160, 100, 0, 55), outline=(220, 160, 0, 80), width=1)
    draw.text((LX + 120, 458), "Unlimited scans / day", font=get_font(18, bold=True), fill=(251, 210, 100, 230), anchor="mm")

    ff = get_font(17)
    feats = ["Everything in Pro", "No scan limits, ever", "Bulk content processing", "Priority support"]
    for i, f in enumerate(feats):
        feature_row(draw, LX, 500 + i * 36, f, (245, 158, 11), ff)

    draw.text((LX, 670), "prismiqai.vercel.app", font=get_font(14), fill=(255, 255, 255, 45))
    draw.text((W - 80, 670), "by Ctrl Labs", font=get_font(14), fill=(255, 255, 255, 45), anchor="rm")

    add_glow(img, 1050, 360, 280, (180, 120, 0), 22)

    img.save(os.path.join(OUT, "prismiq-unlimited.png"), "PNG")
    print("Done: prismiq-unlimited.png")

make_starter()
make_pro()
make_unlimited()
print("All 3 covers generated!")
