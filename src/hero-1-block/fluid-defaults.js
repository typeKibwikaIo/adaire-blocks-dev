/**
 * Fluid defaults shared by edit.js and save.js.
 *
 * The block emits one CSS custom property per breakpoint tier, and style.scss
 * consumes them inside pixel-width media queries. When a tier had its own
 * hard-coded default, crossing a breakpoint (1301px / 1921px) swapped in a
 * completely different value, so a viewport sitting near a cutoff jumped
 * between designs — most visibly `min-height: auto` -> `100vh`, which changed
 * the box shape the `background-size: cover` image is cropped against.
 *
 * These values interpolate continuously instead, so the small-laptop, desktop
 * and big-desktop tiers all resolve to the same number at any given width and
 * the cutoffs stop being visible. Editor-set per-tier values still win — these
 * only apply where the editor left a tier unset.
 *
 * Each clamp is anchored to the previous hard-coded pair: the lower bound is
 * the old small-laptop value at 1025px, the upper bound the old desktop value
 * at 1920px, with a linear vw ramp between them.
 */
export const FLUID = {
	// old: small-laptop auto / desktop + big-desktop 100vh
	minHeight: 'clamp(420px, 55vh, 720px)',

	// old: 60% -> 45% (615px at 1025px, 864px at 1920px)
	ctaWidth: 'clamp(615px, 27.8vw + 330px, 864px)',

	// old: 40px -> 60px
	paddingBlock: 'clamp(40px, 2.23vw + 17px, 60px)',
	// old: 80px -> 200px
	paddingLeft: 'clamp(80px, 13.4vw - 57px, 200px)',
	// old: 60px -> 150px
	paddingRight: 'clamp(60px, 10.06vw - 43px, 150px)',

	// old: 52px -> 72px
	headingFontSize: 'clamp(52px, 2.24vw + 29px, 72px)',
	// old: 68px / 92px fixed — unitless so it tracks the fluid font size
	headingLineHeight: '1.28',

	// old: 20px -> 26px
	textFontSize: 'clamp(20px, 0.67vw + 13px, 26px)',

	// old: 500px -> 700px
	iconWidth: 'clamp(500px, 22.35vw + 271px, 700px)',

	// old: 60px -> 90px
	breadcrumbTop: 'clamp(60px, 3.35vw + 26px, 90px)',
	// old: 80px -> 200px — tracks paddingLeft so breadcrumbs stay flush with the copy
	breadcrumbLeft: 'clamp(80px, 13.4vw - 57px, 200px)',

	// old: 500px -> 600px
	videoHeight: 'clamp(500px, 11.17vw + 385px, 600px)',
};
