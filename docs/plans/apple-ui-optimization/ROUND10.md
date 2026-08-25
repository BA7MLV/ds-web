# Round 10 — 性能、深色/动效与文案第七轮

## 目标

在 Round 9 收尾后继续压性能与深色一致性，处理已知资源比例问题，并推进文案第七轮。

## 本轮 10 路

1. 可选：移除未使用的 `@radix-ui/react-switch` 依赖（确认无其它引用后）
2. 记录并尽量修复「软件主页图」png vs webp 宽高比不一致（优先改维度声明；勿强行提交大图，除非已有导出流程）
3. 营销页性能预算扫描：主包 / locale chunk / LCP 图片提示清单（可改代码或文档记录）
4. FAQ 手风琴动效与 reduced-motion 再验
5. PolicyModal 深色对比与焦点环再验
6. Hero 移动端排版（字号/行高/CTA 间距）微打磨
7. VitePress `.doc-hero` 深色模式间距与对比
8. 全站 `prefers-reduced-motion` 二次扫描遗漏
9. zh 文案第七轮：nav.* / a11y.* / placeholder.* 压缩去 AI 腔
10. en / zh-Hant 同步本轮 copy + ROUND9 最终 SHA 核对写入 PROGRESS

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS / ROUND10 更新
