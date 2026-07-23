import { test, expect } from '@playwright/test';

// Smoke test: confirms the storefront home page loads. Extend with the full
// purchase journey (add to cart -> checkout -> order confirmation) once
// selectors/data-testids are added to those components.
test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});
