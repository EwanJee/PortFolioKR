import { describe, expect, it } from 'vitest';
import { newestFirst, periodRange } from '../../src/lib/period';

describe('periodRange', () => {
  it('기간 글자를 시작과 끝으로 읽는다(연도만 있으면 1월부터 12월)', () => {
    expect(periodRange('2026.06 ~ 2026.09')).toEqual({ start: 202606, end: 202609 });
    expect(periodRange('2026.04')).toEqual({ start: 202604, end: 202604 });
    expect(periodRange('2025')).toEqual({ start: 202501, end: 202512 });
  });
  it('끝이 비어 있으면 진행 중으로 보고 가장 늦은 끝으로 둔다', () => {
    expect(periodRange('2026.09 ~').end).toBeGreaterThan(periodRange('2026.09').end);
  });
});

describe('newestFirst', () => {
  it('끝이 늦은 것부터, 끝이 같으면 시작이 늦은 것부터 놓는다', () => {
    const periods = ['2024.10 ~ 2025.02', '2026.03 ~ 2026.04', '2026.09', '2025', '2026.04', '2026.09 ~', '2026.06 ~ 2026.09'];
    expect([...periods].sort(newestFirst)).toEqual(['2026.09 ~', '2026.09', '2026.06 ~ 2026.09', '2026.04', '2026.03 ~ 2026.04', '2025', '2024.10 ~ 2025.02']);
  });
});
