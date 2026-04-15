import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')

describe('GitHub Pages contract', () => {
  it('does not depend on the Vite module entrypoint or external assets', () => {
    expect(html).not.toContain('src="/src/main.js"')
    expect(html).not.toContain('href="/src/')
    expect(html).not.toContain('https://')
    expect(html).toContain('<style>')
  })

  it('keeps the page self-contained for static hosting', () => {
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('This landing page is intentionally self-contained')
    expect(html).toContain('inline HTML and CSS only')
  })
})
