#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path
from typing import cast

from PIL import Image


WIDTHS = (640, 960, 1280, 1600)
EXAMPLE_DIR = Path(__file__).resolve().parent.parent / 'public' / 'img' / 'example'


def normalize_mode(image: Image.Image) -> Image.Image:
  if image.mode == 'P' and 'transparency' in image.info:
    return image.convert('RGBA')
  if 'A' in image.getbands():
    return image.convert('RGBA')
  return image.convert('RGB')


def alpha_min(image: Image.Image) -> int:
  extrema = image.convert('RGBA').getchannel('A').getextrema()
  if isinstance(extrema, tuple):
    return int(cast(tuple[int, int], extrema)[0])
  return int(cast(float, extrema))


def resize_and_export(src: Path) -> None:
  with Image.open(src) as original:
    normalized = normalize_mode(original)
    w, h = normalized.size

    for target_w in WIDTHS:
      final_w = min(target_w, w)
      final_h = int(h * (final_w / w))
      resized = normalized.resize((final_w, final_h), Image.Resampling.LANCZOS)

      resized.save(src.with_name(f'{src.stem}-{target_w}.png'), format='PNG', optimize=True)
      resized.save(src.with_name(f'{src.stem}-{target_w}.webp'), format='WEBP', quality=82, method=6)


def find_alpha_loss_sources() -> list[Path]:
  affected = []
  for src in EXAMPLE_DIR.glob('*.png'):
    if any(src.stem.endswith(f'-{width}') for width in WIDTHS):
      continue

    webp = src.with_name(f'{src.stem}-960.webp')
    if not webp.exists():
      continue

    with Image.open(src) as src_image:
      src_alpha_min = alpha_min(normalize_mode(src_image))

    with Image.open(webp) as webp_image:
      webp_alpha_min = alpha_min(webp_image)

    if src_alpha_min < 255 and webp_alpha_min == 255:
      affected.append(src)

  return affected


def main() -> None:
  affected_sources = find_alpha_loss_sources()
  if not affected_sources:
    print('No alpha-loss sources detected.')
    return

  for src in affected_sources:
    resize_and_export(src)
    print(f'Regenerated: {src.name}')


if __name__ == '__main__':
  main()
