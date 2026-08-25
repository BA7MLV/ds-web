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
