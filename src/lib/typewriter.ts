// 지금 사이트의 Typed.js 설정(typeSpeed 65, backSpeed 65, backDelay 700)과 같은 타이밍을 만든다.
export type TypeState = { prefix: string; role: string; blinking: boolean };
export type Step = { state: TypeState; wait: number };

export const TYPE_SPEED = 65;
export const BACK_DELAY = 700;
export const OPENING_PAUSE = 1500;
export const START_DELAY = 500;
export const OPENING_PREFIX = 'I will be A ';
export const OPENING_ROLE = 'Server Developer';
export const FINAL_PREFIX = 'I am ';

export function humanize(speed: number, rand: () => number = Math.random): number {
  return Math.round((rand() * speed) / 2) + speed;
}

export function finalState(roles: readonly string[]): TypeState {
  return { prefix: FINAL_PREFIX, role: roles[0] ?? '', blinking: false };
}

export function* typewriterSteps(roles: readonly string[], rand: () => number = Math.random): Generator<Step, never, undefined> {
  if (roles.length === 0) throw new Error('roles가 비어 있습니다');
  const typing = () => humanize(TYPE_SPEED, rand);
  let prefix = OPENING_PREFIX;
  let role = '';

  yield { state: { prefix, role, blinking: true }, wait: START_DELAY };
  for (const ch of OPENING_ROLE) {
    role += ch;
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  yield { state: { prefix, role, blinking: true }, wait: OPENING_PAUSE };
  while (role.length > 0) {
    role = role.slice(0, -1);
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  while (prefix.length > 2) {
    prefix = prefix.slice(0, -1);
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  for (const ch of FINAL_PREFIX.slice(2)) {
    prefix += ch;
    yield { state: { prefix, role, blinking: false }, wait: typing() };
  }
  for (let i = 0; ; i = (i + 1) % roles.length) {
    for (const ch of roles[i]) {
      role += ch;
      yield { state: { prefix, role, blinking: false }, wait: typing() };
    }
    yield { state: { prefix, role, blinking: true }, wait: BACK_DELAY };
    while (role.length > 0) {
      role = role.slice(0, -1);
      yield { state: { prefix, role, blinking: false }, wait: typing() };
    }
  }
}
