/**
 * @file Language – Translation system for DE/EN.
 *
 * Holds the complete translation dictionary for both languages and handles:
 *  - Live swap of all texts that have `data-i18n` attributes
 *  - Placeholder texts on inputs (`data-i18n-placeholder`)
 *  - Persisting the selected language via `localStorage`
 *  - Updating `<html lang="...">` (important for screen readers / SEO)
 *  - Notifying other modules about a language change (custom event)
 *
 * Also exports the helper {@link t} and the event constant
 * {@link LANG_CHANGED_EVENT} so that other classes (e.g. ContactForm) can
 * dynamically retrieve translated strings.
 */

/** Supported language codes */
type Lang = 'en' | 'de';

/**
 * Complete dictionary for both languages.
 *
 * Keys follow a dotted-notation that matches their structure
 * (e.g. `hero.role`, `contact.label`). When adding new text:
 *  1. Add the key to BOTH language blocks (otherwise one language falls back
 *     to the key name itself, which looks ugly in the UI).
 *  2. In the HTML, set `data-i18n="key.path"`.
 */
const translations: Record<Lang, Record<string, string>> = {
  en: {
    'nav.about': 'About me',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'hero.role': 'Fullstack Developer',
    'hero.cta1': 'Check my work',
    'hero.cta2': 'Contact me',
    'about.label': 'Who I Am',
    'about.heading': 'About me',
    'about.text': "Hey there, I'm Christoph! I'm a passionate fullstack developer based in Hamburg, building modern web applications end-to-end — from clean, performant frontends to robust backend services. My love for coding comes from the ability to turn ideas into real, interactive experiences.",
    'about.list1': 'Based in Hamburg - open to working remotely or potentially relocating',
    'about.list2': 'Enthusiastic about learning new technologies and continuously improving my skills',
    'about.list3': 'Analytical thinker who values creativity, persistence and collaboration',
    'skills.label': 'Technologies',
    'skills.heading': 'Skill Set',
    'skills.text': 'I have experience using different front-end and back-end technologies, always keeping up with the rapid changes in modern web development.',
    'skills.another': 'You need another skill?',
    'skills.contact': 'Feel free to contact me. I look forward to expanding on my previous knowledge.',
    'skills.btn': "Let's Talk",
    'projects.label': 'Portfolio',
    'projects.heading': 'Featured Projects',
    'projects.sub': 'Explore a selection of my work here - interact with projects to see my skills in action.',
    'modal.about': 'What is this project about?',
    'modal.next': 'Next project',
    'testimonials.heading': 'What my colleagues say about me',
    'contact.label': 'Contact me',
    'contact.heading': "Let's work together",
    'contact.problem': 'Got a problem to solve?',
    'contact.sub': "Encourage people to contact you and describe what role you are interested in. Show that you will add value to their projects through your work.",
    'contact.need': 'Need a Fullstack developer?',
    'contact.talk': "Let's talk!",
    'form.name': "What's your name?",
    'form.name.placeholder': 'Your name goes here',
    'form.email': "What's your email?",
    'form.email.placeholder': 'youremail@email.com',
    'form.message': 'How can I help you?',
    'form.message.placeholder': 'Hello Chris, I am interested in...',
    'form.privacy.text': "I've read the privacy policy and agree to the processing of my data as outlined.",
    'form.submit': 'Say Hello',
    // Validation errors (queried by ContactForm via t())
    'form.error.required': 'This field is required.',
    'form.error.email': 'Please enter a valid email address.',
    'form.error.name': 'Please enter at least 2 characters.',
    'form.error.message': 'Please enter at least 10 characters.',
    'form.feedback.success': 'Thanks! Your message has been sent.',
    'form.feedback.error': 'Something went wrong. Please try again later.',
    'footer.role': 'Web Developer · Hamburg, Germany',
    'footer.imprint': 'Imprint',
    'footer.privacy': 'Privacy Policy',
  },
  de: {
    'nav.about': 'Über mich',
    'nav.skills': 'Fähigkeiten',
    'nav.projects': 'Projekte',
    'hero.role': 'Fullstack Entwickler',
    'hero.cta1': 'Meine Arbeit ansehen',
    'hero.cta2': 'Kontaktiere mich',
    'about.label': 'Wer ich bin',
    'about.heading': 'Über mich',
    'about.text': 'Hallo, ich bin Christoph! Ich bin ein leidenschaftlicher Fullstack-Entwickler aus Hamburg und baue moderne Webanwendungen end-to-end - von sauberen, performanten Frontends bis hin zu robusten Backend-Services. Meine Leidenschaft fürs Coden kommt aus der Fähigkeit, Ideen in echte, interaktive Erlebnisse zu verwandeln.',
    'about.list1': 'In Hamburg ansässig - offen für Remote-Arbeit oder einen möglichen Umzug',
    'about.list2': 'Begeistert vom Lernen neuer Technologien und kontinuierlicher Verbesserung',
    'about.list3': 'Analytischer Denker, der Kreativität, Ausdauer und Zusammenarbeit schätzt',
    'skills.label': 'Technologien',
    'skills.heading': 'Fähigkeiten',
    'skills.text': 'Ich habe Erfahrung mit verschiedenen Frontend- und Backend-Technologien und halte mich stets über die schnellen Entwicklungen in der modernen Webentwicklung auf dem Laufenden.',
    'skills.another': 'Brauchst du eine andere Fähigkeit?',
    'skills.contact': 'Kontaktiere mich gerne. Ich freue mich darauf, mein Wissen zu erweitern.',
    'skills.btn': 'Lass uns reden',
    'projects.label': 'Portfolio',
    'projects.heading': 'Ausgewählte Projekte',
    'projects.sub': 'Entdecke hier eine Auswahl meiner Arbeit - interagiere mit den Projekten, um meine Fähigkeiten in Aktion zu sehen.',
    'modal.about': 'Worum geht es in diesem Projekt?',
    'modal.next': 'Nächstes Projekt',
    'testimonials.heading': 'Was Kollegen über mich sagen',
    'contact.label': 'Kontakt',
    'contact.heading': 'Lass uns zusammenarbeiten',
    'contact.problem': 'Du hast ein Problem zu lösen?',
    'contact.sub': 'Schreib mir gerne, welche Rolle du besetzen möchtest und wie ich deinen Projekten einen Mehrwert bringen kann.',
    'contact.need': 'Brauchst du einen Fullstack-Entwickler?',
    'contact.talk': 'Lass uns reden!',
    'form.name': 'Wie heißt du?',
    'form.name.placeholder': 'Dein Name kommt hier hin',
    'form.email': 'Was ist deine E-Mail?',
    'form.email.placeholder': 'deinemail@email.com',
    'form.message': 'Wie kann ich dir helfen?',
    'form.message.placeholder': 'Hallo Chris, ich interessiere mich für...',
    'form.privacy.text': 'Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Daten zu.',
    'form.submit': 'Hallo sagen',
    // Validation errors (queried by ContactForm via t())
    'form.error.required': 'Dieses Feld ist erforderlich.',
    'form.error.email': 'Bitte eine gültige E-Mail-Adresse eingeben.',
    'form.error.name': 'Bitte mindestens 2 Zeichen eingeben.',
    'form.error.message': 'Bitte mindestens 10 Zeichen eingeben.',
    'form.feedback.success': 'Vielen Dank! Deine Nachricht wurde gesendet.',
    'form.feedback.error': 'Etwas ist schiefgelaufen. Bitte später erneut versuchen.',
    'footer.role': 'Web Entwickler · Hamburg, Deutschland',
    'footer.imprint': 'Impressum',
    'footer.privacy': 'Datenschutz',
  },
};

