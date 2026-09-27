import { useEffect, useState } from 'react';
import { valueAt } from '../lib/countup';

type Props = { to: number; delay?: number; duration?: number };

// HTML에는 최종 값을 넣어 둔다. 경과 시간은 실제 시계로 재고, 끝나는 시점에 최종 값을 한 번 더 넣는다
// (화면 갱신이 멈추거나 같은 시각으로 불려도 0에 멈추지 않게).
export default function CountUp({ to, delay = 300, duration = 700 }: Props) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let done = false;
    let start: number | null = null;
    const frame = () => {
      if (done) return;
      const now = performance.now();
      if (start === null) start = now;
      setValue(valueAt(to, now - start, duration));
      if (now - start < duration) raf = requestAnimationFrame(frame);
      else done = true;
    };
    setValue(0);
    const begin = window.setTimeout(() => {
      raf = requestAnimationFrame(frame);
    }, delay);
    const finish = window.setTimeout(() => {
      done = true;
      setValue(to);
    }, delay + duration + 200);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(begin);
      window.clearTimeout(finish);
    };
  }, [to, delay, duration]);

  return <span className="num">{value}</span>;
}
