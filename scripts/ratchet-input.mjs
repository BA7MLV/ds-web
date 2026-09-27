#!/usr/bin/env node
/** Normalize the browser benchmark for huashu-flash's ratchet.py. */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const inputLabel = process.argv[2] || 'perf/bench/benchmark-final.json'
const input = resolve(inputLabel)
const output = resolve(process.argv[3] || 'perf/bench/ratchet-result.json')

function percentile(values, fraction) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  const position = (sorted.length - 1) * fraction
  const lower = Math.floor(position)
  const upper = Math.ceil(position)
  return Math.round((sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower)) * 10) / 10
}

function summaryMetric(values) {
  const finite = values.filter(Number.isFinite)
  return { validSamples: finite.length, p50: percentile(finite, 0.5), p75: percentile(finite, 0.75), p95: percentile(finite, 0.95) }
}

const benchmark = JSON.parse(await readFile(input, 'utf8'))
const results = {}
for (const device of ['desktop', 'mobile']) {
  for (const variant of ['baseline', 'optimized']) {
    const runs = benchmark.runs.filter((run) => run.device === device && run.variant === variant)
    const key = `${device}-${variant}`
    results[key] = {
      url: `${device}/${variant}`,
      summary: {
        ready: benchmark.summary?.[device]?.[variant]?.homepageUsableMs,
        lcp: benchmark.summary?.[device]?.[variant]?.lcpMs,
        demo: benchmark.summary?.[device]?.[variant]?.demoDomActionableMs,
        demoAfterIntent: benchmark.summary?.[device]?.[variant]?.demoAfterIntentMs,
        requests: summaryMetric(runs.map((run) => run.resources?.requestedCount)),
        bytes: summaryMetric(runs.map((run) => run.resources?.encodedBodyBytes)),
        blockingLongTasks: summaryMetric(runs.map((run) => run.longTasks?.mainBeforeUsableBlockingMs)),
      },
    }
  }
}

const normalized = {
  generatedAt: benchmark.generatedAt,
  source: inputLabel,
  protocol: benchmark.protocol,
  results,
}
await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(normalized, null, 2)}\n`)
console.log(`Wrote ${output}`)
