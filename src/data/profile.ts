export const profile = {
  nameKo: '지예환',
  nameEn: 'Ewan Jee',
  role: 'Back-end Engineer',
  intro: '무신사에서 주문, 배송, 클레임 도메인을 담당합니다.',
  workStyle:
    '일할 때 효율과 기록을 중요하게 생각합니다. 업무를 처음 접해도 같은 결과가 나오도록, 프로세스를 문서화하고, 반복을 줄이는 데 관심이 있습니다.',
  roles: ['a Product Engineer', 'a Backend Developer', 'building order & claim systems', 'tracing incidents to the root'],
  about:
    '운영자가 개발과 배포 없이 혜택을 편성하는 시스템을 만들고, API Gateway 단계 전환과 Redis 장애 재현·복구를 해 온 Java·Kotlin 백엔드 엔지니어입니다. 요구사항을 API 계약, ADR(아키텍처 결정 기록), 관측 지표로 구체화하고, AI 자동화로 구현과 검증의 반복 시간을 줄입니다.',
  links: {
    email: 'ewancareer@gmail.com',
    github: 'https://github.com/EwanJee',
    // 예전 주소(ewan-jee-191854242)는 404가 나서 사용자가 준 주소로 바꿨다(2026-09-27).
    linkedin: 'https://www.linkedin.com/in/%EC%98%88%ED%99%98-%EC%A7%80-191854242',
    blog: 'https://ewanjee.tistory.com',
  },
} as const;
