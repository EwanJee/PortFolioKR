import { useState } from 'react';
import { CRITERIA, OPTIONS, rank } from '../lib/decision-matrix';

const DEFAULT_WEIGHTS = CRITERIA.map((c) => c.weight);

export default function DecisionMatrix() {
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);
  const ranked = rank(OPTIONS, weights);
  const total = weights.reduce((a, b) => a + b, 0);
  const setAt = (i: number, v: number) => setWeights((w) => w.map((x, j) => (j === i ? v : x)));

  return (
    <div className="matrix">
      <fieldset className="matrix-weights">
        <legend>기준과 가중치(지금 합계 {total}%, 점수는 합계를 100%로 맞춰 계산)</legend>
        {CRITERIA.map((c, i) => (
          <label key={c.id} className="matrix-weight">
            <span>{c.label}</span>
            <input type="range" min={0} max={50} step={5} value={weights[i]} aria-label={`${c.label} 가중치`} onChange={(e) => setAt(i, Number(e.target.value))} />
            <output>{weights[i]}%</output>
          </label>
        ))}
        <button type="button" onClick={() => setWeights(DEFAULT_WEIGHTS)}>처음 가중치로</button>
      </fieldset>
      <ol className="matrix-rank" aria-label="대안별 점수(현행 유지 = 0)">
        {ranked.map((r, i) => (
          <li key={r.option.id} className={i === 0 ? 'is-top' : undefined}>
            <span className="matrix-name">{r.option.label}</span>
            <span className="matrix-bar" aria-hidden="true">
              <span className={r.score < 0 ? 'neg' : undefined} style={{ transform: `scaleX(${Math.min(1, Math.abs(r.score))})` }} />
            </span>
            <span className="matrix-score">{`${r.score > 0 ? '+' : ''}${r.score.toFixed(2)}`}</span>
          </li>
        ))}
      </ol>
      <p className="matrix-note">각 가중치를 5%p씩 흔든 141가지 조합에서 1위는 바뀌지 않았습니다. 2026년 9월 기준 제안 단계입니다.</p>
    </div>
  );
}
