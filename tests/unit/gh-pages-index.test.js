import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('GitHub Pages index', () => {
  it('contains the project title and app host framing', () => {
    expect(html).toContain('<title>CoolMatter</title>')
    expect(html).toContain('Validated Hydrogen Orbital Viewer')
    expect(html).toContain('rho(x, y, z) = |psi_nlm|^2')
  })

  it('includes an app mount and a Vite module entry without a source import map', () => {
    expect(html).toContain('<div id="app"')
    expect(html).toContain('src="./src/main.js"')
    expect(html).not.toContain('<script type="importmap">')
    expect(html).toContain('GitHub Pages should publish the built')
  })
})
