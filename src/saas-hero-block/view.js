/**
 * Hero Block (Pro) — newsletter CTA.
 *
 * save() writes the email CTA as a plain <div> holding an <input> and a
 * type="button" button, with no form, no action and no handler — so the
 * control looked live and did nothing. That markup is deliberately left
 * untouched here and upgraded at runtime instead: rewriting save() would
 * invalidate every hero already published on every site using this plugin and
 * force a block recovery, which is a bad trade for a feature that only needs
 * behaviour attached.
 *
 * Progressive enhancement: with JS unavailable the button stays inert, which
 * is exactly what it did before.
 */

const SELECTOR = '.adaire-saas-hero__email-form';

document.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( SELECTOR ).forEach( ( form ) => {
		new HeroSubscribeForm( form );
	} );
} );

class HeroSubscribeForm {
	constructor( root ) {
		this.root = root;
		this.input = root.querySelector( 'input[type="email"]' );
		this.button = root.querySelector( 'button' );

		if ( ! this.input || ! this.button ) {
			return;
		}

		this.config = window.adaireBlocksNewsletter || {};

		if ( ! this.config.endpoint ) {
			// No endpoint means the plugin's PHP side isn't loaded; leave the
			// control exactly as it was rather than failing loudly at visitors.
			return;
		}

		this.busy = false;
		this.buttonLabel = this.button.textContent;

		this.addHoneypot();
		this.addStatusRegion();

		this.button.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			this.submit();
		} );

		this.input.addEventListener( 'keydown', ( event ) => {
			if ( 'Enter' === event.key ) {
				event.preventDefault();
				this.submit();
			}
		} );
	}

	/**
	 * Bots fill every field they find; humans never see this one.
	 */
	addHoneypot() {
		const honeypot = document.createElement( 'input' );

		honeypot.type = 'text';
		honeypot.name = 'company';
		honeypot.tabIndex = -1;
		honeypot.autocomplete = 'off';
		honeypot.setAttribute( 'aria-hidden', 'true' );
		honeypot.style.cssText =
			'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';

		this.root.appendChild( honeypot );
		this.honeypot = honeypot;
	}

	addStatusRegion() {
		const status = document.createElement( 'p' );

		status.className = 'adaire-saas-hero__form-status';
		status.setAttribute( 'role', 'status' );
		status.setAttribute( 'aria-live', 'polite' );

		this.root.appendChild( status );
		this.status = status;
	}

	setStatus( message, state ) {
		this.status.textContent = message;
		this.root.dataset.state = state;
	}

	setBusy( busy ) {
		this.busy = busy;
		this.button.disabled = busy;
		this.input.disabled = busy;
		this.button.textContent = busy ? '…' : this.buttonLabel;
	}

	async submit() {
		if ( this.busy ) {
			return;
		}

		const email = this.input.value.trim();

		// Let the browser's own validation speak first — it's localised and
		// the visitor already knows how it behaves.
		if ( ! email || ! this.input.checkValidity() ) {
			this.input.reportValidity();
			this.setStatus( 'Please enter a valid email address.', 'error' );
			return;
		}

		this.setBusy( true );
		this.setStatus( '', 'pending' );

		try {
			const response = await fetch( this.config.endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...( this.config.nonce ? { 'X-WP-Nonce': this.config.nonce } : {} ),
				},
				body: JSON.stringify( {
					email,
					company: this.honeypot.value,
					source: 'saas_hero_block',
					source_url: window.location.href,
				} ),
			} );

			const data = await response.json().catch( () => ( {} ) );

			if ( response.ok && data.success ) {
				this.setStatus( data.message || 'Thanks — you are on the list.', 'success' );
				this.input.value = '';
			} else {
				this.setStatus(
					data.message || 'Sorry, something went wrong. Please try again.',
					'error'
				);
			}
		} catch ( error ) {
			this.setStatus( 'Sorry, something went wrong. Please try again.', 'error' );
		} finally {
			this.setBusy( false );
		}
	}
}
