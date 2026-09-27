import { useEffect, useState } from 'react';
import { FINAL_PREFIX, OPENING_PREFIX, OPENING_ROLE, finalState, typewriterSteps, type TypeState } from '../lib/typewriter';

type Props = { roles: string[] };

// HTML에는 최종 문구를 넣어 두고(스크립트가 없어도 보이게), 살아나면 지금 사이트 문구부터 다시 입력한다.
// 살아나기 전 최대 1.5초는 data-pending으로 숨겨서 최종 문구가 잠깐 보였다 바뀌는 깜빡임을 막는다.
export default function Typewriter({ roles }: Props) {
  const [state, setState] = useState<TypeState>(() => finalState(roles));
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLive(true);
      return;
    }
    const steps = typewriterSteps(roles);
    let timer = 0;
    const tick = () => {
      const next = steps.next();
      if (next.done) return;
      setState(next.value.state);
      timer = window.setTimeout(tick, next.value.wait);
    };
    setLive(true);
    tick();
    return () => window.clearTimeout(timer);
  }, [roles]);

  return (
    <p className="typed" data-pending={live ? undefined : ''}>
      <span className="visually-hidden">{`I am ${roles.join(', ')}`}</span>
      <span className="typed-visible" aria-hidden="true">
        {state.prefix}
        <span className="typed-role">{state.role}</span>
        <span className={state.blinking ? 'typed-cursor is-blinking' : 'typed-cursor'}>|</span>
      </span>
      {/* 입력할 수 있는 모든 줄을 보이지 않게 겹쳐 두어, 칸 높이를 가장 긴 줄에 맞춘다(global.css의 .typed-sizer). */}
      {[[OPENING_PREFIX, OPENING_ROLE], ...roles.map((role) => [FINAL_PREFIX, role])].map(([prefix, role]) => (
        <span key={`${prefix}${role}`} className="typed-sizer" aria-hidden="true">
          {prefix}
          <span className="typed-role">{role}</span>
          <span className="typed-cursor">|</span>
        </span>
      ))}
    </p>
  );
}