/**
 * Global translation helper for other modules.
 *
 * Reads the currently selected language from `localStorage` and returns the
 * matching translated string. If the key does not exist, the key itself is
 * returned (so missing translations are immediately visible in the UI
 * instead of producing empty cells).
 *
 * @example
 * ```ts
 * import { t } from './language';
 * console.log(t('hero.role'));        // - "Fullstack Developer"
 * console.log(t('does.not.exist'));   // - "does.not.exist"
 * ```
 *
 * @param key - Dot-separated translation key (e.g. `'form.error.email'`)
 * @returns The translated string in the current language, or the key itself
 *          as a fallback when the key was not found
 */
export function t(key: string): string {
  const lang = (localStorage.getItem('lang') as Lang) || 'en';
  return translations[lang]?.[key] ?? key;
}

/**
 * Name of the custom event fired on `document` whenever the user switches
 * languages. Other modules can listen to it with `addEventListener` and
 * react accordingly — e.g. re-render already-visible texts (such as
 * validation errors) in the new language.
 *
 * @example
 * ```ts
 * import { LANG_CHANGED_EVENT, t } from './language';
 *
 * document.addEventListener(LANG_CHANGED_EVENT, () => {
 *   myErrorTextElement.textContent = t('form.error.email');
 * });
 * ```
 */
export const LANG_CHANGED_EVENT = 'languagechanged';

/**
 * Language toggle class.
 *
 * Instantiated once after DOMContentLoaded. On startup it reads the previously
 * selected language from `localStorage` (default: `'en'`) and applies it.
 * When the user clicks one of the language buttons in the header, the new
 * language is persisted, all texts are swapped, and a custom event is fired.
 */
export class Language {
  private currentLang: Lang = 'en';

  private btns: NodeListOf<HTMLButtonElement>;

  constructor() {
    this.btns = document.querySelectorAll('.nav__lang-btn');
    this.currentLang = (localStorage.getItem('lang') as Lang) || 'en';
    this.apply();
    this.init();
  }

  /**
   * Attaches a click listener to each language button.
   *
   * On click: switch language - persist - update DOM - fire custom event
   * so that other modules can react.
   */
  private init(): void {
    this.btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang as Lang;
        if (lang) {
          this.currentLang = lang;
          localStorage.setItem('lang', lang);
          this.apply();
          document.dispatchEvent(new CustomEvent(LANG_CHANGED_EVENT, { detail: { lang } }));
        }
      });
    });
  }

  /**
   * Applies the current language to the entire document:
   *  - sets `<html lang="...">` (accessibility / SEO)
   *  - visually marks the active language button
   *  - swaps all text content with `data-i18n` attributes
   *  - swaps all placeholders with `data-i18n-placeholder` attributes
   */
  private apply(): void {
    const t = translations[this.currentLang];

    document.documentElement.lang = this.currentLang;

    this.btns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key && t[key]) el.textContent = t[key];
    });

    document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (key && t[key]) el.placeholder = t[key];
    });
  }
}