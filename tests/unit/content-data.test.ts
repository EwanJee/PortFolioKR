import { describe, expect, it } from 'vitest';
import { career, education } from '../../src/data/career';
import { personalProjects } from '../../src/data/personal-projects';
import { skills } from '../../src/data/skills';
import { profile } from '../../src/data/profile';
import { personalLabel } from '../../src/lib/project-filter';

describe('경력', () => {
  it('최근 팀부터 Purchase, Retention, Global 순서다', () => {
    expect(career.slice(0, 3).map((c) => c.team)).toEqual(['purchase', 'retention', 'global']);
  });
  it('모든 줄에 근거 ID가 있다', () => {
    expect(career.flatMap((c) => c.bullets).every((b) => b.evidence.length > 0)).toBe(true);
  });
  it('모든 줄이 "프로젝트명: 설명" 형식이다(프로젝트명은 따로 두고 설명에서 되풀이하지 않는다)', () => {
    for (const b of career.flatMap((c) => c.bullets)) {
      expect(b.project.trim()).not.toBe('');
      expect(b.project).not.toContain(':');
      const first = b.parts[0];
      expect(typeof first === 'string' && first.startsWith(b.project)).toBe(false);
    }
  });
  it('도쿄 팝업 챗봇 줄 아래에 하라주쿠 팝업 재활용이 있다(사용자 확인 사실)', () => {
    const chatbot = career.flatMap((c) => c.bullets).find((b) => b.project === '도쿄 팝업 스토어 안내 챗봇');
    const text = (chatbot?.details ?? []).flatMap((d) => d.parts).filter((p) => typeof p === 'string').join('');
    expect(text).toContain('하라주쿠 팝업');
  });
  it('경력 문장에 진행 중, 검토 중 같은 상태 표기가 없다', () => {
    const strings = career.flatMap((c) => c.bullets.flatMap((b) => [...b.parts, ...(b.details ?? []).flatMap((d) => d.parts)])).filter((p) => typeof p === 'string');
    expect(strings.filter((s) => /(진행|검토|리뷰) ?중/.test(s))).toEqual([]);
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
  it('개인 프로젝트는 EwanJee 저장소로, 부트캠프는 팀 조직 GitHub로 연결되고, 회사 프로젝트는 링크가 없다', () => {
    expect(personalProjects.map((p) => [personalLabel({ kind: 'personal', ...p }), p.href ?? null])).toEqual([
      ['부트캠프 팀 프로젝트', 'https://github.com/twelevegg'],
      ['개인 프로젝트', 'https://github.com/EwanJee/NEWJOB-Ver2.0'],
      ['개인 프로젝트', 'https://github.com/EwanJee/HealthWebApp'],
      ['아이헤이트플라잉버그스: R&D', null],
      ['프레디저: 백엔드', null],
    ]);
  });
  it('경력 제목은 "회사명: 팀명"이고, 제목을 누르면 프로젝트의 그 탭으로 연결된다', () => {
    expect(career.map((c) => [c.title, c.link ?? null])).toEqual([
      ['무신사: Purchase 팀', '/projects/?team=purchase'],
      ['무신사: Retention 팀', '/projects/?team=retention'],
      ['무신사: Global 팀', '/projects/?team=global'],
      ['아이헤이트플라잉버그스: R&D', '/projects/?team=ihateflyingbugs'],
      ['프레디저: 백엔드', '/projects/?team=prediger'],
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
