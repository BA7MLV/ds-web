# 官网主页 Kumo UI 全量重构设计

日期：2026-02-06

## 背景与目标
本次重构针对官网 React 首页（`src/App.jsx`）的 Landing 与 Download 两套视图。
目标是在保留现有 Apple 风格视觉（`--apple-*` token）的前提下，引入
Kumo UI 组件体系，并升级到 Tailwind v4，提升一致性与可维护性。

成功标准：
1. 视觉延续现有 Apple 高级极简风格，品牌感不漂移。
2. Landing 与 Download 页面全部使用 Kumo 组件封装层。
3. Tailwind v4 升级后构建稳定，暗色/浅色模式一致可用。
4. 交互与信息架构更清晰，转化路径更顺畅。

## 范围与非范围
范围：
- Landing 全量重构（TopNav / Hero / Stats / Feature / CTA / Footer）。
- Download 视图全量重构（平台选择 / 安装说明 / FAQ / 返回首页）。
- Tailwind v4 升级与 Kumo 样式接入。

非范围：
- 文档站（VitePress）不改造。
- 业务逻辑与下载 URL 不变，仅重组信息架构与 UI。

## 方案概述（组件优先）
先建立 Kumo 组件封装层，再进行页面重构，最后统一动效与暗色模式。
该顺序降低风险，避免样式漂移与重复改动。

## 组件与样式架构
1. 新增 `src/styles/kumo.css`：
   - 引入 `@cloudflare/kumo/styles/tailwind`。
   - 覆盖 Kumo 主题变量，映射到 `--apple-*` token。
2. 新增 Kumo 组件封装层（建议 `src/components/ui/kumo/`）：
   - 统一导出：Button / Card / Tabs / Badge / Accordion / Dialog /
     Tooltip / Carousel / Input / Select / Switch 等。
   - 统一 className 注入 Apple 风格（圆角、阴影、玻璃感、hover）。
3. 暗色模式：
   - 保持 `html.dark` 机制。
   - 为 Kumo 兼容新增 `data-mode="dark"`（挂在 `#root` 或 `body`）。

## 主题变量映射策略
以 `--apple-*` 为主基调，仅做 Kumo 变量绑定。
示例（不完整）：
- `--color-kumo-brand` → `--apple-blue`
- `--text-color-kumo-default` → `--apple-ink`
- `--text-color-kumo-strong` → `--apple-ink-secondary`
- `--text-color-kumo-subtle` → `--apple-muted`
- `--color-kumo-base` / `--color-kumo-elevated` → `--apple-surface` 体系

## 页面结构（Landing）
1. TopNav：Logo + 主导航 + 主 CTA（立即下载）。
2. Hero：主标题 + 价值副标题 + 双 CTA + 产品视觉叠层卡片。
3. Stats：3-4 个数据亮点卡片。
4. Feature Grid：4-6 张功能卡片（图标 + 标题 + 描述）。
5. Workflow/Use Cases：Accordion 或 Stepper 展示流程。
6. Social Proof：社区/开源/用户群入口。
7. CTA：强转化区块。
8. Footer：版权、协议、社群链接。

## 页面结构（Download）
1. 平台选择：Tabs（macOS / Windows / Linux）。
2. 安装说明：步骤卡片或分块说明。
3. 常见问题：Accordion。
4. 返回首页 CTA：保持原有路由逻辑不变。

## 动效与可访问性
动效保持克制：淡入、轻微位移、视差仅应用于关键区块。
遵循 `prefers-reduced-motion`。
所有交互组件补齐 `aria` 属性，并确保键盘导航可用。

## 迁移步骤（高层）
1. 升级到 Tailwind v4，并调整构建配置。
2. 接入 `@cloudflare/kumo/styles/tailwind`。
3. 完成 Kumo 主题变量绑定与暗色兼容。
4. 搭建 Kumo 组件封装层。
5. 重构 Landing 与 Download 页面结构。
6. 调整动效与视觉细节，完成验收。

## 测试与验收
1. 视觉：桌面/移动/浅色/深色四象限检查。
2. 功能：`view=download` 路由切换保持一致。
3. CTA：下载按钮与跳转链接正确。
4. 兼容：Chrome/Safari/Edge 无错位。
5. 性能：首屏加载无明显 CLS，图像资源合理。

## 风险与缓解
- Tailwind v4 升级风险：先升级构建，再接入 Kumo 样式。
- 主题变量冲突：统一由 `src/styles/kumo.css` 管控映射。
- 暗色模式差异：以 `--apple-*` 为单一来源。

## 假设与默认
1. 仅重构 React 官网首页，不涉及 VitePress 文档站。
2. 保留现有文案与核心逻辑，允许结构重排优化。
3. Kumo 组件只通过封装层使用，不直接引用原组件。
