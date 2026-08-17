// Social Share Block Frontend JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const shareBlocks = document.querySelectorAll('.adaire-social-share');

    if (shareBlocks.length === 0) return;

    shareBlocks.forEach((block) => {
        const button = block.querySelector('.adaire-social-share__button');
        const tooltip = block.querySelector('.adaire-social-share__tooltip');
        const platformLinks = block.querySelectorAll('.adaire-social-share__platform');

        if (!button || !tooltip) return;

        let isTooltipOpen = false;

        // Get current page URL and title
        const getPageUrl = () => {
            return encodeURIComponent(window.location.href);
        };

        const getPageTitle = () => {
            const metaTitle = document.querySelector('meta[property="og:title"]');
            if (metaTitle) {
                return encodeURIComponent(metaTitle.getAttribute('content'));
            }
            return encodeURIComponent(document.title);
        };

        // Pinterest's pin-creation intent needs a source image or it opens to
        // an empty/broken pin — og:image is the best available page image
        // without pulling in the first <img> on the page (which may not be
        // representative, e.g. a logo).
        const getPageImage = () => {
            const metaImage = document.querySelector('meta[property="og:image"]');
            return metaImage ? encodeURIComponent(metaImage.getAttribute('content')) : '';
        };

        // Share URL generators
        const shareUrls = {
            facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            x: (url, title) => `https://x.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            whatsapp: (url, title) => `https://wa.me/?text=${title}%20${url}`,
            telegram: (url, title) => `https://t.me/share/url?url=${url}&text=${title}`,
            reddit: (url, title) => `https://www.reddit.com/submit?url=${url}&title=${title}`,
            pinterest: (url, title, image) =>
                `https://pinterest.com/pin/create/button/?url=${url}&description=${title}${
                    image ? `&media=${image}` : ''
                }`,
            email: (url, title) => `mailto:?subject=${title}&body=${url}`,
        };

        // Toggle tooltip
        const toggleTooltip = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }

            isTooltipOpen = !isTooltipOpen;
            tooltip.classList.toggle('is-visible', isTooltipOpen);
            button.setAttribute('aria-expanded', isTooltipOpen);

            // Close tooltip when clicking outside
            if (isTooltipOpen) {
                const closeTooltip = (event) => {
                    if (!block.contains(event.target)) {
                        isTooltipOpen = false;
                        tooltip.classList.remove('is-visible');
                        button.setAttribute('aria-expanded', 'false');
                        document.removeEventListener('click', closeTooltip);
                    }
                };
                // Use setTimeout to avoid immediate closure
                setTimeout(() => {
                    document.addEventListener('click', closeTooltip);
                }, 100);
            }
        };

        // Handle button click
        button.addEventListener('click', toggleTooltip);

        // Handle platform link clicks
        platformLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const platform = link.getAttribute('data-platform');
                const url = getPageUrl();
                const title = getPageTitle();

                let shareUrl = '';

                switch (platform) {
                    case 'facebook':
                        shareUrl = shareUrls.facebook(url);
                        break;
                    case 'x':
                        shareUrl = shareUrls.x(url, title);
                        break;
                    case 'linkedin':
                        shareUrl = shareUrls.linkedin(url);
                        break;
                    case 'whatsapp':
                        shareUrl = shareUrls.whatsapp(url, title);
                        break;
                    case 'telegram':
                        shareUrl = shareUrls.telegram(url, title);
                        break;
                    case 'reddit':
                        shareUrl = shareUrls.reddit(url, title);
                        break;
                    case 'pinterest':
                        shareUrl = shareUrls.pinterest(url, title, getPageImage());
                        break;
                    case 'email':
                        shareUrl = shareUrls.email(url, title);
                        break;
                    default:
                        return;
                }

                if (shareUrl) {
                    // Open share URL in new window (except email which opens mail client)
                    if (platform === 'email') {
                        window.location.href = shareUrl;
                    } else {
                        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
                    }

                    // Close tooltip after sharing
                    isTooltipOpen = false;
                    tooltip.classList.remove('is-visible');
                    button.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close tooltip on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isTooltipOpen) {
                isTooltipOpen = false;
                tooltip.classList.remove('is-visible');
                button.setAttribute('aria-expanded', 'false');
            }
        });
    });
});




