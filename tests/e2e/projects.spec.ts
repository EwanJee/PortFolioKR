import { expect, test } from '@playwright/test';

test('카드 9개(사례 7 + 개인 2), 팀 필터로 흐리게', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.card-wrap')).toHaveCount(9);
  await page.getByRole('button', { name: 'Global' }).click();
  await expect(page.locator('.card-wrap.is-dim')).toHaveCount(6);
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
