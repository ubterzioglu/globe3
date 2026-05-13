import { test, expect } from '@playwright/test';

test.describe('Admin Access Control', () => {
  test('redirects or blocks unauthenticated access to admin', async ({ page }) => {
    await page.goto('/admin/pins');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const isAdminPage = currentUrl.includes('/admin/pins');
    const hasForbiddenMessage = await page.locator('text=/yetki|forbidden|login|giriş/i').count() > 0;

    if (isAdminPage) {
      expect(hasForbiddenMessage || !isAdminPage).toBeTruthy();
    }
  });
});
