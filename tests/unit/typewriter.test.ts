import { describe, expect, it } from 'vitest';
import { BACK_DELAY, finalState, humanize, OPENING_PAUSE, TYPE_SPEED, typewriterSteps } from '../../src/lib/typewriter';

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
  it('처음 HTML과 같은 첫 역할에서 시작해 잠시 멈춘다', () => {
    const steps = take(1);
    expect(steps[0]).toEqual({ state: { prefix: 'I am ', role: 'a Product Engineer', blinking: true }, wait: OPENING_PAUSE });
  });

  it('"I will be" 시작 문구 없이 늘 "I am"으로 역할만 지우고 입력한다', () => {
    const steps = take(400);
    expect(steps.every((s) => s.state.prefix === 'I am ')).toBe(true);
    const typed = steps.find((s) => s.state.role === 'a Backend Developer' && s.state.blinking);
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
