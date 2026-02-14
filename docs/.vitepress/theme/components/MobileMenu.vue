<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const isOpen = ref(false)
const route = useRoute()

// 点击菜单项后关闭菜单
watch(() => route.path, () => {
  isOpen.value = false
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const navItems = [
  { text: '指南', link: '/' },
  { text: '官网', link: '/../', external: true }
]
</script>

<template>
  <div class="mobile-menu-wrapper">
    <!-- 汉堡菜单按钮 -->
    <button 
      class="hamburger-btn"
      :class="{ 'is-open': isOpen }"
      @click="toggleMenu"
      aria-label="切换导航菜单"
      aria-expanded="isOpen"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- 移动端菜单面板 -->
    <Transition name="slide">
      <div v-show="isOpen" class="mobile-menu-panel">
        <div class="mobile-menu-backdrop" @click="toggleMenu"></div>
        <div class="mobile-menu-content">
          <nav class="mobile-nav">
            <a 
              v-for="item in navItems" 
              :key="item.text"
              :href="item.link"
              :target="item.external ? '_self' : undefined"
              class="mobile-nav-link"
              @click="!item.external && toggleMenu()"
            >
              {{ item.text }}
            </a>
          </nav>
          
          <div class="mobile-menu-footer">
            <a 
              href="https://github.com/000haoji/deep-student" 
              target="_blank" 
              rel="noopener noreferrer"
              class="github-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="github-icon">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mobile-menu-wrapper {
  display: none;
}

/* 只在移动端显示 */
@media (max-width: 768px) {
  .mobile-menu-wrapper {
    display: block;
  }
}

/* 汉堡菜单按钮 */
.hamburger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  padding: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  gap: 5px;
  z-index: 100;
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background-color: var(--vp-c-text-1);
  border-radius: 1px;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* 打开状态的动画 */
.hamburger-btn.is-open .hamburger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger-btn.is-open .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.hamburger-btn.is-open .hamburger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* 菜单面板 */
.mobile-menu-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.mobile-menu-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  /* 移除 backdrop-filter: blur(4px) - 移动端性能杀手，改用更深背景色 */
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background: var(--vp-c-bg);
  padding-top: calc(env(safe-area-inset-top) + 64px);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: 24px;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
}

.dark .mobile-menu-content {
  background: var(--vp-c-bg);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
}

/* 导航链接 */
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.mobile-nav-link:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

/* 底部 GitHub 链接 */
.mobile-menu-footer {
  padding-top: 16px;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: auto;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.github-link:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.github-icon {
  width: 20px;
  height: 20px;
}

/* 滑入动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-active .mobile-menu-backdrop,
.slide-leave-active .mobile-menu-backdrop {
  transition: opacity 0.3s ease;
}

.slide-enter-active .mobile-menu-content,
.slide-leave-active .mobile-menu-content {
  transition: transform 0.3s ease;
}

.slide-enter-from .mobile-menu-backdrop,
.slide-leave-to .mobile-menu-backdrop {
  opacity: 0;
}

.slide-enter-from .mobile-menu-content,
.slide-leave-to .mobile-menu-content {
  transform: translateX(100%);
}
</style>
