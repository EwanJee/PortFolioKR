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

  it('처음 HTML에는 최종 문구가 들어 있다(스크립트가 없을 때 보이는 값)', () => {
    const html = renderToString(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    expect(html).toContain('a Product Engineer');
    expect(html).toContain('data-pending');
  });

  it('동작 줄이기: 첫 역할에 멈춰 있고 바로 보인다', () => {
    mockReducedMotion(true);
    const { container } = render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container.querySelector('.typed-visible')?.textContent).toContain('I am a Product Engineer');
    expect(container.querySelector('.typed')?.hasAttribute('data-pending')).toBe(false);
  });

  it('움직임: 지금 사이트 문구로 시작한다', () => {
    mockReducedMotion(false);
    const { container } = render(<Typewriter roles={['a Product Engineer']} />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(container.querySelector('.typed-visible')?.textContent).toContain('I will be A S');
  });

  it('화면 낭독기에는 모든 역할을 한 번에 알려 준다', () => {
    mockReducedMotion(true);
    render(<Typewriter roles={['a Product Engineer', 'a Backend Developer']} />);
    expect(screen.getByText('I am a Product Engineer, a Backend Developer')).toBeTruthy();
  });
});
