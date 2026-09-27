export type Team = 'global' | 'retention' | 'purchase';
export const TEAMS: readonly Team[] = ['global', 'retention', 'purchase'];
export const TEAM_LABEL: Record<Team, string> = { global: 'Global', retention: 'Retention', purchase: 'Purchase' };
export const COMPANY = '무신사';
// 카드, 사례, 트러블슈팅, 거르기 탭의 팀 표시는 모두 "회사명: 팀명"이다.
export const teamLabel = (team: Team) => `${COMPANY}: ${TEAM_LABEL[team]} 팀`;

export type Status = 'done' | 'in-progress' | 'proposed';
