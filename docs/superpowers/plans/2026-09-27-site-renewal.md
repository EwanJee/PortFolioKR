# ewanjee.com 사이트 개편 구현 계획

> 에이전트 작업자용: 필수 하위 스킬은 superpowers:subagent-driven-development(권장) 또는 superpowers:executing-plans다. 작업 단위로 진행하고, 단계는 체크박스(`- [ ]`)로 추적한다.

- 목표: 지금 ewanjee.com의 모양(짙은 남색, 초록 강조, 큰 이름과 타이핑 문구, 위로 붙는 헤더)을 살리고, Astro와 React로 안쪽 구성과 내용을 새로 만든다.
- 구조: Astro가 페이지마다 정적 HTML을 만든다. 타이핑, 숫자, 구조 그림, 결정표, 프로젝트 필터, GIF 재생처럼 움직이는 부분만 React 컴포넌트로 붙인다. 사례와 트러블슈팅은 MDX 콘텐츠 컬렉션이고, 경력·기술·개인 프로젝트는 TypeScript 데이터 파일이다. 공개 전 검사 스크립트가 사내 정보, 깨진 링크, 근거 없는 수치를 막는다.
- 설계 7장과의 대응: 구조 그림 컴포넌트(`RaceConditionPlayer`, `AlertFlow`, `SignalPipeline`, `RestoreStateMachine`)와 개인정보 조회 그림은 단계 재생 엔진 `StepDiagram` 하나와 그림 정의 5개로 만든다. 경력 타임라인은 Astro 컴포넌트이고, 숫자만 `CountUp` 컴포넌트다.
- 기술: Astro 7.2.9, `@astrojs/react` 6.0.4, `@astrojs/mdx` 7.0.8, React 19.2.8, `astro-og-canvas` 0.13.0, Pretendard 1.3.9, `@fontsource/poppins` 5.3.0, Vitest 4.1.11, Testing Library, Playwright 1.62.1(이 맥의 Chrome), TypeScript 5.8.3, GitHub Actions
- 설계 문서: `docs/superpowers/specs/2026-09-27-ewanjee-portfolio-renewal-design.md` (이 계획은 설계 문서를 근거로 한다. 두 문서를 함께 읽는다.)
- 먼저 끝낼 것: `docs/superpowers/plans/2026-09-27-pages-actions-cutover.md` (배포 방식 전환)
- 디자인 기준 목업: 저장소 기준 `../.superpowers/brainstorm/1439-1790493826/content/motion-3.html` (브라우저로 열어 첫 화면, 경력, 프로젝트, 세부 보기의 모양과 움직임을 비교한다)
- 비공개 근거 파일: 저장소 기준 `../portfolio-private/evidence.md` (수치의 원래 값, 공개 표기, 출처, 작업용 경로가 있다. 공개 저장소에 옮겨 적지 않는다.)

## 전역 제약

- Node는 22.14.0이다. 명령을 돌리기 전에 `source ~/.nvm/nvm.sh && nvm use` 한다(`.nvmrc`). 이 맥의 기본 Node 20.17에서는 Astro 7이 동작하지 않는다.
- 패키지는 아래 버전으로 고정한다(범위 기호 없이). 로컬 설치는 회사 npm 미러를 거친다. 프로젝트 `.npmrc`에는 `omit-lockfile-registry-resolved=true` 한 줄만 둔다. registry 설정은 프로젝트에 넣지 않는다.
- `package-lock.json`에는 `"resolved"`와 미러 주소가 없어야 한다(Task 1 테스트).
- 색: 바탕 `#010e1b`, 패널 `#09203a`, 강조 `#12d640`, 진한 초록 `#1c7d32`, 글자 흰색, 보조 글자 흰색 72%. 팀 색: Global `#5dade2`, Retention `#f5b041`, Purchase `#c39bd3`, 그 밖 흰색 45%. 강조 초록은 팀 색으로 쓰지 않는다.
- 글꼴: 한글 Pretendard, 영문 제목과 메뉴 Poppins. 모두 npm 패키지로 사이트에 함께 올린다(외부 글꼴 서버를 쓰지 않는다).
- 문구와 수치는 설계 문서 6장과 비공개 근거 파일의 "공개 표기" 열을 따른다. 두 곳에 없는 사실(검토한 대안, 원인 설명, 날짜, 수치, 도구 이름)은 새로 지어 쓰지 않는다. 비공개 조사 노트(`research/`)는 근거가 아니다. 사내 절대값은 반올림한 규모로 쓴다. 사내 시스템·서비스·테이블 이름, 사내 주소, 티켓 키, 생년월일, 전화번호를 쓰지 않는다. 보안 건은 "API 보안 취약점 개선"으로만 쓴다.
- 링크: 사내 링크는 넣지 않는다. 혜택홈 공개 주소와 본인 연락처 링크는 넣는다. 밖으로 나가는 링크는 `target="_blank" rel="noopener noreferrer"`로 연다.
- 움직임: 0.2~0.8초, `transform`과 `opacity`만 전환한다. 색, 폭, 배경은 전환 효과 없이 바로 바꾼다. "동작 줄이기"에서는 설계 문서 4장의 고정 상태를 보여 준다. 스크립트가 없어도 최종 값이 보여야 한다.
- 콘텐츠나 문서를 고친 커밋 전에는 `npm run leak`을 돌려 0건을 확인한다.
- 커밋 작성자는 `Ewan Jee <111678598+EwanJee@users.noreply.github.com>`이다. push는 `origin`(`git@github-ewanjee:EwanJee/PortFolioKR.git`)으로 한다.
- 모든 커밋 메시지는 제목, 빈 줄, 그리고 다음 두 줄로 끝난다.
  - `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
  - `Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7`
- 단위 테스트는 `tests/unit`(Vitest, jsdom), 화면 테스트는 `tests/e2e`(Playwright, `dist`를 `python3 -m http.server 4321`로 띄움)에 둔다. 화면 테스트 전에는 항상 `npm run build` 한다.

## 리뷰 초점

- 스크립트가 꺼져 있거나 React 컴포넌트가 살아나지 못한 경우. 사람은 타이핑 문구와 숫자가 최종 값으로 보이기를 기대한다. Task 4와 Task 11의 화면 테스트가 `javaScriptEnabled: false`로 확인한다.
- "동작 줄이기"를 켠 경우. GIF가 자동 재생되지 않고, 타이핑은 "I am a Product Engineer"로 멈춰 있고, 목록의 구조 그림은 마지막 장면이어야 한다. Task 4, 6, 10의 테스트가 확인한다.
- 예전 주소(`ewanjee.com/#about`, `#experience`, `#portfolio` 등)로 들어온 경우. 새 주소로 넘어가야 한다. Task 3의 화면 테스트가 확인한다.
- 모바일 폭 390px. 가로로 스크롤되면 안 된다. Task 3의 화면 테스트가 모든 주요 주소에서 확인한다.
- 사례 주소를 목록을 거치지 않고 바로 연 경우, 끝의 `/` 없이 연 경우. 페이지와 미디어가 정상으로 보여야 한다. Task 10의 화면 테스트가 확인한다.

---

### Task 1: 브랜치 정리와 도구 준비

Files:
- Modify: `.gitignore`
- Create: `.nvmrc`, `.npmrc`, `package.json`, `package-lock.json`(생성), `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `src/pages/index.astro`(임시), `tests/unit/setup.ts`, `tests/unit/lockfile.test.ts`
- Move: `assets/img/profile.jpg` → `src/assets/profile.jpg`, `favicon.svg` → `public/favicon.svg`, `CNAME` → `public/CNAME`, `Readme.md` → `README.md`(내용 교체)
- Delete: `index.html`, `assets/`, `projects/`, `website_images/`, `LICENSE`(템플릿 원작자 저작권 표기), `.DS_Store`(추적 중인 macOS 파일)

Interfaces:
- Consumes: 배포 전환 계획이 `master`에 넣은 `.github/workflows/deploy.yml`, `scripts/stage-static-site.sh`
- Produces: npm 스크립트 `dev`, `build`, `check`, `test`, `test:e2e`, `leak`, `leak:dist`, `links`, `evidence`, `verify`. 이후 작업은 이 이름으로 명령을 돌린다.

- [ ] Step 1: `master`를 합치고 `.gitignore`를 정리한다

병합 커밋에도 두 줄 서명이 들어가도록 메시지를 직접 준다.

```bash
cd PortFolioKR
git switch renewal
git fetch origin
git merge --no-ff origin/master -m 'chore: 배포 워크플로가 들어간 master를 renewal에 합친다' -m $'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7'
```

`.gitignore`가 충돌하면 파일 전체를 아래 내용으로 바꾸고 `git add .gitignore && git commit --no-edit` 한다(위에서 준 병합 메시지가 그대로 쓰인다). 충돌이 없어도 아래 내용과 같게 맞춘다. 배포 전환 계획의 작업 폴더(`../PortFolioKR-ci`)가 남아 있으면 `git worktree remove ../PortFolioKR-ci`로 지운다.

```
.idea
.omc/
.superpowers/
.leak-denylist
_site/
node_modules/
dist/
.astro/
test-results/
playwright-report/
.DS_Store
```

- [ ] Step 2: 실패하는 lockfile 테스트를 쓴다

`tests/unit/lockfile.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// 공개 저장소에 올라가는 lockfile에 설치 경로(미러 주소)가 남으면 안 된다.
describe('package-lock.json', () => {
  const lock = readFileSync('package-lock.json', 'utf8');

  it('resolved 항목이 없다', () => {
    expect(lock).not.toMatch(/"resolved"/);
  });

  it('저장소 관리 도구의 주소 형태가 없다', () => {
    expect(lock).not.toMatch(/\/repository\//);
  });
});
```

- [ ] Step 3: 설정 파일을 만든다

`.nvmrc`:

```
22.14.0
```

`.npmrc`:

```
omit-lockfile-registry-resolved=true
```

`package.json`:

```json
{
  "name": "ewanjee-portfolio",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "leak": "node scripts/leak-check.mjs src public docs package-lock.json",
    "leak:dist": "node scripts/leak-check.mjs dist",
    "links": "node scripts/link-check.mjs dist",
    "evidence": "node scripts/evidence-check.mjs",
    "verify": "npm run leak && npm run check && npm test && npm run build && npm run leak:dist && npm run links && npm run evidence"
  },
  "dependencies": {
    "@astrojs/mdx": "7.0.8",
    "@astrojs/react": "6.0.4",
    "@fontsource/poppins": "5.3.0",
    "astro": "7.2.9",
    "astro-og-canvas": "0.13.0",
    "pretendard": "1.3.9",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.10",
    "@playwright/test": "1.62.1",
    "@testing-library/dom": "10.4.1",
    "@testing-library/react": "16.3.3",
    "@types/node": "22.20.1",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.5",
    "@vitejs/plugin-react": "6.1.0",
    "jsdom": "30.0.1",
    "typescript": "5.8.3",
    "vitest": "4.1.11"
  }
}
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://ewanjee.com',
  integrations: [react(), mdx()],
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "allowJs": true
  }
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
    restoreMocks: true,
  },
});
```

`tests/unit/setup.ts`:

```ts
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest 전역(globals)을 켜지 않았으므로 Testing Library의 자동 정리가 돌지 않는다. 테스트마다 화면을 비운다.
afterEach(() => cleanup());
```

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

// Astro 7의 `astro preview`는 백그라운드로 떠서 바로 끝나므로, GitHub Pages처럼 정적 파일만 내주는 서버를 쓴다.
const baseURL = process.env.BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL, channel: 'chrome' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'python3 -m http.server 4321 --directory dist', url: 'http://localhost:4321', reuseExistingServer: false, timeout: 60_000, stderr: 'ignore' },
});
```

임시 `src/pages/index.astro`:

```astro
---
---
<html lang="ko">
  <head><meta charset="utf-8" /><title>지예환</title></head>
  <body><h1>지예환</h1></body>
</html>
```

- [ ] Step 4: 패키지를 설치하고 lockfile 테스트를 통과시킨다

```bash
source ~/.nvm/nvm.sh && nvm use
npm install --no-audit --no-fund
npx vitest run tests/unit/lockfile.test.ts
```

Expected: `2 passed`

- [ ] Step 5: 옛 사이트 파일을 정리하고 README를 바꾼다

macOS 파일 시스템은 대소문자를 구분하지 않는다. `Readme.md`를 지우고 `README.md`를 새로 만들면 같은 파일로 취급돼 사라질 수 있으므로, `git mv`로 이름을 바꾼 뒤 내용을 덮어쓴다.

```bash
mkdir -p src/assets public
git mv assets/img/profile.jpg src/assets/profile.jpg
git mv favicon.svg public/favicon.svg
git mv CNAME public/CNAME
git mv Readme.md README.md
git rm -r -q index.html assets projects website_images LICENSE .DS_Store
```

`README.md`를 아래 내용으로 바꾼다.

```markdown
# ewanjee.com

지예환(Ewan Jee)의 개인 포트폴리오 사이트입니다. Astro와 React로 만들고 GitHub Pages로 배포합니다.

## 로컬 실행

- Node 22.14.0: `nvm use`
- 설치: `npm install`
- 개발 서버: `npm run dev`

## 검사

- `npm run verify`: 공개 전 검사, 타입 검사, 단위 테스트, 빌드, 빌드 결과 검사, 링크 검사, 근거 확인
- `npm run build && npm run test:e2e`: 화면 테스트(이 맥의 Chrome 사용)

## 설계와 계획

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
```

- [ ] Step 6: 빌드를 확인한다

```bash
npm run build
ls dist/index.html public/CNAME src/assets/profile.jpg README.md
git ls-files | grep -c -i '^readme.md$'
```

Expected: 네 경로가 모두 출력되고 빌드가 `Complete!`로 끝난다. 마지막 줄은 `1`(README가 하나만 추적됨).

- [ ] Step 7: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
chore: Astro 7 + React 도구 구성, 옛 템플릿 파일 정리

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 2: 공개 전 검사 도구

Files:
- Create: `scripts/leak-check.mjs`, `scripts/link-check.mjs`, `scripts/evidence-check.mjs`
- Test: `tests/unit/leak-check.test.ts`, `tests/unit/link-check.test.ts`, `tests/unit/evidence-check.test.ts`
- Create(추적하지 않음): `.leak-denylist`

Interfaces:
- Consumes: 없음
- Produces:
  - `findLeaks(text: string, privatePatterns: string[]): { line: number; rule: string }[]`, `loadPrivatePatterns(env?, file?): string[]`, `scanPaths(paths: string[], patterns: string[])`, `missingDenylistError(env, count): string | null`
  - `collectRefs(html: string): string[]`, `checkDist(distDir: string): string[]`
  - `extractEvidenceIds(text: string): string[]`, `extractKnownIds(markdown: string): Set<string>`, `findMissing(dirs: string[], known: Set<string>): string[]`
  - 콘텐츠는 근거 ID를 `evidence: E-...` 또는 `evidence: [E-a, E-b]`처럼 한 줄에 쓴다.

- [ ] Step 1: 실패하는 테스트를 쓴다

테스트 표본 문자열은 공개 문서 검사에 걸리지 않도록 조각을 이어 붙여 만든다.

`tests/unit/leak-check.test.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findLeaks, loadPrivatePatterns, missingDenylistError, scanPaths } from '../../scripts/leak-check.mjs';

const ticket = ['ABC', '1234'].join('-');
const phone = ['010', '1234', '5678'].join('-');
const collab = ['https://team.atlassian', 'net/browse/x'].join('.');
const birth = ['1998', '03', '15'].join('.');
const gdoc = ['https://docs', 'google', 'com/document/d/x'].join('.');

describe('findLeaks', () => {
  it('티켓 키 모양을 잡고 허용 목록은 넘긴다', () => {
    expect(findLeaks(`see ${ticket}`, [])).toEqual([{ line: 1, rule: 'ticket-key' }]);
    expect(findLeaks('ISO-8601 and SHA-256', [])).toEqual([]);
  });

  it('협업 도구 주소와 전화번호를 잡는다', () => {
    const rules = findLeaks(`${collab}\ncall ${phone}`, []).map((h) => h.rule);
    expect(rules).toEqual(['collab-url', 'kr-phone']);
    expect(findLeaks(gdoc, []).map((h) => h.rule)).toEqual(['collab-url']);
  });

  it('생년월일 모양을 잡고, 요즘 날짜와 기준 시각은 넘긴다', () => {
    expect(findLeaks(`born ${birth}`, [])).toEqual([{ line: 1, rule: 'birthdate' }]);
    expect(findLeaks('2026-09-27 and 1970-01-01', [])).toEqual([]);
  });

  it('비공개 목록은 대소문자 없이 잡고 값 대신 번호로 알린다', () => {
    const hits = findLeaks('Hello SecretWord here', ['secretword']);
    expect(hits).toEqual([{ line: 1, rule: 'denylist#1' }]);
    expect(JSON.stringify(hits)).not.toContain('secretword');
  });
});

describe('loadPrivatePatterns', () => {
  it('환경 변수와 파일을 합치고 빈 줄과 주석을 뺀다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'leak-'));
    const file = join(dir, 'deny');
    writeFileSync(file, 'alpha\n\n# note\nbeta\n');
    expect(loadPrivatePatterns({ LEAK_DENYLIST: 'gamma\n' }, file)).toEqual(['gamma', 'alpha', 'beta']);
  });
});

describe('missingDenylistError', () => {
  it('CI에서 비공개 목록이 비면 실패로 알리고, 로컬에서는 넘긴다', () => {
    expect(missingDenylistError({ CI: 'true' }, 0)).toContain('LEAK_DENYLIST');
    expect(missingDenylistError({ CI: 'true' }, 3)).toBeNull();
    expect(missingDenylistError({}, 0)).toBeNull();
  });
});

describe('scanPaths', () => {
  it('바이너리와 node_modules는 건너뛴다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'scan-'));
    mkdirSync(join(dir, 'node_modules'));
    writeFileSync(join(dir, 'node_modules', 'x.js'), ticket);
    writeFileSync(join(dir, 'img.png'), ticket);
    writeFileSync(join(dir, 'page.html'), `<p>${ticket}</p>`);
    const results = scanPaths([dir], []);
    expect(results).toHaveLength(1);
    expect(results[0].file.endsWith('page.html')).toBe(true);
  });
});
```

`tests/unit/link-check.test.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkDist, collectRefs } from '../../scripts/link-check.mjs';

describe('collectRefs', () => {
  it('href와 src를 모은다', () => {
    expect(collectRefs('<a href="/a/">a</a><img src="/b.png">')).toEqual(['/a/', '/b.png']);
  });
});

describe('checkDist', () => {
  it('없는 파일과 없는 앵커를 알린다', () => {
    const dist = mkdtempSync(join(tmpdir(), 'dist-'));
    mkdirSync(join(dist, 'about'));
    mkdirSync(join(dist, 'troubleshooting'));
    writeFileSync(join(dist, 'about', 'index.html'), '<p>about</p>');
    writeFileSync(join(dist, 'troubleshooting', 'index.html'), '<article id="a"></article>');
    writeFileSync(
      join(dist, 'index.html'),
      '<a href="/about/"></a><a href="/about"></a><a href="/missing/"></a><a href="/troubleshooting/#a"></a><a href="/troubleshooting/#b"></a><a href="https://example.com/"></a><a href="/projects/?stack=Kafka"></a>',
    );
    const problems = checkDist(dist);
    expect(problems).toContain('index.html -> /missing/ (파일 없음)');
    expect(problems).toContain('index.html -> /troubleshooting/#b (앵커 없음)');
    expect(problems).toContain('index.html -> /projects/?stack=Kafka (파일 없음)');
    expect(problems).toHaveLength(3);
  });
});
```

`tests/unit/evidence-check.test.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractEvidenceIds, extractKnownIds, findMissing } from '../../scripts/evidence-check.mjs';

describe('extractEvidenceIds', () => {
  it('evidence가 있는 줄의 ID만 모은다', () => {
    const text = 'evidence: [E-a, E-b-c]\nlabel: E-not-this\n  - { label: x, value: y, evidence: E-d }';
    expect(extractEvidenceIds(text)).toEqual(['E-a', 'E-b-c', 'E-d']);
  });
});

describe('extractKnownIds', () => {
  it('근거 표의 첫 칸 ID를 읽는다', () => {
    const md = '| ID | 값 |\n| --- | --- |\n| E-a | 1 |\n| E-b | 2 |\n';
    expect([...extractKnownIds(md)]).toEqual(['E-a', 'E-b']);
  });
});

describe('findMissing', () => {
  it('근거 파일에 없는 ID를 알린다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ev-'));
    mkdirSync(join(dir, 'content'));
    writeFileSync(join(dir, 'content', 'x.mdx'), 'evidence: [E-a, E-zz]');
    expect(findMissing([join(dir, 'content')], new Set(['E-a']))).toEqual([`${join(dir, 'content', 'x.mdx')}: E-zz`]);
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/leak-check.test.ts tests/unit/link-check.test.ts tests/unit/evidence-check.test.ts`
Expected: 스크립트 파일이 없어 세 파일 모두 `Failed to resolve import`로 실패

- [ ] Step 3: 스크립트를 쓴다

`scripts/leak-check.mjs`:

```js
#!/usr/bin/env node
// 공개 저장소와 빌드 결과에 사내 정보가 섞였는지 검사한다.
// 여기에는 공개해도 되는 일반 규칙만 둔다. 사내 이름과 도메인 목록은
// 환경 변수 LEAK_DENYLIST와 저장소 루트의 .leak-denylist(추적하지 않음)에서 읽는다.
// 비공개 목록에 걸린 값은 로그에 쓰지 않고 번호로만 알린다(공개 저장소의 CI 로그도 공개된다).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const BINARY = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.woff', '.woff2', '.otf', '.ttf', '.mp4', '.webm', '.zip', '.pdf']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.astro']);
const TICKET_RE = /\b[A-Z][A-Z0-9]{1,9}-\d{2,6}\b/g;

export const TICKET_ALLOW = new Set(['ISO-8601', 'ISO-8859', 'SHA-256', 'SHA-384', 'SHA-512', 'UTF-16', 'UTF-32']);
export const PUBLIC_RULES = [
  { name: 'collab-url', re: /atlassian\.net|slack\.com\/archives|app\.slack\.com|docs\.google\.com|drive\.google\.com|datadoghq\.com|notion\.so|figma\.com\/(file|design|board)/i },
  { name: 'kr-phone', re: /\b01[016789]-?\d{3,4}-?\d{4}\b/ },
  // 1980~2005년 날짜(생년월일 모양). 요즘 날짜와 1970-01-01 같은 기준 시각은 잡지 않는다.
  { name: 'birthdate', re: /\b(19[89]\d|200[0-5])[-./]\s?(0?[1-9]|1[0-2])[-./]\s?(0?[1-9]|[12]\d|3[01])\b/ },
];

export function loadPrivatePatterns(env = process.env, file = '.leak-denylist') {
  const lines = [];
  if (env.LEAK_DENYLIST) lines.push(...env.LEAK_DENYLIST.split('\n'));
  if (existsSync(file)) lines.push(...readFileSync(file, 'utf8').split('\n'));
  return lines.map((l) => l.trim()).filter((l) => l !== '' && !l.startsWith('#'));
}

export function findLeaks(text, privatePatterns = []) {
  const hits = [];
  const lowered = privatePatterns.map((p) => p.toLowerCase());
  text.split('\n').forEach((line, index) => {
    const lineNo = index + 1;
    for (const rule of PUBLIC_RULES) {
      if (rule.re.test(line)) hits.push({ line: lineNo, rule: rule.name });
    }
    for (const match of line.matchAll(TICKET_RE)) {
      if (!TICKET_ALLOW.has(match[0])) hits.push({ line: lineNo, rule: 'ticket-key' });
    }
    const lower = line.toLowerCase();
    lowered.forEach((p, i) => {
      if (lower.includes(p)) hits.push({ line: lineNo, rule: `denylist#${i + 1}` });
    });
  });
  return hits;
}

