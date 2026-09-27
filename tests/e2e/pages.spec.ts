import { expect, test } from '@playwright/test';

test('경력: 팀 3개, 학력, Rutgers 졸업', async ({ page }) => {
  await page.goto('/career/');
  await expect(page.locator('.tl-row')).toHaveCount(5);
  await expect(page.getByText('무신사: Purchase 팀')).toBeVisible();
  await expect(page.getByText('아이헤이트플라잉버그스: R&D')).toBeVisible();
  await expect(page.getByText('AI 디지털교과서 추천 학습 파트 개발')).toBeVisible();
  await expect(page.getByText('1차 검증 합격, 정부 AIDT(AI 디지털교과서) 선정 업체 기여')).toBeVisible();
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

test('경력, 프로젝트, 소개 어디에도 "인턴"이라는 말이 없다', async ({ page }) => {
  for (const route of ['/career/', '/projects/', '/about/']) {
    await page.goto(route);
    expect(await page.locator('main').innerText(), route).not.toContain('인턴');
  }
});

test('아이헤이트플라잉버그스 제목을 누르면 프로젝트의 그 탭으로 간다', async ({ page }) => {
  await page.goto('/career/');
  await page.getByRole('link', { name: '아이헤이트플라잉버그스: R&D' }).click();
  await expect(page).toHaveURL(/\/projects\/\?team=ihateflyingbugs$/);
  await expect(page.getByRole('button', { name: '아이헤이트플라잉버그스: R&D' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.card-wrap')).toHaveCount(1);
});

test('어느 페이지에도 진행 중, 검토 중 같은 상태 표기가 없다', async ({ page }) => {
  const cases = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore', 'api-gateway-transition'];
  for (const route of ['/career/', '/projects/', '/troubleshooting/', ...cases.map((slug) => `/projects/${slug}/`)]) {
    await page.goto(route);
    // 접힌 '자세히' 칸 안의 글도 보도록 textContent로 읽는다. '(목표)', '(예정)'도 상태 표기로 본다.
    expect(await page.locator('main').evaluate((el) => el.textContent ?? ''), route).not.toMatch(/(진행|검토|리뷰) ?중|\((목표|예정)\)/);
  }
});

test('Redis 카드는 요청 규모를 거꾸로 셀 수 있는 비율을 싣지 않고, 자가 복구는 운영 적용이 아니라 개념 검증(PoC)으로 적는다', async ({ page }) => {
  await page.goto('/troubleshooting/');
  const text = await page.locator('article#redis-topology').evaluate((el) => el.textContent ?? '');
  expect(text).not.toContain('0.52%');
  expect(text).toContain('개념 검증(PoC)');
  expect(text).not.toContain('스스로 복구되게 만들었습니다');
});

test('공유 문구는 지금 사례 수와 "회사명: 팀명" 표기를 따른다', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /무신사 사례 8개/);
  await page.goto('/career/');
  const career = await page.locator('meta[name="description"]').getAttribute('content');
  expect(career).toContain('무신사: ');
  expect(career).not.toContain('Global, Retention, Purchase 팀');
});

test('경력의 팀 제목을 누르면 프로젝트의 그 팀 탭으로 간다', async ({ page }) => {
  await page.goto('/career/');
  await page.getByRole('link', { name: '무신사: Purchase 팀' }).click();
  await expect(page).toHaveURL(/\/projects\/\?team=purchase$/);
  await expect(page.getByRole('button', { name: '무신사: Purchase 팀' })).toHaveAttribute('aria-pressed', 'true');
  for (const label of await page.locator('.card-wrap .team').allTextContents()) expect(label).toBe('무신사: Purchase 팀');
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('경력 숫자가 최종 값으로 보인다', async ({ page }) => {
    await page.goto('/career/');
    await expect(page.locator('.tl-row').nth(1)).toContainText('알림 채널 17개를 역할별 5개로 모으고');
  });
});

test('트러블슈팅: 9건, 앵커로 바로 열기, 자세히 펼치기', async ({ page }) => {
  await page.goto('/troubleshooting/#redis-topology');
  await expect(page.locator('.trouble')).toHaveCount(9);
  for (const label of await page.locator('.trouble .team').allTextContents()) expect(label).toMatch(/^무신사: (Global|Retention|Purchase) 팀$/);
  const card = page.locator('#redis-topology');
  await card.getByText('자세히').click();
  // 문구는 바뀔 수 있으니 칸의 순서와 펼쳐진 내용이 보이는지만 확인한다.
  await expect(card.locator('dt')).toContainText(['증상', '문제 정의', '원인', '해결']);
  await expect(card.locator('dd').first()).toBeVisible();
});

test('트러블슈팅: 팀 탭을 누르면 그 팀 기록만 보인다', async ({ page }) => {
  await page.goto('/troubleshooting/');
  await expect(page.locator('.trouble')).toHaveCount(9);
  expect(await page.locator('.filter').allTextContents()).toEqual(['전체', '무신사: Retention 팀', '무신사: Global 팀']);
  await page.getByRole('button', { name: '무신사: Global 팀' }).click();
  await expect(page.locator('.trouble')).toHaveCount(4);
  for (const label of await page.locator('.trouble .team').allTextContents()) expect(label).toBe('무신사: Global 팀');
  await page.getByRole('button', { name: '전체' }).click();
  await expect(page.locator('.trouble')).toHaveCount(9);
});

test('트러블슈팅: 보안 건을 뺀 모든 기록에 문제 정의, 접근, 해결, 검증, 문서화 칸이 있다', async ({ page }) => {
  await page.goto('/troubleshooting/');
  const cards = page.locator('.trouble:not(#api-security)');
  await expect(cards).toHaveCount(8);
  // KAPT 건은 문서화 사실이 근거 자료에 없어 사용자 확인을 기다린다(없는 문서를 지어내지 않는다).
  const recordPending = new Set(['kapt']);
  for (let i = 0; i < 8; i += 1) {
    const card = cards.nth(i);
    const id = (await card.getAttribute('id')) ?? '';
    const labels = await card.locator('dt').allTextContents();
    for (const need of ['문제 정의', '접근', '해결', '검증', '문서화']) {
      if (need === '문서화' && recordPending.has(id)) continue;
      expect(labels, `${id}: ${need}`).toContain(need);
    }
  }
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

test('트러블슈팅의 게이트웨이 502 카드와 API Gateway 사례가 서로 이어진다', async ({ page }) => {
  await page.goto('/troubleshooting/');
  await page.locator('article#gateway-502').getByRole('link', { name: '관련 사례 보기' }).click();
  await expect(page).toHaveURL(/\/projects\/api-gateway-transition\/$/);
  await page.locator('.case-body').getByRole('link', { name: '트러블슈팅 기록' }).click();
  await expect(page).toHaveURL(/\/troubleshooting\/#gateway-502$/);
  await expect(page.locator('article#gateway-502')).toBeVisible();
});
