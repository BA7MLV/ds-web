<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '../i18n/index.js'

/**
 * 可操作的骨架 Demo。
 * 当前以占位骨架呈现，后续可把每个 view 的骨架替换成真实交互界面。
 * 栏目 id 是结构信息保持固定，label 走 i18n 的 demo.views。
 */
const { t, tm } = useI18n()

const views = computed(() => tm('demo.views'))

const active = ref('chat')

const branches = computed(() => tm('demo.branches'))
const chips = computed(() => tm('demo.chips'))

const select = (id) => {
  active.value = id
}

const onKeydown = (event, index) => {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
  event.preventDefault()
  const step = event.key === 'ArrowRight' ? 1 : -1
  const next = (index + step + views.value.length) % views.value.length
  active.value = views.value[next].id
}
</script>

<template>
  <div class="Demo">
    <div class="Demo__window">
      <!-- 窗口标题栏 -->
      <div class="Demo__chrome">
        <span class="Demo__dot" />
        <span class="Demo__dot" />
        <span class="Demo__dot" />
        <span class="Demo__chrome-title" />
      </div>

      <!-- 移动端：横向切换 -->
      <div class="Demo__tabs" role="tablist" :aria-label="t('demo.tabsLabel')">
        <button
          v-for="(view, index) in views"
          :key="view.id"
          type="button"
          role="tab"
          :aria-selected="active === view.id"
          :class="['Demo__tab', { 'is-active': active === view.id }]"
          @click="select(view.id)"
          @keydown="onKeydown($event, index)"
        >{{ view.label }}</button>
      </div>

      <div class="Demo__body">
        <!-- 侧栏（可点击的骨架导航） -->
        <nav class="Demo__side" :aria-label="t('demo.sideLabel')">
          <span class="ds-sk ds-sk--sm w-16" />
          <button
            v-for="(view, index) in views"
            :key="view.id"
            type="button"
            :class="['Demo__side-item', { 'is-active': active === view.id }]"
            @click="select(view.id)"
            @keydown="onKeydown($event, index)"
          >
            <span class="Demo__side-mark" />
            {{ view.label }}
          </button>
        </nav>

        <!-- 舞台：按视图切换骨架 -->
        <div class="Demo__stage">
          <Transition name="demo-swap" mode="out-in">
            <!-- 智能对话 -->
            <div v-if="active === 'chat'" key="chat" class="Demo__view">
              <div class="Demo__row">
                <span class="ds-sk ds-sk--avatar" />
                <div class="Demo__lines">
                  <span class="ds-sk ds-sk--md w-2/3" />
                  <span class="ds-sk ds-sk--md w-5/12" />
                </div>
              </div>
              <div class="Demo__chips">
                <span v-for="chip in chips" :key="chip" class="Demo__chip">
                  <span class="Demo__chip-dot" />{{ chip }}
                </span>
              </div>
              <div class="Demo__row">
                <span class="ds-sk ds-sk--avatar" />
                <div class="Demo__lines">
                  <span class="ds-sk ds-sk--md w-11/12" />
                  <span class="ds-sk ds-sk--md w-4/5" />
                  <span class="ds-sk ds-sk--md w-1/3" />
                </div>
              </div>
              <div class="Demo__row Demo__row--center">
                <span class="Demo__send Demo__send--sm" />
                <span class="ds-sk ds-sk--sm w-1/4" />
              </div>
              <div class="Demo__input">
                <span class="ds-sk ds-sk--sm w-1/3" />
                <span class="Demo__send" />
              </div>
            </div>

            <!-- 学习资源 -->
            <div v-else-if="active === 'library'" key="library" class="Demo__view">
              <span class="ds-sk ds-sk--lg w-1/4" />
              <div class="Demo__grid">
                <div v-for="n in 6" :key="n" class="Demo__card">
                  <span class="ds-sk ds-sk--block" />
                  <span class="ds-sk ds-sk--sm w-3/4" />
                  <span class="ds-sk ds-sk--sm w-1/2" />
                </div>
              </div>
            </div>

            <!-- 知识导图 -->
            <div v-else-if="active === 'mindmap'" key="mindmap" class="Demo__view">
              <div class="Demo__mind">
                <div class="Demo__mind-root">{{ t('demo.mindRoot') }}</div>
                <div class="Demo__mind-link" aria-hidden="true" />
                <div class="Demo__branches">
                  <div v-for="branch in branches" :key="branch" class="Demo__branch">{{ branch }}</div>
                </div>
              </div>
            </div>

            <!-- 题目练习 -->
            <div v-else-if="active === 'quiz'" key="quiz" class="Demo__view">
              <div class="Demo__progress">
                <span class="Demo__progress-fill" />
              </div>
              <span class="ds-sk ds-sk--lg w-3/5" />
              <span class="ds-sk ds-sk--md w-2/5" />
              <div class="Demo__options">
                <span v-for="n in 4" :key="n" class="Demo__option">
                  <span class="Demo__option-key" />
                  <span class="ds-sk ds-sk--sm" :class="n % 2 ? 'w-2/3' : 'w-1/2'" />
                </span>
              </div>
            </div>

            <!-- Anki 制卡 -->
            <div v-else key="anki" class="Demo__view">
              <div class="Demo__cards">
                <div class="Demo__anki Demo__anki--back">
                  <span class="ds-sk ds-sk--sm w-1/3" />
                  <span class="ds-sk ds-sk--lg w-4/5" />
                  <span class="ds-sk ds-sk--md w-3/5" />
                </div>
                <div class="Demo__anki Demo__anki--front">
                  <span class="ds-sk ds-sk--sm w-1/4" />
                  <span class="ds-sk ds-sk--lg w-3/4" />
                </div>
              </div>
              <div class="Demo__row Demo__row--tight">
                <span class="Demo__send" />
                <span class="ds-sk ds-sk--sm w-1/3" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <p class="Demo__caption">{{ t('demo.caption') }}</p>
  </div>
