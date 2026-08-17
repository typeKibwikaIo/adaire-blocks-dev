import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

// Register GSAP plugins
gsap.registerPlugin(Flip);

document.addEventListener('DOMContentLoaded', () => {
    initCaseStudiesBlocks();
});

function initCaseStudiesBlocks() {
    const blocks = document.querySelectorAll('.ad-case-studies-block');

    blocks.forEach(block => {
        const isCarouselMode = block.dataset.enableCarousel === 'true';
        if (isCarouselMode) {
            new CaseStudiesCarousel(block);
        } else {
            new CaseStudiesBlock(block);
        }
    });
}

/* =====================================================================
 * Case study popup — "Made in Webflow" showcase-style lightbox
 * ---------------------------------------------------------------------
 * Cards are real <a href> links to each case study's own page (good for
 * SEO, crawling, and users without JS). On a normal left-click, we
 * intercept that navigation and open a popup instead: a header with the
 * study's title/author/like count and a "Visit Live Site" button, a big
 * preview area that embeds the study's own Website URL in a live iframe
 * (falling back to the block's shared fallback image/the card thumbnail
 * when no URL is set), the study's own description/summary, a tag row
 * built from its Industry + Capabilities, a copyright line, and — since
 * every published study is already loaded client-side for filtering —
 * "More by [author]" and "Similar sites" sections computed for free with
 * no extra requests. Left/right arrow buttons cycle through every study
 * currently loaded on the page. Ctrl/Cmd/Shift/middle-click on a card
 * still navigate normally instead of opening the popup.
 * ===================================================================== */
let activeCaseStudyPopup = null;
let activeCaseStudyPopupState = null; // { allStudies, index, options }

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function escapeAttr(str) {
    return escapeHtml(str);
}

/* -----------------------------------------------------------------------
 * Unique per-study placeholder (no Hero Image set) — a deterministic
 * color + initials, mirroring the PHP helpers in
 * case-studies-render-helpers.php (adaire_case_studies_placeholder_color /
 * _initials) so the server-rendered grid and this client-rendered popup
 * agree on the same color for the same study. Uses the standard CRC-32
 * (IEEE 802.3) algorithm, same as PHP's crc32().
 * ----------------------------------------------------------------------- */
let crc32Table = null;
function crc32(str) {
    if (!crc32Table) {
        crc32Table = new Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            crc32Table[n] = c;
        }
    }
    let crc = 0 ^ -1;
    const bytes = unescape(encodeURIComponent(str || ''));
    for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ crc32Table[(crc ^ bytes.charCodeAt(i)) & 0xff];
    }
    return (crc ^ -1) >>> 0;
}

function placeholderColor(seed) {
    const hue = crc32(String(seed == null ? '' : seed)) % 360;
    return `hsl(${hue}, 45%, 28%)`;
}

function placeholderInitials(title) {
    const words = String(title || '').trim().split(/\s+/).filter(Boolean);
    let initials = '';
    for (const word of words.slice(0, 2)) {
        initials += word.charAt(0).toUpperCase();
    }
    return initials || '•';
}

function placeholderThumbHtml(study, className) {
    const seed = study && (study.id != null ? study.id : study.title);
    const color = escapeAttr(placeholderColor(seed));
    const initials = escapeHtml(placeholderInitials(study && study.title));
    return `<div class="${className} ${className}--placeholder" style="background:${color};"><span class="${className}-initials">${initials}</span></div>`;
}

