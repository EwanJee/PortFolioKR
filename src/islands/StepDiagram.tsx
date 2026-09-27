import { useEffect, useMemo, useState } from 'react';
import { DIAGRAMS } from '../lib/diagrams';
import { anchors, nextIndex, prevIndex, visibleEdges, type DiagramId } from '../lib/diagram';

type Props = { id: DiagramId; mode: 'preview' | 'player' };

const PREVIEW_INTERVAL = 1400;

// HTML에는 결과가 드러난 마지막 장면을 넣어 둔다(스크립트가 없거나 동작 줄이기일 때 보이는 장면).
export default function StepDiagram({ id, mode }: Props) {
  const spec = DIAGRAMS[id];
  const [useVariant, setUseVariant] = useState(false);
  const steps = useVariant && spec.variant ? spec.variant.steps : spec.steps;
  const [index, setIndex] = useState(spec.steps.length - 1);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const r = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(r);
    if (mode === 'player' || !r) setIndex(0);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'preview' || reduced) return;
    const timer = window.setInterval(() => setIndex((i) => nextIndex(i, steps.length, true)), PREVIEW_INTERVAL);
    return () => window.clearInterval(timer);
  }, [mode, reduced, steps.length]);

  const byId = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec]);
  const step = steps[Math.min(index, steps.length - 1)];
  const edges = visibleEdges(spec, step);
  const markerId = `arrow-${id}-${mode}`;

  return (
    <figure className={`diagram diagram--${mode}`}>
      <svg viewBox={`0 0 ${spec.width} ${spec.height}`} role="img" aria-label={`${spec.title}: ${step.caption}`}>
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" className="diagram-arrow" />
          </marker>
        </defs>
        {edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const p = anchors(a, b);
          return <line key={`${e.from}-${e.to}`} className="diagram-edge" x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} markerEnd={`url(#${markerId})`} />;
        })}
        {spec.nodes.map((n) => {
          if (!step.show.includes(n.id)) return null;
          const cls = [
            'diagram-node',
            step.active.includes(n.id) ? 'is-active' : '',
            step.danger?.includes(n.id) ? 'is-danger' : '',
            step.muted?.includes(n.id) ? 'is-muted' : '',
          ].filter(Boolean).join(' ');
          return (
            <g key={n.id} className={cls}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="4" />
              <text x={n.x + n.w / 2} y={n.y + n.h / 2} dominantBaseline="middle" textAnchor="middle">{n.label}</text>
            </g>
          );
        })}
      </svg>
      {mode === 'player' && (
        <figcaption>
          <p className="diagram-caption" aria-live="polite">{`${index + 1} / ${steps.length}. ${step.caption}`}</p>
          <div className="diagram-controls">
            <button type="button" onClick={() => setIndex(0)}>처음</button>
            {/* disabled는 누르던 버튼의 포커스를 빼앗으므로, 끝에서는 aria-disabled로 알리기만 한다(눌러도 제자리). */}
            <button type="button" onClick={() => setIndex((i) => prevIndex(i))} aria-disabled={index === 0}>이전</button>
            <button type="button" onClick={() => setIndex((i) => nextIndex(i, steps.length, false))} aria-disabled={index === steps.length - 1}>다음</button>
            {spec.variant && (
              <label className="diagram-toggle">
                <input type="checkbox" checked={useVariant} onChange={(e) => setUseVariant(e.target.checked)} /> {spec.variant.label}
              </label>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
