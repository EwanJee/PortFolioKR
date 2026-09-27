import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GifPlayer from '../../src/islands/GifPlayer';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduce && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));
}

describe('GifPlayer', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('움직이는 화면이 없으면 정지 이미지만 보여 준다', () => {
    mockReducedMotion(false);
    render(<GifPlayer still="/s.webp" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('처음 HTML은 정지 이미지이고, 살아나면 GIF로 바꾼다', () => {
    mockReducedMotion(false);
    const html = renderToString(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(html).toContain('src="/s.webp"');
    expect(html).not.toContain('a.gif');
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
  });

  it('동작 줄이기에서는 정지 이미지와 재생 버튼을 보여 주고, 누르면 GIF로 바꾼다', () => {
    mockReducedMotion(true);
    render(<GifPlayer still="/s.webp" motion="/media/a.gif" alt="화면" />);
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/s.webp');
    fireEvent.click(screen.getByRole('button', { name: '움직이는 화면 보기' }));
    expect(screen.getByAltText('화면').getAttribute('src')).toBe('/media/a.gif');
  });
});
