import { useEffect, useState } from 'react';
import StepDiagram from './StepDiagram';
import { FILTERS, isDimmed, readStackParam, type CaseItem, type Filter, type GridItem, type PersonalItem } from '../lib/project-filter';
import { STATUS_LABEL, TEAM_LABEL } from '../lib/teams';

export default function ProjectGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [stack, setStack] = useState<string | null>(null);

  useEffect(() => {
    setStack(readStackParam(window.location.search));
  }, []);

  const clearStack = () => {
    setStack(null);
    window.history.replaceState(null, '', window.location.pathname);
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
            {item.kind === 'case' ? <CaseCard item={item} /> : <PersonalCard item={item} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  return (
    <a className="card" href={`/projects/${item.slug}/`}>
      <div className="card-media" data-hint="눌러서 자세히">
        {item.still ? (
          <div className="phone">
            <img src={item.still.src} width={item.still.width} height={item.still.height} alt={item.alt} loading="lazy" style={{ viewTransitionName: `media-${item.slug}` }} />
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
