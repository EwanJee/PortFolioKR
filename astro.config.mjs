import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://ewanjee.com',
  integrations: [react(), mdx()],
  // CSS를 페이지 안에 넣어 화면 그리기를 막는 추가 요청을 없앤다(Lighthouse 성능).
  build: { inlineStylesheets: 'always' },
});
