#!/usr/bin/env node
/**
 * 响应式图片生成脚本
 * 自动为 public/img/example 目录下的原始图片生成多尺寸版本
 * 
 * 使用方式：
 *   npm run optimize-images              # 处理所有缺失尺寸的图片
 *   npm run optimize-images -- --force   # 强制重新生成所有尺寸
 *   npm run optimize-images -- 软件主页图.png  # 只处理指定图片
 */

import { readdir, stat, access } from 'node:fs/promises'
import { join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const EXAMPLE_DIR = join(__dirname, '../public/img/example')

// 响应式尺寸配置
const SIZES = [640, 960, 1280, 1600]

/**
 * 检查文件是否存在
 */
async function fileExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * 使用 sips 生成指定尺寸的图片
 */
function generateSize(inputPath, outputPath, size) {
  try {
    execSync(`sips -Z ${size} "${inputPath}" --out "${outputPath}"`, {
      stdio: ['ignore', 'ignore', 'pipe']
    })
    return true
  } catch (error) {
    console.error(`  ❌ Failed to generate ${size}px:`, error.message)
    return false
  }
}

/**
 * 使用 sharp-cli 生成 WebP
 */
function generateWebP(inputPath, outputPath) {
  try {
    execSync(`sharp -i "${inputPath}" -o "${outputPath}"`, {
      stdio: ['ignore', 'ignore', 'pipe']
    })
    return true
  } catch (error) {
    console.error(`  ❌ Failed to generate WebP:`, error.message)
    return false
  }
}

/**
 * 处理单张图片
 */
async function processImage(filename, force = false) {
  const ext = extname(filename)
  const baseName = basename(filename, ext)
  const inputPath = join(EXAMPLE_DIR, filename)
  
  // 只处理 PNG 和 JPEG 原始图片
  if (!['.png', '.jpg', '.jpeg'].includes(ext.toLowerCase())) {
    return { processed: false, reason: 'unsupported format' }
  }
  
  // 跳过已经是尺寸版本的图片（如 xxx-960.png）
  if (/\-\d+\.png$/.test(filename) || /\-\d+\.webp$/.test(filename)) {
    return { processed: false, reason: 'already a sized variant' }
  }
  
  console.log(`🖼️  Processing: ${filename}`)
  let generated = 0
  let skipped = 0
  
  // 生成各尺寸版本
  for (const size of SIZES) {
    const pngPath = join(EXAMPLE_DIR, `${baseName}-${size}.png`)
    const webpPath = join(EXAMPLE_DIR, `${baseName}-${size}.webp`)
    
    // PNG
    if (force || !(await fileExists(pngPath))) {
      if (generateSize(inputPath, pngPath, size)) {
        console.log(`   ✅ ${size}.png`)
        generated++
      }
    } else {
      skipped++
    }
    
    // WebP
    if (force || !(await fileExists(webpPath))) {
      if (generateWebP(pngPath, webpPath)) {
        console.log(`   ✅ ${size}.webp`)
        generated++
      }
    } else {
      skipped++
    }
  }
  
  return { processed: true, generated, skipped }
}

/**
 * 获取文件大小（KB）
 */
async function getFileSizeKB(path) {
  try {
    const stats = await stat(path)
    return (stats.size / 1024).toFixed(1)
  } catch {
    return '?'
  }
}

/**
 * 打印统计信息
 */
async function printStats(filename) {
  const ext = extname(filename)
  const baseName = basename(filename, ext)
  
  console.log(`\n📊 Stats for ${filename}:`)
  
  for (const size of SIZES) {
    const pngPath = join(EXAMPLE_DIR, `${baseName}-${size}.png`)
    const webpPath = join(EXAMPLE_DIR, `${baseName}-${size}.webp`)
    
    const pngSize = await getFileSizeKB(pngPath)
    const webpSize = await getFileSizeKB(webpPath)
    const savings = pngSize !== '?' && webpSize !== '?' 
      ? ((1 - webpSize / pngSize) * 100).toFixed(0) 
      : '?'
    
    console.log(`   ${size}px: PNG ${pngSize}KB → WebP ${webpSize}KB (${savings}% smaller)`)
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const specificFiles = args.filter(arg => !arg.startsWith('--'))
  
  console.log('🚀 Responsive Image Optimizer\n')
  
  let filesToProcess = []
  
  if (specificFiles.length > 0) {
    // 处理指定文件
    filesToProcess = specificFiles
  } else {
    // 扫描目录
    const entries = await readdir(EXAMPLE_DIR)
    filesToProcess = entries.filter(f => !f.includes('-')) // 排除尺寸版本
  }
  
  if (filesToProcess.length === 0) {
    console.log('⚠️  No images found to process')
    return
  }
  
  let totalGenerated = 0
  let totalSkipped = 0
  let processedCount = 0
  
  for (const filename of filesToProcess) {
    const result = await processImage(filename, force)
    if (result.processed) {
      processedCount++
      if (result.generated) totalGenerated += result.generated
      if (result.skipped) totalSkipped += result.skipped
      
      // 打印该图片的统计
      if (result.generated > 0) {
        await printStats(filename)
      }
    }
  }
  
  console.log(`\n✨ Done! Processed ${processedCount} images`)
  console.log(`   Generated: ${totalGenerated} files`)
  console.log(`   Skipped: ${totalSkipped} files (already exist)`)
  
  if (totalSkipped > 0 && !force) {
    console.log(`\n💡 Tip: Use --force to regenerate all sizes`)
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
