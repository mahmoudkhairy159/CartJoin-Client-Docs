"""Create silent, captioned teaching clips from real screenshots; no simulated transactions."""
from pathlib import Path
import json, shutil, subprocess, textwrap, sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT/'content/system-tours.json').read_text(encoding='utf-8'))
FFMPEG = shutil.which('ffmpeg')
if not FFMPEG:
    raise SystemExit('FFmpeg is required to regenerate the optional tour videos.')
OUT = ROOT/'public/videos'; OUT.mkdir(exist_ok=True)
TMP = ROOT/'.tour-build'; TMP.mkdir(exist_ok=True)
shutil.copyfile(Path('C:/Windows/Fonts/segoeui.ttf'), TMP/'guide.ttf')

def run(args):
    result = subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*args],cwd=ROOT,capture_output=True,text=True)
    if result.returncode: raise RuntimeError(result.stderr[-3000:])

def timestamp(seconds):
    return f'00:{seconds//60:02d}:{seconds%60:02d}.000'

for name,tour in DATA.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]: continue
    if not tour['video']: continue
    seconds= tour.get('secondsPerStep',10)
    clips=[]
    for index,step in enumerate(tour['steps']):
        source = ROOT/'public/screenshots'/step['image']
        with Image.open(source) as img: w,h=img.size
        scale=min(1224/w,600/h)
        sw=int(w*scale)//2*2; sh=int(h*scale)//2*2
        ox=(1280-sw)//2; oy=24
        x,y,rw,rh=step['focus']; bx=round(ox+sw*x/100); by=round(oy+sh*y/100)
        bw=round(sw*rw/100); bh=round(sh*rh/100)
        vf=(f'scale={sw}:{sh},pad=1280:720:{ox}:{oy}:color=0x171a18,'
            f'drawbox=x={bx}:y={by}:w={bw}:h={bh}:color=0xc4dfb6:t=3,'
            f"drawtext=fontfile=.tour-build/guide.ttf:text='{index+1} / {len(tour['steps'])}':x=40:y=656:fontsize=24:fontcolor=0xe8ece5,"
            "drawtext=fontfile=.tour-build/guide.ttf:text='CartJoin / Screenshot tour':x=180:y=660:fontsize=18:fontcolor=0xa9b2a9")
        clip=TMP/f'{name}-{index}.mp4'
        run(['-loop','1','-i',str(source),'-vf',vf,'-t',str(seconds),'-r','24','-an','-c:v','libx264','-preset','fast','-tune','stillimage','-crf','23','-pix_fmt','yuv420p',str(clip)])
        clips.append(clip)
    manifest=TMP/f'{name}.txt'
    manifest.write_text('\n'.join("file '"+str(p.resolve()).replace('\\','/')+"'" for p in clips),encoding='utf-8')
    output=OUT/f'{name}-tour.mp4'
    run(['-f','concat','-safe','0','-i',str(manifest),'-c','copy','-movflags','+faststart',str(output)])
    run(['-i',str(output),'-frames:v','1','-q:v','3',str(OUT/f'{name}-poster.jpg')])
    for lang in ['en','ar']:
        cues=['WEBVTT','']
        for index,step in enumerate(tour['steps']):
            cues += [str(index+1),f'{timestamp(index*seconds)} --> {timestamp((index+1)*seconds)}',step['title'][lang],*textwrap.wrap(step['body'][lang],width=72),'']
        (OUT/f'{name}-{lang}.vtt').write_text('\n'.join(cues)+'\n',encoding='utf-8')
    print(f'{name}: {len(clips)*seconds}s, English/Arabic captions, {output.stat().st_size//1024} KiB',flush=True)
