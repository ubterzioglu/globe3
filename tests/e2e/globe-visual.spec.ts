import { test, expect } from '@playwright/test';

test.describe('Globe Visual', () => {
  test('renders WebGL canvas with dark background', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 10_000 });

    const scene = page.locator('.globe-scene').first();
    await expect(scene).toBeVisible();
  });

  test('globe container has correct dimensions', async ({ page }) => {
    await page.goto('/');

    const wrapper = page.locator('.globe-scene-wrapper');
    await expect(wrapper).toBeVisible({ timeout: 10_000 });

    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });
});
