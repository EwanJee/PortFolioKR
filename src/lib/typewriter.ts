// 지금 사이트의 Typed.js 설정(typeSpeed 65, backSpeed 65, backDelay 700)과 같은 타이밍을 만든다.
export type TypeState = { prefix: string; role: string; blinking: boolean };
export type Step = { state: TypeState; wait: number };

export const TYPE_SPEED = 65;
export const BACK_DELAY = 700;
// 처음 HTML에 들어 있는 첫 역할을 보여 주는 시간.
export const OPENING_PAUSE = 1500;
export const FINAL_PREFIX = 'I am ';

export function humanize(speed: number, rand: () => number = Math.random): number {
  return Math.round((rand() * speed) / 2) + speed;
}

export function finalState(roles: readonly string[]): TypeState {
  return { prefix: FINAL_PREFIX, role: roles[0] ?? '', blinking: false };
}

// 처음 HTML과 같은 문구("I am " + 첫 역할)에서 시작해 잠시 멈춘 뒤, 역할만 지우고 다음 역할을 입력하며 돈다.
export function* typewriterSteps(roles: readonly string[], rand: () => number = Math.random): Generator<Step, never, undefined> {
  if (roles.length === 0) throw new Error('roles가 비어 있습니다');
  const typing = () => humanize(TYPE_SPEED, rand);
  const prefix = FINAL_PREFIX;
  let role = roles[0];

  yield { state: { prefix, role, blinking: true }, wait: OPENING_PAUSE };
  for (let i = 1 % roles.length; ; i = (i + 1) % roles.length) {
    while (role.length > 0) {
      role = role.slice(0, -1);
      yield { state: { prefix, role, blinking: false }, wait: typing() };
    }
    for (const ch of roles[i]) {
      role += ch;
      yield { state: { prefix, role, blinking: false }, wait: typing() };
    }
    yield { state: { prefix, role, blinking: true }, wait: BACK_DELAY };
  }
}
