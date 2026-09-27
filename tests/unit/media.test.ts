import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIR = 'public/media';
const gifs = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.gif')) : [];

describe('움직이는 화면(GIF) 예산', () => {
  it('GIF가 하나 이상 있다', () => {
    expect(gifs.length).toBeGreaterThan(0);
  });

  it.each(gifs)('%s: 2MB 이하, 가로 240~320px', (name) => {
    const path = join(DIR, name);
    expect(statSync(path).size).toBeLessThanOrEqual(2 * 1024 * 1024);
    const buf = readFileSync(path);
    expect(buf.subarray(0, 3).toString()).toBe('GIF');
    const width = buf.readUInt16LE(6);
    expect(width).toBeGreaterThanOrEqual(240);
    expect(width).toBeLessThanOrEqual(320);
  });
});
