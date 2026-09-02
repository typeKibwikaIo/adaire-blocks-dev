/**
 * Form block — front-end submission.
 *
 * The previous version of this file called preventDefault() and then wrote the
 * success message straight into the page without sending anything anywhere, so
 * every enquiry was silently discarded while the visitor was told it had been
 * received. It also carried a large block of cookie-banner logic (expiry
 * countdowns, accept/dismiss buttons, localStorage hiding) copied from another
 * block, targeting elements this block's save() never renders — all of it
 * dead. Both are gone.
 *
 * Submissions POST to adaire-blocks/v1/form-submit, which stores the entry and
 * emails it to the site owner.
 */

document.addEventListener( 'DOMContentLoaded', () => {
	document
		.querySelectorAll( '.adaire-booking-form form' )
		.forEach( ( form ) => new AdaireForm( form ) );
} );

class AdaireForm {
	constructor( form ) {
		this.form = form;
		this.root = form.closest( '.adaire-booking-form' );
		this.button = form.querySelector( 'button[type="submit"]' );
		this.feedback = form.querySelector( '[role="status"]' );
		this.honeypot = form.querySelector( '.ad-hp' );
		this.config = window.adaireBlocksNewsletter || {};
		this.busy = false;
		this.buttonHTML = this.button ? this.button.innerHTML : '';

		if ( this.feedback ) {
			this.feedback.setAttribute( 'aria-live', 'polite' );
		}

		form.addEventListener( 'submit', ( event ) => {
			event.preventDefault();
			this.submit();
		} );
	}

	say( message, state ) {
		if ( this.feedback ) {
			this.feedback.textContent = message;
		}
		if ( this.root ) {
			this.root.dataset.state = state;
		}
	}

	setBusy( busy ) {
		this.busy = busy;

		if ( this.button ) {
			this.button.disabled = busy;
			this.button.setAttribute( 'aria-busy', busy ? 'true' : 'false' );
		}
	}

	/**
	 * Collect every named control into a flat { label: value } map. Checkboxes
	 * report Yes/No rather than the browser's "on", which is meaningless in a
	 * notification email.
	 */
	collect() {
		const fields = {};

		this.form
			.querySelectorAll( 'input[name], select[name], textarea[name]' )
			.forEach( ( control ) => {
				if ( control.classList.contains( 'ad-hp' ) ) {
					return;
				}

				if ( 'checkbox' === control.type ) {
					fields[ control.name ] = control.checked ? 'Yes' : 'No';
					return;
				}

				if ( 'radio' === control.type && ! control.checked ) {
					return;
				}

				fields[ control.name ] = control.value;
			} );

		return fields;
	}

	async submit() {
		if ( this.busy ) {
			return;
		}

		if ( this.honeypot && this.honeypot.value ) {
			return;
		}

		// Let the browser report missing required fields in its own words.
		if ( ! this.form.checkValidity() ) {
			this.form.reportValidity();
			return;
		}

		if ( ! this.config.formEndpoint ) {
			this.say(
				'This form is not connected yet. Please contact us directly.',
				'error'
			);
			return;
		}

		this.setBusy( true );
		this.say( '', 'pending' );

		try {
			const response = await fetch( this.config.formEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...( this.config.nonce ? { 'X-WP-Nonce': this.config.nonce } : {} ),
				},
				body: JSON.stringify( {
					fields: this.collect(),
					source_url: window.location.href,
					// A consent checkbox named "subscribe" opts the address
					// into the newsletter list as well as sending the enquiry.
					subscribe: this.wantsSubscription(),
				} ),
			} );

			const data = await response.json().catch( () => ( {} ) );

			if ( response.ok && data.success ) {
				this.say(
					( this.root && this.root.dataset.success ) ||
						'Thanks, your submission was received.',
					'success'
				);
				this.form.reset();

				const redirect = this.root && this.root.dataset.redirect;
				if ( redirect ) {
					window.location.href = redirect;
				}
			} else {
				this.say(
					data.message || 'Sorry, we could not send that. Please try again.',
					'error'
				);
			}
		} catch ( error ) {
			this.say( 'Sorry, we could not send that. Please try again.', 'error' );
		} finally {
			this.setBusy( false );
		}
	}

	wantsSubscription() {
		const box = this.form.querySelector(
			'input[type="checkbox"][name="subscribe"], input[type="checkbox"][name="newsletter"]'
		);

		return !! ( box && box.checked );
	}
}
