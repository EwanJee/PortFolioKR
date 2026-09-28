// Astro가 사용하는 sharp로 캡처 원본을 애니메이션 WebP로 변환한다.
// 사용: node scripts/media/optimize.mjs (캡처 원본은 배포하지 않는다.)
import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';

await mkdir('public/media', { recursive: true });
for (const name of await readdir('src/assets/motion')) {
  if (!name.endsWith('.gif')) continue;
  const source = `src/assets/motion/${name}`;
  const output = `public/media/${name.replace(/\.gif$/, '.webp')}`;
  await sharp(source, { animated: true }).webp({ quality: 75, effort: 6 }).toFile(output);
  console.log(`${name}: ${(await stat(source)).size} -> ${(await stat(output)).size} bytes`);
}
