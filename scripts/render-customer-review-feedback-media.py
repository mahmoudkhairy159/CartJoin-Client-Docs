"""Render two truthful, captioned 24-second customer feedback screenshot tours.

Inputs are eight final root CUA JPEGs. No generated UI or audio is introduced.
Only customer-review-feedback PNG, MP4, VTT and manifest files are written.
"""
from datetime import date, datetime, timezone
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT.parent / 'CartJoin-Backend/.capture-runtime'
SHOTS, VIDEOS = ROOT / 'public/screenshots', ROOT / 'public/videos'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--preview-origin', required=True, help='Actual root CUA local Storefront origin, without a path')
parser.add_argument('--capture-date', required=True, type=date.fromisoformat, help='Confirmed Cairo capture date, YYYY-MM-DD')
args = parser.parse_args()
FFMPEG, FFPROBE = shutil.which('ffmpeg'), shutil.which('ffprobe')
if not FFMPEG or not FFPROBE:
    raise SystemExit('ffmpeg and ffprobe must be available on PATH')

CHAPTERS = [
    ('allowed', '/account/profile', 'Purchase-feedback SMS permission is separate for this store and channel. Permission alone does not send an invitation.', 'إذن الرسائل النصية لتقييم المشتريات مستقل لهذا المتجر والقناة. الإذن وحده لا يرسل دعوة.'),
    ('withdrawn', '/account/profile', 'Withdraw only purchase-feedback SMS. Other message choices remain independent.', 'اسحب إذن الرسائل النصية لتقييم المشتريات فقط. تبقى اختيارات الرسائل الأخرى مستقلة.'),
    ('inbox', '/account/notifications', 'Read the recorded invitation. Its original message language may differ from the current interface.', 'اقرأ الدعوة المسجلة. قد تختلف لغة الرسالة الأصلية عن لغة الواجهة الحالية.'),
    ('read', '/account/notifications', 'Mark the invitation as read. This saved inbox state does not prove external SMS delivery.', 'ضع علامة مقروء على الدعوة. لا تثبت حالة صندوق الإشعارات المحفوظة تسليم رسالة نصية خارجية.'),
]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

raw_frames = {locale: [RAW / f'customer-review-feedback-{locale}-{key}.jpg' for key, _, _, _ in CHAPTERS] for locale in ('en', 'ar')}
raw_hashes = {}
for frames in raw_frames.values():
    sizes = set()
    for frame in frames:
        if not frame.is_file():
            raise FileNotFoundError(frame)
        with Image.open(frame) as capture:
            capture.load()
            sizes.add(capture.size)
        raw_hashes[frame] = digest(frame)
    if len(sizes) != 1:
        raise ValueError('Four customer frames in each language must share the actual viewport')

