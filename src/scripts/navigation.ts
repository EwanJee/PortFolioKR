import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';

document.addEventListener('astro:before-swap', (event) => {
  const transition = event as TransitionBeforeSwapEvent;
  // 문서 교체·방문 기록·접근성 안내는 ClientRouter에 맡기고, 이전 화면을 붙잡는 효과만 생략한다.
  transition.viewTransition.skipTransition();
  transition.newDocument.documentElement.setAttribute('data-instant-navigation', '');
});
