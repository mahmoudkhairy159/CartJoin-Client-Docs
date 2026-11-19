"""Render two localized review reminder tours from eight final root CUA captures.

Do not run until root approves all inputs. Four six-second still chapters,
captions and no audio. This script changes only review reminder media files.
"""
from datetime import date, datetime, timezone
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
parser.add_argument('--preview-url', required=True, help='Actual root CUA preview URL, including /review-reminders')
parser.add_argument('--capture-date', required=True, type=date.fromisoformat, help='Confirmed Cairo capture date, YYYY-MM-DD')
args = parser.parse_args()
FFMPEG, FFPROBE = shutil.which('ffmpeg'), shutil.which('ffprobe')
if not FFMPEG or not FFPROBE:
    raise SystemExit('ffmpeg and ffprobe must be available on PATH')

CHAPTERS = [
    ('checks', 'Inspect each order request. Legacy transport outcomes remain unknown and read-only.', 'افحص طلب كل عملية شراء. تبقى نتائج النقل القديمة مجهولة وللقراءة فقط.'),
    ('outcomes', 'In-app availability, SMS test acceptance and suppression are separate. None proves external delivery.', 'الإتاحة داخل التطبيق وقبول اختبار الرسائل والمنع نتائج مستقلة، ولا تثبت أي منها تسليمًا خارجيًا.'),
    ('history', 'Read recorded reasons and the shared attempt budget. A retry keeps the original deadline.', 'اقرأ الأسباب المسجلة وعدد المحاولات المشترك. تحافظ الإعادة على الموعد النهائي الأصلي.'),
    ('confirm', 'Only authorized operators request retries. This demonstration cancels and submits no retry.', 'يطلب الموظف المخول الإعادة فقط. يُلغى الإجراء في العرض دون إرسال إعادة محاولة.'),
]
raw_frames = {locale: [RAW / f'tenant-review-reminders-{locale}-{key}.jpg' for key, _, _ in CHAPTERS] for locale in ('en', 'ar')}
# Validate the entire reviewed set before creating or overwriting any output.
for frames in raw_frames.values():
    for frame in frames:
        if not frame.is_file():
            raise FileNotFoundError(frame)
    if len({Image.open(frame).size for frame in frames}) != 1:
        raise ValueError('Four screenshots in one language must share the actual viewport')

manifest = {
    'capture_date': args.capture_date.isoformat(), 'capture_timezone': 'Africa/Cairo',
    'kind': 'guided-screenshot-clips',
    'mechanism': 'Actual root CUA JPEG screenshot pixels preserved in PNG files and rendered as four six-second still chapters with localized WebVTT captions; not continuous recording and no audio.',
    'environment': 'Controlled synthetic examples in a private local Tenant preview. No live external reminder provider or deployment acceptance.',
    'configuration': 'Processing is globally disabled by default. Only the isolated local preview explicitly enabled the guarded test path to show operator controls.',
    'privacy': 'No customer contacts, credentials, notification payloads or private provider evidence are published. Any operator explanation in the capture is synthetic.',
    'limits': 'In-app availability does not prove a read. SMS test acceptance does not prove external delivery, a submitted review, an order or revenue. Legacy transport outcomes remain unknown/read-only. The retry confirmation is cancelled; no retry is submitted in the demonstration.',
    'acceptance': 'Root reviewed actual English and Arabic screens, cancelled both confirmation dialogs and refreshed the request. The retained attempt count and fixed deadline were unchanged.',
    'entries': [],
}
for locale, originals in raw_frames.items():
    frames = []
    for original in originals:
        frame = SHOTS / original.with_suffix('.png').name
        with Image.open(original) as capture:
            capture.save(frame, format='PNG')
        frames.append(frame)
    output = VIDEOS / f'tenant-review-reminders-{locale}-tour.mp4'
    command = [FFMPEG, '-v', 'error']
    for frame in frames:
        command += ['-loop', '1', '-framerate', '12', '-t', '6', '-i', str(frame)]
    graph = ''.join(f'[{i}:v]' for i in range(4)) + 'concat=n=4:v=1:a=0,pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white,format=yuv420p[v]'
    command += ['-filter_complex', graph, '-map', '[v]', '-r', '12', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', '-an', '-t', '24', '-y', str(output)]
    subprocess.run(command, check=True)
    texts = [chapter[1 if locale == 'en' else 2] for chapter in CHAPTERS]
    captions = VIDEOS / f'tenant-review-reminders-{locale}.vtt'
    captions.write_text('WEBVTT\n\n' + '\n\n'.join(f'00:00:{i * 6:02}.000 --> 00:00:{(i + 1) * 6:02}.000\n{text}' for i, text in enumerate(texts)) + '\n', encoding='utf-8')
    probe = json.loads(subprocess.check_output([FFPROBE, '-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'json', str(output)], text=True))
    stream = probe['streams'][0]
    manifest['entries'].append({
        'id': f'tenant-review-reminders-{locale}', 'locale': locale, 'role': 'TENANT', 'url': args.preview_url,
        'frames': [{'path': frame.relative_to(ROOT).as_posix(), 'raw_artifact': original.name,
            'raw_artifact_updated_at': datetime.fromtimestamp(original.stat().st_mtime, timezone.utc).isoformat(),
            'dimensions': list(Image.open(frame).size)} for frame, original in zip(frames, originals)],
        'video': output.relative_to(ROOT).as_posix(), 'captions': captions.relative_to(ROOT).as_posix(),
        'poster': frames[0].relative_to(ROOT).as_posix(), 'codec': stream['codec_name'],
        'video_dimensions': [stream['width'], stream['height']], 'duration_seconds': float(probe['format']['duration']),
        'bytes': output.stat().st_size, 'captions_text': texts,
    })
    print(f'{locale}: {stream["codec_name"]} {stream["width"]}x{stream["height"]}, {probe["format"]["duration"]}s')
(VIDEOS / 'review-reminder-media-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
