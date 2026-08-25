# Round 9 — 死代码清理、文档站与可访问性再打磨

## 目标

收掉 Round 8 遗留的 VitePress 搜索 token（若尚未落地），清理 ModeSwitchPanel 删除后的无用 primitive，并继续 a11y / 文案 / 文档站一致性。

## 本轮 10 路

1. 收尾 Round 8 #9：VitePress 搜索框 / local nav `--apple-*`（若 `feat(docs): Round 8 VitePress search apple tokens` 已存在则跳过并记录 SHA）
2. 删除无引用的 `src/components/ui/switch.jsx`（ModeSwitchPanel 移除后的死代码），确认无 radix 依赖残留问题
3. `locale-toggle.jsx` 动态/静态双重 import 警告治理（保留正确加载语义）
4. VitePress `CustomHome.vue` 审计：与官网重复则收敛样式或明确非首页挂载注释
5. Skip link / landmarks 二次核对（营销页 + docs）
6. Download 空态 / fallback 深色对比再验
7. Footer 社交链接 a11y（可见标签 / aria 与 i18n）
8. zh 文案第六轮：download.* / policy.* 去 AI 腔压缩
9. en / zh-Hant 同步本轮 copy
10. ROUND8 验收清单最终回填（含 #9 SHA）+ PROGRESS 关闭 Round 8

## 验收

- build 通过
- 无未使用 `switch.jsx`
- Round 8 10/10 在文档中闭合
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地。

| # | 项目 | 状态 | Commit |
|---|------|------|--------|
| 1 | Round 8 #9：VitePress 搜索框 / nav `--apple-*` | ✅ 已于 Round 8 落地，跳过 | `58b8e82` |
| 2 | 删除无引用 `switch.jsx` | ✅ | `f8fcfc6` |
| 3 | `locale-toggle.jsx` 动静态 import 警告治理 | ✅ | `855f782` |
| 4 | VitePress `CustomHome.vue` 审计 | ✅ | `690b072` |
| 5 | Skip link / landmarks 二次核对 | ✅ | `5a707dc` |
| 6 | Download 空态 / fallback 深色再验 | ✅ | `61ac76d` |
| 7 | Footer 社交链接 a11y | ✅ | `e7548af` |
| 8 | zh download.* / policy.* 文案第六轮 | ✅ | `7aa6487` |
| 9 | en / zh-Hant 同步本轮 copy | ✅ | `5f34994` |
| 10 | ROUND8 验收回填 + PROGRESS 关闭 Round 8 | ✅ | `7ef31d7` / 本轮验收 `bcc4362` |
