<template>
  <div class="custom-home">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="gradient-text">DeepStudent</span>
          </h1>
          <p class="hero-subtitle">AI驱动的错题管理</p>
          <p class="hero-tagline">开源、智能、高效的学习伙伴</p>
          <div class="hero-actions">
            <a href="./guide/download.html" class="btn btn-primary">立即下载</a>
            <a href="./guide/index.html" class="btn btn-secondary">查看文档</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="/deepstudent-head.png" alt="DeepStudent" />
        </div>
      </div>
    </section>

    <!-- 功能特性区域 -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">核心功能</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.title">
            <div class="feature-icon" v-html="feature.icon"></div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta">
      <div class="container">
        <h2 class="cta-title">开始使用 DeepStudent</h2>
        <p class="cta-description">免费开源的AI错题管理解决方案</p>
        <div class="cta-actions">
          <a href="./guide/download.html" class="btn btn-primary btn-large">免费下载</a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const features = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>',
    title: 'AI智能分析',
    description: '深度解析错题，精准定位知识薄弱点'
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
    title: '智能管理',
    description: '自动分类，知识图谱构建'
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><rect x="7" y="8" width="4" height="10" rx="1"></rect><rect x="13" y="8" width="4" height="6" rx="1"></rect></svg>',
    title: '多题对比',
    description: '批量分析，发现共性错误'
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>',
    title: '一键制卡',
    description: 'ANKI格式导出，间隔重复学习'
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    title: 'RAG知识库',
    description: '智能问答，知识追踪'
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    title: '深度追问',
    description: '错题延展，知识点拓展'
  }
]
</script>

<style scoped>
.custom-home {
  --vp-c-brand: #4F9CF3;
  --vp-c-brand-light: #72B9FF;
  --vp-c-bg: #ffffff;
  --vp-c-bg-soft: #f8f9fc;
  --vp-c-text: #213547;
  --vp-c-text-2: #64748b;
}

.dark .custom-home {
  --vp-c-bg: #1a1a1a;
  --vp-c-bg-soft: #252529;
  --vp-c-text: #ffffff;
  --vp-c-text-2: #a3a3a3;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero 区域 */
.hero {
  padding: 120px 0 80px;
  background: linear-gradient(180deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.hero-title {
  font-size: 72px;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(120deg, var(--vp-c-brand) 20%, var(--vp-c-brand-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 36px;
  font-weight: 600;
  margin: 16px 0 8px;
  color: var(--vp-c-text);
}

.hero-tagline {
  font-size: 20px;
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
  line-height: 1.6;
}

.hero-image img {
  width: 100%;
  max-width: 480px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 14px 32px;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
}

.btn-primary:hover {
  background: var(--vp-c-brand-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 156, 243, 0.3);
}

.btn-secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text);
  border-color: var(--vp-c-divider);
}

.btn-secondary:hover {
  background: var(--vp-c-bg);
  transform: translateY(-2px);
}

/* 功能特性区域 */
.features {
  padding: 100px 0;
  background: var(--vp-c-bg);
}

.section-title {
  font-size: 40px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 64px;
  color: var(--vp-c-text);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.feature-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 32px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--vp-c-brand);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.feature-icon svg {
  color: var(--vp-c-brand);
  width: 24px;
  height: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--vp-c-text);
}

.feature-description {
  font-size: 16px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* CTA 区域 */
.cta {
  padding: 100px 0;
  background: linear-gradient(180deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 100%);
  text-align: center;
}

.cta-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--vp-c-text);
}

.cta-description {
  font-size: 20px;
  color: var(--vp-c-text-2);
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  justify-content: center;
}

.btn-large {
  font-size: 18px;
  padding: 18px 48px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero {
    padding: 80px 0 60px;
  }

  .hero .container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .hero-title {
    font-size: 48px;
  }

  .hero-subtitle {
    font-size: 28px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .features {
    padding: 60px 0;
  }

  .section-title {
    font-size: 32px;
    margin-bottom: 40px;
  }

  .cta {
    padding: 60px 0;
  }

  .cta-title {
    font-size: 36px;
  }
}
</style>
