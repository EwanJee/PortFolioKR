export type PersonalProject = { slug: string; title: string; summary: string; period: string; stack: string[]; href: string };

export const personalProjects: PersonalProject[] = [
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
];
