---
title: 简介
---

<section class="doc-hero">
  <p class="doc-hero-eyebrow">DeepStudent</p>
  <h1 class="doc-hero-title">AI 原生、本地优先的<br><span class="highlight">开源学习系统</span></h1>
  <p class="doc-hero-subtitle">基于 Tauri 2 构建，AGPL-3.0 开源。以 Chat V2 作为统一入口，将 Learning Hub、Skills、MCP 工具生态与 CardForge 制卡任务连接为一个可持续学习闭环。</p>
  <div class="doc-hero-actions">
    <a class="doc-hero-btn primary" href="./download.html">
      <span>客户端下载</span>
      <svg class="doc-hero-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </a>
    <a class="doc-hero-btn secondary" href="./start.html">快速入门</a>
  </div>
</section>

![主图](/img/example/软件主页图-1280.webp)

<div>
  <p>关注我们的小红书账号：<a href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f">小红书</a></p>
  <p>加入我们的社群：<a href="https://qm.qq.com/q/1lTUkKSaB6">QQ群（310134919）</a></p>
</div>

---

### 核心能力（按当前主项目实现校准）

| 模块 | 对应能力 |
|:---|:---|
| **Chat V2 智能对话** | 多会话、流式回复、上下文引用、工具调用可视化、研究任务编排 |
| **Learning Hub 学习资源中心** | 访达式资源管理、拖拽注入对话、统一索引状态、跨资源检索 |
| **Skills 系统** | 指令型技能 + 工具组按需注入，支持内置 / 全局 / 项目级技能 |
| **MCP 扩展层** | 支持 SSE / WebSocket / HTTP 传输，外部工具与内置链路协同 |
| **CardForge 制卡任务** | 文档到卡片的任务化流程、模板管理、预览、导出与同步 |
| **VFS 本地数据层** | 学习资源统一进入 VFS，OCR + 向量化后可被检索与引用 |
| **系统配置与治理** | API 供应商接入、外部搜索配置、备份/同步、审计与恢复 |

### 技术基线

- **前端**：React 18 + Vite + TypeScript
- **桌面运行时**：Tauri 2（Rust）
- **数据层**：SQLite（元数据）+ LanceDB（向量检索）+ Blob（资产文件）
- **安全策略**：本地优先、敏感数据加密存储、可审计可备份
- **平台支持**：macOS、Windows，并提供 iOS / Android 构建链路

### 你可以从这里开始

- 🚀 [快速入门](start.md)
- 📥 [客户端下载](download.md)
- 🧭 [功能介绍](function.md)
- 🏗️ [功能架构](feature-architecture.md)
- ❓ [常见问题](A-Q.md)

<style>
/* ============================================================
   doc-hero：逐项复用 Layout.vue 定义的官网 --apple-* token，
   视觉配方与 CustomHome.vue 的 hero 一致（尺寸按文档栏宽收窄）。
   选择器统一带 .doc-hero 前缀并压过 .vp-doc 默认样式。
   ============================================================ */
.doc-hero {
  /* nav→hero 间距：56px 导航栏 + VPDoc 自带 32/48px 顶部内边距，
     顶部 margin 补足官网 hero 节奏的文档栏缩放，底部 2.5rem 收尾 */
  margin: clamp(0.75rem, 2.5vh, 1.5rem) 0 2.5rem;
}

.doc-hero .doc-hero-eyebrow {
  margin: 0 0 0.75rem;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apple-muted);
}

.doc-hero .doc-hero-title {
  margin: 0 0 1rem;
  border: none;
  padding: 0;
  font-size: clamp(2rem, 4.5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.08;
  color: var(--apple-ink);
  text-wrap: balance;
}

.doc-hero .doc-hero-title .highlight {
  background: var(--apple-title-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.doc-hero .doc-hero-subtitle {
  margin: 0 0 1.75rem;
  font-size: clamp(1rem, 1.5vw, 1.0625rem);
  line-height: 1.65;
  color: var(--apple-ink-secondary);
}

.doc-hero .doc-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.doc-hero .doc-hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s var(--ease-apple);
}

.doc-hero .doc-hero-btn:active {
  transform: scale(0.98);
}

.doc-hero .doc-hero-btn:focus-visible {
  outline: 2px solid var(--apple-ink);
  outline-offset: 2px;
}

.doc-hero .doc-hero-btn.primary {
  color: var(--apple-btn-primary-text);
  background-color: var(--apple-btn-primary-bg);
}

.doc-hero .doc-hero-btn.primary:hover {
  color: var(--apple-btn-primary-text);
  background-color: var(--apple-btn-primary-bg-hover);
}

.doc-hero .doc-hero-btn.secondary {
  color: var(--apple-ink);
  background: transparent;
  border: 1px solid var(--apple-line-strong);
}

.doc-hero .doc-hero-btn.secondary:hover {
  color: var(--apple-ink);
  background: var(--apple-btn-secondary-bg-hover);
}

.doc-hero .doc-hero-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.9;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.doc-hero .doc-hero-btn.primary:hover .doc-hero-arrow {
  transform: translateX(2px);
  opacity: 1;
}

@media (max-width: 639px) {
  .doc-hero .doc-hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .doc-hero .doc-hero-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-hero .doc-hero-btn,
  .doc-hero .doc-hero-arrow {
    transition: none;
  }

  .doc-hero .doc-hero-btn:active {
    transform: none;
  }

  .doc-hero .doc-hero-btn.primary:hover .doc-hero-arrow {
    transform: none;
  }
}
</style>