function popupInfoRow(label, value) {
    if (!value) return '';
    return `<div class="ad-case-studies__popup-info-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function popupTag(label) {
    if (!label) return '';
    return `<span class="ad-case-studies__popup-tag">${escapeHtml(label)}</span>`;
}

/**
 * Finds studies related to `study` within the full list already loaded on
 * the page — "More by [author]" (same authorId) and "Similar sites" (same
 * Industry or an overlapping Capability, falling back to the newest
 * remaining studies so the section is never empty when there's enough data).
 */
function getRelatedStudies(allStudies, study, limit = 3) {
    const usedIds = new Set([study.id]);
    const moreByAuthor = [];
    const similar = [];

    if (study.authorId) {
        for (const s of allStudies) {
            if (moreByAuthor.length >= limit) break;
            if (usedIds.has(s.id)) continue;
            if (s.authorId === study.authorId) {
                moreByAuthor.push(s);
                usedIds.add(s.id);
            }
        }
    }

    const caps = Array.isArray(study.capabilities) ? study.capabilities : [];
    const industries = Array.isArray(study.industries) ? study.industries : [];
    for (const s of allStudies) {
        if (similar.length >= limit) break;
        if (usedIds.has(s.id)) continue;
        const sharesIndustry = industries.length && Array.isArray(s.industries) && s.industries.some((i) => industries.includes(i));
        const sharesCapability = caps.length && Array.isArray(s.capabilities) && s.capabilities.some((c) => caps.includes(c));
        if (sharesIndustry || sharesCapability) {
            similar.push(s);
            usedIds.add(s.id);
        }
    }
    for (const s of allStudies) {
        if (similar.length >= limit) break;
        if (usedIds.has(s.id)) continue;
        similar.push(s);
        usedIds.add(s.id);
    }

    return { moreByAuthor, similar };
}

function popupMiniCard(study) {
    const bg = study.backgroundImage ? escapeAttr(study.backgroundImage) : '';
    const thumb = bg
        ? `<img class="ad-case-studies__popup-mini-thumb" src="${bg}" alt="" loading="lazy" />`
        : placeholderThumbHtml(study, 'ad-case-studies__popup-mini-thumb');
    return `
        <button type="button" class="ad-case-studies__popup-mini-card" data-study-id="${escapeAttr(study.id)}">
            ${thumb}
            <span class="ad-case-studies__popup-mini-title">${escapeHtml(study.title)}</span>
            <span class="ad-case-studies__popup-mini-author">${escapeHtml(study.authorName || '')}</span>
        </button>
    `;
}

function popupRelatedSection(heading, studies, linkLabel, linkHref, sectionId) {
    if (!studies.length) return '';
    const cards = studies.map(popupMiniCard).join('');
    const link = linkHref ? `<a class="ad-case-studies__popup-section-link" href="${escapeAttr(linkHref)}">${escapeHtml(linkLabel || 'See more')} →</a>` : '';
    // Plain grid — the left/right slide preview on the main case study
    // navigation covers browsing between studies, so this stays a simple
    // static grid instead of its own scrollable carousel.
    return `
        <div class="ad-case-studies__popup-section"${sectionId ? ` id="${escapeAttr(sectionId)}"` : ''}>
            <div class="ad-case-studies__popup-section-head">
                <h3>${escapeHtml(heading)}</h3>
                ${link}
            </div>
            <div class="ad-case-studies__popup-mini-grid">${cards}</div>
        </div>
    `;
}

// Preview card used in the prev/next "peek" — a proper square-ish showcase
// of the case study the left/right arrows will jump to, not a small pill.
function popupPeekThumb(study) {
    if (!study) return '';
    const bg = study.backgroundImage ? escapeAttr(study.backgroundImage) : '';
    const thumb = bg
        ? `<img class="ad-case-studies__popup-peek-thumb" src="${bg}" alt="" loading="lazy" />`
        : placeholderThumbHtml(study, 'ad-case-studies__popup-peek-thumb');
    return `
        <span class="ad-case-studies__popup-peek">
            ${thumb}
            <span class="ad-case-studies__popup-peek-title">${escapeHtml(study.title)}</span>
        </span>
    `;
}

// Best-effort hostname for the browser-chrome bar (e.g. "lithosquare.com").
// Falls back to an empty string if the URL can't be parsed.
function popupHostname(url) {
    if (!url) return '';
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch (e) {
        return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
}

function handleCaseStudyPopupKeydown(e) {
    // The fullscreen image lightbox has its own Escape/arrow handling and
    // sits above this popup — let it handle the keypress alone.
    if (activeImageLightbox) return;
    if (e.key === 'Escape') {
        closeCaseStudyPopup();
        return;
    }
    if (!activeCaseStudyPopupState) return;
    if (e.key === 'ArrowLeft') navigateCaseStudyPopup(-1);
    if (e.key === 'ArrowRight') navigateCaseStudyPopup(1);
}

function closeCaseStudyPopup() {
    if (!activeCaseStudyPopup) return;
    document.removeEventListener('keydown', handleCaseStudyPopupKeydown);
    const overlay = activeCaseStudyPopup;
    activeCaseStudyPopup = null;
    activeCaseStudyPopupState = null;
    document.body.classList.remove('ad-case-studies__popup-open');
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 250);
}

// Fullscreen image inspector — lets the user zoom in on the hero showcase
// image without leaving the case study popup. Independent overlay stacked
// above the popup itself; Escape/backdrop-click closes just the lightbox.
let activeImageLightbox = null;

function closeImageLightbox() {
    if (!activeImageLightbox) return;
    const el = activeImageLightbox;
    activeImageLightbox = null;
    document.removeEventListener('keydown', handleImageLightboxKeydown);
    el.classList.remove('is-open');
    setTimeout(() => el.remove(), 200);
}

function handleImageLightboxKeydown(e) {
    if (e.key === 'Escape') closeImageLightbox();
}

function openImageLightbox(src, alt) {
    if (!src) return;
    closeImageLightbox();
    const el = document.createElement('div');
    el.className = 'ad-case-studies__image-lightbox';
    el.innerHTML = `
        <button type="button" class="ad-case-studies__image-lightbox-close" aria-label="Close full screen preview">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <img class="ad-case-studies__image-lightbox-img" src="${escapeAttr(src)}" alt="${escapeAttr(alt || '')}" />
    `;
    document.body.appendChild(el);
    activeImageLightbox = el;
    el.addEventListener('click', (e) => {
        if (e.target === el) closeImageLightbox();
    });
    el.querySelector('.ad-case-studies__image-lightbox-close').addEventListener('click', closeImageLightbox);
    document.addEventListener('keydown', handleImageLightboxKeydown);
    requestAnimationFrame(() => el.classList.add('is-open'));
}

function navigateCaseStudyPopup(delta) {
    if (!activeCaseStudyPopupState) return;
    const { allStudies, index, options } = activeCaseStudyPopupState;
    if (!allStudies.length) return;
    const nextIndex = (index + delta + allStudies.length) % allStudies.length;
    openCaseStudyPopup(allStudies[nextIndex], allStudies, nextIndex, options);
}

function openCaseStudyPopup(study, allStudies, index, options) {
    if (!study) return;
    allStudies = Array.isArray(allStudies) ? allStudies : [study];
    index = typeof index === 'number' ? index : allStudies.findIndex((s) => s.id === study.id);
    options = options || {};

    const wasOpen = !!activeCaseStudyPopup;
    closeCaseStudyPopup();

    // Hero image: the post's Hero Image (Featured Image) is always preferred (matches
    // the single case-study template's "static showcase image, not a live
    // embed" convention). The Website URL (study.linkUrl), when set, is only
    // used for the browser-chrome bar's URL text and the "Open Live Site"
    // button — not to embed the site live. A live iframe is used only as a
    // last resort when no image has been uploaded at all.
    const fallbackImage = study.backgroundImage || options.fallbackImageUrl || '';
    const fallbackImageAlt = study.backgroundImage ? study.title : (options.fallbackImageAlt || '');
    const hasLiveUrl = !!study.linkUrl;
    const currentYear = options.currentYear || new Date().getFullYear();
    const siteName = options.siteName || '';
    const hostname = popupHostname(study.linkUrl) || popupHostname(options.fallbackImageUrl) || (siteName ? siteName.toLowerCase().replace(/\s+/g, '') : '');

    const previewMarkup = fallbackImage
        ? `<img class="ad-case-studies__popup-preview-image" src="${escapeAttr(fallbackImage)}" alt="${escapeAttr(fallbackImageAlt)}" />`
        : (hasLiveUrl
            ? `<iframe class="ad-case-studies__popup-iframe" src="${escapeAttr(study.linkUrl)}" title="${escapeAttr(study.title)}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" referrerpolicy="no-referrer"></iframe>`
            : placeholderThumbHtml(study, 'ad-case-studies__popup-preview-empty'));

    const tags = [
        ...(Array.isArray(study.industries) ? study.industries.map(popupTag) : []),
        ...(Array.isArray(study.capabilities) ? study.capabilities.map(popupTag) : [])
    ].join('');
    const infoRows = [
        popupInfoRow('Client', study.client),
        popupInfoRow('Country', study.country),
        popupInfoRow('Language', study.language),
        popupInfoRow('Technology', study.technology)
    ].join('');

    const { moreByAuthor, similar } = getRelatedStudies(allStudies, study);
    const hasSimilar = similar.length > 0;

    const prevStudy = allStudies.length > 1 ? allStudies[(index - 1 + allStudies.length) % allStudies.length] : null;
    const nextStudy = allStudies.length > 1 ? allStudies[(index + 1) % allStudies.length] : null;
    const canInspectImage = !!fallbackImage;

    const overlay = document.createElement('div');
    overlay.className = 'ad-case-studies__popup';
    overlay.innerHTML = `
        <div class="ad-case-studies__popup-backdrop"></div>
        <div class="ad-case-studies__popup-chrome">
            <button type="button" class="ad-case-studies__popup-expand"${canInspectImage ? '' : ' disabled'} aria-label="View image full screen">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
            <button type="button" class="ad-case-studies__popup-close" aria-label="Close">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        ${allStudies.length > 1 ? `
            <button type="button" class="ad-case-studies__popup-nav ad-case-studies__popup-prev" aria-label="Previous case study">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                ${popupPeekThumb(prevStudy)}
            </button>
            <button type="button" class="ad-case-studies__popup-nav ad-case-studies__popup-next" aria-label="Next case study">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                ${popupPeekThumb(nextStudy)}
            </button>
        ` : ''}
        <div class="ad-case-studies__popup-dialog" role="dialog" aria-modal="true" aria-label="${escapeAttr(study.title)}">
            <div class="ad-case-studies__popup-scroll">
                <header class="ad-case-studies__popup-header">
                    <div class="ad-case-studies__popup-header-main">
                        <span class="ad-case-studies__popup-eyebrow">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            Case Study
                        </span>
                        <h2 class="ad-case-studies__popup-title">${escapeHtml(study.title)}</h2>
                        <div class="ad-case-studies__popup-byline">
                            ${study.authorAvatar ? `<img class="ad-case-studies__popup-avatar" src="${escapeAttr(study.authorAvatar)}" alt="" width="24" height="24" />` : ''}
                            ${study.authorProfileUrl ? `<a class="ad-case-studies__popup-author" href="${escapeAttr(study.authorProfileUrl)}">${escapeHtml(study.authorName || '')}</a>` : `<span class="ad-case-studies__popup-author">${escapeHtml(study.authorName || '')}</span>`}
                        </div>
                    </div>
                    <div class="ad-case-studies__popup-header-actions">
                        <span class="ad-case-studies__popup-likes" aria-label="${escapeAttr(study.likes || 0)} likes">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s-6.7-4.35-9.33-8.2C.6 9.77 1.6 6.2 4.8 5.02c2-.74 4-.1 5.2 1.53A4.65 4.65 0 0115.2 5c3.2 1.18 4.2 4.75 2.13 7.8C18.7 16.65 12 21 12 21z"/></svg>
                            ${study.likes || 0}
                        </span>
                        ${hasSimilar ? `
                            <button type="button" class="ad-case-studies__popup-cta" data-scroll-target="similar">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                Search similar case studies
                            </button>
                        ` : ''}
                    </div>
                </header>

                <div class="ad-case-studies__popup-preview">
                    <div class="ad-case-studies__popup-browser-frame">
                        <div class="ad-case-studies__popup-browser-bar">
                            <span></span><span></span><span></span>
                            ${hostname ? `<span class="ad-case-studies__popup-browser-url">${escapeHtml(hostname)}</span>` : ''}
                        </div>
                        <div class="ad-case-studies__popup-browser-body">${previewMarkup}</div>
                    </div>
                </div>

                <div class="ad-case-studies__popup-body">
                    <div class="ad-case-studies__popup-body-top">
                        <div class="ad-case-studies__popup-body-desc">
                            ${study.summary ? `<p class="ad-case-studies__popup-summary">${escapeHtml(study.summary)}</p>` : (study.description ? `<p class="ad-case-studies__popup-summary">${escapeHtml(study.description)}</p>` : '')}
                            ${tags ? `<div class="ad-case-studies__popup-tags">${tags}</div>` : ''}
                        </div>
                        <div class="ad-case-studies__popup-body-actions">
                            <div class="ad-case-studies__popup-buttons">
                                ${hasLiveUrl ? `<a class="ad-case-studies__popup-btn ad-case-studies__popup-btn--outline" href="${escapeAttr(study.linkUrl)}" target="${study.openInNewTab === false ? '_self' : '_blank'}" rel="noopener">Open live site ↗</a>` : ''}
                                ${study.permalink ? `<a class="ad-case-studies__popup-btn ad-case-studies__popup-btn--primary" href="${escapeAttr(study.permalink)}">View Full Case Study</a>` : ''}
                            </div>
                            <p class="ad-case-studies__popup-copyright">© ${escapeHtml(String(currentYear))} ${escapeHtml(study.client || siteName)}${study.client && siteName ? ' — ' + escapeHtml('Case study by ' + siteName) : ''}</p>
                        </div>
                    </div>

                    ${infoRows ? `<dl class="ad-case-studies__popup-info-grid">${infoRows}</dl>` : ''}

                    ${study.content ? `<div class="ad-case-studies__popup-content">${study.content}</div>` : ''}
                </div>

                ${popupRelatedSection('More by ' + (study.authorName || 'this author'), moreByAuthor, 'See profile', study.authorProfileUrl)}
                ${popupRelatedSection('Similar sites', similar, null, null, 'similar')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('ad-case-studies__popup-open');
    activeCaseStudyPopup = overlay;
    activeCaseStudyPopupState = { allStudies, index, options };

    overlay.querySelector('.ad-case-studies__popup-close').addEventListener('click', closeCaseStudyPopup);
    overlay.querySelector('.ad-case-studies__popup-backdrop').addEventListener('click', closeCaseStudyPopup);
    const prevBtn = overlay.querySelector('.ad-case-studies__popup-prev');
    const nextBtn = overlay.querySelector('.ad-case-studies__popup-next');
    if (prevBtn) prevBtn.addEventListener('click', () => navigateCaseStudyPopup(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateCaseStudyPopup(1));

    const expandBtn = overlay.querySelector('.ad-case-studies__popup-expand');
    if (expandBtn && canInspectImage) {
        expandBtn.addEventListener('click', () => openImageLightbox(fallbackImage, fallbackImageAlt || study.title));
    }

    const scrollBtn = overlay.querySelector('[data-scroll-target="similar"]');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const target = overlay.querySelector('#similar');
            const scrollContainer = overlay.querySelector('.ad-case-studies__popup-scroll');
            if (target && scrollContainer) {
                scrollContainer.scrollTo({ top: target.offsetTop - 16, behavior: 'smooth' });
            }
        });
    }

    overlay.querySelectorAll('.ad-case-studies__popup-mini-card').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.studyId;
            const targetIndex = allStudies.findIndex((s) => String(s.id) === String(targetId));
            if (targetIndex > -1) {
                openCaseStudyPopup(allStudies[targetIndex], allStudies, targetIndex, options);
            }
        });
    });

    document.addEventListener('keydown', handleCaseStudyPopupKeydown);

    // Skip the fade-in transition when navigating prev/next from an already-
    // open popup so the swap feels instant rather than flashing to black.
    if (wasOpen) {
        overlay.classList.add('is-open');
    } else {
        requestAnimationFrame(() => overlay.classList.add('is-open'));
    }
}

