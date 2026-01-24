const componentToHex = (c: number) => {
	const hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number) => {
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const hexToRgb = (hex: string) => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return [r, g, b];
};

const rgbToHsl = (r: number, g: number, b: number) => {
	(r /= 255), (g /= 255), (b /= 255);

	const max = Math.max(r, g, b),
		min = Math.min(r, g, b);
	let h = 0,
		s,
		l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return { h: h, s: s, l: l };
};

const rgbToHsv = (r: number, g: number, b: number) => {
	let computedH = 0;
	let computedS = 0;
	let computedV = 0;

	//remove spaces from input RGB values, convert to int
	r = parseInt(('' + r).replace(/\s/g, ''), 10);
	g = parseInt(('' + g).replace(/\s/g, ''), 10);
	b = parseInt(('' + b).replace(/\s/g, ''), 10);

	if (r == null || g == null || b == null || isNaN(r) || isNaN(g) || isNaN(b)) {
		alert('Please enter numeric RGB values!');
		return;
	}
	if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
		alert('RGB values must be in the range 0 to 255.');
		return;
	}
	r = r / 255;
	g = g / 255;
	b = b / 255;
	const minRGB = Math.min(r, Math.min(g, b));
	const maxRGB = Math.max(r, Math.max(g, b));

	// Black-gray-white
	if (minRGB == maxRGB) {
		computedV = minRGB;
		return {
			h: 0,
			s: 0,
			v: computedV
		};
	}

	// Colors other than black-gray-white:
	const distance = r == minRGB ? g - b : b == minRGB ? r - g : b - r;
	const h = r == minRGB ? 3 : b == minRGB ? 1 : 5;
	computedH = 60 * (h - distance / (maxRGB - minRGB));
	computedS = (maxRGB - minRGB) / maxRGB;
	computedV = maxRGB;
	return {
		h: computedH / 360,
		s: computedS,
		v: computedV
	};
};

/* Convert radians to degrees.
 *
 * @param {number} rad - radians to convert, expects
 *                       rad in range +/- PI per Math.atan2
 * @returns {number} degrees equivalent of rad
 */
const rad2deg = (rad: number) => {
	return (360 + (180 * rad) / Math.PI) % 360;
};

const rectToRGB = (x: number, y: number, lum: number) => {
	// Hue is from angle, saturation from distance from centre, value set to 1
	const r = Math.sqrt(x * x + y * y);
	// Limit extent to disc
	const sat = r > 1 ? 0 : r;
	const hue = rad2deg(Math.atan2(y, x));
	const rgb = hsv2rgb(hue, sat, lum).map(Math.round);
	return rgb;
};

const hsv2rgb = (h: number, s: number, v: number) => {
	const c = v * s;
	const h1 = h / 60;
	const x = c * (1 - Math.abs((h1 % 2) - 1));
	const m = v - c;
	let rgb = [3];

	if (typeof h == 'undefined') rgb = [0, 0, 0];
	else if (h1 < 1) rgb = [c, x, 0];
	else if (h1 < 2) rgb = [x, c, 0];
	else if (h1 < 3) rgb = [0, c, x];
	else if (h1 < 4) rgb = [0, x, c];
	else if (h1 < 5) rgb = [x, 0, c];
	else if (h1 <= 6) rgb = [c, 0, x];

	const r = 255 * (rgb[0] + m);
	const g = 255 * (rgb[1] + m);
	const b = 255 * (rgb[2] + m);

	return [r, g, b];
};

export { rgbToHsv, rgbToHex, hexToRgb, rectToRGB, hsv2rgb, rgbToHsl };
