/**
 * @file ScrollReveal – Reveal animations via IntersectionObserver.
 */

/**
 * Observes all elements with the `.reveal` class and adds `.visible` to them
 * once they scroll into the viewport.
 *
 * CSS hides `.reveal` with `opacity: 0` and a slight `translateY`; the
 * `.reveal.visible` rule resets both → fade-in + slide-up effect.
 *
 * Performance: we use the native IntersectionObserver instead of
 * `scroll` events because it is browser-optimized (runs off-thread and only
 * fires on actual visibility changes).
 *
 * After the first appearance, we `unobserve()` the element 
 */
export class ScrollReveal {

  private observer: IntersectionObserver;

  /**
   * Creates the observer with a 12% visibility threshold and a negative
   * bottom margin (element must be 40px inside the viewport before it
   * triggers — feels more natural than firing on the very first pixel).
   */
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => {
      this.observer.observe(el);
    });
  }
}