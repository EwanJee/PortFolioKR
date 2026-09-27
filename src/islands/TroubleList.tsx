import { Fragment, useState } from 'react';
import FilterTabs from './FilterTabs';
import { TEAMS, teamLabel, type Team } from '../lib/teams';

export type TroubleItem = { slug: string; title: string; team: Team; summary?: string; rows: [string, string][]; related?: string };

type TeamFilter = 'all' | Team;

// 트러블슈팅 목록: 기록이 있는 팀만 탭으로 보여 주고, 누르면 그 팀 기록만 남긴다.
// 처음 HTML에는 모든 카드를 넣어 두므로 주소의 #으로 카드를 바로 열 수 있다.
export default function TroubleList({ items }: { items: TroubleItem[] }) {
  const [filter, setFilter] = useState<TeamFilter>('all');
  // 탭은 "회사명: 팀명"으로, 최신 팀이 먼저다(프로젝트 탭과 같은 규칙).
  const teams = [...TEAMS].reverse().filter((t) => items.some((i) => i.team === t));
  const options: { id: TeamFilter; label: string }[] = [{ id: 'all', label: '전체' }, ...teams.map((t) => ({ id: t, label: teamLabel(t) }))];
  const visible = items.filter((i) => filter === 'all' || i.team === filter);

  return (
    <div className="trouble-list">
      <FilterTabs options={options} value={filter} onChange={setFilter} label="팀으로 거르기" />
      <ul className="troubles">
        {visible.map((i) => (
          <li key={i.slug}>
            <article className="trouble" id={i.slug}>
              <span className={`team team--${i.team}`}>{teamLabel(i.team)}</span>
              <h2>{i.title}</h2>
              {i.summary && <p>{i.summary}</p>}
              {i.rows.length > 0 && (
                <details>
                  <summary>자세히</summary>
                  <dl>
                    {i.rows.map(([k, v]) => (
                      <Fragment key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </Fragment>
                    ))}
                  </dl>
                </details>
              )}
              {i.related && (
                <p className="trouble-related">
                  <a href={`/projects/${i.related}/`}>관련 사례 보기</a>
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
