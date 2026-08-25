# Round 8 — i18n 扫尾、资源一致性与视觉二次打磨

## 目标

收掉 Round 7 后仍可见的硬编码中文与品牌不一致，核对截图资源宽高比，并继续平板/深色微交互与文档站体量。

## 本轮 10 路

1. `useImageLoader` 错误/重试文案三语 i18n（去掉硬编码中文）
2. TopNav / Footer / 移动菜单硬编码「GitHub」标签走 i18n
3. `ModeSwitchPanel` 使用审计：接入营销页或收敛未用导出/死代码
4. LazyImage / OptimizedImage 与 public 截图 aspect-ratio / 尺寸声明核对
5. 平板（768–1024）菜单打开态视觉与安全区二次打磨
6. FreeModels + Stats 深色模式微对比与 hover 再验
7. FAQ / Architecture 文案语气第五轮（zh，去 AI 腔）
8. en / zh-Hant 同步本轮新增或改动的 copy keys
9. VitePress：搜索框 / 本地 nav 与 `--apple-*` 再对齐；关注 chunk 提示但不强行拆包
10. ROUND7 验收清单核对 + 视觉 QA 记录（截图可放 artifacts，勿提交大图进仓库）

## 验收

- build 通过
- `useImageLoader` / 主导航无硬编码中文错误串或 GitHub 标签
- 三语 key 对齐
- PROGRESS 更新

## 验收结果（已完成）

本轮开题于 `8dd7180`（docs: close Round 7 and open Round 8 plan）。10 路落地情况：

1. `useImageLoader` 错误/重试文案三语 i18n — `3dcce44`
2. TopNav / Footer / 移动菜单 GitHub 标签走 i18n — `1827ae3`
3. `ModeSwitchPanel` 使用审计 — `548faca`
4. LazyImage / OptimizedImage 截图 aspect-ratio 核对 — `77d4660`
5. 平板（768–1024）菜单打开态二次打磨 — `6fa27c0`
6. FreeModels + Stats 深色微对比与 hover 再验 — `2ccce33`
7. FAQ / Architecture zh 文案第五轮 — `cab1907`
8. en / zh-Hant 同步本轮 copy keys — `c01196e`
9. VitePress 搜索框 / 本地 nav 与 `--apple-*` 再对齐 — 进行中（截至本次验收暂无对应 commit）
10. ROUND7 验收清单核对 + 视觉 QA 记录 — 随本提交落地（ROUND7 验收结果已在 `8dd7180` 回填并复核）

**视觉 QA 记录**：Hero 区块在浅色首屏与滚动态各截图复核一次（含滚动指示器与预览提示），未见回归；截图作为本地 artifacts 保留（`deepstudent-hero-round1*.webp` / `hero-section-verification.md`），按约定不提交大图进仓库。

#9 待对应 commit 落地后由后续轮次（Round 9）收尾。
