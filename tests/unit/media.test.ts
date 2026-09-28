import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const DIR = 'public/media';
const images = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.webp')) : [];

describe('움직이는 화면 전송 예산', () => {
  it('WebP 두 개를 배포하고 GIF 원본은 배포 폴더에 두지 않는다', () => {
    expect(images).toHaveLength(2);
    expect(readdirSync(DIR).filter((f) => f.endsWith('.gif'))).toEqual([]);
  });

  it.each(images)('%s: 1MB 이하이며 원본 크기·재생 시간·반복을 유지한다', async (name) => {
    const path = join(DIR, name);
    expect(statSync(path).size).toBeLessThanOrEqual(1024 * 1024);
    const buf = readFileSync(path);
    expect(buf.subarray(8, 12).toString()).toBe('WEBP');
    const result = await sharp(path, { animated: true }).metadata();
    const source = await sharp(join('src/assets/motion', name.replace(/\.webp$/, '.gif')), { animated: true }).metadata();
    expect(result.width).toBe(source.width);
    expect(result.pageHeight).toBe(source.pageHeight);
    expect(result.pages).toBeGreaterThan(1);
    expect(result.loop).toBe(source.loop);
    const duration = (delays: number[] = []) => delays.reduce((sum, ms) => sum + ms, 0);
    expect(duration(result.delay)).toBe(duration(source.delay));
  });
});
