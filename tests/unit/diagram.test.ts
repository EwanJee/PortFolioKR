import { describe, expect, it } from 'vitest';
import { anchors, nextIndex, prevIndex, validateSpec, visibleEdges } from '../../src/lib/diagram';
import { DIAGRAMS } from '../../src/lib/diagrams';

describe('단계 이동', () => {
  it('끝에서 반복하거나 멈춘다', () => {
    expect(nextIndex(1, 5, false)).toBe(2);
    expect(nextIndex(4, 5, false)).toBe(4);
    expect(nextIndex(4, 5, true)).toBe(0);
    expect(prevIndex(0)).toBe(0);
    expect(prevIndex(3)).toBe(2);
  });
});

describe('그림 정의', () => {
  it.each(Object.values(DIAGRAMS))('$id: 없는 노드를 쓰지 않고 그림 밖으로 나가지 않는다', (spec) => {
    expect(validateSpec(spec)).toEqual([]);
  });

  it('경합 그림은 기본 결말이 중복, 유니크 키 결말이 거절이다', () => {
    const spec = DIAGRAMS['race-condition'];
    expect(spec.steps.at(-1)?.danger).toContain('row2');
    expect(spec.variant?.steps.at(-1)?.show).toContain('reject');
  });

  it('단계에 edges가 있으면 그것만 보인다', () => {
    const spec = DIAGRAMS['privacy-flow'];
    expect(visibleEdges(spec, spec.steps[1]).every((e) => e.from === 'api' || e.to === 'api')).toBe(true);
  });
});

describe('anchors', () => {
  const box = (x: number, y: number, w = 100, h = 30) => ({ id: 'n', label: '', x, y, w, h });
  it('가로로 떨어진 상자는 옆면끼리 잇는다', () => {
    expect(anchors(box(0, 0), box(200, 40))).toEqual({ x1: 100, y1: 15, x2: 200, y2: 55 });
  });
  it('가로 범위가 겹치면 아래와 위를 잇는다', () => {
    expect(anchors(box(0, 0), box(50, 100))).toEqual({ x1: 50, y1: 30, x2: 100, y2: 100 });
  });
});
