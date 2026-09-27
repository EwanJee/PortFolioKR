import { expect, test } from '@playwright/test';

// 화면 낭독기용 전체 문구(.visually-hidden)에도 "I am a"가 있으므로, 보이는 글자(.typed-visible)만 확인한다.
test('움직임: 지금 사이트 문구로 시작해 I am으로 고친다', async ({ page }) => {
  await page.goto('/');
  const visible = page.locator('.typed-visible');
  await expect(visible).toContainText('I will be A', { timeout: 4000 });
  await expect(visible).toContainText('I am a', { timeout: 12000 });
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
      const lines = [['I ', ''], ['I will be A ', 'Server Developer'], ...spoken.replace(/^I am /, '').split(', ').map((role) => ['I am ', role])];
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
  test('최종 문구가 들어 있고 1.5초 뒤 드러난다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.typed-visible')).toContainText('I am a Product Engineer');
    // Playwright는 opacity 0도 "보인다"로 보므로 불투명도를 직접 확인한다.
    await expect(page.locator('.typed')).toHaveCSS('opacity', '1', { timeout: 3000 });
  });
});
