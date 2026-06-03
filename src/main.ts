import './styles/main.scss';
import { Navigation } from './ts/navigation';
import { Ticker } from './ts/ticker';
import { Testimonials } from './ts/testimonials';
import { ContactForm } from './ts/contact';
import { ScrollReveal } from './ts/scroll-reveal';

document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  new Ticker();
  new Testimonials();
  new ContactForm();
  new ScrollReveal();
});