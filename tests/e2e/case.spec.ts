import { expect, test } from '@playwright/test';

const CASES = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore', 'api-gateway-transition'];

for (const slug of CASES) {
  test(`${slug}: 끝의 / 없이 바로 열어도 제목, 상태, 미디어가 보인다`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}/$`));
    await expect(page.locator('.case-info h1')).toBeVisible();
    await expect(page.locator('.case-team .team')).toHaveText(/^무신사: (Global|Retention|Purchase) 팀$/);
    await expect(page.locator('.case-media img, .case-media svg').first()).toBeVisible();
    expect(await page.locator('.case-cells li').count()).toBeLessThanOrEqual(3);
  });
}

test('사례 본문: 모든 사례에 기록과 자동화가 있고, 요청한 내용(QA 봇, 휴리스틱 규칙, 외부 파드 0개)이 보인다', async ({ page }) => {
  for (const slug of CASES) {
    await page.goto(`/projects/${slug}/`);
    await expect(page.locator('.case-body h2', { hasText: '기록과 자동화' }), slug).toHaveCount(1);
  }
  await page.goto('/projects/benefit-home/');
  await expect(page.locator('.case-body')).toContainText('AOS, iOS, 크롬 웹뷰');
  await page.goto('/projects/japan-retention-mvp/');
  await expect(page.locator('.case-body')).toContainText('휴리스틱 규칙');
  await page.goto('/projects/api-gateway-transition/');
  const body = page.locator('.case-body');
  await expect(body).toContainText('개발, 알파, 운영 환경의 예전 외부 파드를 0개로');
  await expect(body.locator('h2', { hasText: '배운 점' })).toHaveCount(1);
});

test('사례 페이지 위쪽에 프로젝트 목록으로 돌아가는 링크가 있다', async ({ page }) => {
  await page.goto('/projects/benefit-home/');
  const back = page.getByRole('link', { name: '프로젝트 목록', exact: true });
  await expect(back).toBeVisible();
  const backBox = await back.boundingBox();
  const heroBox = await page.locator('.case-hero').boundingBox();
  expect(backBox && heroBox && backBox.y < heroBox.y).toBe(true);
  await back.click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator('h1')).toHaveText('PROJECTS');
});

test('혜택홈: GIF를 재생하고 공개 주소를 새 탭으로 연다', async ({ page }) => {
  const gif = page.waitForRequest(/\/media\/benefit-home\.gif$/);
  await page.goto('/projects/benefit-home/');
  await gif;
  const link = page.getByRole('link', { name: '혜택홈 열어 보기' });
  await expect(link).toHaveAttribute('href', 'https://www.musinsa.com/events/main');
  await expect(link).toHaveAttribute('target', '_blank');
});

test('혜택홈: 움직이는 화면을 멈췄다가 다시 볼 수 있고, 버튼 포커스가 남는다', async ({ page }) => {
  await page.goto('/projects/benefit-home/');
  const img = page.locator('.case-media img');
  await expect(img).toHaveAttribute('src', /benefit-home\.gif$/);
  await page.getByRole('button', { name: '움직이는 화면 멈추기' }).click();
  await expect(img).toHaveAttribute('src', /\.webp$/);
  const play = page.getByRole('button', { name: '움직이는 화면 보기' });
  await expect(play).toBeFocused();
  await play.click();
  await expect(img).toHaveAttribute('src', /benefit-home\.gif$/);
});

test('정산 원장: 재생형 그림의 끝에 닿아도 다음 버튼에 포커스가 남는다', async ({ page }) => {
  await page.goto('/projects/settlement-ledger-dedup/');
  const caption = page.locator('.diagram-caption');
  await expect(caption).toContainText('1 / 5');
  const next = page.getByRole('button', { name: '다음' });
  await next.focus();
  for (let i = 0; i < 4; i += 1) await page.keyboard.press('Enter');
  await expect(caption).toContainText('5 / 5');
  await expect(next).toBeFocused();
  await expect(next).toHaveAttribute('aria-disabled', 'true');
});

test('알림 체계: 마지막 장면에서 예전 채널 상자는 흐리게 보인다', async ({ page }) => {
  await page.goto('/projects/alerting/');
  const caption = page.locator('.diagram-caption');
  await expect(caption).toContainText(/^1 \/ \d+/);
  const total = Number((await caption.textContent())?.match(/^1 \/ (\d+)/)?.[1]);
  for (let i = 1; i < total; i += 1) await page.getByRole('button', { name: '다음' }).click();
  await expect(caption).toContainText(`${total} / ${total}`);
  await expect(page.locator('.diagram-node.is-muted')).toHaveCSS('opacity', '0.45');
});

test('정산 원장: 결정표와 재생형 그림이 동작한다', async ({ page }) => {
  await page.goto('/projects/settlement-ledger-dedup/');
  await expect(page.locator('.matrix-rank li.is-top')).toContainText('+0.55');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.locator('.diagram-caption')).toContainText('2 / 5');
});

test.describe('동작 줄이기', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('혜택홈: GIF 대신 정지 이미지와 재생 버튼, 누르면 재생하고 다시 멈출 수 있다', async ({ page }) => {
    await page.goto('/projects/benefit-home/');
    const img = page.locator('.case-media img');
    const play = page.getByRole('button', { name: '움직이는 화면 보기' });
    await expect(play).toBeVisible();
    await expect(img).toHaveAttribute('src', /\.webp$/);
    await play.click();
    await expect(img).toHaveAttribute('src', /benefit-home\.gif$/);
    const stop = page.getByRole('button', { name: '움직이는 화면 멈추기' });
    await expect(stop).toBeFocused();
    await stop.click();
    await expect(img).toHaveAttribute('src', /\.webp$/);
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
    await expect(page.getByRole('button', { name: /움직이는 화면/ })).toHaveCount(0);
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
