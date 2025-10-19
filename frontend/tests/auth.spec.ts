import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL || 'despachante@test.local';
const PASS = process.env.E2E_PASS || 'SenhaForte123!';

test('login com credenciais incorretas mostra erro', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'wrong@test.local');
  await page.fill('input[name="password"]', 'wrong');
  await page.click('button[type="submit"]');
  await expect(page.getByText(/inválid|erro/i)).toBeVisible();
});

test('login com credenciais corretas redireciona', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|admin/);
  await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 15000 });
});
