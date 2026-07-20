/**
 * Bento Grid layout preset registry — single source of truth for the preset
 * picker UI and its mini preview icons. The real grid placement lives in
 * style.scss under matching `&[data-layout='<id>']` selectors — keep the
 * `cells` shapes below in sync with that file when adding/editing a preset.
 *
 * Cards fill each preset in array order (cards[0] -> item--1, cards[1] ->
 * item--2, ...). Switching to a preset that needs more cards than currently
 * exist appends new placeholder cards; it never removes existing cards.
 */

export const BENTO_LAYOUTS = [
    {
        id: 'classic',
        label: 'Classic Bento',
        bestFor: 'SaaS features and product overviews',
        cardCount: 5,
        columns: 4,
        rows: 3,
        cells: [
            { col: 1, colSpan: 3, row: 1, rowSpan: 2 },
            { col: 4, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 4, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 3, rowSpan: 1 },
            { col: 2, colSpan: 3, row: 3, rowSpan: 1 },
        ],
    },
    {
        id: 'hero-focused',
        label: 'Hero-Focused',
        bestFor: 'Highlighting one primary feature',
        cardCount: 4,
        columns: 3,
        rows: 2,
        cells: [
            { col: 1, colSpan: 3, row: 1, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 2, rowSpan: 1 },
        ],
    },
    {
        id: 'split-feature',
        label: 'Split Feature',
        bestFor: 'Main product preview with supporting benefits',
        cardCount: 3,
        columns: 2,
        rows: 2,
        cells: [
            { col: 1, colSpan: 1, row: 1, rowSpan: 2 },
            { col: 2, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 2, rowSpan: 1 },
        ],
    },
    {
        id: 'magazine',
        label: 'Magazine',
        bestFor: 'Mixed content, articles and case studies',
        cardCount: 5,
        columns: 3,
        rows: 3,
        cells: [
            { col: 1, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 2, colSpan: 2, row: 1, rowSpan: 2 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 1, colSpan: 2, row: 3, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 3, rowSpan: 1 },
        ],
    },
    {
        id: 'symmetrical',
        label: 'Symmetrical Grid',
        bestFor: 'Simple, balanced feature comparisons',
        cardCount: 4,
        columns: 2,
        rows: 2,
        cells: [
            { col: 1, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 2, rowSpan: 1 },
        ],
    },
    {
        id: 'centre-spotlight',
        label: 'Centre Spotlight',
        bestFor: 'Dashboard, app interface or video',
        cardCount: 5,
        columns: 3,
        rows: 2,
        cells: [
            { col: 2, colSpan: 1, row: 1, rowSpan: 2 },
            { col: 1, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 2, rowSpan: 1 },
        ],
    },
    {
        id: 'staggered',
        label: 'Staggered Bento',
        bestFor: 'Visually dynamic landing pages',
        cardCount: 6,
        columns: 3,
        rows: 3,
        cells: [
            { col: 1, colSpan: 2, row: 1, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 2, colSpan: 2, row: 2, rowSpan: 1 },
            { col: 1, colSpan: 2, row: 3, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 3, rowSpan: 1 },
        ],
    },
    {
        id: 'dashboard',
        label: 'Dashboard Bento',
        bestFor: 'Analytics, reports and admin dashboards',
        cardCount: 5,
        columns: 3,
        rows: 2,
        cells: [
            { col: 1, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 3, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 2, colSpan: 2, row: 2, rowSpan: 1 },
        ],
    },
    {
        id: 'content-media',
        label: 'Content & Media',
        bestFor: 'Portfolios, services and campaign sections',
        cardCount: 3,
        columns: 2,
        rows: 2,
        cells: [
            { col: 1, colSpan: 1, row: 1, rowSpan: 2 },
            { col: 2, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 2, rowSpan: 1 },
        ],
    },
    {
        id: 'mosaic',
        label: 'Mosaic Bento',
        bestFor: 'Image-heavy and creative websites',
        cardCount: 8,
        columns: 4,
        rows: 3,
        cells: [
            { col: 1, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 2, colSpan: 2, row: 1, rowSpan: 1 },
            { col: 4, colSpan: 1, row: 1, rowSpan: 1 },
            { col: 1, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 2, colSpan: 1, row: 2, rowSpan: 1 },
            { col: 3, colSpan: 2, row: 2, rowSpan: 1 },
            { col: 1, colSpan: 2, row: 3, rowSpan: 1 },
            { col: 3, colSpan: 2, row: 3, rowSpan: 1 },
        ],
    },
];

export const DEFAULT_BENTO_LAYOUT = 'symmetrical';

export function getBentoLayout(id) {
    return BENTO_LAYOUTS.find((layout) => layout.id === id) || BENTO_LAYOUTS.find((layout) => layout.id === DEFAULT_BENTO_LAYOUT);
}

export function makeDefaultCard(index) {
    return {
        title: `Card ${index + 1}`,
        description: 'Add a short description for this card.',
        backgroundImageId: 0,
        backgroundImageUrl: '',
        backgroundImageAlt: '',
        overlayType: 'none',
        overlayColor: '#000000',
        overlayOpacity: 0.5,
        overlayGradient: '',
    };
}
