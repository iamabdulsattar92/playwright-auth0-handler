# Playwright Auth0 Handler

This project demonstrates how to handle authentication with Auth0-protected applications using Playwright, specifically for GitHub which uses Auth0 for its login flow.

## Features

- **MFA Support**: Handles GitHub's Two-Factor Authentication (2FA/MFA) using TOTP.
- **Storage State**: Saves the authenticated session to a file (`playwright/.auth/user.json`) for reuse in subsequent tests.
- **GitHub Login**: Specifically configured for GitHub's login flow.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm
- Playwright installed (`npx playwright install`)

## Configuration

Create a `.env` file in the root directory with the following credentials:

```env
EMAIL=your-email@example.com
PASSWORD=your-password
MFA=your-mfa-secret
```

- **EMAIL**: Your GitHub email address.
- **PASSWORD**: Your GitHub password.
- **MFA**: Your GitHub TOTP secret key (found in your GitHub Security settings).

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd playwright-auth0-handler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Run the Setup

The setup script will log in to GitHub and save the session state.

```bash
npx playwright test --project=chromium tests/auth.setup.js
```

### Run Tests

Once the setup is complete, you can run your tests. They will automatically use the saved session state.

```bash
npx playwright test --project=chromium
```

### Run in Headed Mode

To watch the browser during execution:

```bash
npx playwright test --project=chromium --headed
```

## Project Structure

- `tests/auth.setup.js`: The script to handle the login flow and save the session state.
- `tests/example.spec.js`: An example test that uses the saved session state.
- `playwright.config.js`: Playwright configuration, including the `storageState` setup.
- `.env.example`: Template for environment variables.

## Troubleshooting

- **Login Failed**: Ensure your `.env` file is correctly configured and the credentials are valid.
- **MFA Issues**: Double-check your TOTP secret key. It should not contain spaces.
- **Storage State**: If the session expires, you may need to re-run the setup script to generate a new `user.json`.