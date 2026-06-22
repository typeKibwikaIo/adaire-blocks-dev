const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const blocks = [
  "accordion-block","button-block","video-player-block","icon-box-block",
  "social-banner-block","social-share-block","testimonial-block","posts-grid-block",
  "posts-carousel-block","tabs-block","animation-scroll-block","content-toggle-block",
  "flipcard-block","swiper-carousel-block","swiper-slide-block","our-process-block",
  "hero-1-block","infogrid-block","infogrid-2-block","image-composition-block","container-block"
];

let allOk = true;
for (const b of blocks) {
  const file = path.join('src', b, 'edit.js');
  try {
    const code = fs.readFileSync(file, 'utf8');
    babel.transformSync(code, {
      filename: file,
      presets: [require.resolve('@babel/preset-react')],
      babelrc: false,
      configFile: false,
    });
    console.log(b + ' | OK');
  } catch (e) {
    allOk = false;
    console.log(b + ' | SYNTAX ERROR: ' + e.message.split('\n')[0]);
  }
}
console.log(allOk ? '\nALL FILES PARSE OK' : '\nSOME FILES HAVE ERRORS');
