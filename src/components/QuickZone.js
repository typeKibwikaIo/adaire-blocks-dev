/**
 * QuickZone — Elementor-style inline quick-edit wrapper.
 *
 * Wrap any block canvas section. Clicking the pen pill opens a Popover with
 * contextual controls directly on canvas. It closes again when the mouse
 * leaves the zone (with a short grace period so you can move from the
 * trigger into the popover itself without it slamming shut), when you click
 * outside the zone/popover, or on Escape.
 *
 * Usage:
 *   import QuickZone from '../components/QuickZone';
 *
 *   const [activeZone, setActiveZone] = useState(null);
 *
 *   <QuickZone id="title" label="Title" activeZone={activeZone} setActiveZone={setActiveZone}
 *     content={ <TextControl label="Title" value={title} onChange={...} /> }
 *   >
 *     <h2>{title}</h2>
 *   </QuickZone>
 */
import { useRef, useEffect, useCallback, useState } from '@wordpress/element';
import { Popover } from '@wordpress/components';
import './QuickZone.scss';

// ─── SVG icons ────────────────────────────────────────────────────────────────

export const PenIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

export const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6"  x2="6"  y2="18"/>
        <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
);

// ─── Shared helper: is the WP media library currently open? ──────────────────
// WordPress's wp.media() creates .media-modal in <body> when open.
export function isMediaLibraryOpen() {
    return !! document.querySelector( '.media-modal, .media-modal-backdrop' );
}

// ─── Shared helper: tell every QuickZone "a media frame is opening" ─────────
// wp.media()'s modal can take a little while to actually mount its DOM (its
// Backbone view tree is compiled lazily the first time it's opened on a
// page), and during that gap isMediaLibraryOpen() above still returns false.
// An outside mousedown landing during that gap used to read as "user
// clicked away" and close the zone — tearing out the MediaUpload button
// (and the frame it's bound to) right as the modal was opening, which looks
// like "the media modal closes right after it opens."
//
// Call markMediaOpening() synchronously in the same click handler that
// calls MediaUpload's `open()`, *before* calling `open()`. Every QuickZone's
// outside-click handler then unconditionally ignores mousedowns for the
// next MEDIA_OPENING_GRACE_MS — no DOM-presence guessing needed for that
// window. After it elapses the modal is always long since mounted, so the
// normal isMediaLibraryOpen() polling below protects things from then on.
const MEDIA_OPENING_GRACE_MS = 4000;
let mediaOpeningUntil = 0;
export function markMediaOpening() {
    mediaOpeningUntil = Date.now() + MEDIA_OPENING_GRACE_MS;
}
function isMediaRecentlyOpening() {
    return Date.now() < mediaOpeningUntil;
}

// ─── Main component ───────────────────────────────────────────────────────────

// Grace period (ms) between the mouse leaving the zone/popover and the
// popover actually closing — long enough to move from the trigger pill
// into the popover panel without it closing underneath you.
const HOVER_CLOSE_DELAY = 250;

