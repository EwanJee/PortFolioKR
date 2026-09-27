import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/about/', '/career/', '/projects/', '/troubleshooting/', '/contact/', '/404.html'];

test('첫 화면: 이름, 한 줄 소개, 메뉴 6개, 소셜 4개, 일하는 방식', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('지예환');
  await expect(page.getByText('무신사에서 주문, 배송, 클레임 도메인을 담당합니다.')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a')).toHaveCount(6);
  const social = page.locator('.social a');
  await expect(social).toHaveCount(4);
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('target', '_blank');
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('.hero-work')).toContainText('효율과 기록');
});

test('첫 화면은 화면 그리기를 막는 외부 CSS 요청 없이 스타일을 싣는다', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(0);
  expect(await page.locator('style').count()).toBeGreaterThan(0);
});

const bodyFont = (page: import('@playwright/test').Page) => page.evaluate(() => getComputedStyle(document.body).fontFamily);
const PRETENDARD = /^"?Pretendard Variable/;

test('한글 글꼴은 첫 화면을 그리고 페이지를 다 받은 뒤에 받는다', async ({ page }) => {
  await page.goto('/');
  const fontEntries = () => page.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.name.includes('PretendardVariable')).length);
  await expect.poll(fontEntries).toBeGreaterThan(0);
  const t = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? Number.POSITIVE_INFINITY;
    const starts = performance.getEntriesByType('resource').filter((e) => e.name.includes('PretendardVariable')).map((e) => e.startTime);
    return { load: nav.loadEventStart, fcp, first: Math.min(...starts) };
  });
  expect(t.first).toBeGreaterThanOrEqual(t.load);
  expect(t.first).toBeGreaterThan(t.fcp);
  await expect.poll(() => bodyFont(page)).toMatch(PRETENDARD);
});

for (const route of ['/projects/', '/projects/benefit-home/']) {
  test(`${route}: 가장 큰 요소는 한글 글꼴을 받기 전에 그려진 것으로 잡힌다`, async ({ page }) => {
    await page.goto(route);
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('PretendardVariable')))).toBe(true);
    const t = await page.evaluate(
      () =>
        new Promise<{ lcp: number; font: number }>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const font = Math.min(...performance.getEntriesByType('resource').filter((e) => e.name.includes('PretendardVariable')).map((e) => e.startTime));
            resolve({ lcp: entries[entries.length - 1].startTime, font });
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        }),
    );
    expect(t.lcp).toBeLessThan(t.font);
  });
}

test('사이트 안에서 페이지를 옮겨도 한글 글꼴이 그대로다', async ({ page }) => {
  await page.goto('/about/');
  await expect.poll(() => bodyFont(page)).toMatch(PRETENDARD);
  await page.locator('nav[aria-label="주 메뉴"]').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('PROJECTS');
  expect(await bodyFont(page)).toMatch(PRETENDARD);
});

test('한 번 받은 한글 글꼴은 다시 열 때 처음부터 켠다', async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { fontAtDcl: string }).fontAtDcl = getComputedStyle(document.body).fontFamily;
    });
  });
  await page.goto('/');
  await expect.poll(() => bodyFont(page)).toMatch(PRETENDARD);
  await page.reload();
  expect(await page.evaluate(() => (window as unknown as { fontAtDcl: string }).fontAtDcl)).toMatch(PRETENDARD);
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('한글 본문 글꼴은 처음부터 Pretendard다', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('body')).toHaveCSS('font-family', PRETENDARD);
  });
});

test('다른 페이지: 위로 붙은 헤더와 현재 메뉴 표시', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('header.bar')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a[aria-current="page"]')).toHaveText('About');
  await expect(page.locator('h1')).toHaveText('ABOUT');
});

test('키보드: Tab으로 메뉴에 닿고 포커스 표시가 보인다', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const home = page.locator('nav[aria-label="주 메뉴"] a').first();
  await expect(home).toBeFocused();
  expect(await home.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
});

for (const [hash, target] of [['#about', '/about/'], ['#experience', '/career/'], ['#portfolio', '/projects/'], ['#contacts', '/contact/']]) {
  test(`예전 주소 ${hash} → ${target}`, async ({ page }) => {
    await page.goto(`/${hash}`);
    await expect(page).toHaveURL(new RegExp(`${target}$`));
  });
}

test('예전 프레디저 상세 주소는 경력으로 넘어간다', async ({ page }) => {
  await page.goto('/projects/twitteranalysis.html');
  await expect(page).toHaveURL(/\/career\/$/);
});

test('없는 주소는 404 안내를 보여 준다', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.getByText('요청한 페이지가 없습니다.')).toBeVisible();
});

test('모든 주요 주소에서 가로 스크롤이 없다', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});
