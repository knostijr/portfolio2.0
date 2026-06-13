/**
 * @file ContactForm – Contact form with onBlur validation and Formspree backend.
 *
 * Covers the requirements in the submission checklist (User Story 7):
 *  - Validation only on blur, not while typing
 *  - Error messages do not cause layout shift (CSS reserves space via min-height)
 *  - Submit button is only enabled when everything is valid (including privacy)
 *  - Clear feedback after submit (success or error)
 *  - Validation and feedback texts available in DE and EN
 */

import { t, LANG_CHANGED_EVENT } from './language';

/** Which validation rule applies to a given field */
type FieldType = 'name' | 'email' | 'message';

/** Formspree endpoint that receives the submission and forwards it via email. */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mpqeonpb';

/**
 * Contact form logic.
 *
 * Architecture:
 *  - `blur` event on each input → validate that single field, show error
 *  - `input`/`change` event → only recompute submit button state (no errors)
 *  - `submit` event → final validation, POST to Formspree, show feedback
 *  - Custom `languagechanged` event → re-render visible error texts in the new language
 */
export class ContactForm {
  private form: HTMLFormElement | null;
  private nameInput: HTMLInputElement | null;
  private emailInput: HTMLInputElement | null;
  private messageInput: HTMLTextAreaElement | null;
  private privacyInput: HTMLInputElement | null;
  private submitBtn: HTMLButtonElement | null;
  private feedback: HTMLElement | null;

  /**
   * Finds all relevant DOM elements and initializes the event listeners.
   * Instantiated once after DOMContentLoaded.
   */
  constructor() {
    this.form = document.querySelector('.contact__form');
    this.nameInput = document.querySelector('#name');
    this.emailInput = document.querySelector('#email');
    this.messageInput = document.querySelector('#message');
    this.privacyInput = document.querySelector('#privacy');
    this.submitBtn = document.querySelector('.contact__submit');
    this.feedback = document.querySelector('.contact__feedback');

    this.init();
  }

  /**
   * Registers all event listeners.
   *
   * Important distinction:
   *  - `blur` validates a field (shows error text)
   *  - `input`/`change` only updates the submit button (no error text)
   *
   * the user is not "scolded" while still typing.
   */
  private init(): void {
    if (!this.form) return;

    // onBlur validation (only when the user leaves the field)
    this.nameInput?.addEventListener('blur', () => this.validateField(this.nameInput!, 'name'));
    this.emailInput?.addEventListener('blur', () => this.validateField(this.emailInput!, 'email'));
    this.messageInput?.addEventListener('blur', () => this.validateField(this.messageInput!, 'message'));

    // Live: only update button state, no error messages
    [this.nameInput, this.emailInput, this.messageInput, this.privacyInput].forEach(input => {
      input?.addEventListener('input', () => this.updateSubmitState());
      input?.addEventListener('change', () => this.updateSubmitState());
    });

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // On language change: re-render any visible errors in the new language
    document.addEventListener(LANG_CHANGED_EVENT, () => this.refreshVisibleErrors());

    this.updateSubmitState();
  }

  /**
   * Validates a single field and updates its visual state.
   *
   * Sets the CSS classes `.valid` / `.invalid` on the input (used for the
   * colored border) and writes an error text into the related
   * `.contact__error` element. The translation key is cached in `dataset` so
   * {@link refreshVisibleErrors} can re-render texts on language change.
   *
   * @param field - The input or textarea element to validate
   * @param type - Which validation rule should be applied
   * @returns `true` if the field is valid, `false` otherwise
   */
  private validateField(field: HTMLInputElement | HTMLTextAreaElement, type: FieldType): boolean {
    const value = field.value.trim();
    const errorEl = field.parentElement?.querySelector('.contact__error') as HTMLElement;
    let errorKey = '';

    if (!value) {
      errorKey = 'form.error.required';
    } else if (type === 'email' && !this.isValidEmail(value)) {
      errorKey = 'form.error.email';
    } else if (type === 'name' && value.length < 2) {
      errorKey = 'form.error.name';
    } else if (type === 'message' && value.length < 10) {
      errorKey = 'form.error.message';
    }

    if (errorEl) {
      if (errorKey) {
        // Cache key as data attribute → re-translatable on language change
        errorEl.dataset.errorKey = errorKey;
        errorEl.textContent = t(errorKey);
        errorEl.classList.add('visible');
      } else {
        delete errorEl.dataset.errorKey;
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }
    }
    field.classList.toggle('invalid', !!errorKey);
    field.classList.toggle('valid', !errorKey && !!value);

    return !errorKey;
  }

