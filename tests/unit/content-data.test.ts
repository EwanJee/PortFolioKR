import { describe, expect, it } from 'vitest';
import { career, education } from '../../src/data/career';
import { personalProjects } from '../../src/data/personal-projects';
import { skills } from '../../src/data/skills';
import { profile } from '../../src/data/profile';

describe('경력', () => {
  it('최근 팀부터 Purchase, Retention, Global 순서다', () => {
    expect(career.slice(0, 3).map((c) => c.team)).toEqual(['purchase', 'retention', 'global']);
  });
  it('모든 줄에 근거 ID가 있다', () => {
    expect(career.flatMap((c) => c.bullets).every((b) => b.evidence.length > 0)).toBe(true);
  });
  it('움직이는 숫자는 모두 양수다', () => {
    const counts = career.flatMap((c) => c.bullets.flatMap((b) => b.parts.filter((p) => typeof p !== 'string')));
    expect(counts.every((p) => typeof p !== 'string' && p.count > 0)).toBe(true);
  });
  it('Rutgers는 2025.01 졸업이다', () => {
    expect(education[0]).toMatchObject({ title: 'Rutgers University–New Brunswick', period: '2022.08 ~ 2025.01' });
  });
});

describe('기술과 개인 프로젝트', () => {
  it('기술 이름이 겹치지 않는다', () => {
    const all = skills.flatMap((g) => g.items);
    expect(new Set(all).size).toBe(all.length);
  });
  it('개인 프로젝트는 EwanJee GitHub 저장소로 연결된다', () => {
    expect(personalProjects.map((p) => p.href)).toEqual([
      'https://github.com/EwanJee/NEWJOB-Ver2.0',
      'https://github.com/EwanJee/HealthWebApp',
    ]);
  });
});

describe('프로필', () => {
  it('타이핑 첫 문구는 a Product Engineer다', () => {
    expect(profile.roles[0]).toBe('a Product Engineer');
    expect(profile.roles).toContain('a Backend Developer');
  });
  it('전화번호 모양이 없다', () => {
    expect(JSON.stringify(profile)).not.toMatch(/01[016789]-?\d{3,4}-?\d{4}/);
  });
});
