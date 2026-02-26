#!/usr/bin/env node
/**
 * LQIP (Low Quality Image Placeholders) 生成脚本
 * 为 public/img 目录下的图片生成低质量 base64 占位图
 * 输出到 src/data/lqip-map.json
 */

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_IMG_DIR = join(__dirname, '../public/img')
const OUTPUT_FILE = join(__dirname, '../src/data/lqip-map.json')

// 简单的纯色占位图映射（可按需扩展为真实 LQIP）
const COLOR_MAP = {
  '主页面.png': '#f5f5f7',
  '移动端主页面.png': '#1a1a1f',
  'anki-制卡1.png': '#fef3c7',
  'anki-制卡2.png': '#fef3c7',
  'anki-制卡3.png': '#fef3c7',
  'anki-发送.png': '#dbeafe',
  'pdf阅读-1.png': '#fef3c7',
  'pdf阅读-2.png': '#fef3c7',
  'pdf阅读-3.png': '#fef3c7',
  'mcp-1.png': '#dbeafe',
  'mcp-2.png': '#dbeafe',
  'mcp-3.png': '#dbeafe',
  'mcp-4.png': '#dbeafe',
  'docx阅读-1.png': '#f3f4f6',
  '作文-1.png': '#fef3c7',
  '作文-2.png': '#fef3c7',
  '作文批改-1.png': '#fef3c7',
}

/**
 * 生成纯色 SVG base64 作为占位图
 */
function generatePlaceholderBase64(filename) {
  const color = COLOR_MAP[filename] || '#f5f5f7'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="${color}" width="1" height="1"/></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/**
 * 扫描目录生成 LQIP 映射
 */
async function generateLQIPMap() {
  const lqipMap = {}
  
  try {
    // 确保输出目录存在
    await mkdir(dirname(OUTPUT_FILE), { recursive: true })
    
    // 递归扫描 public/img 目录
    async function scanDir(dir, basePath = '/img') {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        const webPath = `${basePath}/${entry.name}`
        
        if (entry.isDirectory()) {
          await scanDir(fullPath, webPath)
        } else if (/\.(png|jpe?g|webp|gif)$/i.test(entry.name)) {
          // 生成占位图 base64
          lqipMap[webPath] = generatePlaceholderBase64(entry.name)
        }
      }
    }
    
    await scanDir(PUBLIC_IMG_DIR)
    
    // 写入 JSON 文件
    await writeFile(
      OUTPUT_FILE,
      JSON.stringify(lqipMap, null, 2),
      'utf-8'
    )
    
    console.log(`✅ LQIP map generated: ${Object.keys(lqipMap).length} images`)
    console.log(`📁 Output: ${OUTPUT_FILE}`)
  } catch (error) {
    console.error('❌ Failed to generate LQIP map:', error.message)
    process.exit(1)
  }
}

generateLQIPMap()
