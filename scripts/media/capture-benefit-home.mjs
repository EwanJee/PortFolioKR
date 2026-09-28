#!/usr/bin/env node
// 공개 혜택홈 화면을 모바일 크기로 캡처해, 위에서 아래로 넘기는 GIF와 카드용 긴 정지 이미지를 만든다.
// 분석 도구 요청은 막는다(자동 캡처가 방문 통계에 섞이지 않게).
import { chromium, devices } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = 'https://www.musinsa.com/events/main';
const ANALYTICS = /amplitude|googletagmanager|google-analytics|doubleclick|braze|facebook|criteo/i;
const work = mkdtempSync(join(tmpdir(), 'bh-'));
const tall = join(work, 'tall.png');
mkdirSync('src/assets/motion', { recursive: true });
mkdirSync('src/assets/cases', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  userAgent: devices['iPhone 13'].userAgent,
});
await context.route(ANALYTICS, (route) => route.abort());
const page = await context.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: tall, fullPage: true, clip: { x: 0, y: 0, width: 390, height: 2600 } });
await browser.close();

// GIF: 첫 1초는 맨 위에 머물고, 그다음 초당 320px씩 아래로 넘긴다.
execFileSync('ffmpeg', [
  '-nostdin', '-v', 'error', '-y', '-loop', '1', '-framerate', '10', '-t', '6.5', '-i', tall,
  '-vf', "crop=390:844:0:'if(lt(t\\,1)\\,0\\,min((t-1)*320\\,ih-844))',scale=240:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4",
  'src/assets/motion/benefit-home.gif',
], { stdio: 'inherit' });
// 정지 이미지: 화면 두 장 높이(1688px). 카드에서는 마우스를 올리면 아래로 넘어가고, 사례 페이지에서는 윗부분만 보인다.
execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', tall, '-vf', 'crop=390:1688:0:0', '-q:v', '3', 'src/assets/cases/benefit-home.jpg'], { stdio: 'inherit' });
console.log('benefit-home: src/assets/motion/benefit-home.gif, src/assets/cases/benefit-home.jpg');

execFileSync(process.execPath, ['scripts/media/optimize.mjs'], { stdio: 'inherit' });