  /**
   * Re-renders all currently visible error texts in the new language.
   *
   * Triggered by the `languagechanged` custom event. Works because
   * {@link validateField} stored the translation key in `dataset.errorKey`.
   */
  private refreshVisibleErrors(): void {
    this.form?.querySelectorAll<HTMLElement>('.contact__error.visible').forEach(el => {
      const key = el.dataset.errorKey;
      if (key) el.textContent = t(key);
    });
  }

  /**
   * Checks if a string looks like a plausibly formatted email address.
   *
   * Intentionally a simple regex (not full RFC 5322). Stricter validation in
   * the browser is unnecessary because the `type="email"` attribute already
   * catches the worst typos, and Formspree performs its own server-side
   * validation before forwarding the submission.
   *
   * @param email - The email address to check
   * @returns `true` if the address has the form `local@domain.tld`
   */
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Checks if the entire form is valid (all four fields meet their minimum
   * criteria). Called before every submit button refresh and before the
   * actual send.
   *
   * @returns `true` if name ≥ 2, email valid, message ≥ 10, privacy checked
   */
  private isFormValid(): boolean {
    const nameOk = (this.nameInput?.value.trim().length ?? 0) >= 2;
    const emailOk = this.isValidEmail(this.emailInput?.value.trim() ?? '');
    const messageOk = (this.messageInput?.value.trim().length ?? 0) >= 10;
    const privacyOk = this.privacyInput?.checked ?? false;
    return nameOk && emailOk && messageOk && privacyOk;
  }

  /**
   * Updates the `disabled` state of the submit button.
   * Called live on every keystroke.
   */
  private updateSubmitState(): void {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = !this.isFormValid();
  }

  /**
   * Handles the form submit:
   *  1. preventDefault (no page reload)
   *  2. re-validate all fields (defensive)
   *  3. POST to Formspree (cloud form backend)
   *  4. show feedback (success or error)
   *  5. reset form on success
   *
   * @param e - The submit event
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    if (!this.isFormValid() || !this.form) return;

    // Defensive: validate all fields once more before sending
    if (this.nameInput) this.validateField(this.nameInput, 'name');
    if (this.emailInput) this.validateField(this.emailInput, 'email');
    if (this.messageInput) this.validateField(this.messageInput, 'message');

    if (!this.isFormValid()) return;

    // Disable button while sending — prevents double submit
    if (this.submitBtn) this.submitBtn.disabled = true;

    try {
      const formData = new FormData(this.form);

      // POST to Formspree (handles email delivery for static hosting).
      // The Accept header makes Formspree respond with JSON instead of
      // an HTML redirect, which is required for fetch-based submissions.
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.showFeedback(t('form.feedback.success'), 'success');
      this.form.reset();
      this.nameInput?.classList.remove('valid', 'invalid');
      this.emailInput?.classList.remove('valid', 'invalid');
      this.messageInput?.classList.remove('valid', 'invalid');
      this.form.querySelectorAll<HTMLElement>('.contact__error').forEach(el => {
        el.textContent = '';
        el.classList.remove('visible');
        delete el.dataset.errorKey;
      });
    } catch (err) {
      this.showFeedback(t('form.feedback.error'), 'error');
    } finally {
      this.updateSubmitState();
    }
  }

  /**
   * Shows a success or error message below the form.
   *
   * The message disappears automatically after 5 seconds (CSS transition).
   *
   * @param message - Text to display (already translated)
   * @param type - Visual style: green success banner or red error banner
   */
  private showFeedback(message: string, type: 'success' | 'error'): void {
    if (!this.feedback) return;
    this.feedback.textContent = message;
    this.feedback.className = `contact__feedback contact__feedback--${type} visible`;

    setTimeout(() => {
      this.feedback?.classList.remove('visible');
    }, 5000);
  }
}