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
