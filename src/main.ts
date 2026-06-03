import './styles/main.scss';
import { Navigation } from './ts/navigation';
import { Ticker } from './ts/ticker';
import { Testimonials } from './ts/testimonials';
import { ContactForm } from './ts/contact';

document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  new Ticker();
  new Testimonials();
  new ContactForm();
});