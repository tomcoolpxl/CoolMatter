import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('GitHub Pages index', () => {
  it('contains the project title and scientific framing', () => {
    expect(html).toContain('<title>CoolMatter</title>')
    expect(html).toContain('Hydrogen Stationary States')
    expect(html).toContain('rho(x, y, z) = |psi_nlm|^2')
  })

  it('includes a GitHub Pages deployment section', () => {
    expect(html).toContain('GitHub Pages contract')
    expect(html).toContain('serve it directly as a static site')
  })
})
