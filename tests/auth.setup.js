import { test as setup, expect } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import path from 'path';

const authFile = path.resolve(__dirname, '../playwright/.auth/user.json');

setup('MFA Setup for Github', async ({ page }) => {
    console.log('--- Starting MFA Setup for GitHub ---');

    // Step 1 : Go to Github Login Page
    console.log('Navigating to GitHub login page...');
    await page.goto('https://github.com/login');

    // Step 2: Fill login form
    console.log(`Attempting login for: ${process.env.EMAIL}`);
    await page.getByRole('textbox', { name: 'Username or email address' }).fill(process.env.EMAIL, { delay: 50 });
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PASSWORD, { delay: 50 });

    console.log('Clicking sign-in...');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }).catch(() => {
            console.log('Navigation timeout or already navigated.');
        }),
        page.locator('input[type="submit"]').click()
    ]);

    console.log('Current URL after click:', page.url());

    // Wait a bit for any dynamic error messages
    await page.waitForTimeout(2000);

    // Check for login errors in body text or specific selectors
    const bodyText = await page.innerText('body');
    if (bodyText.includes('Incorrect username or password') || bodyText.includes('There have been several failed attempts')) {
        console.error('Login failed based on body text.');
        throw new Error('Incorrect credentials or blocked attempt');
    }

    // Check if we are on the MFA page
    // GitHub MFA URLs: /sessions/two-factor/totp or similar
    if (page.url().includes('two-factor')) {
        console.log('MFA page detected. Generating TOTP...');

        const totp = new OTPAuth.TOTP({
            secret: process.env.MFA.replace(/\s/g, ''),
            digits: 6,
            period: 30,
        });

        const code = totp.generate();
        console.log('Generated MFA Code:', code);

        // GitHub MFA input for app/totp
        const otpInput = page.locator('input#app_totp, input[name="otp"], input#otp').first();
        await otpInput.waitFor({ state: 'visible', timeout: 15000 });
        await otpInput.fill(code, { delay: 50 });

        console.log('OTP filled, waiting for redirect...');
        await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => { });
    }

    console.log('Final URL:', page.url());

    // Verify successful login by checking for the avatar or home link
    const avatar = page.locator('header img.avatar, .AppHeader-user img.avatar').first();
    const isLoggedIn = await avatar.isVisible().catch(() => false);

    if (isLoggedIn) {
        console.log('SUCCESS: Logged in.');
    } else {
        console.log('Status: Not visibly logged in. Checking URL...');
        if (page.url() === 'https://github.com/') {
            console.log('URL is root, might be logged in but avatar is hidden in mobile view?');
        } else {
            console.log('Page Title:', await page.title());
            // If we are still on /session or /login, it failed.
            if (page.url().includes('/session') || page.url().includes('/login')) {
                throw new Error(`Login failed. Still on: ${page.url()}`);
            }
        }
    }

    // Save session
    console.log('Saving session to:', authFile);
    await page.context().storageState({ path: authFile });
    console.log('--- Setup Complete ---');
});