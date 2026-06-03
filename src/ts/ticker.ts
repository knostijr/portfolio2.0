/**
 * @file Ticker – Infinite marquee for the diagonal hero banner.
 */

/**
 * Endless ticker text in the hero area.
 *
 * For the marquee to look seamless (no visible gap when it resets), the
 * content is duplicated at runtime. The actual animation happens in CSS via
 * `@keyframes` and `translateX(-50%)` — once the first half has scrolled past,
 * the identical second half starts without any jump.
 */
export class Ticker {
  /** The `.ticker__track` container whose content gets duplicated */
  private track: HTMLElement | null;

  /**
   * Finds the ticker track and calls the initializer immediately.
   */
  constructor() {
    this.track = document.querySelector('.ticker__track');
    this.init();
  }

  /**
   * Duplicates the inner HTML of the track for seamless looping.
   *
   * Example: `<span>A</span><span>B</span>` becomes
   * `<span>A</span><span>B</span><span>A</span><span>B</span>`. The CSS
   * animation runs from 0% to -50% — at the end it looks identical to the
   * start.
   */
  private init(): void {
    if (!this.track) return;
    const items = this.track.innerHTML;
    this.track.innerHTML = items + items;
  }
}