// snow.js by Andrew Brampton (https://bramp.net)
//
// This file contains functions to handle device orientation.
// 

const degToRad = Math.PI / 180;

// Direction of gravity determined from the deviceorientation API.
const gravity_from_deviceorientation = {
	x: 1,
	y: 0, // TODO Change this to be 1
	z: 0.5,
}

// Direction of gravity determined from the devicemotion API.
const gravity_from_devicemotion = {
	x: 0,
	y: 1,
	z: 0.5,
}

// Direction of gravity (normalised between 0-1).
const gravity = gravity_from_deviceorientation;

// 3x3 rotation matrix for the current screen rotation.
let screenOrientation = rotateMatrixZ(0); // Starts as no rotation (aka identity).

// Handles a DeviceOrientationEvent and converts it to a gravity vector.
//
// See https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation
window.addEventListener("deviceorientation", (events) => {
	// Unit vector pointing down in z.
	let down = [0, 0, -1];

	// Converts the Euler coordinates to a 3x3 rotation matrix
	const m = rotateMatrixFromEuler(event.alpha, event.beta, event.gamma);

	// Rotate a unit vector (representating gravity)
	down = matrixMultiple(down, m);

	// Adjust for the screen orientation
	down = matrixMultiple(down, screenOrientation);

	// Now we know the direction of down.
	gravity_from_deviceorientation.x = down[0];
	gravity_from_deviceorientation.y = -down[1]; // Flip y because 0 is at the top of the screen, and increases downwards.
	gravity_from_deviceorientation.z = down[2];

	sensor_text1.innerHTML = gravity_from_deviceorientation.x.toFixed(2) + "," + 
	                         gravity_from_deviceorientation.y.toFixed(2) + "," + 
	                         gravity_from_deviceorientation.z.toFixed(2);

	//sensor_text3.innerHTML = "[" + m[0].toFixed(2) + ", " + m[1].toFixed(2) + ", " + m[2].toFixed(2) + ",<br>&nbsp;" + m[3].toFixed(2) + ", " + m[4].toFixed(2) + ", " + m[5].toFixed(2) + ",<br>&nbsp;" + m[6].toFixed(2) + ", " + m[7].toFixed(2) + ", " + m[8].toFixed(2) + " ]";
	//sensor_text2.innerHTML = screenOrientation;
	//console.log(gravity);
});


// Handles a DeviceMotionEvent and converts it into a gravity vector.
//
// See https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent
window.addEventListener("devicemotion", (events) => {
	const acc = event.accelerationIncludingGravity;

	// The spec wierdly has gravity inverted from normal conventions.
	// "A flat device reporting accelerationIncludingGravity: {x: 0, y: 0, z: 9.81}"
	// See https://lists.w3.org/Archives/Public/public-geolocation/2014Nov/0000.html.
	// To resolve, we invert the acc vector.
	let down = [-acc.x / 10, -acc.y / 10, -acc.z / 10];

	// Adjust for the screen orientation
	down = matrixMultiple(down, screenOrientation);

	// Now we know the direction of down.
	gravity_from_devicemotion.x = down[0];
	gravity_from_devicemotion.y = -down[1]; // Flip y because 0 is at the top of the screen, and increases downwards.
	gravity_from_devicemotion.z = down[2];

	sensor_text2.innerHTML = gravity_from_devicemotion.x.toFixed(2) + "," + 
	                         gravity_from_devicemotion.y.toFixed(2) + "," + 
	                         gravity_from_devicemotion.z.toFixed(2);
});


// Handles a orientationchange event, to detect when the screen has been rotated.
window.addEventListener('orientationchange', () => {
	sensor_text3.innerHTML = window.orientation;

	screenOrientation = rotateMatrixZ(-window.orientation || 0);
});

// Multiples a 3x1 vector, with a 3x3 matrix, returning the result.
function matrixMultiple(v, m) {
  const x = v[0], y = v[1], z = v[2];
  v[0] = x * m[0] + y * m[3] + z * m[6];
  v[1] = x * m[1] + y * m[4] + z * m[7];
  v[2] = x * m[2] + y * m[5] + z * m[8];
  return v;
}

// Returns a 3x3 rotation matrix `angle` degrees around the Z axis.
function rotateMatrixZ(angle) {
	const sA = Math.sin(angle * degToRad);
	const cA = Math.cos(angle * degToRad);

	return [
		cA, -sA,  0,
		sA,  cA,  0,
		0,    0,  1,
	];
}


// Returns a 3x3 rotation matrix generated from Tait–Bryan (Euler) angles.
function rotateMatrixFromEuler(alpha, beta, gamma) {
	const x = (beta  || 0) * degToRad;
	const y = (gamma || 0) * degToRad;
	const z = (alpha || 0) * degToRad;

	const cX = Math.cos(x);
	const cY = Math.cos(y);
	const cZ = Math.cos(z);
	const sX = Math.sin(x);
	const sY = Math.sin(y);
	const sZ = Math.sin(z);

	//
	// ZXY-ordered Tait–Bryan rotation matrix
	// https://en.wikipedia.org/wiki/Euler_angles
	//
	return [
		cZ * cY - sZ * sX * sY,    - cX * sZ,    cZ * sY + cY * sZ * sX,
		cY * sZ + cZ * sX * sY,      cZ * cX,    sZ * sY - cZ * cY * sX,
		     - cX * sY        ,        sX   ,           cX * cY        
	];
};
