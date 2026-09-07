# -*- coding: utf-8 -*-
"""Bathymetriai szintvonalak - a 2,5 hektaros banyato melysegterkepe.
   Kimenet: assets/img/contours.svg (maszkkent hasznalt, fekete vonalas rajz)."""
import math, random

W, H = 1200, 900
random.seed(20250903)


def ring(cx, cy, base, squash, harmonics, points=44):
    """Egy zart, organikus gyuru: r(t) = base * (1 + sum a_k sin(k t + f_k))."""
    pts = []
    for i in range(points):
        t = 2 * math.pi * i / points
        r = 1.0
        for k, amp, phase in harmonics:
            r += amp * math.sin(k * t + phase)
        pts.append((cx + base * r * math.cos(t),
                    cy + base * r * squash * math.sin(t)))
    return pts


def smooth_path(pts):
    """Zart Catmull-Rom -> kubikus Bezier, hogy keves pontbol is sima legyen."""
    n = len(pts)
    d = ["M%.0f %.0f" % pts[0]]
    for i in range(n):
        p0 = pts[(i - 1) % n]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d.append("C%.0f %.0f %.0f %.0f %.0f %.0f" % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]))
    d.append("Z")
    return "".join(d)


def contour_set(cx, cy, outer, inner, count, squash, deep_dx, deep_dy, wobble):
    """Egymasba agyazott gyuruk: a melypont fele zsugorodnak es elcsusznak."""
    harmonics = [(k, wobble * random.uniform(.5, 1.4) / k, random.uniform(0, 6.28))
                 for k in (2, 3, 5, 7)]
    out = []
    for i in range(count):
        f = i / float(count - 1)
        base = outer + (inner - outer) * f
        # a belso gyuruk kicsit szabalyosabbak, ahogy a melyedes is az
        hs = [(k, a * (1 - .45 * f), p) for k, a, p in harmonics]
        out.append(ring(cx + deep_dx * f, cy + deep_dy * f, base, squash, hs))
    return out


groups = []
# fo to: a lap kozepetol jobbra, a melypont a bal-also negyedben
groups.append(("main", contour_set(660, 430, 430, 46, 11, .74, -190, 95, .075)))
# kisebb melyedes a jobb felso sarokban - a banyato masodik gorbeje
groups.append(("aux", contour_set(1045, 165, 150, 22, 5, .8, -35, 40, .11)))
# egy halvany, levagott gyuru-csoport a bal alsonál
groups.append(("aux2", contour_set(105, 810, 185, 40, 4, .7, 40, -30, .12)))

parts = []
for name, rings in groups:
    for i, pts in enumerate(rings):
        # a melyebb (belsobb) vonalak vekonyabbak - ahogy a terkepen is
        sw = 2.6 - 1.5 * (i / float(max(1, len(rings) - 1)))
        parts.append('<path d="%s" stroke-width="%.2f"/>' % (smooth_path(pts), sw))

svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
    'width="%d" height="%d" fill="none" stroke="#000" '
    'stroke-linejoin="round">\n%s\n</svg>\n'
) % (W, H, W, H, "\n".join(parts))

with open("assets/img/contours.svg", "w", encoding="utf-8") as f:
    f.write(svg)
print("assets/img/contours.svg", len(svg), "bytes,", len(parts), "vonal")
