import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildDownloadsData } from './lib/release-downloads.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../docs/.vitepress/data/downloads.json')
const RELEASE_API_URL = 'https://api.github.com/repos/000haoji/deep-student/releases/latest'

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function writeDownloadsFile(data) {
  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}

async function fetchLatestRelease() {
  const response = await fetch(RELEASE_API_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ds-web-release-sync'
    }
  })

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function syncReleaseDownloads() {
  try {
    const release = await fetchLatestRelease()
    const data = buildDownloadsData(release)
    await writeDownloadsFile(data)
    console.log(`[release-sync] Updated ${OUTPUT_PATH} (${data.version})`)
    return
  } catch (error) {
    const hasCache = await fileExists(OUTPUT_PATH)

    if (hasCache) {
      const cached = JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'))
      console.warn(`[release-sync] Failed to fetch latest release, using cached data (${cached.version || 'unknown'}).`)
      console.warn(`[release-sync] Reason: ${error.message}`)
      return
    }

    const fallbackData = buildDownloadsData({
      tag_name: 'unknown',
      html_url: 'https://github.com/000haoji/deep-student/releases/latest',
      assets: []
    })

    await writeDownloadsFile(fallbackData)
    console.warn('[release-sync] Failed to fetch latest release and no cache found. Wrote fallback data.')
    console.warn(`[release-sync] Reason: ${error.message}`)
  }
}

await syncReleaseDownloads()
