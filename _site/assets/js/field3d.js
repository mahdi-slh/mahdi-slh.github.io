/* field3d.js — ambient 3D background + publication card tilt.
 * Background modes (set data-mode on the script tag): "graph" (rotating point set with radius-graph edges),
 * "splat" (drifting soft Gaussians) or "off". Colours follow the theme's --accent token.
 */
(function () {
  var script = document.currentScript;
  var mode = (script && script.dataset.mode) || 'graph';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1);

  /* ---------- card tilt ---------- */
  if (!reduce) document.querySelectorAll('.pubcard').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      el.style.transform = 'rotateY(' + px * 7 + 'deg) rotateX(' + (-py * 7) + 'deg)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  if (mode === 'off') return;

  /* ---------- background ---------- */
  var cv = document.createElement('canvas'); cv.className = 'field3d'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  var bx = cv.getContext('2d'), W, H, mx = 0, my = 0, tmx = 0, tmy = 0, acc = [52, 211, 153];
  function readAccent() {
    var s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), m = s.match(/^#([0-9a-f]{6})$/i);
    if (m) acc = [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
  }
  readAccent(); matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readAccent);
  function size() { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; bx.setTransform(DPR, 0, 0, DPR, 0, 0); }
  size(); addEventListener('resize', size);
  addEventListener('pointermove', function (e) { tmx = e.clientX / W - .5; tmy = e.clientY / H - .5; });

  var N = W < 600 ? 70 : 120, P = [], G = [];
  for (var i = 0; i < N; i++) P.push([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1]);
  for (i = 0; i < 26; i++) G.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .00025, vy: (Math.random() - .5) * .00025,
    sx: 60 + Math.random() * 180, sy: 20 + Math.random() * 70, a: Math.random() * Math.PI, va: (Math.random() - .5) * .002, c: i % 3 });

  function graph(t) {
    var ry = t * .00006 + mx * .8, rx = .35 + my * .5, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    var f = Math.min(W, H) * .9, ox = W * .62, oy = H * .5, pr = [], r = acc[0], g = acc[1], b = acc[2];
    for (var i = 0; i < N; i++) { var p = P[i], x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1] * cx - z * sx; z = p[1] * sx + z * cx;
      var s = f / (z + 3.2); pr.push([ox + x * s * 1.6, oy + y * s, z]); }
    bx.lineWidth = 1;
    for (i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
      var a = P[i], c = P[j], d = (a[0] - c[0]) * (a[0] - c[0]) + (a[1] - c[1]) * (a[1] - c[1]) + (a[2] - c[2]) * (a[2] - c[2]);
      if (d < .16) { bx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + ((1 - d / .16) * .28 * (1 - (pr[i][2] + 1) * .3)) + ')';
        bx.beginPath(); bx.moveTo(pr[i][0], pr[i][1]); bx.lineTo(pr[j][0], pr[j][1]); bx.stroke(); }
    }
    for (i = 0; i < N; i++) { var q = pr[i], sz = 2.6 - (q[2] + 1) * .7;
      bx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (.7 - (q[2] + 1) * .3) + ')'; bx.fillRect(q[0] - sz / 2, q[1] - sz / 2, sz, sz); }
  }
  function splat() {
    var cols = [acc, [90, 140, 255], [255, 120, 140]];
    for (var i = 0; i < G.length; i++) { var s = G[i];
      s.x += s.vx; s.y += s.vy; s.a += s.va;
      if (s.x < -.2) s.x = 1.2; if (s.x > 1.2) s.x = -.2; if (s.y < -.2) s.y = 1.2; if (s.y > 1.2) s.y = -.2;
      var c = cols[s.c]; bx.save(); bx.translate(s.x * W - mx * 60, s.y * H - my * 60); bx.rotate(s.a); bx.scale(s.sx, s.sy);
      var gr = bx.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',.10)'); gr.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
      bx.fillStyle = gr; bx.beginPath(); bx.arc(0, 0, 1, 0, 7); bx.fill(); bx.restore(); }
  }
  function frame(t) {
    mx += (tmx - mx) * .04; my += (tmy - my) * .04; bx.clearRect(0, 0, W, H);
    if (mode === 'splat') splat(); else graph(t);
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