/**
 * Shared by both the grid and carousel classes: opens the popup for a
 * plain left-click, but lets Ctrl/Cmd/Shift/middle-click through to the
 * browser's normal "open the real page" behavior.
 */
function shouldOpenPopupInstead(e) {
    return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
}

class CaseStudiesBlock {
    constructor(container) {
        this.container = container;
        this.grid = container.querySelector('.ad-case-studies__grid');
        this.cards = Array.from(container.querySelectorAll('.ad-case-studies__card'));
        this.loadMoreBtn = container.querySelector('.ad-case-studies__load-more-btn');
        this.loadingSpinner = container.querySelector('.ad-case-studies__loading-spinner');
        this.industryFilter = container.querySelector('[data-filter-type="industry"]');
        this.capabilityFilter = container.querySelector('[data-filter-type="capability"]');
        this.pills = Array.from(container.querySelectorAll('.ad-case-studies__pill'));
        this.searchInput = container.querySelector('.ad-case-studies__search-input');
        this.sortSelect = container.querySelector('.ad-case-studies__sort-select');

        // Get configuration from data attributes
        this.caseStudies = JSON.parse(container.dataset.caseStudies || '[]');
        this.initialCount = parseInt(container.dataset.initialCount) || 8;
        this.loadMoreCount = parseInt(container.dataset.loadMoreCount) || 4;
        this.animationDuration = parseFloat(container.dataset.animationDuration) || 0.5;
        this.animationEase = container.dataset.animationEase || 'power2.inOut';
        this.popupOptions = {
            fallbackImageUrl: container.dataset.popupFallbackImage || '',
            fallbackImageAlt: container.dataset.popupFallbackImageAlt || '',
            siteName: container.dataset.siteName || '',
            currentYear: container.dataset.currentYear || new Date().getFullYear()
        };

        // State
        this.visibleCount = this.initialCount;
        this.currentIndustry = '';
        this.currentCapability = '';
        this.currentSearch = '';
        this.currentSort = 'newest';
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.setupInitialState();
        this.bindEvents();
        this.bindCardClicks();
        this.updateLoadMoreVisibility();
        this.initHoverAnimations();

        // Assign unique flip IDs to each card for FLIP tracking
        this.cards.forEach((card, index) => {
            card.dataset.flipId = `card-${index}`;
        });
    }

