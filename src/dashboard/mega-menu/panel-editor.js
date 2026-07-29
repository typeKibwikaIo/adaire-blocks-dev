import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import domReady from '@wordpress/dom-ready';
import PanelEditorApp from './PanelEditorApp';
import './panel-editor.scss';

domReady( () => {
	const config = window.adaireMegaPanelEditor;
	if ( ! config ) {
		return;
	}

	apiFetch.use( apiFetch.createNonceMiddleware( config.nonce ) );

	const root = document.getElementById( config.rootElementId );
	if ( ! root ) {
		return;
	}

	createRoot( root ).render( <PanelEditorApp config={ config } /> );
} );
