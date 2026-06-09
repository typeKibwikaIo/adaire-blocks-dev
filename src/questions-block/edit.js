import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPicker, SelectControl, TextareaControl, Button, TextControl, RangeControl, ToggleControl } from '@wordpress/components';

const SECTION_OPTIONS = [
  { label: 'Question 1', value: 'what' },
  { label: 'Question 2', value: 'why' },
  { label: 'Question 3', value: 'who' },
];

export default function Edit({ attributes, setAttributes }) {
  const {
    question1Title, question1Content,
    question2Title, question2Content,
    question3Title, question3Content,
    backgroundColor, textColor, titleColor, inactiveTitleColor,
    activeSection = 'what',
    blockId,
    scrollDistance = 250,
    scrollDistanceMobile = 170,
    showProgressIndicator = true,
    progressIndicatorColor = '#ffffff',
    progressIndicatorActiveColor = '#ff0000',
    progressIndicatorFillColor = '#ff0000',
    progressIndicatorWidth = 3,
  } = attributes;

  // Function to convert selected text to list format
  const convertSelectedToList = (content, start, end) => {
    if (!content || start === end) return content;
    
    const beforeSelection = content.substring(0, start);
    const selectedText = content.substring(start, end);
    const afterSelection = content.substring(end);
    
    // Convert selected text to list format
    const lines = selectedText.split('\n').filter(line => line.trim());
    const listText = lines.map(line => `â€¢ ${line.trim()}`).join('\n');
    
    return beforeSelection + listText + afterSelection;
  };

  // Function to handle text selection and conversion
  const handleConvertSelectionToList = (targetSection) => {
    // Find all textareas and check which one has a selection
    const textareas = document.querySelectorAll('textarea');
    let selectedTextarea = null;
    let selectionStart = 0;
    let selectionEnd = 0;
    
    for (const textarea of textareas) {
      if (textarea.selectionStart !== textarea.selectionEnd) {
        selectedTextarea = textarea;
        selectionStart = textarea.selectionStart;
        selectionEnd = textarea.selectionEnd;
        break;
      }
    }
    
    if (!selectedTextarea) {
      alert('Please select some text in any content area first.');
      return;
    }
    
    const currentContent = selectedTextarea.value;
    const newContent = convertSelectedToList(currentContent, selectionStart, selectionEnd);
    
    // Update the appropriate content attribute based on the textarea's placeholder
    const placeholder = selectedTextarea.placeholder || '';
    if (placeholder.includes('Enter What content')) {
      setAttributes({ question1Content: newContent });
    } else if (placeholder.includes('Enter Why content')) {
      setAttributes({ question2Content: newContent });
    } else if (placeholder.includes('Enter Who content')) {
      setAttributes({ question3Content: newContent });
    }
  };

  const blockProps = useBlockProps({
    style: { 
      backgroundColor: backgroundColor || '#25232c',
      "--title-color": titleColor || "#ffffff",
      "--inactive-title-color": inactiveTitleColor || "#666666",
      "--progress-indicator-color": progressIndicatorColor,
      "--progress-indicator-fill-color": progressIndicatorFillColor,
      "--progress-indicator-width": `${progressIndicatorWidth}px`,
      "--scroll-distance": `${scrollDistance}%`,
      "--scroll-distance-mobile": `${scrollDistanceMobile}%`,
    },
    id: blockId || undefined,
    "data-scroll-distance": scrollDistance,
    "data-scroll-distance-mobile": scrollDistanceMobile,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title="Background Color" initialOpen={true}>
          <ColorPicker
            color={backgroundColor}
            onChangeComplete={(color) => setAttributes({ backgroundColor: color.hex })}
            disableAlpha
          />
        </PanelBody>
        <PanelBody title="Text Colors" initialOpen={false}>
          <ColorPicker
            color={textColor}
            onChangeComplete={(color) => setAttributes({ textColor: color.hex })}
            disableAlpha
          />
        </PanelBody>
        <PanelBody title="Title Colors" initialOpen={false}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Active Title Color</label>
            <ColorPicker
              color={titleColor}
              onChangeComplete={(color) => setAttributes({ titleColor: color.hex })}
              disableAlpha
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Inactive Title Color</label>
            <ColorPicker
              color={inactiveTitleColor}
              onChangeComplete={(color) => setAttributes({ inactiveTitleColor: color.hex })}
              disableAlpha
            />
          </div>
        </PanelBody>
        <PanelBody title="Active Section for Editing" initialOpen={true}>
          <SelectControl
            label="Active Section"
            value={activeSection}
            options={SECTION_OPTIONS}
            onChange={(value) => setAttributes({ activeSection: value })}
          />
        </PanelBody>
        
        <PanelBody title="Content Editing" initialOpen={true}>
          <TextareaControl
            label="Question 1 Title"
            value={question1Title}
            onChange={(value) => setAttributes({ question1Title: value })}
            placeholder="What."
          />
          <TextareaControl
            label="Question 1 Content"
            value={question1Content}
            onChange={(value) => setAttributes({ question1Content: value })}
            placeholder="Enter What content..."
          />
          <Button
            isSecondary
            onClick={() => handleConvertSelectionToList()}
            style={{ marginTop: '8px' }}
          >
            Convert Selection to List
          </Button>
          
          <TextareaControl
            label="Question 2 Title"
            value={question2Title}
            onChange={(value) => setAttributes({ question2Title: value })}
            placeholder="You?"
          />
          <TextareaControl
            label="Question 2 Content"
            value={question2Content}
            onChange={(value) => setAttributes({ question2Content: value })}
            placeholder="Enter Why content..."
          />
          <Button
            isSecondary
            onClick={() => handleConvertSelectionToList()}
            style={{ marginTop: '8px' }}
          >
            Convert Selection to List
          </Button>
          
          <TextareaControl
            label="Question 3 Title"
            value={question3Title}
            onChange={(value) => setAttributes({ question3Title: value })}
            placeholder="Who."
          />
          <TextareaControl
            label="Question 3 Content"
            value={question3Content}
            onChange={(value) => setAttributes({ question3Content: value })}
            placeholder="Enter Who content..."
          />
          <Button
            isSecondary
            onClick={() => handleConvertSelectionToList()}
            style={{ marginTop: '8px' }}
          >
            Convert Selection to List
          </Button>
        </PanelBody>

        <PanelBody title="Scroll Settings" initialOpen={false}>
          <RangeControl
            label="Scroll Distance (Desktop)"
            value={scrollDistance}
            onChange={(value) => setAttributes({ scrollDistance: value })}
            min={100}
            max={500}
            step={10}
            help="How much scroll is needed to reach the next question on desktop"
          />
          <RangeControl
            label="Scroll Distance (Mobile)"
            value={scrollDistanceMobile}
            onChange={(value) => setAttributes({ scrollDistanceMobile: value })}
            min={100}
            max={300}
            step={10}
            help="How much scroll is needed to reach the next question on mobile"
          />
        </PanelBody>

        <PanelBody title="Progress Indicator" initialOpen={false}>
          <ToggleControl
            label="Show Progress Indicator"
            checked={showProgressIndicator}
            onChange={(value) => setAttributes({ showProgressIndicator: value })}
            help="Display a vertical progress line next to the questions"
          />
          {showProgressIndicator && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Progress Line Color</label>
                <ColorPicker
                  color={progressIndicatorColor}
                  onChangeComplete={(color) => setAttributes({ progressIndicatorColor: color.hex })}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Progress Fill Color</label>
                <ColorPicker
                  color={progressIndicatorFillColor}
                  onChangeComplete={(color) => setAttributes({ progressIndicatorFillColor: color.hex })}
                />
              </div>
              <RangeControl
                label="Progress Line Width"
                value={progressIndicatorWidth}
                onChange={(value) => setAttributes({ progressIndicatorWidth: value })}
                min={1}
                max={10}
                step={1}
                help="Width of the progress indicator line in pixels"
              />
            </>
          )}
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

      <section {...blockProps} className="animated-section">
        <div className="section-container">
          <div style={{display: "flex", flexDirection: "row"}}>
            {/* Progress Indicator */}
            {showProgressIndicator && (
              <div className="progress-indicator">
                <div className="progress-line">
                  <div className="progress-fill"></div>
                </div>
              </div>
            )}

            {/* Left side - Titles */}
            <div className="titles-column">
              <div className={`title-item${activeSection === 'what' ? ' active' : ''}`}>
                <span className="section-number">01</span>
                <RichText
                  tagName="h2"
                  value={question1Title}
                  onChange={(value) => setAttributes({ question1Title: value })}
                  placeholder="What."
                  style={{ 
                    color: activeSection === 'what' ? titleColor : inactiveTitleColor, 
                    opacity: activeSection === 'what' ? 1 : 0.5, 
                    fontSize: activeSection === 'what' ? '5rem' : '3rem', 
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </div>
              <div className={`title-item${activeSection === 'why' ? ' active' : ''}`}>
                <span className="section-number">02</span>
                <RichText
                  tagName="h2"
                  value={question2Title}
                  onChange={(value) => setAttributes({ question2Title: value })}
                  placeholder="You?"
                  style={{ 
                    color: activeSection === 'why' ? titleColor : inactiveTitleColor, 
                    opacity: activeSection === 'why' ? 1 : 0.5, 
                    fontSize: activeSection === 'why' ? '5rem' : '3rem', 
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </div>
              <div className={`title-item${activeSection === 'who' ? ' active' : ''}`}>
                <span className="section-number">03</span>
                <RichText
                  tagName="h2"
                  value={question3Title}
                  onChange={(value) => setAttributes({ question3Title: value })}
                  placeholder="Who."
                  style={{ 
                    color: activeSection === 'who' ? titleColor : inactiveTitleColor, 
                    opacity: activeSection === 'who' ? 1 : 0.5, 
                    fontSize: activeSection === 'who' ? '5rem' : '3rem', 
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="content-column">
            <div className={`content-item${activeSection === 'what' ? ' active' : ''}`} data-section="what">
              <RichText
                tagName="div"
                value={question1Content}
                onChange={(value) => setAttributes({ question1Content: value })}
                placeholder="Enter What content..."
                style={{ color: textColor || undefined }}
              />
            </div>
            <div className={`content-item${activeSection === 'why' ? ' active' : ''}`} data-section="why">
              <RichText
                tagName="div"
                value={question2Content}
                onChange={(value) => setAttributes({ question2Content: value })}
                placeholder="Enter Why content..."
                style={{ color: textColor || undefined }}
              />
            </div>
            <div className={`content-item${activeSection === 'who' ? ' active' : ''}`} data-section="who">
              <RichText
                tagName="div"
                value={question3Content}
                onChange={(value) => setAttributes({ question3Content: value })}
                placeholder="Enter Who content..."
                style={{ color: textColor || undefined }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 


