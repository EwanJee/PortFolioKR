import type { Team } from '../lib/teams';

export type Segment = string | { count: number };
// 경력 한 줄은 "프로젝트명: 설명" 형식이다. 하위 항목은 "항목: 설명" 형식으로 details에 둔다.
export type Detail = { label: string; parts: Segment[]; evidence: string[] };
export type Bullet = { project: string; parts: Segment[]; evidence: string[]; details?: Detail[] };
// title은 "회사명: 팀명" 형식이다. link가 있으면 제목을 눌러 프로젝트의 그 탭으로 간다.
export type CareerEntry = { period: string; title: string; link?: string; sub?: string; team: Team | 'other'; bullets: Bullet[]; small?: boolean };
export type EducationEntry = { period: string; title: string; sub?: string };

export const career: CareerEntry[] = [
  {
    period: '2026.09 ~ 지금',
    title: '무신사: Purchase 팀',
    link: '/projects/?team=purchase',
    sub: '주문, 배송, 클레임',
    team: 'purchase',
    bullets: [
      { project: '첫 결제 혜택 자격 복원', parts: ['HLD 1건과 LLD 2건으로 설계하고 개발'], evidence: ['E-restore'] },
      {
        project: '정산 원장 중복 삽입',
        parts: ['원인 추적 후 대안 ', { count: 7 }, '개를 가중 결정표로 비교해 ADR로 해결안 제안'],
        evidence: ['E-ledger-matrix'],
        details: [
          { label: '원인', parts: ['두 서비스가 서로 다른 잠금으로 같은 행을 넣은 기록을 4일 치 로그에서 수십 건 찾고, 커밋 전에 이벤트를 보내는 경로도 찾음'], evidence: ['E-ledger-cause', 'E-ledger-research'] },
          { label: '검증', parts: ['가중치를 5%p씩 흔든 141가지 조합에서도 1위가 바뀌지 않음을 확인'], evidence: ['E-ledger-matrix'] },
          { label: '문서화', parts: ['ADR 2건과 민감도 분석을 담은 결정표 문서, 값 통일부터 과거 데이터 정리까지의 실행 순서를 남김'], evidence: ['E-ledger-research'] },
        ],
      },
    ],
  },
  {
    period: '2026.06 ~ 2026.09',
    title: '무신사: Retention 팀',
    link: '/projects/?team=retention',
    sub: '혜택홈, 운영 안정성',
    team: 'retention',
    bullets: [
      {
        project: '혜택홈 페이지 전면 리뉴얼',
        parts: [{ count: 13 }, '개 화면 영역을 판 API 한 번으로 내려주는 새 판 서버와 편성 어드민 설계, 개발'],
        evidence: ['E-bh-sdui', 'E-bh-docs'],
        details: [
          { label: 'ADR', parts: ['판을 조립하는 전시와 혜택 데이터를 가진 콘텐츠의 R&R(역할과 책임)을 정하고, 캐시는 콘텐츠(원천 서비스) 쪽이 갖도록 경계를 확정'], evidence: ['E-bh-docs', 'E-bh-research'] },
          { label: 'HLD', parts: ['13개 화면 영역으로 이뤄진 판 전체의 상위 설계 작성'], evidence: ['E-bh-docs', 'E-bh-sdui'] },
          { label: '판 구조 설계', parts: ['공식 모듈과 아이템 81종과 비교해 캐러셀 3개는 기존 렌더러를 재사용하고 미션 4개는 계약 1종으로 합쳐 새 분기 3개를 줄임. 판을 생성기와 변환기 두 계층으로 나눠 섹션이 늘어도 조립 코드를 고치지 않게 함'], evidence: ['E-bh-sdui', 'E-bh-research'] },
          { label: '편성 어드민', parts: ['카드와 광고의 순서, 노출 기간, 변경 이력을 개발과 배포 없이 관리하게 하고, 계획보다 ', { count: 13 }, '영업일 앞당겨 오픈'], evidence: ['E-bh-admin'] },
          { label: '캐싱 Layer', parts: ['캐시는 콘텐츠(원천 서비스) 쪽이 소유하고, 편성 캐시는 Redis에 둠'], evidence: ['E-bh-docs', 'E-bh-research'] },
          { label: '모니터링', parts: ['혜택홈 전용 Grafana 대시보드로 엔드포인트별 p95, p99 지연, 성공률, 서버 오류율, 초당 요청 수를 보고, 오픈 뒤 p99 약 0.25초, 서버 오류 0건 확인'], evidence: ['E-bh-p99', 'E-bh-research'] },
          { label: 'QA 자동화', parts: ['시뮬레이터를 자동으로 띄워 AOS, iOS, 크롬 웹뷰에서 테스트하고 오류를 찾으면 티켓을 만드는 Slack 봇과 스킬 제작'], evidence: ['E-bh-qabot'] },
          { label: '문서화', parts: ['설계 위키 19건 작성, 지식베이스 PR 32건 중 29건 머지, 출시 전 점검 문서(런치 리뷰) 작성'], evidence: ['E-bh-research'] },
          { label: '인수인계 문서화', parts: ['넘겨받는 전시팀의 인수인계 점검 9항목을 충족한 문서와, 인수인계 문서를 만드는 플러그인 제작'], evidence: ['E-bh-docs', 'E-bh-research'] },
        ],
      },
      {
        project: 'API Gateway 전환',
        parts: ['공개 API ', { count: 23 }, '개와 라우트 규칙 ', { count: 26 }, '개를 7일 만에 단계 전환, 100% 구간 약 1,600만 요청 중 서버 오류 1건'],
        evidence: ['E-gw-transition'],
        details: [
          { label: '단계 전환', parts: ['26개 경로의 응답을 예전 경로와 비교해 불일치 4건을 0건으로 만든 뒤, 헤더 카나리와 알파 롤백 연습을 거쳐 운영 트래픽을 10%, 30%, 70%, 100%로 옮김'], evidence: ['E-gw-research', 'E-gw-transition'] },
          { label: '관측', parts: ['전환 전용 Grafana 대시보드 2개(52패널)를 첫 전환 PR보다 먼저 만들고 전환 시작'], evidence: ['E-gw-research'] },
          { label: '502 대응', parts: ['70% 단계의 스케일아웃에서 502가 약 800건 나자 준비 확인을 15초에서 30초로 늦추고 nginx 준비 확인(35초)을 새로 둠'], evidence: ['E-gw-502'] },
          { label: '외부 파드 0개', parts: ['전환 뒤 개발, 알파, 운영 환경의 예전 외부 파드를 0개로 줄임'], evidence: ['E-gw-scaledown'] },
          { label: '문서화', parts: ['Kubernetes 설정 변경을 ADR로 합의하고, 전환 대상 확정 스크립트, 카나리 자동 확인 스크립트, 검증 문서 2건을 남김'], evidence: ['E-gw-502', 'E-gw-research'] },
        ],
      },
      {
        project: '알림 체계 정비',
        parts: ['리텐션 서비스 3개의 알림 채널 ', { count: 17 }, '개를 역할별 ', { count: 5 }, '개로 모으고, 알림 규칙 36개를 심각도 3단계로 나눔'],
        evidence: ['E-alert-channels', 'E-alert-rules', 'E-alert-research'],
        details: [
          { label: '기준', parts: ['7개 안을 식별성 25%, 소음 감소 25%, 확장성 20%, 받는 사람 분리 20%, 운영 부담 10%로 가중 비교'], evidence: ['E-alert-research'] },
          { label: '채널 구조', parts: ['개발자용 3개(오류, 배치 실패, 모니터링), 비즈니스 담당자용 1개, 공지용 1개'], evidence: ['E-alert-research'] },
          { label: '심각도', parts: ['긴급 19개는 담당자 호출과 조건부 장애 선언까지, 높음 4개는 담당자 호출까지, 통지 13개는 채널 알림만'], evidence: ['E-alert-rules'] },
          { label: '문서화', parts: ['채널 구조를 고른 가중 결정표(사분면 그림 포함)를 남김'], evidence: ['E-alert-research'] },
        ],
      },
    ],
  },
  {
    period: '2026.03 ~ 2026.06',
    title: '무신사: Global 팀',
    link: '/projects/?team=global',
    sub: '챗봇, 글로벌 이상 징후 탐색 자동화',
    team: 'global',
    bullets: [
      {
        project: '도쿄 팝업 스토어 안내 챗봇',
        parts: [{ count: 3 }, '개 언어, 17일간 약 5천 명 사용'],
        evidence: ['E-chatbot-scale', 'E-chatbot-users'],
        details: [
          { label: '재활용', parts: ['이후 하라주쿠 팝업에 그대로 재활용'], evidence: ['E-chatbot-reuse'] },
          { label: '문서화', parts: ['요구사항 문서(PRD)부터 ADR, HLD, 출시 전 점검 문서(런치 리뷰)까지 남기고, 개발 과정을 사례로 정리해 팀에 공유'], evidence: ['E-chatbot-docs'] },
        ],
      },
      {
        project: '글로벌 이상 징후 탐색 자동화',
        parts: ['스파이크가 튄 브랜드, 상품, 고객 코호트의 징후를 찾아 알리는 흐름을 자동화'],
        evidence: ['E-global-anomaly'],
        details: [
          { label: '대시보드', parts: ['이상 진단 대시보드를 PRD, ADR, HLD, LLD 네 문서로 하루 만에 설계하고 구현'], evidence: ['E-jp-docs', 'E-global-anomaly'] },
          { label: '알림 체계', parts: ['계절성 분해(Prophet)로 이상치를 판정하고, 국가와 코호트마다 주 1건까지만 보내 알림 피로를 막음'], evidence: ['E-jp-alert'] },
          { label: 'Action Item', parts: ['수치와 원인 후보는 휴리스틱 규칙으로 코드가 계산하고, LLM은 그 결과로 원인 가설과 다음 할 일을 문장으로만 정리해 알림에 담음'], evidence: ['E-jp-alert'] },
          { label: '데이터 검증', parts: ['LLD를 고칠 때마다 실제 데이터로 다시 확인해 데이터 계약 8개 중 ', { count: 7 }, '개 오류를 배포 전에 수정'], evidence: ['E-jp-contracts', 'E-jp-research'] },
          { label: '문서화', parts: ['신호 탐지 파이프라인의 HLD 2개, LLD 3개, ADR 4개와 가중 결정표 2건 작성'], evidence: ['E-jp-research'] },
        ],
      },
    ],
  },
  {
    period: '2024.06 ~ 2024.09',
    title: '아이헤이트플라잉버그스: R&D',
    link: '/projects/?team=ihateflyingbugs',
    team: 'other',
    small: true,
    bullets: [
      {
        project: 'AI 디지털교과서 추천 학습 파트 개발',
        parts: ['추천 학습 제공 API, 추천 학습 데이터 삽입 API와 스크립트, 콘텐츠 부서가 쓰는 데이터 관리 로우코드 플랫폼 제작'],
        evidence: ['E-career-intern', 'E-aidt'],
        details: [
          { label: '성과', parts: ['1차 검증 합격, 정부 AIDT(AI 디지털교과서) 선정 업체 기여'], evidence: ['E-aidt'] },
          { label: '기술', parts: ['Java, Python, SQL, REST API, Appsmith'], evidence: ['E-aidt'] },
        ],
      },
    ],
  },
  {
    period: '2023.06 ~ 2023.08',
    title: '프레디저: 백엔드',
    link: '/projects/?team=prediger',
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
