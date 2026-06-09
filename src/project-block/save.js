import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
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


  
  return (
    <div {...useBlockProps.save({
      id: blockId || undefined,
      "data-next-label": `${nextLabel}`
    })} className="cgwego-html">
      <div className="cgwego-container">
        {/* Blurry background */}
        <div className="blurry-prev">
          <img
            src={galleryItems[0]?.img || ''}
            alt=""
            className="cgwego-img"
            style={{minHeight: "200vh"}}
          />
          <div className="overlay"></div>
        </div>

        {/* Left column: company info and gallery grid */}
        <div className="col site-info">
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
            {siteUrl && (
              <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="view-portfolio-btn" style={{marginBottom: "20px"}}>
                <span className="button-text">Visit Site</span>
                <svg className="button-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
          </div>
          
          {/* Gallery instruction text - always visible */}
          <div style={{
            padding: "10px 0",
          }}>
            <p style={{
              fontSize: "15px",
              color: "white",
              margin: "0",
              fontStyle: "italic",
              textAlign: "left"
            }}>
              Click on an image to read more
            </p>
          </div>
          <div className="gallery-grid">
            <div className="gallery">
              {galleryItems.map((item, i) => (
                <div className={"item" + (i === 0 ? " active" : "") } key={i}>
                  {item.img ? (
                    <img src={item.img} alt={item.title} className="cgwego-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                  )}
          </div>
        ))}
            </div>
          </div>
        </div>

        {/* Right column: project preview */}
        <div className="col project-preview">
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
                  <img src={galleryItems[0].img} alt={galleryItems[0].title} className="cgwego-img" />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>No Image</div>
                )}
              </div>
            </>
          )}
        </div>
        {/* Output galleryItems as JSON for frontend JS */}
        <script type="application/json" id="project-block-data-unique">
          {JSON.stringify(galleryItems)}
        </script>
      </div>
    </div>
  );
}


