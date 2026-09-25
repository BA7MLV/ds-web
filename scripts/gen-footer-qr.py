#!/usr/bin/env python3
"""生成页脚 QQ 群 / 小红书二维码（docs/public/qr-*.png）。

为什么留一个脚本而不是只丢两张 PNG：
二维码内容写死在 SiteFooter.vue 的 LINKS 里，链接一改，图就得跟着重出。
脚本把「链接 → 图」这一步显式记下来，改链接时照着跑一遍即可，
不用去找某个在线生成器、也不用猜当初用了什么纠错级别。

参数取值的理由：
- 纠错 M（15%）：屏幕扫码，不存在污损，M 足够；提到 Q/H 只会让码点更密、
  小尺寸下更难扫，得不偿失。
- box_size 按目标边长反算：页面上显示约 180 CSS px，retina 下需要 360 物理像素，
  取 480 留足余量。必须是整数，所以边长是「模块数 × box_size」凑出来的近似值。
- 固定白底 + 近黑码：#FFFFFF / #16161A。深色主题下二维码**不能**跟着反色 ——
  反色码多数扫码器认不出，所以这张图不参与主题切换。
- border=3：静区留 3 个模块。低于 2 个模块，贴边的扫码器会读不到定位图案。

用法（依赖 qrcode + pillow，装在隔离环境里，别装到系统 Python）：
  /Users/ba7mlv/.workbuddy-ai/binaries/python/envs/default/bin/python scripts/gen-footer-qr.py
"""

from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_M

TARGET_PX = 480
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "public"

# 与 SiteFooter.vue 的 LINKS 一一对应。改这里之前先确认那边也改了。
TARGETS = [
    ("qr-qq-group.png", "https://qm.qq.com/q/1lTUkKSaB6"),
    (
        "qr-xiaohongshu.png",
        "https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f",
    ),
]


def build(data: str) -> qrcode.QRCode:
    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_M, border=3)
    qr.add_data(data)
    qr.make(fit=True)

    # 模块数含静区，box_size 必须是整数，所以边长只能贴近 TARGET_PX
    modules = qr.modules_count + qr.border * 2
    qr.box_size = max(1, round(TARGET_PX / modules))
    return qr


def main() -> None:
    for filename, data in TARGETS:
        qr = build(data)
        img = qr.make_image(fill_color="#16161A", back_color="#FFFFFF")
        path = OUT_DIR / filename
        img.save(path)
        print(f"{path.name}  {img.size[0]}x{img.size[1]}  {len(data)}B  {data}")


if __name__ == "__main__":
    main()
