import './styles/main.scss';
import { Navigation } from './ts/navigation';
import { Ticker } from './ts/ticker';

document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
  new Ticker();
});