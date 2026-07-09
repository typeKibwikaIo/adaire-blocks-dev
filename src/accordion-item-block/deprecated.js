/**
 * Accordion Item (accordion-item-block) deprecations — most recent first.
 *
 * v1  Frozen copy of the save() that shipped before ADAB-010 added per-item
 *     typography override controls (font size, font weight, line height,
 *     letter spacing, text transform, font family) for the item's title —
 *     unconditionally, for every instance, regardless of whether the user
 *     ever opens the new "Title Typography" panel. Posts saved before that
 *     change don't have a `style` attribute on this block's saved markup at
 *     all, so re-running the *current* save() against them would produce a
 *     style attribute that doesn't match what's stored, and Gutenberg would
 *     flag them as invalid content. No attribute schema changed shape (the
 *     new attributes are purely additive with safe defaults that reproduce
 *     the original hardcoded/parent-driven values), so `migrate` is a no-op
 *     identity function and this entry doesn't need its own `attributes` key
 *     (Gutenberg falls back to the current block.json attributes when
 *     parsing a deprecated entry that omits one).
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

const deprecatedV1 = {
    migrate(attributes) {
        return attributes;
    },

    save({ attributes }) {
        const { title, itemId, itemIndex, open } = attributes;

        const blockProps = useBlockProps.save({
            className: `adaire-accordion__item${open ? ' is-open' : ''}`,
            'data-item-id': itemId,
            'data-item-index': itemIndex,
        });

        return (
            <div {...blockProps}>
                <button
                    type="button"
                    className="adaire-accordion__header"
                    aria-expanded={open ? 'true' : 'false'}
                >
                    <span className="adaire-accordion__title">{title}</span>
                    <span className="adaire-accordion__chevron" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </button>
                <div className="adaire-accordion__panel">
                    <div className="adaire-accordion__content">
                        <InnerBlocks.Content />
                    </div>
                </div>
            </div>
        );
    },
};

export default [deprecatedV1];
