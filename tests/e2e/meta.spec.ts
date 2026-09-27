import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/about/', '/career/', '/projects/', '/troubleshooting/', '/contact/', '/projects/benefit-home/', '/projects/settlement-ledger-dedup/'];

for (const route of ROUTES) {
  test(`${route}: 미리보기 이미지가 실제로 있다`, async ({ page, request }) => {
    await page.goto(route);
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toMatch(/^https:\/\/ewanjee\.com\/open-graph\/.+\.png$/);
    const path = new URL(og!).pathname;
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });
}