manifest = {
    'capture_date': args.capture_date.isoformat(), 'capture_timezone': 'Africa/Cairo',
    'kind': 'guided-screenshot-clips',
    'mechanism': 'Actual root CUA JPEG pixels preserved in PNG files, then rendered as four six-second still chapters with localized WebVTT captions; not continuous recording and no audio.',
    'environment': 'Synthetic customer data in an isolated local Storefront preview. No live external provider or deployment acceptance.',
    'privacy': 'Only controlled synthetic customer data appears. No password, OTP, access token or private provider evidence is published.',
    'message_language': 'The existing invitation retains English content from the customer preference at send time, including when the current interface is Arabic. Captions explain this without pretending the invitation was translated.',
    'acceptance': 'Root verified the invitation body in both interface languages and explicitly marked it read. Read status persisted after reload. Permission withdrawal affects only the chosen store, purpose and channel.',
    'limits': 'Saving purchase-feedback permission does not send a message. In-app availability or read state does not prove external SMS delivery, review submission, an order or revenue.',
    'script': 'scripts/render-customer-review-feedback-media.py',
    'script_sha256': digest(Path(__file__)),
    'entries': [],
}
owned = [manifest['script'], 'public/videos/customer-review-feedback-media-manifest.json']
origin = args.preview_origin.rstrip('/')
for locale, originals in raw_frames.items():
    frames, frame_records = [], []
    for original, chapter in zip(originals, CHAPTERS):
        frame = SHOTS / original.with_suffix('.webp').name
        with Image.open(original) as capture:
            capture.load()
            original_pixels = (capture.mode, capture.size, capture.tobytes())
            capture.save(frame, format='WEBP', quality=86, method=4)
        with Image.open(frame) as saved:
            if (saved.mode, saved.size, saved.tobytes()) != original_pixels:
                raise ValueError(f'PNG pixels differ from reviewed capture: {frame}')
            dimensions = list(saved.size)
        if digest(original) != raw_hashes[original]:
            raise ValueError(f'Raw screenshot changed during rendering: {original}')
        relative = frame.relative_to(ROOT).as_posix()
        frames.append(frame)
        owned.append(relative)
        frame_records.append({'path': relative, 'url': origin + chapter[1], 'ui_locale': locale,
            'raw_artifact': original.name, 'raw_sha256': raw_hashes[original], 'png_sha256': digest(frame),
            'raw_artifact_updated_at': datetime.fromtimestamp(original.stat().st_mtime, timezone.utc).isoformat(),
            'dimensions': dimensions, 'pixels_preserved': True})
    output = VIDEOS / f'customer-review-feedback-{locale}-tour.mp4'
    command = [FFMPEG, '-v', 'error']
    for frame in frames:
        command += ['-loop', '1', '-framerate', '12', '-t', '6', '-i', str(frame)]
    graph = ''.join(f'[{i}:v]' for i in range(4)) + 'concat=n=4:v=1:a=0,pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white,format=yuv420p[v]'
    command += ['-filter_complex', graph, '-map', '[v]', '-r', '12', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', '-an', '-t', '24', '-y', str(output)]
    subprocess.run(command, check=True)
    texts = [chapter[2 if locale == 'en' else 3] for chapter in CHAPTERS]
    captions = VIDEOS / f'customer-review-feedback-{locale}.vtt'
    captions.write_text('WEBVTT\n\n' + '\n\n'.join(f'00:00:{i * 6:02}.000 --> 00:00:{(i + 1) * 6:02}.000\n{text}' for i, text in enumerate(texts)) + '\n', encoding='utf-8')
    probe = json.loads(subprocess.check_output([FFPROBE, '-v', 'error', '-show_entries', 'format=duration:stream=codec_name,codec_type,width,height', '-of', 'json', str(output)], text=True))
    streams = probe['streams']
    if len(streams) != 1 or streams[0]['codec_type'] != 'video' or streams[0]['codec_name'] != 'h264' or abs(float(probe['format']['duration']) - 24) > 0.01:
        raise ValueError('Expected one silent H264 video stream lasting exactly 24 seconds')
    stream = streams[0]
    owned += [output.relative_to(ROOT).as_posix(), captions.relative_to(ROOT).as_posix()]
    manifest['entries'].append({'id': f'customer-review-feedback-{locale}', 'locale': locale, 'role': 'CUSTOMER',
        'preview_origin': origin, 'frames': frame_records, 'poster': frames[0].relative_to(ROOT).as_posix(),
        'video': output.relative_to(ROOT).as_posix(), 'video_sha256': digest(output), 'captions': captions.relative_to(ROOT).as_posix(),
        'captions_sha256': digest(captions), 'codec': stream['codec_name'], 'video_dimensions': [stream['width'], stream['height']],
        'duration_seconds': float(probe['format']['duration']), 'audio_streams': 0, 'bytes': output.stat().st_size, 'captions_text': texts})
    print(f'{locale}: {stream["codec_name"]} {stream["width"]}x{stream["height"]}, {probe["format"]["duration"]}s, audio streams 0')
manifest['owned_files'] = owned
(VIDEOS / 'customer-review-feedback-media-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
