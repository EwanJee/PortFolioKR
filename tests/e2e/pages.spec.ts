import { expect, test } from '@playwright/test';

test('경력: 팀 3개, 학력, Rutgers 졸업', async ({ page }) => {
  await page.goto('/career/');
  await expect(page.locator('.tl-row')).toHaveCount(5);
  await expect(page.getByText('무신사 Purchase 팀')).toBeVisible();
  await expect(page.getByText('Rutgers University–New Brunswick')).toBeVisible();
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
  const card = page.locator('#redis-topology');
  await card.getByText('자세히').click();
  await expect(card.getByText('Redis 클라이언트가 처음 받은 클러스터 구성에 고정돼 새 master를 찾지 못했습니다.')).toBeVisible();
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
