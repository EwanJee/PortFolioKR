import { describe, expect, it } from 'vitest';
import { isCurrent, NAV } from '../../src/lib/nav';

describe('NAV', () => {
  it('Resume을 포함한 메뉴는 7개다', () => {
    expect(NAV.map((n) => n.label)).toEqual(['Home', 'About', 'Career', 'Projects', 'Troubleshooting', 'Resume', 'Contact']);
  });
});

describe('isCurrent', () => {
  it('하위 경로에서도 상위 메뉴를 현재로 본다', () => {
    expect(isCurrent('/projects/', '/projects/benefit-home/')).toBe(true);
    expect(isCurrent('/about/', '/about')).toBe(true);
  });
  it('Home은 첫 화면에서만 현재다', () => {
    expect(isCurrent('/', '/')).toBe(true);
    expect(isCurrent('/', '/about/')).toBe(false);
  });
});
