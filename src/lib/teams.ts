export type Team = 'global' | 'retention' | 'purchase';
export const TEAMS: readonly Team[] = ['global', 'retention', 'purchase'];
export const TEAM_LABEL: Record<Team, string> = { global: 'Global', retention: 'Retention', purchase: 'Purchase' };
export const COMPANY = '무신사';
// 카드, 사례, 트러블슈팅의 팀 표시는 "회사명: 팀명"이다. 필터 탭은 짧게 팀명만 쓴다.
export const teamLabel = (team: Team) => `${COMPANY}: ${TEAM_LABEL[team]}`;

export type Status = 'done' | 'in-progress' | 'proposed';
