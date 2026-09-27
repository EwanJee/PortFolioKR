import type { Team } from '../lib/teams';

export type Segment = string | { count: number };
export type Bullet = { parts: Segment[]; evidence: string[] };
export type CareerEntry = { period: string; title: string; sub?: string; team: Team | 'other'; bullets: Bullet[]; small?: boolean };
export type EducationEntry = { period: string; title: string; sub?: string };

export const career: CareerEntry[] = [
  {
    period: '2026.09 ~ 지금',
    title: '무신사 Purchase 팀',
    sub: '주문, 배송, 클레임',
    team: 'purchase',
    bullets: [
      { parts: ['클레임: 첫 결제 혜택 자격 복원 (설계와 개발, 진행 중)'], evidence: ['E-restore'] },
      { parts: ['정산 원장 중복 삽입: 원인 추적, 대안 ', { count: 7 }, '개 비교로 해결안 제안(검토 중)'], evidence: ['E-ledger-matrix'] },
    ],
  },
  {
    period: '2026.06 ~ 2026.09',
    title: '무신사 Retention 팀',
    sub: '혜택홈, 운영 안정성',
    team: 'retention',
    bullets: [
      { parts: ['혜택홈 편성 어드민을 계획보다 ', { count: 13 }, '영업일 앞당겨 오픈'], evidence: ['E-bh-admin'] },
      { parts: ['혜택홈 새 판 서버 p99 약 0.25초'], evidence: ['E-bh-p99'] },
      { parts: ['공개 API ', { count: 23 }, '개와 라우트 규칙 ', { count: 26 }, '개를 7일 만에 API Gateway로 단계 전환'], evidence: ['E-gw-transition'] },
      { parts: ['알림 채널 ', { count: 17 }, '개를 역할별 ', { count: 5 }, '개로 정리'], evidence: ['E-alert-channels'] },
    ],
  },
  {
    period: '2026.03 ~ 2026.06',
    title: '무신사 Global 팀',
    sub: 'AI Native Engineer 인턴, 2026.03 입사',
    team: 'global',
    bullets: [
      { parts: ['도쿄 팝업 스토어 ', { count: 3 }, '개 언어 안내 챗봇: 17일간 약 5천 명 사용'], evidence: ['E-chatbot-scale', 'E-chatbot-users'] },
      { parts: ['일본 고객 재구매 지표 MVP: 데이터 계약 8개 중 ', { count: 7 }, '개 오류 수정'], evidence: ['E-jp-contracts'] },
    ],
  },
  {
    period: '2024.06 ~ 2024.09',
    title: '아이헤이트플라잉버그스, 백엔드 인턴',
    team: 'other',
    small: true,
    bullets: [{ parts: ['AI 디지털교과서 추천 API, 학습 데이터 적재와 운영 도구'], evidence: ['E-career-intern'] }],
  },
  {
    period: '2023.06 ~ 2023.08',
    title: '프레디저, 백엔드 인턴',
    team: 'other',
    small: true,
    bullets: [{ parts: ['심리 진단 결과 API, 카카오 로그인과 결제 연동'], evidence: ['E-career-intern'] }],
  },
];

export const education: EducationEntry[] = [
  { period: '2022.08 ~ 2025.01', title: 'Rutgers University–New Brunswick', sub: 'Computer Science 졸업' },
  { period: '2019.08 ~ 2020.12', title: 'Stony Brook University', sub: 'Computer Science' },
  { period: '2024', title: '정보처리기사' },
];
