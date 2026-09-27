import { describe, expect, it } from 'vitest';
import { CRITERIA, OPTIONS, rank } from '../../src/lib/decision-matrix';

const weights = CRITERIA.map((c) => c.weight);

describe('rank', () => {
  it('ADR 가중치에서 값 통일 후 유니크 키가 1위(+0.55), 쓰기 주체 통합이 2위(+0.40)다', () => {
    const r = rank(OPTIONS, weights);
    expect(r.map((x) => [x.option.id, x.score])).toEqual([
      ['o1', 0.55],
      ['o4', 0.4],
      ['o2', 0.1],
      ['o3', 0.1],
      ['o5', 0.05],
      ['datum', 0],
      ['o6', -0.05],
    ]);
  });

  it('운영 단순성 가중치를 0으로 하면 1·2위가 같은 점수가 된다', () => {
    const w = [...weights];
    w[2] = 0;
    const r = rank(OPTIONS, w);
    expect(r[0].score).toBe(r[1].score);
    expect(r[0].option.id).toBe('o1');
  });

  it('가중치가 모두 0이면 모두 0점이다', () => {
    expect(rank(OPTIONS, weights.map(() => 0)).every((x) => x.score === 0)).toBe(true);
  });
});
