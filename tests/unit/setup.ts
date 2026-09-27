import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest 전역(globals)을 켜지 않았으므로 Testing Library의 자동 정리가 돌지 않는다. 테스트마다 화면을 비운다.
afterEach(() => cleanup());
