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

  it('세로 휠을 탭 줄의 가로 이동으로 바꾸고, 줄 단위 휠(Firefox)도 픽셀로 환산한다', () => {
    const { container } = render(<FilterTabs options={options} value="a" onChange={() => {}} label="거르기" />);
    const row = container.querySelector('.filters') as HTMLElement;
    scrollState(row, { scrollWidth: 500, clientWidth: 300, scrollLeft: 0 });
    const pixel = new WheelEvent('wheel', { deltaY: 40, cancelable: true });
    row.dispatchEvent(pixel);
    expect(row.scrollLeft).toBe(40);
    expect(pixel.defaultPrevented).toBe(true);
    const line = new WheelEvent('wheel', { deltaY: 3, deltaMode: WheelEvent.DOM_DELTA_LINE, cancelable: true });
    row.dispatchEvent(line);
    expect(row.scrollLeft).toBe(40 + 3 * 16);
  });

  it('끝에 닿았거나 가로 밀기면 휠을 막지 않아 페이지가 움직인다', () => {
    const { container } = render(<FilterTabs options={options} value="a" onChange={() => {}} label="거르기" />);
    const row = container.querySelector('.filters') as HTMLElement;
    scrollState(row, { scrollWidth: 500, clientWidth: 300, scrollLeft: 200 });
    const atEnd = new WheelEvent('wheel', { deltaY: 40, cancelable: true });
    row.dispatchEvent(atEnd);
    expect(atEnd.defaultPrevented).toBe(false);
    const sideways = new WheelEvent('wheel', { deltaX: -30, deltaY: 5, cancelable: true });
    row.dispatchEvent(sideways);
    expect(sideways.defaultPrevented).toBe(false);
  });

  it('탭이 모두 보이면 data-more를 두지 않는다', () => {
    const { container } = render(<FilterTabs options={options} value="a" onChange={() => {}} label="거르기" />);
    const row = container.querySelector('.filters') as HTMLElement;
    scrollState(row, { scrollWidth: 300, clientWidth: 300, scrollLeft: 0 });
    expect(row.hasAttribute('data-more')).toBe(false);
  });
});
