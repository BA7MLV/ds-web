# 51.la 统计代码双站点配置实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 React 主站和 VitePress 文档站同时配置 51.la 统计代码，使用统一的环境变量管理

**Architecture:** 
- 使用 `VITE_LA_51_ID` 环境变量存储 51.la Site ID
- React 主站通过组件动态加载 SDK
- VitePress 文档站通过 head 配置注入脚本
- 两个站点共享同一个 Site ID，数据统一统计

**Tech Stack:** Vite, React, VitePress, 51.la Analytics SDK

---

## 前置准备

**检查清单:**
- [ ] 已有 51.la 账号和 Site ID（格式如：Kj7xxxxxxxx）
- [ ] 确认项目结构（React 主站 + docs/ VitePress）

---

## Task 1: 创建环境变量文件

**Files:**
- Create: `.env`
- Create: `.env.example`
- Modify: `.gitignore`（确保 .env.local 不被提交）

**Step 1: 创建 .env 文件**

```bash
# .env
# 51.la 统计配置（开发环境）
VITE_LA_51_ID=your_51la_site_id_here
```

**Step 2: 创建 .env.example 文件**

```bash
# .env.example
# 51.la 统计配置
# 从 https://v6.51.la/user/application 获取你的 Site ID
VITE_LA_51_ID=
```

**Step 3: 检查 .gitignore**

确保以下内容已存在：
```
.env.local
.env.*.local
```

**Step 4: Commit**

```bash
git add .env .env.example
git commit -m "chore: add 51.la analytics environment variables"
```

---

## Task 2: React 主站 - 创建 Analytics 组件

**Files:**
- Create: `src/components/Analytics51la.jsx`
- Modify: `src/App.jsx`（引入组件）

**Step 1: 创建 Analytics51la 组件**

```jsx
// src/components/Analytics51la.jsx
import { useEffect } from 'react'

const LA_51_ID = import.meta.env.VITE_LA_51_ID

export const Analytics51la = () => {
  useEffect(() => {
    // 只在生产环境或有配置时加载
    if (!LA_51_ID || LA_51_ID === 'undefined' || typeof window === 'undefined') {
      return
    }

    // 避免重复加载
    if (window.LA_COLLECT) return

    // 初始化 LA_COLLECT
    window.LA_COLLECT = window.LA_COLLECT || function() {
      (window.LA_COLLECT.q = window.LA_COLLECT.q || []).push(arguments)
    }
    window.LA_COLLECT.l = true

    // 加载 SDK 脚本
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.crossOrigin = 'anonymous'
    script.async = true
    script.src = 'https://sdk.51.la/js-sdk-pro.min.js'
    
    script.onload = () => {
      // 初始化
      window.LA_COLLECT('init', LA_51_ID)
      console.log('[Analytics] 51.la initialized for main site')
    }

    script.onerror = () => {
      console.warn('[Analytics] Failed to load 51.la SDK')
    }

    document.head.appendChild(script)

    return () => {
      // SPA 中通常不需要卸载，保留统计数据
    }
  }, [])

  return null
}

export default Analytics51la
```

**Step 2: 在 App.jsx 中引入**

在 `src/App.jsx` 顶部附近添加：

```jsx
import { Analytics51la } from './components/Analytics51la'
```

在 JSX 中（通常在 `<ThemeProvider>` 或最外层组件内）：

```jsx
function App() {
  return (
    <>
      <Analytics51la />
      {/* 其他组件 */}
    </>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/Analytics51la.jsx src/App.jsx
git commit -m "feat: add 51.la analytics to React main site"
```

---

## Task 3: VitePress 文档站 - 配置 51.la

**Files:**
- Create: `docs/.vitepress/theme/Analytics51la.vue`
- Modify: `docs/.vitepress/theme/Layout.vue`（引入组件）
- Modify: `docs/.vitepress/config.js`（head 配置作为备选）

**Step 1: 创建 Vue 组件**

```vue
<!-- docs/.vitepress/theme/Analytics51la.vue -->
<script setup>
import { onMounted } from 'vue'

const LA_51_ID = import.meta.env.VITE_LA_51_ID

onMounted(() => {
  if (!LA_51_ID || LA_51_ID === 'undefined' || typeof window === 'undefined') {
    return
  }

  if (window.LA_COLLECT) return

  window.LA_COLLECT = window.LA_COLLECT || function() {
    (window.LA_COLLECT.q = window.LA_COLLECT.q || []).push(arguments)
  }
  window.LA_COLLECT.l = true

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.crossOrigin = 'anonymous'
  script.async = true
  script.src = 'https://sdk.51.la/js-sdk-pro.min.js'
  
  script.onload = () => {
    window.LA_COLLECT('init', LA_51_ID)
    console.log('[Analytics] 51.la initialized for docs site')
  }

  document.head.appendChild(script)
})
</script>

<template>
  <!-- 无渲染内容 -->
</template>
```