    bindCardClicks() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!shouldOpenPopupInstead(e)) return;
                e.preventDefault();
                const index = parseInt(card.dataset.index, 10);
                const study = this.caseStudies[index];
                openCaseStudyPopup(study, this.caseStudies, index, this.popupOptions);
            });
        });
    }

    setupInitialState() {
        // Set initial visibility based on initialCount
        this.cards.forEach((card, index) => {
            if (index >= this.initialCount) {
                card.style.display = 'none';
                card.classList.add('ad-case-studies__card--hidden');
            }
        });
    }
    
    bindEvents() {
        // Filter events
        if (this.industryFilter) {
            this.industryFilter.addEventListener('change', (e) => {
                this.currentIndustry = e.target.value;
                this.visibleCount = this.initialCount; // Reset visible count on filter change
                this.filterCards();
            });
        }
        
        if (this.capabilityFilter) {
            this.capabilityFilter.addEventListener('change', (e) => {
                this.currentCapability = e.target.value;
                this.visibleCount = this.initialCount; // Reset visible count on filter change
                this.filterCards();
            });
        }
        
        // Load more event
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }

        // Category pills (Webflow-style "All / Industry" filter row)
        if (this.pills && this.pills.length) {
            this.pills.forEach((pill) => {
                pill.addEventListener('click', () => {
                    this.pills.forEach((p) => p.classList.remove('is-active'));
                    pill.classList.add('is-active');
                    this.currentIndustry = pill.dataset.pillValue || '';
                    this.visibleCount = this.initialCount;
                    this.filterCards();
                });
            });
        }

        // Live search over title + author name
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = (e.target.value || '').trim().toLowerCase();
                this.visibleCount = this.initialCount;
                this.filterCards();
            });
        }

        // Sort control (Newest / Most Liked)
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.applySort(e.target.value);
                this.filterCards();
            });
        }
    }

    applySort(sortValue) {
        this.currentSort = sortValue || 'newest';

        const sorted = [...this.cards].sort((a, b) => {
            if (this.currentSort === 'popular') {
                const likesA = parseInt(a.dataset.likes, 10) || 0;
                const likesB = parseInt(b.dataset.likes, 10) || 0;
                return likesB - likesA;
            }
            const indexA = parseInt(a.dataset.index, 10) || 0;
            const indexB = parseInt(b.dataset.index, 10) || 0;
            return indexA - indexB;
        });

        sorted.forEach((card) => {
            this.grid.appendChild(card);
        });

        this.cards = sorted;
    }
    
    initHoverAnimations() {
        this.cards.forEach(card => {
            const media = card.querySelector('.ad-case-studies__card-thumb');

            card.addEventListener('mouseenter', () => {
                if (this.isAnimating) return;
                gsap.to(card, {
                    y: -3,
                    duration: 0.3,
                    ease: 'power2.out',
                    zIndex: 10
                });

                if (media) {
                    gsap.to(media, {
                        scale: parseFloat(getComputedStyle(this.container).getPropertyValue('--cs-hover-scale')) || 1.04,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (this.isAnimating) return;
                gsap.to(card, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    zIndex: 1
                });

                if (media) {
                    gsap.to(media, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                }
            });
        });
    }
    
    getFilteredCards() {
        // Filter ALL cards regardless of their current visibility state
        return this.cards.filter(card => {
            let industries = [];
            try {
                industries = JSON.parse(card.dataset.industries || '[]');
            } catch (e) {
                industries = [];
            }
            let capabilities = [];
            try {
                capabilities = JSON.parse(card.dataset.capabilities || '[]');
            } catch (e) {
                capabilities = [];
            }

            // Check industry filter - empty string means "All Industries"
            const industryMatch = !this.currentIndustry || this.currentIndustry === '' || industries.includes(this.currentIndustry);
            
            // Check capability filter - empty string means "All Capabilities"
            const capabilityMatch = !this.currentCapability || this.currentCapability === '' || capabilities.includes(this.currentCapability);

            // Check live search - matches against title + author (data-search)
            const searchText = (card.dataset.search || '').toLowerCase();
            const searchMatch = !this.currentSearch || searchText.includes(this.currentSearch);

            return industryMatch && capabilityMatch && searchMatch;
        });
    }
    
    filterCards() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Get ALL cards that match the current filters (including hidden ones beyond load more)
        const filteredCards = this.getFilteredCards();
        
        // Only show up to visibleCount cards
        const cardsToShow = filteredCards.slice(0, this.visibleCount);
        
        // All other cards should be hidden (both non-matching AND beyond visibleCount)
        const cardsToHide = this.cards.filter(card => !cardsToShow.includes(card));
        
        // Get currently visible cards (before change)
        const currentlyVisible = this.cards.filter(card => {
            const isHidden = card.style.display === 'none' || 
                             card.classList.contains('ad-case-studies__card--hidden') ||
                             getComputedStyle(card).display === 'none';
            return !isHidden;
        });
        
        // Categorize cards for animation
        // Leaving: currently visible but should be hidden
        const leavingCards = currentlyVisible.filter(card => !cardsToShow.includes(card));
        // Staying: currently visible and should stay visible
        const stayingCards = currentlyVisible.filter(card => cardsToShow.includes(card));
        // Entering: should be visible but currently hidden (includes cards from beyond load more limit!)
        const enteringCards = cardsToShow.filter(card => !currentlyVisible.includes(card));
        
        // Add animating class
        this.grid.classList.add('is-animating');
        
        // Capture current grid height for smooth height animation
        const startHeight = this.grid.offsetHeight;
        
        // STEP 1: Capture FLIP state of staying cards ONLY (before any DOM changes)
        const state = Flip.getState(stayingCards);
        
        // STEP 2: Fade out leaving cards
        if (leavingCards.length > 0) {
            gsap.to(leavingCards, {
                opacity: 0,
                duration: this.animationDuration * 0.3,
                ease: 'power1.out',
                onComplete: () => {
                    this.applyLayoutChange(state, startHeight, stayingCards, enteringCards, leavingCards, cardsToHide, filteredCards.length);
                }
            });
        } else {
            this.applyLayoutChange(state, startHeight, stayingCards, enteringCards, leavingCards, cardsToHide, filteredCards.length);
        }
    }
    
    applyLayoutChange(state, startHeight, stayingCards, enteringCards, leavingCards, cardsToHide, totalFiltered) {
        // STEP 3: Apply DOM changes (this causes instant layout shift)
        
        // Hide leaving cards
        leavingCards.forEach(card => {
            card.classList.add('ad-case-studies__card--hidden');
            card.style.display = 'none';
            // Only clear GSAP animation properties, NOT background-image or other styling
            gsap.set(card, { clearProps: 'opacity,transform,scale,x,y,zIndex' });
        });
        
        // Hide ALL cards that should be hidden (non-matching + beyond visibleCount)
        cardsToHide.forEach(card => {
            card.classList.add('ad-case-studies__card--hidden');
            card.style.display = 'none';
            gsap.set(card, { clearProps: 'opacity,transform,scale,x,y,zIndex' });
        });
        
        // Show entering cards (including ones from beyond original load more limit!)
        // These cards may have been hidden initially, so we need to fully unhide them
        enteringCards.forEach(card => {
            card.classList.remove('ad-case-studies__card--hidden');
            card.style.display = ''; // Clear inline display
            card.style.removeProperty('display'); // Ensure no inline style blocking
            // Only clear animation transforms, preserve background-image
            gsap.set(card, { opacity: 0, clearProps: 'transform,scale,x,y,zIndex' });
        });
        
        // Get new grid height after layout change
        const endHeight = this.grid.offsetHeight;
        
        // STEP 4: Animate grid height
        if (startHeight !== endHeight) {
            gsap.fromTo(this.grid, 
                { height: startHeight },
                { 
                    height: endHeight, 
                    duration: this.animationDuration,
                    ease: 'power1.inOut',
                    clearProps: 'height'
                }
            );
        }
        
        // STEP 5: Animate staying cards from old positions to new positions using FLIP
        if (stayingCards.length > 0) {
            // Add is-flipping class to disable CSS transitions during GSAP animation
            stayingCards.forEach(card => card.classList.add('is-flipping'));
            
            Flip.from(state, {
                targets: stayingCards,
                duration: this.animationDuration,
                ease: 'power1.inOut',
                // Don't use absolute - let CSS Grid handle layout naturally
                // This prevents position conflicts when animation completes
                onComplete: () => {
                    // FLIP has finished - cards are now in their final positions
                    this.animateEnteringCards(enteringCards, totalFiltered, stayingCards);
                }
            });
        } else {
            this.animateEnteringCards(enteringCards, totalFiltered, []);
        }
    }
    
    animateEnteringCards(enteringCards, totalFiltered, stayingCards) {
        // STEP 6: Fade in entering cards
        if (enteringCards.length > 0) {
            // Add is-flipping class to entering cards too
            enteringCards.forEach(card => card.classList.add('is-flipping'));
            
            gsap.to(enteringCards, {
                opacity: 1,
                duration: this.animationDuration * 0.4,
                ease: 'power1.out',
                stagger: 0.03,
                onComplete: () => {
                    this.finishAnimation(totalFiltered, stayingCards, enteringCards);
                }
            });
        } else {
            this.finishAnimation(totalFiltered, stayingCards, []);
        }
    }
    
    finishAnimation(totalFiltered, stayingCards = [], enteringCards = []) {
        this.isAnimating = false;
        this.grid.classList.remove('is-animating');
        
        // Clean up staying cards - just remove the is-flipping class
        // FLIP handles its own cleanup, so we just re-enable hover transitions
        stayingCards.forEach(card => {
            card.classList.remove('is-flipping');
        });
        
        // Clean up entering cards - ensure they're fully visible and ready for hover
        enteringCards.forEach(card => {
            card.classList.remove('is-flipping');
            gsap.set(card, { opacity: 1, clearProps: 'scale' });
        });
        
        // Clear grid transforms
        gsap.set(this.grid, { clearProps: 'height,minHeight' });
        
        this.updateLoadMoreVisibility(totalFiltered);
    }
    
    loadMore() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Show loading spinner
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = 'flex';
            gsap.fromTo(this.loadingSpinner, 
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.2 }
            );
        }
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.opacity = '0.5';
            this.loadMoreBtn.disabled = true;
        }
        
        // Simulate loading delay for smooth UX
        setTimeout(() => {
            const filteredCards = this.getFilteredCards();
            
            // Increase visible count
            const previousCount = this.visibleCount;
            this.visibleCount = Math.min(this.visibleCount + this.loadMoreCount, filteredCards.length);
            
            // Get new cards to show
            const newCards = filteredCards.slice(previousCount, this.visibleCount);
            
            // Hide loading spinner
            if (this.loadingSpinner) {
                gsap.to(this.loadingSpinner, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.2,
                    onComplete: () => {
                        this.loadingSpinner.style.display = 'none';
                    }
                });
            }
            if (this.loadMoreBtn) {
                this.loadMoreBtn.style.opacity = '1';
                this.loadMoreBtn.disabled = false;
            }
            
            // Capture grid state before adding new cards (for height animation)
            const gridState = Flip.getState(this.grid);
            
            // Show new cards (initially hidden for animation)
            // Add is-flipping class to prevent CSS transitions during animation
            newCards.forEach(card => {
                card.classList.remove('ad-case-studies__card--hidden');
                card.classList.add('is-flipping');
                card.style.display = '';
                gsap.set(card, { opacity: 0, scale: 0.95, y: 10 });
            });
            
            // Animate grid height change
            Flip.from(gridState, {
                duration: this.animationDuration * 0.5,
                ease: 'none',
                onComplete: () => {
                    // Animate new cards in with stagger
                    gsap.to(newCards, {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: this.animationDuration * 0.6,
                        ease: 'none',
                        stagger: 0.04,
                        onComplete: () => {
                            this.isAnimating = false;
                            // Clean up transforms and remove is-flipping class
                            newCards.forEach(card => {
                                card.classList.remove('is-flipping');
                                gsap.set(card, { clearProps: 'transform,scale,y' });
                                gsap.set(card, { opacity: 1 });
                            });
                            gsap.set(this.grid, { clearProps: 'height,minHeight' });
                            this.updateLoadMoreVisibility(filteredCards.length);
                        }
                    });
                }
            });
        }, 400);
    }
    
    updateLoadMoreVisibility(totalFiltered = null) {
        if (!this.loadMoreBtn) return;
        
        const wrapper = this.container.querySelector('.ad-case-studies__load-more-wrapper');
        if (!wrapper) return;
        
        // Get filtered count if not provided
        if (totalFiltered === null) {
            totalFiltered = this.getFilteredCards().length;
        }
        
        if (this.visibleCount >= totalFiltered || totalFiltered === 0) {
            // Hide load more button with animation
            gsap.to(wrapper, {
                opacity: 0,
                y: 5,
                duration: 0.25,
                ease: 'none',
                onComplete: () => {
                    wrapper.style.display = 'none';
                }
            });
        } else {
            // Show load more button
            wrapper.style.display = '';
            gsap.to(wrapper, {
                opacity: 1,
                y: 0,
                duration: 0.25,
                ease: 'none'
            });
        }
    }
    
    // Reset filters and visibility
    reset() {
        this.currentIndustry = '';
        this.currentCapability = '';
        this.visibleCount = this.initialCount;
        
        if (this.industryFilter) this.industryFilter.value = '';
        if (this.capabilityFilter) this.capabilityFilter.value = '';
        
        this.filterCards();
    }
}

