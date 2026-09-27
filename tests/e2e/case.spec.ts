import { expect, test } from '@playwright/test';

const CASES = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore'];

for (const slug of CASES) {
  test(`${slug}: 끝의 / 없이 바로 열어도 제목, 상태, 미디어가 보인다`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}/$`));
    await expect(page.locator('.case-info h1')).toBeVisible();
    await expect(page.locator('.case-team .status')).toBeVisible();
    await expect(page.locator('.case-media img, .case-media svg').first()).toBeVisible();
    expect(await page.locator('.case-cells li').count()).toBeLessThanOrEqual(3);
  });
}

test('혜택홈: GIF를 재생하고 공개 주소를 새 탭으로 연다', async ({ page }) => {
  const gif = page.waitForRequest(/\/media\/benefit-home\.gif$/);
  await page.goto('/projects/benefit-home/');
  await gif;
  const link = page.getByRole('link', { name: '혜택홈 열어 보기' });
  await expect(link).toHaveAttribute('href', 'https://www.musinsa.com/events/main');
  await expect(link).toHaveAttribute('target', '_blank');
});

test('정산 원장: 결정표와 재생형 그림이 동작한다', async ({ page }) => {
  await page.goto('/projects/settlement-ledger-dedup/');
  await expect(page.locator('.matrix-rank li.is-top')).toContainText('+0.55');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.locator('.diagram-caption')).toContainText('2 / 5');
});

test.describe('동작 줄이기', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('혜택홈: GIF 대신 정지 이미지와 재생 버튼', async ({ page }) => {
    await page.goto('/projects/benefit-home/');
    await expect(page.getByRole('button', { name: '움직이는 화면 보기' })).toBeVisible();
  });
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('혜택홈: 정지 이미지를 보여 주고 GIF는 불러오지 않는다', async ({ page }) => {
    const gifs: string[] = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.gif')) gifs.push(r.url());
    });
    await page.goto('/projects/benefit-home/');
    await expect(page.locator('.case-media img')).toHaveAttribute('src', /\.webp$/);
    expect(gifs).toEqual([]);
  });
});

test('모든 사례 페이지에서 가로 스크롤이 없다', async ({ page }) => {
  for (const slug of CASES) {
    await page.goto(`/projects/${slug}/`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, slug).toBeLessThanOrEqual(1);
  }
});

test('사례 카드를 누르면 사례 페이지로 넘어간다', async ({ page }) => {
  await page.goto('/projects/');
  await page.getByRole('link', { name: /혜택홈 새 판 서버/ }).click();
  await expect(page).toHaveURL(/\/projects\/benefit-home\/$/);
  await expect(page.locator('.case-info h1')).toContainText('혜택홈');
});
