import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes: a } ) {
  const ctaLayout     = a.ctaLayout || 'buttons';
  const layout        = a.layout || 'centered';
  const mediaStyle    = a.mediaStyle || 'none';
  const bgPattern     = a.backgroundPattern || 'none';
  const highlightType = a.highlightType || 'color';
  const hasMedia      = mediaStyle !== 'none' && !! a.heroImageUrl;

  let bgStyle = {};
  if ( a.backgroundType === 'gradient' ) {
    bgStyle.background = a.backgroundGradient || a.gradient || '#111827';
  } else if ( a.backgroundType === 'image' && a.backgroundImage ) {
    bgStyle.backgroundImage    = `url(${ a.backgroundImage })`;
    bgStyle.backgroundSize     = 'cover';
    bgStyle.backgroundPosition = 'center';
  } else {
    bgStyle.backgroundColor = a.backgroundColor || '#111827';
  }

  const blockProps = useBlockProps.save( {
    className: [
      'adaire-saas-hero',
      `is-layout-${ layout }`,
      `is-pattern-${ bgPattern }`,
      `is-highlight-${ highlightType }`,
    ].join( ' ' ),
    style: {
      '--hero-accent'    : a.accentColor    || '#d52940',
      '--hero-highlight' : a.highlightColor || '#a855f7',
      '--hero-text'      : a.textColor      || '#ffffff',
      '--hero-mesh'      : a.meshColor      || '#7c3aed',
      '--hero-radius'    : `${ a.borderRadius || 0 }px`,
      '--hero-padding-v' : `${ a.paddingTop ?? 80 }px`,
      '--hero-padding-b' : `${ a.paddingBottom ?? 80 }px`,
      minHeight          : a.sectionMinHeight || 'auto',
      ...bgStyle,
    },
  } );

  return (
    <section { ...blockProps }>

      { ( bgPattern === 'dots' || bgPattern === 'grid' ) && <div className="adaire-hero__pattern" aria-hidden="true" /> }
      { bgPattern === 'mesh' && <div className="adaire-hero__mesh" aria-hidden="true" /> }

      <div className="adaire-hero__inner">

        <div className="adaire-hero__content">

          { a.announcementText && (
            <a className="adaire-hero__badge" href={ a.announcementUrl || '#' }>
              <span>{ a.announcementText }</span>
              { a.announcementUrl && <span className="adaire-hero__badge-arrow">›</span> }
            </a>
          ) }

          <RichText.Content
            tagName="h2"
            className="adaire-hero__heading"
            value={ a.heading }
            style={ { fontSize: `${ a.headlineSize || 64 }px`, fontWeight: a.headlineWeight || '800' } }
          />

          <RichText.Content
            tagName="p"
            className="adaire-hero__text"
            value={ a.text }
            style={ { maxWidth: `${ a.subheadlineMaxWidth || 680 }px` } }
          />

          { /* CTA: buttons */ }
          { ctaLayout === 'buttons' && (
            <div className="adaire-hero__actions">
              <a className="adaire-hero__btn is-primary" href={ a.buttonUrl || '#' }>
                <RichText.Content tagName="span" value={ a.buttonText } />
              </a>
              { a.secondaryButtonText && (
                <a className="adaire-hero__btn is-secondary" href={ a.secondaryButtonUrl || '#' }>
                  { a.secondaryButtonText }
                </a>
              ) }
            </div>
          ) }

          { /* CTA: email capture */ }
          { ctaLayout === 'email' && (
            <form className="adaire-hero__email-capture" onSubmit="return false">
              <input
                type="email"
                className="adaire-hero__email-input"
                placeholder={ a.emailPlaceholder || 'Your email address' }
                name="email"
                required
              />
              <button type="submit" className="adaire-hero__btn is-primary">
                <RichText.Content tagName="span" value={ a.buttonText } />
              </button>
            </form>
          ) }

          { /* CTA: code snippet */ }
          { ctaLayout === 'code' && (
            <div className="adaire-hero__actions">
              <div
                className="adaire-hero__code-pill"
                data-code={ a.codeSnippetText || 'npx create-app' }
                role="button"
                tabIndex="0"
                aria-label="Copy command"
              >
                <span className="adaire-hero__code-prompt">~</span>
                <span className="adaire-hero__code-text">{ a.codeSnippetText || 'npx create-app' }</span>
                <span className="adaire-hero__code-copy" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </span>
              </div>
              { a.secondaryButtonText && (
                <a className="adaire-hero__btn is-secondary" href={ a.secondaryButtonUrl || '#' }>
                  { a.secondaryButtonText }
                </a>
              ) }
            </div>
          ) }

          { /* Social proof */ }
          { ( a.socialProofItems || [] ).length > 0 && (
            <ul className="adaire-hero__proof-list">
              { ( a.socialProofItems || [] ).map( ( item, i ) => (
                <li key={ i }>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  { item.text }
                </li>
              ) ) }
            </ul>
          ) }

        </div>

        { hasMedia && (
          <div className="adaire-hero__media">
            { mediaStyle === 'browser' && (
              <div className="adaire-hero__browser">
                <div className="adaire-hero__browser-bar">
                  <span /><span /><span />
                  <div className="adaire-hero__browser-url">{ a.siteUrl || 'yourdomain.com' }</div>
                </div>
                <img src={ a.heroImageUrl } alt="" className="adaire-hero__img" loading="lazy" />
              </div>
            ) }
            { mediaStyle === 'phone' && (
              <div className="adaire-hero__phone">
                <div className="adaire-hero__phone-notch" />
                <img src={ a.heroImageUrl } alt="" className="adaire-hero__img" loading="lazy" />
              </div>
            ) }
            { mediaStyle === 'image' && (
              <img src={ a.heroImageUrl } alt="" className="adaire-hero__img" loading="lazy" />
            ) }
          </div>
        ) }

      </div>

      { /* Code copy script — inline, no external deps */ }
      { ctaLayout === 'code' && (
        <script
          dangerouslySetInnerHTML={ {
            __html: `(function(){var el=document.currentScript.previousElementSibling;el&&el.querySelectorAll('.adaire-hero__code-pill').forEach(function(p){p.addEventListener('click',function(){var t=p.dataset.code;if(navigator.clipboard){navigator.clipboard.writeText(t)}var c=p.querySelector('.adaire-hero__code-copy');if(c){c.textContent='✓';setTimeout(function(){c.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x=\\"9\\" y=\\"9\\" width=\\"13\\" height=\\"13\\" rx=\\"2\\"/><path d=\\"M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\\"/></svg>'},1500)}})})})();`,
          } }
        />
      ) }

    </section>
  );
}
