import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TroubleList, { type TroubleItem } from '../../src/islands/TroubleList';

const items: TroubleItem[] = [
  { slug: 'a', title: 'A 건', team: 'global', summary: '요약 A', rows: [['증상', '증상 A'], ['해결', '해결 A']] },
  { slug: 'b', title: 'B 건', team: 'retention', rows: [] },
  { slug: 'c', title: 'C 건', team: 'retention', rows: [['원인', '원인 C']], related: 'benefit-home' },
];

describe('TroubleList', () => {
  it('기록이 있는 팀만 탭으로 보여 주고, 누르면 그 팀 기록만 남는다', () => {
    const { container } = render(<TroubleList items={items} />);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['전체', '무신사: Retention 팀', '무신사: Global 팀']);
    fireEvent.click(screen.getByRole('button', { name: '무신사: Retention 팀' }));
    expect(screen.getByRole('button', { name: '무신사: Retention 팀' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelectorAll('article.trouble')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: '전체' }));
    expect(container.querySelectorAll('article.trouble')).toHaveLength(3);
  });

  it('카드는 주소의 #으로 바로 열 수 있고, 팀은 "회사명: 팀명"으로, 펼침 칸과 관련 사례 링크를 그린다', () => {
    const { container } = render(<TroubleList items={items} />);
    const a = container.querySelector('article#a');
    expect(a?.querySelector('.team')?.textContent).toBe('무신사: Global 팀');
    expect(a?.querySelector('summary')?.textContent).toBe('자세히');
    expect([...(a?.querySelectorAll('dt') ?? [])].map((d) => d.textContent)).toEqual(['증상', '해결']);
    expect(container.querySelector('article#c a')?.getAttribute('href')).toBe('/projects/benefit-home/');
  });

  it('펼칠 내용이 없는 기록은 제목만 보여 준다', () => {
    const { container } = render(<TroubleList items={items} />);
    const b = container.querySelector('article#b');
    expect(b?.querySelector('h2')?.textContent).toBe('B 건');
    expect(b?.querySelectorAll('p, details')).toHaveLength(0);
  });
});
