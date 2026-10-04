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
    for (const file of files(dir, ['.mdx', '.ts', '.html'])) {
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
  const missing = findMissing(['src/content', 'src/data', 'src/lib', 'src/documents'], known);
  for (const m of missing) console.log(`MISSING ${m}`);
  if (missing.length > 0) {
    console.log(`evidence-check: ${missing.length}건`);
    process.exit(1);
  }
  console.log(`evidence-check: 근거 ${known.size}개, 누락 0건`);
}
