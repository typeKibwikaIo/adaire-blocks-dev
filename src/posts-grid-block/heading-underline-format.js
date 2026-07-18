import { __ } from '@wordpress/i18n';
import { registerFormatType, toggleFormat } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';

const FORMAT_NAME = 'adaire/posts-grid-heading-underline';

// Guard against double-registration in HMR / editor reloads
if (!globalThis.__ADAIRE_FORMATS__) {
	globalThis.__ADAIRE_FORMATS__ = {};
}

if (!globalThis.__ADAIRE_FORMATS__[FORMAT_NAME]) {
	registerFormatType(FORMAT_NAME, {
		title: __('Underline/Highlight', 'adaire-blocks'),
		tagName: 'span',
		className: 'adaire-text-underline',
		edit({ isActive, value, onChange }) {
			return (
				<RichTextToolbarButton
					icon="editor-underline"
					title={__('Underline/Highlight', 'adaire-blocks')}
					isActive={isActive}
					onClick={() => {
						onChange(toggleFormat(value, { type: FORMAT_NAME }));
					}}
				/>
			);
		},
	});

	globalThis.__ADAIRE_FORMATS__[FORMAT_NAME] = true;
}





