<template>
  <div class="landing-page">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <!-- 左侧内容 -->
          <div class="hero-content">
            <p class="hero-eyebrow">DeepStudent</p>
            <h1 class="hero-title">
              优化您的<br />
              <span class="highlight">终身学习空间</span>
            </h1>
            <p class="hero-subtitle">
              智能对话 · 自动制卡 · 批注阅读
            </p>
            <p class="hero-tagline">
              本地优先，私密可控，知识可扩展
            </p>
            <div class="hero-actions">
              <a href="./guide/download.html" class="btn btn-primary">
                <span>立即下载</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="./guide/index.html" class="btn btn-secondary">了解更多</a>
            </div>

            <!-- 核心特性列表 -->
            <div class="hero-features">
              <div class="feature-item">
                <span class="feature-dot" aria-hidden="true"></span>
                <span>AI 驱动的智能错题分析</span>
              </div>
              <div class="feature-item">
                <span class="feature-dot" aria-hidden="true"></span>
                <span>一键生成 ANKI 记忆卡片</span>
              </div>
              <div class="feature-item">
                <span class="feature-dot" aria-hidden="true"></span>
                <span>RAG 增强的知识库追问</span>
              </div>
              <div class="feature-item">
                <span class="feature-dot" aria-hidden="true"></span>
                <span>本地数据，隐私安全</span>
              </div>
            </div>
          </div>

          <!-- 右侧产品展示 -->
          <div class="hero-visual">
            <div class="app-showcase">
              <div class="app-window">
                <div class="window-header">
                  <div class="window-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <div class="window-content">
                  <div class="mockup-content">
                    <div class="mockup-sidebar">
                      <div class="mockup-nav-item active"></div>
                      <div class="mockup-nav-item"></div>
                      <div class="mockup-nav-item"></div>
                      <div class="mockup-nav-item"></div>
                    </div>
                    <div class="mockup-main">
                      <div class="mockup-card">
                        <div class="mockup-card-header">
                          <div class="mockup-avatar"></div>
                          <div class="mockup-lines">
                            <div class="mockup-line short"></div>
                            <div class="mockup-line"></div>
                          </div>
                        </div>
                        <div class="mockup-card-body">
                          <div class="mockup-line"></div>
                          <div class="mockup-line"></div>
                          <div class="mockup-line medium"></div>
                        </div>
                      </div>
                      <div class="mockup-card">
                        <div class="mockup-card-header">
                          <div class="mockup-avatar"></div>
                          <div class="mockup-lines">
                            <div class="mockup-line short"></div>
                            <div class="mockup-line"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 装饰元素 -->
              <div class="glow-effect" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能亮点区域 -->
    <section class="highlights">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">核心功能</h2>
          <p class="section-desc">为高效学习打造的智能工具</p>
        </div>
        <div class="highlights-grid">
          <div class="highlight-card" v-for="item in highlights" :key="item.title">
            <div class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" v-html="item.icon"></svg>
            </div>
            <h3 class="highlight-title">{{ item.title }}</h3>
            <p class="highlight-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 优势展示区域 -->
    <section class="advantages">
      <div class="container">
        <div class="advantage-row" v-for="(item, index) in advantages" :key="item.title" :class="{ 'reversed': index % 2 === 1 }">
          <div class="advantage-content">
            <span class="advantage-number">0{{ index + 1 }}</span>
            <h3 class="advantage-title">{{ item.title }}</h3>
            <p class="advantage-desc">{{ item.desc }}</p>
            <ul class="advantage-list">
              <li v-for="point in item.points" :key="point">{{ point }}</li>
            </ul>
          </div>
          <div class="advantage-visual">
            <div class="visual-placeholder" :class="item.visualClass">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" v-html="item.visual"></svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <h2 class="cta-title">开始您的智能学习之旅</h2>
          <p class="cta-desc">免费开源，立即体验</p>
          <div class="cta-actions">
            <a href="./guide/download.html" class="btn btn-primary btn-large">免费下载</a>
            <a href="https://github.com/BA7MLV/ds-web" target="_blank" class="btn btn-secondary btn-large">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const highlights = [
  {
    icon: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
    title: 'AI 智能分析',
    desc: '深度解析错题，精准定位知识薄弱点，提供个性化学习建议'
  },
  {
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
    title: 'ANKI 制卡',
    desc: '一键生成 ANKI 记忆卡片，支持自定义模板，无缝衔接间隔重复学习'
  },
  {
    icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    title: 'RAG 知识库',
    desc: '基于 RAG 技术，支持对错题进行智能追问，获取深度解释和拓展'
  },
  {
    icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/>',
    title: '知识导图',
    desc: '多种布局、双视图切换、背诵模式，导出 OPML/Markdown/JSON'
  },
  {
    icon: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01"/>',
    title: '智能题库',
    desc: '8 种练习模式、SM-2 间隔重复、AI 解析、多维统计'
  },
  {
    icon: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    title: '本地优先',
    desc: '数据本地存储，隐私可控，离线可用，安全可靠'
  }
]

