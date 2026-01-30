#!/usr/bin/env node

/**
 * 自动黑夜模式 · 快速验证脚本
 * 
 * 用途：验证防闪烁、CSS过渡、日出日落等功能是否正确配置
 * 
 * 使用：node verify-dark-mode.js
 */

import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

console.log('🌙 自动黑夜模式 - 配置验证\n')

const checks = [
  {
    name: '防闪烁脚本',
    test: () => {
      const indexPath = path.join(__dirname, 'index.html')
      const content = fs.readFileSync(indexPath, 'utf-8')
      return content.includes('ds-theme-preference') && 
             content.includes('document.documentElement.classList.add(resolved)')
    },
    hint: '需要在 index.html <head> 中添加防闪烁脚本'
  },
  {
    name: 'CSS过渡配置',
    test: () => {
      const cssPath = path.join(__dirname, 'docs/.vitepress/theme/custom.css')
      const content = fs.readFileSync(cssPath, 'utf-8')
      return content.includes('--theme-transition-duration') &&
             content.includes('prefers-reduced-motion')
    },
    hint: '需要在 custom.css 中定义过渡变量和无动画媒体查询'
  },
  {
    name: '主题切换组件增强',
    test: () => {
      const componentPath = path.join(__dirname, 'src/components/theme-toggle.jsx')
      const content = fs.readFileSync(componentPath, 'utf-8')
      return content.includes('SunsetDetector') &&
             content.includes('initSunsetDetection')
    },
    hint: '需要在 theme-toggle.jsx 中集成日出日落检测'
  },
  {
    name: '日出日落检测模块',
    test: () => {
      const modulePath = path.join(__dirname, 'src/lib/sunset-detection.js')
      return fs.existsSync(modulePath)
    },
    hint: '需要创建 src/lib/sunset-detection.js 模块'
  },
  {
    name: '测试文件',
    test: () => {
      const testPath = path.join(__dirname, 'tests/theme.test.js')
      return fs.existsSync(testPath)
    },
    hint: '需要创建 tests/theme.test.js 测试套件'
  },
  {
    name: '规划文档',
    test: () => {
      const docPath = path.join(__dirname, 'docs/guide/auto-dark-mode-plan.md')
      return fs.existsSync(docPath)
    },
    hint: '需要创建规划文档'
  },
  {
    name: '实现指南',
    test: () => {
      const guidePath = path.join(__dirname, 'docs/guide/auto-dark-mode-guide.md')
      return fs.existsSync(guidePath)
    },
    hint: '需要创建实现指南'
  }
]

let passed = 0
let failed = 0

console.log('开始检查...\n')

for (const check of checks) {
  try {
    const result = check.test()
    if (result) {
      console.log(`✅ ${check.name}`)
      passed++
    } else {
      console.log(`❌ ${check.name}`)
      console.log(`   ${check.hint}\n`)
      failed++
    }
  } catch (error) {
    console.log(`⚠️  ${check.name}`)
    console.log(`   错误: ${error.message}\n`)
    failed++
  }
}

console.log(`\n${'='.repeat(50)}`)
console.log(`检查结果：${passed}/${checks.length} 通过\n`)

if (failed === 0) {
  console.log('🎉 所有检查都通过了！\n')
  console.log('接下来的步骤：')
  console.log('1. npm run dev          # 启动开发服务器')
  console.log('2. F12 打开DevTools     # 验证无闪烁')
  console.log('3. 点击主题切换        # 验证平滑过渡')
  console.log('4. npm test            # 运行测试套件\n')
  process.exit(0)
} else {
  console.log('⚠️  还有 ' + failed + ' 项需要修复\n')
  process.exit(1)
}
