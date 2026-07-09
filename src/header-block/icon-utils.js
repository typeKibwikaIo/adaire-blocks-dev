export const iconOptions = [
    { label: 'None', value: 'none' },
    { label: 'Arrow Right', value: 'arrow-right' },
    { label: 'User', value: 'user' },
    { label: 'User Plus', value: 'user-plus' },
    { label: 'Login', value: 'login' },
    { label: 'Home', value: 'home' },
    { label: 'Info', value: 'info' },
    { label: 'Grid', value: 'grid' },
    { label: 'Mail', value: 'mail' },
    { label: 'Search', value: 'search' },
];

export default function HeaderIcon({ name }) {
    if (!name || name === 'none') {
        return null;
    }

    const common = { stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
    const paths = {
        'arrow-right': <><path {...common} d="M5 12h14" /><path {...common} d="m12 5 7 7-7 7" /></>,
        user: <><path {...common} d="M20 21a8 8 0 0 0-16 0" /><circle {...common} cx="12" cy="7" r="4" /></>,
        'user-plus': <><path {...common} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle {...common} cx="9" cy="7" r="4" /><path {...common} d="M19 8v6" /><path {...common} d="M22 11h-6" /></>,
        login: <><path {...common} d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path {...common} d="m10 17 5-5-5-5" /><path {...common} d="M15 12H3" /></>,
        home: <><path {...common} d="m3 11 9-8 9 8" /><path {...common} d="M5 10v10h14V10" /></>,
        info: <><circle {...common} cx="12" cy="12" r="10" /><path {...common} d="M12 16v-4" /><path {...common} d="M12 8h.01" /></>,
        grid: <><rect {...common} x="3" y="3" width="7" height="7" /><rect {...common} x="14" y="3" width="7" height="7" /><rect {...common} x="14" y="14" width="7" height="7" /><rect {...common} x="3" y="14" width="7" height="7" /></>,
        mail: <><rect {...common} x="3" y="5" width="18" height="14" rx="2" /><path {...common} d="m3 7 9 6 9-6" /></>,
        search: <><circle {...common} cx="11" cy="11" r="8" /><path {...common} d="m21 21-4.3-4.3" /></>,
    };

    return <svg className="adaire-header-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">{paths[name] || paths['arrow-right']}</svg>;
}

// ─── Social / brand icons ─────────────────────────────────────────────────
// Simplified, generic glyph approximations of common social platforms — not
// exact trademarked logo assets, just recognizable icon shapes used in place
// of the old single-letter placeholder. Mirrored byte-for-byte (same path
// data) in render.php's adaire_header_social_icon_svg() for the frontend.

export const socialPlatformOptions = ['Facebook', 'Instagram', 'X', 'YouTube', 'LinkedIn', 'TikTok'];

const socialIconPaths = {
    facebook: (
        <path fill="currentColor" d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.81 8.44-4.94 8.44-9.94Z" />
    ),
    instagram: (
        <>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
        </>
    ),
    x: (
        <path fill="currentColor" d="M3 3l7.5 8.6L3.4 21h2.4l5.9-6.8L16.9 21H21l-7.9-9.1L20.6 3h-2.4l-5.4 6.2L7.1 3H3Z" />
    ),
    youtube: (
        <>
            <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path fill="currentColor" d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" />
        </>
    ),
    linkedin: (
        <>
            <rect x="2.5" y="2.5" width="19" height="19" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="7.2" cy="7.6" r="1.3" fill="currentColor" />
            <path fill="currentColor" d="M6 10.6h2.4V18H6v-7.4Zm4.3 0h2.3v1.1c.5-.8 1.3-1.3 2.4-1.3 1.8 0 3 1.2 3 3.5V18h-2.4v-3.6c0-1-.4-1.7-1.4-1.7-.8 0-1.3.6-1.5 1.1-.1.2-.1.5-.1.8V18h-2.3v-7.4Z" />
        </>
    ),
    tiktok: (
        <path fill="currentColor" d="M14.5 2h2.4c.2 1.3 1 2.7 2.3 3.5 1 .6 2.1.9 3.3 1v2.5c-1.6 0-3.2-.5-4.5-1.4v6.7c0 3.2-2.6 5.7-5.8 5.7S6.4 17.5 6.4 14.3c0-3 2.2-5.4 5.1-5.7v2.6c-1.4.3-2.5 1.6-2.5 3.1 0 1.7 1.4 3.1 3.2 3.1s3.2-1.4 3.2-3.1V2Z" />
    ),
};

export function SocialIcon({ platform }) {
    const key = ( platform || '' ).toLowerCase();
    const path = socialIconPaths[ key ];

    if ( ! path ) {
        return <span className="adaire-header-social-fallback">{ ( platform || '?' ).charAt( 0 ) }</span>;
    }

    return (
        <svg className="adaire-header-social-icon" width="1em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            { path }
        </svg>
    );
}

// ─── Cart icon (ADAB-016 — WooCommerce cart) ───────────────────────────────
// Stroke-style glyph, drawn the same way as HeaderIcon above. Mirrored
// byte-for-byte in render.php's adaire_header_cart_icon_svg() for the
// frontend. Cart count badge (when present) is a separate <span> appended
// next to this icon by the caller, not part of the SVG itself.

export function CartIcon() {
    const c = { stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
    return (
        <svg className="adaire-header-icon adaire-header-cart-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle {...c} cx="9" cy="21" r="1" />
            <circle {...c} cx="19" cy="21" r="1" />
            <path {...c} d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21.5 8H5.1" />
        </svg>
    );
}

// ─── Payment method icons (ADAB-016) ───────────────────────────────────────
// Simplified, generic glyph approximations (rounded card with a brand-ish
// wordmark/shape) — not exact trademarked logo assets, same approach as the
// social icons above. Mirrored byte-for-byte in render.php's
// adaire_header_payment_icon_svg() for the frontend.

export const paymentMethodOptions = ['Visa', 'Mastercard', 'PayPal', 'American Express', 'Apple Pay', 'Google Pay'];

const paymentIconPaths = {
    visa: (
        <>
            <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="12" y="15.5" textAnchor="middle" fontSize="7" fontWeight="700" fontStyle="italic" fill="currentColor" stroke="none">VISA</text>
        </>
    ),
    mastercard: (
        <>
            <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="9.5" cy="12" r="4.2" fill="currentColor" opacity="0.55" />
            <circle cx="14.5" cy="12" r="4.2" fill="currentColor" opacity="0.85" />
        </>
    ),
    paypal: (
        <>
            <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path fill="currentColor" stroke="none" d="M9.3 8.2h3.1c1.9 0 3.1 1 2.8 2.7-.3 1.9-1.8 2.9-3.7 2.9h-1.1l-.5 2.8H8l1.3-8.4Zm1.5 4.2h.8c.9 0 1.6-.4 1.7-1.3.1-.8-.4-1.1-1.3-1.1h-.7l-.5 2.4Z" />
        </>
    ),
    'american express': (
        <>
            <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="1.5" />
            <text x="12" y="15" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="currentColor" stroke="none">AMEX</text>
        </>
    ),
    'apple pay': (
        <>
            <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="12" y="15" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="currentColor" stroke="none">Pay</text>
        </>
    ),
    'google pay': (
        <>
            <rect x="1.5" y="4.5" width="21" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="12" y="15" textAnchor="middle" fontSize="5" fontWeight="700" fill="currentColor" stroke="none">GPay</text>
        </>
    ),
};

export function PaymentIcon({ method }) {
    const key = ( method || '' ).toLowerCase();
    const path = paymentIconPaths[ key ];

    if ( ! path ) {
        return <span className="adaire-header-payment-fallback">{ ( method || '?' ).charAt( 0 ) }</span>;
    }

    return (
        <svg className="adaire-header-payment-icon" width="1.6em" height="1em" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            { path }
        </svg>
    );
}