const advantages = [
  {
    title: 'AI 智能归类与标签化',
    desc: '告别手动整理的低效耗时，让复习更有针对性',
    points: ['自动识别错题类型、知识点和难度等级', '智能打标签并分类归档', '支持多模态输入识别'],
    visualClass: 'visual-ai',
    visual: '<circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="2"/><circle cx="100" cy="100" r="40" stroke="currentColor" stroke-width="1.5"/><circle cx="100" cy="100" r="20" fill="currentColor"/><path d="M100 40v20M100 140v20M40 100h20M140 100h20" stroke="currentColor" stroke-width="2"/>'
  },
  {
    title: 'ANKI 牌组一键制卡',
    desc: '免去繁琐的手动制卡步骤，高效利用间隔重复',
    points: ['智能提取关键信息生成卡片', '支持自定义卡片模板', '一键导出 ANKI 格式'],
    visualClass: 'visual-anki',
    visual: '<rect x="40" y="50" width="120" height="100" rx="8" stroke="currentColor" stroke-width="2"/><rect x="55" y="70" width="90" height="8" rx="4" fill="currentColor" opacity="0.3"/><rect x="55" y="90" width="70" height="6" rx="3" fill="currentColor" opacity="0.2"/><rect x="55" y="105" width="80" height="6" rx="3" fill="currentColor" opacity="0.2"/>'
  },
  {
    title: '深度知识整合与可视化',
    desc: '构建完整的知识网络，实现高效关联学习',
    points: ['知识导图自动构建知识关联', '相似题目智能召回', '多维分类与向量检索'],
    visualClass: 'visual-graph',
    visual: '<circle cx="100" cy="60" r="15" fill="currentColor"/><circle cx="60" cy="110" r="12" fill="currentColor" opacity="0.7"/><circle cx="140" cy="110" r="12" fill="currentColor" opacity="0.7"/><circle cx="80" cy="150" r="10" fill="currentColor" opacity="0.5"/><circle cx="120" cy="150" r="10" fill="currentColor" opacity="0.5"/><path d="M100 75L60 98M100 75L140 98M60 122L80 140M140 122L120 140M85 150h30" stroke="currentColor" stroke-width="2"/>'
  }
]
</script>

<style>
/* ============================================================
   与官网（src/index.css）对齐的设计 token：
   ink / muted 文本层级、线条、玻璃卡片、阴影与缓动。
   全部选择器收敛在 .landing-page 命名空间内，避免污染主题。
   ============================================================ */
