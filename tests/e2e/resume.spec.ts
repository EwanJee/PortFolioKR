import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resume } from '../../src/data/resume';

async function expectPdfLoaded(page: Page) {
  // object나 HTTP 200만으로는 PDF가 그려졌는지 알 수 없다. Chrome 뷰어가 실제 두 쪽을 읽었는지 검사한다.
  await expect.poll(() => page.frames().some((frame) => frame.url().startsWith('chrome-extension://'))).toBe(true);
  const viewer = page.frames().find((frame) => frame.url().startsWith('chrome-extension://'))!;
  await expect(viewer.locator('viewer-page-selector #pagelength')).toHaveText('2');
  await expect(viewer.locator('#plugin')).toBeVisible();
}

test('Resume 진입은 PDF 뷰어를 새 문서에서 초기화한다', async ({ page }) => {
  for (const route of ['/', '/career/', '/troubleshooting/']) {
    await page.goto(route);
    await page.evaluate(() => { (window as typeof window & { beforeResume?: boolean }).beforeResume = true; });
    await page.getByRole('link', { name: 'Resume', exact: true }).click();
    await expect(page).toHaveURL(/\/resume\/$/);
    expect(await page.evaluate(() => (window as typeof window & { beforeResume?: boolean }).beforeResume), route).toBeUndefined();
    await expectPdfLoaded(page);
  }
});

test('Resume 메뉴에서 PDF를 미리 보고 같은 파일을 내려받는다', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Resume', exact: true }).click();
  await expect(page).toHaveURL(/\/resume\/$/);
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText('Resume');
  await expect(page.getByRole('heading', { name: 'RESUME', exact: true })).toBeVisible();
  await expect(page.locator('object')).toHaveAttribute('data', `${resume.pdf}#view=FitH`);
  await expect(page.locator('object')).toHaveAccessibleName('지예환 이력서 PDF 미리보기');
  await expectPdfLoaded(page);

  const response = await request.get(resume.pdf);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  const body = await response.body();
  expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  expect(body.equals(await readFile(`public${resume.pdf}`))).toBe(true);

  const open = page.getByRole('link', { name: '새 창에서 보기' });
  await expect(open).toHaveAttribute('href', resume.pdf);
  await expect(open).toHaveAttribute('target', '_blank');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('link', { name: 'PDF 다운로드' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('Ji_Yehwan_Back-end_Engineer.pdf');
  expect((await readFile((await download.path())!)).equals(body)).toBe(true);

  await page.getByRole('link', { name: 'Career', exact: true }).click();
  await expect(page).toHaveURL(/\/career\/$/);
  await page.goBack();
  await expect(page.locator('nav a[aria-current="page"]')).toHaveText('Resume');
  await expect(page.locator('object')).toBeVisible();
  await expectPdfLoaded(page);
  await page.goForward();
  await expect(page).toHaveURL(/\/career\/$/);
  await page.getByRole('link', { name: 'Resume', exact: true }).click();
  await expectPdfLoaded(page);
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('Resume 직접 주소에서도 PDF 열기와 다운로드를 제공한다', async ({ page }) => {
    await page.goto('/resume/');
    await expect(page.getByRole('link', { name: '새 창에서 보기' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PDF 다운로드' })).toBeVisible();
    await expect(page.locator('object')).toHaveAttribute('data', `${resume.pdf}#view=FitH`);
  });
});
