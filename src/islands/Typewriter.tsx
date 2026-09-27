import { useEffect, useState } from 'react';
import { FINAL_PREFIX, finalState, typewriterSteps, type TypeState } from '../lib/typewriter';

type Props = { roles: string[] };

// HTML에는 첫 역할 문구("I am " + 첫 역할)를 넣어 두고(스크립트가 없어도 보이게), 살아나면 같은 문구에서 이어서 입력한다.
// 첫 화면과 움직임의 시작이 같은 문구라서 숨겨 둘 필요가 없다.
export default function Typewriter({ roles }: Props) {
  const [state, setState] = useState<TypeState>(() => finalState(roles));

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const steps = typewriterSteps(roles);
    let timer = 0;
    const tick = () => {
      const next = steps.next();
      if (next.done) return;
      setState(next.value.state);
      timer = window.setTimeout(tick, next.value.wait);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [roles]);

  return (
    <p className="typed">
      <span className="visually-hidden">{`I am ${roles.join(', ')}`}</span>
      <span className="typed-visible" aria-hidden="true">
        {state.prefix}
        <span className="typed-role">{state.role}</span>
        <span className={state.blinking ? 'typed-cursor is-blinking' : 'typed-cursor'}>|</span>
      </span>
      {/* 입력할 수 있는 모든 줄을 보이지 않게 겹쳐 두어, 칸 높이를 가장 긴 줄에 맞춘다(global.css의 .typed-sizer). */}
      {roles.map((role) => (
        <span key={role} className="typed-sizer" aria-hidden="true">
          {FINAL_PREFIX}
          <span className="typed-role">{role}</span>
          <span className="typed-cursor">|</span>
        </span>
      ))}
    </p>
  );
}
