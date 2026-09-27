import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StepDiagram from '../../src/islands/StepDiagram';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('StepDiagram', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('처음 HTML은 결과가 드러난 마지막 장면이다(스크립트가 없거나 동작 줄이기일 때)', () => {
    const html = renderToString(<StepDiagram id="race-condition" mode="player" />);
    expect(html).toContain('같은 옵션, 같은 상태 (중복)');
    expect(html).toContain('5 / 5.');
  });

  it('재생형은 첫 단계에서 시작하고 다음 버튼으로 넘긴다', () => {
    mockReducedMotion(false);
    render(<StepDiagram id="race-condition" mode="player" />);
    expect(screen.getByText(/1 \/ 5\./)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText(/2 \/ 5\./)).toBeTruthy();
  });

  it('유니크 키를 켜면 마지막 단계가 거절이 된다', () => {
    mockReducedMotion(false);
    render(<StepDiagram id="race-condition" mode="player" />);
    fireEvent.click(screen.getByRole('checkbox'));
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByRole('button', { name: '다음' }));
    // 그림 안의 "두 번째 INSERT 거절" 글자와 겹치지 않게 설명 문장 전체로 찾는다.
    expect(screen.getByText(/5 \/ 5\..*거절합니다/)).toBeTruthy();
  });

  it('미리보기는 1.4초마다 넘어간다', () => {
    mockReducedMotion(false);
    const { container } = render(<StepDiagram id="alert-flow" mode="preview" />);
    const label = () => container.querySelector('svg')?.getAttribute('aria-label');
    const first = label();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(label()).not.toBe(first);
  });

  it('동작 줄이기에서 미리보기는 마지막 장면에 멈춰 있다', () => {
    mockReducedMotion(true);
    const { container } = render(<StepDiagram id="alert-flow" mode="preview" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toContain('역할별 채널 5개');
  });
});