// Carousel Mode Class
class CaseStudiesCarousel {
    constructor(container) {
        this.container = container;
        this.carousel = container.querySelector('.ad-case-studies__carousel');
        this.cards = Array.from(container.querySelectorAll('.ad-case-studies__card'));
        this.dragCursor = container.querySelector('.ad-case-studies__drag-cursor');
        this.industryFilter = container.querySelector('[data-filter-type="industry"]');
        this.capabilityFilter = container.querySelector('[data-filter-type="capability"]');
        this.pills = Array.from(container.querySelectorAll('.ad-case-studies__pill'));
        this.searchInput = container.querySelector('.ad-case-studies__search-input');
        this.sortSelect = container.querySelector('.ad-case-studies__sort-select');

        // Get configuration
        this.dragCursorText = container.dataset.dragCursorText || 'Drag';
        this.caseStudies = JSON.parse(container.dataset.caseStudies || '[]');
        this.popupOptions = {
            fallbackImageUrl: container.dataset.popupFallbackImage || '',
            fallbackImageAlt: container.dataset.popupFallbackImageAlt || '',
            siteName: container.dataset.siteName || '',
            currentYear: container.dataset.currentYear || new Date().getFullYear()
        };

        // State
        this.isDragging = false;
        this.isHovering = false;
        this.isOverContent = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        this.startX = 0;
        this.scrollLeft = 0;
        this.dragDistance = 0;
        this.currentIndustry = '';
        this.currentCapability = '';
        this.currentSearch = '';
        this.currentSort = 'newest';
        this.animationFrameId = null;

        this.init();
    }
    
