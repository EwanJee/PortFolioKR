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
