import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { profile } from '../../data/profile';
import { resume } from '../../data/resume';
import { inContentLang, slugOf } from '../../lib/i18n';
import type { Team } from '../../lib/teams';

// 설계 7장: 미리보기 이미지에 제목과 팀 색을 넣는다. 팀이 없는 페이지는 강조 초록을 쓴다.
type RGB = [number, number, number];
type OgPage = { title: string; description: string; color: RGB };

const ACCENT: RGB = [18, 214, 64];
const TEAM_RGB: Record<Team, RGB> = { global: [93, 173, 226], retention: [245, 176, 65], purchase: [195, 155, 211] };

const cases = await getCollection('projects', inContentLang);

const pages: Record<string, OgPage> = {
  index: { title: `${profile.nameKo} ${profile.nameEn}`, description: profile.intro, color: ACCENT },
  about: { title: 'About', description: profile.intro, color: ACCENT },
  career: { title: 'Career', description: '무신사: Purchase 팀, Retention 팀, Global 팀과 이전 회사에서 한 일', color: ACCENT },
  resume: { title: 'Resume', description: resume.description, color: ACCENT },
  projects: { title: 'Projects', description: '무신사 사례 8개와 이전 회사, 개인·부트캠프 프로젝트', color: ACCENT },
  troubleshooting: { title: 'Troubleshooting', description: '장애와 오류를 찾아 고친 기록', color: ACCENT },
  contact: { title: 'Contact', description: '이메일, GitHub, LinkedIn, 블로그로 연락할 수 있습니다.', color: ACCENT },
  ...Object.fromEntries(
    cases.map((c) => [`projects/${slugOf(c.id)}`, { title: c.data.title, description: c.data.summary, color: TEAM_RGB[c.data.team] }]),
  ),
};

// astro-og-canvas 0.13은 경로 파라미터 이름을 파일 이름(`[...route]`)에서 읽는다(`param` 옵션 없음).
export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[1, 14, 27]],
    border: { color: page.color, width: 12, side: 'inline-start' },
    padding: 80,
    font: {
      title: { families: ['Pretendard'], weight: 'Bold', size: 64, color: [255, 255, 255] },
      description: { families: ['Pretendard'], weight: 'Normal', size: 34, color: [205, 214, 224] },
    },
    fonts: [
      './node_modules/pretendard/dist/public/static/Pretendard-Bold.otf',
      './node_modules/pretendard/dist/public/static/Pretendard-Regular.otf',
    ],
  }),
});