export function* walk(path) {
  if (!existsSync(path)) return;
  const stat = statSync(path);
  if (stat.isFile()) {
    if (!BINARY.has(extname(path).toLowerCase())) yield path;
    return;
  }
  for (const name of readdirSync(path)) {
    if (SKIP_DIRS.has(name)) continue;
    yield* walk(join(path, name));
  }
}

export function scanPaths(paths, privatePatterns) {
  const results = [];
  for (const root of paths) {
    for (const file of walk(root)) {
      for (const hit of findLeaks(readFileSync(file, 'utf8'), privatePatterns)) {
        results.push({ file, ...hit });
      }
    }
  }
  return results;
}

// CI(GitHub Actions는 CI=true)에서 비공개 목록이 비면 비밀값이 빠진 것이므로 통과시키지 않는다.
export function missingDenylistError(env, count) {
  if (env.CI && count === 0) return 'leak-check: CI에서 비공개 목록이 비어 있습니다. 저장소 비밀값 LEAK_DENYLIST를 확인하세요.';
  return null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const paths = process.argv.slice(2);
  const patterns = loadPrivatePatterns();
  const missing = missingDenylistError(process.env, patterns.length);
  if (missing) {
    console.log(missing);
    process.exit(1);
  }
  const results = scanPaths(paths, patterns);
  console.log(`leak-check: 비공개 목록 ${patterns.length}개, 검사 경로 ${paths.join(' ')}`);
  for (const r of results) console.log(`LEAK ${r.file}:${r.line} ${r.rule}`);
  if (results.length > 0) {
    console.log(`leak-check: ${results.length}건 발견`);
    process.exit(1);
  }
  console.log('leak-check: 0건');
}
```

`scripts/link-check.mjs`:

```js
#!/usr/bin/env node
// 빌드 결과(dist)의 사이트 안 링크(/로 시작하는 href, src)가 실제 파일과 앵커를 가리키는지 검사한다.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

export function collectRefs(html) {
  return [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
}

export function isInternal(ref) {
  return ref.startsWith('/') && !ref.startsWith('//');
}

export function resolveTarget(distDir, ref) {
  const [pathPart, hash] = ref.split('#');
  const clean = decodeURI(pathPart.split('?')[0]);
  const candidates = clean.endsWith('/')
    ? [join(distDir, clean, 'index.html')]
    : [join(distDir, clean), join(distDir, `${clean}.html`), join(distDir, clean, 'index.html')];
  const file = candidates.find((c) => existsSync(c) && statSync(c).isFile());
  return { file, hash };
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith('.html')) yield path;
  }
}

export function checkDist(distDir) {
  const problems = [];
  for (const page of htmlFiles(distDir)) {
    const html = readFileSync(page, 'utf8');
    const from = relative(distDir, page);
    for (const ref of collectRefs(html)) {
      if (!isInternal(ref)) continue;
      const { file, hash } = resolveTarget(distDir, ref);
      if (!file) problems.push(`${from} -> ${ref} (파일 없음)`);
      else if (hash && file.endsWith('.html') && !readFileSync(file, 'utf8').includes(`id="${hash}"`)) {
        problems.push(`${from} -> ${ref} (앵커 없음)`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = checkDist(process.argv[2] ?? 'dist');
  for (const p of problems) console.log(`BROKEN ${p}`);
  if (problems.length > 0) {
    console.log(`link-check: ${problems.length}건`);
    process.exit(1);
  }
  console.log('link-check: 0건');
}
```

주의: `/projects/?stack=Kafka`처럼 끝이 `/`인 경로에 쿼리가 붙은 링크는 `clean`이 `/projects/`가 되므로 `dist/projects/index.html`이 있으면 통과한다. 테스트의 fixture에는 `projects` 폴더가 없어서 "파일 없음"이 맞다.

`scripts/evidence-check.mjs`:

```js
#!/usr/bin/env node
// 콘텐츠와 데이터 파일의 근거 ID(E-...)가 비공개 근거 파일에 모두 있는지 확인한다.
// 근거 파일은 저장소 밖에 있으므로, 없으면(CI) 건너뛴다.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export function extractEvidenceIds(text) {
  const ids = [];
  for (const line of text.split('\n')) {
    if (!line.includes('evidence')) continue;
    for (const m of line.matchAll(/E-[a-z0-9-]+/g)) ids.push(m[0]);
  }
  return ids;
}

export function extractKnownIds(markdown) {
  return new Set([...markdown.matchAll(/^\|\s*(E-[a-z0-9-]+)\s*\|/gm)].map((m) => m[1]));
}

function* files(dir, exts) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path, exts);
    else if (exts.some((e) => name.endsWith(e))) yield path;
  }
}

export function findMissing(dirs, known) {
  const missing = [];
  for (const dir of dirs) {
    for (const file of files(dir, ['.mdx', '.ts'])) {
      for (const id of extractEvidenceIds(readFileSync(file, 'utf8'))) {
        if (!known.has(id)) missing.push(`${file}: ${id}`);
      }
    }
  }
  return missing;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.env.PORTFOLIO_PRIVATE_DIR ?? '../portfolio-private';
  const file = join(dir, 'evidence.md');
  if (!existsSync(file)) {
    console.log('evidence-check: 비공개 근거 파일이 없어 건너뜁니다');
    process.exit(0);
  }
  const known = extractKnownIds(readFileSync(file, 'utf8'));
  const missing = findMissing(['src/content', 'src/data', 'src/lib'], known);
  for (const m of missing) console.log(`MISSING ${m}`);
  if (missing.length > 0) {
    console.log(`evidence-check: ${missing.length}건`);
    process.exit(1);
  }
  console.log(`evidence-check: 근거 ${known.size}개, 누락 0건`);
}
```

- [ ] Step 4: 테스트를 돌려 통과를 확인한다

Run: `npx vitest run tests/unit/leak-check.test.ts tests/unit/link-check.test.ts tests/unit/evidence-check.test.ts`
Expected: 모두 통과

- [ ] Step 5: 로컬 비공개 목록을 만들고 저장소 전체를 검사한다

비공개 근거 파일의 "공개 전 검사 비공개 목록" 절과 "추가 비공개 목록" 줄에서 값만 뽑아 `.leak-denylist`를 만든다. 이 파일은 `.gitignore`에 있어 올라가지 않는다.

```bash
python3 - <<'EOF'
import pathlib, re
src = pathlib.Path('../portfolio-private/evidence.md').read_text()
section = src.split('### 공개 전 검사 비공개 목록', 1)[1].split('\n### ', 1)[0]
items = []
for line in section.splitlines():
    if line.startswith('- ') and not line.startswith('- 티켓 키'):
        items += re.findall(r'`([^`]+)`', line)
for line in src.splitlines():
    if line.startswith('- 추가 비공개 목록:'):
        items += re.findall(r'`([^`]+)`', line)
items = [i for i in dict.fromkeys(items) if i not in ('LEAK_DENYLIST', '.leak-denylist')]
pathlib.Path('.leak-denylist').write_text('\n'.join(items) + '\n')
print(len(items), 'patterns')
EOF
git check-ignore .leak-denylist
npm run leak
```

Expected: `patterns` 개수가 20개 이상, `git check-ignore`가 `.leak-denylist`를 출력, `leak-check: 0건`

- [ ] Step 6: 커밋한다

```bash
git add scripts tests/unit/leak-check.test.ts tests/unit/link-check.test.ts tests/unit/evidence-check.test.ts
git commit -F - <<'EOF'
feat: 공개 전 검사(사내 정보, 링크, 근거) 스크립트 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 3: 기본 레이아웃, 헤더, 메뉴, 404, 예전 주소 넘김

Files:
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/lib/nav.ts`, `src/lib/legacy-redirects.ts`, `src/lib/teams.ts`, `src/data/profile.ts`, `src/components/BaseHead.astro`, `src/components/SiteHeader.astro`, `src/components/SocialLinks.astro`, `src/components/SectionLabel.astro`, `src/layouts/BaseLayout.astro`, `src/pages/404.astro`, `src/pages/about.astro`, `src/pages/career.astro`, `src/pages/projects/index.astro`, `src/pages/troubleshooting.astro`, `src/pages/contact.astro`, `public/projects/twitteranalysis.html`
- Modify: `src/pages/index.astro`
- Test: `tests/unit/nav.test.ts`, `tests/unit/legacy-redirects.test.ts`, `tests/e2e/layout.spec.ts`

Interfaces:
- Consumes: 없음
- Produces:
  - `NAV: readonly { href: string; label: string }[]`, `isCurrent(href: string, pathname: string): boolean`
  - `LEGACY_HASH_TARGETS: Record<string, string>`, `legacyTarget(hash: string): string | null`
  - `type Team = 'global' | 'retention' | 'purchase'`, `TEAMS`, `TEAM_LABEL`, `type Status = 'done' | 'in-progress' | 'proposed'`, `STATUS_LABEL`
  - `profile` 객체(`nameKo`, `nameEn`, `role`, `intro`, `workStyle`, `roles`, `about`, `links`)
  - `BaseLayout` props: `title: string`, `description: string`, `ogImage?: string`, `variant?: 'hero' | 'bar'`, 이름 있는 슬롯 `typed`
  - `SectionLabel` props: `text: string`, `level?: 1 | 2`(기본 2. 페이지의 첫 라벨은 1을 넘겨 `h1`이 되게 한다)
  - CSS 클래스: `.team`, `.team--global|retention|purchase`, `.status`, `.chips`, `.prose`, `.visually-hidden`, `.section-label`

- [ ] Step 1: 실패하는 단위 테스트를 쓴다

`tests/unit/nav.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isCurrent, NAV } from '../../src/lib/nav';

describe('NAV', () => {
  it('메뉴는 6개다', () => {
    expect(NAV.map((n) => n.label)).toEqual(['Home', 'About', 'Career', 'Projects', 'Troubleshooting', 'Contact']);
  });
});

describe('isCurrent', () => {
  it('하위 경로에서도 상위 메뉴를 현재로 본다', () => {
    expect(isCurrent('/projects/', '/projects/benefit-home/')).toBe(true);
    expect(isCurrent('/about/', '/about')).toBe(true);
  });
  it('Home은 첫 화면에서만 현재다', () => {
    expect(isCurrent('/', '/')).toBe(true);
    expect(isCurrent('/', '/about/')).toBe(false);
  });
});
```

`tests/unit/legacy-redirects.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { legacyTarget } from '../../src/lib/legacy-redirects';

