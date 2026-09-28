import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://ewanjee.com',
  integrations: [react(), mdx()],
  // 큰 공통 글꼴·스타일은 한 번 받은 뒤 페이지 사이에서 재사용한다.
  build: { inlineStylesheets: 'auto' },
});
