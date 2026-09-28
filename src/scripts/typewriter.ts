import { finalState, typewriterSteps } from '../lib/typewriter';

class PortfolioTypewriter extends HTMLElement {
  private timer = 0;

  connectedCallback() {
    // ClientRouter가 DOM에 넣은 뒤 자식 노드를 읽는다.
    this.timer = window.setTimeout(() => this.start(), 0);
  }

  private start() {
    const roles: string[] = JSON.parse(this.dataset.roles ?? '[]');
    const role = this.querySelector('.typed-visible .typed-role');
    const cursor = this.querySelector('.typed-visible .typed-cursor');
    if (!role || !cursor || roles.length === 0) return;
    role.textContent = finalState(roles).role;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const steps = typewriterSteps(roles);
    const tick = () => {
      const { value } = steps.next();
      role.textContent = value.state.role;
      cursor.classList.toggle('is-blinking', value.state.blinking);
      this.timer = window.setTimeout(tick, value.wait);
    };
    tick();
  }

  disconnectedCallback() {
    window.clearTimeout(this.timer);
  }
}

customElements.define('portfolio-typewriter', PortfolioTypewriter);
