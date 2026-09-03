/**
 * Front-end runtime for row-block.
 *
 * Only wires up the shared scroll-entrance animation (see
 * ../components/scroll-animation-runtime.js) — everything else about this
 * block is pure CSS/inline-style, no other frontend behavior needed.
 */
import { initScrollAnimation } from '../components/scroll-animation-runtime';

document.addEventListener( 'DOMContentLoaded', () => {
  initScrollAnimation( '.adaire-row.adaire-scroll-animate' );
} );
