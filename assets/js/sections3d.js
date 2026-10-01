/* sections3d.js — animated research-interest glyphs and collapsible News.
 * Glyphs: any <canvas data-glyph="globe|cube|splat|axes|tree|frustum"> gets a small rotating 3D icon in --accent.
 * News: the first list after the "News" heading shows 5 items, the rest behind "Show older".
 */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1), acc = [52, 211, 153];
  function readAccent() {
    var s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(), m = s.match(/^#([0-9a-f]{6})$/i);
    if (m) acc = [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
  }
  readAccent(); matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { readAccent(); if (reduce) draw(0); });

  /* ---------- News collapse ---------- */
  var h = document.getElementById('news');
  var ul = h && h.nextElementSibling;
  while (ul && ul.tagName !== 'UL' && !/^H\d$/.test(ul.tagName)) ul = ul.nextElementSibling;
  if (ul && ul.tagName === 'UL' && ul.children.length > 6) {
    ul.classList.add('news-list');
    for (var i = 5; i < ul.children.length; i++) ul.children[i].classList.add('news-old');
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'news-more';
    btn.textContent = 'Show older'; btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var open = ul.classList.toggle('open'); btn.textContent = open ? 'Show fewer' : 'Show older'; btn.setAttribute('aria-expanded', open);
    });
    ul.parentNode.insertBefore(btn, ul.nextSibling);
  }

  /* ---------- glyphs ---------- */
  var cube = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  var cubeE = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  function sc(p, k) { return [p[0] * k, p[1] * k, p[2] * k]; }
  function geo(kind) {
    var S = [], D = [], i, k;
    if (kind === 'cube') cubeE.forEach(function (e) { S.push([sc(cube[e[0]], .6), sc(cube[e[1]], .6)]); });
    if (kind === 'globe') {
      for (k = 0; k < 3; k++) { var ph = k * Math.PI / 3;
        for (i = 0; i < 24; i++) { var a = i / 24 * 6.283, b = (i + 1) / 24 * 6.283;
          S.push([[Math.cos(a) * Math.cos(ph), Math.sin(a), Math.cos(a) * Math.sin(ph)], [Math.cos(b) * Math.cos(ph), Math.sin(b), Math.cos(b) * Math.sin(ph)]]); } }
      for (i = 0; i < 24; i++) { var a2 = i / 24 * 6.283, b2 = (i + 1) / 24 * 6.283; S.push([[Math.cos(a2), 0, Math.sin(a2)], [Math.cos(b2), 0, Math.sin(b2)]]); }
    }
    if (kind === 'axes') {
      S.push([[0,0,0],[.9,0,0],'#ef4444'], [[0,0,0],[0,.9,0],'#22c55e'], [[0,0,0],[0,0,.9],'#3b82f6']);
      cubeE.forEach(function (e) { S.push([sc(cube[e[0]], .45), sc(cube[e[1]], .45), 'dim']); });
    }
    if (kind === 'tree') {
      var n = [[0,-.8,0],[-.55,0,.2],[.55,0,-.2],[-.8,.75,.4],[-.3,.75,-.1],[.3,.75,.1],[.8,.75,-.4]];
      [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]].forEach(function (e) { S.push([n[e[0]], n[e[1]]]); }); D = n.slice();
    }
    if (kind === 'frustum') {
      var o = [0,0,-.8], c = [[-.6,-.45,.6],[.6,-.45,.6],[.6,.45,.6],[-.6,.45,.6]];
      c.forEach(function (p, j) { S.push([o, p]); S.push([p, c[(j + 1) % 4]]); });
      S.push([[-.2,-.45,.6],[0,-.75,.6]], [[.2,-.45,.6],[0,-.75,.6]]);
    }
    if (kind === 'splat') for (i = 0; i < 7; i++) D.push([Math.sin(i * 2.4) * .6, Math.cos(i * 1.7) * .55, Math.sin(i * 3.1) * .5, 'g']);
    return { S: S, D: D };
  }
  var G = [].map.call(document.querySelectorAll('canvas[data-glyph]'), function (cv, i) {
    var css = cv.clientWidth || 44; cv.width = cv.height = css * DPR;
    return { cv: cv, x: cv.getContext('2d'), s: css * DPR, g: geo(cv.dataset.glyph), ph: i * .9 };
  });
  function draw(t) {
    var r = acc[0], g = acc[1], b = acc[2];
    G.forEach(function (o) {
      var x = o.x, s = o.s; x.clearRect(0, 0, s, s);
      var ry = t * .0007 + o.ph, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(.45), sx = Math.sin(.45);
      function pj(p) { var X = p[0] * cy + p[2] * sy, Z = -p[0] * sy + p[2] * cy, Y = p[1] * cx - Z * sx; Z = p[1] * sx + Z * cx; var k = 3 / (3 - Z); return [s / 2 + X * k * s * .36, s / 2 + Y * k * s * .36, Z]; }
      x.lineWidth = 1.2 * DPR; x.lineCap = 'round';
      o.g.S.forEach(function (sg) { var a = pj(sg[0]), c = pj(sg[1]);
        x.strokeStyle = sg[2] === 'dim' ? 'rgba(' + r + ',' + g + ',' + b + ',.25)' : sg[2] || 'rgba(' + r + ',' + g + ',' + b + ',' + (.45 + ((a[2] + c[2]) / 2 + 1) * .27) + ')';
        x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(c[0], c[1]); x.stroke(); });
      o.g.D.forEach(function (p) { var a = pj(p);
        if (p[3] === 'g') { var gr = x.createRadialGradient(a[0], a[1], 0, a[0], a[1], 8 * DPR);
          gr.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',.75)'); gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
          x.fillStyle = gr; x.beginPath(); x.ellipse(a[0], a[1], 9 * DPR, 5 * DPR, ry + p[0] * 3, 0, 7); x.fill(); }
        else { x.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'; x.beginPath(); x.arc(a[0], a[1], 2.4 * DPR, 0, 7); x.fill(); } });
    });
  }
  function frame(t) { draw(t); if (!reduce) requestAnimationFrame(frame); }
  if (G.length) requestAnimationFrame(frame);
})();
