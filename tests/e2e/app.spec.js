import { expect, test } from '@playwright/test'

test('loads the app shell and interactive controls', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('CoolMatter')
  await expect(page.locator('#app')).toBeVisible()
  await expect(page.locator('.control-panel')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  
  await expect(page.getByText('Superposition Mixer')).toBeVisible()
  await expect(page.getByText('Playback & Timeline')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  
  await expect(page.getByLabel('Nucleus mode')).toHaveValue('visibleReference')
  await expect(page.getByText('Diagnostics')).toBeVisible()
  await expect(page.getByText('Offline validation required before signoff')).toBeVisible()
  await expect(page.getByText('Drag to orbit, right-drag or WASD to pan, and scroll to zoom.')).toBeVisible()

  // Add a component
  await page.getByLabel('n', { exact: true }).fill('2')
  await page.getByLabel('l', { exact: true }).fill('0')
  await page.getByLabel('m', { exact: true }).fill('0')
  await page.getByRole('button', { name: 'Add Component' }).click()

  await expect(page.locator('.diagnostics')).toContainText('|2,0,0⟩')

  await page.getByLabel('Point size').fill('0.12')
  await expect(page.getByLabel('Point size')).toHaveValue('0.12')
  await page.locator('canvas').click({ position: { x: 24, y: 24 } })
  await page.keyboard.press('KeyW')

  await page.getByRole('button', { name: 'Reset camera' }).click()
})
