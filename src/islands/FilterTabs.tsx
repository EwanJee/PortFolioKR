import { useEffect, useRef, useState } from 'react';

// 프로젝트와 트러블슈팅이 함께 쓰는 거르기 탭. 스크립트가 없으면 CSS가 숨긴다(누를 수 없는 버튼을 보이지 않게).
// 탭은 한 줄로 놓이고 옆으로 밀어 넘긴다. 가려진 탭이 있는 쪽은 data-more로 알려 CSS가 그쪽 가장자리를 흐리게 한다.
type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = { options: Option<T>[]; value: T; onChange: (value: T) => void; label: string };

// 눌린 탭이 탭 줄 밖에 있으면 탭 줄만 옆으로 옮긴다(페이지는 세로로 움직이지 않는다).
const EDGE = 24;

export default function FilterTabs<T extends string>({ options, value, onChange, label }: Props<T>) {
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState('');

  const measure = () => {
    const el = row.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore([left && 'left', right && 'right'].filter(Boolean).join(' '));
  };

  useEffect(() => {
    const el = row.current;
    const pressed = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (el && pressed) {
      const box = el.getBoundingClientRect();
      const tab = pressed.getBoundingClientRect();
      if (tab.left < box.left) el.scrollLeft -= box.left - tab.left + EDGE;
      else if (tab.right > box.right) el.scrollLeft += tab.right - box.right + EDGE;
    }
    measure();
  }, [value]);

  // 창 폭이 바뀌거나 글꼴이 바뀌어 탭 폭이 달라지면 다시 잰다.
  useEffect(() => {
    const el = row.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.querySelectorAll('.filter').forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  // 마우스 휠(세로)로도 탭 줄을 옆으로 넘긴다. 끝에 닿으면 페이지가 그대로 내려가고, 트랙패드의 가로 밀기는 브라우저에 맡긴다.
  // React의 onWheel은 기본 동작을 막을 수 없어서 직접 단다.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const next = Math.min(el.scrollWidth - el.clientWidth, Math.max(0, el.scrollLeft + e.deltaY));
      if (Math.abs(next - el.scrollLeft) < 1) return;
      e.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div ref={row} className="filters" role="group" aria-label={label} data-more={more || undefined} onScroll={measure}>
      {options.map((o) => (
        <button key={o.id} type="button" className="filter" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