.landing-page {
  --apple-ink: #1d1d1f;
  --apple-ink-secondary: #48484a;
  --apple-muted: #86868b;
  --apple-line: rgba(0, 0, 0, 0.08);
  --apple-line-strong: rgba(0, 0, 0, 0.12);
  --apple-surface: #fbfbfd;
  --apple-surface-elevated: #ffffff;
  --apple-card: rgba(255, 255, 255, 0.65);
  --apple-card-strong: rgba(255, 255, 255, 0.85);
  --apple-shadow-sm:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.02);
  --apple-shadow-md:
    0 4px 12px rgba(0, 0, 0, 0.03),
    0 12px 32px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  --apple-shadow-lg:
    0 8px 24px rgba(0, 0, 0, 0.04),
    0 24px 64px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  --apple-title-gradient: linear-gradient(135deg, #1d1d1f 0%, #434344 100%);
  --apple-btn-primary-bg: #1d1d1f;
  --apple-btn-primary-bg-hover: #3a3a3c;
  --apple-btn-primary-text: #ffffff;
  --apple-btn-secondary-bg-hover: rgba(0, 0, 0, 0.08);
  --apple-glow-orb: rgba(120, 119, 126, 0.05);
  --ease-apple: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-lift: cubic-bezier(0.34, 1.56, 0.64, 1);

  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', ui-sans-serif, sans-serif;
  color: var(--apple-ink);
  background-color: var(--apple-surface);
  background-image:
    radial-gradient(ellipse 120% 80% at 50% -20%, var(--apple-glow-orb), transparent 50%),
    linear-gradient(180deg, #fbfbfd 0%, #ffffff 20%, #f5f5f7 60%, #fbfbfd 100%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: clip;
}

.dark .landing-page {
  --apple-ink: #f5f5f7;
  --apple-ink-secondary: #a1a1a6;
  --apple-muted: #86868b;
  --apple-line: rgba(255, 255, 255, 0.08);
  --apple-line-strong: rgba(255, 255, 255, 0.12);
  --apple-surface: #000000;
  --apple-surface-elevated: #1c1c1e;
  --apple-card: rgba(28, 28, 30, 0.65);
  --apple-card-strong: rgba(44, 44, 46, 0.75);
  --apple-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --apple-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  --apple-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  --apple-title-gradient: linear-gradient(135deg, #ffffff 0%, #e5e5e5 50%, #a1a1a6 100%);
  --apple-btn-primary-bg: #ffffff;
  --apple-btn-primary-bg-hover: #f2f2f7;
  --apple-btn-primary-text: #000000;
  --apple-btn-secondary-bg-hover: rgba(255, 255, 255, 0.12);
  --apple-glow-orb: rgba(255, 255, 255, 0.08);

  background-image:
    radial-gradient(ellipse 100% 80% at 20% -30%, var(--apple-glow-orb), transparent 50%),
    linear-gradient(180deg, #000000 0%, #000000 100%);
}

.landing-page ::selection {
  background: rgba(0, 113, 227, 0.15);
}

.dark .landing-page ::selection {
  background: rgba(10, 132, 255, 0.25);
  color: #ffffff;
}

/* ---------- 布局容器 ---------- */
.landing-page .container {
  max-width: 1120px;
  margin: 0 auto;
  padding-inline: clamp(1.25rem, 5vw, 2rem);
}

/* ---------- Hero：与官网一致的排版节奏 ---------- */
.landing-page .hero {
  padding-block: clamp(4rem, 12vh, 7.5rem) clamp(3.5rem, 9vw, 6rem);
}

.landing-page .hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
}

.landing-page .hero-eyebrow {
  margin: 0 0 0.75rem;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--apple-muted);
}

.landing-page .hero-title {
  margin: 0 0 1rem;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.08;
  color: var(--apple-ink);
  text-wrap: balance;
}

.landing-page .hero-title .highlight {
  background: var(--apple-title-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.landing-page .hero-subtitle {
  margin: 0 0 0.375rem;
  font-size: clamp(1.0625rem, 1.5vw, 1.1875rem);
  line-height: 1.65;
  color: var(--apple-ink-secondary);
}

.landing-page .hero-tagline {
  margin: 0 0 2rem;
  font-size: 15px;
  line-height: 1.65;
  color: var(--apple-muted);
}

.landing-page .hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2.25rem;
}

/* ---------- 按钮：对齐官网 btn-apple-primary / secondary ---------- */
.landing-page .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.75rem 2rem;
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

.landing-page .btn:active {
  transform: scale(0.98);
}

.landing-page .btn:focus-visible {
  outline: 2px solid var(--apple-ink);
  outline-offset: 2px;
}

.landing-page .btn-primary {
  color: var(--apple-btn-primary-text);
  background-color: var(--apple-btn-primary-bg);
}

.landing-page .btn-primary:hover {
  color: var(--apple-btn-primary-text);
  background-color: var(--apple-btn-primary-bg-hover);
}

.landing-page .btn-secondary {
  color: var(--apple-ink);
  background: transparent;
  border: 1px solid var(--apple-line-strong);
}

.landing-page .btn-secondary:hover {
  color: var(--apple-ink);
  background: var(--apple-btn-secondary-bg-hover);
}

.landing-page .btn-arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.9;
  transition: transform 0.15s ease-out, opacity 0.15s ease-out;
}

.landing-page .btn-primary:hover .btn-arrow {
  transform: translateX(2px);
  opacity: 1;
}

.landing-page .btn-large {
  padding: 0.875rem 2.25rem;
  font-size: 16px;
}

.landing-page .btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* ---------- Hero 特性列表 ---------- */
.landing-page .hero-features {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.5rem;
}

.landing-page .feature-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 14px;
  line-height: 1.5;
  color: var(--apple-ink-secondary);
}

