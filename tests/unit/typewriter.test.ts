import { describe, expect, it } from 'vitest';
import { BACK_DELAY, finalState, humanize, OPENING_PAUSE, START_DELAY, TYPE_SPEED, typewriterSteps } from '../../src/lib/typewriter';

const roles = ['a Product Engineer', 'a Backend Developer'];
const take = (n: number, rand = () => 0) => {
  const gen = typewriterSteps(roles, rand);
  return Array.from({ length: n }, () => gen.next().value);
};

describe('humanize', () => {
  it('Typed.js처럼 speed ~ speed×1.5 사이다', () => {
    expect(humanize(65, () => 0)).toBe(65);
    expect(humanize(65, () => 0.999)).toBe(97);
  });
});

describe('typewriterSteps', () => {
  it('지금 사이트 문구로 시작해 역할을 입력한다', () => {
    const steps = take(18);
    expect(steps[0]).toEqual({ state: { prefix: 'I will be A ', role: '', blinking: true }, wait: START_DELAY });
    expect(steps[16].state).toEqual({ prefix: 'I will be A ', role: 'Server Developer', blinking: false });
    expect(steps[17]).toEqual({ state: { prefix: 'I will be A ', role: 'Server Developer', blinking: true }, wait: OPENING_PAUSE });
  });

  it('"will be A"를 지우고 "am"으로 고친 뒤 첫 역할을 입력한다', () => {
    const steps = take(200);
    const firstAm = steps.findIndex((s) => s.state.prefix === 'I am ');
    expect(firstAm).toBeGreaterThan(17);
    expect(steps[firstAm].state.role).toBe('');
    const typed = steps.find((s) => s.state.prefix === 'I am ' && s.state.role === 'a Product Engineer' && s.state.blinking);
    expect(typed?.wait).toBe(BACK_DELAY);
    expect(steps.every((s) => s.state.blinking || s.wait >= TYPE_SPEED)).toBe(true);
  });

  it('역할을 차례로 돌고 처음으로 돌아온다', () => {
    const shown = take(400).filter((s) => s.state.blinking && s.state.prefix === 'I am ').map((s) => s.state.role);
    expect(shown.slice(0, 3)).toEqual(['a Product Engineer', 'a Backend Developer', 'a Product Engineer']);
  });

  it('최종 상태는 첫 역할이다', () => {
    expect(finalState(roles)).toEqual({ prefix: 'I am ', role: 'a Product Engineer', blinking: false });
  });
});
