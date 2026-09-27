import { useEffect, useState } from 'react';
import StepDiagram from './StepDiagram';
import { FILTERS, isDimmed, readStackParam, type CaseItem, type Filter, type GridItem, type PersonalItem } from '../lib/project-filter';
import { STATUS_LABEL, TEAM_LABEL } from '../lib/teams';

export default function ProjectGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [stack, setStack] = useState<string | null>(null);

  useEffect(() => {
    // 사례에 쓰인 기술 이름만 받는다. 아무 문구나 받으면 링크 하나로 이 사이트에 임의 문구를 띄울 수 있다.
    const value = readStackParam(window.location.search);
    setStack(value && items.some((item) => item.stack.includes(value)) ? value : null);
  }, [items]);

  const clearStack = () => {
    setStack(null);
    // 화면 전환(ClientRouter)이 기록에 넣어 둔 값을 지우면 뒤로 가기가 이 페이지로 돌아오지 못하므로 그대로 둔다.
    window.history.replaceState(window.history.state, '', window.location.pathname);
  };

  return (
    <div className="project-grid">
      <div className="filters" role="group" aria-label="팀으로 거르기">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="filter" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      {stack && (
        <p className="stack-note">
          {`${stack} 사용 사례만 밝게 보여 줍니다. `}<button type="button" className="link-button" onClick={clearStack}>모두 보기</button>
        </p>
      )}
      <ul className="cards">
        {items.map((item, i) => (
          <li key={item.slug} className={isDimmed(item, filter, stack) ? 'card-wrap is-dim' : 'card-wrap'} style={{ animationDelay: `${0.1 * i}s` }}>
            {item.kind === 'case' ? <CaseCard item={item} index={i} /> : <PersonalCard item={item} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 첫 화면에 보이는 앞쪽 카드 이미지는 바로 받고, 첫 이미지는 가장 큰 요소가 되므로 우선순위를 높인다.
function CaseCard({ item, index }: { item: CaseItem; index: number }) {
  return (
    <a className="card" href={`/projects/${item.slug}/`}>
      <div className="card-media" data-hint="눌러서 자세히">
        {item.still ? (
          <div className="phone">
            <img src={item.still.src} width={item.still.width} height={item.still.height} alt={item.alt} loading={index < 2 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : undefined} style={{ viewTransitionName: `media-${item.slug}` }} />
          </div>
        ) : item.diagram ? (
          <div className="card-diagram" style={{ viewTransitionName: `media-${item.slug}` }}>
            <StepDiagram id={item.diagram} mode="preview" />
          </div>
        ) : null}
      </div>
      <div className="card-body">
        <span className={`team team--${item.team}`}>{TEAM_LABEL[item.team]}</span>
        {item.status !== 'done' && <span className="status">{STATUS_LABEL[item.status]}</span>}
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
      </div>
    </a>
  );
}

function PersonalCard({ item }: { item: PersonalItem }) {
  return (
    <a className="card card--text" href={item.href} target="_blank" rel="noopener noreferrer" data-hint="GitHub에서 보기">
      <div className="card-body">
        <span className="team">개인 프로젝트, {item.period}</span>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <ul className="chips">{item.stack.map((s) => <li key={s}>{s}</li>)}</ul>
      </div>
    </a>
  );
}
