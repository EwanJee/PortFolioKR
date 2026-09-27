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

  it('팀 탭을 누르면 그 팀 카드만 남는다', () => {
    const { container } = render(<ProjectGrid items={items} />);
    fireEvent.click(screen.getByRole('button', { name: '무신사: Purchase 팀' }));
    expect(screen.getByRole('button', { name: '무신사: Purchase 팀' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /원장/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '전체' }));
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(3);
  });

  it('사례 카드의 팀 표시는 "회사명: 팀명"이다', () => {
    const { container } = render(<ProjectGrid items={items} />);
    const labels = [...container.querySelectorAll('.card .team')].map((el) => el.textContent);
    expect(labels).toContain('무신사: Retention 팀');
    expect(labels).toContain('무신사: Purchase 팀');
  });

  it('사례 카드는 사례 주소로, 개인 프로젝트는 GitHub 새 탭으로 연결한다', () => {
    render(<ProjectGrid items={items} />);
    expect(screen.getByRole('link', { name: /혜택홈/ }).getAttribute('href')).toBe('/projects/benefit-home/');
    const gh = screen.getByRole('link', { name: /My Health Check/ });
    expect(gh.getAttribute('target')).toBe('_blank');
    expect(gh.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('첫 카드 이미지는 바로 받고 우선순위를 높이며, 뒤쪽 카드 이미지는 늦게 받는다', () => {
    const withStill = (slug: string, src: string): GridItem => ({ kind: 'case', slug, title: slug, summary: 's', team: 'global', status: 'done', stack: [], still: { src, width: 300, height: 540 }, alt: slug });
    const { container } = render(<ProjectGrid items={[withStill('a', '/a.webp'), withStill('b', '/b.webp'), withStill('c', '/c.webp')]} />);
    const imgs = container.querySelectorAll('.card img');
    expect(imgs[0].getAttribute('loading')).toBe('eager');
    expect(imgs[0].getAttribute('fetchpriority')).toBe('high');
    expect(imgs[1].getAttribute('fetchpriority')).toBeNull();
    expect(imgs[2].getAttribute('loading')).toBe('lazy');
  });

  it('앞에 그림 카드가 있어도 처음 나오는 이미지 카드 둘을 바로 받고, 그중 첫 장의 우선순위를 높인다', () => {
    const withStill = (slug: string, src: string): GridItem => ({ kind: 'case', slug, title: slug, summary: 's', team: 'global', status: 'done', stack: [], still: { src, width: 300, height: 540 }, alt: slug });
    const diagramCard: GridItem = { kind: 'case', slug: 'd', title: 'd', summary: 's', team: 'purchase', status: 'done', stack: [], diagram: 'race-condition', alt: 'd' };
    const { container } = render(<ProjectGrid items={[diagramCard, withStill('a', '/a.webp'), withStill('b', '/b.webp'), withStill('c', '/c.webp')]} />);
    const imgs = container.querySelectorAll('.card img');
    expect(imgs[0].getAttribute('loading')).toBe('eager');
    expect(imgs[0].getAttribute('fetchpriority')).toBe('high');
    expect(imgs[1].getAttribute('loading')).toBe('eager');
    expect(imgs[2].getAttribute('loading')).toBe('lazy');
  });

  it('카드에 진행 중, 검토 중 같은 상태를 표시하지 않는다(사용자 지시)', () => {
    const { container } = render(<ProjectGrid items={items} />);
    expect(container.textContent).not.toMatch(/(진행|검토) ?중/);
  });

  it('모두 보기는 주소만 바꾸고 화면 전환 기록 값은 남긴다(뒤로 가기가 동작하게)', () => {
    window.history.replaceState({ index: 3, scrollX: 0, scrollY: 0 }, '', '/projects/?stack=Java');
    render(<ProjectGrid items={items} />);
    fireEvent.click(screen.getByRole('button', { name: '모두 보기' }));
    expect(window.location.search).toBe('');
    expect(window.history.state).toEqual({ index: 3, scrollX: 0, scrollY: 0 });
  });

  it('사례에 없는 기술 이름은 주소에 있어도 무시한다(임의 문구를 화면에 띄우지 않는다)', () => {
    window.history.replaceState(null, '', `/projects/?stack=${encodeURIComponent('아무 문구')}`);
    const { container } = render(<ProjectGrid items={items} />);
    expect(screen.queryByText(/사용 사례만/)).toBeNull();
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(3);
  });

  it('주소의 team 조건으로 그 탭을 눌린 채로 열고, 없는 값은 무시한다', () => {
    window.history.replaceState(null, '', '/projects/?team=purchase');
    const { container, unmount } = render(<ProjectGrid items={items} />);
    expect(screen.getByRole('button', { name: '무신사: Purchase 팀' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(1);
    unmount();
    window.history.replaceState(null, '', '/projects/?team=nope');
    const again = render(<ProjectGrid items={items} />);
    expect(again.container.querySelectorAll('.card-wrap')).toHaveLength(3);
  });

  it('링크가 없는 회사 프로젝트 카드는 누를 수 없는 카드로 그리고, "회사명: 팀명" 탭에서 보인다', () => {
    const aidt: GridItem = { kind: 'personal', slug: 'aidt', title: 'AI 디지털교과서 추천 학습', summary: 's', period: '2024.06 ~ 2024.09', stack: ['Java'], company: 'ihateflyingbugs' };
    const { container } = render(<ProjectGrid items={[...items, aidt]} />);
    const card = [...container.querySelectorAll('.card')].find((c) => c.textContent?.includes('AI 디지털교과서'));
    expect(card?.tagName).toBe('DIV');
    expect(card?.textContent).toContain('아이헤이트플라잉버그스: R&D, 2024.06 ~ 2024.09');
    fireEvent.click(screen.getByRole('button', { name: '아이헤이트플라잉버그스: R&D' }));
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '개인·부트캠프' }));
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(1);
  });

  it('주소의 stack 조건에 맞는 카드만 보이고, 모두 보기로 되돌린다', () => {
    window.history.replaceState(null, '', '/projects/?stack=Java');
    const { container } = render(<ProjectGrid items={items} />);
    expect(screen.getByText(/Java 사용 사례만 보여 줍니다/)).toBeTruthy();
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '모두 보기' }));
    expect(container.querySelectorAll('.card-wrap')).toHaveLength(3);
  });
});
