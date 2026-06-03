import './styles/main.scss';
import { Navigation } from './ts/navigation';
import { Ticker } from './ts/ticker';
import { Testimonials } from './ts/testimonials';

document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  new Ticker();
  new Testimonials();
});