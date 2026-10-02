/* tilt.js — phone/tablet tilt as an input for the 3D avatar and background.
 * Exposes window.siteTilt = { active, x, y } with x/y in [-1, 1] (left-right / front-back tilt
 * relative to how the device was being held). Only runs on touch devices with an orientation
 * sensor; desktop never gets `active`, so mouse behaviour there is unchanged.
 * iOS needs a one-time permission prompt, which must come from a tap: the first tap on the page asks.
 */
(function () {
  var T = window.siteTilt = { active: false, x: 0, y: 0, needsTap: false };
  var coarse = matchMedia('(pointer: coarse)').matches;
  if (!coarse || !('DeviceOrientationEvent' in window)) return;

  var RANGE = 22;            /* degrees of tilt that map to full deflection */
  var g0 = null, b0 = null;  /* neutral pose = how the phone is held; drifts slowly so it re-centres */
  function clamp(v) { return Math.max(-1, Math.min(1, v)); }
  function onOrient(e) {
    if (e.gamma == null || e.beta == null) return;
    var a = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    var lr = e.gamma, fb = e.beta;
    if (a === 90) { lr = e.beta; fb = -e.gamma; } else if (a === -90 || a === 270) { lr = -e.beta; fb = e.gamma; } else if (a === 180) { lr = -e.gamma; fb = -e.beta; }
    if (g0 === null) { g0 = lr; b0 = fb; }
    g0 += (lr - g0) * .004; b0 += (fb - b0) * .004;
    T.x = clamp((lr - g0) / RANGE); T.y = clamp((fb - b0) / RANGE);
    if (!T.active) { T.active = true; document.documentElement.classList.add('has-tilt'); }
  }
  function listen() { addEventListener('deviceorientation', onOrient); }

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {   /* iOS 13+ */
    T.needsTap = true;
    var ask = function () {
      DeviceOrientationEvent.requestPermission().then(function (s) { if (s === 'granted') listen(); }).catch(function () {});
      T.needsTap = false; removeEventListener('click', ask); removeEventListener('touchend', ask);
    };
    addEventListener('click', ask); addEventListener('touchend', ask);
  } else listen();
})();
