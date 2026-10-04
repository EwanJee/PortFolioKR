// 저장소에 설치된 글꼴과 Playwright로 검색·선택 가능한 A4 PDF를 만든다.
import { chromium } from '@playwright/test';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { findLeaks, loadPrivatePatterns } from './leak-check.mjs';

const root = new URL('../', import.meta.url);
const source = new URL('src/documents/resume.html', root);
const output = new URL('output/pdf/Ji_Yehwan_Back-end_Engineer.pdf', root);
const published = new URL('public/resume/Ji_Yehwan_Back-end_Engineer.pdf', root);
const leaks = findLeaks(await readFile(source, 'utf8'), loadPrivatePatterns());
if (leaks.length) throw new Error(`이력서 공개 전 검사: ${leaks.length}건. npm run leak로 확인하세요.`);
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL ?? 'chrome' });

try {
  const page = await browser.newPage();
  await page.goto(source.href);
  await page.emulateMedia({ media: 'print' });
  await page.evaluate(() => document.fonts.ready);
  const problems = await page.evaluate(() => {
    const errors = [];
    if (![...document.fonts].every((font) => font.status === 'loaded')) errors.push('글꼴을 불러오지 못했습니다.');
    for (const [index, sheet] of [...document.querySelectorAll('.sheet')].entries()) {
      const content = sheet.querySelector('.content').getBoundingClientRect();
      const footer = sheet.querySelector('footer').getBoundingClientRect();
      if (content.bottom + 12 > footer.top) errors.push(`${index + 1}쪽 본문이 꼬리말에 ${Math.ceil(content.bottom + 12 - footer.top)}px 가깝습니다.`);
      if (sheet.scrollWidth > sheet.clientWidth || sheet.scrollHeight > sheet.clientHeight) errors.push(`${index + 1}쪽 내용이 용지 밖으로 넘칩니다.`);
    }
    return errors;
  });
  if (problems.length) throw new Error(problems.join('\n'));
  await mkdir(new URL('output/pdf/', root), { recursive: true });
  await mkdir(new URL('public/resume/', root), { recursive: true });
  await page.pdf({ path: fileURLToPath(output), preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
  await copyFile(output, published);
  console.log(`resume: ${fileURLToPath(published)}`);
} finally {
  await browser.close();
}
