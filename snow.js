// snow.js by Andrew Brampton (https://bramp.net)
//
//

// The canvas we are working with
let canvas; // The canvas
let ctx;    // The canvas's 2D context

let compass_orientation;  // The debugging compass (using deviceorientation).
let compass_motion;       // The debugging compass (using devicemotion).

// We store the pixel buffer, to avoid repeated (slow) calls to getImageData
let img;     // A ImageData for painting onto ctx.
let pixel;   // A Uint32Array wrapping the img.data
let visited; // A Uint8Array to indicate if we've visited this pixel already this cycle.

let xorder = []; // The order by which to do each col of pixels.
let yorder = []; // The order by which to do each row of pixels.

const BACKGROUND = 0xff000000; // Black background color
const BORDER = 0xffffffff;     // Border color

// Debug data
let sensor_text1 = document.getElementById("sensor1");
sensor_text1.innerHTML = "nothing";
let sensor_text2 = document.getElementById("sensor2");
sensor_text2.innerHTML = "nothing";
let sensor_text3 = document.getElementById("sensor3");
sensor_text3.innerHTML = "nothing";

window.addEventListener("load", () => {
    canvas = document.getElementById('snow');
    ctx = canvas.getContext('2d');

    compass_orientation = document.getElementById('compass_orientation');
    compass_motion = document.getElementById('compass_motion');

    resize();
    requestAnimationFrame(anim);
});

window.addEventListener("resize", () => {
    resize();
});

function drawBackground() {
	// Background
	pixel.fill(BACKGROUND);
}

function drawBorder() {
    const width = canvas.width;
    const height = canvas.height;

	// Border
	for (let x = 0; x < width; x++) {
		pixel[x] = BORDER;
		pixel[width * (height - 1) + x]= BORDER;
	}
	for (let y = 0; y < height; y++) {
		pixel[y * width] = BORDER;
		pixel[y * width + width - 1]= BORDER;
	}
}

function resize() {
	if (canvas === undefined) {
		console.error("resize() was called before the DOM was loaded");
		return;
	}

	const width = innerWidth;
	const height = innerHeight;

	// Init some data structures
	seen = new Uint8Array(width * height);
	seen.fill(0);

	xorder = [];
	for (let x = 1; x < width - 1; x++) { // Avoid the left and right of the screen
		xorder.push(x);
	}
	yorder = [];
	for (let y = 1; y < height - 1; y++) { // Avoid the top and bottom of the screen
		yorder.push(y);
	}

	shuffle(xorder);
	shuffle(yorder);

	// Draw the initial screen
	canvas.width = width;
	canvas.height = height;

	img = ctx.getImageData(0, 0, width, height); 
	pixel = new Uint32Array(img.data.buffer);

	drawBackground();

 	// Add the initial snow
	for (y = 100; y < 300; y++) {
		for (x = 400; x < 600; x++) {	
			// Linearly adjust the hue between the min and max y.
			const color = hslToRgb((y-100) / 200, 1.0, 0.5);
			const p = y * width + x;

			pixel[p] = color;
		}
	}

	// Draw the border last, so it can sit on any snow we may have placed on the edge.
	drawBorder();
	
	ctx.putImageData(img, 0, 0);
}

// TODO get rid of down,left,right
function checkPixel(from, to, dir) {
	console.assert(to >= 0 && to < seen.length);

	// A unprocessed pixel is in the way. Process it.
	if (seen[to] === 0) {
		// This ensures sand at the bottom falls out of the way for sand above it.
		// Normally we could loop from bottom up, but since sand can fall in any
		// direction we take this recursive approach.
		// TODO It might be better to do a iterative approach, instead of recursive,
		// to avoid stack depth issues, and to improve performance.
		movePixel(to, dir);
	}

	// Is the pixel still a background? If so move there!
	if (pixel[to] === BACKGROUND) {
		pixel[to] = pixel[from];
		pixel[from] = BACKGROUND;
		return true;
	}

	return false;
}

// TODO get rid of down,left,right
function movePixel(from, dir) {
	console.assert(seen[from] == 0);
	console.assert(from >= 0 && from < seen.length);

	seen[from] = 1;

	// If this current pixel is background ignore it.
	if (pixel[from] === BACKGROUND || pixel[from] === BORDER) {
		return;
	}

	// Sometimes randomly do nothing.
	//if (Math.random() < 0.05) {
	//	return;
	//}

	// Can I move down?
	if (checkPixel(from, from + dir.down, dir)) {
		return;
	}

	let left = dir.left;
	let right = dir.right;

	// Half the time flip left and right, to keep the algorithm balanced.
	if (Math.random() < 0.5) {
		left = dir.right;
		right = dir.left;
	}

	// Can I move down + randomly left/right?
	if (checkPixel(from, from + dir.left, dir)) {
		return;
	}
	if (checkPixel(from, from + dir.right, dir)) {
		return;
	}
}


function move(elapsed) {
	const width = canvas.width;
	const height = canvas.height;

	const dir = {
		// Left
		//down: -1,
		//left: -width -1,
		//right: width - 1,

		// Down
		down: width,
		left: width -1,
		right: width + 1,
	}

	// Reset which pixels we've visited
	seen.fill(0);

	// Update the random order
	shuffle(xorder);
	shuffle(yorder);

	// Update x and y in a random order. This visually looks a lot nicer.
	for (let y = 0; y < yorder.length; y++) {
		const p_min = yorder[y] * width;

		for (let x = 0; x < xorder.length; x++) {
			const from = p_min + xorder[x];
			if (seen[from] === 0) {
				movePixel(from, dir);
			}
		}
	}
}

function draw() {
	ctx.putImageData(img, 0, 0);
}


/*
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

var controls = null;
var orientationPromise = FULLTILT.getDeviceOrientation({ type: "world" });
orientationPromise.then(function(deviceOrientationController) {
	controls = deviceOrientationController;
});
*/

// Draws a debugging compass for the gravity vector.
function drawCompass(canvas, gravity) {
	const ctx = canvas.getContext('2d');
	
	const cx = canvas.width / 2;
	const cy = canvas.height / 2;
	const r = Math.min(canvas.width, canvas.height) / 2;

	// TODO We need to normalise gravity, as sometimes the magitude is outside of 1.

	// Draw circle
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, 2 * Math.PI);
	ctx.fillStyle = "#000000";
	ctx.fill();

	// Draw Z bubble
	ctx.beginPath();
	ctx.arc(cx, cy, r * Math.abs(gravity.z), 0, 2 * Math.PI);
	ctx.fillStyle = "#0000FF";
	ctx.fill();

	// Draw needle
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, 2 * Math.PI);
	ctx.moveTo(cx, cy);
	ctx.lineTo(cx + gravity.x * r, cy + gravity.y * r);

	ctx.strokeStyle = "#FF0000";
	ctx.stroke();
}

let timespent = 0;
let frames = 0;
let start;
function anim(timestamp) {
	if (start === undefined) {
	    start = timestamp;
	}
	const elapsed = timestamp - start;
	frames++;

	if (elapsed > 1000) {
		//console.log((frames / (elapsed / 1000)) + " fps with " + timespent + " cpu/s");
		start = timestamp;
		frames = 0;
		timespent = 0;
	}

	const t0 = performance.now();

    move(elapsed);
    draw();
    drawCompass(compass_orientation, gravity_from_deviceorientation);
    drawCompass(compass_motion, gravity_from_devicemotion);
    requestAnimationFrame(anim);

    const t1 = performance.now();
    timespent += (t1 - t0);
}
