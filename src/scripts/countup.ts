import { valueAt } from '../lib/countup';

class PortfolioCountup extends HTMLElement {
  private observer?: IntersectionObserver;
  private raf = 0;
  private begin = 0;
  private finish = 0;

  connectedCallback() {
    // 메뉴 이동에서는 이미 HTML에 있는 최종 값을 유지해 내용을 기다리게 하지 않는다.
    if (document.documentElement.hasAttribute('data-instant-navigation') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      this.observer?.disconnect();
      this.animateValue();
    });
    this.observer.observe(this);
  }

  private animateValue() {
    const target = Number(this.dataset.to);
    const num = this.querySelector('.num');
    if (!num || !Number.isFinite(target)) return;
    num.textContent = '0';
    this.begin = window.setTimeout(() => {
      const start = performance.now();
      const frame = () => {
        const elapsed = performance.now() - start;
        num.textContent = String(valueAt(target, elapsed));
        if (elapsed < 700) this.raf = requestAnimationFrame(frame);
      };
      this.raf = requestAnimationFrame(frame);
    }, 300);
    this.finish = window.setTimeout(() => {
      cancelAnimationFrame(this.raf);
      num.textContent = String(target);
    }, 1200);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.begin);
    window.clearTimeout(this.finish);
  }
}

customElements.define('portfolio-countup', PortfolioCountup);
