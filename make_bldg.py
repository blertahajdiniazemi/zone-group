#!/usr/bin/env python3
# Gjeneron prerjen e objektit. Elementet përsëritëse shkruhen këtu
# që koordinatat të mbeten të sakta dhe të lehta për t'u rregulluar.

W, H = 600, 520

# --- guaska ---
XL, XR = 96, 526          # faqet e jashtme
WT = 12                   # trashësia e murit
IL, IR = XL + WT, XR - WT # brendësia: 108 .. 514
GRADE = 402

# pllakat: (y_top, trashësia)
SLABS = [(112, 10), (170, 9), (228, 9), (286, 9), (344, 9), (402, 10)]
ROOF = 112
BASE = 470                # fundi i bodrumit

# katet: (emri, tavani, dyshemeja)
FLOORS = [("K4", 122, 170), ("K3", 179, 228), ("K2", 237, 286),
          ("K1", 295, 344), ("P", 353, 402)]

# bërthama
EL_L, EL_R = 288, 324     # boshti i ashensorit
ST_L, ST_R = 328, 364     # shkallët
SH_L, SH_R = 368, 392     # shafti i instalimeve

LEVELS = [("ÇATI", 112), ("K4", 170), ("K3", 228), ("K2", 286),
          ("K1", 344), ("P", 402), ("B", 470)]
AXES = [("A", XL), ("B", EL_L), ("C", SH_R), ("D", XR)]

out = []
A = out.append


def g(cls=None, b=None, extra=""):
    s = "  <g"
    if cls: s += ' class="%s"' % cls
    if b is not None: s += ' data-b="%d"' % b
    if extra: s += " " + extra
    A(s + ">")


A('<svg class="bldg__svg" viewBox="0 0 %d %d" role="img"' % (W, H))
A('     aria-label="Prerje e një objekti pesëkatësh me bodrum, bërthamë vertikale dhe dhjetë '
  'sisteme teknike: strukturë, instalime elektrike, sisteme sanitare, ashensorë, hyrje dhe qasje, '
  'mbrojtje nga zjarri, videosurvejim, rrjet dhe telekom, automatizim dhe mirëmbajtje.">')

# ══════════════ ARKITEKTURA ══════════════
A('\n  <g class="arch">')

# --- 0. dheu ---
g("bld", 0)
A('    <rect class="earth" x="0" y="%d" width="%d" height="%d"/>' % (GRADE, W, H - GRADE))
A('    <line class="grade" x1="0" y1="%d" x2="%d" y2="%d"/>' % (GRADE, W, GRADE))
hat = []
for x in range(6, W, 22):
    hat.append("M%d %d l-7 10" % (x, GRADE))
A('    <path class="hatch" d="%s"/>' % " ".join(hat))
A("  </g>")

# --- 1. themeli dhe bodrumi ---
g("bld", 1)
A('    <rect class="poche" x="%d" y="%d" width="%d" height="16"/>' % (XL - 12, BASE, XR - XL + 24))
A('    <rect class="void" x="%d" y="%d" width="%d" height="%d"/>' % (IL, GRADE + 10, IR - IL, BASE - GRADE - 10))
A("  </g>")

# --- 2. vëllimi i brendshëm ---
g("bld", 2)
A('    <rect class="void" x="%d" y="%d" width="%d" height="%d"/>' % (IL, ROOF + 10, IR - IL, GRADE - ROOF - 10))
A("  </g>")

# --- 3..8. pllakat, nga poshtë lart ---
for i, (y, t) in enumerate(reversed(SLABS)):
    g("bld", 3 + i)
    A('    <rect class="poche" x="%d" y="%d" width="%d" height="%d"/>' % (XL, y, XR - XL, t))
    A("  </g>")

# --- 9. muret dhe parapeti ---
g("bld", 9)
A('    <rect class="poche" x="%d" y="%d" width="%d" height="%d"/>' % (XL, 92, WT, BASE - 92))
A('    <rect class="poche" x="%d" y="%d" width="%d" height="%d"/>' % (XR - WT, 92, WT, BASE - 92))
A("  </g>")

# --- 10. muri i largët: dritaret ---
g("bld", 10)
wins = []
for name, top, bot in FLOORS:
    xs = [126, 180, 234, 406, 460]
    if name == "P":
        xs = [180, 234, 406, 460]        # përdhesa ka hyrjen
    for x in xs:
        wins.append('    <rect class="glass" x="%d" y="%d" width="40" height="24"/>' % (x, top + 11))
out.extend(wins)
A("  </g>")