</template>

<style scoped>
.Demo {
  margin: 0 auto;
  max-width: 980px;
}

.Demo__window {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  background: var(--ds-window-bg);
  border: 1px solid var(--ds-window-ring);
  box-shadow: var(--ds-window-shadow);
}

.Demo__chrome {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ds-window-ring);
}

.Demo__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--ds-sk-fill-strong);
}

.Demo__chrome-title {
  margin: 0 auto;
  width: 120px;
  height: 8px;
  border-radius: 999px;
  background: var(--ds-sk-fill-strong);
}

.Demo__tabs {
  display: flex;
  gap: 6px;
  padding: 12px 14px 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.Demo__tabs::-webkit-scrollbar {
  display: none;
}

.Demo__tab {
  flex: 0 0 auto;
  padding: 7px 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.Demo__tab:hover {
  color: var(--ds-text);
}

.Demo__tab.is-active {
  color: var(--ds-text);
  background: var(--ds-chip-bg);
}

.Demo__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.Demo__side {
  display: none;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 172px;
  padding: 16px 12px;
  border-right: 1px solid var(--ds-window-ring);
}

.Demo__side > .ds-sk {
  margin: 0 8px 10px;
}

.Demo__side-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 12.5px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.Demo__side-item:hover {
  color: var(--ds-text);
}

.Demo__side-item.is-active {
  color: var(--ds-text);
  background: var(--ds-chip-bg);
  font-weight: 600;
}

.Demo__side-mark {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--ds-sk-fill-strong);
  transition: background-color 0.2s ease;
}

.Demo__side-item.is-active .Demo__side-mark {
  background: var(--ds-text);
}

.Demo__stage {
  position: relative;
  flex: 1;
  min-width: 0;
}

.Demo__view {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
}

.Demo__row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.Demo__row--tight {
  align-items: center;
  margin-top: auto;
}

.Demo__row--center {
  align-items: center;
}

.Demo__lines {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  padding-top: 3px;
}

.Demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 34px;
}

