import { describe, expect, it } from 'vitest';
import { legacyTarget } from '../../src/lib/legacy-redirects';

describe('legacyTarget', () => {
  it.each([
    ['#about', '/about/'],
    ['#education', '/about/'],
    ['#skills', '/about/'],
    ['#experience', '/career/'],
    ['#roadmap', '/career/'],
    ['#portfolio', '/projects/'],
    ['#contacts', '/contact/'],
  ])('%s → %s', (hash, target) => {
    expect(legacyTarget(hash)).toBe(target);
  });

  it('모르는 해시는 넘기지 않는다', () => {
    expect(legacyTarget('#header')).toBeNull();
    expect(legacyTarget('')).toBeNull();
  });
});
