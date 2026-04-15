import { expect, test } from '@playwright/test'

test('loads the app shell and interactive controls', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('CoolMatter')
  await expect(page.locator('#app')).toBeVisible()
  await expect(page.locator('.control-panel')).toBeVisible()
  await expect(page.locator('.viewer-pane')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()

  await expect(page.getByRole('heading', { name: 'Orbital mix' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Time and playback' })).toBeVisible()
  await expect(page.locator('.preset-card').filter({ hasText: '1s Ground' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play motion' })).toBeVisible()
  await expect(page.locator('.viewer-hint')).toContainText('Drag to orbit, right-drag or WASD to pan, and scroll to zoom.')

  await page.locator('.preset-card').filter({ hasText: '1s + 2s Mix' }).first().click()
  await expect(page.locator('.mix-summary')).toContainText('1s + 2s')
  await expect(page.locator('.viewer-status-title')).toContainText('1s + 2s')

  await page.getByRole('button', { name: 'Add 2s' }).click()
  await expect(page.locator('.component-list')).toContainText('2s')

  await page.locator('#point-size-input').evaluate((input) => {
    input.value = '0.12'
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await expect(page.locator('#point-size-input')).toHaveValue('0.12')

  await page.getByRole('button', { name: 'Volumetric' }).click()
  await expect(page.locator('.viewer-status-meta')).toContainText('Volumetric')

  await page.getByText('Advanced diagnostics and reproducibility').click()
  await page.getByLabel('Sample count').fill('20000')
  await expect(page.getByLabel('Sample count')).toHaveValue('20000')
  await expect(page.locator('.diagnostics')).toContainText('Diagnostics')

  await page.getByRole('button', { name: 'Play motion' }).click()
  await page.locator('canvas').click({ position: { x: 24, y: 24 } })
  await page.keyboard.press('KeyW')

  await page.getByRole('button', { name: 'Reset camera' }).click()
})