export default function QuickZone( { id, label, icon, children, content, activeZone, setActiveZone } ) {
    const ref           = useRef( null );
    const triggerRef    = useRef( null );
    const closeTimerRef = useRef( null );
    const isOpen         = !! id && activeZone === id;

    const clearCloseTimer = useCallback( () => {
        if ( closeTimerRef.current ) {
            clearTimeout( closeTimerRef.current );
            closeTimerRef.current = null;
        }
    }, [] );

    // Only close *this* zone if it's still the active one when the timer
    // fires — avoids stale closures stomping on a zone the user has since
    // hovered into.
    const scheduleClose = useCallback( () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout( () => {
            // Never let a mouseleave close the zone out from under an open
            // (or just-opened) WP media frame. Opening wp.media() can shift
            // layout (e.g. the scrollbar disappearing when the modal locks
            // body scroll) or otherwise trigger a mouseleave on this zone
            // with no real "the user moved away" intent behind it — and
            // previously that mouseleave would tear down the MediaUpload
            // (and the frame it's bound to) mid-flight, since the Popover's
            // content (and the MediaUpload inside it) only renders while
            // isOpen is true. That's exactly what "I click Replace/Upload
            // and it crashes" looks like, for ANY block using QuickZone —
            // not just footer. Defer instead of closing while media is
            // open/opening, and keep deferring until it isn't.
            if ( isMediaLibraryOpen() || isMediaRecentlyOpening() ) {
                scheduleClose();
                return;
            }
            setActiveZone( ( current ) => ( current === id ? null : current ) );
        }, HOVER_CLOSE_DELAY );
    }, [ id, setActiveZone, clearCloseTimer ] );

    // Hovering the zone no longer opens it — opening is pen-click only.
    // We still clear any pending close timer on enter so that if the zone
    // is already open and the mouse comes back during the grace period,
    // it isn't yanked shut underneath the user.
    const handleZoneMouseEnter = useCallback( () => {
        clearCloseTimer();
    }, [ clearCloseTimer ] );

    // Clean up any pending timer if the component unmounts mid-close.
    useEffect( () => clearCloseTimer, [ clearCloseTimer ] );

    const toggle = ( e ) => {
        e.stopPropagation();
        clearCloseTimer();
        setActiveZone( isOpen ? null : id );
    };

    const TriggerIcon = icon || PenIcon;

    /**
     * Close management — we own this, not the WP Popover.
     *
     * Reasons:
     *   - WP's Popover.onClose / onFocusOutside fires at mousedown time, BEFORE
     *     the WP media modal has been rendered. So checking the DOM for .media-modal
     *     at that point always returns null and the popover closes too early.
     *
     * Our approach:
     *   1. Set onFocusOutside={() => {}} — completely suppress WP's auto-close.
     *   2. Listen for mousedown at capture phase.  If the click is outside both the
     *      zone wrapper AND the popover portal, schedule a close via setTimeout(0).
     *      The timeout lets the media modal render one tick before we check for it.
     *   3. Listen for Escape to close immediately.
     */
    useEffect( () => {
        if ( ! isOpen ) return;

        const handleKeyDown = ( e ) => {
            if ( e.key === 'Escape' ) setActiveZone( null );
        };

        const handleMouseDown = ( e ) => {
            // Ignore clicks inside our zone wrapper (contains trigger button + children)
            if ( ref.current && ref.current.contains( e.target ) ) return;

            // Ignore clicks inside the Popover portal content, or anywhere inside
            // an already-open media modal/backdrop (covers clicks made while
            // browsing/selecting inside the library itself).
            //
            // This is also where we arm the media-opening grace window (see
            // markMediaOpening() above), for EVERY QuickZone in the codebase,
            // automatically: a mousedown always lands here a moment *before*
            // the click that follows it fires a MediaUpload button's onClick
            // (mousedown precedes click), so arming the grace window on any
            // mousedown inside our own popover body protects every
            // QuickZone + MediaUpload pairing — there are 30+ of them across
            // the plugin — without each one having to remember to call
            // markMediaOpening() itself from its own button handler.
            if ( e.target.closest && e.target.closest(
                '.adaire-qpop, .components-popover__content, .media-modal, .media-modal-backdrop, .media-frame'
            ) ) {
                markMediaOpening();
                return;
            }

            // A MediaUpload button somewhere just called open() (see
            // markMediaOpening() above) — give the modal a generous window
            // to actually mount before trusting any "outside" click enough
            // to close on it.
            if ( isMediaRecentlyOpening() ) return;

            // Wait one tick so the WP media modal can render before we check.
            // On a cold start, wp.media() compiles + renders its Backbone view
            // tree the first time it's opened on the page, which can take
            // longer than a single tick — if we only checked once here, that
            // slow first open looked indistinguishable from "click landed
            // outside" and the zone (and the media button inside it) closed
            // out from under the in-flight modal. So if the modal isn't there
            // yet, we give it one more short window before actually closing.
            setTimeout( () => {
                if ( isMediaLibraryOpen() ) return; // media library just opened — stay open
                setTimeout( () => {
                    if ( isMediaLibraryOpen() ) return; // it finished opening just a bit late
                    setActiveZone( ( current ) => ( current === id ? null : current ) );
                }, 150 );
            }, 0 );
        };

        document.addEventListener( 'keydown', handleKeyDown );
        document.addEventListener( 'mousedown', handleMouseDown, true ); // capture phase

        return () => {
            document.removeEventListener( 'keydown', handleKeyDown );
            document.removeEventListener( 'mousedown', handleMouseDown, true );
        };
    }, [ isOpen, setActiveZone ] );

    // ─── Media-modal visibility tracking ───────────────────────────────────
    // While the WP media library is open, HIDE (don't unmount) the quick-edit
    // panel — including its "×" close button — instead of leaving it sitting
    // there clickable on top of the modal. Clicking that × while the media
    // modal was still open used to call setActiveZone(null), which unmounts
    // the Popover's content (the MediaUpload lives in there too), which
    // destroys the media frame mid-flight and closes the modal out from
    // under the user. Hiding via CSS instead of unmounting keeps MediaUpload
    // mounted and its frame alive, while making the panel visually gone and
    // unclickable for as long as the modal is open. Once the modal itself
    // finishes (an image was picked, or the user cancelled it), the
    // quick-edit panel's job here is done, so we finish closing the zone for
    // real instead of popping the panel back up behind the user.
    const hadMediaRef          = useRef( false );
    const [ isMediaActive, setIsMediaActive ] = useState( false );

    useEffect( () => {
        if ( ! isOpen ) {
            setIsMediaActive( false );
            hadMediaRef.current = false;
            return;
        }

        const sync = () => {
            const active = isMediaLibraryOpen();
            setIsMediaActive( active );
            if ( ! active && hadMediaRef.current ) {
                setActiveZone( ( current ) => ( current === id ? null : current ) );
            }
            hadMediaRef.current = active;
        };

        sync();
        const observer = new MutationObserver( sync );
        observer.observe( document.body, { childList: true, subtree: true } );

        return () => observer.disconnect();
    }, [ isOpen, id, setActiveZone ] );

    return (
        <div
            ref={ ref }
            className={ `adaire-qz${ isOpen ? ' adaire-qz--active' : '' }` }
            onMouseEnter={ handleZoneMouseEnter }
            onMouseLeave={ scheduleClose }
        >
            { children }
            <button
                ref={ triggerRef }
                className="adaire-qz__btn"
                onClick={ toggle }
                aria-label={ label }
            >
                <TriggerIcon />
                <span>{ label }</span>
            </button>
            { isOpen && (
                <Popover
                    className={ `adaire-qpop${ isMediaActive ? ' adaire-qpop--media-active' : '' }` }
                    anchor={ triggerRef.current }
                    placement="left-start"
                    offset={ 8 }
                    shift
                    onFocusOutside={ () => {} }
                >
                    <div
                        className="adaire-qpop__inner"
                        onMouseEnter={ clearCloseTimer }
                        onMouseLeave={ scheduleClose }
                    >
                        <div className="adaire-qpop__head">
                            <div className="adaire-qpop__icon">
                                <TriggerIcon />
                            </div>
                            <span className="adaire-qpop__title">{ label }</span>
                            <button
                                className="adaire-qpop__close"
                                onClick={ () => setActiveZone( null ) }
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="adaire-qpop__body">
                            { content }
                        </div>
                    </div>
                </Popover>
            ) }
        </div>
    );
}
