import { expect, test } from '@playwright/test'

test('loads the app shell and interactive controls', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('CoolMatter')
  await expect(page.locator('#app')).toBeVisible()
  await expect(page.locator('.control-panel')).toBeVisible()
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByLabel('State')).toHaveValue('1s')
  await expect(page.getByLabel('Nucleus mode')).toHaveValue('visibleReference')
  await expect(page.getByText('Diagnostics')).toBeVisible()
  await expect(page.getByText('Offline validation required before signoff')).toBeVisible()
  await expect(page.getByText('Drag to orbit, right-drag or WASD to pan, and scroll to zoom.')).toBeVisible()

  await page.getByLabel('State').selectOption('2s')
  await expect(page.getByLabel('State')).toHaveValue('2s')
  await expect(page.locator('.diagnostics')).toContainText('2s')

  await page.getByLabel('Point size').fill('0.12')
  await expect(page.getByLabel('Point size')).toHaveValue('0.12')
  await page.locator('canvas').click({ position: { x: 24, y: 24 } })
  await page.keyboard.press('KeyW')

  await page.getByRole('button', { name: 'Reset camera' }).click()
})
