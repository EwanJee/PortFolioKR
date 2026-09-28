import { expect, test } from '@playwright/test';

test('메뉴 이동의 경력 숫자는 바로 보이고 홈 타이핑은 재시작하며 React를 요청하지 않는다', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url());
  });
  await page.goto('/');
  // 이동 뒤 숫자가 0으로 초기화됐다가 돌아오는 지연이 없는지 기록한다.
  await page.evaluate(() => {
    const state = window as typeof window & { countValues: string[] };
    state.countValues = [];
    const observer = new MutationObserver(() => {
      const value = document.querySelector('portfolio-countup .num')?.textContent;
      if (value) state.countValues.push(value);
    });
    observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true });
  });
  await page.getByRole('link', { name: 'Career', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { countValues: string[] }).countValues.length)).toBeGreaterThan(0);
  const target = await page.locator('portfolio-countup').first().getAttribute('data-to');
  await expect(page.locator('.num').first()).toHaveText(target!);
  expect(await page.evaluate(() => (window as typeof window & { countValues: string[] }).countValues)).not.toContain('0');
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.locator('.typed-visible')).toContainText('I am a Backend', { timeout: 12000 });
  await expect(page.locator('astro-island')).toHaveCount(0);
  expect(scripts.some((url) => /\/(?:client|jsx-runtime|index)\.[^/]+\.js$/.test(url))).toBe(false);
});

// 화면 낭독기용 전체 문구(.visually-hidden)에도 "I am a"가 있으므로, 보이는 글자(.typed-visible)만 확인한다.
test('움직임: 첫 역할에서 시작해 다음 역할로 넘어가고, I will be 문구는 없다', async ({ page }) => {
  await page.goto('/');
  const visible = page.locator('.typed-visible');
  await expect(visible).toContainText('I am a Product Engineer');
  await expect(visible).toContainText('I am a Backend', { timeout: 12000 });
  await expect(visible).not.toContainText('I will be');
});

test('타이핑 문구가 여러 줄로 넘어가도 이름과 메뉴가 움직이지 않는다', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    const tops = await page.evaluate(() => {
      const visible = document.querySelector('.typed-visible');
      const name = document.querySelector('.hero-name');
      const nav = document.querySelector('nav[aria-label="주 메뉴"]');
      const spoken = document.querySelector('.typed .visually-hidden')?.textContent ?? '';
      if (!visible || !name || !nav) throw new Error('첫 화면 요소가 없습니다');
      const lines = [['I am ', ''], ...spoken.replace(/^I am /, '').split(', ').map((role) => ['I am ', role])];
      // 한 번의 실행 안에서 글자를 바꾸고 바로 위치를 재므로, 타이핑 효과가 끼어들지 못한다.
      return lines.map(([prefix, role]) => {
        visible.innerHTML = `${prefix}<span class="typed-role">${role}</span><span class="typed-cursor">|</span>`;
        return [Math.round(name.getBoundingClientRect().top), Math.round(nav.getBoundingClientRect().top)];
      });
    });
    for (const t of tops) expect(t, `폭 ${width}px`).toEqual(tops[0]);
  }
});

test.describe('동작 줄이기', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('첫 역할에 멈춰 있다', async ({ page }) => {
    await page.goto('/');
    const visible = page.locator('.typed-visible');
    await expect(visible).toContainText('I am a Product Engineer');
    await page.waitForTimeout(3000);
    await expect(visible).toContainText('I am a Product Engineer');
  });
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('첫 역할 문구가 바로 보인다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.typed-visible')).toContainText('I am a Product Engineer');
    // Playwright는 opacity 0도 "보인다"로 보므로 불투명도를 직접 확인한다(기다리지 않고 바로).
    await expect(page.locator('.typed')).toHaveCSS('opacity', '1', { timeout: 500 });
  });
});
