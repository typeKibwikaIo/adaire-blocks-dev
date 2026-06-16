import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import EditorPanel from './EditorPanel';
import './style.scss';

domReady( () => {
	const stale = document.getElementById( 'adaire-ep-wrapper' );
	if ( stale ) stale.remove();
	const wrapper = document.createElement( 'div' );
	wrapper.id = 'adaire-ep-wrapper';
	document.body.appendChild( wrapper );
	createRoot( wrapper ).render( <EditorPanel /> );
} );
