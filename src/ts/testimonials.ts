/**
 * @file Testimonials – Infinite-loop carousel with autoplay.
 *
 * Implements a centered carousel where the active slide is always in the
 * middle of the container, and neighboring slides "peek in" on either side
 * at reduced opacity (see CSS `.testimonials__slide:not(.active) { opacity: 0.3 }`).
 *
 * **Infinite-loop trick:**
 * On startup we clone the entire slide set twice (once before, once after
 * the original slides). That way there is always material to the left and
 * right of the active slide — an "empty" carousel end is invisible. Cloned
 * slides are marked with the `.clone` class in the DOM.
 *
 * **Autoplay policy:**
 * On hover the autoplay pauses (UX standard). On manual interaction
 * (Prev/Next/Dot), the timer is fully reset so the user gets the full read
 * time instead of being run over by autoplay after 1-2 seconds.
 */

export class Testimonials {
  private track: HTMLElement | null;
  private container: HTMLElement | null;
  private slides: HTMLElement[];
  private dots: NodeListOf<HTMLButtonElement>;
  private btnPrev: HTMLElement | null;
  private btnNext: HTMLElement | null;

  private current = 0;
  private total = 0;
  private autoplayTimer: number | undefined;

  /** Time between automatic slide changes (ms) */
  private readonly AUTOPLAY_DELAY = 6000;

  /**
   * Finds all relevant DOM elements, clones the slides for the loop effect,
   * caches the final slide list, and starts the carousel.
   */
  constructor() {
    this.track = document.querySelector('.testimonials__track');
    this.container = document.querySelector('.testimonials');
    this.dots = document.querySelectorAll('.testimonials__dots button');
    this.btnPrev = document.querySelector('.testimonials__btn--prev');
    this.btnNext = document.querySelector('.testimonials__btn--next');

    this.cloneSlides();

    this.slides = Array.from(document.querySelectorAll('.testimonials__slide'));
    this.total = this.dots.length;

    this.init();
  }

  /**
   * Duplicates all slides for the infinite-loop effect.
   *
   * Layout (3 original slides A, B, C):
   * ```
   * [C' B' A'] [A B C] [A'' B'' C'']
   *   prepended  original   appended
   * ```
   * On startup the carousel shows slide A (index 3 in the final list).
   * When stepping forward or back past the end, we simply continue into
   * the clones — visually identical to a loop.
   */
  private cloneSlides(): void {
    if (!this.track) return;
    const originals = Array.from(this.track.children) as HTMLElement[];

    originals.forEach(slide => {
      const clone = slide.cloneNode(true) as HTMLElement;
      clone.classList.add('clone');
      this.track!.appendChild(clone);
    });

    // Prepend: copies pushed to the front in reverse order
    // (so the visual order remains A B C, not C B A)
    [...originals].reverse().forEach(slide => {
      const clone = slide.cloneNode(true) as HTMLElement;
      clone.classList.add('clone');
      this.track!.prepend(clone);
    });
  }

  /**
   * Registers all event listeners:
   *  - Click on Prev/Next/Dot → manual navigation (resets autoplay)
   *  - Hover over carousel → autoplay pauses
   *  - Hover end → autoplay resumes
   *  - Resize → re-center the active slide
   */
  private init(): void {
    this.btnPrev?.addEventListener('click', () => this.handleManual(this.current - 1));
    this.btnNext?.addEventListener('click', () => this.handleManual(this.current + 1));

    this.dots.forEach((dot, i) => {
      dot.addEventListener('click', () => this.handleManual(i));
    });

    this.container?.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container?.addEventListener('mouseleave', () => this.startAutoplay());

    requestAnimationFrame(() => requestAnimationFrame(() => this.update()));

    window.addEventListener('resize', () => {
      if (this.track) this.track.style.transition = 'none';
      this.update();
      requestAnimationFrame(() => {
        if (this.track) this.track.style.transition = '';
      });
    });

    this.startAutoplay();
  }

  /**
   * Manual user action: stop the running timer, show the new slide, and
   * start the timer fresh. Prevents autoplay from advancing immediately
   * after the click (poor UX).
   *
   * @param index - Target index (may be negative or ≥ total, normalized in {@link go})
   */
  private handleManual(index: number): void {
    this.stopAutoplay();
    this.go(index);
    this.startAutoplay();
  }

  /**
   * Starts the autoplay interval. Defensive: first stops a possibly
   * running timer so there are never two timers running in parallel
   * (would be a memory leak on frequent hover).
   */
  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = window.setInterval(
      () => this.go((this.current + 1) % this.total),
      this.AUTOPLAY_DELAY
    );
  }

  /**
   * Stops the autoplay interval if one is running.
   */
  private stopAutoplay(): void {
    if (this.autoplayTimer !== undefined) {
      window.clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

  /**
   * Switches to a specific slide index. Normalizes with modulo so even
   * negative indices (current - 1 when Prev is pressed on the first slide)
   * correctly jump to the last slide instead of -1.
   *
   * @param index - Any integer (normalized modulo total)
   */
  private go(index: number): void {
    this.current = ((index % this.total) + this.total) % this.total;
    this.update();
  }

  /**
   * Positions the track via `translateX(...)` so that the active slide sits
   * **exactly centered** in the container. Also updates the `.active`
   * classes for slide highlighting and the active dot.
   *
   * **Centering math:**
   * ```
   * container width = c
   * slide width     = s
   * gap between slides = g (read dynamically from CSS!)
   * realIndex       = total + current  (because of prepended clones)
   *
   * offset = c/2 - s/2          ← distance from container center to slide start
   * move   = realIndex * (s + g) - offset
   * track.style.transform = translateX(-move)
   * ```
   *
   * Reading the gap from CSS instead of hardcoding it is important: when
   * breakpoints change, a hardcoded gap would accumulate a systematic
   * offset
   */
  private update(): void {
    const realIndex = this.total + this.current;
    const slide = this.slides[realIndex];

    if (this.track && slide) {
      const slideWidth = slide.offsetWidth;

      const computedGap = parseInt(getComputedStyle(this.track).gap, 10);
      const gap = Number.isFinite(computedGap) ? computedGap : 24;

      const container = this.track.parentElement?.offsetWidth ?? 0;
      const offset = container / 2 - slideWidth / 2;
      const move = realIndex * (slideWidth + gap) - offset;

      this.track.style.transform = `translateX(-${move}px)`;
    }

    this.slides.forEach((s, i) => {
      s.classList.toggle('active', i === realIndex);
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.current);
    });
  }
}