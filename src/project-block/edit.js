import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Button, TextareaControl } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
  const {
    companyName,
    companyDescription,
    client,
    country,
    industry,
    language,
    technology,
    siteUrl,
    galleryItems = [],
    blockId,
    nextLabel
  } = attributes;

  // Company info handlers
  const updateCompanyField = (field, value) => setAttributes({ [field]: value });

  // Gallery item handlers
  const updateGalleryItem = (index, field, value) => {
    const newItems = [...galleryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setAttributes({ galleryItems: newItems });
  };
  const addGalleryItem = () => {
    setAttributes({
      galleryItems: [
        ...galleryItems,
        { title: '', copy: '', img: '' },
      ],
    });
  };
  const removeGalleryItem = (index) => {
    setAttributes({
      galleryItems: galleryItems.filter((_, i) => i !== index),
    });
  };

  const blockProps = useBlockProps({ className: 'cgwego-html' });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Company Info', 'adaire-blocks')} initialOpen={true}>
          <TextControl
            label={__('Project/Company Name', 'adaire-blocks')}
            value={companyName}
            onChange={(v) => updateCompanyField('companyName', v)}
          />
          <TextareaControl
            label={__('Company Description', 'adaire-blocks')}
            value={companyDescription}
            onChange={(v) => updateCompanyField('companyDescription', v)}
          />
          <TextControl
            label={__('Client', 'adaire-blocks')}
            value={client}
            onChange={(v) => updateCompanyField('client', v)}
          />
          <TextControl
            label={__('Country', 'adaire-blocks')}
            value={country}
            onChange={(v) => updateCompanyField('country', v)}
          />
          <TextControl
            label={__('Industry', 'adaire-blocks')}
            value={industry}
            onChange={(v) => updateCompanyField('industry', v)}
          />
          <TextControl
            label={__('Language', 'adaire-blocks')}
            value={language}
            onChange={(v) => updateCompanyField('language', v)}
          />
          <TextControl
            label={__('Technology', 'adaire-blocks')}
            value={technology}
            onChange={(v) => updateCompanyField('technology', v)}
          />
          <TextControl
            label={__('Site URL', 'adaire-blocks')}
            value={siteUrl}
            onChange={(v) => updateCompanyField('siteUrl', v)}
            help={__('Enter the full URL (e.g., https://example.com)', 'adaire-blocks')}
          />
        </PanelBody>
        <PanelBody title={__('Gallery Items', 'adaire-blocks')} initialOpen={true}>
          {galleryItems.map((item, i) => (
            <div key={i} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 16, borderRadius: 4 }}>
              <TextControl
                label={__('Title', 'adaire-blocks')}
                value={item.title}
                onChange={(v) => updateGalleryItem(i, 'title', v)}
              />
              <TextareaControl
                label={__('Copy', 'adaire-blocks')}
                value={item.copy}
                onChange={(v) => updateGalleryItem(i, 'copy', v)}
                help={__('Whitespace and line breaks will be preserved in the final view', 'adaire-blocks')}
              />
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => updateGalleryItem(i, 'img', media.url)}
                  allowedTypes={['image']}
                  value={item.img}
                  render={({ open }) => (
                    <div style={{ marginBottom: 8 }}>
                      <Button onClick={open} isSecondary>
                        {item.img ? __('Change Image', 'adaire-blocks') : __('Select Image', 'adaire-blocks')}
                      </Button>
                      {item.img && (
                        <img src={item.img} alt="" style={{ display: 'block', marginTop: 8, maxWidth: 120, borderRadius: 8 }} />
                      )}
                    </div>
                  )}
                />
              </MediaUploadCheck>
              <Button isDestructive isSmall onClick={() => removeGalleryItem(i)} style={{ marginTop: 8 }}>
                {__('Remove Item', 'adaire-blocks')}
              </Button>
            </div>
          ))}
          <Button isPrimary onClick={addGalleryItem}>{__('Add Gallery Item', 'adaire-blocks')}</Button>
        </PanelBody>

        <PanelBody title="Next Button" initialOpen={true}>
          <TextControl
           label="Next Button Label"
           value={nextLabel}
           onChange={(value) => setAttributes({ nextLabel: value })}
           help="Change the label for the button that goes to the next gallery item"
          />
        </PanelBody>

        <PanelBody title="Block Settings" initialOpen={false}>
          <TextControl
            label="Block ID"
            value={blockId}
            onChange={(value) => setAttributes({ blockId: value })}
            help="Add a custom ID to this block for CSS targeting or anchor links."
          />
        </PanelBody>
      </InspectorControls>

      {/* Main Editor Preview */}
      <div {...blockProps}>
        <div className="container">
          {/* Blurry background */}
          <div className="blurry-prev">
            <img
              src={galleryItems[0]?.img || ''}
              alt=""
              className="cgwego-img"
              style={{ filter: 'blur(40px)', width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', zIndex: 0 }}
            />
            <div className="overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backdropFilter: 'blur(80px)', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1 }}></div>
          </div>

          {/* Left column: company info and gallery grid */}
          <div className="col site-info" style={{ zIndex: 2 }}>
            <div className="cgwego-header">
              <h1 className="project-name">{companyName}</h1>
              <p className="cgwego-p">{companyDescription}</p>
              <br />
              <div className="client-info">
                <div className="info-row"><span className="label">Client</span><span className="value">{client}</span></div>
                <div className="info-row"><span className="label">Country</span><span className="value">{country}</span></div>
                <div className="info-row"><span className="label">Industry</span><span className="value">{industry}</span></div>
                <div className="info-row"><span className="label">Language</span><span className="value">{language}</span></div>
                <div className="info-row"><span className="label">Technology</span><span className="value">{technology}</span></div>
              </div>
            </div>
            <div className="gallery-grid">
              <div className="gallery">
                {galleryItems.map((item, i) => (
                  <div className="item" key={i} style={{ border: i === 0 ? '2px solid #fff' : undefined }}>
                    {item.img ? (
                      <img src={item.img} alt={item.title} className="cgwego-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: project preview */}
          <div className="col project-preview" style={{ zIndex: 2 }}>
            {galleryItems[0] && (
              <>
                <div className="project-details">
                  <div className="title"><h1 className="cgwego-h1">{galleryItems[0].title}</h1></div>
                  <div className="info">
                    {galleryItems[0].copy && galleryItems[0].copy.includes('\n') ? (
                      galleryItems[0].copy.split('\n').map((line, index) => (
                        <p key={index} className="cgwego-p">{line}</p>
                      ))
                    ) : (
                      <p className="cgwego-p">{galleryItems[0].copy}</p>
                    )}
                  </div>
                </div>
                <div className="project-img">
                  {galleryItems[0].img ? (
                    <img src={galleryItems[0].img} alt={galleryItems[0].title} className="cgwego-img" style={{ borderRadius: 20, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>No Image</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


