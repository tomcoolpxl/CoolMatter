import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'

let builtHtml = ''

beforeAll(async () => {
  await build({
    root: fileURLToPath(new URL('../../', import.meta.url)),
    configFile: fileURLToPath(new URL('../../vite.config.js', import.meta.url)),
    logLevel: 'silent',
  })

  builtHtml = readFileSync(new URL('../../dist/index.html', import.meta.url), 'utf8')
})

describe('GitHub Pages contract', () => {
  it('builds repo-safe relative asset paths for static hosting', () => {
    expect(builtHtml).toContain('<div id="app"')
    expect(builtHtml).toContain('src="./assets/')
    expect(builtHtml).not.toContain('src="/assets/')
  })

  it('does not ship the source entrypoint path in the built deployment artifact', () => {
    expect(builtHtml).not.toContain('src="./src/main.js"')
    expect(builtHtml).not.toContain('<script type="importmap">')
  })
})
