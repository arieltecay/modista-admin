import { defineConfig, devices } from '@playwright/test';
import { DEV_SERVER_ORIGIN, DEV_SERVER_PORT, MOCK_API_ORIGIN } from './e2e/support/origins';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: DEV_SERVER_ORIGIN,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${DEV_SERVER_PORT} --strictPort`,
    url: DEV_SERVER_ORIGIN,
    // Never reuse a dev server started by hand: it could point at the real API from .env.
    reuseExistingServer: false,
    env: { VITE_API_URL: MOCK_API_ORIGIN, VITE_FACEBOOK_PIXEL_ID: '' },
  },
});
