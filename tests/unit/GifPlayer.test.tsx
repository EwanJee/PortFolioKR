import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GifPlayer from '../../src/islands/GifPlayer';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

// jsdom은 문서를 곧바로 다 받은 상태로 두므로, 아직 받는 중인 페이지를 흉내 낸다.
function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => state });
}

describe('GifPlayer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    delete (document as { readyState?: DocumentReadyState }).readyState;
  });

  it('움직이는 화면이 없으면 정지 이미지만 보여 준다', () => {
    mockReducedMotion(false);
    render(<GifPlayer still="/s.webp" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('처음 HTML은 정지 이미지이고, 페이지와 정지 이미지를 다 받고 0.5초 뒤에 GIF로 바꾼다', () => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    const html = renderToString(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(html).toContain('src="/s.webp"');
    expect(html).not.toContain('a.gif');
    setReadyState('loading');
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    const src = () => screen.getByAltText('화면').getAttribute('src');
    expect(screen.getByAltText('화면').getAttribute('fetchpriority')).toBe('high');
    fireEvent.load(screen.getByAltText('화면'));
    act(() => vi.advanceTimersByTime(2000));
    expect(src()).toBe('/s.webp');
    setReadyState('complete');
    act(() => {
      window.dispatchEvent(new Event('load'));
    });
    act(() => vi.advanceTimersByTime(499));
    expect(src()).toBe('/s.webp');
    act(() => vi.advanceTimersByTime(1));
    expect(src()).toBe('/media/a.gif');
    expect(screen.getByAltText('화면').getAttribute('fetchpriority')).toBe('low');
  });

  it('이미 다 받은 페이지로 넘어오면 정지 이미지를 받은 뒤에 GIF로 바꾼다', () => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    fireEvent.load(screen.getByAltText('화면'));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
  });

  it('동작 줄이기에서는 정지 이미지와 재생 버튼을 보여 주고, 같은 버튼으로 재생과 멈춤을 오간다', () => {
    mockReducedMotion(true);
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    const button = screen.getByRole('button', { name: '움직이는 화면 보기' });
    button.focus();
    fireEvent.click(button);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
    // 버튼을 새로 만들지 않고 글자만 바꿔야 포커스가 남는다.
    expect(screen.getByRole('button', { name: '움직이는 화면 멈추기' })).toBe(button);
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
  });

  it('움직임이 켜진 사용자도 재생 중인 GIF를 멈출 수 있다', () => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    fireEvent.load(screen.getByAltText('화면'));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
    fireEvent.click(screen.getByRole('button', { name: '움직이는 화면 멈추기' }));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    expect(screen.getByRole('button', { name: '움직이는 화면 보기' })).toBeTruthy();
  });

  it('재생이 시작되기 전에 멈추면 GIF를 받지 않는다', () => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    fireEvent.click(screen.getByRole('button', { name: '움직이는 화면 멈추기' }));
    fireEvent.load(screen.getByAltText('화면'));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
  });
});