.landing-page .feature-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--apple-muted);
  flex-shrink: 0;
}

/* ---------- Hero 产品视觉 ---------- */
.landing-page .hero-visual {
  min-width: 0;
}

.landing-page .app-showcase {
  position: relative;
}

.landing-page .glow-effect {
  position: absolute;
  inset: -12% -8%;
  background: radial-gradient(ellipse 70% 60% at 50% 40%, var(--apple-glow-orb), transparent 70%);
  filter: blur(24px);
  z-index: 0;
  pointer-events: none;
}

.landing-page .app-window {
  position: relative;
  z-index: 1;
  border-radius: 1.25rem;
  overflow: hidden;
  background: var(--apple-card-strong);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--apple-line);
  box-shadow: var(--apple-shadow-lg);
}

.landing-page .window-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--apple-line);
}

.landing-page .window-dots {
  display: flex;
  gap: 6px;
}

.landing-page .window-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--apple-line-strong);
}

.landing-page .window-content {
  padding: 1.25rem;
}

.landing-page .mockup-content {
  display: flex;
  gap: 1rem;
}

.landing-page .mockup-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 72px;
  flex-shrink: 0;
}

.landing-page .mockup-nav-item {
  height: 10px;
  border-radius: 5px;
  background: var(--apple-line);
}

.landing-page .mockup-nav-item.active {
  background: var(--apple-muted);
}

.landing-page .mockup-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.landing-page .mockup-card {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--apple-surface-elevated);
  border: 1px solid var(--apple-line);
  box-shadow: var(--apple-shadow-sm);
}

.landing-page .mockup-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.landing-page .mockup-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--apple-line-strong);
  flex-shrink: 0;
}

.landing-page .mockup-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.landing-page .mockup-card-body {
  margin-top: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.landing-page .mockup-line {
  height: 8px;
  border-radius: 4px;
  background: var(--apple-line);
}

.landing-page .mockup-line.short {
  width: 40%;
}

.landing-page .mockup-line.medium {
  width: 65%;
}

/* ---------- 功能亮点 ---------- */
.landing-page .highlights {
  padding-block: clamp(3.5rem, 9vw, 6.5rem);
}

.landing-page .section-header {
  text-align: center;
  margin-bottom: clamp(2.5rem, 6vw, 4rem);
}

.landing-page .section-title {
  margin: 0 0 0.75rem;
  border: none;
  padding: 0;
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--apple-ink);
}

.landing-page .section-desc {
  margin: 0;
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: 1.65;
  color: var(--apple-muted);
}

.landing-page .highlights-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.landing-page .highlight-card {
  padding: 1.75rem;
  border-radius: 1.25rem;
  background: var(--apple-card);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--apple-line);
  box-shadow: var(--apple-shadow-sm);
  transition: transform 0.3s var(--ease-lift), box-shadow 0.3s ease;
}

.landing-page .highlight-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--apple-shadow-lg);
}

.landing-page .highlight-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 1.125rem;
  border-radius: 12px;
  background: var(--apple-line);
  color: var(--apple-ink);
}

