import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkDist, collectRefs } from '../../scripts/link-check.mjs';

describe('collectRefs', () => {
  it('href와 src를 모은다', () => {
    expect(collectRefs('<a href="/a/">a</a><img src="/b.png">')).toEqual(['/a/', '/b.png']);
  });
});

describe('checkDist', () => {
  it('없는 파일과 없는 앵커를 알린다', () => {
    const dist = mkdtempSync(join(tmpdir(), 'dist-'));
    mkdirSync(join(dist, 'about'));
    mkdirSync(join(dist, 'troubleshooting'));
    writeFileSync(join(dist, 'about', 'index.html'), '<p>about</p>');
    writeFileSync(join(dist, 'troubleshooting', 'index.html'), '<article id="a"></article>');
    writeFileSync(
      join(dist, 'index.html'),
      '<a href="/about/"></a><a href="/about"></a><a href="/missing/"></a><a href="/troubleshooting/#a"></a><a href="/troubleshooting/#b"></a><a href="https://example.com/"></a><a href="/projects/?stack=Kafka"></a>',
    );
    const problems = checkDist(dist);
    expect(problems).toContain('index.html -> /missing/ (파일 없음)');
    expect(problems).toContain('index.html -> /troubleshooting/#b (앵커 없음)');
    expect(problems).toContain('index.html -> /projects/?stack=Kafka (파일 없음)');
    expect(problems).toHaveLength(3);
  });
});
