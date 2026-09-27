import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/about/', '/career/', '/projects/', '/troubleshooting/', '/contact/', '/404.html'];

test('첫 화면: 이름, 한 줄 소개, 메뉴 6개, 소셜 4개, 일하는 방식', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('지예환');
  await expect(page.getByText('무신사에서 주문, 클레임, 배송 도메인을 담당합니다.')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a')).toHaveCount(6);
  const social = page.locator('.social a');
  await expect(social).toHaveCount(4);
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('target', '_blank');
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('.hero-work')).toContainText('효율과 기록');
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
