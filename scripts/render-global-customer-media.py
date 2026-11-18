"""Render two captioned 25-second tours from five real root CUA screenshots.

Only global-customer files are written. There is no generated interface or audio.
Run after the ten reviewed, secret-free PNG frames have been captured.
"""
from datetime import datetime, timezone
from pathlib import Path
import json
import shutil
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'public/screenshots'
VIDEOS = ROOT / 'public/videos'
FFMPEG, FFPROBE = shutil.which('ffmpeg'), shutil.which('ffprobe')
if not FFMPEG or not FFPROBE:
    raise SystemExit('ffmpeg and ffprobe must be available on PATH')

CHAPTERS = [
    ('signup', 'Create one customer identity with your phone. Email is not required.', 'أنشئ هوية عميل واحدة بهاتفك. البريد الإلكتروني غير مطلوب.'),
    ('proof', 'Use the delivered code before expiry. Never share it.', 'استخدم الرمز المرسل قبل انتهاء صلاحيته ولا تشاركه.'),
    ('account', 'Your new account has no purchases yet. Store balances remain separate.', 'حسابك الجديد بلا مشتريات بعد وتبقى أرصدة المتاجر مستقلة.'),
    ('recovery', 'Recover an existing account using its phone or email.', 'استعد حسابًا قائمًا باستخدام هاتفه أو بريده الإلكتروني.'),
    ('ack', 'A neutral acknowledgement does not confirm account existence. After reset, sign in again.', 'لا يؤكد الإقرار العام وجود الحساب. سجل الدخول مجددًا بعد إعادة التعيين.'),
]
manifest = {
    'kind': 'guided-screenshot-clips',
    'mechanism': 'Five actual root CUA screenshot chapters per language, five seconds each, with WebVTT captions; not continuous recording and no audio. Original CUA JPEG pixels were preserved when converted to PNG containers.',
    'environment': 'Isolated tested local Platform preview on localhost:4316; approved test message adapter. No live provider or deployment acceptance.',
    'privacy': 'Frames contain only synthetic demonstration data. No OTP, password, token or test outbox appears in the guide.',
    'acceptance': 'Root verified completed signup, central verified identity with null signup origin, zero store memberships and zero orders, sign-out and a fresh neutral recovery acknowledgement. The recovery tour stops before password reset; no live provider acceptance is claimed.',
    'entries': [],
}
# Validate every input before writing any output; never silently substitute a frame.
all_frames = {locale: [SHOTS / f'global-customer-{locale}-{key}.png' for key, _, _ in CHAPTERS] for locale in ('en', 'ar')}
for frames in all_frames.values():
    for frame in frames:
        if not frame.is_file():
            raise FileNotFoundError(frame)
    if len({Image.open(frame).size for frame in frames}) != 1:
        raise ValueError('All five frames in a language must share the actual capture viewport')

for locale, frames in all_frames.items():
    output = VIDEOS / f'global-customer-{locale}-tour.mp4'
    command = [FFMPEG, '-v', 'error']
    for frame in frames:
        command += ['-loop', '1', '-framerate', '12', '-t', '5', '-i', str(frame)]
    graph = ''.join(f'[{i}:v]' for i in range(5)) + 'concat=n=5:v=1:a=0,pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white,format=yuv420p[v]'
    command += ['-filter_complex', graph, '-map', '[v]', '-r', '12', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', '-an', '-t', '25', '-y', str(output)]
    subprocess.run(command, check=True)
    caption_text = [chapter[1 if locale == 'en' else 2] for chapter in CHAPTERS]
    captions = VIDEOS / f'global-customer-{locale}.vtt'
    captions.write_text('WEBVTT\n\n' + '\n\n'.join(f'00:00:{i * 5:02}.000 --> 00:00:{(i + 1) * 5:02}.000\n{text}' for i, text in enumerate(caption_text)) + '\n', encoding='utf-8')
    probe = json.loads(subprocess.check_output([FFPROBE, '-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'json', str(output)], text=True))
    stream = probe['streams'][0]
    manifest['entries'].append({
        'id': f'global-customer-{locale}', 'locale': locale, 'role': 'CUSTOMER',
        'url': f'http://localhost:4316/{locale}/account',
        'frames': [{'path': frame.relative_to(ROOT).as_posix(), 'artifact_updated_at': datetime.fromtimestamp(frame.stat().st_mtime, timezone.utc).isoformat(), 'dimensions': list(Image.open(frame).size)} for frame in frames],
        'video': output.relative_to(ROOT).as_posix(), 'captions': captions.relative_to(ROOT).as_posix(),
        'poster': frames[0].relative_to(ROOT).as_posix(), 'codec': stream['codec_name'],
        'video_dimensions': [stream['width'], stream['height']], 'duration_seconds': float(probe['format']['duration']),
        'bytes': output.stat().st_size, 'captions_text': caption_text,
    })
    print(f'{locale}: {stream["codec_name"]} {stream["width"]}x{stream["height"]}, {probe["format"]["duration"]}s')
(VIDEOS / 'global-customer-media-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