.Demo__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid var(--ds-window-ring);
  background: var(--ds-chip-bg);
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 500;
}

.Demo__chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--ds-sk-fill-strong);
}

.Demo__input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding: 10px 12px 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--ds-window-ring);
  background: var(--ds-chip-bg);
}

.Demo__send {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--ds-accent);
}

.Demo__send--sm {
  width: 16px;
  height: 16px;
  opacity: 0.35;
}

.Demo__grid {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  min-height: 0;
}

.Demo__card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid var(--ds-window-ring);
}

.Demo__card .ds-sk--block {
  height: 42px;
  border-radius: 8px;
}

/* 知识导图 */
.Demo__mind {
  display: grid;
  align-items: center;
  flex: 1;
  grid-template-columns: auto 34px minmax(0, 1fr);
  width: 100%;
  max-width: 720px;
  height: 100%;
  margin: 0 auto;
}

.Demo__mind-root,
.Demo__branch {
  display: flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--ds-window-ring);
  background: var(--ds-chip-bg);
  color: var(--vp-c-text-3);
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}

.Demo__mind-root {
  color: var(--ds-text);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.Demo__mind-link {
  position: relative;
  align-self: stretch;
}

.Demo__mind-link::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  height: 1.5px;
  background: var(--ds-line);
}

.Demo__branches {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  justify-content: space-between;
  padding-left: 24px;
}

.Demo__branches::before {
  content: '';
  position: absolute;
  top: 13px;
  bottom: 13px;
  left: 0;
  width: 1.5px;
  background: var(--ds-line);
}

.Demo__branch {
  position: relative;
}

.Demo__branch::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -24px;
  width: 24px;
  height: 1.5px;
  background: var(--ds-line);
}

.Demo__progress {
  height: 3px;
  border-radius: 999px;
  background: var(--ds-sk-fill);
  overflow: hidden;
}

.Demo__progress-fill {
  display: block;
  width: 45%;
  height: 100%;
  border-radius: 999px;
  background: var(--ds-accent);
}

.Demo__options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.Demo__option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--ds-window-ring);
}

.Demo__option-key {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1.5px solid var(--ds-sk-fill-strong);
}

.Demo__cards {
  position: relative;
  flex: 1;
  min-height: 0;
}

.Demo__anki {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--ds-window-ring);
}

.Demo__anki--back {
  top: 12%;
  left: 6%;
  width: 60%;
  height: 62%;
  background: var(--ds-chip-bg);
  transform: rotate(-3deg);
  opacity: 0.7;
}

.Demo__anki--front {
  right: 6%;
  bottom: 8%;
  width: 62%;
  height: 66%;
  background: var(--ds-window-bg);
  box-shadow: 0 10px 30px -14px rgba(0, 0, 0, 0.35);
}

.Demo__caption {
  margin: 14px 0 0;
  text-align: center;
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

/* 视图切换过渡 */
.demo-swap-enter-active,
.demo-swap-leave-active {
  transition: opacity 0.24s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.demo-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.demo-swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .demo-swap-enter-active,
  .demo-swap-leave-active {
    transition: none;
  }
}

@media (min-width: 640px) {
  .Demo__tabs {
    display: none;
  }

  .Demo__side {
    display: flex;
  }

  .Demo__stage {
    min-height: 302px;
  }
}

@media (max-width: 639px) {
  .Demo__stage {
    min-height: 286px;
  }

  .Demo__tabs {
    gap: 4px;
    padding: 10px 12px 0;
  }

  .Demo__tab {
    padding: 6px 9px;
    font-size: 11.5px;
  }

  .Demo__chips {
    padding-left: 0;
  }
}
</style>
