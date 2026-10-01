/* avatar3d.js — turns the header avatar into a draggable 3D point cloud.
 *
 * Data: assets/data/avatar_cloud.bin  = N*N uint16 depth (little-endian, metres mapped from [1.4, 3.6])
 *                                       followed by N*N*3 uint8 RGB, row-major, square crop of the photo.
 *       assets/img/avatar_photo.jpg   = the same square photo at full resolution (used in photo mode).
 * Drag to orbit, click to toggle photo / point cloud. Falls back to the plain <img> if anything fails.
 * Regenerate the .bin with tools/make_avatar_cloud.py when you change the photo or depth map.
 */
(function () {
  var host = document.querySelector('.image.avatar');
  if (!host || !window.fetch) return;
  var img = host.querySelector('img');
  var script = document.currentScript;
  var BIN = (script && script.dataset.cloud) || './assets/data/avatar_cloud.bin';
  var PHOTO = (script && script.dataset.photo) || './assets/img/avatar_photo.jpg';
  var NG = 150, FN = 2.1, PIV = 1.85, ZF = PIV, ZMIN = 1.4, ZRANGE = 2.2, PERSON_Z = 3.0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  fetch(BIN).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(function (buf) {
    var u8 = new Uint8Array(buf), dv = new DataView(buf), n = NG * NG, co = n * 2, pts = [];
    if (u8.length < n * 5) throw 0;
    for (var i = 0; i < n; i++) {
      var z = ZMIN + dv.getUint16(i * 2, true) / 65535 * ZRANGE;
      pts.push([(i % NG + .5) / NG * 2 - 1, ((i / NG | 0) + .5) / NG * 2 - 1, z,
        u8[co + i * 3], u8[co + i * 3 + 1], u8[co + i * 3 + 2],
        Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, z < PERSON_Z]);
    }
    start(pts);
  }).catch(function () { /* keep the plain image */ });

  function start(pts) {
    var wrap = document.createElement('div'); wrap.className = 'avatar3d';
    var cv = document.createElement('canvas');
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Portrait rendered as a rotatable 3D point cloud');
    var hint = document.createElement('div'); hint.className = 'avatar3d-hint'; hint.textContent = 'drag to orbit · click for photo';
    wrap.appendChild(cv); wrap.appendChild(hint);
    host.parentNode.insertBefore(wrap, host); host.style.display = 'none';

    var ax = cv.getContext('2d'), AS, img32, zbuf, photo = new Image(); photo.src = PHOTO;
    var yaw = -.3, pitch = .08, vyaw = 0, vpitch = 0, drag = false, moved = false, lx = 0, ly = 0;
    var cloud = 1, target = 1, lastInteract = 0, intro = 0, acc = [52, 211, 153];
    function readAccent() {
      var s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      var m = s.match(/^#([0-9a-f]{6})$/i);
      if (m) acc = [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    }
    readAccent(); matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readAccent);
    function size() { AS = Math.round(cv.clientWidth * DPR); cv.width = cv.height = AS; img32 = ax.createImageData(AS, AS); zbuf = new Float32Array(AS * AS); }
    size(); addEventListener('resize', size);
    function clamp(v, a) { return Math.max(-a, Math.min(a, v)); }

    cv.addEventListener('pointerdown', function (e) { drag = true; moved = false; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      vyaw = dx * .008; vpitch = dy * .008; yaw = clamp(yaw + vyaw, .55); pitch = clamp(pitch + vpitch, .3);
      lx = e.clientX; ly = e.clientY; lastInteract = performance.now();
    });
    cv.addEventListener('pointerup', function () { drag = false; if (!moved) { target = target ? 0 : 1; hint.textContent = target ? 'drag to orbit · click for photo' : 'click for 3D'; } });

    function frame(t) {
      if (!intro) intro = t;
      var k = Math.min(1, (t - intro) / 1800), scatter = reduce ? 0 : Math.pow(1 - k, 3);
      cloud += (target - cloud) * .08;
      if (!drag) {
        yaw = clamp(yaw + vyaw, .55); pitch = clamp(pitch + vpitch, .3); vyaw *= .9; vpitch *= .9;
        if (t - lastInteract > 2500 && !reduce) {
          var ty = target ? Math.sin(t * .0005) * .28 : 0, tp = target ? Math.sin(t * .00031) * .08 : 0;
          yaw += (ty - yaw) * .02; pitch += (tp - pitch) * .02;
        }
      }
      var c = cloud, cy = Math.cos(yaw * c), sy = Math.sin(yaw * c), cp = Math.cos(pitch * c), sp = Math.sin(pitch * c);
      var buf = img32.data; buf.fill(0); zbuf.fill(1e9);
      var R = AS * .5, photoSz = Math.ceil(AS / NG) + 1, cloudSz = Math.max(1, Math.round(DPR * 1.5));
      var sz = Math.round(photoSz + (cloudSz - photoSz) * Math.min(1, c * 1.6));
      if (c > .02) for (var i = 0; i < pts.length; i++) {
        var p = pts[i], Ze = ZF + (p[2] - ZF) * c;
        var X = p[0] * Ze / FN + p[6] * scatter * .8, Y = p[1] * Ze / FN + p[7] * scatter * .8, Z = Ze - PIV + p[8] * scatter * .8;
        var X1 = X * cy + Z * sy, Z1 = -X * sy + Z * cy, Y1 = Y * cp - Z1 * sp, Z2 = Y * sp + Z1 * cp + PIV;
        if (Z2 < .3) continue;
        var Xs = Math.round(R + X1 * FN / Z2 * R), Ys = Math.round(R + Y1 * FN / Z2 * R);
        var fog = p[9] ? 1 : 1 - c * .35, mix = p[9] ? c * .08 : c * .3;
        var r = p[3] * fog * (1 - mix) + acc[0] * mix, g = p[4] * fog * (1 - mix) + acc[1] * mix, b = p[5] * fog * (1 - mix) + acc[2] * mix;
        for (var oy = 0; oy < sz; oy++) { var yy = Ys + oy; if (yy < 0 || yy >= AS) continue;
          for (var ox = 0; ox < sz; ox++) { var xx = Xs + ox; if (xx < 0 || xx >= AS) continue;
            var zi = yy * AS + xx; if (Z2 > zbuf[zi]) continue; zbuf[zi] = Z2;
            var bi = zi * 4; buf[bi] = r; buf[bi + 1] = g; buf[bi + 2] = b; buf[bi + 3] = 255; } }
      }
      ax.putImageData(img32, 0, 0);
      var pa = Math.max(0, Math.min(1, 1 - c * 5));
      if (pa > 0 && photo.complete) { ax.globalAlpha = pa; ax.imageSmoothingQuality = 'high'; ax.drawImage(photo, 0, 0, AS, AS); ax.globalAlpha = 1; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
