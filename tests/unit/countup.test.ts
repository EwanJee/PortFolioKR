import { describe, expect, it } from 'vitest';
import { valueAt } from '../../src/lib/countup';

describe('valueAt', () => {
  it('0에서 시작해 최종 값에서 멈춘다', () => {
    expect(valueAt(10, 0)).toBe(0);
    expect(valueAt(10, 350)).toBe(9);
    expect(valueAt(10, 700)).toBe(10);
    expect(valueAt(10, 5000)).toBe(10);
  });
});
