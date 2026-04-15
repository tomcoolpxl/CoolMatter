import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('GitHub Pages contract', () => {
  it('uses a repository-safe relative module entry for the app', () => {
    expect(html).not.toContain('src="/src/main.js"')
    expect(html).toContain('src="./src/main.js"')
    expect(html).toContain('<div id="app"')
  })

  it('includes an import map so GitHub Pages can resolve three.js modules statically', () => {
    expect(html).toContain('<script type="importmap">')
    expect(html).toContain('"three"')
    expect(html).toContain('cdn.jsdelivr.net')
  })

  it('documents why the app can run on static hosting', () => {
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('GitHub Pages can serve the viewer as a static site')
    expect(html).toContain('hosted under a repository subpath')
  })
})
