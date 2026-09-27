import { expect, test } from '@playwright/test';

test('카드 9개(사례 7 + 개인 2), 팀 필터로 흐리게', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.card-wrap')).toHaveCount(9);
  await page.getByRole('button', { name: 'Global' }).click();
  await expect(page.locator('.card-wrap.is-dim')).toHaveCount(6);
  // 클래스만 붙고 등장 효과가 불투명도를 1로 붙잡는 경우를 잡는다(가장 늦게 등장하는 카드까지 확인).
  await expect(page.locator('.card-wrap.is-dim').last()).toHaveCSS('opacity', '0.25');
  await expect(page.locator('.card-wrap:not(.is-dim)').first()).toHaveCSS('opacity', '1');
});

test('모두 보기를 누르고 사례를 열었다가 뒤로 가면 목록이 다시 보인다', async ({ page }) => {
  await page.goto('/about/');
  await page.getByRole('link', { name: 'Kafka', exact: true }).click();
  await expect(page.getByText('Kafka 사용 사례만 밝게 보여 줍니다.')).toBeVisible();
  await page.getByRole('button', { name: '모두 보기' }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await page.getByRole('link', { name: /혜택홈 새 판 서버/ }).click();
  await expect(page.locator('.case-info h1')).toContainText('혜택홈');
  await page.goBack();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator('h1')).toHaveText('PROJECTS');
});

test('목록에서는 GIF를 불러오지 않는다', async ({ page }) => {
  const gifs: string[] = [];
  page.on('request', (r) => {
    if (/\/media\/.+\.gif$/.test(r.url())) gifs.push(r.url());
  });
  await page.goto('/projects/');
  await page.waitForLoadState('networkidle');
  expect(gifs).toEqual([]);
});

test('기술로 거른 주소를 바로 열 수 있다', async ({ page }) => {
  await page.goto('/projects/?stack=Kafka');
  await expect(page.getByText('Kafka 사용 사례만 밝게 보여 줍니다.')).toBeVisible();
  await expect(page.locator('.card-wrap.is-dim').last()).toHaveCSS('opacity', '0.25');
});

test('키보드로 필터 버튼과 카드에 닿는다', async ({ page }) => {
  await page.goto('/projects/');
  const reached: string[] = [];
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    reached.push(await page.evaluate(() => document.activeElement?.className ?? ''));
  }
  expect(reached.some((c) => c.split(' ').includes('filter'))).toBe(true);
  expect(reached.some((c) => c.split(' ').includes('card'))).toBe(true);
});
