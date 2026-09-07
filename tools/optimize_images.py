"""Képek optimalizálása a Farmer Horgásztó weboldalhoz.

    python tools/optimize_images.py            # images/ -> images_web/
    python tools/optimize_images.py --inplace  # images/ felülírása (óvatosan!)

A fájlneveket VÁLTOZATLANUL hagyja, ezért a HTML-t nem kell átírni.
Minden fotó a szerepe szerinti méretre kicsinyítve, JPEG q82 progresszív,
metaadat nélkül. A jegyikon PNG-k 512 px-re, átlátszóság megtartásával.

Szükséges: pip install pillow
"""

import argparse
import os
import shutil
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Hiányzik a Pillow. Telepítés:  pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "images")

HERO, BIG, STD = 2560, 2000, 1600

# amelyik fotó nincs felsorolva, az STD méretet kap
SIZES = {
    "DSC_5555.jpg": HERO,
    "DSC_5568.jpg": BIG, "DSC_5380.jpg": BIG, "DSC_5409.jpg": BIG,
    "DSC_5443.jpg": BIG, "DSC_5517.jpg": BIG, "DSC_5394.jpg": BIG,
    "DSC_5421.jpg": BIG, "DSC_5388.jpg": BIG, "DSC_5530.jpg": BIG,
    "DSC_6431.jpg": BIG, "DSC_6699.jpg": BIG,
}

ICON_PX = 512
JPEG_EXT = (".jpg", ".jpeg")


def process(name: str, src_dir: str, dst_dir: str) -> tuple[float, float]:
    src = os.path.join(src_dir, name)
    dst = os.path.join(dst_dir, name)
    before = os.path.getsize(src) / 1e6
    ext = os.path.splitext(name)[1].lower()

    with Image.open(src) as im:
        if ext in JPEG_EXT:
            im = ImageOps.exif_transpose(im).convert("RGB")
            im.thumbnail((SIZES.get(name, STD),) * 2, Image.LANCZOS)
            im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
        elif ext == ".png":
            im = im.convert("RGBA")
            im.thumbnail((ICON_PX, ICON_PX), Image.LANCZOS)
            im.save(dst, "PNG", optimize=True)
        else:
            shutil.copy2(src, dst)

    return before, os.path.getsize(dst) / 1e6


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--inplace", action="store_true",
                    help="az images/ mappa felülírása (előtte készíts másolatot!)")
    args = ap.parse_args()

    if not os.path.isdir(SRC):
        sys.exit(f"Nincs images mappa: {SRC}")

    if args.inplace:
        backup = os.path.join(ROOT, "images_eredeti")
        if not os.path.isdir(backup):
            print(f"Biztonsági másolat -> {backup}")
            shutil.copytree(SRC, backup)
        src_dir = backup
        dst_dir = SRC
    else:
        src_dir = SRC
        dst_dir = os.path.join(ROOT, "images_web")
        os.makedirs(dst_dir, exist_ok=True)

    files = sorted(
        f for f in os.listdir(src_dir)
        if os.path.isfile(os.path.join(src_dir, f)) and not f.startswith(".")
        and os.path.splitext(f)[1].lower() in JPEG_EXT + (".png",)
    )
    if not files:
        sys.exit("Nem találtam képeket.")

    total_b = total_a = 0.0
    print(f"{len(files)} kép -> {dst_dir}\n")

    for f in files:
        try:
            b, a = process(f, src_dir, dst_dir)
            total_b += b
            total_a += a
            print(f"  {f:22s} {b:6.1f} -> {a:5.2f} MB")
        except Exception as exc:
            print(f"  {f:22s} HIBA: {exc}")

    pct = (total_a / total_b * 100) if total_b else 0
    print(f"\nÖSSZESEN: {total_b:.1f} MB -> {total_a:.1f} MB  ({pct:.1f}%)")
    if not args.inplace:
        print("A fájlnevek azonosak, ezért a HTML-t nem kell módosítani —")
        print("csak másold az images_web/ tartalmát az images/ mappába.")


if __name__ == "__main__":
    main()