describe('legacyTarget', () => {
  it.each([
    ['#about', '/about/'],
    ['#education', '/about/'],
    ['#skills', '/about/'],
    ['#experience', '/career/'],
    ['#roadmap', '/career/'],
    ['#portfolio', '/projects/'],
    ['#contacts', '/contact/'],
  ])('%s → %s', (hash, target) => {
    expect(legacyTarget(hash)).toBe(target);
  });

  it('모르는 해시는 넘기지 않는다', () => {
    expect(legacyTarget('#header')).toBeNull();
    expect(legacyTarget('')).toBeNull();
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/nav.test.ts tests/unit/legacy-redirects.test.ts`
Expected: 모듈이 없어 실패

- [ ] Step 3: 라이브러리와 데이터를 쓴다

`src/lib/nav.ts`:

```ts
export type NavItem = { href: string; label: string };

export const NAV: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/career/', label: 'Career' },
  { href: '/projects/', label: 'Projects' },
  { href: '/troubleshooting/', label: 'Troubleshooting' },
  { href: '/contact/', label: 'Contact' },
];

export function isCurrent(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname === href.slice(0, -1) || pathname.startsWith(href);
}
```

`src/lib/legacy-redirects.ts`:

```ts
// 예전 사이트는 한 페이지 안의 해시로 섹션을 열었다. 그 링크를 새 주소로 넘긴다.
export const LEGACY_HASH_TARGETS: Readonly<Record<string, string>> = {
  '#about': '/about/',
  '#education': '/about/',
  '#skills': '/about/',
  '#experience': '/career/',
  '#roadmap': '/career/',
  '#portfolio': '/projects/',
  '#contacts': '/contact/',
};

export function legacyTarget(hash: string): string | null {
  return LEGACY_HASH_TARGETS[hash] ?? null;
}
```

`src/lib/teams.ts`:

```ts
export type Team = 'global' | 'retention' | 'purchase';
export const TEAMS: readonly Team[] = ['global', 'retention', 'purchase'];
export const TEAM_LABEL: Record<Team, string> = { global: 'Global', retention: 'Retention', purchase: 'Purchase' };

export type Status = 'done' | 'in-progress' | 'proposed';
export const STATUS_LABEL: Record<Status, string> = { done: '완료', 'in-progress': '진행 중', proposed: '제안·검토 중' };
```

`src/data/profile.ts`:

```ts
export const profile = {
  nameKo: '지예환',
  nameEn: 'Ewan Jee',
  role: 'Back-end Engineer',
  intro: '무신사에서 주문, 클레임, 배송 도메인을 담당합니다.',
  workStyle:
    '일할 때 효율과 기록을 중요하게 생각합니다. 이 업무를 모르는 사람이 같은 일을 맡아도 빠르게 해낼 수 있도록 고려하며 일합니다.',
  roles: ['a Product Engineer', 'a Backend Developer', 'building order & claim systems', 'tracing incidents to the root'],
  about:
    '운영자가 개발과 배포 없이 혜택을 편성하는 시스템을 만들고, API Gateway 단계 전환과 Redis 장애 재현·복구를 해 온 Java·Kotlin 백엔드 엔지니어입니다. 요구사항을 API 계약, ADR(아키텍처 결정 기록), 관측 지표로 구체화하고, AI 자동화로 구현과 검증의 반복 시간을 줄입니다.',
  links: {
    email: 'ewancareer@gmail.com',
    github: 'https://github.com/EwanJee',
    linkedin: 'https://www.linkedin.com/in/ewan-jee-191854242/',
    blog: 'https://ewanjee.tistory.com',
  },
} as const;
```

- [ ] Step 4: 단위 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/nav.test.ts tests/unit/legacy-redirects.test.ts`
Expected: 모두 통과

- [ ] Step 5: 스타일을 쓴다

`src/styles/tokens.css`:

```css
:root {
  --bg: #010e1b;
  --panel: #09203a;
  --accent: #12d640;
  --accent-dark: #1c7d32;
  --text: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.72);
  --text-faint: rgba(255, 255, 255, 0.55);
  --team-global: #5dade2;
  --team-retention: #f5b041;
  --team-purchase: #c39bd3;
  --team-other: rgba(255, 255, 255, 0.45);
  --font-sans: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
  --font-display: 'Poppins', 'Pretendard Variable', Pretendard, sans-serif;
  --gutter: 132px;
  --measure: 40em;
  /* 헤더와 본문의 왼쪽 끝을 맞춘다: 화면이 1280px보다 넓으면 본문 최대 폭 기준으로 안쪽 여백을 늘린다. */
  --edge: max(var(--gutter), calc((100% - 1280px) / 2 + var(--gutter)));
}

@media (max-width: 720px) {
  :root {
    --gutter: 20px;
  }
}
```

`src/styles/global.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
html { background: var(--bg); color: var(--text); font-family: var(--font-sans); font-size: 16px; line-height: 1.7; -webkit-text-size-adjust: 100%; word-break: keep-all; overflow-wrap: break-word; }
body { margin: 0; min-height: 100vh; }
a { color: inherit; }
img { max-width: 100%; height: auto; display: block; }
a:focus-visible, button:focus-visible, input:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 16px; top: 12px; background: var(--panel); padding: 6px 10px; z-index: 100; }
.main { padding: 26px var(--gutter) 80px; max-width: 1280px; margin: 0 auto; }
.main--hero { padding: 0; max-width: none; }
.muted { color: var(--text-muted); }

/* 첫 화면 */
.hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 60px var(--edge); }
.hero-name { font-size: clamp(38px, 6vw, 54px); font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.hero-name small { font-family: var(--font-display); font-size: 0.37em; font-weight: 500; color: var(--text-faint); margin-left: 12px; }
.typed { font-family: var(--font-display); font-size: 24px; margin: 18px 0 0; min-height: 40px; white-space: pre-wrap; }
.typed-role { color: var(--accent); border-bottom: 2px solid var(--accent-dark); padding-bottom: 6px; }
.typed-cursor { opacity: 1; }
.typed-cursor.is-blinking { animation: typed-blink 0.7s infinite; }
.typed[data-pending] { animation: typed-reveal 0.01s 1.5s both; }
@keyframes typed-blink { 50% { opacity: 0; } }
@keyframes typed-reveal { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 720px) { .typed { font-size: 20px; } }
.hero-intro { font-size: 17px; color: var(--text-muted); margin: 12px 0 0; }
.hero .site-nav { margin-top: 34px; }
.hero-work { margin: 38px 0 0; max-width: 640px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8); border-left: 2px solid var(--accent); padding-left: 12px; }

/* 메뉴 */
.site-nav ul { display: flex; flex-wrap: wrap; gap: 8px 26px; list-style: none; margin: 0; padding: 0; }
.site-nav a { font-family: var(--font-display); font-size: 15px; text-decoration: none; position: relative; display: inline-block; padding-bottom: 5px; }
.site-nav a::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease; }
.site-nav a:hover::after, .site-nav a[aria-current='page']::after { transform: scaleX(1); }
.site-nav a[aria-current='page'] { color: var(--accent); }

/* 소셜 */
.social { display: flex; gap: 10px; margin: 30px 0 0; list-style: none; padding: 0; }
.social a { width: 38px; height: 38px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 12px; text-decoration: none; transition: transform 0.2s; }
.social a:hover { background: var(--accent-dark); transform: translateY(-2px); }

/* 위로 붙은 헤더 */
.bar { background: var(--panel); min-height: 78px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; padding: 14px var(--edge); }
.bar-name { font-size: 24px; font-weight: 700; text-decoration: none; }

/* 섹션 라벨: 지금 사이트의 대문자 라벨 + 초록 선 */
.section-label { font-family: var(--font-display); font-size: 13px; font-weight: 500; letter-spacing: 0.12em; display: flex; align-items: center; gap: 12px; margin: 26px 0 22px; }
.section-label::after { content: ''; width: 110px; height: 1px; background: var(--accent); transform-origin: left; animation: label-line 0.5s ease 0.2s both; }
@keyframes label-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.prose { max-width: var(--measure); }
.prose p { margin: 0 0 1em; }
.rise { animation: rise 0.35s ease both; }
@keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

/* 팀, 상태, 태그 */
.team { font-family: var(--font-display); font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
.team::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--team-other); }
.team--global::before { background: var(--team-global); }
.team--retention::before { background: var(--team-retention); }
.team--purchase::before { background: var(--team-purchase); }
.status { font-size: 12px; margin-left: 8px; color: var(--accent); }
.chips { list-style: none; padding: 0; margin: 10px 0 0; display: flex; flex-wrap: wrap; gap: 6px; }
.chips li { font-size: 12px; padding: 2px 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 999px; }
.chips a { text-decoration: none; }
.chips a:hover { color: var(--accent); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```

- [ ] Step 6: 컴포넌트와 레이아웃을 쓴다

`src/components/BaseHead.astro`:

```astro
---
import { ClientRouter } from 'astro:transitions';

interface Props {
  title: string;
  description: string;
  ogImage: string;
}

const { title, description, ogImage } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogUrl = new URL(ogImage, Astro.site);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="theme-color" content="#010e1b" />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogUrl} />
<meta name="twitter:card" content="summary_large_image" />
{/* View Transitions를 지원하지 않는 브라우저는 애니메이션 없이 페이지만 바꾼다(설계 4장). */}
<ClientRouter fallback="none" />
```

`src/components/SocialLinks.astro`:

```astro
---
import { profile } from '../data/profile';

const items = [
  { href: profile.links.linkedin, label: 'in', name: 'LinkedIn', external: true },
  { href: profile.links.github, label: 'GH', name: 'GitHub', external: true },
  { href: `mailto:${profile.links.email}`, label: '@', name: '이메일', external: false },
  { href: profile.links.blog, label: 'T', name: '기술 블로그', external: true },
];
---
<ul class="social">
  {items.map((i) => (
    <li>
      <a href={i.href} aria-label={i.name} target={i.external ? '_blank' : undefined} rel={i.external ? 'noopener noreferrer' : undefined}>{i.label}</a>
    </li>
  ))}
</ul>
```

`src/components/SectionLabel.astro`:

```astro
---
interface Props {
  text: string;
  level?: 1 | 2;
}
const { text, level = 2 } = Astro.props;
const Tag = level === 1 ? 'h1' : 'h2';
---
<Tag class="section-label">{text}</Tag>
```

`src/components/SiteHeader.astro`:

```astro
---
import { NAV, isCurrent } from '../lib/nav';
import { profile } from '../data/profile';
import SocialLinks from './SocialLinks.astro';

interface Props {
  variant: 'hero' | 'bar';
}

const { variant } = Astro.props;
const path = Astro.url.pathname;
---
{variant === 'hero' ? (
  <header class="hero">
    <h1 class="hero-name" transition:name="site-name">{profile.nameKo}<small>{profile.nameEn}</small></h1>
    <slot name="typed" />
    <p class="hero-intro">{profile.intro}</p>
    <nav class="site-nav" aria-label="주 메뉴" transition:name="site-nav">
      <ul>
        {NAV.map((item) => (
          <li><a href={item.href} aria-current={isCurrent(item.href, path) ? 'page' : undefined}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
    <SocialLinks />
    <p class="hero-work">{profile.workStyle}</p>
  </header>
) : (
  <header class="bar">
    <a class="bar-name" href="/" transition:name="site-name">{profile.nameKo}</a>
    <nav class="site-nav" aria-label="주 메뉴" transition:name="site-nav">
      <ul>
        {NAV.map((item) => (
          <li><a href={item.href} aria-current={isCurrent(item.href, path) ? 'page' : undefined}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
  </header>
)}
```

`src/layouts/BaseLayout.astro`:

```astro
---
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '../styles/tokens.css';
import '../styles/global.css';
import BaseHead from '../components/BaseHead.astro';
import SiteHeader from '../components/SiteHeader.astro';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  variant?: 'hero' | 'bar';
}

const { title, description, ogImage = '/open-graph/index.png', variant = 'bar' } = Astro.props;
---
<html lang="ko">
  <head>
    <BaseHead title={title} description={description} ogImage={ogImage} />
  </head>
  <body>
    <a class="skip-link" href="#main">본문으로 건너뛰기</a>
    <SiteHeader variant={variant}><slot name="typed" slot="typed" /></SiteHeader>
    <main id="main" class={variant === 'hero' ? 'main main--hero' : 'main rise'}><slot /></main>
  </body>
</html>
```

- [ ] Step 7: 페이지를 쓴다

`src/pages/index.astro`(임시 파일을 바꾼다):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { profile } from '../data/profile';
import { LEGACY_HASH_TARGETS } from '../lib/legacy-redirects';
---
<BaseLayout title="지예환 | Back-end Engineer" description={profile.intro} variant="hero">
  <p slot="typed" class="typed">I am <span class="typed-role">{profile.roles[0]}</span></p>
  <script is:inline define:vars={{ targets: LEGACY_HASH_TARGETS }}>
    const target = targets[window.location.hash];
    if (target) window.location.replace(target);
  </script>
</BaseLayout>
```

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
---
<BaseLayout title="페이지를 찾을 수 없습니다 | 지예환" description="요청한 페이지가 없습니다.">
  <SectionLabel text="NOT FOUND" level={1} />
  <p class="prose">요청한 페이지가 없습니다. <a href="/">첫 화면으로 돌아가기</a></p>
</BaseLayout>
```

아래 다섯 페이지는 이후 작업에서 내용을 채운다. 지금은 메뉴 링크가 깨지지 않게 라벨과 한 문장만 둔다.

`src/pages/about.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { profile } from '../data/profile';
---
<BaseLayout title="About | 지예환" description={profile.intro} ogImage="/open-graph/about.png">
  <SectionLabel text="ABOUT" level={1} />
  <p class="prose">{profile.about}</p>
</BaseLayout>
```

`src/pages/career.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
---
<BaseLayout title="Career | 지예환" description="Global, Retention, Purchase 팀에서 한 일" ogImage="/open-graph/career.png">
  <SectionLabel text="CAREER" level={1} />
  <p class="prose">Global, Retention 팀을 거쳐 지금은 Purchase 팀에서 주문, 클레임, 배송을 맡고 있습니다.</p>
</BaseLayout>
```

`src/pages/projects/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
---
<BaseLayout title="Projects | 지예환" description="사례 7개와 개인 프로젝트" ogImage="/open-graph/projects.png">
  <SectionLabel text="PROJECTS" level={1} />
  <p class="prose">무신사에서 한 일과 개인 프로젝트를 모았습니다.</p>
</BaseLayout>
```

`src/pages/troubleshooting.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
---
<BaseLayout title="Troubleshooting | 지예환" description="장애와 오류를 찾아 고친 기록" ogImage="/open-graph/troubleshooting.png">
  <SectionLabel text="TROUBLESHOOTING" level={1} />
  <p class="prose">장애와 오류를 찾아 고친 기록입니다.</p>
</BaseLayout>
```

`src/pages/contact.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { profile } from '../data/profile';
---
<BaseLayout title="Contact | 지예환" description="이메일, GitHub, LinkedIn, 블로그로 연락할 수 있습니다." ogImage="/open-graph/contact.png">
  <SectionLabel text="CONTACT" level={1} />
  <p class="prose"><a href={`mailto:${profile.links.email}`}>{profile.links.email}</a></p>
</BaseLayout>
```

`public/projects/twitteranalysis.html`(예전 프레디저 상세 주소를 경력으로 넘긴다):

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=/career/" />
    <link rel="canonical" href="https://ewanjee.com/career/" />
    <title>경력으로 이동</title>
  </head>
  <body><a href="/career/">경력 페이지로 이동</a></body>
</html>
```

- [ ] Step 8: 화면 테스트를 쓴다

`tests/e2e/layout.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/about/', '/career/', '/projects/', '/troubleshooting/', '/contact/', '/404.html'];

test('첫 화면: 이름, 한 줄 소개, 메뉴 6개, 소셜 4개, 일하는 방식', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('지예환');
  await expect(page.getByText('무신사에서 주문, 클레임, 배송 도메인을 담당합니다.')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a')).toHaveCount(6);
  const social = page.locator('.social a');
  await expect(social).toHaveCount(4);
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('target', '_blank');
  await expect(page.locator('.social a[aria-label="GitHub"]')).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('.hero-work')).toContainText('효율과 기록');
});

test('다른 페이지: 위로 붙은 헤더와 현재 메뉴 표시', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('header.bar')).toBeVisible();
  await expect(page.locator('nav[aria-label="주 메뉴"] a[aria-current="page"]')).toHaveText('About');
  await expect(page.locator('h1')).toHaveText('ABOUT');
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

test('모든 주요 주소에서 가로 스크롤이 없다', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
});
```

- [ ] Step 9: 빌드하고 모든 검사를 돌린다

```bash
npm run build && npm run test:e2e -- tests/e2e/layout.spec.ts
npm run links && npm run leak
```

Expected: 화면 테스트 모두 통과(desktop, mobile), `link-check: 0건`, `leak-check: 0건`

- [ ] Step 10: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
feat: 지금 사이트 틀의 레이아웃, 헤더, 메뉴, 예전 주소 넘김

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 4: 첫 화면 타이핑

Files:
- Create: `src/lib/typewriter.ts`, `src/islands/Typewriter.tsx`
- Modify: `src/pages/index.astro`
- Test: `tests/unit/typewriter.test.ts`, `tests/unit/Typewriter.test.tsx`, `tests/e2e/home.spec.ts`

Interfaces:
- Consumes: `profile.roles`
- Produces: `typewriterSteps(roles: readonly string[], rand?: () => number): Generator<{ state: TypeState; wait: number }>`, `finalState(roles): TypeState`, `humanize(speed, rand?)`, 상수 `TYPE_SPEED=65`, `BACK_DELAY=700`, `OPENING_PAUSE=1500`, `START_DELAY=500`. 컴포넌트 `Typewriter({ roles: string[] })`(보이는 글자는 `.typed-visible` 안, 화면 낭독기용 전체 문구는 `.visually-hidden` 안).

- [ ] Step 1: 실패하는 테스트를 쓴다

`tests/unit/typewriter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { BACK_DELAY, finalState, humanize, OPENING_PAUSE, START_DELAY, TYPE_SPEED, typewriterSteps } from '../../src/lib/typewriter';

const roles = ['a Product Engineer', 'a Backend Developer'];
const take = (n: number, rand = () => 0) => {
  const gen = typewriterSteps(roles, rand);
  return Array.from({ length: n }, () => gen.next().value);
};

describe('humanize', () => {
  it('Typed.js처럼 speed ~ speed×1.5 사이다', () => {
    expect(humanize(65, () => 0)).toBe(65);
    expect(humanize(65, () => 0.999)).toBe(97);
  });
});

describe('typewriterSteps', () => {
  it('지금 사이트 문구로 시작해 역할을 입력한다', () => {
    const steps = take(18);
    expect(steps[0]).toEqual({ state: { prefix: 'I will be A ', role: '', blinking: true }, wait: START_DELAY });
    expect(steps[16].state).toEqual({ prefix: 'I will be A ', role: 'Server Developer', blinking: false });
    expect(steps[17]).toEqual({ state: { prefix: 'I will be A ', role: 'Server Developer', blinking: true }, wait: OPENING_PAUSE });
  });

  it('"will be A"를 지우고 "am"으로 고친 뒤 첫 역할을 입력한다', () => {
    const steps = take(200);
    const firstAm = steps.findIndex((s) => s.state.prefix === 'I am ');
    expect(firstAm).toBeGreaterThan(17);
    expect(steps[firstAm].state.role).toBe('');
    const typed = steps.find((s) => s.state.prefix === 'I am ' && s.state.role === 'a Product Engineer' && s.state.blinking);
    expect(typed?.wait).toBe(BACK_DELAY);
    expect(steps.every((s) => s.state.blinking || s.wait >= TYPE_SPEED)).toBe(true);
  });

  it('역할을 차례로 돌고 처음으로 돌아온다', () => {
    const shown = take(400).filter((s) => s.state.blinking && s.state.prefix === 'I am ').map((s) => s.state.role);
    expect(shown.slice(0, 3)).toEqual(['a Product Engineer', 'a Backend Developer', 'a Product Engineer']);
  });

  it('최종 상태는 첫 역할이다', () => {
    expect(finalState(roles)).toEqual({ prefix: 'I am ', role: 'a Product Engineer', blinking: false });
  });
});
```

`tests/unit/Typewriter.test.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Typewriter from '../../src/islands/Typewriter';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('Typewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('처음 HTML에는 최종 문구가 들어 있다(스크립트가 없을 때 보이는 값)', () => {
    const html = renderToString(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    expect(html).toContain('a Product Engineer');
    expect(html).toContain('data-pending');
  });

  it('동작 줄이기: 첫 역할에 멈춰 있고 바로 보인다', () => {
    mockReducedMotion(true);
    const { container } = render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container.querySelector('.typed-visible')?.textContent).toContain('I am a Product Engineer');
    expect(container.querySelector('.typed')?.hasAttribute('data-pending')).toBe(false);
  });

  it('움직임: 지금 사이트 문구로 시작한다', () => {
    mockReducedMotion(false);
    const { container } = render(<Typewriter roles={['a Product Engineer']} />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(container.querySelector('.typed-visible')?.textContent).toContain('I will be A S');
  });

  it('화면 낭독기에는 모든 역할을 한 번에 알려 준다', () => {
    mockReducedMotion(true);
    render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    expect(screen.getByText('I am a Product Engineer, a Backend Developer')).toBeTruthy();
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/typewriter.test.ts tests/unit/Typewriter.test.tsx`
Expected: 모듈이 없어 실패

- [ ] Step 3: 구현한다

`src/lib/typewriter.ts`:

```ts
// 지금 사이트의 Typed.js 설정(typeSpeed 65, backSpeed 65, backDelay 700)과 같은 타이밍을 만든다.
export type TypeState = { prefix: string; role: string; blinking: boolean };
export type Step = { state: TypeState; wait: number };

export const TYPE_SPEED = 65;
export const BACK_DELAY = 700;
export const OPENING_PAUSE = 1500;
export const START_DELAY = 500;
export const OPENING_PREFIX = 'I will be A ';
export const OPENING_ROLE = 'Server Developer';
export const FINAL_PREFIX = 'I am ';

export function humanize(speed: number, rand: () => number = Math.random): number {
  return Math.round((rand() * speed) / 2) + speed;
}

export function finalState(roles: readonly string[]): TypeState {
  return { prefix: FINAL_PREFIX, role: roles[0] ?? '', blinking: false };
}

export function* typewriterSteps(roles: readonly string[], rand: () => number = Math.random): Generator<Step, never, undefined> {
  if (roles.length === 0) throw new Error('roles가 비어 있습니다');
  const typing = () => humanize(TYPE_SPEED, rand);
  let prefix = OPENING_PREFIX;
  let role = '';

  yield { state: { prefix, role, blinking: true }, wait: START_DELAY };
  for (const ch of OPENING_ROLE) {
    role += ch;
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  yield { state: { prefix, role, blinking: true }, wait: OPENING_PAUSE };
  while (role.length > 0) {
    role = role.slice(0, -1);
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  while (prefix.length > 2) {
    prefix = prefix.slice(0, -1);
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  for (const ch of FINAL_PREFIX.slice(2)) {
    prefix += ch;
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  for (let i = 0; ; i = (i + 1) % roles.length) {
    for (const ch of roles[i]) {
      role += ch;
      yield { state: { prefix, role, blinking: false }, wait: typing() };
    }
    yield { state: { prefix, role, blinking: true }, wait: BACK_DELAY };
    while (role.length > 0) {
      role = role.slice(0, -1);
      yield { state: { prefix, role, blinking: false }, wait: typing() };
    }
  }
}
```

`src/islands/Typewriter.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { finalState, typewriterSteps, type TypeState } from '../lib/typewriter';

type Props = { roles: string[] };

// HTML에는 최종 문구를 넣어 두고(스크립트가 없어도 보이게), 살아나면 지금 사이트 문구부터 다시 입력한다.
// 살아나기 전 최대 1.5초는 data-pending으로 숨겨서 최종 문구가 잠깐 보였다 바뀌는 깜빡임을 막는다.
export default function Typewriter({ roles }: Props) {
  const [state, setState] = useState<TypeState>(() => finalState(roles));
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLive(true);
      return;
    }
    const steps = typewriterSteps(roles);
    let timer = 0;
    const tick = () => {
      const next = steps.next();
      if (next.done) return;
      setState(next.value.state);
      timer = window.setTimeout(tick, next.value.wait);
    };
    setLive(true);
    tick();
    return () => window.clearTimeout(timer);
  }, [roles]);

  return (
    <p className="typed" data-pending={live ? undefined : ''}>
      <span className="visually-hidden">{`I am ${roles.join(', ')}`}</span>
      <span className="typed-visible" aria-hidden="true">
        {state.prefix}
        <span className="typed-role">{state.role}</span>
        <span className={state.blinking ? 'typed-cursor is-blinking' : 'typed-cursor'}>|</span>
      </span>
    </p>
  );
}
```

`src/pages/index.astro`의 임시 타이핑 줄을 바꾼다.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Typewriter from '../islands/Typewriter';
import { profile } from '../data/profile';
import { LEGACY_HASH_TARGETS } from '../lib/legacy-redirects';
---
<BaseLayout title="지예환 | Back-end Engineer" description={profile.intro} variant="hero">
  <Typewriter slot="typed" client:load roles={[...profile.roles]} />
  <script is:inline define:vars={{ targets: LEGACY_HASH_TARGETS }}>
    const target = targets[window.location.hash];
    if (target) window.location.replace(target);
  </script>
</BaseLayout>
```

- [ ] Step 4: 단위 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/typewriter.test.ts tests/unit/Typewriter.test.tsx`
Expected: 모두 통과

- [ ] Step 5: 화면 테스트를 쓴다

`tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

// 화면 낭독기용 전체 문구(.visually-hidden)에도 "I am a"가 있으므로, 보이는 글자(.typed-visible)만 확인한다.
test('움직임: 지금 사이트 문구로 시작해 I am으로 고친다', async ({ page }) => {
  await page.goto('/');
  const visible = page.locator('.typed-visible');
  await expect(visible).toContainText('I will be A', { timeout: 4000 });
  await expect(visible).toContainText('I am a', { timeout: 12000 });
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
```

- [ ] Step 6: 빌드하고 화면 테스트를 돌린다

Run: `npm run build && npm run test:e2e -- tests/e2e/home.spec.ts tests/e2e/layout.spec.ts`
Expected: 모두 통과

- [ ] Step 7: 목업과 비교한다

`../.superpowers/brainstorm/1439-1790493826/content/motion-3.html`을 브라우저로 열고, `http://localhost:4321/`(빌드 후 `python3 -m http.server 4321 --directory dist`)과 나란히 본다. 흰 앞말, 초록 글자와 초록 밑줄, 커서 깜빡임, 속도가 같은지 확인한다.

- [ ] Step 8: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
feat: 지금 사이트와 같은 방식의 첫 화면 타이핑(I will be → I am)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 5: 사례 화면 캡처와 움직이는 화면(GIF)

Files:
- Create: `scripts/media/capture-benefit-home.mjs`, `scripts/media/capture-chatbot.mjs`
- Create(생성물): `public/media/benefit-home.gif`, `public/media/chatbot.gif`, `src/assets/cases/benefit-home.jpg`, `src/assets/cases/chatbot.jpg`
- Test: `tests/unit/media.test.ts`

Interfaces:
- Consumes: 환경 변수 `CHATBOT_REPO_DIR`(챗봇 저장소 경로, 비공개 근거 파일의 "작업용 경로" 참고)
- Produces: 사례 콘텐츠가 참조하는 파일 `/media/benefit-home.gif`, `/media/chatbot.gif`, `src/assets/cases/benefit-home.jpg`, `src/assets/cases/chatbot.jpg`

- [ ] Step 1: 실패하는 예산 테스트를 쓴다

`tests/unit/media.test.ts`:

```ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = 'public/media';
const gifs = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.gif')) : [];

describe('움직이는 화면(GIF) 예산', () => {
  it('GIF가 하나 이상 있다', () => {
    expect(gifs.length).toBeGreaterThan(0);
  });

  it.each(gifs)('%s: 2MB 이하, 가로 240~320px', (name) => {
    const path = join(DIR, name);
    expect(statSync(path).size).toBeLessThanOrEqual(2 * 1024 * 1024);
    const buf = readFileSync(path);
    expect(buf.subarray(0, 3).toString()).toBe('GIF');
    const width = buf.readUInt16LE(6);
    expect(width).toBeGreaterThanOrEqual(240);
    expect(width).toBeLessThanOrEqual(320);
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/media.test.ts`
Expected: `GIF가 하나 이상 있다`가 실패

- [ ] Step 3: 혜택홈 캡처 스크립트를 쓴다

`scripts/media/capture-benefit-home.mjs`:

```js
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
mkdirSync('public/media', { recursive: true });
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
  'public/media/benefit-home.gif',
], { stdio: 'inherit' });
// 정지 이미지: 화면 두 장 높이(1688px). 카드에서는 마우스를 올리면 아래로 넘어가고, 사례 페이지에서는 윗부분만 보인다.
execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-i', tall, '-vf', 'crop=390:1688:0:0', '-q:v', '3', 'src/assets/cases/benefit-home.jpg'], { stdio: 'inherit' });
console.log('benefit-home: public/media/benefit-home.gif, src/assets/cases/benefit-home.jpg');
```

- [ ] Step 4: 챗봇 녹화 스크립트를 쓴다

`scripts/media/capture-chatbot.mjs`:

```js
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
```

- [ ] Step 5: 두 스크립트를 돌린다

```bash
node scripts/media/capture-benefit-home.mjs
CHATBOT_REPO_DIR="<비공개 근거 파일의 CHATBOT_REPO_DIR 값>" node scripts/media/capture-chatbot.mjs
ls -la public/media src/assets/cases
```

Expected: GIF 2개, JPG 2개

- [ ] Step 6: 결과를 눈으로 확인한다

각 GIF에서 프레임 하나씩 뽑아 본다. 내용이 비었거나 로그인 화면이면 다시 캡처한다. 개인정보가 보이면 쓰지 않는다. 챗봇 정지 이미지는 일본어 첫 화면이어야 한다(설계 6장). 녹화 중 `누르지 못함:` 경고가 나왔으면 챗봇 화면의 실제 글자를 확인해 `tap` 인자를 고치고 다시 돌린다. 정지 이미지 캡처가 실패하면 비공개 근거 파일 "작업용 경로" 절에 적힌 챗봇 정지 화면 원본을 `src/assets/cases/chatbot.jpg`로 복사한다.

```bash
ffmpeg -nostdin -v error -y -ss 3 -i public/media/benefit-home.gif -frames:v 1 /tmp/bh-frame.png
ffmpeg -nostdin -v error -y -ss 4 -i public/media/chatbot.gif -frames:v 1 /tmp/chatbot-frame.png
```

`/tmp/bh-frame.png`, `/tmp/chatbot-frame.png`, `src/assets/cases/*.jpg`를 열어 확인한다.

챗봇 녹화가 비어 있거나 버튼이 눌리지 않았으면 `public/media/chatbot.gif`를 지운다. Task 8의 `tokyo-popup-chatbot.mdx`에서 `motion:` 줄을 빼고 정지 화면만 쓴다(스키마에서 `motion`은 선택 항목이다).

- [ ] Step 7: 예산 테스트를 돌린다

Run: `npx vitest run tests/unit/media.test.ts`
Expected: 모두 통과. 2MB를 넘으면 해당 스크립트의 `max_colors=96`을 `64`로 바꿔 다시 만든다.

- [ ] Step 8: 커밋한다

```bash
npm run leak
git add scripts/media public/media src/assets/cases tests/unit/media.test.ts
git commit -F - <<'EOF'
feat: 혜택홈·챗봇 화면 캡처와 움직이는 화면(GIF)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 6: 구조 그림 엔진과 그림 5개

Files:
- Create: `src/lib/diagram.ts`, `src/lib/diagrams.ts`, `src/islands/StepDiagram.tsx`
- Modify: `src/styles/global.css`(구조 그림 절 추가)
- Test: `tests/unit/diagram.test.ts`, `tests/unit/StepDiagram.test.tsx`

Interfaces:
- Consumes: 없음
- Produces:
  - `type DiagramId = 'race-condition' | 'signal-pipeline' | 'privacy-flow' | 'alert-flow' | 'restore-state-machine'`
  - `DiagramSpec`, `DiagramStep`(`caption`, `show`, `active`, `danger?`, `muted?`, `edges?`), `nextIndex`, `prevIndex`, `visibleEdges`, `anchors`, `validateSpec`
  - `DIAGRAMS: Record<DiagramId, DiagramSpec>`
  - 컴포넌트 `StepDiagram({ id: DiagramId; mode: 'preview' | 'player' })`. `preview`는 1.4초마다 자동으로 넘기고 버튼이 없다. `player`는 처음·이전·다음 버튼과(있으면) 변형 토글이 있다.

- [ ] Step 1: 실패하는 테스트를 쓴다

`tests/unit/diagram.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { anchors, nextIndex, prevIndex, validateSpec, visibleEdges } from '../../src/lib/diagram';
import { DIAGRAMS } from '../../src/lib/diagrams';

describe('단계 이동', () => {
  it('끝에서 반복하거나 멈춘다', () => {
    expect(nextIndex(1, 5, false)).toBe(2);
    expect(nextIndex(4, 5, false)).toBe(4);
    expect(nextIndex(4, 5, true)).toBe(0);
    expect(prevIndex(0)).toBe(0);
    expect(prevIndex(3)).toBe(2);
  });
});

describe('그림 정의', () => {
  it.each(Object.values(DIAGRAMS))('$id: 없는 노드를 쓰지 않고 그림 밖으로 나가지 않는다', (spec) => {
    expect(validateSpec(spec)).toEqual([]);
  });

  it('경합 그림은 기본 결말이 중복, 유니크 키 결말이 거절이다', () => {
    const spec = DIAGRAMS['race-condition'];
    expect(spec.steps.at(-1)?.danger).toContain('row2');
    expect(spec.variant?.steps.at(-1)?.show).toContain('reject');
  });

  it('단계에 edges가 있으면 그것만 보인다', () => {
    const spec = DIAGRAMS['privacy-flow'];
    expect(visibleEdges(spec, spec.steps[1]).every((e) => e.from === 'api' || e.to === 'api')).toBe(true);
  });
});

describe('anchors', () => {
  const box = (x: number, y: number, w = 100, h = 30) => ({ id: 'n', label: '', x, y, w, h });
  it('가로로 떨어진 상자는 옆면끼리 잇는다', () => {
    expect(anchors(box(0, 0), box(200, 40))).toEqual({ x1: 100, y1: 15, x2: 200, y2: 55 });
  });
  it('가로 범위가 겹치면 아래와 위를 잇는다', () => {
    expect(anchors(box(0, 0), box(50, 100))).toEqual({ x1: 50, y1: 30, x2: 100, y2: 100 });
  });
});
```

`tests/unit/StepDiagram.test.tsx`:

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StepDiagram from '../../src/islands/StepDiagram';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('StepDiagram', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('처음 HTML은 결과가 드러난 마지막 장면이다(스크립트가 없거나 동작 줄이기일 때)', () => {
    const html = renderToString(<StepDiagram id="race-condition" mode="player" />);
    expect(html).toContain('같은 옵션, 같은 상태 (중복)');
    expect(html).toContain('5 / 5.');
  });

  it('재생형은 첫 단계에서 시작하고 다음 버튼으로 넘긴다', () => {
    mockReducedMotion(false);
    render(<StepDiagram id="race-condition" mode="player" />);
    expect(screen.getByText(/1 \/ 5\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText(/2 \/ 5\./)).toBeTruthy();
  });

  it('유니크 키를 켜면 마지막 단계가 거절이 된다', () => {
    mockReducedMotion(false);
    render(<StepDiagram id="race-condition" mode="player" />);
    fireEvent.click(screen.getByRole('checkbox'));
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByRole('button', { name: '다음' }));
    // 그림 안의 "두 번째 INSERT 거절" 글자와 겹치지 않게 설명 문장 전체로 찾는다.
    expect(screen.getByText(/5 \/ 5\..*거절합니다/)).toBeTruthy();
  });

  it('미리보기는 1.4초마다 넘어간다', () => {
    mockReducedMotion(false);
    const { container } = render(<StepDiagram id="alert-flow" mode="preview" />);
    const label = () => container.querySelector('svg')?.getAttribute('aria-label');
    const first = label();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(label()).not.toBe(first);
  });

  it('동작 줄이기에서 미리보기는 마지막 장면에 멈춰 있다', () => {
    mockReducedMotion(true);
    const { container } = render(<StepDiagram id="alert-flow" mode="preview" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toContain('역할별 채널 5개');
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/diagram.test.ts tests/unit/StepDiagram.test.tsx`
Expected: 모듈이 없어 실패

- [ ] Step 3: 엔진을 쓴다

`src/lib/diagram.ts`:

```ts
export type DiagramId = 'race-condition' | 'signal-pipeline' | 'privacy-flow' | 'alert-flow' | 'restore-state-machine';
export type DiagramNode = { id: string; label: string; x: number; y: number; w: number; h: number };
export type DiagramEdge = { from: string; to: string };
export type DiagramStep = {
  caption: string;
  show: string[];
  active: string[];
  danger?: string[];
  muted?: string[];
  edges?: [string, string][];
};
export type DiagramSpec = {
  id: DiagramId;
  title: string;
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  steps: DiagramStep[];
  variant?: { label: string; steps: DiagramStep[] };
};

export function nextIndex(index: number, length: number, loop: boolean): number {
  if (index + 1 < length) return index + 1;
  return loop ? 0 : index;
}

export function prevIndex(index: number): number {
  return Math.max(0, index - 1);
}

export function visibleEdges(spec: DiagramSpec, step: DiagramStep): DiagramEdge[] {
  if (step.edges) return step.edges.map(([from, to]) => ({ from, to }));
  return spec.edges.filter((e) => step.show.includes(e.from) && step.show.includes(e.to));
}

// 가로로 겹치지 않는 상자는 옆면끼리, 겹치면 아랫면과 윗면을 잇는다.
export function anchors(a: DiagramNode, b: DiagramNode) {
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;
  if (a.x + a.w <= b.x) return { x1: a.x + a.w, y1: ay, x2: b.x, y2: by };
  if (b.x + b.w <= a.x) return { x1: a.x, y1: ay, x2: b.x + b.w, y2: by };
  const ax = a.x + a.w / 2;
  const bx = b.x + b.w / 2;
  return by >= ay ? { x1: ax, y1: a.y + a.h, x2: bx, y2: b.y } : { x1: ax, y1: a.y, x2: bx, y2: b.y + b.h };
}

export function validateSpec(spec: DiagramSpec): string[] {
  const ids = new Set(spec.nodes.map((n) => n.id));
  const errors: string[] = [];
  const check = (id: string, where: string) => {
    if (!ids.has(id)) errors.push(`${spec.id}: ${where}에 없는 노드 ${id}`);
  };
  spec.edges.forEach((e) => {
    check(e.from, 'edge');
    check(e.to, 'edge');
  });
  const all = [...spec.steps, ...(spec.variant?.steps ?? [])];
  all.forEach((s, i) => {
    [...s.show, ...s.active, ...(s.danger ?? []), ...(s.muted ?? [])].forEach((id) => check(id, `step ${i}`));
    (s.edges ?? []).forEach(([a, b]) => {
      check(a, `step ${i} edge`);
      check(b, `step ${i} edge`);
    });
    s.active.forEach((id) => {
      if (!s.show.includes(id)) errors.push(`${spec.id}: step ${i}의 active ${id}가 show에 없음`);
    });
  });
  if (spec.steps.length < 2) errors.push(`${spec.id}: 단계가 2개 미만`);
  if (spec.variant && spec.variant.steps.length !== spec.steps.length) errors.push(`${spec.id}: variant 단계 수가 다름`);
  spec.nodes.forEach((n) => {
    if (n.x < 0 || n.y < 0 || n.x + n.w > spec.width || n.y + n.h > spec.height) errors.push(`${spec.id}: ${n.id}가 그림 밖`);
  });
  return errors;
}
```

- [ ] Step 4: 그림 5개를 정의한다

`src/lib/diagrams.ts`:

```ts
import type { DiagramId, DiagramSpec, DiagramStep } from './diagram';

const raceBase: DiagramStep[] = [
  { caption: '두 요청이 거의 동시에 들어옵니다.', show: ['a', 'b'], active: ['a', 'b'] },
  { caption: '각자 다른 잠금을 잡아서 서로를 기다리지 않습니다.', show: ['a', 'b', 'lockA', 'lockB'], active: ['lockA', 'lockB'] },
  { caption: '둘 다 같은 행이 있는지 확인합니다. 아직 커밋 전이라 둘 다 없다고 봅니다.', show: ['a', 'b', 'lockA', 'lockB', 'check'], active: ['check'] },
  { caption: 'A가 먼저 행을 넣습니다.', show: ['a', 'b', 'lockA', 'lockB', 'check', 'row1'], active: ['row1'] },
];

export const DIAGRAMS: Record<DiagramId, DiagramSpec> = {
  'race-condition': {
    id: 'race-condition',
    title: '정산 원장 중복 삽입 과정',
    width: 360,
    height: 244,
    nodes: [
      { id: 'a', label: '서비스 A', x: 20, y: 12, w: 140, h: 32 },
      { id: 'b', label: '서비스 B', x: 200, y: 12, w: 140, h: 32 },
      { id: 'lockA', label: '잠금 A', x: 20, y: 60, w: 140, h: 28 },
      { id: 'lockB', label: '잠금 B', x: 200, y: 60, w: 140, h: 28 },
      { id: 'check', label: '같은 행 있나? 없음', x: 70, y: 106, w: 220, h: 28 },
      { id: 'row1', label: '같은 옵션, 같은 상태', x: 50, y: 152, w: 260, h: 30 },
      { id: 'row2', label: '같은 옵션, 같은 상태 (중복)', x: 50, y: 196, w: 260, h: 30 },
      { id: 'reject', label: '두 번째 INSERT 거절', x: 50, y: 196, w: 260, h: 30 },
    ],
    edges: [
      { from: 'a', to: 'lockA' },
      { from: 'b', to: 'lockB' },
      { from: 'lockA', to: 'check' },
      { from: 'lockB', to: 'check' },
      { from: 'check', to: 'row1' },
      { from: 'check', to: 'row2' },
      { from: 'check', to: 'reject' },
    ],
    steps: [
      ...raceBase,
      { caption: 'B도 행을 넣습니다. 같은 기록이 두 번 쌓였습니다.', show: ['a', 'b', 'lockA', 'lockB', 'check', 'row1', 'row2'], active: ['row2'], danger: ['row2'] },
    ],
    variant: {
      label: '원장 유니크 키 적용',
      steps: [
        ...raceBase,
        { caption: '원장의 유니크 키가 두 번째 INSERT를 거절합니다. 한 행만 남습니다.', show: ['a', 'b', 'lockA', 'lockB', 'check', 'row1', 'reject'], active: ['reject'] },
      ],
    },
  },
  'signal-pipeline': {
    id: 'signal-pipeline',
    title: '이상 신호를 찾아 문장으로 알리는 흐름',
    width: 360,
    height: 246,
    nodes: [
      { id: 'data', label: '주문, 회원 데이터', x: 100, y: 10, w: 160, h: 30 },
      { id: 'views', label: '핵심 지표 뷰 3개', x: 100, y: 58, w: 160, h: 30 },
      { id: 'detect', label: '이상 신호 탐지', x: 100, y: 106, w: 160, h: 30 },
      { id: 'code', label: '수치와 원인: 코드', x: 10, y: 156, w: 160, h: 30 },
      { id: 'llm', label: '문장: LLM', x: 190, y: 156, w: 160, h: 30 },
      { id: 'alert', label: '알림', x: 100, y: 206, w: 160, h: 30 },
    ],
    edges: [
      { from: 'data', to: 'views' },
      { from: 'views', to: 'detect' },
      { from: 'detect', to: 'code' },
      { from: 'detect', to: 'llm' },
      { from: 'code', to: 'alert' },
      { from: 'llm', to: 'alert' },
    ],
    steps: [
      { caption: '주문과 회원 데이터에서 시작합니다.', show: ['data'], active: ['data'] },
      { caption: '요구사항 12개를 핵심 지표 3개로 줄여 뷰로 만듭니다.', show: ['data', 'views'], active: ['views'] },
      { caption: '평소와 다른 움직임(이상 신호)을 찾습니다.', show: ['data', 'views', 'detect'], active: ['detect'] },
      { caption: '수치와 원인은 코드가 정하고, LLM은 문장만 다듬습니다.', show: ['data', 'views', 'detect', 'code', 'llm'], active: ['code', 'llm'] },
      { caption: '정리한 문장을 알림으로 보냅니다.', show: ['data', 'views', 'detect', 'code', 'llm', 'alert'], active: ['alert'] },
    ],
  },
  'privacy-flow': {
    id: 'privacy-flow',
    title: '개인정보 조회 경로 일원화',
    width: 360,
    height: 220,
    nodes: [
      { id: 'f1', label: '기능 1', x: 10, y: 20, w: 110, h: 28 },
      { id: 'f2', label: '기능 2', x: 10, y: 96, w: 110, h: 28 },
      { id: 'f3', label: '기능 3', x: 10, y: 172, w: 110, h: 28 },
      { id: 'api', label: '표준 조회 API', x: 140, y: 96, w: 100, h: 28 },
      { id: 's1', label: '시스템 1', x: 260, y: 20, w: 90, h: 28 },
      { id: 's2', label: '시스템 2', x: 260, y: 72, w: 90, h: 28 },
      { id: 's3', label: '시스템 3', x: 260, y: 124, w: 90, h: 28 },
      { id: 's4', label: '시스템 4', x: 260, y: 176, w: 90, h: 28 },
    ],
    edges: [
      { from: 'f1', to: 's1' },
      { from: 'f1', to: 's2' },
      { from: 'f2', to: 's2' },
      { from: 'f3', to: 's3' },
      { from: 'f3', to: 's4' },
      { from: 'f1', to: 'api' },
      { from: 'f2', to: 'api' },
      { from: 'f3', to: 'api' },
      { from: 'api', to: 's1' },
      { from: 'api', to: 's2' },
      { from: 'api', to: 's3' },
      { from: 'api', to: 's4' },
    ],
    steps: [
      {
        caption: '기능마다 회원 개인정보를 서로 다른 경로로 조회했습니다.',
        show: ['f1', 'f2', 'f3', 's1', 's2', 's3', 's4'],
        active: [],
        edges: [['f1', 's1'], ['f1', 's2'], ['f2', 's2'], ['f3', 's3'], ['f3', 's4']],
      },
      {
        caption: '조회 경로를 표준 API 하나로 모읍니다.',
        show: ['f1', 'f2', 'f3', 'api', 's1', 's2', 's3', 's4'],
        active: ['api'],
        edges: [['f1', 'api'], ['f2', 'api'], ['f3', 'api'], ['api', 's1'], ['api', 's2'], ['api', 's3'], ['api', 's4']],
      },
    ],
  },
  'alert-flow': {
    id: 'alert-flow',
    title: '알림 체계',
    width: 360,
    height: 250,
    nodes: [
      { id: 'src', label: '지표, 로그 수집', x: 100, y: 10, w: 160, h: 30 },
      { id: 'rules', label: '알림 규칙 36개', x: 100, y: 58, w: 160, h: 30 },
      { id: 's1', label: '긴급 19', x: 10, y: 110, w: 100, h: 30 },
      { id: 's2', label: '높음 4', x: 130, y: 110, w: 100, h: 30 },
      { id: 's3', label: '통지 13', x: 250, y: 110, w: 100, h: 30 },
      { id: 'page', label: '담당자 호출', x: 40, y: 166, w: 130, h: 30 },
      { id: 'ch', label: '역할별 채널 5개', x: 190, y: 166, w: 150, h: 30 },
      { id: 'before', label: '흩어진 채널 17개', x: 190, y: 212, w: 150, h: 30 },
    ],
    edges: [
      { from: 'src', to: 'rules' },
      { from: 'rules', to: 's1' },
      { from: 'rules', to: 's2' },
      { from: 'rules', to: 's3' },
      { from: 's1', to: 'page' },
      { from: 's1', to: 'ch' },
      { from: 's2', to: 'ch' },
      { from: 's3', to: 'ch' },
    ],
    steps: [
      { caption: '지표와 로그를 모읍니다.', show: ['src'], active: ['src'] },
      { caption: '심각도별 규칙 36개로 판정합니다.', show: ['src', 'rules'], active: ['rules'] },
      { caption: '긴급 19, 높음 4, 통지 13으로 나눕니다.', show: ['src', 'rules', 's1', 's2', 's3'], active: ['s1', 's2', 's3'] },
      { caption: '긴급은 담당자 호출까지 이어집니다.', show: ['src', 'rules', 's1', 's2', 's3', 'page'], active: ['page'] },
      { caption: '모든 알림은 역할별 채널 5개로 모입니다. 전에는 17개였습니다.', show: ['src', 'rules', 's1', 's2', 's3', 'page', 'ch', 'before'], active: ['ch'], muted: ['before'] },
    ],
  },
  'restore-state-machine': {
    id: 'restore-state-machine',
    title: '첫 결제 혜택 자격 복원 흐름',
    width: 360,
    height: 236,
    nodes: [
      { id: 'tx', label: '주문 상태 변경', x: 10, y: 10, w: 170, h: 28 },
      { id: 'outbox', label: '아웃박스 기록', x: 10, y: 56, w: 170, h: 28 },
      { id: 'relay', label: 'Kafka로 전달', x: 10, y: 102, w: 170, h: 28 },
      { id: 'recheck', label: '조건 재확인, 잠금과 CAS', x: 10, y: 148, w: 170, h: 28 },
      { id: 'api', label: '결제 쪽 복원 API', x: 10, y: 194, w: 170, h: 28 },
      { id: 'w1', label: '대기', x: 210, y: 10, w: 140, h: 26 },
      { id: 'w2', label: '준비', x: 210, y: 50, w: 140, h: 26 },
      { id: 'w3', label: '예약', x: 210, y: 90, w: 140, h: 26 },
      { id: 'w4', label: '발송 중', x: 210, y: 130, w: 140, h: 26 },
      { id: 'w5', label: '확인', x: 210, y: 170, w: 140, h: 26 },
    ],
    edges: [
      { from: 'tx', to: 'outbox' },
      { from: 'outbox', to: 'relay' },
      { from: 'relay', to: 'recheck' },
      { from: 'recheck', to: 'api' },
      { from: 'w1', to: 'w2' },
      { from: 'w2', to: 'w3' },
      { from: 'w3', to: 'w4' },
      { from: 'w4', to: 'w5' },
    ],
    steps: [
      { caption: '판매자 잘못으로 첫 결제 주문이 모두 취소되면 상태가 바뀝니다.', show: ['tx'], active: ['tx'] },
      { caption: '같은 트랜잭션 안에서 아웃박스에 기록합니다. 작업은 대기 상태입니다.', show: ['tx', 'outbox', 'w1'], active: ['outbox', 'w1'] },
      { caption: 'Kafka로 전달되고 준비 상태가 됩니다.', show: ['tx', 'outbox', 'relay', 'w1', 'w2'], active: ['relay', 'w2'] },
      { caption: '보내기 직전에 조건을 다시 확인하고, 고객 단위 잠금과 CAS(값을 비교한 뒤 바꾸기)로 한 건만 진행합니다.', show: ['tx', 'outbox', 'relay', 'recheck', 'w1', 'w2', 'w3'], active: ['recheck', 'w3'] },
      { caption: '결제 쪽 API를 부르고 확인 상태로 저장합니다. 같은 요청은 중복 방지 키로 한 번만 처리합니다.', show: ['tx', 'outbox', 'relay', 'recheck', 'api', 'w1', 'w2', 'w3', 'w4', 'w5'], active: ['api', 'w5'] },
    ],
  },
};
```

- [ ] Step 5: 컴포넌트를 쓴다

`src/islands/StepDiagram.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { DIAGRAMS } from '../lib/diagrams';
import { anchors, nextIndex, prevIndex, visibleEdges, type DiagramId } from '../lib/diagram';

type Props = { id: DiagramId; mode: 'preview' | 'player' };

const PREVIEW_INTERVAL = 1400;

// HTML에는 결과가 드러난 마지막 장면을 넣어 둔다(스크립트가 없거나 동작 줄이기일 때 보이는 장면).
export default function StepDiagram({ id, mode }: Props) {
  const spec = DIAGRAMS[id];
  const [useVariant, setUseVariant] = useState(false);
  const steps = useVariant && spec.variant ? spec.variant.steps : spec.steps;
  const [index, setIndex] = useState(spec.steps.length - 1);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const r = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(r);
    if (mode === 'player' || !r) setIndex(0);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'preview' || reduced) return;
    const timer = window.setInterval(() => setIndex((i) => nextIndex(i, steps.length, true)), PREVIEW_INTERVAL);
    return () => window.clearInterval(timer);
  }, [mode, reduced, steps.length]);

  const byId = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec]);
  const step = steps[Math.min(index, steps.length - 1)];
  const edges = visibleEdges(spec, step);
  const markerId = `arrow-${id}-${mode}`;

  return (
    <figure className={`diagram diagram--${mode}`}>
      <svg viewBox={`0 0 ${spec.width} ${spec.height}`} role="img" aria-label={`${spec.title}: ${step.caption}`}>
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="diagram-arrow" />
          </marker>
        </defs>
        {edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const p = anchors(a, b);
          return <line key={`${e.from}-${e.to}`} className="diagram-edge" x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} markerEnd={`url(#${markerId})`} />;
        })}
        {spec.nodes.map((n) => {
          if (!step.show.includes(n.id)) return null;
          const cls = [
            'diagram-node',
            step.active.includes(n.id) ? 'is-active' : '',
            step.danger?.includes(n.id) ? 'is-danger' : '',
            step.muted?.includes(n.id) ? 'is-muted' : '',
          ].filter(Boolean).join(' ');
          return (
            <g key={n.id} className={cls}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="4" />
              <text x={n.x + n.w / 2} y={n.y + n.h / 2} dominantBaseline="middle" textAnchor="middle">{n.label}</text>
            </g>
          );
        })}
      </svg>
      {mode === 'player' && (
        <figcaption>
          <p className="diagram-caption" aria-live="polite">{`${index + 1} / ${steps.length}. ${step.caption}`}</p>
          <div className="diagram-controls">
            <button type="button" onClick={() => setIndex(0)}>처음</button>
            <button type="button" onClick={() => setIndex((i) => prevIndex(i))} disabled={index === 0}>이전</button>
            <button type="button" onClick={() => setIndex((i) => nextIndex(i, steps.length, false))} disabled={index === steps.length - 1}>다음</button>
            {spec.variant && (
              <label className="diagram-toggle">
                <input type="checkbox" checked={useVariant} onChange={(e) => setUseVariant(e.target.checked)} /> {spec.variant.label}
              </label>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
```

`src/styles/global.css` 끝에 추가한다.

```css
/* 구조 그림 */
.diagram { margin: 0; width: 100%; }
.diagram svg { width: 100%; height: auto; display: block; font-family: var(--font-sans); font-size: 12px; }
.diagram-node { animation: node-in 0.3s ease both; }
.diagram-node rect { fill: #12324f; stroke: rgba(255, 255, 255, 0.25); }
.diagram-node text { fill: #ffffff; }
.diagram-node.is-active rect { stroke: var(--accent); stroke-width: 2; }
.diagram-node.is-danger rect { fill: #3a1418; stroke: #e05252; }
.diagram-node.is-muted { opacity: 0.45; }
.diagram-edge { stroke: rgba(18, 214, 64, 0.55); stroke-width: 1.5; }
.diagram-arrow { fill: rgba(18, 214, 64, 0.8); }
.diagram-caption { font-size: 14px; color: var(--text-muted); margin: 10px 0 8px; min-height: 3em; }
.diagram-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.diagram-controls button { font: inherit; font-size: 13px; color: var(--text); background: transparent; border: 1px solid var(--accent-dark); border-radius: 4px; padding: 5px 12px; cursor: pointer; }
.diagram-controls button:disabled { opacity: 0.4; cursor: default; }
.diagram-toggle { font-size: 13px; color: var(--text-muted); display: inline-flex; gap: 6px; align-items: center; }
@keyframes node-in { from { opacity: 0; } to { opacity: 1; } }
```

- [ ] Step 6: 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/diagram.test.ts tests/unit/StepDiagram.test.tsx`
Expected: 모두 통과

- [ ] Step 7: 커밋한다

```bash
npm run leak
git add -A
git commit -F - <<'EOF'
feat: 단계 재생 구조 그림 엔진과 그림 5개

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 7: 정산 원장 결정표

Files:
- Create: `src/lib/decision-matrix.ts`, `src/islands/DecisionMatrix.tsx`
- Modify: `src/styles/global.css`(결정표 절 추가)
- Test: `tests/unit/decision-matrix.test.ts`, `tests/unit/DecisionMatrix.test.tsx`

Interfaces:
- Consumes: 없음
- Produces: `CRITERIA`, `OPTIONS`, `score(option, weights): number`, `rank(options, weights): { option; score }[]`, 컴포넌트 `DecisionMatrix()`(props 없음). Task 8의 `settlement-ledger-dedup.mdx`가 불러 쓴다.

- [ ] Step 1: 실패하는 테스트를 쓴다

`tests/unit/decision-matrix.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CRITERIA, OPTIONS, rank } from '../../src/lib/decision-matrix';

const weights = CRITERIA.map((c) => c.weight);

describe('rank', () => {
  it('ADR 가중치에서 값 통일 후 유니크 키가 1위(+0.55), 쓰기 주체 통합이 2위(+0.40)다', () => {
    const r = rank(OPTIONS, weights);
    expect(r.map((x) => [x.option.id, x.score])).toEqual([
      ['o1', 0.55],
      ['o4', 0.4],
      ['o2', 0.1],
      ['o3', 0.1],
      ['o5', 0.05],
      ['datum', 0],
      ['o6', -0.05],
    ]);
  });

  it('운영 단순성 가중치를 0으로 하면 1·2위가 같은 점수가 된다', () => {
    const w = [...weights];
    w[2] = 0;
    const r = rank(OPTIONS, w);
    expect(r[0].score).toBe(r[1].score);
    expect(r[0].option.id).toBe('o1');
  });

  it('가중치가 모두 0이면 모두 0점이다', () => {
    expect(rank(OPTIONS, weights.map(() => 0)).every((x) => x.score === 0)).toBe(true);
  });
});
```

`tests/unit/DecisionMatrix.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DecisionMatrix from '../../src/islands/DecisionMatrix';

describe('DecisionMatrix', () => {
  it('처음에는 값 통일 후 유니크 키가 맨 위에 +0.55로 보인다', () => {
    const { container } = render(<DecisionMatrix />);
    const top = container.querySelector('.matrix-rank li.is-top');
    expect(top?.textContent).toContain('값 통일 후 원장 유니크 키');
    expect(top?.textContent).toContain('+0.55');
  });

  it('가중치를 바꾸면 점수가 다시 계산되고, 처음 가중치로 되돌릴 수 있다', () => {
    const { container } = render(<DecisionMatrix />);
    fireEvent.change(screen.getByLabelText('운영 단순성 가중치'), { target: { value: '0' } });
    expect(container.querySelector('.matrix-rank li.is-top')?.textContent).toContain('+0.65');
    fireEvent.click(screen.getByRole('button', { name: '처음 가중치로' }));
    expect(container.querySelector('.matrix-rank li.is-top')?.textContent).toContain('+0.55');
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/decision-matrix.test.ts tests/unit/DecisionMatrix.test.tsx`
Expected: 모듈이 없어 실패

- [ ] Step 3: 구현한다

`src/lib/decision-matrix.ts`:

```ts
// 정산 원장 중복 방지 ADR의 가중 결정표(현행 유지 대비 +1, 0, -1). 이름은 공개용 일반 명칭이다.
// 근거 ID(evidence): E-ledger-criteria
export type Criterion = { id: string; label: string; weight: number };
export type Option = { id: string; label: string; scores: number[] };

export const CRITERIA: Criterion[] = [
  { id: 'c1', label: '원장에서 중복 차단', weight: 30 },
  { id: 'c2', label: '정산 값 보존', weight: 20 },
  { id: 'c3', label: '운영 단순성', weight: 15 },
  { id: 'c4', label: '구현·전환 부담', weight: 15 },
  { id: 'c5', label: '재처리 안전성', weight: 10 },
  { id: 'c6', label: '수작업 감소', weight: 10 },
];

export const OPTIONS: Option[] = [
  { id: 'o1', label: '값 통일 후 원장 유니크 키', scores: [1, 1, 0, -1, 1, 1] },
  { id: 'o4', label: '쓰기 주체 통합', scores: [1, 1, -1, -1, 1, 1] },
  { id: 'o2', label: '가드 테이블', scores: [0, 1, -1, -1, 1, 1] },
  { id: 'o3', label: '공통 행 잠금', scores: [0, 1, -1, -1, 1, 1] },
  { id: 'o5', label: '커밋 후 발행', scores: [0, 1, 0, -1, 0, 0] },
  { id: 'datum', label: '현행 유지', scores: [0, 0, 0, 0, 0, 0] },
  { id: 'o6', label: '주기적 정리', scores: [0, 0, -1, 0, 0, 1] },
];

export function score(option: Option, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return option.scores.reduce((acc, s, i) => acc + (s * weights[i]) / total, 0);
}

export function rank(options: Option[], weights: number[]) {
  return options
    .map((option) => ({ option, score: Math.round(score(option, weights) * 100) / 100 }))
    .sort((a, b) => b.score - a.score || options.indexOf(a.option) - options.indexOf(b.option));
}
```

`src/islands/DecisionMatrix.tsx`:

```tsx
import { useState } from 'react';
import { CRITERIA, OPTIONS, rank } from '../lib/decision-matrix';

const DEFAULT_WEIGHTS = CRITERIA.map((c) => c.weight);

export default function DecisionMatrix() {
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);
  const ranked = rank(OPTIONS, weights);
  const total = weights.reduce((a, b) => a + b, 0);
  const setAt = (i: number, v: number) => setWeights((w) => w.map((x, j) => (j === i ? v : x)));

  return (
    <div className="matrix">
      <fieldset className="matrix-weights">
        <legend>기준과 가중치(지금 합계 {total}%, 점수는 합계를 100%로 맞춰 계산)</legend>
        {CRITERIA.map((c, i) => (
          <label key={c.id} className="matrix-weight">
            <span>{c.label}</span>
            <input type="range" min={0} max={50} step={5} value={weights[i]} aria-label={`${c.label} 가중치`} onChange={(e) => setAt(i, Number(e.target.value))} />
            <output>{weights[i]}%</output>
          </label>
        ))}
        <button type="button" onClick={() => setWeights(DEFAULT_WEIGHTS)}>처음 가중치로</button>
      </fieldset>
      <ol className="matrix-rank" aria-label="대안별 점수(현행 유지 = 0)">
        {ranked.map((r, i) => (
          <li key={r.option.id} className={i === 0 ? 'is-top' : undefined}>
            <span className="matrix-name">{r.option.label}</span>
            <span className="matrix-bar" aria-hidden="true">
              <span className={r.score < 0 ? 'neg' : undefined} style={{ transform: `scaleX(${Math.min(1, Math.abs(r.score))})` }} />
            </span>
            <span className="matrix-score">{`${r.score > 0 ? '+' : ''}${r.score.toFixed(2)}`}</span>
          </li>
        ))}
      </ol>
      <p className="matrix-note">각 가중치를 5%p씩 흔든 141가지 조합에서 1위는 바뀌지 않았습니다. 2026년 9월 기준 제안 단계입니다.</p>
    </div>
  );
}
```

`src/styles/global.css` 끝에 추가한다.

```css
/* 결정표 */
.matrix { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 28px; margin: 20px 0; padding: 20px; background: var(--panel); border-radius: 8px; }
@media (max-width: 820px) { .matrix { grid-template-columns: 1fr; } }
.matrix-weights { border: 0; margin: 0; padding: 0; min-width: 0; }
.matrix-weights legend { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.matrix-weight { display: grid; grid-template-columns: minmax(0, 1fr) 110px 44px; gap: 10px; align-items: center; font-size: 13.5px; padding: 4px 0; }
.matrix-weight input { width: 100%; accent-color: var(--accent); }
.matrix-weights button { margin-top: 10px; font: inherit; font-size: 13px; color: var(--text); background: transparent; border: 1px solid var(--accent-dark); border-radius: 4px; padding: 5px 12px; cursor: pointer; }
.matrix-rank { list-style: none; padding: 0; margin: 0; }
.matrix-rank li { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 48px; gap: 10px; align-items: center; font-size: 13.5px; padding: 5px 0; }
.matrix-rank li.is-top .matrix-name { color: var(--accent); font-weight: 600; }
.matrix-bar { height: 8px; background: rgba(255, 255, 255, 0.06); border-radius: 4px; overflow: hidden; }
.matrix-bar span { display: block; width: 100%; height: 100%; background: var(--accent); transform-origin: left; transition: transform 0.3s ease; }
.matrix-bar span.neg { background: #e05252; }
.matrix-score { text-align: right; font-variant-numeric: tabular-nums; }
.matrix-note { grid-column: 1 / -1; font-size: 13px; color: var(--text-muted); margin: 0; }
```

- [ ] Step 4: 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/decision-matrix.test.ts tests/unit/DecisionMatrix.test.tsx`
Expected: 모두 통과

- [ ] Step 5: 커밋한다

```bash
npm run leak
git add -A
git commit -F - <<'EOF'
feat: 정산 원장 중복 방지 가중 결정표

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 8: 콘텐츠 스키마, 데이터, 사례 7개, 트러블슈팅 9건

Files:
- Create: `src/content.config.ts`, `src/data/career.ts`, `src/data/skills.ts`, `src/data/personal-projects.ts`
- Create: `src/content/projects/ko/tokyo-popup-chatbot.mdx`, `japan-retention-mvp.mdx`, `member-privacy-api.mdx`, `benefit-home.mdx`, `alerting.mdx`, `settlement-ledger-dedup.mdx`, `first-payment-restore.mdx`
- Create: `src/content/troubleshooting/ko/gateway-502.mdx`, `redis-topology.mdx`, `benefit-total.mdx`, `price-api.mdx`, `crawler-gc.mdx`, `llm-timeout.mdx`, `data-contract.mdx`, `kapt.mdx`, `api-security.mdx`
- Create: `src/lib/i18n.ts`
- Test: `tests/unit/content-data.test.ts`, `tests/unit/i18n.test.ts`

Interfaces:
- Consumes: `Team`, `Status`(Task 3), `DiagramId`(Task 6), `DecisionMatrix`(Task 7), `src/assets/cases/*.jpg`(Task 5)
- Produces:
  - 컬렉션 `projects`(항목 id는 `ko/<사례>`), `troubleshooting`(id는 `ko/<항목>`)
  - `CONTENT_LANG`(`'ko'`), `inContentLang({ id }): boolean`(콘텐츠 언어 폴더의 항목만 고르는 필터), `slugOf(id): string`(`ko/<이름>`에서 `<이름>`). 이후 작업의 페이지는 `'ko/'`를 직접 쓰지 않고 이 둘을 쓴다.
  - `career: CareerEntry[]`, `education: EducationEntry[]` (`CareerEntry.bullets[].parts`는 `string | { count: number }`)
  - `skills: { name: string; items: string[] }[]`
  - `personalProjects: PersonalProject[]` (`slug`, `title`, `summary`, `period`, `stack`, `href`)

- [ ] Step 1: 실패하는 데이터 테스트를 쓴다

`tests/unit/content-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { career, education } from '../../src/data/career';
import { personalProjects } from '../../src/data/personal-projects';
import { skills } from '../../src/data/skills';
import { profile } from '../../src/data/profile';

describe('경력', () => {
  it('최근 팀부터 Purchase, Retention, Global 순서다', () => {
    expect(career.slice(0, 3).map((c) => c.team)).toEqual(['purchase', 'retention', 'global']);
  });
  it('모든 줄에 근거 ID가 있다', () => {
    expect(career.flatMap((c) => c.bullets).every((b) => b.evidence.length > 0)).toBe(true);
  });
  it('움직이는 숫자는 모두 양수다', () => {
    const counts = career.flatMap((c) => c.bullets.flatMap((b) => b.parts.filter((p) => typeof p !== 'string')));
    expect(counts.every((p) => typeof p !== 'string' && p.count > 0)).toBe(true);
  });
  it('Rutgers는 2025.01 졸업이다', () => {
    expect(education[0]).toMatchObject({ title: 'Rutgers University–New Brunswick', period: '2022.08 ~ 2025.01' });
  });
});

describe('기술과 개인 프로젝트', () => {
  it('기술 이름이 겹치지 않는다', () => {
    const all = skills.flatMap((g) => g.items);
    expect(new Set(all).size).toBe(all.length);
  });
  it('개인 프로젝트는 EwanJee GitHub 저장소로 연결된다', () => {
    expect(personalProjects.map((p) => p.href)).toEqual([
      'https://github.com/EwanJee/NEWJOB-Ver2.0',
      'https://github.com/EwanJee/HealthWebApp',
    ]);
  });
});

describe('프로필', () => {
  it('타이핑 첫 문구는 a Product Engineer다', () => {
    expect(profile.roles[0]).toBe('a Product Engineer');
    expect(profile.roles).toContain('a Backend Developer');
  });
  it('전화번호 모양이 없다', () => {
    expect(JSON.stringify(profile)).not.toMatch(/01[016789]-?\d{3,4}-?\d{4}/);
  });
});
```

`tests/unit/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CONTENT_LANG, inContentLang, slugOf } from '../../src/lib/i18n';

describe('i18n', () => {
  it('지금 콘텐츠 언어는 한국어다', () => {
    expect(CONTENT_LANG).toBe('ko');
  });

  it('콘텐츠 언어 폴더의 항목만 고르고, 폴더 이름을 뺀 주소 이름을 만든다', () => {
    expect(inContentLang({ id: 'ko/benefit-home' })).toBe(true);
    expect(inContentLang({ id: 'en/benefit-home' })).toBe(false);
    expect(slugOf('ko/benefit-home')).toBe('benefit-home');
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/content-data.test.ts tests/unit/i18n.test.ts`
Expected: 모듈이 없어 실패

- [ ] Step 3: 언어 설정과 데이터 파일을 쓴다

`src/lib/i18n.ts`:

```ts
// 지금은 한국어만 만든다. 콘텐츠는 src/content/<컬렉션>/<언어>/ 폴더에 둔다.
// 영어를 켤 때는 en 폴더, 이 설정, /en 페이지를 더한다(설계 2장).
export const CONTENT_LANG = 'ko';

export function inContentLang({ id }: { id: string }): boolean {
  return id.startsWith(`${CONTENT_LANG}/`);
}

export function slugOf(id: string): string {
  return id.slice(CONTENT_LANG.length + 1);
}
```

`src/data/career.ts`:

```ts
import type { Team } from '../lib/teams';

export type Segment = string | { count: number };
export type Bullet = { parts: Segment[]; evidence: string[] };
export type CareerEntry = { period: string; title: string; sub?: string; team: Team | 'other'; bullets: Bullet[]; small?: boolean };
export type EducationEntry = { period: string; title: string; sub?: string };

export const career: CareerEntry[] = [
  {
    period: '2026.09 ~ 지금',
    title: '무신사 Purchase 팀',
    sub: '주문, 클레임, 배송',
    team: 'purchase',
    bullets: [
      { parts: ['클레임: 첫 결제 혜택 자격 복원 (설계와 개발, 진행 중)'], evidence: ['E-restore'] },
      { parts: ['정산 원장 중복 삽입: 원인 추적, 대안 ', { count: 7 }, '개 비교로 해결안 제안(검토 중)'], evidence: ['E-ledger-matrix'] },
    ],
  },
  {
    period: '2026.06 ~ 2026.09',
    title: '무신사 Retention 팀',
    sub: '혜택홈, 운영 안정성',
    team: 'retention',
    bullets: [
      { parts: ['혜택홈 편성 어드민을 계획보다 ', { count: 13 }, '영업일 앞당겨 오픈'], evidence: ['E-bh-admin'] },
      { parts: ['혜택홈 새 판 서버 p99 약 0.25초'], evidence: ['E-bh-p99'] },
      { parts: ['공개 API ', { count: 23 }, '개와 라우트 규칙 ', { count: 26 }, '개를 7일 만에 API Gateway로 단계 전환'], evidence: ['E-gw-transition'] },
      { parts: ['알림 채널 ', { count: 17 }, '개를 역할별 ', { count: 5 }, '개로 정리'], evidence: ['E-alert-channels'] },
    ],
  },
  {
    period: '2026.03 ~ 2026.06',
    title: '무신사 Global 팀',
    sub: 'AI Native Engineer 인턴, 2026.03 입사',
    team: 'global',
    bullets: [
      { parts: ['도쿄 팝업 스토어 ', { count: 3 }, '개 언어 안내 챗봇: 17일간 약 5천 명 사용'], evidence: ['E-chatbot-scale', 'E-chatbot-users'] },
      { parts: ['일본 고객 재구매 지표 MVP: 데이터 계약 8개 중 ', { count: 7 }, '개 오류 수정'], evidence: ['E-jp-contracts'] },
    ],
  },
  {
    period: '2024.06 ~ 2024.09',
    title: '아이헤이트플라잉버그스, 백엔드 인턴',
    team: 'other',
    small: true,
    bullets: [{ parts: ['AI 디지털교과서 추천 API, 학습 데이터 적재와 운영 도구'], evidence: ['E-career-intern'] }],
  },
  {
    period: '2023.06 ~ 2023.08',
    title: '프레디저, 백엔드 인턴',
    team: 'other',
    small: true,
    bullets: [{ parts: ['심리 진단 결과 API, 카카오 로그인과 결제 연동'], evidence: ['E-career-intern'] }],
  },
];

export const education: EducationEntry[] = [
  { period: '2022.08 ~ 2025.01', title: 'Rutgers University–New Brunswick', sub: 'Computer Science 졸업' },
  { period: '2019.08 ~ 2020.12', title: 'Stony Brook University', sub: 'Computer Science' },
  { period: '2024', title: '정보처리기사' },
];
```

`src/data/skills.ts`:

```ts
export type SkillGroup = { name: string; items: string[] };

export const skills: SkillGroup[] = [
  { name: 'Backend', items: ['Java', 'Kotlin', 'Spring Boot', 'Spring Batch', 'JPA', 'Kotlin JDSL', 'REST API'] },
  { name: 'Data', items: ['MySQL', 'Redis', 'Kafka', 'RabbitMQ', 'Databricks', 'SQL', 'Python'] },
  { name: 'Platform & Quality', items: ['AWS', 'API Gateway', 'Kubernetes', 'GitHub Actions', 'Datadog', 'Grafana', 'Testcontainers', 'TDD', 'Feature Flag'] },
];
```

`src/data/personal-projects.ts`:

```ts
export type PersonalProject = { slug: string; title: string; summary: string; period: string; stack: string[]; href: string };

export const personalProjects: PersonalProject[] = [
  {
    slug: 'remember-assessment',
    title: 'Remember Assessment',
    period: '2025',
    summary: '긴 PDF 리포트 생성을 RabbitMQ 비동기 작업으로 나누고, SSE로 진행 상태를 전달했습니다.',
    stack: ['Kotlin', 'Spring Boot', 'RabbitMQ', 'Redis', 'Kotlin JDSL', 'Spring Security', 'CloudWatch'],
    href: 'https://github.com/EwanJee/NEWJOB-Ver2.0',
  },
  {
    slug: 'my-health-check',
    title: 'My Health Check',
    period: '2024.10 ~ 2025.02',
    summary: '공공데이터 API로 체력 진단, 맞춤 운동, 시설 위치를 알려 주는 서비스입니다. WebFlux와 Coroutine으로 병렬 호출합니다.',
    stack: ['Kotlin', 'Spring Boot', 'WebFlux', 'Coroutine', 'Flyway', 'GitHub Actions', 'Nginx'],
    href: 'https://github.com/EwanJee/HealthWebApp',
  },
];
```

- [ ] Step 4: 데이터 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/content-data.test.ts tests/unit/i18n.test.ts`
Expected: 모두 통과

- [ ] Step 5: 콘텐츠 스키마를 쓴다

트러블슈팅에는 설계 7장의 `date`, `metrics` 대신 `evidence` 배열과 `order`를 둔다. 날짜는 화면에 보이지 않고, 수치는 문장 안에 쓰며 근거 ID로 확인한다. `summary`는 보안 건처럼 제목 말고는 적지 않을 항목이 있어 선택 항목이다.

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const evidenceId = z.string().regex(/^E-[a-z0-9-]+$/);
const metric = z.object({ label: z.string(), value: z.string(), evidence: evidenceId });

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        summary: z.string(),
        team: z.enum(['global', 'retention', 'purchase']),
        period: z.string(),
        role: z.string(),
        status: z.enum(['done', 'in-progress', 'proposed']),
        stack: z.array(z.string()),
        metrics: z.array(metric).default([]),
        facts: z.array(z.string()).default([]),
        link: z.object({ href: z.url(), label: z.string() }).optional(),
        media: z.discriminatedUnion('kind', [
          z.object({ kind: z.literal('gif'), still: image(), motion: z.string().regex(/^\/media\/.+\.gif$/).optional(), alt: z.string() }),
          z.object({
            kind: z.literal('diagram'),
            diagram: z.enum(['race-condition', 'signal-pipeline', 'privacy-flow', 'alert-flow', 'restore-state-machine']),
            alt: z.string(),
          }),
        ]),
        order: z.number().int(),
      })
      .refine((d) => d.metrics.length + d.facts.length <= 3, { message: '핵심 칸(metrics + facts)은 최대 3개' }),
});

const troubleshooting = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/troubleshooting' }),
  schema: z.object({
    title: z.string(),
    team: z.enum(['global', 'retention', 'purchase']),
    summary: z.string().optional(),
    symptom: z.string().optional(),
    cause: z.string().optional(),
    fix: z.string().optional(),
    prevention: z.string().optional(),
    evidence: z.array(evidenceId).min(1),
    related: z.string().optional(),
    order: z.number().int(),
  }),
});

export const collections = { projects, troubleshooting };
```

- [ ] Step 6: 사례 7개를 쓴다

`src/content/projects/ko/tokyo-popup-chatbot.mdx`:

```mdx
---
title: 도쿄 팝업 스토어 안내 챗봇
summary: 78개 브랜드와 5개 층을 한국어, 일본어, 영어로 안내하는 챗봇을 2주 만에 설계부터 배포까지 했습니다.
team: global
period: 2026.03 ~ 2026.04
role: 단독 설계, 개발, 배포
status: done
stack: [React, TypeScript, Vite, Amplitude]
metrics:
  - { label: 17일간 사용자, value: 약 5천 명, evidence: E-chatbot-users }
  - { label: 방문 대비 클릭, value: 약 62%, evidence: E-chatbot-ctr }
  - { label: 안내 언어, value: 3개, evidence: E-chatbot-scale }
media:
  kind: gif
  still: ../../../assets/cases/chatbot.jpg
  motion: /media/chatbot.gif
  alt: 도쿄 팝업 스토어 안내 챗봇 화면
order: 1
---

## 문제

도쿄 팝업 스토어는 5개 층에 78개 브랜드가 들어섰고, 17일 동안 열렸습니다. 층과 브랜드를 한국어, 일본어, 영어로 안내해야 했고, 설계부터 배포까지 2주 안에 끝내야 했습니다.

## 검토한 대안

- LLM으로 답을 만들기
- 키워드 규칙으로 정해 둔 답을 고르기

## 결정

서버 없이 앱 안의 웹 화면으로 동작하게 만들고, 답은 LLM 대신 키워드 규칙으로 골랐습니다. 응답 속도를 예측할 수 있고, 비용이 0원이고, 없는 사실을 지어내지 않기 때문입니다.

## 결과

- 17일 동안 고유 사용자 약 5천 명이 썼고, 방문 대비 클릭 전환율은 약 62%였습니다.
- 이벤트 계측과 배포 자동화를 붙였습니다.

## 배운 점

짧게 운영하는 현장 서비스에서는 답이 늘 같고 빠르다는 점이 똑똑한 답보다 중요했습니다.
```

`src/content/projects/ko/japan-retention-mvp.mdx`:

```mdx
---
title: 일본 고객 재구매 지표 MVP와 생성형 AI 알림 품질
summary: 데이터 계약 8개 중 7개의 오류를 배포 전에 바로잡고, 요구사항 12개를 핵심 지표 3개로 줄였습니다.
team: global
period: 2026.03 ~ 2026.06
role: 설계, 데이터 검증, 알림 품질
status: done
stack: [Databricks, SQL, Python, LLM]
metrics:
  - { label: 바로잡은 데이터 계약, value: 8개 중 7개, evidence: E-jp-contracts }
  - { label: 없앤 오분류, value: 약 49만 명, evidence: E-jp-misclass }
  - { label: 요구사항 → 핵심 지표, value: 12 → 3, evidence: E-jp-scope }
media:
  kind: diagram
  diagram: signal-pipeline
  alt: 데이터에서 이상 신호를 찾아 문장으로 알리는 흐름
order: 2
---

## 문제

일본 고객의 재구매와 첫 구매 흐름이 평소와 달라지면 바로 알 수 있어야 했습니다. 요구사항은 12개였고, 무엇을 먼저 만들지 골라야 했습니다.

## 결정

요구사항 12개를 핵심 지표 3개로 줄이고, 데이터마트를 테이블 8개에서 뷰 3개와 이벤트 테이블 1개로 단순화했습니다. 이상 신호를 찾은 뒤 알림 문장을 만들 때는 수치와 원인을 코드가 만들고 LLM은 문장만 다듬게 나눴습니다.

## 결과

- 설계를 실제 데이터와 대조해서 데이터 계약 8개 중 7개의 오류를 배포 전에 고쳤습니다. 1회 구매자 약 49만 명 오분류와 가입 후 7일 안 첫 구매율 82~88% 과대 계산이 사라졌습니다.
- AI가 제기한 결함 후보 30건을 다시 검증해 11건을 확정하고 8건을 고쳤습니다.

## 배운 점

설계를 고칠 때마다 실제 데이터로 다시 확인하는 것이 코드를 쓰기 전에 가장 싼 검증이었습니다.
```

`src/content/projects/ko/member-privacy-api.mdx`:

```mdx
---
title: 회원 개인정보 조회 일원화 설계
summary: 여러 시스템에 흩어진 회원 개인정보 조회 경로를 표준 API로 모으는 설계를 했습니다.
team: global
period: "2026.04"
role: 설계(ADR, HLD)
status: done
stack: [REST API]
facts:
  - 조회 경로 일원화
  - ADR, HLD 작성
media:
  kind: diagram
  diagram: privacy-flow
  alt: 흩어진 개인정보 조회 경로가 표준 API 하나로 모이는 그림
order: 3
---

## 문제

회원 개인정보를 조회하는 경로가 여러 시스템에 흩어져 있었습니다.

## 결정

흩어진 조회 경로를 표준 API로 모으는 설계를 ADR과 HLD로 정리했습니다.
```

`src/content/projects/ko/benefit-home.mdx`:

```mdx
---
title: 혜택홈 새 판 서버와 편성 어드민
summary: 13개 화면 영역을 판 API 한 번으로 내려주고, 운영자가 개발과 배포 없이 혜택을 편성하게 했습니다.
team: retention
period: 2026.06 ~ 2026.09
role: 서버 설계와 개발, 편성 어드민
status: done
stack: [Kotlin, Spring Boot, Feature Flag, Grafana]
metrics:
  - { label: 하루 화면 열림, value: 약 10만 번, evidence: E-bh-traffic }
  - { label: p99 응답, value: 약 0.25초, evidence: E-bh-p99 }
  - { label: 출시 전 막은 총액 오류, value: 약 5만 원, evidence: E-bh-total }
link:
  href: https://www.musinsa.com/events/main
  label: 혜택홈 열어 보기
media:
  kind: gif
  still: ../../../assets/cases/benefit-home.jpg
  motion: /media/benefit-home.gif
  alt: 혜택홈 화면을 위에서 아래로 넘기는 모습
order: 4
---

## 문제

혜택홈의 카드 순서나 노출 기간을 바꾸려면 매번 개발과 배포가 필요했습니다.

## 검토한 대안

- 화면 영역마다 새 모듈을 만들기
- 이미 있는 공식 모듈과 아이템 81종에서 재사용할 것을 찾기

## 결정

13개 화면 영역을 판 API 한 번으로 내려주는 SDUI(서버가 화면 구성을 내려주는 방식) 계약을 설계했습니다. 공식 모듈과 아이템 81종을 비교해서, 캐러셀 3개는 기존 렌더러를 재사용하고 미션 4개는 계약 1종으로 합쳐 새 분기 3개를 줄였습니다. 운영자는 편성 어드민에서 카드와 광고의 순서, 노출 기간, 변경 이력을 개발과 배포 없이 관리합니다. 기능 스위치 14개로 배포와 사용자 공개를 나눴습니다.

## 결과

- 편성 어드민을 계획보다 13영업일 앞당겨 8월 20일에 열었습니다.
- 출시 전에 혜택 총액 오류를 막았습니다. 시안의 41,030원과 실제 최대 91,020원이 약 5만 원 달라서, 산출 방식 5가지를 비교하고 정책을 고쳤습니다.
- 9월 17일부터 27일까지 하루 약 10만 번 열리는 화면을 p99 약 0.25초, 서버 오류 0건으로 처리했습니다. 첫 이틀은 p99가 약 0.4초였습니다.

## 배운 점

숫자는 시안이 아니라 실제 데이터로 다시 계산해야 한다는 것을 출시 전에 확인했습니다.
```

`src/content/projects/ko/alerting.mdx`:

```mdx
---
title: 알림 체계 정비
summary: 흩어진 알림 채널 17개를 역할별 5개로 모으고, 심각도별 알림 규칙 36개를 두었습니다.
team: retention
period: 2026.06 ~ 2026.09
role: 알림 규칙과 채널 구조 설계
status: done
stack: [Grafana, Datadog, Slack]
metrics:
  - { label: 알림 채널, value: 17 → 5, evidence: E-alert-channels }
  - { label: 알림 규칙, value: 36개, evidence: E-alert-rules }
  - { label: 심각도, value: 3단계, evidence: E-alert-rules }
media:
  kind: diagram
  diagram: alert-flow
  alt: 지표와 로그가 규칙과 심각도를 거쳐 채널로 가는 흐름
order: 5
---

## 문제

알림 채널이 17개로 흩어져 있었습니다.

## 결정

지표와 로그에 심각도별 알림 규칙 36개를 두었습니다. 긴급 19개, 높음 4개, 통지 13개이고, 긴급은 담당자 호출까지 이어집니다. 흩어진 알림 채널 17개는 역할별 5개로 모았습니다.

## 결과

알림 채널을 17개에서 역할별 5개로 줄였습니다.
```

`src/content/projects/ko/settlement-ledger-dedup.mdx`:

```mdx
---
title: 정산 원장 중복 삽입
summary: 같은 정산 기록이 두 번 쌓이는 원인을 추적하고, 대안 7개를 비교해 원장 유니크 키를 제안했습니다.
team: purchase
period: "2026.09"
role: 원인 분석, ADR 작성
status: proposed
stack: [Java, Spring Boot, MySQL, Redis, Kafka]
metrics:
  - { label: 중복 묶음(한 시점 표본), value: 2천여 건, evidence: E-ledger-dup }
  - { label: 비교한 대안, value: 7개, evidence: E-ledger-matrix }
  - { label: 가중치 조합 검증, value: 141가지, evidence: E-ledger-matrix }
media:
  kind: diagram
  diagram: race-condition
  alt: 두 요청이 서로 다른 잠금으로 같은 행을 두 번 넣는 과정
order: 6
---

import DecisionMatrix from '../../../islands/DecisionMatrix';

## 문제

정산에 쓰는 원장에 같은 주문 옵션의 같은 상태 기록이 두 번 쌓이는 문제가 반복됐습니다. 한 시점 표본에서 중복 묶음 2천여 건을 찾았습니다.

## 원인

위 그림처럼 두 서비스가 서로 다른 잠금을 잡고 같은 행이 있는지 확인한 뒤 거의 동시에 넣었습니다. 잠금이 달라서 서로를 기다리지 않았고, 커밋 전이라 서로의 행도 보지 못했습니다. 다른 경로에서는 트랜잭션이 커밋되기 전에 이벤트를 보내서, 받는 쪽이 아직 커밋되지 않은 행을 보지 못하고 한 번 더 넣었습니다.

## 검토한 대안

값 통일 후 원장 유니크 키, 쓰기 주체 통합, 가드 테이블, 공통 행 잠금, 커밋 후 발행, 주기적 정리, 현행 유지까지 7개를 기준 6개의 가중 결정표로 비교했습니다. 아래 표에서 가중치를 바꿔 볼 수 있습니다.

<DecisionMatrix client:visible />

## 결정(제안)

모든 생성 경로가 같은 정상 정산 값을 저장하도록 먼저 고치고, 원장에 유니크 키를 두는 안을 제안했습니다. 원장이 스스로 중복을 거부하므로, 쓰기 경로가 늘어도 같은 문제가 다시 생기지 않습니다. 각 가중치를 5%p씩 흔든 141가지 조합에서 1위가 바뀌지 않았고, 1·2위 차이는 가장 작을 때 0.10이었습니다. 쓰기 주체 통합이 이미 준비돼 운영 부담이 사라지면 두 안이 +0.55로 같은 점수가 된다는 점도 함께 적었습니다.

## 결과

2026년 9월 기준 제안 단계이고, 검토 중입니다.
```

`src/content/projects/ko/first-payment-restore.mdx`:

```mdx
---
title: "클레임: 첫 결제 혜택 자격 복원"
summary: 판매자 잘못으로 첫 결제 주문이 모두 취소된 고객이 다음 결제에서 혜택을 다시 받을 수 있게 하는 흐름을 설계하고 있습니다.
team: purchase
period: 2026.09 ~
role: 설계(HLD, LLD)와 개발
status: in-progress
stack: [Java, Spring Boot, Kafka]
facts:
  - 아웃박스 + Kafka
  - 중복 방지 키와 고객 단위 잠금
  - 상태 머신 5단계
media:
  kind: diagram
  diagram: restore-state-machine
  alt: 취소 이벤트가 아웃박스와 상태 머신을 거쳐 복원 요청이 되는 흐름
order: 7
---

## 문제

첫 결제 적립을 받은 주문이 판매자 잘못으로 전부 취소되면 적립금은 회수되는데, 첫 결제 이력은 이미 써 버린 상태로 남습니다. 고객은 혜택도, 다시 받을 기회도 잃습니다.

## 결정

다음 결제에서 첫 결제 혜택을 다시 받을 자격을 되살립니다.

- 주문 상태가 바뀌면 같은 트랜잭션 안에서 아웃박스에 기록합니다.
- 기록은 Kafka로 전달되고, 받는 쪽에서 조건을 다시 확인한 뒤 결제 쪽 복원 API를 부르고 결과를 저장합니다.
- 같은 요청이 여러 번 와도 한 번만 처리되도록 중복 방지 키를 두고, 고객 단위 잠금과 CAS(값을 비교한 뒤 바꾸기)로 같은 고객의 요청이 동시에 진행되지 않게 합니다.
- 작업은 대기, 준비, 예약, 발송 중, 확인의 다섯 상태를 거칩니다(상태 머신).

## 진행 상황

이번 범위는 외부 API 연동 검증까지입니다. 환불 이벤트와 연결하는 자동 복원은 남은 정책이 정해진 뒤에 진행합니다.
```

- [ ] Step 7: 트러블슈팅 9건을 쓴다

본문은 비워 두고 앞머리만 쓴다.

`src/content/troubleshooting/ko/gateway-502.mdx`:

```mdx
---
title: API Gateway 전환 중 스케일아웃 502 약 800건
team: retention
summary: 새 파드가 준비되기 전에 요청을 받던 것을 준비 확인 시점을 늦춰 막았습니다.
symptom: 트래픽을 API Gateway로 70%까지 옮기던 중, 파드가 늘어날 때마다 502가 모두 약 800건 났습니다.
cause: 새 파드가 요청을 받을 준비를 마치기 전에 트래픽이 들어왔습니다.
fix: 앱 준비 확인을 15초에서 30초로 늦추고, nginx 확인을 35초에 새로 두고, 메모리를 2.0GiB에서 3.6GiB로 맞췄습니다. Kubernetes 설정 변경은 ADR로 합의해 반영했습니다.
prevention: 파드는 앱이 실제로 준비된 뒤에만 트래픽을 받습니다. 이후 공개 API 23개를 7일 만에 100% 전환했고, 100% 구간 약 1,600만 요청 중 서버 오류는 1건이었습니다.
evidence: [E-gw-502, E-gw-transition]
order: 1
---
```

`src/content/troubleshooting/ko/redis-topology.mdx`:

```mdx
---
title: Redis master를 놓친 연결
team: retention
summary: 오토스케일로 뜬 새 파드의 쓰기 오류를 재현하고, 연결이 스스로 복구되게 만들었습니다(리뷰 중).
symptom: 오토스케일로 새로 뜬 파드 2개에 쓰기 오류가 약 100건 몰렸습니다.
cause: Redis 클라이언트가 처음 받은 클러스터 구성에 고정돼 새 master를 찾지 못했습니다.
fix: 로컬에서 장애를 재현하고, 오류를 감지하면 연결을 다시 만드는 자가 복구를 만들어 검증했습니다. 여러 요청이 동시에 오류를 봐도 연결은 한 번만 다시 만들고, 재시도 간격은 점점 늘립니다. 지금 리뷰 중입니다.
prevention: 사람이 파드를 다시 띄우지 않아도 연결이 스스로 복구되게 합니다.
evidence: [E-redis]
order: 2
---
```

`src/content/troubleshooting/ko/benefit-total.mdx`:

```mdx
---
title: 출시 전 혜택 총액 오류 약 5만 원 차단
team: retention
summary: 시안의 총액과 실제 최대 총액이 다른 것을 찾아 출시 전에 정책을 고쳤습니다.
symptom: 시안에 적힌 혜택 총액 41,030원과 실제로 받을 수 있는 최대 총액 91,020원이 달랐습니다.
cause: 총액 산출 정책이 실제 혜택 구성과 맞지 않았습니다.
fix: 산출 방식 5가지를 비교해 정책을 고쳤습니다.
evidence: [E-bh-total]
related: benefit-home
order: 3
---
```

`src/content/troubleshooting/ko/price-api.mdx`:

```mdx
---
title: 증설로는 못 막았을 가격 API 장애
team: global
summary: 오류는 약 300배로 늘었지만 CPU는 평소 수준이었습니다. 원인은 느린 하위 API를 동기로 기다린 구조였습니다.
symptom: 세일이 끝난 직후 가격 조회 API의 오류가 평소의 약 300배로 늘었습니다.
cause: CPU와 메모리는 평소와 같았습니다. 느린 하위 API를 동기로 기다렸고, 재시도가 실패를 더 키웠습니다.
fix: 지표로 증설이 해법이 아니라는 것을 보이고, 재시도 축소와 서킷 브레이커를 권고했습니다.
evidence: [E-price]
order: 4
---
```

`src/content/troubleshooting/ko/crawler-gc.mdx`:

```mdx
---
title: 크롤러 몰림으로 GC 폭주
team: global
summary: 처리량이 약 8분의 1로 떨어진 장애의 원인 화면을 11분 만에 찾았습니다.
symptom: 처리량이 약 8분의 1로 떨어지고 가비지 컬렉션(GC)이 폭주했습니다.
cause: 크롤러 요청이 한꺼번에 몰렸습니다.
fix: 관측 데이터로 원인이 된 화면을 11분 만에 찾고, 대응 변경을 머지했습니다.
evidence: [E-gc]
order: 5
---
```

`src/content/troubleshooting/ko/llm-timeout.mdx`:

```mdx
---
title: LLM 번역 타임아웃 8.3%
team: global
summary: 처음 계산한 오류율 26~80%가 표본 추출 때문에 부풀려졌다는 것을 스스로 찾고, 전수 지표로 8.3%를 확인했습니다.
symptom: LLM 기반 번역 호출이 반복해서 타임아웃으로 실패했습니다.
cause: LLM 응답은 느린데 타임아웃은 2초로 짧았습니다.
fix: 처음 계산한 오류율 26~80%는 표본 추출 때문에 부풀려진 값이었습니다. 전수 지표로 다시 재서 8.3%를 확인했습니다.
evidence: [E-translate]
order: 6
---
```

`src/content/troubleshooting/ko/data-contract.mdx`:

```mdx
---
title: 데이터 계약 오류 7건
team: global
summary: 설계를 실제 데이터와 대조해 약 49만 명 오분류와 지표 과대 계산을 배포 전에 찾았습니다.
symptom: 설계한 지표를 실제 데이터에 돌려 보니 1회 구매자 약 49만 명이 잘못 분류되고, 가입 후 7일 안 첫 구매율이 82~88%로 과대 계산됐습니다.
cause: 설계에 적은 데이터 계약 8개 중 7개가 실제 데이터와 맞지 않았습니다.
fix: 설계를 실제 데이터와 대조해 7개를 모두 고쳤습니다.
evidence: [E-jp-contracts, E-jp-misclass, E-jp-d7]
related: japan-retention-mvp
order: 7
---
```

`src/content/troubleshooting/ko/kapt.mdx`:

```mdx
---
title: KAPT 빌드 시간 55~71% 단축
team: retention
summary: 필요 없는 모듈까지 돌던 Kotlin 애노테이션 처리(KAPT)를 줄여 빌드와 테스트 기동을 빠르게 했습니다.
symptom: Kotlin 애노테이션 처리 때문에 빌드와 테스트 기동이 느렸습니다.
cause: 처리가 필요 없는 모듈까지 15개 모듈 전체에 적용돼 있었습니다.
fix: 실제로 필요한 5개 모듈로 줄였습니다. 처리 시간이 55~71% 줄었고, 테스트 컨텍스트 기동은 62~67% 줄었습니다. 테스트 9,164개가 모두 통과했습니다.
evidence: [E-kapt]
order: 8
---
```

`src/content/troubleshooting/ko/api-security.mdx`:

```mdx
---
title: API 보안 취약점 개선
team: retention
evidence: [E-security]
order: 9
---
```

- [ ] Step 8: 스키마 검증과 모든 검사를 돌린다

```bash
npm run check
npm run build
npm run evidence
npm run leak
```

Expected: `astro check`에서 오류 0, 빌드 성공, `evidence-check: ... 누락 0건`, `leak-check: 0건`. 앞머리가 스키마와 맞지 않으면 빌드가 해당 파일 이름과 필드를 알려 준다.

- [ ] Step 9: 문장과 수치를 근거와 하나씩 대조한다

콘텐츠와 데이터 파일에서 숫자가 든 줄을 모두 뽑는다.

```bash
grep -rn -E '[0-9]' src/content src/data src/lib/decision-matrix.ts src/lib/diagrams.ts
```

줄마다 설계 문서 6장 문장이나 비공개 근거 파일 "공개 표기" 열에서 같은 값을 찾아 확인한다. 원래 값 열에만 있는 값, 조사 노트(`research/`)에만 있는 값은 쓰지 않는다. 숫자가 없는 사실 문장(검토한 대안, 원인, 도구 이름, 날짜)도 같은 기준으로 확인하고, 두 곳 어디에도 없으면 지운다. 결정표의 기준 이름, 가중치, 대안별 점수, 동점 조건은 근거 파일의 `E-ledger-criteria` 행과 대조한다.

- [ ] Step 10: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
feat: 콘텐츠 스키마, 경력·기술 데이터, 사례 7개와 트러블슈팅 9건

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 9: 프로젝트 목록

Files:
- Create: `src/lib/project-filter.ts`, `src/islands/ProjectGrid.tsx`
- Modify: `src/pages/projects/index.astro`, `src/styles/global.css`(프로젝트 절 추가)
- Test: `tests/unit/project-filter.test.ts`, `tests/unit/ProjectGrid.test.tsx`, `tests/e2e/projects.spec.ts`

Interfaces:
- Consumes: `projects` 컬렉션, `personalProjects`, `StepDiagram`, `TEAM_LABEL`, `STATUS_LABEL`, `inContentLang`과 `slugOf`(Task 8)
- Produces: `Filter`, `GridItem`(`CaseItem | PersonalItem`), `FILTERS`, `matchesFilter`, `matchesStack`, `isDimmed`, `readStackParam`, 컴포넌트 `ProjectGrid({ items: GridItem[] })`. 사례 카드 이미지는 `view-transition-name: media-<사례>`를 가진다(Task 10의 세부 보기와 이어짐).

- [ ] Step 1: 실패하는 테스트를 쓴다

`tests/unit/project-filter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isDimmed, readStackParam, type GridItem } from '../../src/lib/project-filter';

const caseItem: GridItem = { kind: 'case', slug: 'a', title: 'A', summary: '', team: 'retention', status: 'done', stack: ['Kotlin'], alt: '' };
const personal: GridItem = { kind: 'personal', slug: 'p', title: 'P', summary: '', period: '2025', stack: ['RabbitMQ'], href: 'https://github.com/EwanJee/x' };

describe('isDimmed', () => {
  it('팀 필터와 맞지 않으면 흐리게 한다', () => {
    expect(isDimmed(caseItem, 'all', null)).toBe(false);
    expect(isDimmed(caseItem, 'retention', null)).toBe(false);
    expect(isDimmed(caseItem, 'global', null)).toBe(true);
    expect(isDimmed(personal, 'personal', null)).toBe(false);
    expect(isDimmed(personal, 'retention', null)).toBe(true);
  });
  it('기술 조건과 맞지 않으면 흐리게 한다', () => {
    expect(isDimmed(caseItem, 'all', 'Kotlin')).toBe(false);
    expect(isDimmed(personal, 'all', 'Kotlin')).toBe(true);
  });
});

describe('readStackParam', () => {
  it('stack 쿼리를 읽는다', () => {
    expect(readStackParam('?stack=Spring%20Boot')).toBe('Spring Boot');
    expect(readStackParam('')).toBeNull();
    expect(readStackParam('?stack=')).toBeNull();
  });
});
```

`tests/unit/ProjectGrid.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProjectGrid from '../../src/islands/ProjectGrid';
import type { GridItem } from '../../src/lib/project-filter';

vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));

const items: GridItem[] = [
  { kind: 'case', slug: 'benefit-home', title: '혜택홈', summary: 's', team: 'retention', status: 'done', stack: ['Kotlin'], still: { src: '/x.webp', width: 300, height: 540 }, alt: 'a' },
  { kind: 'case', slug: 'settlement-ledger-dedup', title: '원장', summary: 's', team: 'purchase', status: 'proposed', stack: ['Java'], diagram: 'race-condition', alt: 'a' },
  { kind: 'personal', slug: 'my-health-check', title: 'My Health Check', summary: 's', period: '2025', stack: ['Kotlin'], href: 'https://github.com/EwanJee/HealthWebApp' },
];

describe('ProjectGrid', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('팀 필터를 누르면 다른 팀 카드가 흐려진다', () => {
    const { container } = render(<ProjectGrid items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Purchase' }));
    expect(screen.getByRole('button', { name: 'Purchase' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('.card-wrap.is-dim')).toHaveLength(2);
  });

  it('사례 카드는 사례 주소로, 개인 프로젝트는 GitHub 새 탭으로 연결한다', () => {
    render(<ProjectGrid items={items} />);
    expect(screen.getByRole('link', { name: /혜택홈/ }).getAttribute('href')).toBe('/projects/benefit-home/');
    const gh = screen.getByRole('link', { name: /My Health Check/ });
    expect(gh.getAttribute('target')).toBe('_blank');
    expect(gh.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('제안 단계 사례에 상태를 표시한다', () => {
    render(<ProjectGrid items={items} />);
    expect(screen.getByText('제안·검토 중')).toBeTruthy();
  });

  it('주소의 stack 조건으로 흐리게 하고, 모두 보기로 해제한다', () => {
    window.history.replaceState(null, '', '/projects/?stack=Java');
    const { container } = render(<ProjectGrid items={items} />);
    expect(container.querySelectorAll('.card-wrap.is-dim')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '모두 보기' }));
    expect(container.querySelectorAll('.card-wrap.is-dim')).toHaveLength(0);
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/project-filter.test.ts tests/unit/ProjectGrid.test.tsx`
Expected: 모듈이 없어 실패

- [ ] Step 3: 구현한다

`src/lib/project-filter.ts`:

```ts
import type { DiagramId } from './diagram';
import type { Status, Team } from './teams';

export type Filter = 'all' | Team | 'personal';
export type CaseItem = {
  kind: 'case';
  slug: string;
  title: string;
  summary: string;
  team: Team;
  status: Status;
  stack: string[];
  still?: { src: string; width: number; height: number };
  diagram?: DiagramId;
  alt: string;
};
export type PersonalItem = { kind: 'personal'; slug: string; title: string; summary: string; period: string; stack: string[]; href: string };
export type GridItem = CaseItem | PersonalItem;

export const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'global', label: 'Global' },
  { id: 'retention', label: 'Retention' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'personal', label: '개인' },
];

export function matchesFilter(item: GridItem, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'personal') return item.kind === 'personal';
  return item.kind === 'case' && item.team === filter;
}

export function matchesStack(item: GridItem, stack: string | null): boolean {
  return !stack || item.stack.includes(stack);
}

export function isDimmed(item: GridItem, filter: Filter, stack: string | null): boolean {
  return !matchesFilter(item, filter) || !matchesStack(item, stack);
}

export function readStackParam(search: string): string | null {
  const value = new URLSearchParams(search).get('stack');
  return value && value.trim() ? value : null;
}
```

`src/islands/ProjectGrid.tsx`:

```tsx
import { useEffect, useState } from 'react';
import StepDiagram from './StepDiagram';
import { FILTERS, isDimmed, readStackParam, type CaseItem, type Filter, type GridItem, type PersonalItem } from '../lib/project-filter';
import { STATUS_LABEL, TEAM_LABEL } from '../lib/teams';

export default function ProjectGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [stack, setStack] = useState<string | null>(null);

  useEffect(() => {
    setStack(readStackParam(window.location.search));
  }, []);

  const clearStack = () => {
    setStack(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="project-grid">
      <div className="filters" role="group" aria-label="팀으로 거르기">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="filter" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      {stack && (
        <p className="stack-note">
          {`${stack} 사용 사례만 밝게 보여 줍니다. `}<button type="button" className="link-button" onClick={clearStack}>모두 보기</button>
        </p>
      )}
      <ul className="cards">
        {items.map((item, i) => (
          <li key={item.slug} className={isDimmed(item, filter, stack) ? 'card-wrap is-dim' : 'card-wrap'} style={{ animationDelay: `${0.1 * i}s` }}>
            {item.kind === 'case' ? <CaseCard item={item} /> : <PersonalCard item={item} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  return (
    <a className="card" href={`/projects/${item.slug}/`}>
      <div className="card-media" data-hint="눌러서 자세히">
        {item.still ? (
          <div className="phone">
            <img src={item.still.src} width={item.still.width} height={item.still.height} alt={item.alt} loading="lazy" style={{ viewTransitionName: `media-${item.slug}` }} />
          </div>
        ) : item.diagram ? (
          <div className="card-diagram" style={{ viewTransitionName: `media-${item.slug}` }}>
            <StepDiagram id={item.diagram} mode="preview" />
          </div>
        ) : null}
      </div>
      <div className="card-body">
        <span className={`team team--${item.team}`}>{TEAM_LABEL[item.team]}</span>
        {item.status !== 'done' && <span className="status">{STATUS_LABEL[item.status]}</span>}
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
      </div>
    </a>
  );
}

function PersonalCard({ item }: { item: PersonalItem }) {
  return (
    <a className="card card--text" href={item.href} target="_blank" rel="noopener noreferrer" data-hint="GitHub에서 보기">
      <div className="card-body">
        <span className="team">개인 프로젝트, {item.period}</span>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <ul className="chips">{item.stack.map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
    </a>
  );
}
```

`src/pages/projects/index.astro`를 바꾼다.

```astro
---
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import BaseLayout from '../../layouts/BaseLayout.astro';
import SectionLabel from '../../components/SectionLabel.astro';
import ProjectGrid from '../../islands/ProjectGrid';
import { inContentLang, slugOf } from '../../lib/i18n';
import { personalProjects } from '../../data/personal-projects';
import type { GridItem } from '../../lib/project-filter';

const entries = (await getCollection('projects', inContentLang)).sort((a, b) => a.data.order - b.data.order);
const cases: GridItem[] = await Promise.all(
  entries.map(async (e) => {
    const base = {
      kind: 'case' as const,
      slug: slugOf(e.id),
      title: e.data.title,
      summary: e.data.summary,
      team: e.data.team,
      status: e.data.status,
      stack: e.data.stack,
      alt: e.data.media.alt,
    };
    if (e.data.media.kind === 'gif') {
      const img = await getImage({ src: e.data.media.still, width: 300, format: 'webp' });
      return { ...base, still: { src: img.src, width: Number(img.attributes.width), height: Number(img.attributes.height) } };
    }
    return { ...base, diagram: e.data.media.diagram };
  }),
);
const items: GridItem[] = [...cases, ...personalProjects.map((p) => ({ kind: 'personal' as const, ...p }))];
---
<BaseLayout title="Projects | 지예환" description="사례 7개와 개인 프로젝트" ogImage="/open-graph/projects.png">
  <SectionLabel text="PROJECTS" level={1} />
  <ProjectGrid client:load items={items} />
</BaseLayout>
```

`src/styles/global.css` 끝에 추가한다.

```css
/* 프로젝트 목록 */
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
.filter { font: inherit; font-size: 13px; color: var(--text); background: transparent; border: 1px solid var(--accent-dark); border-radius: 4px; padding: 5px 12px; cursor: pointer; }
.filter[aria-pressed='true'], .filter:hover { background: var(--accent-dark); }
.stack-note { font-size: 14px; color: var(--text-muted); }
.link-button { font: inherit; color: var(--accent); background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; }
.cards { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.card-wrap { animation: rise 0.4s ease both; transition: opacity 0.3s ease; }
.card-wrap.is-dim { opacity: 0.25; }
.card { display: block; position: relative; height: 100%; background: var(--panel); border: 1px solid transparent; border-radius: 6px; overflow: hidden; text-decoration: none; transition: transform 0.25s ease; }
.card:hover { transform: translateY(-5px); border-color: var(--accent-dark); }
.card-media { position: relative; height: 300px; background: #0c2744; display: flex; justify-content: center; align-items: flex-start; padding-top: 16px; overflow: hidden; }
.card-media::after, .card--text::after { content: attr(data-hint); position: absolute; right: 8px; bottom: 8px; font-size: 11px; padding: 3px 7px; border-radius: 3px; background: rgba(1, 14, 27, 0.8); color: var(--accent); opacity: 0; transition: opacity 0.2s; }
.card:hover .card-media::after, .card--text:hover::after { opacity: 1; }
.card-media:has(.card-diagram) { align-items: center; padding-top: 0; }
.card-diagram { width: 100%; padding: 8px 12px; }
.phone { width: 150px; height: 272px; border-radius: 18px; overflow: hidden; border: 5px solid #1e3550; background: #000; }
.phone img { width: 100%; transition: transform 2.8s ease; }
/* 틀 안쪽 높이는 262px(272px - 테두리 5px x 2). 마우스를 올리면 이미지 끝이 틀 아래에 닿을 때까지 넘긴다. */
.card:hover .phone img { transform: translateY(calc(-100% + 262px)); }
.card-body { padding: 12px 14px 16px; }
.card-body h2 { font-size: 16px; margin: 4px 0 0; line-height: 1.4; }
.card-body p { font-size: 13px; color: var(--text-muted); margin: 6px 0 0; line-height: 1.55; }
@media (prefers-reduced-motion: reduce) {
  .card:hover { transform: none; }
  .card:hover .phone img { transform: none; }
}
```

- [ ] Step 4: 단위 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/project-filter.test.ts tests/unit/ProjectGrid.test.tsx`
Expected: 모두 통과

- [ ] Step 5: 화면 테스트를 쓴다

`tests/e2e/projects.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('카드 9개(사례 7 + 개인 2), 팀 필터로 흐리게', async ({ page }) => {
  await page.goto('/projects/');
  await expect(page.locator('.card-wrap')).toHaveCount(9);
  await page.getByRole('button', { name: 'Global' }).click();
  await expect(page.locator('.card-wrap.is-dim')).toHaveCount(6);
});

test('목록에서는 GIF를 불러오지 않는다', async ({ page }) => {
  const gifs: string[] = [];
  page.on('request', (r) => {
    if (/\/media\/.+\.gif$/.test(r.url())) gifs.push(r.url());
  });
  await page.goto('/projects/');
  await page.waitForLoadState('networkidle');
  expect(gifs).toEqual([]);
});

test('기술로 거른 주소를 바로 열 수 있다', async ({ page }) => {
  await page.goto('/projects/?stack=Kafka');
  await expect(page.getByText('Kafka 사용 사례만 밝게 보여 줍니다.')).toBeVisible();
});

test('키보드로 필터 버튼과 카드에 닿는다', async ({ page }) => {
  await page.goto('/projects/');
  const reached: string[] = [];
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    reached.push(await page.evaluate(() => document.activeElement?.className ?? ''));
  }
  expect(reached.some((c) => c.split(' ').includes('filter'))).toBe(true);
  expect(reached.some((c) => c.split(' ').includes('card'))).toBe(true);
});
```

- [ ] Step 6: 빌드하고 검사한다

Run: `npm run build && npm run test:e2e -- tests/e2e/projects.spec.ts && npm run links && npm run leak:dist`
Expected: 모두 통과

`leak:dist`가 이번에 처음 돈다. JS 번들이나 글꼴 CSS에 든 표준 이름(사내 정보가 아닌 문자열)이 티켓 키 모양으로 걸리면, 그 문자열을 `scripts/leak-check.mjs`의 `TICKET_ALLOW`에 넣고, `tests/unit/leak-check.test.ts`의 허용 목록 테스트 문장에 같은 값을 더한 뒤 다시 돌린다. 사내 정보가 걸리면 허용하지 말고 원본을 고친다.

- [ ] Step 7: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
feat: 프로젝트 목록(팀·기술 필터, 실제 화면 카드, 개인 프로젝트)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 10: 사례 페이지(세부 보기)

Files:
- Create: `src/pages/projects/[slug].astro`, `src/components/CaseHero.astro`, `src/islands/GifPlayer.tsx`
- Modify: `src/styles/global.css`(사례 페이지 절 추가)
- Test: `tests/unit/GifPlayer.test.tsx`, `tests/e2e/case.spec.ts`

Interfaces:
- Consumes: `projects` 컬렉션, `StepDiagram`, `STATUS_LABEL`, `TEAM_LABEL`, `inContentLang`과 `slugOf`(Task 8)
- Produces: 주소 `/projects/<사례>/` 7개. 윗부분 미디어는 `view-transition-name: media-<사례>`. `GifPlayer({ still: string; motion?: string; alt: string })`.

- [ ] Step 1: 실패하는 테스트를 쓴다

`tests/unit/GifPlayer.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GifPlayer from '../../src/islands/GifPlayer';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('GifPlayer', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('움직이는 화면이 없으면 정지 이미지만 보여 준다', () => {
    mockReducedMotion(false);
    render(<GifPlayer still="/s.webp" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('처음 HTML은 정지 이미지이고, 살아나면 GIF로 바꾼다', () => {
    mockReducedMotion(false);
    const html = renderToString(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(html).toContain('src="/s.webp"');
    expect(html).not.toContain('a.gif');
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
  });

  it('동작 줄이기에서는 정지 이미지와 재생 버튼을 보여 주고, 누르면 GIF로 바꾼다', () => {
    mockReducedMotion(true);
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    fireEvent.click(screen.getByRole('button', { name: '움직이는 화면 보기' }));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/GifPlayer.test.tsx`
Expected: 모듈이 없어 실패

- [ ] Step 3: 구현한다

`src/islands/GifPlayer.tsx`:

```tsx
import { useEffect, useState } from 'react';

type Props = { still: string; motion?: string; alt: string };

type Mode = 'still' | 'motion' | 'paused';

// 처음 HTML에는 정지 이미지만 넣는다. 스크립트가 없으면 정지 이미지가 최종 상태이고,
// 첫 화면에서 큰 GIF를 기다리지 않아 가장 큰 이미지가 빨리 그려진다.
// 살아나면 GIF로 바꾸고, 동작 줄이기 사용자에게는 정지 이미지와 재생 버튼을 보여 준다.
export default function GifPlayer({ still, motion, alt }: Props) {
  const [mode, setMode] = useState<Mode>('still');

  useEffect(() => {
    if (!motion) return;
    setMode(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'motion');
  }, [motion]);

  return (
    <div className="gif-player">
      <div className="phone phone--lg">
        <img src={mode === 'motion' && motion ? motion : still} alt={alt} />
      </div>
      {mode === 'paused' && (
        <button type="button" className="play-button" onClick={() => setMode('motion')}>움직이는 화면 보기</button>
      )}
    </div>
  );
}
```

`src/components/CaseHero.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import GifPlayer from '../islands/GifPlayer';
import StepDiagram from '../islands/StepDiagram';
import { STATUS_LABEL, TEAM_LABEL } from '../lib/teams';

interface Props {
  entry: CollectionEntry<'projects'>;
  slug: string;
}

const { entry, slug } = Astro.props;
const d = entry.data;
const cells = [...d.metrics.map((m) => ({ big: m.value, small: m.label })), ...d.facts.map((f) => ({ big: f, small: '' }))].slice(0, 3);
const still = d.media.kind === 'gif' ? await getImage({ src: d.media.still, width: 390, format: 'webp' }) : null;
---
<section class="case-hero">
  <div class="case-media" style={`view-transition-name: media-${slug}`}>
    {d.media.kind === 'gif' && still && <GifPlayer client:load still={still.src} motion={d.media.motion} alt={d.media.alt} />}
    {d.media.kind === 'diagram' && <StepDiagram client:visible id={d.media.diagram} mode="player" />}
  </div>
  <div class="case-info">
    <p class="case-team"><span class={`team team--${d.team}`}>{TEAM_LABEL[d.team]}</span><span class="status">{STATUS_LABEL[d.status]}</span></p>
    <h1>{d.title}</h1>
    <p class="case-meta">{d.period}, {d.role}</p>
    {cells.length > 0 && (
      <ul class="case-cells">
        {cells.map((c) => (
          <li><strong>{c.big}</strong>{c.small && <span>{c.small}</span>}</li>
        ))}
      </ul>
    )}
    <p class="case-summary">{d.summary}</p>
    {d.link && <a class="case-link" href={d.link.href} target="_blank" rel="noopener noreferrer">{d.link.label}</a>}
  </div>
</section>
```

`src/pages/projects/[slug].astro`:

```astro
---
import type { InferGetStaticPropsType } from 'astro';
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import CaseHero from '../../components/CaseHero.astro';
import { inContentLang, slugOf } from '../../lib/i18n';

export async function getStaticPaths() {
  const entries = (await getCollection('projects', inContentLang)).sort((a, b) => a.data.order - b.data.order);
  return entries.map((entry, i) => ({
    params: { slug: slugOf(entry.id) },
    props: { entry, prev: entries[i - 1] ?? null, next: entries[i + 1] ?? null },
  }));
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { entry, prev, next } = Astro.props as Props;
const slug = slugOf(entry.id);
const { Content } = await render(entry);
---
<BaseLayout title={`${entry.data.title} | 지예환`} description={entry.data.summary} ogImage={`/open-graph/projects/${slug}.png`}>
  <CaseHero entry={entry} slug={slug} />
  <article class="case-body prose"><Content /></article>
  <footer class="case-foot">
    <ul class="chips" aria-label="쓴 기술">{entry.data.stack.map((s) => <li>{s}</li>)}</ul>
    <nav class="case-nav" aria-label="다른 사례">
      {prev && <a href={`/projects/${slugOf(prev.id)}/`}>이전: {prev.data.title}</a>}
      <a href="/projects/">목록</a>
      {next && <a href={`/projects/${slugOf(next.id)}/`}>다음: {next.data.title}</a>}
    </nav>
  </footer>
</BaseLayout>
```

`src/styles/global.css` 끝에 추가한다.

```css
/* 사례 페이지 */
.case-hero { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 40px; align-items: start; background: var(--panel); border: 1px solid var(--accent-dark); border-radius: 8px; padding: 32px; animation: rise 0.35s ease both; }
@media (max-width: 820px) { .case-hero { grid-template-columns: 1fr; padding: 20px; gap: 24px; } }
.case-media { display: flex; justify-content: center; }
/* 틀 안쪽 240 x 520px = GIF 크기. 긴 정지 이미지는 윗부분만 보인다. */
.phone--lg { width: 252px; height: 532px; border-width: 6px; border-radius: 26px; }
.phone--lg img { transition: none; }
.gif-player { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.play-button { font: inherit; font-size: 13px; color: var(--text); background: var(--accent-dark); border: 0; border-radius: 4px; padding: 7px 14px; cursor: pointer; }
.case-team { margin: 0; }
.case-info h1 { font-size: 28px; margin: 6px 0 0; line-height: 1.35; }
.case-meta { font-size: 14px; color: var(--text-faint); margin: 8px 0 0; }
.case-cells { list-style: none; padding: 0; margin: 26px 0 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
@media (max-width: 520px) { .case-cells { grid-template-columns: 1fr; } }
.case-cells strong { display: block; font-size: 22px; color: var(--accent); font-variant-numeric: tabular-nums; line-height: 1.3; }
.case-cells span { font-size: 13px; color: var(--text-muted); }
.case-summary { font-size: 16px; line-height: 1.75; margin: 24px 0 0; max-width: var(--measure); }
.case-link { display: inline-block; margin-top: 18px; font-size: 14px; padding: 8px 14px; border-radius: 4px; background: var(--accent-dark); text-decoration: none; }
.case-body { margin-top: 40px; }
.case-body h2 { font-size: 20px; margin: 36px 0 10px; }
.case-foot { margin-top: 48px; border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 20px; }
.case-nav { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 16px; font-size: 14px; }
```

- [ ] Step 4: 단위 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/GifPlayer.test.tsx`
Expected: 모두 통과

- [ ] Step 5: 화면 테스트를 쓴다

`tests/e2e/case.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const CASES = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore'];

for (const slug of CASES) {
  test(`${slug}: 끝의 / 없이 바로 열어도 제목, 상태, 미디어가 보인다`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}/$`));
    await expect(page.locator('.case-info h1')).toBeVisible();
    await expect(page.locator('.case-team .status')).toBeVisible();
    await expect(page.locator('.case-media img, .case-media svg').first()).toBeVisible();
    expect(await page.locator('.case-cells li').count()).toBeLessThanOrEqual(3);
  });
}

test('혜택홈: GIF를 재생하고 공개 주소를 새 탭으로 연다', async ({ page }) => {
  const gif = page.waitForRequest(/\/media\/benefit-home\.gif$/);
  await page.goto('/projects/benefit-home/');
  await gif;
  const link = page.getByRole('link', { name: '혜택홈 열어 보기' });
  await expect(link).toHaveAttribute('href', 'https://www.musinsa.com/events/main');
  await expect(link).toHaveAttribute('target', '_blank');
});

test('정산 원장: 결정표와 재생형 그림이 동작한다', async ({ page }) => {
  await page.goto('/projects/settlement-ledger-dedup/');
  await expect(page.locator('.matrix-rank li.is-top')).toContainText('+0.55');
  await page.getByRole('button', { name: '다음' }).click();
  await expect(page.locator('.diagram-caption')).toContainText('2 / 5');
});

test.describe('동작 줄이기', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('혜택홈: GIF 대신 정지 이미지와 재생 버튼', async ({ page }) => {
    await page.goto('/projects/benefit-home/');
    await expect(page.getByRole('button', { name: '움직이는 화면 보기' })).toBeVisible();
  });
});

test.describe('스크립트 꺼짐', () => {
  test.use({ javaScriptEnabled: false });
  test('혜택홈: 정지 이미지를 보여 주고 GIF는 불러오지 않는다', async ({ page }) => {
    const gifs: string[] = [];
    page.on('request', (r) => {
      if (r.url().endsWith('.gif')) gifs.push(r.url());
    });
    await page.goto('/projects/benefit-home/');
    await expect(page.locator('.case-media img')).toHaveAttribute('src', /\.webp$/);
    expect(gifs).toEqual([]);
  });
});

test('모든 사례 페이지에서 가로 스크롤이 없다', async ({ page }) => {
  for (const slug of CASES) {
    await page.goto(`/projects/${slug}/`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, slug).toBeLessThanOrEqual(1);
  }
});

test('사례 카드를 누르면 사례 페이지로 넘어간다', async ({ page }) => {
  await page.goto('/projects/');
  await page.getByRole('link', { name: /혜택홈 새 판 서버/ }).click();
  await expect(page).toHaveURL(/\/projects\/benefit-home\/$/);
  await expect(page.locator('.case-info h1')).toContainText('혜택홈');
});
```

- [ ] Step 6: 빌드하고 검사한다

Run: `npm run build && npm run test:e2e -- tests/e2e/case.spec.ts && npm run links && npm run leak:dist`
Expected: 모두 통과

- [ ] Step 7: 목업과 비교한다

`motion-3.html`의 세부 보기(카드 이미지를 눌렀을 때 열리는 패널)와 `/projects/benefit-home/` 윗부분을 비교한다. 카드 이미지가 커지며 윗부분 미디어로 옮겨 가는지(Chrome), 휴대폰 틀, 숫자 3칸, 요약, 버튼 모양이 같은지 확인한다.

- [ ] Step 8: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
feat: 사례 페이지(세부 보기, GIF 재생, 재생형 그림, 공개 주소 링크)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 11: 경력, 소개, 트러블슈팅, 연락처 페이지

Files:
- Create: `src/lib/countup.ts`, `src/islands/CountUp.tsx`, `src/components/CareerTimeline.astro`, `src/components/Education.astro`, `src/components/TroubleCard.astro`
- Modify: `src/pages/career.astro`, `src/pages/about.astro`, `src/pages/troubleshooting.astro`, `src/pages/contact.astro`, `src/styles/global.css`(경력·소개·트러블슈팅·연락처 절 추가)
- Test: `tests/unit/countup.test.ts`, `tests/unit/CountUp.test.tsx`, `tests/e2e/pages.spec.ts`

Interfaces:
- Consumes: `career`, `education`, `skills`, `personalProjects`, `profile`, 두 컬렉션, `inContentLang`과 `slugOf`(Task 8)
- Produces: `valueAt(to: number, elapsedMs: number, durationMs?: number): number`, `CountUp({ to: number; delay?: number; duration?: number })`. 트러블슈팅 항목은 `id="<항목>"` 앵커를 가진다.

- [ ] Step 1: 실패하는 테스트를 쓴다

`tests/unit/countup.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { valueAt } from '../../src/lib/countup';

describe('valueAt', () => {
  it('0에서 시작해 최종 값에서 멈춘다', () => {
    expect(valueAt(10, 0)).toBe(0);
    expect(valueAt(10, 350)).toBe(9);
    expect(valueAt(10, 700)).toBe(10);
    expect(valueAt(10, 5000)).toBe(10);
  });
});
```

`tests/unit/CountUp.test.tsx`:

```tsx
import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CountUp from '../../src/islands/CountUp';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('CountUp', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('처음 HTML에는 최종 값이 들어 있다(스크립트가 없을 때 보이는 값)', () => {
    expect(renderToString(<CountUp to={17} />)).toContain('>17<');
  });

  it('동작 줄이기에서는 처음부터 최종 값이다', () => {
    mockReducedMotion(true);
    const { container } = render(<CountUp to={17} />);
    expect(container.textContent).toBe('17');
  });

  it('움직임이 끝나는 시점에는 반드시 최종 값이다', () => {
    mockReducedMotion(false);
    const { container } = render(<CountUp to={17} delay={300} duration={700} />);
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(container.textContent).toBe('17');
  });
});
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npx vitest run tests/unit/countup.test.ts tests/unit/CountUp.test.tsx`
Expected: 모듈이 없어 실패

- [ ] Step 3: 구현한다

`src/lib/countup.ts`:

```ts
export function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

export function valueAt(to: number, elapsedMs: number, durationMs = 700): number {
  const p = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return Math.round(to * easeOutCubic(p));
}
```

`src/islands/CountUp.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { valueAt } from '../lib/countup';

type Props = { to: number; delay?: number; duration?: number };

// HTML에는 최종 값을 넣어 둔다. 경과 시간은 실제 시계로 재고, 끝나는 시점에 최종 값을 한 번 더 넣는다
// (화면 갱신이 멈추거나 같은 시각으로 불려도 0에 멈추지 않게).
export default function CountUp({ to, delay = 300, duration = 700 }: Props) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let done = false;
    let start: number | null = null;
    const frame = () => {
      if (done) return;
      const now = performance.now();
      if (start === null) start = now;
      setValue(valueAt(to, now - start, duration));
      if (now - start < duration) raf = requestAnimationFrame(frame);
      else done = true;
    };
    setValue(0);
    const begin = window.setTimeout(() => {
      raf = requestAnimationFrame(frame);
    }, delay);
    const finish = window.setTimeout(() => {
      done = true;
      setValue(to);
    }, delay + duration + 200);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(begin);
      window.clearTimeout(finish);
    };
  }, [to, delay, duration]);

  return <span className="num">{value}</span>;
}
```

`src/components/CareerTimeline.astro`:

```astro
---
import CountUp from '../islands/CountUp';
import { career } from '../data/career';

const dotColor = (team: string) => (team === 'other' ? 'var(--team-other)' : `var(--team-${team})`);
---
<ol class="timeline">
  {career.map((e, i) => (
    <li class={e.small ? 'tl-row tl-row--small' : 'tl-row'} style={`--i:${i}`}>
      <p class="tl-date">{e.period}</p>
      <span class="tl-dot" style={`background:${dotColor(e.team)}`} aria-hidden="true"></span>
      <div class="tl-body">
        <h2>{e.title}{e.sub && <span>{e.sub}</span>}</h2>
        <ul>
          {e.bullets.map((b) => (
            <li>{b.parts.map((p) => (typeof p === 'string' ? p : <CountUp client:visible to={p.count} />))}</li>
          ))}
        </ul>
      </div>
    </li>
  ))}
</ol>
```

`src/components/Education.astro`:

```astro
---
import { education } from '../data/career';
---
<ul class="edu">
  {education.map((e) => (
    <li><span class="tl-date">{e.period}</span> {e.title}{e.sub && <span class="muted">, {e.sub}</span>}</li>
  ))}
</ul>
```

`src/components/TroubleCard.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';
import { TEAM_LABEL } from '../lib/teams';
import { slugOf } from '../lib/i18n';

interface Props {
  entry: CollectionEntry<'troubleshooting'>;
}

const { entry } = Astro.props;
const d = entry.data;
const slug = slugOf(entry.id);
const rows = [
  ['증상', d.symptom],
  ['원인', d.cause],
  ['해결', d.fix],
  ['재발 방지', d.prevention],
].filter(([, v]) => Boolean(v));
---
<article class="trouble" id={slug}>
  <span class={`team team--${d.team}`}>{TEAM_LABEL[d.team]}</span>
  <h2>{d.title}</h2>
  {d.summary && <p>{d.summary}</p>}
  {rows.length > 0 && (
    <details>
      <summary>자세히</summary>
      <dl>{rows.map(([k, v]) => (<><dt>{k}</dt><dd>{v}</dd></>))}</dl>
    </details>
  )}
  {d.related && <p class="trouble-related"><a href={`/projects/${d.related}/`}>관련 사례 보기</a></p>}
</article>
```

`src/pages/career.astro`를 바꾼다.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import CareerTimeline from '../components/CareerTimeline.astro';
import Education from '../components/Education.astro';
---
<BaseLayout title="Career | 지예환" description="Global, Retention, Purchase 팀에서 한 일" ogImage="/open-graph/career.png">
  <SectionLabel text="CAREER" level={1} />
  <CareerTimeline />
  <SectionLabel text="EDUCATION" />
  <Education />
</BaseLayout>
```

`src/pages/about.astro`를 바꾼다.

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import Education from '../components/Education.astro';
import profilePhoto from '../assets/profile.jpg';
import { inContentLang } from '../lib/i18n';
import { profile } from '../data/profile';
import { skills } from '../data/skills';
import { personalProjects } from '../data/personal-projects';

const cases = await getCollection('projects', inContentLang);
const used = new Set([...cases.flatMap((c) => c.data.stack), ...personalProjects.flatMap((p) => p.stack)]);
---
<BaseLayout title="About | 지예환" description={profile.intro} ogImage="/open-graph/about.png">
  <SectionLabel text="ABOUT" level={1} />
  <div class="about">
    <Image src={profilePhoto} alt="지예환 프로필 사진" width={320} class="about-photo" />
    <div class="prose">
      <p>{profile.about}</p>
      <p>{profile.workStyle}</p>
      <p><a href={profile.links.blog} target="_blank" rel="noopener noreferrer">기술 블로그</a></p>
    </div>
  </div>
  <SectionLabel text="SKILLS" />
  {skills.map((g) => (
    <section class="skill-group">
      <h3>{g.name}</h3>
      <ul class="chips">
        {g.items.map((s) => (used.has(s) ? <li><a href={`/projects/?stack=${encodeURIComponent(s)}`}>{s}</a></li> : <li>{s}</li>))}
      </ul>
    </section>
  ))}
  <SectionLabel text="EDUCATION" />
  <Education />
</BaseLayout>
```

`src/pages/troubleshooting.astro`를 바꾼다.

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import TroubleCard from '../components/TroubleCard.astro';
import { inContentLang } from '../lib/i18n';

const entries = (await getCollection('troubleshooting', inContentLang)).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Troubleshooting | 지예환" description="장애와 오류를 찾아 고친 기록" ogImage="/open-graph/troubleshooting.png">
  <SectionLabel text="TROUBLESHOOTING" level={1} />
  <ul class="troubles">
    {entries.map((e) => (<li><TroubleCard entry={e} /></li>))}
  </ul>
</BaseLayout>
```

`src/pages/contact.astro`를 바꾼다.

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SectionLabel from '../components/SectionLabel.astro';
import { profile } from '../data/profile';
---
<BaseLayout title="Contact | 지예환" description="이메일, GitHub, LinkedIn, 블로그로 연락할 수 있습니다." ogImage="/open-graph/contact.png">
  <SectionLabel text="CONTACT" level={1} />
  <ul class="contact-list">
    <li><span>이메일</span><a href={`mailto:${profile.links.email}`}>{profile.links.email}</a></li>
    <li><span>GitHub</span><a href={profile.links.github} target="_blank" rel="noopener noreferrer">github.com/EwanJee</a></li>
    <li><span>LinkedIn</span><a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn 프로필</a></li>
    <li><span>블로그</span><a href={profile.links.blog} target="_blank" rel="noopener noreferrer">ewanjee.tistory.com</a></li>
  </ul>
</BaseLayout>
```

`src/styles/global.css` 끝에 추가한다.

```css
/* 경력 */
.timeline { list-style: none; padding: 0; margin: 0 0 40px; position: relative; }
.timeline::before { content: ''; position: absolute; left: 166px; top: 8px; bottom: 8px; width: 2px; background: rgba(18, 214, 64, 0.35); transform-origin: top; animation: draw-y 0.8s ease-out 0.35s both; }
@keyframes draw-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.tl-row { display: grid; grid-template-columns: 150px 34px minmax(0, 1fr); padding: 8px 0; animation: rise 0.4s ease both; animation-delay: calc(0.45s + var(--i, 0) * 0.15s); }
.tl-date { text-align: right; font-size: 14px; color: var(--text-muted); margin: 3px 0 0; font-variant-numeric: tabular-nums; }
.tl-dot { width: 12px; height: 12px; border-radius: 50%; margin: 9px auto 0; position: relative; z-index: 1; border: 2px solid var(--bg); }
.tl-body h2 { font-size: 18px; color: var(--accent); margin: 0; font-weight: 600; }
.tl-body h2 span { color: var(--text-faint); font-weight: 400; font-size: 14px; margin-left: 8px; }
.tl-body ul { margin: 6px 0 0; padding-left: 18px; font-size: 16px; line-height: 1.7; max-width: var(--measure); }
.tl-row--small .tl-body h2 { color: var(--text); font-size: 16px; }
.num { color: var(--accent); font-weight: 600; font-variant-numeric: tabular-nums; }
.edu { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; font-size: 16px; }
.edu .tl-date { display: inline-block; width: 150px; text-align: left; margin: 0; }
@media (max-width: 720px) {
  .timeline::before { left: 7px; }
  .tl-row { grid-template-columns: 16px minmax(0, 1fr); column-gap: 10px; }
  .tl-dot { grid-row: 1; grid-column: 1; margin: 7px 0 0; }
  .tl-date { grid-row: 1; grid-column: 2; text-align: left; margin: 0; }
  .tl-body { grid-row: 2; grid-column: 2; }
  .edu .tl-date { display: block; width: auto; }
}

/* 소개 */
.about { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 32px; margin-bottom: 40px; }
@media (max-width: 720px) { .about { grid-template-columns: 1fr; } }
.about-photo { border-radius: 6px; }
.skill-group h3 { font-size: 15px; margin: 18px 0 0; }

/* 트러블슈팅 */
.troubles { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
.trouble { background: var(--panel); border-radius: 6px; padding: 16px 18px; scroll-margin-top: 90px; }
.trouble:target { outline: 1px solid var(--accent); }
.trouble h2 { font-size: 18px; margin: 6px 0 0; }
.trouble p { margin: 6px 0 0; font-size: 16px; color: var(--text-muted); max-width: var(--measure); }
.trouble details { margin-top: 10px; }
.trouble summary { cursor: pointer; font-size: 14px; color: var(--accent); }
.trouble dl { margin: 10px 0 0; display: grid; grid-template-columns: 80px minmax(0, 1fr); gap: 6px 12px; font-size: 16px; max-width: var(--measure); }
.trouble dt { color: var(--text-faint); }
.trouble dd { margin: 0; }

/* 연락처 */
.contact-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; font-size: 16px; }
.contact-list span { display: inline-block; width: 90px; color: var(--text-faint); }
```

- [ ] Step 4: 단위 테스트 통과를 확인한다

Run: `npx vitest run tests/unit/countup.test.ts tests/unit/CountUp.test.tsx`
Expected: 모두 통과

- [ ] Step 5: 화면 테스트를 쓴다

`tests/e2e/pages.spec.ts`:

```ts
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
```

- [ ] Step 6: 빌드하고 모든 화면 테스트를 돌린다

Run: `npm run build && npm run test:e2e && npm run links && npm run leak:dist && npm run evidence`
Expected: 모두 통과

- [ ] Step 7: 커밋한다

```bash
git add -A
git commit -F - <<'EOF'
feat: 경력 타임라인, 소개, 트러블슈팅, 연락처 페이지

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 12: 링크 미리보기 이미지

Files:
- Create: `src/pages/open-graph/[...route].ts`
- Test: `tests/e2e/meta.spec.ts`

Interfaces:
- Consumes: `profile`, `projects` 컬렉션, 각 페이지의 `ogImage` 경로(Task 3, 9, 10, 11에서 정한 값), `Team`(Task 3), `inContentLang`과 `slugOf`(Task 8)
- Produces: `/open-graph/index.png`, `/open-graph/about.png`, `/open-graph/career.png`, `/open-graph/projects.png`, `/open-graph/troubleshooting.png`, `/open-graph/contact.png`, `/open-graph/projects/<사례>.png`

- [ ] Step 1: 실패하는 화면 테스트를 쓴다

`tests/e2e/meta.spec.ts`:

```ts
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
```

- [ ] Step 2: 테스트를 돌려 실패를 확인한다

Run: `npm run build && npm run test:e2e -- tests/e2e/meta.spec.ts`
Expected: 이미지 요청이 404라 실패

- [ ] Step 3: 이미지 경로를 만든다

`src/pages/open-graph/[...route].ts`:

```ts
import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { profile } from '../../data/profile';
import { inContentLang, slugOf } from '../../lib/i18n';
import type { Team } from '../../lib/teams';

// 설계 7장: 미리보기 이미지에 제목과 팀 색을 넣는다. 팀이 없는 페이지는 강조 초록을 쓴다.
type RGB = [number, number, number];
type OgPage = { title: string; description: string; color: RGB };

const ACCENT: RGB = [18, 214, 64];
const TEAM_RGB: Record<Team, RGB> = { global: [93, 173, 226], retention: [245, 176, 65], purchase: [195, 155, 211] };

const cases = await getCollection('projects', inContentLang);

const pages: Record<string, OgPage> = {
  index: { title: `${profile.nameKo} ${profile.nameEn}`, description: profile.intro, color: ACCENT },
  about: { title: 'About', description: profile.intro, color: ACCENT },
  career: { title: 'Career', description: 'Global, Retention, Purchase 팀에서 한 일', color: ACCENT },
  projects: { title: 'Projects', description: '사례 7개와 개인 프로젝트', color: ACCENT },
  troubleshooting: { title: 'Troubleshooting', description: '장애와 오류를 찾아 고친 기록', color: ACCENT },
  contact: { title: 'Contact', description: '이메일, GitHub, LinkedIn, 블로그로 연락할 수 있습니다.', color: ACCENT },
  ...Object.fromEntries(
    cases.map((c) => [`projects/${slugOf(c.id)}`, { title: c.data.title, description: c.data.summary, color: TEAM_RGB[c.data.team] }]),
  ),
};

// astro-og-canvas 0.13은 경로 파라미터 이름을 파일 이름(`[...route]`)에서 읽는다(`param` 옵션 없음).
export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[1, 14, 27]],
    border: { color: page.color, width: 12, side: 'inline-start' },
    padding: 80,
    font: {
      title: { families: ['Pretendard'], weight: 'Bold', size: 64, color: [255, 255, 255] },
      description: { families: ['Pretendard'], weight: 'Normal', size: 34, color: [205, 214, 224] },
    },
    fonts: [
      './node_modules/pretendard/dist/public/static/Pretendard-Bold.otf',
      './node_modules/pretendard/dist/public/static/Pretendard-Regular.otf',
    ],
  }),
});
```

- [ ] Step 4: 테스트 통과를 확인하고 이미지를 눈으로 본다

Run: `npm run build && npm run test:e2e -- tests/e2e/meta.spec.ts`
Expected: 모두 통과

`dist/open-graph/index.png`와 `dist/open-graph/projects/benefit-home.png`를 열어 한글 제목이 깨지지 않았는지, 사례 이미지의 왼쪽 선이 팀 색(혜택홈은 Retention 주황 `#f5b041`)인지 본다.

- [ ] Step 5: 커밋한다

```bash
npm run leak
git add -A
git commit -F - <<'EOF'
feat: 페이지별 링크 미리보기 이미지

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
```

### Task 13: 배포 워크플로를 Astro 빌드로 바꾸기

Files:
- Modify: `.github/workflows/deploy.yml`
- Delete: `scripts/stage-static-site.sh`, `tests/stage-static-site.test.sh`

Interfaces:
- Consumes: npm 스크립트(Task 1), GitHub 저장소 비밀값 `LEAK_DENYLIST`(사용자가 등록)
- Produces: `master`와 `renewal` push마다 설치·검사·빌드를 돌리고, `master`에서만 배포한다.

- [ ] Step 1: 사용자에게 비밀값 등록을 요청한다

사용자에게 다음을 안내하고 끝났다는 답을 기다린다.
- `EwanJee` 계정으로 `https://github.com/EwanJee/PortFolioKR/settings/secrets/actions`를 연다.
- New repository secret → Name `LEAK_DENYLIST`, Secret에는 이 맥 저장소 루트의 `.leak-denylist` 내용 전체를 붙여 넣는다(한 줄에 하나).

- [ ] Step 2: 워크플로를 바꾼다

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [master, renewal]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: pages-${{ github.ref }}
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - name: Leak check (source)
        run: npm run leak
        env:
          LEAK_DENYLIST: ${{ secrets.LEAK_DENYLIST }}
      - run: npm run check
      - run: npm test
      - run: npm run build
      - name: Leak check (dist)
        run: npm run leak:dist
        env:
          LEAK_DENYLIST: ${{ secrets.LEAK_DENYLIST }}
      - run: npm run links
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    if: github.ref == 'refs/heads/master'
    needs: build
    runs-on: ubuntu-latest
    # 배포 권한은 배포 잡에만 준다(빌드 잡은 외부 패키지 코드를 실행한다).
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] Step 3: 옛 스테이징 파일을 지우고 YAML을 확인한다

```bash
git rm -q scripts/stage-static-site.sh tests/stage-static-site.test.sh
ruby -ryaml -e 'y = YAML.load_file(".github/workflows/deploy.yml"); puts y["jobs"].keys.join(","); puts y["jobs"]["deploy"]["if"]'
```

Expected: `build,deploy`와 `github.ref == 'refs/heads/master'`

- [ ] Step 4: 로컬에서 CI와 같은 순서로 돌린다

Run: `npm ci && npm run verify`
Expected: 모든 단계 통과(근거 확인 포함)

- [ ] Step 5: 커밋하고 `renewal`을 올려 CI를 확인한다

```bash
git add -A
git commit -F - <<'EOF'
ci: Astro 빌드와 공개 전 검사를 거쳐 배포

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
git push -u origin renewal
SHA=$(git rev-parse HEAD)
for i in $(seq 1 40); do
  st=$(gh api "repos/EwanJee/PortFolioKR/actions/workflows/deploy.yml/runs?head_sha=$SHA&per_page=1" --jq '.workflow_runs[0] | "\(.status) \(.conclusion)"')
  echo "$st"
  case "$st" in completed*) break;; esac
  sleep 20
done
RUN=$(gh api "repos/EwanJee/PortFolioKR/actions/workflows/deploy.yml/runs?head_sha=$SHA&per_page=1" --jq '.workflow_runs[0].id')
gh run view "$RUN" -R EwanJee/PortFolioKR --log | grep -o 'leak-check: 비공개 목록 [0-9]*개' | sort -u
```

`head_sha`로 방금 올린 커밋의 실행만 본다. `gh`는 이 저장소의 SSH 별칭 원격을 알아보지 못하므로 `-R EwanJee/PortFolioKR`를 붙인다.

Expected: 상태 마지막 줄 `completed success`(`renewal`이라 build만 돌고 deploy는 건너뛴다). 마지막 명령은 `leak-check: 비공개 목록 N개`(N은 1 이상)를 출력한다. 출력이 없거나 0개면 비밀값 `LEAK_DENYLIST`가 비었거나 이름이 틀린 것이므로 Step 1로 돌아간다. 실패하면 `gh run view "$RUN" -R EwanJee/PortFolioKR --log-failed`로 실패 단계를 보고 고친다. `npm ci`가 lockfile 문제로 실패하면 `npm install --package-lock-only`로 lockfile을 다시 만들고 Task 1 lockfile 테스트를 다시 돌린 뒤 커밋한다.

### Task 14: 최종 확인과 공개

Files:
- Create: `scripts/screenshots.mjs`

Interfaces:
- Consumes: 모든 이전 작업
- Produces: `master` 반영과 `https://ewanjee.com` 공개

- [ ] Step 1: 전체 검사와 화면 테스트를 돌린다

```bash
npm run verify
npm run test:e2e
```

Expected: 모두 통과

- [ ] Step 2: 화면 캡처 스크립트를 쓰고 캡처한다

`scripts/screenshots.mjs`:

```js
#!/usr/bin/env node
// 모든 페이지를 데스크톱, 모바일, 동작 줄이기 상태로 캡처해 비공개 폴더에 저장한다(검토용, 설계 9장).
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = join(process.env.PORTFOLIO_PRIVATE_DIR ?? '../portfolio-private', 'screenshots');
mkdirSync(out, { recursive: true });
const base = process.env.BASE_URL ?? 'http://localhost:4321';
const cases = ['tokyo-popup-chatbot', 'japan-retention-mvp', 'member-privacy-api', 'benefit-home', 'alerting', 'settlement-ledger-dedup', 'first-payment-restore'];
const routes = ['/', '/about/', '/career/', '/projects/', ...cases.map((slug) => `/projects/${slug}/`), '/troubleshooting/', '/contact/', '/404.html'];
const variants = [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ['reduced', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }],
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, options] of variants) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    const file = join(out, `${name}${route.replaceAll('/', '_')}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
  await context.close();
}
await browser.close();
```

```bash
npm run build
python3 -m http.server 4321 --directory dist >/dev/null 2>&1 &
SERVER=$!
sleep 1
node scripts/screenshots.mjs
```

캡처 42장(14개 주소 × 3가지 상태)을 하나씩 열어 본다. 글자가 겹치거나 잘린 곳, 가로로 넘치는 곳, 움직임이 멈춘 상태에서 비어 보이는 곳을 고친다.

- [ ] Step 3: Lighthouse 점수를 잰다

```bash
for path in / /projects/ /projects/benefit-home/; do
  npx --yes lighthouse@13.4.1 "http://localhost:4321$path" --only-categories=performance,accessibility,seo --output=json --output-path=/tmp/lh.json --quiet --chrome-flags="--headless=new" >/dev/null 2>&1
  python3 -c "import json,sys; d=json.load(open('/tmp/lh.json'))['categories']; print(sys.argv[1], {k: round(v['score']*100) for k,v in d.items()})" "$path"
done
kill "$SERVER"
```

Expected: 세 주소 모두 performance, accessibility, seo가 90 이상. 90 미만이면 Lighthouse가 알려 준 항목(이미지 크기, 대비, 누락된 속성 등)을 고치고 다시 잰다.

- [ ] Step 4: 사용자에게 내용 검토를 받는다

`python3 -m http.server 4321 --directory dist`로 띄운 로컬 사이트 주소(`http://localhost:4321/`)와 캡처 폴더 위치를 알려 준다. 모든 문구, 수치, 사진, GIF를 사용자가 확인하게 한다. 고칠 곳은 해당 MDX나 데이터 파일을 고치고 Step 1부터 다시 돌린다.

- [ ] Step 5: 스크린샷 스크립트를 커밋하고 `master`에 합친다

사용자가 공개해도 된다고 확인한 뒤에만 진행한다.

```bash
git add scripts/screenshots.mjs
git commit -F - <<'EOF'
chore: 검토용 화면 캡처 스크립트

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7
EOF
git push origin renewal
git fetch origin
git switch master
git merge --ff-only origin/master
git merge --no-ff renewal -m 'feat: ewanjee.com 개편을 master에 합친다' -m $'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01G9Qpw2CC7qHeQ1Hn846tQ7'
MERGE_SHA=$(git rev-parse HEAD)
echo "$MERGE_SHA"
git push origin master
```

합친 커밋을 하나 남겨야(`--no-ff`) 문제가 생겼을 때 그 커밋 하나를 되돌려 예전 사이트로 돌아갈 수 있다. `MERGE_SHA` 값을 적어 둔다. `git merge --ff-only origin/master`가 실패하면 로컬 `master`에 올리지 않은 커밋이 있다는 뜻이므로 멈추고 `git log --oneline origin/master..master`를 사용자에게 보여 준다. `renewal`과 합칠 때 충돌이 나면 멈추고 충돌 파일을 사용자에게 보여 준다.

- [ ] Step 6: 배포를 기다리고 공개 사이트를 확인한다

```bash
for i in $(seq 1 40); do
  st=$(gh api "repos/EwanJee/PortFolioKR/actions/workflows/deploy.yml/runs?head_sha=$MERGE_SHA&per_page=1" --jq '.workflow_runs[0] | "\(.status) \(.conclusion)"')
  echo "$st"
  case "$st" in completed*) break;; esac
  sleep 20
done
curl -s -o /dev/null -w '%{http_code}\n' https://ewanjee.com/
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.ewanjee.com/
gh api repos/EwanJee/PortFolioKR/pages --jq '{build_type, cname, https_enforced}'
BASE_URL=https://ewanjee.com npx playwright test tests/e2e/layout.spec.ts tests/e2e/case.spec.ts --project=desktop
```

Expected: `completed success`, `200`, `301 https://ewanjee.com/`, `{"build_type":"workflow","cname":"ewanjee.com","https_enforced":true}`, 공개 사이트 화면 테스트 통과

- [ ] Step 7: 결과를 기록한다

되돌리는 방법은 합친 커밋 하나를 되돌리는 것이다. 되돌린 `master`는 합치기 전 상태(배포 전환 계획의 워크플로와 예전 사이트 파일)가 되고, push하면 그 워크플로가 예전 사이트를 다시 배포한다. Pages 설정의 Source는 바꾸지 않는다(배포 전환 계획의 "Deploy from a branch" 되돌리기는 이 시점부터 쓰지 않는다).

```bash
# 되돌려야 할 때만 실행한다
git switch master
git revert -m 1 --no-edit "$MERGE_SHA"
git push origin master
```

결과와 되돌리는 방법을 기록한다.

```bash
bash ~/.claude/hooks/session-decide.sh "ewanjee.com 개편 공개 완료(master 배포, 합친 커밋 $MERGE_SHA). 되돌리기: master에서 git revert -m 1 $MERGE_SHA 후 push하면 배포 전환 계획의 워크플로가 예전 사이트를 다시 배포"
```

혜택홈 트래픽 수치는 1~3개월 뒤(2026년 12월 전후) Grafana로 다시 재서 `benefit-home.mdx`와 근거 파일을 고친다. 이 일정은 사용자에게 알려 둔다.
