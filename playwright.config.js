const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
        baseURL: 'https://github.com',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.js/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
            dependencies: ['setup'],
        },
        // Add more browsers if needed, e.g., firefox, webkit
    ],
});