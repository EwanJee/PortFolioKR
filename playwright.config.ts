import { defineConfig } from '@playwright/test';

// Astro 7의 `astro preview`는 백그라운드로 떠서 바로 끝나므로, GitHub Pages처럼 정적 파일만 내주는 서버를 쓴다.
const baseURL = process.env.BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL, channel: 'chrome' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'python3 -m http.server 4321 --directory dist', url: 'http://localhost:4321', reuseExistingServer: false, timeout: 60_000, stderr: 'ignore' },
});
