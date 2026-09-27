#!/usr/bin/env node
// 챗봇 저장소의 빌드 결과(dist)를 로컬에서 띄우고, 일본어 첫 화면을 정지 이미지로 캡처한 뒤
// 층 카드를 누르고 한국어로 바꾸는 대화 화면을 녹화해 GIF로 만든다.
// 챗봇 저장소 경로는 공개하지 않으므로 환경 변수 CHATBOT_REPO_DIR로 받는다.
// 챗봇에 들어 있는 분석 도구가 운영 분석 데이터로 이벤트를 보내지 않도록 분석 요청을 막는다.
import { chromium, devices } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repo = process.env.CHATBOT_REPO_DIR;
if (!repo || !existsSync(join(repo, 'dist', 'index.html'))) {
  console.error('CHATBOT_REPO_DIR에 빌드된 dist/index.html이 있어야 합니다');
  process.exit(1);
}
const ANALYTICS = /amplitude|googletagmanager|google-analytics/i;
const work = mkdtempSync(join(tmpdir(), 'chatbot-'));
const still = join(work, 'still.png');
mkdirSync('public/media', { recursive: true });
mkdirSync('src/assets/cases', { recursive: true });

const server = spawn('python3', ['-m', 'http.server', '4399', '--directory', join(repo, 'dist')], { stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 1500));
try {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent: devices['iPhone 13'].userAgent,
    recordVideo: { dir: work, size: { width: 390, height: 844 } },
  });
  await context.route(ANALYTICS, (route) => route.abort());
  const page = await context.newPage();
  // 층 카드는 1F, 1.5F, 2F, 2.5F, 3F이고 언어 버튼은 JA, KO, EN이다. exact로 눌러 2F와 2.5F를 헷갈리지 않게 한다.
  const tap = async (text) => {
    await page.getByText(text, { exact: true }).first().click({ timeout: 3000 }).catch(() => console.warn(`누르지 못함: ${text}`));
    await page.waitForTimeout(1800);
  };
  await page.goto('http://localhost:4399/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await tap('JA');
  await page.screenshot({ path: still });
  await tap('2F');
  await page.mouse.move(195, 520);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1500);
  await tap('KO');
  await tap('3F');
  await page.waitForTimeout(1200);
  await context.close();
  await browser.close();
} finally {
  server.kill();
}

// 녹화 첫 1초(빈 화면과 로딩)는 잘라 낸다.
const video = readdirSync(work).find((f) => f.endsWith('.webm'));
execFileSync('ffmpeg', [
  '-nostdin', '-v', 'error', '-y', '-ss', '1', '-i', join(work, video),
  '-vf', 'fps=10,scale=240:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer:bayer_scale=4',
  'public/media/chatbot.gif',
], { stdio: 'inherit' });
execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', still, '-q:v', '3', 'src/assets/cases/chatbot.jpg'], { stdio: 'inherit' });
console.log('chatbot: public/media/chatbot.gif, src/assets/cases/chatbot.jpg');
