import { expect, test } from '@playwright/test';

test('메뉴 문서를 누르기 전에 받으며 이동한 본문과 목록에 등장 대기가 없다', async ({ page }) => {
  await page.goto('/');
  // 브라우저의 미리 받기가 실제 완료됐는지 확인한다. 속성만 검사하지 않는다.
  await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((entry) => new URL(entry.name).pathname === '/career/'))).toBe(true);
  await page.getByRole('link', { name: 'Career', exact: true }).click();
  await expect(page).toHaveURL(/\/career\/$/);
  await expect(page.locator('.tl-row').first()).toBeVisible();
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  expect(await page.locator('.tl-row').evaluateAll((rows) => rows.map((row) => getComputedStyle(row).animationName))).not.toContain('rise');
  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator('.card-wrap').first()).toBeVisible();
  await expect(page.locator('main')).toHaveCSS('opacity', '1');
  expect(await page.locator('.card-wrap').evaluateAll((cards) => cards.map((card) => getComputedStyle(card).animationName))).not.toContain('rise');
  await page.goBack();
  await expect(page).toHaveURL(/\/career\/$/);
  await expect(page.locator('.tl-row').first()).toHaveCSS('opacity', '1');
});

test('화면 전환 효과 API가 없어도 문서를 다시 열지 않고 메뉴와 뒤로 가기가 동작한다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'startViewTransition', { value: undefined });
  });
  await page.goto('/');
  await page.evaluate(() => { (window as typeof window & { navigationMarker: boolean }).navigationMarker = true; });
  await page.getByRole('link', { name: 'Career', exact: true }).click();
  await expect(page).toHaveURL(/\/career\/$/);
  expect(await page.evaluate(() => (window as typeof window & { navigationMarker?: boolean }).navigationMarker)).toBe(true);
  await expect(page.locator('.tl-row').first()).toHaveCSS('opacity', '1');
  await page.goBack();
  await expect(page.locator('.hero-name')).toBeVisible();
});
