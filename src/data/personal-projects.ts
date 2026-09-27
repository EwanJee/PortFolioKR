// label이 없으면 카드에 "개인 프로젝트"로 표시한다.
import type { Company } from '../lib/project-filter';

// company가 있으면 무신사 밖 회사 프로젝트다(카드와 탭은 "회사명: 팀명"). 공개 링크가 없어 href를 두지 않는다.
export type PersonalProject = { slug: string; title: string; summary: string; period: string; stack: string[]; href?: string; label?: string; company?: Company };

export const personalProjects: PersonalProject[] = [
  {
    // 공개 GitHub 조직 twelevegg 기준: spring 저장소 커밋 152개 중 107개, fastapi 33개(2026-09-27 확인).
    slug: 'cs-navigator',
    title: 'CS Navigator',
    label: '부트캠프 팀 프로젝트',
    period: '2026.01 ~ 2026.02',
    summary: '상담사를 위한 실시간 상담 멘트 추천과 신입 교육 AI 플랫폼에서 Spring Boot 백엔드를 맡았습니다(커밋의 약 70%). 상담, 녹취, AI 분석 결과와 운영 지표 API를 만들고, FastAPI 실시간 AI 서버에도 참여했습니다.',
    stack: ['Java', 'Spring Boot', 'Spring Security', 'JPA', 'AWS S3', 'FastAPI', 'WebSocket'],
    href: 'https://github.com/twelevegg',
  },
  {
    slug: 'remember-assessment',
    title: 'Remember Assessment',
    period: '2025',
    summary: '긴 PDF 리포트 생성을 RabbitMQ 비동기 작업으로 나누고, SSE로 진행 상태를 전달했습니다.',
    stack: ['Kotlin', 'Spring Boot', 'RabbitMQ', 'Redis', 'Kotlin JDSL', 'Spring Security', 'CloudWatch'],
    href: 'https://github.com/EwanJee/NEWJOB-Ver2.0',
  },
  {
    slug: 'my-health-check',
    title: 'My Health Check',
    period: '2024.10 ~ 2025.02',
    summary: '공공데이터 API로 체력 진단, 맞춤 운동, 시설 위치를 알려 주는 서비스입니다. WebFlux와 Coroutine으로 병렬 호출합니다.',
    stack: ['Kotlin', 'Spring Boot', 'WebFlux', 'Coroutine', 'Flyway', 'GitHub Actions', 'Nginx'],
    href: 'https://github.com/EwanJee/HealthWebApp',
  },
  {
    // 사용자 제공(E-aidt, 2026-09-27): 추천 학습 파트 개발, 1차 검증 합격, 정부 AIDT 선정 업체 기여.
    slug: 'aidt-recommendation',
    title: 'AI 디지털교과서 추천 학습',
    company: 'ihateflyingbugs',
    period: '2024.06 ~ 2024.09',
    summary: '추천 학습 제공 API, 추천 학습 데이터 삽입 API와 스크립트, 콘텐츠 부서가 쓰는 데이터 관리 로우코드 플랫폼을 만들었습니다. 1차 검증에 합격해 정부 AIDT(AI 디지털교과서) 선정 업체가 되는 데 기여했습니다.',
    stack: ['Java', 'Python', 'SQL', 'REST API', 'Appsmith'],
  },
  {
    slug: 'prediger-diagnosis',
    title: '심리 진단 서비스',
    company: 'prediger',
    period: '2023.06 ~ 2023.08',
    summary: '심리 진단 결과 API를 만들고, 카카오 로그인과 결제를 연동했습니다.',
    stack: [],
  },
];
