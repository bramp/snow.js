// snow.js by Andrew Brampton (https://bramp.net)
//
// This file contains functions to handle going full screen.
// 


function fullScreenCheck() {
  if (document.fullscreenElement) return;
  return document.documentElement.requestFullscreen();
}

// Returns a promise resolving if `screen.orientation.lock` is supported.
async function isLockOrientationAvailable() {
	try {
		await screen.orientation.lock(screen.orientation.type);
		await screen.orientation.unlock();
	} catch (err) {
		if (err.name == "NotSupportedError") {
			return false;
		}
		// Some other error may fire, but that could be normal.
		// This check is far from perfect.
	}
	return true;
}

// Taken from:
// * https://w3c.github.io/screen-orientation/#examples
// * https://www.w3.org/TR/screen-orientation/
async function lockOrientation() {
	try {
		await fullScreenCheck();
		await screen.orientation.lock(screen.orientation.type);

	} catch (err) {
		console.error("Failed to go into fullscreen", err);
	}
}


let button = document.getElementById("fullscreen");
button.style.visibility = "visible";

button.addEventListener("click", function() {
	// Request permission for iOS 13+ devices
	if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
		DeviceMotionEvent.requestPermission();
	}

	lockOrientation();
}, true);

// If we can lock the screen orientation display a
// full-screen button.
isLockOrientationAvailable().then(available => {
	if (available) {
		document.addEventListener('fullscreenchange', (event) => {
			if (document.fullscreenElement) {
				// Entering
				button.style.visibility = "hidden";
			} else {
				// Leaving full-screen mode
				button.style.visibility = "visible";
			}
		});
	}
});

