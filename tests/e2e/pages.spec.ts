import { expect, test } from '@playwright/test';

test('경력: 팀 3개, 학력, Rutgers 졸업', async ({ page }) => {
  await page.goto('/career/');
  await expect(page.locator('.tl-row')).toHaveCount(5);
  await expect(page.getByText('무신사 Purchase 팀')).toBeVisible();
  await expect(page.getByText('Rutgers University–New Brunswick')).toBeVisible();
});

test('경력: 모든 줄이 "프로젝트명: 설명" 형식이고 프로젝트명이 따로 보인다', async ({ page }) => {
  await page.goto('/career/');
  // 하위 항목(ul 안의 ul)은 빼고 맨 위 항목만 센다.
  const items = page.locator('.tl-body > ul > li');
  const count = await items.count();
  expect(count).toBeGreaterThan(0);
  await expect(page.locator('.tl-body > ul > li > .tl-project')).toHaveCount(count);
  for (const text of await items.allTextContents()) expect(text).toMatch(/^[^:]+: \S/);
  await expect(page.getByText('이후 하라주쿠 팝업에 그대로 재활용')).toBeVisible();
});

test('어느 페이지에도 진행 중, 검토 중 같은 상태 표기가 없다', async ({ page }) => {
  const cases = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore'];
  for (const route of ['/career/', '/projects/', '/troubleshooting/', ...cases.map((slug) => `/projects/${slug}/`)]) {
    await page.goto(route);
    expect(await page.locator('main').innerText(), route).not.toMatch(/(진행|검토|리뷰) ?중/);
  }
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('경력 숫자가 최종 값으로 보인다', async ({ page }) => {
    await page.goto('/career/');
    await expect(page.locator('.tl-row').nth(1)).toContainText('알림 채널 17개를 역할별 5개로 정리');
  });
});

test('트러블슈팅: 9건, 앵커로 바로 열기, 자세히 펼치기', async ({ page }) => {
  await page.goto('/troubleshooting/#redis-topology');
  await expect(page.locator('.trouble')).toHaveCount(9);
  for (const label of await page.locator('.trouble .team').allTextContents()) expect(label).toMatch(/^무신사: (Global|Retention|Purchase)$/);
  const card = page.locator('#redis-topology');
  await card.getByText('자세히').click();
  // 문구는 바뀔 수 있으니 칸의 순서와 펼쳐진 내용이 보이는지만 확인한다.
  await expect(card.locator('dt')).toContainText(['증상', '문제 정의', '원인', '해결']);
  await expect(card.locator('dd').first()).toBeVisible();
});

test('트러블슈팅: 팀 탭을 누르면 그 팀 기록만 보인다', async ({ page }) => {
  await page.goto('/troubleshooting/');
  await expect(page.locator('.trouble')).toHaveCount(9);
  await page.getByRole('button', { name: 'Global' }).click();
  await expect(page.locator('.trouble')).toHaveCount(4);
  for (const label of await page.locator('.trouble .team').allTextContents()) expect(label).toBe('무신사: Global');
  await page.getByRole('button', { name: '전체' }).click();
  await expect(page.locator('.trouble')).toHaveCount(9);
});

test('보안 건은 제목만 보이고 대상이나 방식은 없다', async ({ page }) => {
  await page.goto('/troubleshooting/#api-security');
  const card = page.locator('#api-security');
  await expect(card.getByRole('heading', { name: 'API 보안 취약점 개선' })).toBeVisible();
  await expect(card.locator('p')).toHaveCount(0);
  await expect(card.locator('details')).toHaveCount(0);
});

test('소개: 사진, 기술 태그가 사례로 연결된다', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.getByAltText('지예환 프로필 사진')).toBeVisible();
  await page.getByRole('link', { name: 'Kafka' }).click();
  await expect(page).toHaveURL(/\/projects\/\?stack=Kafka$/);
});

test('소개: 소개 글 다음에 지금 다니는 회사, 직군, 시작 시점을 보여 준다', async ({ page }) => {
  await page.goto('/about/');
  expect(await page.locator('.section-label').allTextContents()).toEqual(['ABOUT', 'CURRENT CAREER', 'SKILLS', 'EDUCATION']);
  const current = page.locator('.current-career li');
  await expect(current).toHaveCount(1);
  await expect(current).toContainText('2026.03 ~ PRESENT');
  await expect(current).toContainText('무신사 MUSINSA');
  await expect(current).toContainText('Product Engineer');
});

test('LinkedIn 링크는 지금 쓰는 프로필 주소다(연락처와 첫 화면)', async ({ page }) => {
  const url = 'https://www.linkedin.com/in/%EC%98%88%ED%99%98-%EC%A7%80-191854242';
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: 'LinkedIn 프로필' })).toHaveAttribute('href', url);
  await page.goto('/');
  await expect(page.locator('.social a[aria-label="LinkedIn"]')).toHaveAttribute('href', url);
});

test('연락처: 링크 4개', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('.contact-list a')).toHaveCount(4);
});

test('어느 페이지에도 전화번호 모양이 없다', async ({ page }) => {
  for (const route of ['/', '/about/', '/career/', '/projects/', '/troubleshooting/', '/contact/']) {
    await page.goto(route);
    expect(await page.locator('body').innerText(), route).not.toMatch(/01[016789]-\d{3,4}-\d{4}/);
  }
});