    init() {
        if (!this.carousel) return;

        this.setupCarousel();
        this.setupDragCursor();
        this.initDragScroll();
        this.bindFilterEvents();
        this.bindCardClicks();
    }

    // Cards are plain <a href> links to the case study's own page (see
    // render.php). A drag gesture must not trigger navigation or the
    // popup; a genuine plain left-click opens the popup instead.
    bindCardClicks() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (this.isDragging || this.dragDistance > 3) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                if (!shouldOpenPopupInstead(e)) return;
                e.preventDefault();
                const index = parseInt(card.dataset.index, 10);
                const study = this.caseStudies[index];
                openCaseStudyPopup(study, this.caseStudies, index, this.popupOptions);
            });
        });
    }
    
    setupCarousel() {
        // Show all cards in carousel
        this.cards.forEach(card => {
            card.classList.remove('ad-case-studies__card--hidden');
            card.style.display = '';
        });
    }
    
    setupDragCursor() {
        if (!this.dragCursor || !this.carousel) return;
        
        // Initial state - hidden and scaled down
        gsap.set(this.dragCursor, {
            opacity: 0,
            scale: 0,
            xPercent: -50,
            yPercent: -50,
            pointerEvents: 'none'
        });
        
        // Mouse move handler for cursor tracking - listen on CAROUSEL only
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseEnter = this.handleMouseEnter.bind(this);
        this.boundMouseLeave = this.handleMouseLeave.bind(this);
        
        // Use the carousel element for event listening (not the whole container)
        this.carousel.addEventListener('mousemove', this.boundMouseMove);
        this.carousel.addEventListener('mouseenter', this.boundMouseEnter);
        this.carousel.addEventListener('mouseleave', this.boundMouseLeave);
        
        // Start the cursor animation loop
        this.animateCursor();
    }
    
    isOverTextContent(target) {
        // Check if target or any parent is text content
        if (!target) return false;
        
        // Check for actual text elements (title/description text only)
        const contentSelectors = [
            '.ad-case-studies__card-footer',
            '.ad-case-studies__card-title',
            '.ad-case-studies__card-author',
            '.ad-case-studies__card-likes',
            'h3',
            'p',
            'span',
            'strong',
            'em'
        ];
        
        for (const selector of contentSelectors) {
            if (target.matches && target.matches(selector)) return true;
            if (target.closest && target.closest(selector)) return true;
        }
        
        return false;
    }
    
    handleMouseMove(e) {
        // Get position relative to the main block container (for absolute positioning)
        const rect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if over text content
        const wasOverContent = this.isOverContent;
        this.isOverContent = this.isOverTextContent(e.target);
        
        // Handle cursor visibility based on content hover
        if (this.dragCursor && !this.isDragging) {
            if (this.isOverContent && !wasOverContent) {
                // Just entered content area - hide cursor
                gsap.to(this.dragCursor, {
                    opacity: 0,
                    scale: 0,
                    duration: 0.15,
                    ease: 'power2.in',
                    overwrite: true
                });
            } else if (!this.isOverContent && wasOverContent && this.isHovering) {
                // Just left content area - show cursor
                gsap.to(this.dragCursor, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.25,
                    ease: 'back.out(1.5)',
                    overwrite: true
                });
            }
        }
    }
    
    handleMouseEnter(e) {
        this.isHovering = true;
        const rect = this.container.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Check if entering over content
        this.isOverContent = this.isOverTextContent(e.target);
        
        // Set initial cursor position immediately
        this.cursorX = this.mouseX;
        this.cursorY = this.mouseY;
        
        if (this.dragCursor) {
            // Immediately position cursor at mouse location
            gsap.set(this.dragCursor, {
                x: this.mouseX,
                y: this.mouseY
            });
            
            // Only show cursor if not over content area
            if (!this.isOverContent) {
                // Animate cursor in with pop effect
                gsap.to(this.dragCursor, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.35,
                    ease: 'back.out(2)',
                    overwrite: true
                });
            }
        }
    }
    
    handleMouseLeave() {
        this.isHovering = false;
        this.isOverContent = false;
        
        if (this.dragCursor) {
            // Animate cursor out
            gsap.to(this.dragCursor, {
                opacity: 0,
                scale: 0,
                duration: 0.2,
                ease: 'power2.in',
                overwrite: true
            });
        }
    }
    
    animateCursor() {
        if (!this.dragCursor) return;
        
        // Smooth cursor following with lerp
        const lerp = 0.12;
        
        this.cursorX += (this.mouseX - this.cursorX) * lerp;
        this.cursorY += (this.mouseY - this.cursorY) * lerp;
        
        if (this.isHovering || this.isDragging) {
            gsap.set(this.dragCursor, {
                x: this.cursorX,
                y: this.cursorY
            });
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.animateCursor());
    }
    
    initDragScroll() {
        // Track drag state
        let isPointerDown = false;
        let startX = 0;
        let scrollStart = 0;
        let velocityX = 0;
        let lastPageX = 0;
        let lastTimestamp = 0;
        let rafId = null;
        let targetScrollLeft = 0;
        
        // Smooth scroll animation using GSAP
        const animateScroll = () => {
            const current = this.carousel.scrollLeft;
            const diff = targetScrollLeft - current;
            
            // If close enough, snap to target
            if (Math.abs(diff) < 0.5) {
                this.carousel.scrollLeft = targetScrollLeft;
                rafId = null;
                return;
            }
            
            // Smooth interpolation
            this.carousel.scrollLeft = current + diff * 0.15;
            rafId = requestAnimationFrame(animateScroll);
        };
        
        const stopAnimation = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };
        
        const onPointerDown = (e) => {
            // Only handle left mouse button or touch
            if (e.button && e.button !== 0) return;
            
            // Stop any ongoing GSAP animation immediately
            gsap.killTweensOf(this.carousel);
            stopAnimation();
            
            isPointerDown = true;
            this.isDragging = false;
            this.dragDistance = 0;
            
            const pageX = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
            startX = pageX;
            scrollStart = this.carousel.scrollLeft;
            lastPageX = pageX;
            lastTimestamp = performance.now();
            velocityX = 0;
            
            this.carousel.classList.add('is-grabbing');
        };
        
        const onPointerMove = (e) => {
            if (!isPointerDown) return;
            
            const pageX = e.pageX ?? e.touches?.[0]?.pageX ?? 0;
            const dx = pageX - startX;
            this.dragDistance = Math.abs(dx);
            
            // Prevent default to stop text selection and page scroll
            e.preventDefault();
            
            // Calculate velocity
            const now = performance.now();
            const dt = now - lastTimestamp;
            if (dt > 0) {
                const instantVelocity = (pageX - lastPageX) / dt;
                velocityX = velocityX * 0.6 + instantVelocity * 0.4;
            }
            lastPageX = pageX;
            lastTimestamp = now;
            
            // Direct scroll update - immediate response
            this.carousel.scrollLeft = scrollStart - dx;
            
            // Mark as dragging after small movement (for cursor animation & link protection)
            if (this.dragDistance > 2 && !this.isDragging) {
                this.isDragging = true;
                this.carousel.classList.add('is-dragging');
                
                // Shrink cursor when dragging starts
                if (this.dragCursor) {
                    gsap.to(this.dragCursor, {
                        scale: 0.6,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                }
            }
        };
        
        const onPointerUp = () => {
            if (!isPointerDown) return;
            
            isPointerDown = false;
            this.carousel.classList.remove('is-grabbing');
            
            const wasDragging = this.isDragging;
            const finalVelocity = velocityX;
            
            // Apply momentum if velocity is significant
            if (wasDragging && Math.abs(finalVelocity) > 0.2) {
                // Calculate target based on velocity (momentum)
                const momentumDistance = finalVelocity * 300; // Adjust multiplier for throw distance
                targetScrollLeft = this.carousel.scrollLeft - momentumDistance;
                
                // Clamp to bounds
                const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;
                targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));
                
                // Use GSAP for smooth momentum animation
                gsap.to(this.carousel, {
                    scrollLeft: targetScrollLeft,
                    duration: Math.min(Math.abs(momentumDistance) / 500, 1.2),
                    ease: 'power3.out',
                    overwrite: true
                });
            }
            
            // Delay resetting isDragging to prevent link clicks
            setTimeout(() => {
                this.isDragging = false;
                this.carousel.classList.remove('is-dragging');
                
                // Return cursor to normal size
                if (this.isHovering && this.dragCursor) {
                    gsap.to(this.dragCursor, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'back.out(2)'
                    });
                }
            }, 10);
        };
        
        // Mouse events
        this.carousel.addEventListener('mousedown', onPointerDown);
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        
        // Touch events
        this.carousel.addEventListener('touchstart', onPointerDown, { passive: true });
        this.carousel.addEventListener('touchmove', onPointerMove, { passive: false });
        this.carousel.addEventListener('touchend', onPointerUp);
        this.carousel.addEventListener('touchcancel', onPointerUp);
        
        // Prevent default drag behavior on images
        this.carousel.addEventListener('dragstart', (e) => e.preventDefault());

        // Store cleanup references
        this.dragCleanup = () => {
            this.carousel.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('mouseup', onPointerUp);
            this.carousel.removeEventListener('touchstart', onPointerDown);
            this.carousel.removeEventListener('touchmove', onPointerMove);
            this.carousel.removeEventListener('touchend', onPointerUp);
            this.carousel.removeEventListener('touchcancel', onPointerUp);
            stopAnimation();
        };
    }
    
    bindFilterEvents() {
        if (this.industryFilter) {
            this.industryFilter.addEventListener('change', (e) => {
                this.currentIndustry = e.target.value;
                this.filterCards();
            });
        }
        
        if (this.capabilityFilter) {
            this.capabilityFilter.addEventListener('change', (e) => {
                this.currentCapability = e.target.value;
                this.filterCards();
            });
        }

        if (this.pills && this.pills.length) {
            this.pills.forEach((pill) => {
                pill.addEventListener('click', () => {
                    this.pills.forEach((p) => p.classList.remove('is-active'));
                    pill.classList.add('is-active');
                    this.currentIndustry = pill.dataset.pillValue || '';
                    this.filterCards();
                });
            });
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = (e.target.value || '').trim().toLowerCase();
                this.filterCards();
            });
        }

        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.applySort(e.target.value);
                this.filterCards();
            });
        }
    }

    applySort(sortValue) {
        this.currentSort = sortValue || 'newest';

        const sorted = [...this.cards].sort((a, b) => {
            if (this.currentSort === 'popular') {
                const likesA = parseInt(a.dataset.likes, 10) || 0;
                const likesB = parseInt(b.dataset.likes, 10) || 0;
                return likesB - likesA;
            }
            const indexA = parseInt(a.dataset.index, 10) || 0;
            const indexB = parseInt(b.dataset.index, 10) || 0;
            return indexA - indexB;
        });

        sorted.forEach((card) => {
            this.carousel.appendChild(card);
        });

        this.cards = sorted;
    }

    getFilteredCards() {
        return this.cards.filter(card => {
            let industries = [];
            try {
                industries = JSON.parse(card.dataset.industries || '[]');
            } catch (e) {
                industries = [];
            }
            let capabilities = [];
            try {
                capabilities = JSON.parse(card.dataset.capabilities || '[]');
            } catch (e) {
                capabilities = [];
            }

            const industryMatch = !this.currentIndustry || this.currentIndustry === '' || industries.includes(this.currentIndustry);
            const capabilityMatch = !this.currentCapability || this.currentCapability === '' || capabilities.includes(this.currentCapability);
            const searchText = (card.dataset.search || '').toLowerCase();
            const searchMatch = !this.currentSearch || searchText.includes(this.currentSearch);

            return industryMatch && capabilityMatch && searchMatch;
        });
    }
    
    filterCards() {
        const filteredCards = this.getFilteredCards();
        
        // Animate out non-matching cards
        this.cards.forEach(card => {
            const shouldShow = filteredCards.includes(card);
            
            if (shouldShow) {
                card.style.display = '';
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'power2.in',
                    onComplete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
        
        // Reset scroll position
        gsap.to(this.carousel, {
            scrollLeft: 0,
            duration: 0.4,
            ease: 'power2.out'
        });
    }
    
    // Cleanup method
    destroy() {
        if (this.dragCleanup) {
            this.dragCleanup();
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        if (this.carousel) {
            this.carousel.removeEventListener('mousemove', this.boundMouseMove);
            this.carousel.removeEventListener('mouseenter', this.boundMouseEnter);
            this.carousel.removeEventListener('mouseleave', this.boundMouseLeave);
        }
    }
}

// Expose for potential external use
window.CaseStudiesBlock = CaseStudiesBlock;
window.CaseStudiesCarousel = CaseStudiesCarousel;



