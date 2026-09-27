import { describe, expect, it } from 'vitest';
import { CONTENT_LANG, inContentLang, slugOf } from '../../src/lib/i18n';

describe('i18n', () => {
  it('지금 콘텐츠 언어는 한국어다', () => {
    expect(CONTENT_LANG).toBe('ko');
  });

  it('콘텐츠 언어 폴더의 항목만 고르고, 폴더 이름을 뺀 주소 이름을 만든다', () => {
    expect(inContentLang({ id: 'ko/benefit-home' })).toBe(true);
    expect(inContentLang({ id: 'en/benefit-home' })).toBe(false);
    expect(slugOf('ko/benefit-home')).toBe('benefit-home');
  });
});
