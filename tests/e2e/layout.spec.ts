import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/about/', '/career/', '/projects/', '/troubleshooting/', '/contact/', '/404.html'];

test('첫 화면: 이름, 한 줄 소개, 메뉴 6개, 소셜 4개, 일하는 방식', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('지예환');
  await expect(page.getByText('무신사에서 주문, 배송, 클레임 도메인을 담당합니다.')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a')).toHaveCount(6);
  const social = page.locator('.social a');
  await expect(social).toHaveCount(4);
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('target', '_blank');
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('.hero-work')).toContainText('효율과 기록');
});

test('공통 스타일은 한 번 받고 홈과 경력 사이에서 다시 사용한다', async ({ page }) => {
  const stylesheets: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'stylesheet') stylesheets.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.hero-name')).toHaveCSS('font-weight', '700');
  const initial = [...stylesheets];
  expect(initial).toHaveLength(1);
  await page.getByRole('link', { name: 'Career', exact: true }).click();
  await expect(page.locator('.bar')).toHaveCSS('background-color', 'rgb(9, 32, 58)');
  expect(stylesheets).toEqual(initial);
});

const bodyFont = (page: import('@playwright/test').Page) => page.evaluate(() => getComputedStyle(document.body).fontFamily);
const PRETENDARD = /^"?Pretendard Variable/;

test('한글 글꼴은 첫 화면을 그리고 페이지를 다 받은 뒤에 받는다', async ({ page }) => {
  await page.goto('/');
  const fontEntries = () => page.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.name.includes('PretendardVariable')).length);
  await expect.poll(fontEntries).toBeGreaterThan(0);
  const t = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? Number.POSITIVE_INFINITY;
    const starts = performance.getEntriesByType('resource').filter((e) => e.name.includes('PretendardVariable')).map((e) => e.startTime);
    return { load: nav.loadEventStart, fcp, first: Math.min(...starts) };
  });
  expect(t.first).toBeGreaterThanOrEqual(t.load);
  expect(t.first).toBeGreaterThan(t.fcp);
  await expect.poll(() => bodyFont(page)).toMatch(PRETENDARD);
});

for (const route of ['/projects/', '/projects/benefit-home/']) {
  test(`${route}: 가장 큰 요소는 한글 글꼴을 받기 전에 그려진 것으로 잡힌다`, async ({ page }) => {
    await page.goto(route);
    await expect.poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.includes('PretendardVariable')))).toBe(true);
    const t = await page.evaluate(
      () =>
        new Promise<{ lcp: number; font: number }>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const font = Math.min(...performance.getEntriesByType('resource').filter((e) => e.name.includes('PretendardVariable')).map((e) => e.startTime));
            resolve({ lcp: entries[entries.length - 1].startTime, font });
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        }),
    );
    expect(t.lcp).toBeLessThan(t.font);
  });
}

test('사이트 안에서 페이지를 옮겨도 한글 글꼴이 그대로다', async ({ page }) => {
  await page.goto('/about/');
  await expect.poll(() => bodyFont(page)).toMatch(PRETENDARD);
  await page.locator('nav[aria-label="주 메뉴"]').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('PROJECTS');
  expect(await bodyFont(page)).toMatch(PRETENDARD);
});

test('한 번 받은 한글 글꼴은 다시 열 때 처음부터 켠다', async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { fontAtDcl: string }).fontAtDcl = getComputedStyle(document.body).fontFamily;
    });
  });
  await page.goto('/');
  await expect.poll(() => bodyFont(page)).toMatch(PRETENDARD);
  await page.reload();
  expect(await page.evaluate(() => (window as unknown as { fontAtDcl: string }).fontAtDcl)).toMatch(PRETENDARD);
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('한글 본문 글꼴은 처음부터 Pretendard다', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('body')).toHaveCSS('font-family', PRETENDARD);
  });
});

test('다른 페이지: 위로 붙은 헤더와 현재 메뉴 표시', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('header.bar')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a[aria-current="page"]')).toHaveText('About');
  await expect(page.locator('h1')).toHaveText('ABOUT');
});

