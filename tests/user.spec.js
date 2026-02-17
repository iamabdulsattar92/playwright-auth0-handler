import { test, expect } from '@playwright/test';


test.use({ storageState: 'playwright/.auth/user.json' });

test('user test spec', async ({ page }) => {

    await page.goto('/');

    // GitHub shows avatar button only when logged in
    const avatarButton = page.locator('img.avatar.circle');

    await expect(avatarButton).toBeVisible();
})