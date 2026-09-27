import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FilterTabs from '../../src/islands/FilterTabs';

const options = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
];

// jsdom은 배치를 계산하지 않으므로, 탭 줄의 폭과 스크롤 위치를 직접 정한다.
function scrollState(el: HTMLElement, s: { scrollWidth: number; clientWidth: number; scrollLeft: number }) {
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: s.scrollWidth });
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: s.clientWidth });
  Object.defineProperty(el, 'scrollLeft', { configurable: true, writable: true, value: s.scrollLeft });
  fireEvent.scroll(el);
}

describe('FilterTabs', () => {
  it('탭 줄 양옆에 가려진 탭이 있으면 data-more로 그쪽을 알린다', () => {
    const { container } = render(<FilterTabs options={options} value="a" onChange={() => {}} label="거르기" />);
    const row = container.querySelector('.filters') as HTMLElement;
    scrollState(row, { scrollWidth: 500, clientWidth: 300, scrollLeft: 0 });
    expect(row.dataset.more).toBe('right');
    scrollState(row, { scrollWidth: 500, clientWidth: 300, scrollLeft: 100 });
    expect(row.dataset.more).toBe('left right');
    scrollState(row, { scrollWidth: 500, clientWidth: 300, scrollLeft: 200 });
    expect(row.dataset.more).toBe('left');
  });

  it('탭이 모두 보이면 data-more를 두지 않는다', () => {
    const { container } = render(<FilterTabs options={options} value="a" onChange={() => {}} label="거르기" />);
    const row = container.querySelector('.filters') as HTMLElement;
    scrollState(row, { scrollWidth: 300, clientWidth: 300, scrollLeft: 0 });
    expect(row.hasAttribute('data-more')).toBe(false);
  });
});
