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
