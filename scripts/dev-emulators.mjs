// Starts `next dev` with the settings from .env.emulators, so the site talks to the
// local Firebase emulators instead of a real project. Run `npm run emulators` first.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const env = { ...process.env }
for (const line of readFileSync(new URL('../.env.emulators', import.meta.url), 'utf8').split('\n')) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (match) env[match[1]] = match[2]
}

const next = spawn('npx', ['next', 'dev', '-p', '3100'], { stdio: 'inherit', env, shell: process.platform === 'win32' })
next.on('exit', (code) => process.exit(code ?? 0))
