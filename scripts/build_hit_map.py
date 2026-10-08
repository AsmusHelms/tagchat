"""Rebuild the server hit map from public/tagene_klik.gif (requires Pillow)."""
from pathlib import Path
import json
from PIL import Image
root = Path(__file__).resolve().parents[1]
im = Image.open(root / 'public/tagene_klik.gif').convert('RGB')
assert im.size == (1080, 1920), 'Click map must be 1080 × 1920'
rows = []
for y in range(im.height):
    runs = []
    for x in range(im.width):
        r,g,b = im.getpixel((x,y))
        action = 0
        if r > 200 and g < 80 and b < 80: action = 1
        elif r > 200 and g > 200 and b < 80: action = 2
        elif g > 200 and r < 100 and b < 100:
            action = 5 if y < 500 else 3 if y < 1000 else 4
        if runs and runs[-1] == action: runs[-2] += 1
        else: runs.extend([1,action])
    rows.append(runs)
(root / 'rooftops-hit-map.json').write_text(json.dumps({'width':im.width,'height':im.height,'rows':rows},separators=(',',':')))
