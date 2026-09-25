#!/usr/bin/env python3
"""把微信客户端导出的二维码截图裁成 docs/public/qr-wechat.png。

为什么留一个脚本：
/wechat 的码是「个人微信」客户端导出的图（不是像 QQ 群那样拿链接现场生成的），
系统相册里那张是**竖图**：上面一条头像 + 昵称，中间才是码，下面还有一句英文提示。
支持页的卡位是 1:1（176×176 CSS px），直接塞竖图会被压扁。
所以「换码」这一步固定是：截图 → 裁出码 → 补静区 → 正方形 → 480×480。

裁剪规则：
- 码的位置不靠写死坐标找，而是按像素统计 —— 相邻的暗像素在行/列上的**跨度**。
  二维码每一行都横跨整幅码宽（定位图案在左右两端），头像那一段只有 150px 宽，
  一句浅灰英文提示的字重又够不到阈值，两者都不会被误判成码。
  换一张截图（尺寸、头像、提示语不同）也能用。
- 静区补 4 个模块（规范下限）。截图里码的外沿紧贴定位图案，没有静区，
  裁到外沿会让部分扫码器读不到定位图案。模块边长从码顶行第一条暗色横线反推
  —— 那正是定位图案的 7 个模块。
- 输出恒为 480×480、白底：与 qr-qq-group.png / qr-xiaohongshu.png 同规格，
  二维码位图不参与暗色主题反色（反色码多数扫码器认不出）。
- 最后压成 16 级灰的调色板图。截图的 JPEG 噪点让无损 PNG 要到 120KB，
  而码本身只有黑白两色加一点点抗锯齿边，16 级足够 —— 体积降到 1/3，
  176px 的显示尺寸下看不出差别，扫码校验照过。

用法（依赖 pillow；zxing-cpp 可选，装了就会顺手验一遍码）：
  /Users/ba7mlv/.workbuddy/binaries/python/envs/default/bin/python \
      scripts/prepare-wechat-qr.py <微信导出的截图> [输出路径]
"""

import sys
from pathlib import Path

from PIL import Image

RESAMPLE = Image.LANCZOS
TARGET_PX = 480
QUIET_MODULES = 4
DARK_THRESHOLD = 128  # 亮度阈值：低于它算「码的暗色」；浅灰提示文字在 200 以上
MIN_ROW_SPAN = 0.6  # 一行暗像素的跨度超过图宽 60% 才认为是码所在的行


def find_code_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """按暗像素跨度的突变框出二维码，返回 (left, top, right, bottom)（右/下为开区间）。"""
    gray = img.convert("L")
    width, height = gray.size
    px = gray.load()

    rows: list[tuple[int, int, int]] = []  # (y, xmin, xmax)
    for y in range(height):
        xmin, xmax = width, -1
        for x in range(width):
            if px[x, y] < DARK_THRESHOLD:
                if x < xmin:
                    xmin = x
                if x > xmax:
                    xmax = x
        if xmax >= 0:
            rows.append((y, xmin, xmax))

    band = [r for r in rows if (r[2] - r[1]) > MIN_ROW_SPAN * width]
    if not band:
        raise SystemExit("没找到二维码：整幅图里没有横跨大半宽度的暗色行。")

    top, bottom = band[0][0], band[-1][0] + 1
    left = min(r[1] for r in band)
    right = max(r[2] for r in band) + 1

    # 码顶行最左边那条连续暗线 = 定位图案，宽度正好 7 个模块
    row = [x for x in range(width) if px[x, top] < DARK_THRESHOLD]
    first_run = 1
    for a, b in zip(row, row[1:]):
        if b != a + 1:
            break
        first_run += 1
    module = first_run / 7

    pad = max(1, round(module * QUIET_MODULES))
    left, top = left - pad, top - pad
    right, bottom = right + pad, bottom + pad

    # 静区大小取整后可能差个一两像素，正方形取大边再居中，保证码不偏
    side = max(right - left, bottom - top)
    cx, cy = (left + right) / 2, (top + bottom) / 2
    left, top = round(cx - side / 2), round(cy - side / 2)

    if left < 0 or top < 0 or left + side > width or top + side > height:
        raise SystemExit(f"裁到画布外了：({left}, {top}) 边长 {side}，原图 {width}×{height}。")

    return left, top, left + side, top + side


def verify(path: Path) -> None:
    try:
        import numpy as np
        import zxingcpp
    except ImportError:
        print("（未装 zxing-cpp，跳过扫码校验）")
        return
    text = zxingcpp.read_barcode(np.array(Image.open(path).convert("RGB")))
    print(f"扫码校验：{text.text if text else '解不出来 —— 别提交这张图'}")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__.strip().splitlines()[-2].strip())

    src = Path(sys.argv[1]).expanduser()
    out = Path(sys.argv[2]).expanduser() if len(sys.argv) > 2 else (
        Path(__file__).resolve().parent.parent / "docs" / "public" / "qr-wechat.png"
    )

    img = Image.open(src).convert("RGB")
    box = find_code_bbox(img)
    square = img.crop(box).resize((TARGET_PX, TARGET_PX), RESAMPLE)
    square = square.convert("L").convert("P", palette=Image.ADAPTIVE, colors=16)
    square.save(out, optimize=True)
    print(f"{src.name}  {img.size[0]}×{img.size[1]}  →  {out}  {TARGET_PX}×{TARGET_PX}")
    print(f"裁切框：{box}")
    verify(out)


if __name__ == "__main__":
    main()
