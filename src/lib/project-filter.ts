import type { DiagramId } from './diagram';
import type { Status, Team } from './teams';

export type Filter = 'all' | Team | 'personal';
export type CaseItem = {
  kind: 'case';
  slug: string;
  title: string;
  summary: string;
  team: Team;
  status: Status;
  stack: string[];
  still?: { src: string; width: number; height: number };
  diagram?: DiagramId;
  alt: string;
};
export type PersonalItem = { kind: 'personal'; slug: string; title: string; summary: string; period: string; stack: string[]; href: string; label?: string };
export type GridItem = CaseItem | PersonalItem;

export const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'global', label: 'Global' },
  { id: 'retention', label: 'Retention' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'personal', label: '개인·부트캠프' },
];

export function matchesFilter(item: GridItem, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'personal') return item.kind === 'personal';
  return item.kind === 'case' && item.team === filter;
}

export function matchesStack(item: GridItem, stack: string | null): boolean {
  return !stack || item.stack.includes(stack);
}

export function isHidden(item: GridItem, filter: Filter, stack: string | null): boolean {
  return !matchesFilter(item, filter) || !matchesStack(item, stack);
}

export function readStackParam(search: string): string | null {
  const value = new URLSearchParams(search).get('stack');
  return value && value.trim() ? value : null;
}
