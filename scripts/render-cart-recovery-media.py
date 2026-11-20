"""Render localized 24-second cart recovery tours from eight reviewed root CUA JPEGs.

Run only after root has approved every capture. No generated UI, narration or
reminder submission is introduced. Only cart recovery media files are written.
"""
from datetime import datetime, timezone
from pathlib import Path
import argparse
import json
import shutil
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT.parent / 'CartJoin-Backend/.capture-runtime'
SHOTS, VIDEOS = ROOT / 'public/screenshots', ROOT / 'public/videos'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-url', required=True, help='Actual root CUA preview URL, including /cart-recovery')
args = parser.parse_args()
FFMPEG, FFPROBE = shutil.which('ffmpeg'), shutil.which('ffprobe')
if not FFMPEG or not FFPROBE:
    raise SystemExit('ffmpeg and ffprobe must be available on PATH')

CHAPTERS = [
    ('checks', 'Cart reminder checks are off by default. These are controlled local test examples.', 'فحص تذكيرات السلة معطل افتراضيًا. هذه أمثلة اختبار محلية مقيدة.'),
    ('outcomes', 'Read each outcome and reason. Test acceptance is not message delivery, an order or revenue.', 'اقرأ النتيجة والسبب. قبول الاختبار لا يعني تسليم رسالة أو طلبًا أو إيرادًا.'),
    ('reason', 'Only authorized staff can request a bounded retry. Record what you reviewed without customer details.', 'يطلب الموظف المخول إعادة محدودة فقط. سجل ما راجعته دون بيانات العملاء.'),
    ('confirm', 'Review the confirmation before acting. This demonstration cancels here and submits no retry.', 'راجع التأكيد قبل التنفيذ. يُلغى الإجراء هنا في العرض دون إرسال إعادة محاولة.'),
]
raw_frames = {locale: [RAW / f'tenant-cart-recovery-{locale}-{key}.jpg' for key, _, _ in CHAPTERS] for locale in ('en', 'ar')}
# Validate the complete input set before changing any output.
for frames in raw_frames.values():
    for frame in frames:
        if not frame.is_file():
            raise FileNotFoundError(frame)
    if len({Image.open(frame).size for frame in frames}) != 1:
        raise ValueError('The four original CUA frames in each language must share one viewport')

manifest = {
    'capture_date': '2026-11-19', 'capture_timezone': 'Africa/Cairo',
    'kind': 'guided-screenshot-clips',
    'mechanism': 'Actual root CUA JPEG screenshot pixels preserved in PNG files, then rendered as four six-second still chapters with WebVTT captions; not continuous recording and no audio.',
    'environment': 'Controlled synthetic local Tenant dashboard examples; feature disabled by default. No live campaign or provider delivery acceptance.',
    'privacy': 'No customer contact, password, token, verification code or private operational evidence is published. Retry reasons contain only synthetic operator explanations.',
    'limits': 'accepted_test means local test-adapter acceptance only, not delivery, recovered order or revenue. The retry demonstration stops at confirmation and is cancelled.',
    'entries': [],
}
for locale, originals in raw_frames.items():
    frames = []
    for original in originals:
        destination = SHOTS / original.with_suffix('.webp').name
        with Image.open(original) as capture:
            capture.save(destination, format='WEBP', quality=86, method=4)
        frames.append(destination)
    output = VIDEOS / f'tenant-cart-recovery-{locale}-tour.mp4'
    command = [FFMPEG, '-v', 'error']
    for frame in frames:
        command += ['-loop', '1', '-framerate', '12', '-t', '6', '-i', str(frame)]
    graph = ''.join(f'[{i}:v]' for i in range(4)) + 'concat=n=4:v=1:a=0,pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white,format=yuv420p[v]'
    command += ['-filter_complex', graph, '-map', '[v]', '-r', '12', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', '-an', '-t', '24', '-y', str(output)]
    subprocess.run(command, check=True)
    captions = VIDEOS / f'tenant-cart-recovery-{locale}.vtt'
    texts = [chapter[1 if locale == 'en' else 2] for chapter in CHAPTERS]
    captions.write_text('WEBVTT\n\n' + '\n\n'.join(f'00:00:{i * 6:02}.000 --> 00:00:{(i + 1) * 6:02}.000\n{text}' for i, text in enumerate(texts)) + '\n', encoding='utf-8')
    probe = json.loads(subprocess.check_output([FFPROBE, '-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'json', str(output)], text=True))
    stream = probe['streams'][0]
    manifest['entries'].append({
        'id': f'tenant-cart-recovery-{locale}', 'locale': locale, 'role': 'TENANT', 'url': args.preview_url,
        'frames': [{'path': frame.relative_to(ROOT).as_posix(), 'raw_artifact': original.name,
            'raw_artifact_updated_at': datetime.fromtimestamp(original.stat().st_mtime, timezone.utc).isoformat(),
            'dimensions': list(Image.open(frame).size)} for frame, original in zip(frames, originals)],
        'video': output.relative_to(ROOT).as_posix(), 'captions': captions.relative_to(ROOT).as_posix(),
        'poster': frames[0].relative_to(ROOT).as_posix(), 'codec': stream['codec_name'],
        'video_dimensions': [stream['width'], stream['height']], 'duration_seconds': float(probe['format']['duration']),
        'bytes': output.stat().st_size, 'captions_text': texts,
    })
    print(f'{locale}: {stream["codec_name"]} {stream["width"]}x{stream["height"]}, {probe["format"]["duration"]}s')
(VIDEOS / 'cart-recovery-media-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
