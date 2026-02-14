<template>
  <div class="landing-page">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="container">
        <div class="hero-grid">
          <!-- 左侧内容 -->
          <div class="hero-content">
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
              <a href="./guide/download.html" class="btn btn-primary">立即下载</a>
              <a href="./guide/index.html" class="btn btn-secondary">了解更多</a>
            </div>
            
            <!-- 核心特性列表 -->
            <div class="hero-features">
              <div class="feature-item">
                <span class="feature-dot"></span>
                <span>AI 驱动的智能错题分析</span>
              </div>
              <div class="feature-item">
                <span class="feature-dot"></span>
                <span>一键生成 ANKI 记忆卡片</span>
              </div>
              <div class="feature-item">
                <span class="feature-dot"></span>
                <span>RAG 增强的知识库追问</span>
              </div>
              <div class="feature-item">
                <span class="feature-dot"></span>
                <span>本地数据，隐私安全</span>
              </div>
            </div>
          </div>
          
          <!-- 右侧产品展示 -->
          <div class="hero-visual">
            <div class="app-showcase">
              <div class="app-window">
                <div class="window-header">
                  <div class="window-dots">
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
              <div class="glow-effect"></div>
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
              <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
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
