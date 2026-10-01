"""Rebuild assets/data/avatar_cloud.bin and assets/img/avatar_photo.jpg from a photo + metric depth map.

Usage:  OPENCV_IO_ENABLE_OPENEXR=1 python tools/make_avatar_cloud.py photo.jpg depth.exr
Needs:  pip install opencv-python numpy
Depth below PERSON_Z metres is kept as-is (the person); everything further (incl. inf sky) is
compressed onto a backdrop shell between 2.9 and 3.35 m so orbiting shows parallax without huge gaps.
"""
import sys, numpy as np, cv2

N, ZMIN, ZRANGE, PERSON_Z = 150, 1.4, 2.2, 3.0
img = cv2.imread(sys.argv[1])[:, :, ::-1]
d = cv2.imread(sys.argv[2], cv2.IMREAD_UNCHANGED)
if d.ndim == 3: d = d[:, :, 0]
H, W = d.shape; s = min(H, W); x0, y0 = (W - s) // 2, (H - s) // 2
img = cv2.resize(img, (W, H))[y0:y0 + s, x0:x0 + s]; d = d[y0:y0 + s, x0:x0 + s]

col = cv2.resize(np.ascontiguousarray(img), (N, N), interpolation=cv2.INTER_AREA)
dd = cv2.resize(d, (N, N), interpolation=cv2.INTER_NEAREST)
bg = np.where(np.isfinite(dd), dd, 600.0)
Z = np.where(dd < PERSON_Z, dd, 2.9 + 0.45 * np.log10(np.clip(bg, 3, 600)) / np.log10(600))
q = np.round((Z - ZMIN) / ZRANGE * 65535).clip(0, 65535).astype('<u2')
open('assets/data/avatar_cloud.bin', 'wb').write(q.tobytes() + col.astype(np.uint8).tobytes())
cv2.imwrite('assets/img/avatar_photo.jpg', np.ascontiguousarray(img[:, :, ::-1]), [cv2.IMWRITE_JPEG_QUALITY, 90])
print('wrote', N, 'x', N, 'grid; person pixels:', float((dd < PERSON_Z).mean()))
