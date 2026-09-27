import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Typewriter from '../../src/islands/Typewriter';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('Typewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('처음 HTML에는 첫 역할 문구가 들어 있고 숨기지 않는다(스크립트가 없어도 바로 보임)', () => {
    const html = renderToString(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    expect(html).toContain('a Product Engineer');
    expect(html).not.toContain('data-pending');
  });

  it('동작 줄이기: 첫 역할에 멈춰 있다', () => {
    mockReducedMotion(true);
    const { container } = render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container.querySelector('.typed-visible')?.textContent).toContain('I am a Product Engineer');
  });

  it('움직임: 첫 역할에서 시작해 다음 역할로 넘어가고, I will be 문구는 없다', () => {
    mockReducedMotion(false);
    const { container } = render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    const text = () => container.querySelector('.typed-visible')?.textContent ?? '';
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(text()).toContain('I am a Product Engineer');
    // 1.5초 멈춘 뒤 18글자를 지우고 "a Backend"를 입력하면, 글자 간격이 가장 빠르든(65ms) 느리든(97ms) 4.6초 무렵에 보인다.
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(text()).toContain('I am a Backend');
    expect(text()).not.toContain('I will be');
  });

  it('가장 긴 문구만큼 자리를 잡는 숨은 문구가 모든 줄에 있고, 화면 낭독기에는 숨긴다', () => {
    mockReducedMotion(true);
    const { container } = render(<Typewriter roles={['a Product Engineer', 'building order & claim systems']} />);
    const sizers = [...container.querySelectorAll('.typed-sizer')];
    expect(sizers.map((s) => s.textContent)).toEqual(['I am a Product Engineer|', 'I am building order & claim systems|']);
    expect(sizers.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('화면 낭독기에는 모든 역할을 한 번에 알려 준다', () => {
    mockReducedMotion(true);
    render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    expect(screen.getByText('I am a Product Engineer, a Backend Developer')).toBeTruthy();
  });
});