# --- 11. bërthama: boshti, shafti, shkallët ---
g("bld", 11)
A('    <rect class="core" x="%d" y="%d" width="%d" height="%d"/>' % (EL_L, ROOF, EL_R - EL_L, BASE - ROOF))
A('    <rect class="core" x="%d" y="%d" width="%d" height="%d"/>' % (SH_L, ROOF, SH_R - SH_L, BASE - ROOF))
A('    <line class="tick" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (ST_L, ROOF, ST_L, GRADE))
A('    <line class="tick" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (ST_R, ROOF, ST_R, GRADE))
for _, top, bot in FLOORS:                # shkallët, gjashtë shkallare për kat
    d = "M%d %d" % (ST_L, bot)
    x, y = ST_L, bot
    for _s in range(6):
        y -= 8; d += " L%d %d" % (x, y)
        x += 6; d += " L%d %d" % (x, y)
    A('    <path class="stair" d="%s"/>' % d)
A("  </g>")

# --- 12. mobilimi dhe figurat njerëzore ---
g("bld", 12)
furn = {"K4": [(140, 26), (250, 30), (430, 26)],
        "K3": [(198, 30), (452, 26)],
        "K2": [(134, 26), (246, 26), (438, 30)],
        "K1": [(190, 30), (420, 26), (470, 22)],
        "P":  [(240, 34), (444, 30)]}
figs = {"K4": [214, 486], "K3": [152, 268], "K2": [196, 466],
        "K1": [258, 496], "P": [166, 214, 424]}
for name, top, bot in FLOORS:
    for x, w in furn.get(name, []):
        A('    <rect class="furn" x="%d" y="%d" width="%d" height="9"/>' % (x, bot - 9, w))
    for x in figs.get(name, []):
        A('    <use class="body" href="#fig" x="%d" y="%d"/>' % (x, bot - 27))
A("  </g>")

# --- kuotat ---
g("bld", 12)
for lab, y in LEVELS:
    A('    <line class="tick" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (XR + 4, y, XR + 20, y))
    A('    <text x="%d" y="%d">%s</text>' % (XR + 25, y + 3, lab))
for lab, x in AXES:
    A('    <line class="tick" x1="%d" y1="%d" x2="%d" y2="%d"/>' % (x, BASE + 20, x, BASE + 32))
    A('    <text x="%d" y="%d">%s</text>' % (x - 3, BASE + 44, lab))
A("  </g>")

A("  </g>")

# ══════════════ SISTEMET ══════════════
CEIL = {n: t + 6 for n, t, b in FLOORS}   # tavani i secilit kat


def sysopen(key, color, sw="1.4", draw=True):
    A('\n  <g class="sys%s" data-sys="%s" style="--acc:%s" stroke="%s" fill="none" stroke-width="%s">'
      % (" sys--draw" if draw else "", key, color, color, sw))


# --- 01 STRUKTURË ---
sysopen("struktura", "#C78157", "1.7")
for y, t in SLABS:
    A('    <line x1="%d" y1="%d" x2="%d" y2="%d"/>' % (XL, y + t / 2, XR, y + t / 2))
A('    <line x1="%d" y1="%d" x2="%d" y2="%d" stroke-width="1.4"/>' % (XL + WT / 2, 92, XL + WT / 2, BASE))
A('    <line x1="%d" y1="%d" x2="%d" y2="%d" stroke-width="1.4"/>' % (XR - WT / 2, 92, XR - WT / 2, BASE))
A('    <line x1="%d" y1="%d" x2="%d" y2="%d" stroke-width="2.2"/>' % (XL - 12, BASE + 8, XR + 12, BASE + 8))
A("  </g>")

# --- 02 ELEKTRIKE ---
sysopen("elektrike", "#F2C14E")
A('    <rect x="%d" y="%d" width="24" height="34" stroke-width="1.6"/>' % (SH_L + 2, 424))
A('    <line x1="372" y1="424" x2="372" y2="122"/>')
for n in ["P", "K1", "K2", "K3", "K4"]:
    A('    <path d="M372 %d L500 %d"/>' % (CEIL[n] + 7, CEIL[n] + 7))
A('    <path d="M180 108 L214 96 L286 96 L252 108 Z" stroke-width="1.3"/>')  # panele solare
for dx in (0, 18, 36):
    A('    <line x1="%d" y1="108" x2="%d" y2="96"/>' % (198 + dx, 232 + dx))
A("  </g>")
A('  <g class="sys" data-sys="elektrike" style="--acc:#F2C14E">')
A('    <path class="pulse" d="M372 424 L372 122" stroke="#F2C14E" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
A('    <line x1="252" y1="102" x2="372" y2="102" stroke="#F2C14E" stroke-width="1.2"/>')
A("  </g>")

# --- 03 SANITARE ---
sysopen("sanitare", "#27BFC4")
A('    <line x1="140" y1="122" x2="140" y2="452"/>')
A('    <path d="M140 452 L104 452"/>')
A('    <rect x="152" y="424" width="26" height="30" stroke-width="1.5"/>')   # bojleri
for n in ["P", "K1", "K2", "K3", "K4"]:
    b = dict((f[0], f[2]) for f in FLOORS)[n]
    A('    <path d="M140 %d L196 %d"/>' % (b - 5, b - 5))
A("  </g>")
A('  <g class="sys" data-sys="sanitare" style="--acc:#27BFC4">')
A('    <path class="pulse pulse--rev" d="M140 122 L140 452" stroke="#27BFC4" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
for n in ["P", "K1", "K2", "K3", "K4"]:
    b = dict((f[0], f[2]) for f in FLOORS)[n]
    A('    <rect x="188" y="%d" width="9" height="7" fill="#27BFC4"/>' % (b - 9))
A("  </g>")

# --- 04 ASHENSORË ---
sysopen("ashensori", "#6F9FBC")
A('    <line x1="%d" y1="104" x2="%d" y2="%d"/>' % (EL_L + 4, EL_L + 4, BASE - 4))
A('    <line x1="%d" y1="104" x2="%d" y2="%d"/>' % (EL_R - 4, EL_R - 4, BASE - 4))
A('    <line x1="%d" y1="252" x2="%d" y2="104"/>' % ((EL_L + EL_R) // 2, (EL_L + EL_R) // 2))
A("  </g>")
A('  <g class="sys" data-sys="ashensori" style="--acc:#6F9FBC">')
A('    <rect x="%d" y="96" width="%d" height="16" fill="none" stroke="#6F9FBC" stroke-width="1.5"/>'
  % (EL_L - 4, EL_R - EL_L + 8))
A('    <rect class="car" x="%d" y="252" width="%d" height="34" fill="rgba(111,159,188,.18)" '
  'stroke="#6F9FBC" stroke-width="1.6"/>' % (EL_L + 5, EL_R - EL_L - 10))
for _, top, bot in FLOORS:
    A('    <g stroke="#6F9FBC" stroke-width="2.4">'
      '<line x1="%d" y1="%d" x2="%d" y2="%d"/><line x1="%d" y1="%d" x2="%d" y2="%d"/></g>'
      % (EL_L + 4, bot, EL_L + 14, bot, EL_R - 14, bot, EL_R - 4, bot))
A("  </g>")

# --- 05 HYRJE DHE QASJE ---
sysopen("hyrjet", "#4CB5A7")
A('    <line x1="%d" y1="358" x2="%d" y2="398"/>' % (XL + 2, XL + 2))
A('    <path d="M110 362 L146 362 M110 396 L146 396"/>')
A('    <path d="M56 402 L56 372 M56 374 L96 374"/>')          # barriera
A('    <path d="M204 378 L204 402 M192 382 L216 382"/>')       # turnstile
A('    <path d="M14 396 L40 396"/>')
A("  </g>")
A('  <g class="sys" data-sys="hyrjet" style="--acc:#4CB5A7">')
A('    <path d="M118 379 L138 379 M132 374 L138 379 L132 384" stroke="#4CB5A7" stroke-width="1.4" fill="none"/>')
A('    <circle cx="56" cy="372" r="3" fill="#4CB5A7"/>')
A("  </g>")

# --- 06 MBROJTJE NGA ZJARRI ---
sysopen("zjarri", "#E55353", "1.1")
A('    <line x1="506" y1="386" x2="506" y2="122"/>')
for n in ["P", "K1", "K2", "K3", "K4"]:
    A('    <path d="M506 %d L150 %d"/>' % (CEIL[n], CEIL[n]))
A('    <rect x="486" y="360" width="24" height="26" stroke-width="1.6"/>')
A("  </g>")
A('  <g class="sys" data-sys="zjarri" style="--acc:#E55353">')
for n in ["P", "K1", "K2", "K3", "K4"]:
    for x in (188, 252, 430, 470):
        A('    <circle cx="%d" cy="%d" r="3.2" fill="#E55353"/>' % (x, CEIL[n]))
A('    <circle class="blink" cx="252" cy="%d" r="5.4" fill="none" stroke="#E55353" stroke-width="1.2"/>' % CEIL["K2"])
A("  </g>")

# --- 07 VIDEOSURVEJIM ---
A('\n  <g class="sys" data-sys="siguria" style="--acc:#2FB0D4">')
cams = [(90, 130, -1), (532, 130, 1), (150, 360, 1), (452, CEIL["K3"] + 4, -1)]
A('    <g fill="#2FB0D4">')
for x, y, d in cams:
    A('      <rect x="%d" y="%d" width="11" height="6"/>' % (x - (11 if d < 0 else 0), y))
A("    </g>")
A('    <g fill="rgba(47,176,212,.12)" stroke="#2FB0D4" stroke-width="1">')
for x, y, d in cams:
    A('      <path d="M%d %d L%d %d L%d %d Z"' % (x, y + 6, x + d * 46, y + 46, x + d * 4, y + 46) + "/>")
A("    </g>")
A("  </g>")

# --- 08 RRJET DHE TELEKOM ---
sysopen("rrjeti", "#4F78E8")
A('    <line x1="382" y1="424" x2="382" y2="122"/>')
for n in ["P", "K1", "K2", "K3", "K4"]:
    A('    <path d="M382 %d L156 %d"/>' % (CEIL[n] + 7, CEIL[n] + 7))
A('    <rect x="404" y="418" width="44" height="40" stroke-width="1.6"/>')
for dy in (9, 18, 27):
    A('    <line x1="404" y1="%d" x2="448" y2="%d"/>' % (418 + dy, 418 + dy))
A("  </g>")
A('  <g class="sys" data-sys="rrjeti" style="--acc:#4F78E8">')
A('    <path class="pulse" d="M382 424 L382 122" stroke="#4F78E8" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
for n in ["K1", "K3"]:
    yy = CEIL[n] + 7
    A('    <g stroke="#4F78E8" fill="none" stroke-width="1.2"><path class="blink" '
      'd="M254 %d a10 10 0 0 1 14 0 M249 %d a17 17 0 0 1 24 0"/></g>' % (yy + 12, yy + 17))
A("  </g>")

# --- 09 AUTOMATIZIM DHE BMS ---
sysopen("automatizimi", "#876CFF")
A('    <rect x="452" y="424" width="40" height="34" stroke-width="1.6"/>')
A('    <path d="M472 424 L472 116 L%d 116" />' % (EL_R + 8))
for n in ["P", "K1", "K2", "K3", "K4"]:
    A('    <path d="M472 %d L500 %d"/>' % (CEIL[n] + 14, CEIL[n] + 14))
A("  </g>")
A('  <g class="sys" data-sys="automatizimi" style="--acc:#876CFF">')
A('    <path class="pulse" d="M472 424 L472 116" stroke="#876CFF" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
for n in ["P", "K1", "K2", "K3", "K4"]:
    A('    <rect x="497" y="%d" width="7" height="7" fill="#876CFF"/>' % (CEIL[n] + 11))
A("  </g>")

# --- 10 OPERIM DHE MIRËMBAJTJE ---
A('\n  <g class="sys" data-sys="operimi" style="--acc:#7FA46D">')
A('    <rect x="%d" y="82" width="%d" height="%d" fill="none" stroke="#7FA46D" '
  'stroke-width="1.3" stroke-dasharray="7 6"/>' % (XL - 14, XR - XL + 28, GRADE - 82 + 14))
A('    <g stroke="#7FA46D" fill="none" stroke-width="1.4">')
A('      <rect x="398" y="94" width="86" height="18"/>')
A('      <circle cx="418" cy="103" r="5"/><circle cx="464" cy="103" r="5"/>')
A("    </g>")
A('    <path class="pulse" d="M556 394 L160 394" stroke="#7FA46D" stroke-width="3" fill="none" '
  'stroke-linecap="round" style="--fd:5.2s"/>')
A('    <path d="M556 394 L160 394" stroke="#7FA46D" stroke-width="1.2" stroke-dasharray="5 5" fill="none"/>')
A("  </g>")

# --- figura njerëzore, e përcaktuar një herë ---
A('\n  <defs><g id="fig">')
A('    <circle cx="0" cy="4" r="3.6"/>')
A('    <path d="M0 8.4 C-4.2 9.4 -5.4 12.4 -5.4 16.2 L-5.4 20.4 L-2.3 20.4 L-2.3 27 '
  'L2.3 27 L2.3 20.4 L5.4 20.4 L5.4 16.2 C5.4 12.4 4.2 9.4 0 8.4 Z"/>')
A("  </g></defs>")

A("\n</svg>")

open("/home/claude/build/_bldg.svg", "w").write("\n".join(out) + "\n")
print("shkruar:", len(out), "rreshta")
