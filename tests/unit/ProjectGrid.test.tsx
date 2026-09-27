import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ProjectGrid from '../../src/islands/ProjectGrid';
import type { GridItem } from '../../src/lib/project-filter';

vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }));

const items: GridItem[] = [
  { kind: 'case', slug: 'benefit-home', title: '혜택홈', summary: 's', team: 'retention', status: 'done', stack: ['Kotlin'], still: { src: '/x.webp', width: 300, height: 540 }, alt: 'a' },
  { kind: 'case', slug: 'settlement-ledger-dedup', title: '원장', summary: 's', team: 'purchase', status: 'proposed', stack: ['Java'], diagram: 'race-condition', alt: 'a' },
  { kind: 'personal', slug: 'my-health-check', title: 'My Health Check', summary: 's', period: '2025', stack: ['Kotlin'], href: 'https://github.com/EwanJee/HealthWebApp' },
];

describe('ProjectGrid', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('팀 필터를 누르면 다른 팀 카드가 흐려진다', () => {
    const { container } = render(<ProjectGrid items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Purchase' }));
    expect(screen.getByRole('button', { name: 'Purchase' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('.card-wrap.is-dim')).toHaveLength(2);
  });

  it('사례 카드는 사례 주소로, 개인 프로젝트는 GitHub 새 탭으로 연결한다', () => {
    render(<ProjectGrid items={items} />);
    expect(screen.getByRole('link', { name: /혜택홈/ }).getAttribute('href')).toBe('/projects/benefit-home/');
    const gh = screen.getByRole('link', { name: /My Health Check/ });
    expect(gh.getAttribute('target')).toBe('_blank');
    expect(gh.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('제안 단계 사례에 상태를 표시한다', () => {
    render(<ProjectGrid items={items} />);
    expect(screen.getByText('제안·검토 중')).toBeTruthy();
  });

  it('주소의 stack 조건으로 흐리게 하고, 모두 보기로 해제한다', () => {
    window.history.replaceState(null, '', '/projects/?stack=Java');
    const { container } = render(<ProjectGrid items={items} />);
    expect(container.querySelectorAll('.card-wrap.is-dim')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '모두 보기' }));
    expect(container.querySelectorAll('.card-wrap.is-dim')).toHaveLength(0);
  });
});
