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
import { useRef, useEffect, useCallback } from '@wordpress/element';
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

            // Ignore clicks inside the Popover portal content
            if ( e.target.closest && e.target.closest( '.adaire-qpop, .components-popover__content' ) ) return;

            // Wait one tick so the WP media modal can render before we check
            setTimeout( () => {
                if ( isMediaLibraryOpen() ) return; // media library just opened — stay open
                setActiveZone( null );
            }, 0 );
        };

        document.addEventListener( 'keydown', handleKeyDown );
        document.addEventListener( 'mousedown', handleMouseDown, true ); // capture phase

        return () => {
            document.removeEventListener( 'keydown', handleKeyDown );
            document.removeEventListener( 'mousedown', handleMouseDown, true );
        };
    }, [ isOpen, setActiveZone ] );

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
                    className="adaire-qpop"
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