.landing-page .highlight-icon svg {
  width: 22px;
  height: 22px;
}

.landing-page .highlight-title {
  margin: 0 0 0.5rem;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--apple-ink);
}

.landing-page .highlight-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--apple-ink-secondary);
  text-wrap: pretty;
}

/* ---------- 优势展示 ---------- */
.landing-page .advantages {
  padding-block: clamp(1rem, 3vw, 2rem);
}

.landing-page .advantage-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
  padding-block: clamp(2.5rem, 6vw, 4.5rem);
}

.landing-page .advantage-row + .advantage-row {
  border-top: 1px solid var(--apple-line);
}

.landing-page .advantage-row.reversed .advantage-content {
  order: 2;
}

.landing-page .advantage-number {
  display: block;
  margin-bottom: 0.875rem;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
  color: var(--apple-muted);
}

.landing-page .advantage-title {
  margin: 0 0 0.75rem;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--apple-ink);
  text-wrap: balance;
}

.landing-page .advantage-desc {
  margin: 0 0 1.5rem;
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: 1.65;
  color: var(--apple-ink-secondary);
}

.landing-page .advantage-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.landing-page .advantage-list li {
  position: relative;
  padding-left: 1.125rem;
  font-size: 14px;
  line-height: 1.6;
  color: var(--apple-ink-secondary);
}

.landing-page .advantage-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--apple-muted);
}

.landing-page .visual-placeholder {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  border-radius: 1.5rem;
  background: var(--apple-card);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border: 1px solid var(--apple-line);
  box-shadow: var(--apple-shadow-md);
  color: var(--apple-muted);
}

.landing-page .visual-placeholder svg {
  width: min(180px, 55%);
  height: auto;
}

/* ---------- CTA ---------- */
.landing-page .cta-section {
  padding-block: clamp(3.5rem, 9vw, 6.5rem);
}

.landing-page .cta-box {
  text-align: center;
  padding: clamp(3rem, 7vw, 5rem) clamp(1.5rem, 5vw, 3rem);
  border-radius: 1.75rem;
  background: var(--apple-card-strong);
  backdrop-filter: saturate(200%) blur(30px);
  -webkit-backdrop-filter: saturate(200%) blur(30px);
  border: 1px solid var(--apple-line);
  box-shadow: var(--apple-shadow-lg);
}

.landing-page .cta-title {
  margin: 0 0 0.625rem;
  border: none;
  padding: 0;
  font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--apple-ink);
  text-wrap: balance;
}

.landing-page .cta-desc {
  margin: 0 0 2rem;
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  line-height: 1.65;
  color: var(--apple-muted);
}

.landing-page .cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

/* ---------- 响应式：平板 ---------- */
@media (max-width: 959px) {
  .landing-page .hero-grid {
    grid-template-columns: 1fr;
  }

  .landing-page .hero-visual {
    max-width: 520px;
  }

  .landing-page .highlights-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-page .advantage-row {
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: start;
  }

  .landing-page .advantage-row.reversed .advantage-content {
    order: 0;
  }
}

/* ---------- 响应式：手机 ---------- */
@media (max-width: 639px) {
  .landing-page .hero {
    padding-block: clamp(2.75rem, 8vh, 4rem) 3rem;
  }

  .landing-page .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .landing-page .btn {
    width: 100%;
  }

  .landing-page .hero-features {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }

  .landing-page .highlights-grid {
    grid-template-columns: 1fr;
  }

  .landing-page .highlight-card {
    padding: 1.5rem;
  }

  .landing-page .window-content {
    padding: 1rem;
  }

  .landing-page .mockup-sidebar {
    width: 52px;
  }

  .landing-page .cta-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ---------- 减少动效偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .landing-page .btn,
  .landing-page .btn-arrow,
  .landing-page .highlight-card {
    transition: none;
  }

  .landing-page .btn:active {
    transform: none;
  }

  .landing-page .btn-primary:hover .btn-arrow {
    transform: none;
  }

  .landing-page .highlight-card:hover {
    transform: none;
  }
}
</style>
