import { describe, expect, it } from 'vitest';
import { isHidden, readStackParam, type GridItem } from '../../src/lib/project-filter';

const caseItem: GridItem = { kind: 'case', slug: 'a', title: 'A', summary: '', team: 'retention', status: 'done', stack: ['Kotlin'], alt: '' };
const personal: GridItem = { kind: 'personal', slug: 'p', title: 'P', summary: '', period: '2025', stack: ['RabbitMQ'], href: 'https://github.com/EwanJee/x' };

describe('isHidden', () => {
  it('팀 탭과 맞지 않으면 숨긴다', () => {
    expect(isHidden(caseItem, 'all', null)).toBe(false);
    expect(isHidden(caseItem, 'retention', null)).toBe(false);
    expect(isHidden(caseItem, 'global', null)).toBe(true);
    expect(isHidden(personal, 'personal', null)).toBe(false);
    expect(isHidden(personal, 'retention', null)).toBe(true);
  });
  it('기술 조건과 맞지 않으면 숨긴다', () => {
    expect(isHidden(caseItem, 'all', 'Kotlin')).toBe(false);
    expect(isHidden(personal, 'all', 'Kotlin')).toBe(true);
  });
});

describe('readStackParam', () => {
  it('stack 쿼리를 읽는다', () => {
    expect(readStackParam('?stack=Spring%20Boot')).toBe('Spring Boot');
    expect(readStackParam('')).toBeNull();
    expect(readStackParam('?stack=')).toBeNull();
  });
});
