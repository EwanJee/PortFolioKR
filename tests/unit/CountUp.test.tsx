import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CountUp from '../../src/islands/CountUp';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('CountUp', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('처음 HTML에는 최종 값이 들어 있다(스크립트가 없을 때 보이는 값)', () => {
    expect(renderToString(<CountUp to={17} />)).toContain('>17<');
  });

  it('동작 줄이기에서는 처음부터 최종 값이다', () => {
    mockReducedMotion(true);
    const { container } = render(<CountUp to={17} />);
    expect(container.textContent).toBe('17');
  });

  it('움직임이 끝나는 시점에는 반드시 최종 값이다', () => {
    mockReducedMotion(false);
    const { container } = render(<CountUp to={17} delay={300} duration={700} />);
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(container.textContent).toBe('17');
  });
});
