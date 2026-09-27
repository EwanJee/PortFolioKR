// 프로젝트와 트러블슈팅이 함께 쓰는 거르기 탭. 스크립트가 없으면 CSS가 숨긴다(누를 수 없는 버튼을 보이지 않게).
type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = { options: Option<T>[]; value: T; onChange: (value: T) => void; label: string };

export default function FilterTabs<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div className="filters" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className="filter" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
