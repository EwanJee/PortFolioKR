import { expect, test } from '@playwright/test';

test('카드 10개(사례 7 + 개인 2 + 부트캠프 1), 팀 탭을 누르면 그 팀 프로젝트만 보인다', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.card-wrap')).toHaveCount(10);
  await page.getByRole('button', { name: 'Global' }).click();
  await expect(page.locator('.card-wrap')).toHaveCount(3);
  for (const label of await page.locator('.card-wrap .team').allTextContents()) expect(label).toBe('무신사: Global');
  await page.getByRole('button', { name: '개인·부트캠프' }).click();
  await expect(page.locator('.card-wrap')).toHaveCount(3);
  await page.getByRole('button', { name: '전체' }).click();
  await expect(page.locator('.card-wrap')).toHaveCount(10);
});

test('프로젝트는 시간 순으로, 최신이 먼저 놓인다', async ({ page }) => {
  await page.goto('/projects/');
  expect(await page.locator('.card h2').allTextContents()).toEqual([
    '클레임: 첫 결제 혜택 자격 복원',
    '정산 원장 중복 삽입',
    '알림 체계 정비',
    '혜택홈 새 판 서버와 편성 어드민',
    '일본 고객 재구매 지표 MVP와 생성형 AI 알림 품질',
    '회원 개인정보 조회 일원화 설계',
    '도쿄 팝업 스토어 안내 챗봇',
    'CS Navigator',
    'Remember Assessment',
    'My Health Check',
  ]);
});

test('부트캠프 팀 프로젝트 CS Navigator 카드가 조직 GitHub로 연결된다', async ({ page }) => {
  await page.goto('/projects/');
  const card = page.getByRole('link', { name: /CS Navigator/ });
  await expect(card).toHaveAttribute('href', 'https://github.com/twelevegg');
  await expect(card).toHaveAttribute('target', '_blank');
  await expect(card).toContainText('부트캠프 팀 프로젝트, 2026.01 ~ 2026.02');
});

test('사례 카드의 팀 표시는 "회사명: 팀명"이다', async ({ page }) => {
  await page.goto('/projects/');
  const labels = await page.locator('.card:not(.card--text) .team').allTextContents();
  expect(labels).toHaveLength(7);
  for (const label of labels) expect(label).toMatch(/^무신사: (Global|Retention|Purchase)$/);
});

test('모두 보기를 누르고 사례를 열었다가 뒤로 가면 목록이 다시 보인다', async ({ page }) => {
  await page.goto('/about/');
  await page.getByRole('link', { name: 'Kafka', exact: true }).click();
  await expect(page.getByText('Kafka 사용 사례만 보여 줍니다.')).toBeVisible();
  await expect(page.locator('.card-wrap')).toHaveCount(2);
  await page.getByRole('button', { name: '모두 보기' }).click();
  await expect(page.locator('.card-wrap')).toHaveCount(10);
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
  await expect(page.getByText('Kafka 사용 사례만 보여 줍니다.')).toBeVisible();
  await expect(page.locator('.card-wrap')).toHaveCount(2);
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
