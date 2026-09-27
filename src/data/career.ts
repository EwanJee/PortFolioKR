import type { Team } from '../lib/teams';

export type Segment = string | { count: number };
// 경력 한 줄은 "프로젝트명: 설명" 형식이다. 하위 항목은 "항목: 설명" 형식으로 details에 둔다.
export type Detail = { label: string; parts: Segment[]; evidence: string[] };
export type Bullet = { project: string; parts: Segment[]; evidence: string[]; details?: Detail[] };
export type CareerEntry = { period: string; title: string; sub?: string; team: Team | 'other'; bullets: Bullet[]; small?: boolean };
export type EducationEntry = { period: string; title: string; sub?: string };

export const career: CareerEntry[] = [
  {
    period: '2026.09 ~ 지금',
    title: '무신사 Purchase 팀',
    sub: '주문, 배송, 클레임',
    team: 'purchase',
    bullets: [
      { project: '첫 결제 혜택 자격 복원', parts: ['설계와 개발'], evidence: ['E-restore'] },
      { project: '정산 원장 중복 삽입', parts: ['원인 추적, 대안 ', { count: 7 }, '개 비교로 해결안 제안'], evidence: ['E-ledger-matrix'] },
    ],
  },
  {
    period: '2026.06 ~ 2026.09',
    title: '무신사 Retention 팀',
    sub: '혜택홈, 운영 안정성',
    team: 'retention',
    bullets: [
      { project: '혜택홈 편성 어드민', parts: ['계획보다 ', { count: 13 }, '영업일 앞당겨 오픈'], evidence: ['E-bh-admin'] },
      { project: '혜택홈 새 판 서버', parts: ['p99 응답 약 0.25초'], evidence: ['E-bh-p99'] },
      { project: 'API Gateway 전환', parts: ['공개 API ', { count: 23 }, '개와 라우트 규칙 ', { count: 26 }, '개를 7일 만에 단계 전환'], evidence: ['E-gw-transition'] },
      { project: '알림 체계 정비', parts: ['알림 채널 ', { count: 17 }, '개를 역할별 ', { count: 5 }, '개로 정리'], evidence: ['E-alert-channels'] },
    ],
  },
  {
    period: '2026.03 ~ 2026.06',
    title: '무신사 Global 팀',
    sub: '챗봇, 글로벌 이상 징후 탐색 자동화',
    team: 'global',
    bullets: [
      {
        project: '도쿄 팝업 스토어 안내 챗봇',
        parts: [{ count: 3 }, '개 언어, 17일간 약 5천 명 사용'],
        evidence: ['E-chatbot-scale', 'E-chatbot-users'],
        details: [{ label: '재활용', parts: ['이후 하라주쿠 팝업에 그대로 재활용'], evidence: ['E-chatbot-reuse'] }],
      },
      {
        project: '글로벌 이상 징후 탐색 자동화',
        parts: ['스파이크가 튄 브랜드, 상품, 고객 코호트의 징후를 찾아 알리는 흐름을 자동화'],
        evidence: ['E-global-anomaly'],
        details: [
          { label: '대시보드', parts: ['이상 진단 대시보드를 PRD, ADR, HLD, LLD 네 문서로 하루 만에 설계하고 구현'], evidence: ['E-jp-docs', 'E-global-anomaly'] },
          { label: '알림 체계', parts: ['국가와 코호트마다 주 1건까지만 보내 알림 피로를 막음'], evidence: ['E-jp-alert'] },
          { label: 'Action Item', parts: ['LLM이 원인 가설과 다음 할 일을 요약해 알림에 담아 바로 행동으로 이어지게 함'], evidence: ['E-jp-alert'] },
          { label: '데이터 검증', parts: ['일본 고객 재구매 지표의 데이터 계약 8개 중 ', { count: 7 }, '개 오류를 배포 전에 수정'], evidence: ['E-jp-contracts'] },
        ],
      },
    ],
  },
  {
    period: '2024.06 ~ 2024.09',
    title: '아이헤이트플라잉버그스, 백엔드 인턴',
    team: 'other',
    small: true,
    bullets: [{ project: 'AI 디지털교과서', parts: ['추천 API, 학습 데이터 적재와 운영 도구'], evidence: ['E-career-intern'] }],
  },
  {
    period: '2023.06 ~ 2023.08',
    title: '프레디저, 백엔드 인턴',
    team: 'other',
    small: true,
    bullets: [{ project: '심리 진단 서비스', parts: ['결과 API, 카카오 로그인과 결제 연동'], evidence: ['E-career-intern'] }],
  },
];

// 소개 페이지의 CURRENT CAREER(사용자 지시).
export const currentCareer: EducationEntry = { period: '2026.03 ~ PRESENT', title: '무신사 MUSINSA', sub: 'Product Engineer' };

export const education: EducationEntry[] = [
  { period: '2022.08 ~ 2025.01', title: 'Rutgers University–New Brunswick', sub: 'Computer Science 졸업' },
  { period: '2019.08 ~ 2020.12', title: 'Stony Brook University', sub: 'Computer Science' },
  { period: '2024', title: '정보처리기사' },
];
