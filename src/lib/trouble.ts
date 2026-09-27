// 트러블슈팅 카드의 펼침 칸: 드러난 방식에서 문서화(문서와 Jira에 남긴 방식)까지 순서대로 놓고, 비어 있는 칸은 뺀다.
export type TroubleFields = {
  symptom?: string;
  definition?: string;
  approach?: string;
  cause?: string;
  fix?: string;
  verification?: string;
  prevention?: string;
  record?: string;
};

const ORDER: [keyof TroubleFields, string][] = [
  ['symptom', '증상'],
  ['definition', '문제 정의'],
  ['approach', '접근'],
  ['cause', '원인'],
  ['fix', '해결'],
  ['verification', '검증'],
  ['prevention', '재발 방지'],
  ['record', '문서화'],
];

export function troubleRows(fields: TroubleFields): [string, string][] {
  return ORDER.flatMap(([key, label]) => {
    const value = fields[key];
    return value ? [[label, value] as [string, string]] : [];
  });
}
