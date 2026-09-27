export function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

export function valueAt(to: number, elapsedMs: number, durationMs = 700): number {
  const p = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return Math.round(to * easeOutCubic(p));
}
