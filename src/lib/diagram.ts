export type DiagramId = 'race-condition' | 'signal-pipeline' | 'privacy-flow' | 'alert-flow' | 'restore-state-machine';
export type DiagramNode = { id: string; label: string; x: number; y: number; w: number; h: number };
export type DiagramEdge = { from: string; to: string };
export type DiagramStep = {
  caption: string;
  show: string[];
  active: string[];
  danger?: string[];
  muted?: string[];
  edges?: [string, string][];
};
export type DiagramSpec = {
  id: DiagramId;
  title: string;
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  steps: DiagramStep[];
  variant?: { label: string; steps: DiagramStep[] };
};

export function nextIndex(index: number, length: number, loop: boolean): number {
  if (index + 1 < length) return index + 1;
  return loop ? 0 : index;
}

export function prevIndex(index: number): number {
  return Math.max(0, index - 1);
}

export function visibleEdges(spec: DiagramSpec, step: DiagramStep): DiagramEdge[] {
  if (step.edges) return step.edges.map(([from, to]) => ({ from, to }));
  return spec.edges.filter((e) => step.show.includes(e.from) && step.show.includes(e.to));
}

// 가로로 겹치지 않는 상자는 옆면끼리, 겹치면 아랫면과 윗면을 잇는다.
export function anchors(a: DiagramNode, b: DiagramNode) {
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;
  if (a.x + a.w <= b.x) return { x1: a.x + a.w, y1: ay, x2: b.x, y2: by };
  if (b.x + b.w <= a.x) return { x1: a.x, y1: ay, x2: b.x + b.w, y2: by };
  const ax = a.x + a.w / 2;
  const bx = b.x + b.w / 2;
  return by >= ay ? { x1: ax, y1: a.y + a.h, x2: bx, y2: b.y } : { x1: ax, y1: a.y, x2: bx, y2: b.y + b.h };
}

export function validateSpec(spec: DiagramSpec): string[] {
  const ids = new Set(spec.nodes.map((n) => n.id));
  const errors: string[] = [];
  const check = (id: string, where: string) => {
    if (!ids.has(id)) errors.push(`${spec.id}: ${where}에 없는 노드 ${id}`);
  };
  spec.edges.forEach((e) => {
    check(e.from, 'edge');
    check(e.to, 'edge');
  });
  const all = [...spec.steps, ...(spec.variant?.steps ?? [])];
  all.forEach((s, i) => {
    [...s.show, ...s.active, ...(s.danger ?? []), ...(s.muted ?? [])].forEach((id) => check(id, `step ${i}`));
    (s.edges ?? []).forEach(([a, b]) => {
      check(a, `step ${i} edge`);
      check(b, `step ${i} edge`);
    });
    s.active.forEach((id) => {
      if (!s.show.includes(id)) errors.push(`${spec.id}: step ${i}의 active ${id}가 show에 없음`);
    });
  });
  if (spec.steps.length < 2) errors.push(`${spec.id}: 단계가 2개 미만`);
  if (spec.variant && spec.variant.steps.length !== spec.steps.length) errors.push(`${spec.id}: variant 단계 수가 다름`);
  spec.nodes.forEach((n) => {
    if (n.x < 0 || n.y < 0 || n.x + n.w > spec.width || n.y + n.h > spec.height) errors.push(`${spec.id}: ${n.id}가 그림 밖`);
  });
  return errors;
}
