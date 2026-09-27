export type Team = 'global' | 'retention' | 'purchase';
export const TEAMS: readonly Team[] = ['global', 'retention', 'purchase'];
export const TEAM_LABEL: Record<Team, string> = { global: 'Global', retention: 'Retention', purchase: 'Purchase' };

export type Status = 'done' | 'in-progress' | 'proposed';
export const STATUS_LABEL: Record<Status, string> = { done: '완료', 'in-progress': '진행 중', proposed: '제안·검토 중' };
