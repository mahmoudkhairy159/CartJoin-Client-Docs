"""Create silent, captioned teaching clips from captured screenshots; not live screen recordings."""
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
if not (TMP/'guide.ttf').exists():
    shutil.copyfile(Path('C:/Windows/Fonts/segoeui.ttf'), TMP/'guide.ttf')

def run(args):
    result = subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*args],cwd=ROOT,capture_output=True,text=True)
    if result.returncode: raise RuntimeError(result.stderr[-3000:])

def timestamp(seconds):
    return f'00:{seconds//60:02d}:{seconds%60:02d}.000'

for name,tour in DATA.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]: continue
    if not tour['video']: continue
    seconds=tour.get('secondsPerStep',10)
    for media_lang in (['en','ar'] if tour.get('localizedVideo') else [None]):
        media_name=f'{name}-{media_lang}' if media_lang else name
        clips=[]
        for index,step in enumerate(tour['steps']):
            source=ROOT/'public/screenshots'/(step.get('imageAr',step['image']) if media_lang=='ar' else step['image'])
            with Image.open(source) as img: w,h=img.size
            crop=step.get('videoCropAr' if media_lang=='ar' else 'videoCrop',[0,0,100,100])
            cx,cy,cw,ch=crop; cropw=int(w*cw/100)//2*2; croph=int(h*ch/100)//2*2
            scale=min(1224/cropw,600/croph); sw=int(cropw*scale)//2*2; sh=int(croph*scale)//2*2
            ox=(1280-sw)//2; oy=24
            x,y,rw,rh=step.get('focusAr',step['focus']) if media_lang=='ar' else step['focus']
            bx=round(ox+sw*(x-cx)/cw); by=round(oy+sh*(y-cy)/ch); bw=round(sw*rw/cw); bh=round(sh*rh/ch)
            vf=(f'crop={cropw}:{croph}:{int(w*cx/100)}:{int(h*cy/100)},scale={sw}:{sh},setsar=1,pad=1280:720:{ox}:{oy}:color=0x171a18,'
                f'drawbox=x={bx}:y={by}:w={bw}:h={bh}:color=0xc4dfb6:t=3,'
                f"drawtext=fontfile=.tour-build/guide.ttf:text='{index+1} / {len(tour['steps'])}':x=40:y=656:fontsize=24:fontcolor=0xe8ece5,"
                "drawtext=fontfile=.tour-build/guide.ttf:text='CartJoin / Screenshot tour':x=180:y=660:fontsize=18:fontcolor=0xa9b2a9")
            clip=TMP/f'{media_name}-{index}.mp4'
            run(['-loop','1','-i',str(source),'-vf',vf,'-t',str(seconds),'-r','24','-an','-c:v','libx264','-preset','fast','-tune','stillimage','-crf','23','-pix_fmt','yuv420p',str(clip)])
            clips.append(clip)
        manifest=TMP/f'{media_name}.txt'
        manifest.write_text('\n'.join("file '"+str(p.resolve()).replace('\\','/')+"'" for p in clips),encoding='utf-8')
        output=OUT/f'{media_name}-tour.mp4'
        run(['-f','concat','-safe','0','-i',str(manifest),'-c','copy','-movflags','+faststart',str(output)])
        run(['-i',str(output),'-frames:v','1','-q:v','3',str(OUT/f'{media_name}-poster.jpg')])
        print(f'{media_name}: {len(clips)*seconds}s, {output.stat().st_size//1024} KiB',flush=True)
    for lang in ['en','ar']:
        cues=['WEBVTT','']
        for index,step in enumerate(tour['steps']):
            cues += [str(index+1),f'{timestamp(index*seconds)} --> {timestamp((index+1)*seconds)}',step['title'][lang],*textwrap.wrap(step['body'][lang],width=72),'']
        (OUT/f'{name}-{lang}.vtt').write_text('\n'.join(cues).rstrip()+'\n',encoding='utf-8')
