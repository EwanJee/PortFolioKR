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