test('다른 페이지의 위쪽 막대에도 이름이 "지예환 Ewan Jee"로 보인다', async ({ page }) => {
  for (const route of ['/about/', '/projects/benefit-home/']) {
    await page.goto(route);
    await expect(page.locator('.bar-name')).toHaveText(/^지예환\s*Ewan Jee$/);
  }
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

test('모바일: 메뉴, 탭, 버튼, 링크는 누르기 쉬운 크기다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '터치 화면 기준');
  // [주소, 요소, 최소 높이]: 주요 조작은 44px, 글 사이의 작은 태그 링크는 WCAG 2.5.8 최소 24px.
  const checks: [string, string, number][] = [
    ['/about/', 'nav[aria-label="주 메뉴"] a', 44],
    ['/', '.social a', 44],
    ['/projects/', '.filter', 44],
    ['/projects/?stack=Kafka', '.link-button', 44],
    ['/troubleshooting/', '.filter', 44],
    ['/troubleshooting/', '.trouble summary', 44],
    ['/projects/benefit-home/', '.play-button, .back-link, .case-nav a', 44],
    ['/projects/settlement-ledger-dedup/', '.diagram-controls button', 44],
    ['/about/', '.chips a', 24],
    ['/career/', '.tl-body h2 a', 44],
    ['/troubleshooting/', '.trouble-related a', 44],
    ['/contact/', '.contact-list a', 44],
    ['/projects/benefit-home/', '.case-link', 44],
    ['/about/', '.bar-name', 44],
  ];
  for (const [route, selector, min] of checks) {
    await page.goto(route);
    const heights = await page.locator(selector).evaluateAll((els) => els.filter((e) => e.getClientRects().length > 0).map((e) => e.getBoundingClientRect().height));
    expect(heights.length, `${route} ${selector}`).toBeGreaterThan(0);
    for (const h of heights) expect(h, `${route} ${selector}`).toBeGreaterThanOrEqual(min);
  }
});

test('모바일: 거르기 탭은 한 줄로 놓이고, 옆으로 밀어 넘긴다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '터치 화면 기준');
  for (const route of ['/projects/', '/troubleshooting/']) {
    await page.goto(route);
    const tops = await page.locator('.filter').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size, `${route} 탭 줄 수`).toBe(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
  await page.goto('/projects/');
  const row = page.locator('.filters');
  expect(await row.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  await expect(row).toHaveAttribute('data-more', 'right');
  const box = (await row.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.synthesizeScrollGesture', { x: Math.round(box.x + box.width - 40), y: Math.round(box.y + box.height / 2), xDistance: -240, yDistance: 0, gestureSourceType: 'touch', speed: 1200 });
  await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await expect(row).toHaveAttribute('data-more', /left/);
});

test('창을 줄여 탭이 넘치면 마우스 휠로도 옆으로 넘기고, 끝에 닿으면 페이지가 내려간다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '마우스 기준');
  await page.setViewportSize({ width: 768, height: 800 });
  await page.goto('/projects/');
  const row = page.locator('.filters');
  await expect(row).toHaveAttribute('data-more', 'right');
  const box = (await row.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 120);
  await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 200);
  await expect(row).toHaveAttribute('data-more', 'left');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('모바일: 주소로 연 탭은 탭 줄 안의 보이는 자리로 옮겨 온다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '터치 화면 기준');
  await page.goto('/projects/?team=prediger');
  const pressed = page.locator('.filter[aria-pressed="true"]');
  await expect(pressed).toHaveText('프레디저: 백엔드');
  await expect
    .poll(async () => {
      const [b, c] = await Promise.all([pressed.boundingBox(), page.locator('.filters').boundingBox()]);
      return Boolean(b && c && b.x >= c.x - 1 && b.x + b.width <= c.x + c.width + 1);
    })
    .toBe(true);
});

test('모바일: 경력의 팀 제목은 마우스 없이도 링크로 보이게 밑줄을 둔다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '터치 화면 기준');
  await page.goto('/career/');
  const line = await page.locator('.tl-body h2 a').first().evaluate((a) => getComputedStyle(a).textDecorationLine);
  expect(line).toContain('underline');
});

test('모바일: 경력의 팀 설명은 팀 이름 아래 줄에 따로 놓인다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', '좁은 화면 기준');
  await page.goto('/career/');
  const tops = await page.locator('.tl-body h2').first().evaluate((h2) => {
    const sub = h2.querySelector('span');
    return { title: h2.getBoundingClientRect().top, sub: sub ? sub.getBoundingClientRect().top : -1 };
  });
  expect(tops.sub).toBeGreaterThan(tops.title + 10);
});

test('320px 폭에서도 주요 주소와 사례 페이지에 가로 스크롤이 없다', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const cases = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore', 'api-gateway-transition'];
  for (const route of [...ROUTES, ...cases.map((slug) => `/projects/${slug}/`)]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});

test('창을 줄여도(480~1024px) 주요 주소와 사례 페이지에 가로 스크롤이 없다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '데스크톱 창을 줄이는 경우');
  const cases = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore', 'api-gateway-transition'];
  for (const width of [480, 600, 768, 900, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of [...ROUTES, ...cases.map((slug) => `/projects/${slug}/`)]) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${width}px ${route}`).toBeLessThanOrEqual(1);
    }
  }
});

test('창을 줄여도 양옆 여백이 줄어 글 칸이 좁아지지 않는다', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '데스크톱 창을 줄이는 경우');
  for (const [width, minProse] of [[1024, 420], [900, 360], [768, 320]] as const) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/about/');
    const prose = await page.locator('.about .prose').evaluate((el) => el.getBoundingClientRect().width);
    expect(prose, `${width}px 소개 글 칸`).toBeGreaterThanOrEqual(minProse);
  }
});

test.describe('스크립트 꺼짐: 동작하지 않는 탭은 숨긴다', () => {
  test.use({ javaScriptEnabled: false });
  for (const route of ['/projects/', '/troubleshooting/']) {
    test(route, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('button', { name: '전체' })).toHaveCount(0);
    });
  }
});

test('모든 주요 주소에서 가로 스크롤이 없다', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});
