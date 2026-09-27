import { describe, expect, it } from 'vitest';
import { troubleRows } from '../../src/lib/trouble';

describe('troubleRows', () => {
  it('증상 → 문제 정의 → 접근 → 원인 → 해결 → 검증 → 재발 방지 → 기록 순서로 놓는다', () => {
    const rows = troubleRows({ record: 'r', verification: 'v', fix: 'f', cause: 'c', approach: 'a', definition: 'd', symptom: 's', prevention: 'p' });
    expect(rows.map(([label]) => label)).toEqual(['증상', '문제 정의', '접근', '원인', '해결', '검증', '재발 방지', '기록']);
    expect(rows.map(([, value]) => value)).toEqual(['s', 'd', 'a', 'c', 'f', 'v', 'p', 'r']);
  });

  it('비어 있는 칸은 뺀다', () => {
    expect(troubleRows({ symptom: 's', fix: 'f' })).toEqual([['증상', 's'], ['해결', 'f']]);
    expect(troubleRows({})).toEqual([]);
  });
});
