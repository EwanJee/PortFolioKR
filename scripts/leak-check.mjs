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
