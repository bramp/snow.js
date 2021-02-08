# Development

The DeviceMotionEvent APIs only work on SSL sites, so a local HTTPS server is needed for testing. [This article demostrates how to setup a local HTTPS server for testing](https://blog.bramp.net/post/2020/12/27/local-https-server-for-development/).

alias https="http-server -c-1 -S \
  -C ~/.secrets/live/mac.bramp.net/fullchain.pem \
  -K ~/.secrets/live/mac.bramp.net/privkey.pem"

mac.bramp.net


TODO
* See if I can see DeviceMotionEvent.acceleration
* Move the full screen button into the middle, and hide on desktops.

Useful links

* https://developers.google.com/web/fundamentals/native-hardware/device-orientation
* https://github.com/sindresorhus/screenfull.js - Fullscreen wrapper
* https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation
* https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent
* https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent/acceleration
* http://www.chrobotics.com/library/understanding-euler-angles
* http://glmatrix.net/docs/module-mat4.html
* https://sensor-js.xyz/demo.html
* https://github.com/adtile/Full-Tilt/wiki/Full-Tilt-API-Documentation


