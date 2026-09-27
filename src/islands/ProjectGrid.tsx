import { useEffect, useState } from 'react';
import FilterTabs from './FilterTabs';
import StepDiagram from './StepDiagram';
import { FILTERS, isHidden, personalLabel, readFilterParam, readStackParam, type CaseItem, type Filter, type GridItem, type PersonalItem } from '../lib/project-filter';
import { teamLabel } from '../lib/teams';

export default function ProjectGrid({ items }: { items: GridItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [stack, setStack] = useState<string | null>(null);

  useEffect(() => {
    // 사례에 쓰인 기술 이름만 받는다. 아무 문구나 받으면 링크 하나로 이 사이트에 임의 문구를 띄울 수 있다.
    const value = readStackParam(window.location.search);
    setStack(value && items.some((item) => item.stack.includes(value)) ? value : null);
    // 경력의 팀 제목 링크(?team=)로 들어오면 그 탭을 눌린 채로 연다.
    const team = readFilterParam(window.location.search);
    if (team) setFilter(team);
  }, [items]);

  const clearStack = () => {
    setStack(null);
    // 화면 전환(ClientRouter)이 기록에 넣어 둔 값을 지우면 뒤로 가기가 이 페이지로 돌아오지 못하므로 그대로 둔다.
    window.history.replaceState(window.history.state, '', window.location.pathname);
  };

  // 탭이나 기술 조건에 맞지 않는 카드는 숨긴다(사용자 지시).
  const visible = items.filter((item) => !isHidden(item, filter, stack));
  // 처음 나오는 이미지 카드 둘은 바로 받고, 그중 첫 장은 가장 큰 요소가 되므로 우선순위를 높인다(앞에 그림 카드가 와도 같다).
  const stills = visible.filter((item) => item.kind === 'case' && item.still).map((item) => item.slug);

  return (
    <div className="project-grid">
      <FilterTabs options={FILTERS} value={filter} onChange={setFilter} label="팀으로 거르기" />
      {stack && (
        <p className="stack-note">
          {`${stack} 사용 사례만 보여 줍니다. `}<button type="button" className="link-button" onClick={clearStack}>모두 보기</button>
        </p>
      )}
      <ul className="cards">
        {visible.map((item, i) => (
          <li key={item.slug} className="card-wrap" style={{ animationDelay: `${0.1 * i}s` }}>
            {item.kind === 'case' ? <CaseCard item={item} imageRank={stills.indexOf(item.slug)} /> : <PersonalCard item={item} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CaseCard({ item, imageRank }: { item: CaseItem; imageRank: number }) {
  const early = imageRank >= 0 && imageRank < 2;
  return (
    <a className="card" href={`/projects/${item.slug}/`}>
      <div className="card-media" data-hint="눌러서 자세히">
        {item.still ? (
          <div className="phone">
            <img src={item.still.src} width={item.still.width} height={item.still.height} alt={item.alt} loading={early ? 'eager' : 'lazy'} fetchPriority={imageRank === 0 ? 'high' : undefined} style={{ viewTransitionName: `media-${item.slug}` }} />
          </div>
        ) : item.diagram ? (
          <div className="card-diagram" style={{ viewTransitionName: `media-${item.slug}` }}>
            <StepDiagram id={item.diagram} mode="preview" />
          </div>
        ) : null}
      </div>
      <div className="card-body">
        <span className={`team team--${item.team}`}>{teamLabel(item.team)}</span>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
      </div>
    </a>
  );
}

function PersonalCard({ item }: { item: PersonalItem }) {
  const body = (
    <div className="card-body">
      <span className="team">{personalLabel(item)}, {item.period}</span>
      <h2>{item.title}</h2>
      <p>{item.summary}</p>
      {item.stack.length > 0 && <ul className="chips">{item.stack.map((s) => <li key={s}>{s}</li>)}</ul>}
    </div>
  );
  // 공개 링크가 없는 회사 프로젝트는 누를 수 없는 카드로 둔다.
  if (!item.href) return <div className="card card--text card--static">{body}</div>;
  return (
    <a className="card card--text" href={item.href} target="_blank" rel="noopener noreferrer" data-hint="GitHub에서 보기">
      {body}
    </a>
  );
}
