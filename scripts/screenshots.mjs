#!/usr/bin/env node
// 모든 페이지를 데스크톱, 모바일, 동작 줄이기 상태로 캡처해 비공개 폴더에 저장한다(검토용, 설계 9장).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.env.PORTFOLIO_PRIVATE_DIR ?? '../portfolio-private', 'screenshots');
mkdirSync(out, { recursive: true });
const base = process.env.BASE_URL ?? 'http://localhost:4321';
const cases = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore', 'api-gateway-transition'];
const routes = ['/', '/about/', '/career/', '/projects/', ...cases.map((slug) => `/projects/${slug}/`), '/troubleshooting/', '/contact/', '/404.html'];
const variants = [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ['reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }],
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, options] of variants) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const file = join(out, `${name}${route.replaceAll('/', '_')}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
  await context.close();
}
await browser.close();
