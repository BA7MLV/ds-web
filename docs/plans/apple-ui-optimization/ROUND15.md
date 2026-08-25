# Round 15 — 品牌资源、触控扫尾与文案第十二轮

## 目标

补齐遗留品牌触控图标缺口（若可轻量完成），继续区块微节奏与文案第十二轮，保持三语对齐。

## 本轮 10 路

1. 可选：补 `public/apple-touch-icon.png`（若可用现有 logo 导出；勿提交巨型无关图；不可行则文档注明并跳过）
2. TopNav 滚动态品牌字重 / 间距与汉堡断点再验（lg 一致）
3. Architecture ↔ FAQ 区块衔接留白再验
4. Download 空态卡深色对比再验
5. Skip link 可见焦点与着陆偏移再验
6. `llms.txt` / 公开文案与官网品牌句一致性轻量核对
7. Analytics / 第三方脚本加载注释与隐私表述一致性（勿改行为，仅注释或文案）
8. zh 文案第十二轮：`policy.*` / `footer.*` 再压一遍去腔
9. en / zh-Hant 同步本轮 copy
10. ROUND14 验收最终核对 + PROGRESS 关闭 Round 14 / 开启本轮记录

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地（含一项审计无代码变更）。

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | 补 `apple-touch-icon.png`（180²，由 logo.svg 生成） | ✅ | `3012133` |
| 2 | TopNav 滚动态品牌 tracking | ✅ | `b0f578e` |
| 3 | Architecture ↔ FAQ 留白 | ✅ | `d5f615f` |
| 4 | Download 空态深色对比 | ✅ | `c28a882` |
| 5 | Skip link 着陆 scroll-margin | ✅ | `d413874` |
| 6 | llms.txt 品牌句对齐 | ✅ | `325983f` |
| 7 | Analytics ↔ 隐私文案核对 | ✅ 无需改动 | — |
| 8 | zh policy 文案第十二轮 | ✅ | `a06a862` |
| 9 | en / zh-Hant 同步 policy | ✅ | `cc972d0` |
| 10 | ROUND14 验收 + PROGRESS / 本轮关闭 | ✅ | 见本提交 |

补充：三语 329 keys；`npm run build` 复验通过。
