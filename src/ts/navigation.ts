/**
 * @file Navigation – Header behavior, mobile menu and smooth scroll.
 *
 * Manages three independent UI areas that all belong to the navigation: the
 * visual scrolled state of the header, the collapsible burger menu on mobile,
 * and smooth scrolling to anchor links (e.g. #about).
 */

/**
 * Central navigation class.
 *
 * Holds references to all navigation-related DOM elements and initializes
 * their event listeners in the constructor. Instantiated once in
 * {@link main.ts} after DOMContentLoaded.
 */
export class Navigation {
  /** Main header container (used for the scrolled class) */
  private nav: HTMLElement;

  /** Burger button on mobile (opens/closes the menu) */
  private toggle: HTMLElement | null;

  /** Full-screen overlay menu for mobile */
  private mobileMenu: HTMLElement | null;

  /** Current open state of the mobile menu */
  private isOpen = false;

  /**
   * Finds all relevant DOM elements and initializes the three behavior
   * areas (scroll, mobile, smooth-scroll).
   */
  constructor() {
    this.nav = document.querySelector('.nav') as HTMLElement;
    this.toggle = document.querySelector('.nav__toggle');
    this.mobileMenu = document.querySelector('.nav__mobile');

    this.initScroll();
    this.initMobile();
    this.initSmoothScroll();
  }

  /**
   * Initializes the visual scroll feedback of the header.
   * Once the user has scrolled more than 40px, the `scrolled` class is set —
   * CSS responds with background blur and a border.
   *
   * `passive: true` signals to the browser that we won't call preventDefault()
   * → better scroll performance.
   */
  private initScroll(): void {
    const onScroll = () => {
      this.nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /**
   * Initializes the burger menu on mobile.
   *
   * Click on toggle → menu opens/closes.
   * Click on a menu link → menu closes automatically (so the user sees the
   * target section immediately instead of having it hidden by the overlay).
   */
  private initMobile(): void {
    this.toggle?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.mobileMenu?.classList.toggle('open', this.isOpen);
    });

    this.mobileMenu?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.isOpen = false;
        this.mobileMenu?.classList.remove('open');
      });
    });
  }

  /**
   * Enables smooth scrolling for all internal anchor links (`href="#..."`).
   *
   * preventDefault() avoids the jumpy native scroll
   * scrollIntoView({ behavior: 'smooth' }).
   */
  private initSmoothScroll(): void {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const href = (anchor as HTMLAnchorElement).getAttribute('href');
        if (!href) return;
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}