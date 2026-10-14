"""Build all server pixel hit maps from the supplied GIF masks (requires Pillow)."""
from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parents[1]
for source,target,kind in [
 ('tagene_klik.gif','rooftops-hit-map.json','rooftops'),
 ('klubben_klik.gif','jazz-hit-map.json','club'),
 ('klubben_omvendt_klik.gif','jazz-reverse-hit-map.json','reverse')]:
 im=Image.open(root/'public'/source).convert('RGB')
 assert im.size==(1080,1920),f'{source} must be 1080 × 1920'
 rows=[]
 for y in range(im.height):
  runs=[]
  for x in range(im.width):
   r,g,b=im.getpixel((x,y));action=0
   if r>200 and g<80 and b<80:action=1
   elif r>200 and g>200 and b<80:action=2 if kind=='rooftops' else 3
   elif g>200 and r<100 and b<100:action=(5 if y<500 else 3 if y<1000 else 4) if kind=='rooftops' else 4
   elif kind=='club' and b>200 and r<80 and g<80:action=2
   if runs and runs[-1]==action:runs[-2]+=1
   else:runs.extend([1,action])
  rows.append(runs)
 (root/target).write_text(json.dumps({'width':im.width,'height':im.height,'rows':rows},separators=(',',':')))
 print(f'{source} → {target}')