**Step 2: 在 Layout.vue 中引入**

读取 `docs/.vitepress/theme/Layout.vue`，添加：

```vue
<script setup>
import Analytics51la from './Analytics51la.vue'
// ... 其他 imports
</script>

<template>
  <Analytics51la />
  <!-- 原有 Layout 内容 -->
</template>
```

**Step 3: 备选方案 - 在 config.js 中配置**

如果 Vue 组件方式有问题，可以直接在 `docs/.vitepress/config.js` 的 `head` 数组中添加：

```javascript
// docs/.vitepress/config.js
export default defineConfig({
  // ... 其他配置
  head: [
    // ... 其他 head 元素
    ['script', {}, `
      (function() {
        var LA_51_ID = '${process.env.VITE_LA_51_ID || ''}';
        if (!LA_51_ID) return;
        
        window.LA_COLLECT = window.LA_COLLECT || function() {
          (window.LA_COLLECT.q = window.LA_COLLECT.q || []).push(arguments)
        };
        window.LA_COLLECT.l = true;
        
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.crossOrigin = 'anonymous';
        script.src = 'https://sdk.51.la/js-sdk-pro.min.js';
        script.onload = function() {
          window.LA_COLLECT('init', LA_51_ID);
        };
        document.head.appendChild(script);
      })();
    `]
  ],
  // ...
})
```

**Step 4: Commit**

```bash
git add docs/.vitepress/theme/Analytics51la.vue docs/.vitepress/theme/Layout.vue
git commit -m "feat: add 51.la analytics to VitePress docs site"
```

---

## Task 4: 配置 Vercel 生产环境变量

**Files:**
- 无（在 Vercel Dashboard 配置）

**Step 1: 在 Vercel Dashboard 设置环境变量**

1. 登录 Vercel Dashboard
2. 选择 ds-web 项目
3. 进入 Settings → Environment Variables
4. 添加变量：
   - Name: `VITE_LA_51_ID`
   - Value: `你的 51.la Site ID`
   - Environment: Production, Preview, Development

**Step 2: 重新部署**

在 Vercel 中重新部署项目以应用环境变量。

---

## Task 5: 本地测试

**Files:**
- 修改 `.env.local` 添加测试 ID

**Step 1: 配置本地环境变量**

```bash
# .env.local
VITE_LA_51_ID=your_test_site_id
```

**Step 2: 启动开发服务器测试**

```bash
# 测试 React 主站
npm run dev

# 测试文档站
npm run dev:docs
```

**Step 3: 验证加载**

打开浏览器开发者工具，检查：
1. Network 面板 → 是否有 `js-sdk-pro.min.js` 请求
2. Console 面板 → 是否有 `[Analytics] 51.la initialized` 日志
3. Elements 面板 → head 中是否有 51.la 脚本

**Step 4: Commit（可选）**

`.env.local` 通常不提交，但可以作为示例：

```bash
git add .env.local
git commit -m "chore: add local 51.la config for testing"
```

---

## Task 6: 文档更新

**Files:**
- Create: `docs/guide/analytics-setup.md`（可选）

**Step 1: 创建配置文档**

```markdown
# 网站统计配置

本项目使用 51.la 进行网站访问数据统计。

## 环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `VITE_LA_51_ID` | 51.la Site ID | [51.la 控制台](https://v6.51.la/user/application) |

## 配置方法

### 本地开发

创建 `.env.local` 文件：

```bash
VITE_LA_51_ID=your_site_id
```

### 生产部署（Vercel）

在 Vercel Dashboard → Settings → Environment Variables 中添加。

## 统计范围

- **主站** (deepstudent.cn): React SPA 应用
- **文档站** (deepstudent.cn/docs): VitePress 静态站点

两个站点共用同一个 Site ID，数据统一统计。
```

**Step 2: Commit**

```bash
git add docs/guide/analytics-setup.md
git commit -m "docs: add 51.la analytics configuration guide"
```

---

## 验证清单

- [ ] 环境变量文件已创建
- [ ] React 组件已创建并在 App.jsx 中引用
- [ ] VitePress 组件已创建并在 Layout.vue 中引用
- [ ] 本地开发服务器测试通过
- [ ] Vercel 环境变量已配置
- [ ] 生产环境部署后验证统计生效

---

## 故障排查

### 问题：脚本未加载

**检查项：**
1. 环境变量是否正确设置
2. 浏览器 Console 是否有错误
3. Network 面板是否有 `js-sdk-pro.min.js` 请求

### 问题：数据未上报

**检查项：**
1. 51.la Site ID 是否正确
2. 浏览器是否有广告拦截插件（可能拦截统计脚本）
3. 51.la 控制台是否有数据接收

### 问题：两个站点数据未合并

**检查项：**
1. 两个站点是否使用相同的 Site ID
2. 51.la 控制台是否正确配置了域名白名单
