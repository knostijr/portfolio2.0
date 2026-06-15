/**
 * @file Projects – Project list with hover preview and detail modal.
 *
 * Two interactions:
 *  1. **Hover preview** (desktop):
 *     Mouse over a list item → preview image flies in on the right and
 *     positions itself vertically at the height of the hovered item.
 *  2. **Click modal** (all devices):
 *     Click on an item opens a fullscreen modal with detail text, tags,
 *     and GitHub / Live-Test buttons.
 *
 * Project data is stored as the constant {@link PROJECTS} at the top of this
 * file — to add a new project, append to the array and add a matching `<li>`
 * entry in the HTML (with the same `data-index`).
 */

/**
 * Data structure of a single portfolio project.
 * Written into the modal DOM fields on open.
 */
interface ProjectData {
  number: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  github: string;
  live: string;
}

/**
 * List of all projects shown in the portfolio.
 *
 * Important: The order must match the HTML — the `data-index` attribute on
 * each `<li class="projects__item">` points to the array index here.
 *
 * TODO: Fill `github` and `live` with the real URLs of the deployed projects
 *       (currently '#' as placeholders).
 */
const PROJECTS: ProjectData[] = [
  {
    number: '01',
    title: 'Join',
    description: 'Task manager inspired by the Kanban System. Create and organize tasks using drag and drop functions, assign users and categories.',
    tags: ['Angular', 'TypeScript', 'HTML', 'CSS', 'Firebase'],
    image: '/images/join.png',
    github: 'https://github.com/knostijr/join-team.git',
    live: '#'
  },
  {
    number: '02',
    title: 'Pokédex',
    description: 'A Pokédex web app that fetches data from the PokéAPI. Browse, search, and view detailed stats for every Pokémon.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    image: '/images/pokedex.png',
    github: 'https://github.com/knostijr/pokedex.git',
    live: '#'
  },
  {
    number: '03',
    title: 'Bestellapp',
    description: 'A pizza ordering app where users can browse the menu, add items to a cart, and complete an order with delivery details.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    image: '/images/bestellapp.png',
    github: 'https://github.com/knostijr/orderapp.git',
    live: '#'
  }
];

/**
 * Projects class: binds hover preview and modal logic to the DOM.
 *
 * Instantiated once after DOMContentLoaded. Holds references to all relevant
 * containers and tracks the currently displayed index for the
 * "Next project" navigation.
 */
export class Projects {
  /** All `<li class="projects__item">` elements */
  private items: NodeListOf<HTMLElement>;

  /** The floating preview container (right of the list on desktop) */
  private preview: HTMLElement | null;

  /** The `<img>` element inside the preview container */
  private previewImg: HTMLImageElement | null;

  /** The surrounding grid layout — mouse enter/leave controls preview visibility */
  private layout: HTMLElement | null;

  /** The fullscreen detail modal */
  private modal: HTMLElement | null;

  /** Index of the project currently shown in the modal (used by "Next project") */
  private currentIndex = 0;

  /**
   * Finds all DOM elements and initializes the event listeners.
   */
  constructor() {
    this.items = document.querySelectorAll('.projects__item');
    this.preview = document.querySelector('.projects__preview');
    this.previewImg = document.querySelector('.projects__preview-img');
    this.layout = document.querySelector('.projects__layout');
    this.modal = document.querySelector('.project-modal');
    this.init();
  }

  /**
   * Attaches all event listeners:
   *  - `mouseenter` on items   → show hover preview
   *  - `click` on items        → open modal
   *  - `mouseleave` on layout  → hide hover preview
   *  - Modal controls (close button, overlay click, next button)
   *  - Global `keydown` for the Escape key
   */
  private init(): void {
    this.items.forEach(item => {
      item.addEventListener('mouseenter', () => this.showPreview(item));
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index || '0', 10);
        this.openModal(idx);
      });
    });

    this.layout?.addEventListener('mouseleave', () => {
      this.preview?.classList.remove('active');
    });

    const closeBtn = this.modal?.querySelector('.project-modal__close');
    const overlay = this.modal?.querySelector('.project-modal__overlay');
    const nextBtn = this.modal?.querySelector('.project-modal__next');

    closeBtn?.addEventListener('click', () => this.closeModal());
    overlay?.addEventListener('click', () => this.closeModal());
    nextBtn?.addEventListener('click', () => this.nextProject());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  /**
   * Shows the preview image for a project item and positions it vertically
   * so its center aligns with the center of the hovered item.
   *
   * Calculated with `getBoundingClientRect()` because the layout is dynamic
   * (responsive font sizes → variable item heights).
   *
   * @param item - The hovered `<li class="projects__item">` element
   */
  private showPreview(item: HTMLElement): void {
    const src = item.dataset.preview;
    if (!src || !this.previewImg || !this.preview || !this.layout) return;

    const itemRect = item.getBoundingClientRect();
    const layoutRect = this.layout.getBoundingClientRect();
    const previewHeight = this.preview.offsetHeight;

    const top = itemRect.top - layoutRect.top + itemRect.height / 2 - previewHeight / 2;

    this.previewImg.src = src;
    this.preview.style.top = `${top}px`;
    this.preview.classList.add('active');
  }

  /**
   * Opens the detail modal for a project.
   *
   * Also adds `body.modal-open` → CSS prevents background scrolling while
   * the modal is open.
   *
   * @param index - Index in the {@link PROJECTS} array
   */
  private openModal(index: number): void {
    if (!this.modal) return;
    this.currentIndex = index;
    this.fillModal(PROJECTS[index]);
    this.modal.classList.add('open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  /**
   * Closes the modal and restores the normal scroll state.
   */
  private closeModal(): void {
    if (!this.modal) return;
    this.modal.classList.remove('open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  /**
   * Advances the modal one step further (modulo, so after the last project
   * it loops back to the first).
   */
  private nextProject(): void {
    this.currentIndex = (this.currentIndex + 1) % PROJECTS.length;
    this.fillModal(PROJECTS[this.currentIndex]);
  }

  /**
   * Fills all modal fields with the data of one project.
   * Called by both {@link openModal} and {@link nextProject}.
   *
   * @param project - The project data to display
   */
  private fillModal(project: ProjectData): void {
    if (!this.modal) return;

    const number = this.modal.querySelector('.project-modal__number');
    const title = this.modal.querySelector('.project-modal__title');
    const desc = this.modal.querySelector('.project-modal__desc');
    const tagsEl = this.modal.querySelector('.project-modal__tags');
    const img = this.modal.querySelector('.project-modal__img') as HTMLImageElement;
    const github = this.modal.querySelector('.project-modal__btn--github') as HTMLAnchorElement;
    const live = this.modal.querySelector('.project-modal__btn--live') as HTMLAnchorElement;

    if (number) number.textContent = project.number;
    if (title) title.textContent = project.title;
    if (desc) desc.textContent = project.description;
    if (img) img.src = project.image;
    if (github) github.href = project.github;
    if (live) live.href = project.live;

    if (tagsEl) {
      tagsEl.innerHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    }
  }
}