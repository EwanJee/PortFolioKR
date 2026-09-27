import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DecisionMatrix from '../../src/islands/DecisionMatrix';

describe('DecisionMatrix', () => {
  it('처음에는 값 통일 후 유니크 키가 맨 위에 +0.55로 보인다', () => {
    const { container } = render(<DecisionMatrix />);
    const top = container.querySelector('.matrix-rank li.is-top');
    expect(top?.textContent).toContain('값 통일 후 원장 유니크 키');
    expect(top?.textContent).toContain('+0.55');
  });

  it('가중치를 바꾸면 점수가 다시 계산되고, 처음 가중치로 되돌릴 수 있다', () => {
    const { container } = render(<DecisionMatrix />);
    fireEvent.change(screen.getByLabelText('운영 단순성 가중치'), { target: { value: '0' } });
    expect(container.querySelector('.matrix-rank li.is-top')?.textContent).toContain('+0.65');
    fireEvent.click(screen.getByRole('button', { name: '처음 가중치로' }));
    expect(container.querySelector('.matrix-rank li.is-top')?.textContent).toContain('+0.55');
  });
});
