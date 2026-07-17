const babel = require('@babel/core');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const getDeviceValue = (attribute, device, defaultValue) => attribute?.[device] ?? defaultValue;
const useBlockProps = { save: (props) => props };

const source = `
function Comp({ attributes }) {
  const {
    buttonText,
    buttonLink,
    openInNewTab,
    blockId,
    buttonColor,
    buttonBackgroundColor,
    buttonHoverColor,
    buttonHoverBackgroundColor,
    buttonStyle,
    underlineColor,
    blurAmount,
    fontSize,
    showIcon,
    hoverAnimation,
    buttonPadding,
    buttonMargin,
    zIndex,
    borderRadius,
    fontWeight,
    borderWidth,
    borderColor,
    borderStyle,
    buttonHoverBorderColor,
  } = attributes;

  return (
    <div {...useBlockProps.save({
      className: 'adaire-button-block',
      id: blockId || undefined,
      style: {
        '--button-color': buttonColor || '#ffffff',
        '--button-bg-color': buttonBackgroundColor || 'transparent',
        '--button-hover-color': buttonHoverColor || '#ffffff',
        '--button-hover-bg-color': buttonHoverBackgroundColor || 'transparent',
        '--button-underline-color': underlineColor || '#ff4242',
        '--button-blur': blurAmount ? \`\${blurAmount}px\` : '0px',
        '--button-font-size': \`\${getDeviceValue(fontSize, 'desktop', 18)}px\`,
        '--button-padding-top': buttonPadding?.desktop?.top || '10px',
        '--button-padding-right': buttonPadding?.desktop?.right || '20px',
        '--button-padding-bottom': buttonPadding?.desktop?.bottom || '10px',
        '--button-padding-left': buttonPadding?.desktop?.left || '20px',
        '--button-margin-top': buttonMargin?.desktop?.top || '20px',
        '--button-margin-right': buttonMargin?.desktop?.right || '0px',
        '--button-margin-bottom': buttonMargin?.desktop?.bottom || '20px',
        '--button-margin-left': buttonMargin?.desktop?.left || '0px',
        '--button-z-index': zIndex || '1',
        '--button-border-radius': borderRadius ? \`\${borderRadius}px\` : '0px',
        '--button-font-weight': fontWeight || '500',
        '--button-border-width': borderWidth ? \`\${borderWidth}px\` : '2px',
        '--button-border-color': borderColor || '#ff4242',
        '--button-border-style': borderStyle || 'solid',
        '--button-hover-border-color': buttonHoverBorderColor || borderColor || '#ff4242',
      }
    })}>
      <a
        href={buttonLink}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={\`adaire-button-block__link adaire-button-block__link--\${buttonStyle || 'underline'} adaire-button-block__link--\${hoverAnimation || 'slide-underline'}\`}
      >
        {buttonText}
        {showIcon !== false && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </a>
    </div>
  );
}
module.exports = Comp;
`;

const { code } = babel.transform(source, { presets: ['@babel/preset-react'] });
const mod = { exports: {} };
const fn = new Function('module', 'exports', 'require', 'React', 'useBlockProps', 'getDeviceValue', code);
fn(mod, mod.exports, require, React, useBlockProps, getDeviceValue);
const Comp = mod.exports;

const attributes = {
  buttonText: 'Back to all blocks',
  buttonLink: 'https://AdaireBlocks.com/adaire-blocks/',
  openInNewTab: false,
  blockId: '',
  buttonColor: '#ffffff',
  buttonBackgroundColor: '#d5293f',
  buttonHoverColor: '#ffffff',
  buttonHoverBackgroundColor: '#d5293f',
  buttonStyle: 'border',
  underlineColor: '',
  blurAmount: 0,
  fontSize: { desktop: 18 },
  showIcon: true,
  hoverAnimation: '',
  buttonPadding: { desktop: { top: '10px', right: '20px', bottom: '10px', left: '20px' } },
  buttonMargin: { desktop: { top: '20px', right: '0px', bottom: '20px', left: '0px' } },
  zIndex: 1,
  borderRadius: 8,
  fontWeight: '400',
  borderWidth: 2,
  borderColor: '#d5293f',
  borderStyle: 'solid',
  buttonHoverBorderColor: '',
};

const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { attributes }));
console.log(html);

