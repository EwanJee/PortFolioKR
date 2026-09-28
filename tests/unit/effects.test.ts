import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/scripts/typewriter';
import '../../src/scripts/countup';

let reveal: () => void;
const disconnect = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) {
      reveal = () => callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    observe() {}
    disconnect = disconnect;
  });
});
afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function mountTypewriter() {
  const el = document.createElement('portfolio-typewriter');
  el.dataset.roles = JSON.stringify(['a Product Engineer', 'a Backend Developer']);
  el.innerHTML = '<span class="typed-visible">I am <span class="typed-role">a Product Engineer</span><span class="typed-cursor">|</span></span>';
  document.body.append(el);
  return el;
}

function mountCountup() {
  const el = document.createElement('portfolio-countup');
  el.dataset.to = '17';
  el.innerHTML = '<span class="num">17</span>';
  document.body.append(el);
  return el;
}

describe('가벼운 화면 효과', () => {
  it('타이핑은 첫 문구에서 다음 역할로 넘어가며, 화면을 떠나면 타이머가 멈춘다', () => {
    const el = mountTypewriter();
    vi.advanceTimersByTime(600);
    expect(el.textContent).toContain('I am a Product Engineer');
    vi.advanceTimersByTime(4000);
    expect(el.textContent).toContain('I am a Backend');
    el.remove();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('동작 줄이기에서는 문구와 최종 숫자가 고정된다', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const typing = mountTypewriter();
    const count = mountCountup();
    vi.advanceTimersByTime(10000);
    expect(typing.textContent).toContain('I am a Product Engineer');
    expect(count.textContent).toBe('17');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('숫자는 화면에 들어올 때 시작하고, 프레임이 지연돼도 최종 값에 도달한다', () => {
    const el = mountCountup();
    expect(el.textContent).toBe('17');
    reveal();
    expect(el.textContent).toBe('0');
    vi.advanceTimersByTime(1300);
    expect(el.textContent).toBe('17');
    expect(disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('숫자 재생 중 페이지를 떠나면 예약된 작업을 모두 해제한다', () => {
    const el = mountCountup();
    reveal();
    el.remove();
    expect(vi.getTimerCount()).toBe(0);
    expect(disconnect).toHaveBeenCalled();
  });
});
