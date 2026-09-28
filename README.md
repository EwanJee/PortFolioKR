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

## 화면 효과와 미디어

- 홈의 타이핑과 경력 숫자는 브라우저 기본 요소로 동작한다. 필터·그림·결정표·이미지 재생은 React를 쓴다.
- 공통 스타일과 글꼴 선언은 별도 CSS로 배포해 페이지 사이에서 브라우저 캐시를 재사용한다.
- 움직이는 이미지 원본은 `src/assets/motion/`에 보관한다. `node scripts/media/optimize.mjs`로 `public/media/`의 애니메이션 WebP를 만든다. 캡처 스크립트도 변환을 실행한다.
