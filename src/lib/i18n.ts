// 지금은 한국어만 만든다. 콘텐츠는 src/content/<컬렉션>/<언어>/ 폴더에 둔다.
// 영어를 켤 때는 en 폴더, 이 설정, /en 페이지를 더한다(설계 2장).
export const CONTENT_LANG = 'ko';

export function inContentLang({ id }: { id: string }): boolean {
  return id.startsWith(`${CONTENT_LANG}/`);
}

export function slugOf(id: string): string {
  return id.slice(CONTENT_LANG.length + 1);
}
