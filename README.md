# ewanjee.com

지예환(Ewan Jee)의 개인 포트폴리오 사이트입니다. Astro와 React로 만들고 GitHub Pages로 배포합니다.

## 로컬 실행

- Node 22.14.0: `nvm use`
- 설치: `npm install`
- 개발 서버: `npm run dev`

## 검사

- `npm run verify`: 공개 전 검사, 타입 검사, 단위 테스트, 빌드, 빌드 결과 검사, 링크 검사, 근거 확인
- `npm run build && npm run test:e2e`: 화면 테스트(이 맥의 Chrome 사용)

## 설계와 계획

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`

## 이력서

- `/resume/`에서 PDF를 미리 보고 새 창으로 열거나 내려받을 수 있다.
- Resume은 PDF 뷰어가 매번 초기화되도록 일반 페이지 이동을 사용한다. 나머지 페이지 사이에서는 본문만 교체하는 화면 전환을 유지한다.
- 내용과 인쇄용 서식은 `src/documents/resume.html`, PDF 경로와 페이지 설명은 `src/data/resume.ts`에서 관리한다. 경력과 수치는 `src/data`와 `src/content/projects`를 기준으로 갱신한다.
- `npm run resume:build`로 설치된 Chrome과 저장소의 Pretendard 글꼴을 사용해 PDF를 만든다. 공개 전 문자열, 글꼴 로딩, 용지 넘침과 꼬리말 겹침을 검사한다.
- 결과는 `public/resume/Ji_Yehwan_Back-end_Engineer.pdf`와 `output/pdf/`에 저장된다. 배포하는 PDF는 `public/resume/` 파일이며 사이트 빌드에 그대로 포함된다.
- 갱신 후 PDF 두 쪽을 눈으로 확인하고 `npm run verify`, `npm run test:e2e`를 실행한다.

## 화면 효과와 미디어

- 홈의 타이핑과 경력 숫자는 브라우저 기본 요소로 동작한다. 필터·그림·결정표·이미지 재생은 React를 쓴다.
- 공통 스타일과 글꼴 선언은 별도 CSS로 배포해 페이지 사이에서 브라우저 캐시를 재사용한다.
- 주요 메뉴는 문서를 미리 받고, 이동 시 전환·순차 등장 효과와 숫자 대기를 생략한다. 측정 방법과 결과는 `docs/performance.md`에 있다.
- 움직이는 이미지 원본은 `src/assets/motion/`에 보관한다. `node scripts/media/optimize.mjs`로 `public/media/`의 애니메이션 WebP를 만든다. 캡처 스크립트도 변환을 실행한다.
