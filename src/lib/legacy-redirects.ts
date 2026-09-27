// 예전 사이트는 한 페이지 안의 해시로 섹션을 열었다. 그 링크를 새 주소로 넘긴다.
export const LEGACY_HASH_TARGETS: Readonly<Record<string, string>> = {
  '#about': '/about/',
  '#education': '/about/',
  '#skills': '/about/',
  '#experience': '/career/',
  '#roadmap': '/career/',
  '#portfolio': '/projects/',
  '#contacts': '/contact/',
};

export function legacyTarget(hash: string): string | null {
  return LEGACY_HASH_TARGETS[hash] ?? null;
}
