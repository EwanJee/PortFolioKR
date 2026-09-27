import { describe, expect, it } from 'vitest';
import { isDimmed, readStackParam, type GridItem } from '../../src/lib/project-filter';

const caseItem: GridItem = { kind: 'case', slug: 'a', title: 'A', summary: '', team: 'retention', status: 'done', stack: ['Kotlin'], alt: '' };
const personal: GridItem = { kind: 'personal', slug: 'p', title: 'P', summary: '', period: '2025', stack: ['RabbitMQ'], href: 'https://github.com/EwanJee/x' };

describe('isDimmed', () => {
  it('팀 필터와 맞지 않으면 흐리게 한다', () => {
    expect(isDimmed(caseItem, 'all', null)).toBe(false);
    expect(isDimmed(caseItem, 'retention', null)).toBe(false);
    expect(isDimmed(caseItem, 'global', null)).toBe(true);
    expect(isDimmed(personal, 'personal', null)).toBe(false);
    expect(isDimmed(personal, 'retention', null)).toBe(true);
  });
  it('기술 조건과 맞지 않으면 흐리게 한다', () => {
    expect(isDimmed(caseItem, 'all', 'Kotlin')).toBe(false);
    expect(isDimmed(personal, 'all', 'Kotlin')).toBe(true);
  });
});

describe('readStackParam', () => {
  it('stack 쿼리를 읽는다', () => {
    expect(readStackParam('?stack=Spring%20Boot')).toBe('Spring Boot');
    expect(readStackParam('')).toBeNull();
    expect(readStackParam('?stack=')).toBeNull();
  });
});
