import { test, expect } from '@playwright/test'

const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg=='

test('can register a clothes item and see it in the closet', async ({ page }) => {
  const uniqueName = `e2e-${Date.now()}`

  await page.addInitScript(() => {
    class MockOffscreenCanvas {
      constructor(public width: number, public height: number) {}

      getContext() {
        return {
          drawImage() {
            return undefined
          },
        }
      }

      async convertToBlob() {
        return new Blob(['mock-image'], { type: 'image/jpeg' })
      }
    }

    window.OffscreenCanvas = MockOffscreenCanvas as unknown as typeof OffscreenCanvas
    window.createImageBitmap = async () => ({
      width: 100,
      height: 100,
      close() {
        return undefined
      },
    } as ImageBitmap)
  })

  await page.goto('/clothes')
  await page.getByRole('link', { name: '+ 등록' }).click()

  await page.locator('input[type="file"][accept="image/*"]:not([capture])').setInputFiles({
    name: 'tiny.png',
    mimeType: 'image/png',
    buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
  })

  await page.getByPlaceholder('예: 흰색 티셔츠').fill(uniqueName)
  await page.getByRole('button', { name: '상의' }).click()
  await expect(page.getByRole('button', { name: '등록하기' })).toBeEnabled()
  await page.getByRole('button', { name: '등록하기' }).click()

  await expect(page).toHaveURL(/\/clothes$/)
  await expect(page.getByText(uniqueName)).toBeVisible()
})
