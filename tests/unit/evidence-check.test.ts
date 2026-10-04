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
  it('PDF 원본 HTML의 근거도 검사한다', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ev-resume-'));
    const file = join(dir, 'resume.html');
    writeFileSync(file, '<li data-evidence="E-known E-missing">실적</li>');
    expect(findMissing([dir], new Set(['E-known']))).toEqual([`${file}: E-missing`]);
  });
});
