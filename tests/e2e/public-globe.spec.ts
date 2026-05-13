import { test, expect } from '@playwright/test';

test.describe('Public Globe', () => {
  test('loads globe page at root route', async ({ page }) => {
    await page.goto('/');
    const container = page.locator('.globe-scene-wrapper');
    await expect(container).toBeVisible({ timeout: 10_000 });
  });

  test('has dark background', async ({ page }) => {
    await page.goto('/');
    const wrapper = page.locator('.globe-scene-wrapper');
    await expect(wrapper).toBeVisible({ timeout: 10_000 });
    const bgColor = await wrapper.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).toBeTruthy();
  });

  test('canvas element is present', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });
  });
});
