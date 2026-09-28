// 메뉴 클릭 뒤 문서 준비·교체·화면 전환·등장 효과의 완료 시점을 측정한다.
// 사용: THROTTLE=1 node scripts/measure-navigation.mjs <base URL> <output.json>
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const [base = 'http://localhost:4326', output = '/tmp/portfolio-navigation.json'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    if (process.env.THROTTLE) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await page.addInitScript(() => {
      window.navigationSamples = [];
      const mark = key => {
        if (window.navigationSample) window.navigationSample[key] = Math.round(performance.now() - window.navigationSample.start);
      };
      document.addEventListener('click', event => {
        const a = event.target.closest('nav[aria-label="주 메뉴"] a');
        if (a) {
          window.navigationSample = { path: new URL(a.href).pathname, start: performance.now() };
          window.navigationSamples.push(window.navigationSample);
        }
      }, true);
      for (const name of ['before-preparation','after-preparation','before-swap','after-swap','page-load']) {
        document.addEventListener('astro:' + name, () => {
          mark(name);
          if (name === 'page-load') {
            requestAnimationFrame(() => requestAnimationFrame(() => mark('paint-frame')));
            Promise.allSettled(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished)).then(() => mark('animations-finished'));
          }
        });
      }
      const native = document.startViewTransition?.bind(document);
      if (native) document.startViewTransition = callback => {
        mark('transition-start');
        const transition = native(callback);
        transition.ready.then(() => mark('transition-ready'), () => mark('transition-skipped'));
        transition.finished.then(() => mark('transition-finished'));
        return transition;
      };
    });
    await page.goto(base);
    await page.waitForTimeout(3000);
    for (let round = 1; round <= 2; round++) {
      for (const route of ['/about/','/career/','/projects/','/troubleshooting/','/contact/','/']) {
        const link = page.locator(`nav[aria-label="주 메뉴"] a[href="${route}"]`);
        if (mobile) await link.tap(); else await link.click();
        await page.waitForFunction(() => window.navigationSample?.['page-load'] !== undefined, null, { timeout: 15000 });
        await page.waitForTimeout(1800);
        const sample = await page.evaluate(() => {
          const sample = window.navigationSample;
          const resources = performance.getEntriesByType('resource').filter(r => r.startTime >= sample.start);
          return { ...sample, requests: resources.map(r => ({ path: new URL(r.name).pathname, ms: Math.round(r.duration), bytes: r.transferSize, type: r.initiatorType })) };
        });
        results.push({ mobile, round, ...sample });
        console.log(JSON.stringify({ mobile, round, ...sample, requests: sample.requests.filter(r => r.type === 'fetch') }));
      }
    }
    await context.close();
  }
  await writeFile(output, JSON.stringify(results, null, 2));
} finally { await browser.close(); }
