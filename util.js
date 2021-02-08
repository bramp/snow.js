// snow.js by Andrew Brampton (https://bramp.net)
//
// This file contains random util functions.
// 

// Shuffles the array using the "modern version" of the Fisher–Yates shuffle.
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {uint32}          The RGBA representation
 * 
 * Adapted from https://stackoverflow.com/a/9493060/88646
 */
function hslToRgb(h, s, l){
    let r, g, b;

    if(s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    r = Math.round(r * 0xFF);
    g = Math.round(g * 0xFF);
    b = Math.round(b * 0xFF);

    // Alpha mask of 0xff000000 to ensure its fully visible.
    // ">>>0" to ensure its a uint32
    return ((r) | (g << 8) | (b << 16) | 0xff000000) >>>0;
}
