import type { DiagramId } from './diagram';
import { teamLabel, type Status, type Team } from './teams';

// 무신사 밖에서 한 회사 프로젝트. 탭과 카드는 "회사명: 팀명"으로 표시한다.
export type Company = 'ihateflyingbugs' | 'prediger';
export const COMPANY_LABEL: Record<Company, string> = { ihateflyingbugs: '아이헤이트플라잉버그스: R&D', prediger: '프레디저: 백엔드' };
export type Filter = 'all' | Team | Company | 'personal';
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
// 글자 카드: 개인 프로젝트, 부트캠프, 회사 프로젝트(company). href가 없으면 누를 수 없는 카드로 그린다.
export type PersonalItem = { kind: 'personal'; slug: string; title: string; summary: string; period: string; stack: string[]; href?: string; label?: string; company?: Company };
export type GridItem = CaseItem | PersonalItem;

// 탭은 "회사명: 팀명"으로, 경력처럼 최신이 먼저다(사용자 지시).
export const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'purchase', label: teamLabel('purchase') },
  { id: 'retention', label: teamLabel('retention') },
  { id: 'global', label: teamLabel('global') },
  { id: 'ihateflyingbugs', label: COMPANY_LABEL.ihateflyingbugs },
  { id: 'prediger', label: COMPANY_LABEL.prediger },
  { id: 'personal', label: '개인·부트캠프' },
];

export function personalLabel(item: PersonalItem): string {
  return item.label ?? (item.company ? COMPANY_LABEL[item.company] : '개인 프로젝트');
}

export function matchesFilter(item: GridItem, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'personal') return item.kind === 'personal' && !item.company;
  if (filter === 'ihateflyingbugs' || filter === 'prediger') return item.kind === 'personal' && item.company === filter;
  return item.kind === 'case' && item.team === filter;
}

export function matchesStack(item: GridItem, stack: string | null): boolean {
  return !stack || item.stack.includes(stack);
}

export function isHidden(item: GridItem, filter: Filter, stack: string | null): boolean {
  return !matchesFilter(item, filter) || !matchesStack(item, stack);
}

// 주소의 team 값은 탭 이름 목록에 있을 때만 받는다(경력의 팀 제목 링크가 쓴다).
export function readFilterParam(search: string): Filter | null {
  const value = new URLSearchParams(search).get('team');
  return FILTERS.find((f) => f.id === value)?.id ?? null;
}

export function readStackParam(search: string): string | null {
  const value = new URLSearchParams(search).get('stack');
  return value && value.trim() ? value : null;
}
