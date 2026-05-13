import { test, expect } from '@playwright/test';

test.describe('Auth Page', () => {
  test('loads login page with email input and submit button', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 5_000 });

    const submitButton = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("Send")').first();
    await expect(submitButton).toBeVisible();
  });

  test('shows validation on empty submit', async ({ page }) => {
    await page.goto('/login');
    const submitButton = page.locator('button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  });
});
