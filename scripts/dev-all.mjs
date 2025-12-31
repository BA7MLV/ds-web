import { spawn } from 'node:child_process'

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const env = { ...process.env }

const run = (args, name) => {
  const child = spawn(npmCmd, args, {
    stdio: 'inherit',
    env,
  })

  child.on('close', (code, signal) => {
    if (shutdown.initiated) return
    shutdown.initiated = true
    shutdown.children.forEach((proc) => {
      if (!proc.killed) proc.kill('SIGTERM')
    })
    const exitCode = code ?? (signal ? 1 : 0)
    process.exit(exitCode)
  })

  child.on('error', (error) => {
    if (shutdown.initiated) return
    shutdown.initiated = true
    console.error(`[dev:all] ${name} failed to start:`, error)
    shutdown.children.forEach((proc) => {
      if (!proc.killed) proc.kill('SIGTERM')
    })
    process.exit(1)
  })

  return child
}

const shutdown = {
  initiated: false,
  children: [],
}

shutdown.children.push(run(['run', 'dev'], 'web'))
shutdown.children.push(run(['run', 'dev', '--workspace', 'docs'], 'docs'))

const handleSignal = (signal) => {
  if (shutdown.initiated) return
  shutdown.initiated = true
  shutdown.children.forEach((proc) => {
    if (!proc.killed) proc.kill(signal)
  })
  process.exit(0)
}

process.on('SIGINT', () => handleSignal('SIGINT'))
process.on('SIGTERM', () => handleSignal('SIGTERM'))
