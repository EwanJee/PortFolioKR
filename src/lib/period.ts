// "2026.06 ~ 2026.09", "2026.09 ~", "2026.04", "2025" 같은 기간 글자를 정렬용 숫자(YYYYMM)로 읽는다.
// 연도만 있으면 1월부터 12월로 보고, 끝이 비어 있으면(진행 중) 가장 늦은 끝으로 둔다.
const ONGOING = 999999;

export function periodRange(period: string): { start: number; end: number } {
  const found = [...period.matchAll(/(\d{4})(?:\.(\d{1,2}))?/g)];
  if (found.length === 0) return { start: 0, end: 0 };
  const toNum = (m: RegExpMatchArray, edge: 'start' | 'end') => Number(m[1]) * 100 + (m[2] ? Number(m[2]) : edge === 'start' ? 1 : 12);
  const start = toNum(found[0], 'start');
  const ongoing = found.length === 1 && /~\s*$/.test(period.trim());
  return { start, end: ongoing ? ONGOING : toNum(found[found.length - 1], 'end') };
}

// 최신이 먼저: 끝이 늦은 것부터, 끝이 같으면 시작이 늦은 것부터.
export function newestFirst(a: string, b: string): number {
  const x = periodRange(a);
  const y = periodRange(b);
  return y.end - x.end || y.start - x.start;
}
