"""Render explicitly labelled guided screenshot clips from actual CUA captures.

No generated interface, narration, or simulated transaction is introduced.
Requires ffmpeg/ffprobe and Pillow; preserves the original PNG/JPEG evidence.
"""
from pathlib import Path
import argparse
from datetime import datetime, timezone
import json
import shutil
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'public/screenshots'
VIDEOS = ROOT / 'public/videos'
FFMPEG = shutil.which('ffmpeg')
FFPROBE = shutil.which('ffprobe')
if not FFMPEG or not FFPROBE:
    raise SystemExit('ffmpeg and ffprobe must be available on PATH')

GUIDES = {
    'platform-discovery': {
        'url': 'http://localhost:4304/{locale}/discover', 'role': 'CUSTOMER',
        'suffixes': ['products', 'stores', 'sellers', 'handoff'],
        'en': ['Only selected, approved and currently eligible offers appear.', 'Choose a participating store. Check its current price and purchase terms there.', 'Seller consent applies within the chosen store. Checkouts and balances stay separate.', 'The chosen store shows current product options and pricing. No payment is made in this tour.'],
        'ar': ['لا تظهر إلا العروض المختارة والمعتمدة والمؤهلة حاليًا.', 'اختر المتجر وراجع السعر الحالي وشروط الشراء داخله.', 'تخص موافقة البائع المتجر المختار. تبقى المدفوعات والأرصدة مستقلة.', 'يعرض المتجر المختار الخيارات والسعر الحالي. لا تنفذ الجولة أي دفع.'],
    },
    'tenant-discovery': {
        'url': 'http://localhost:4302/discovery', 'role': 'TENANT',
        'suffixes': ['', 'catalog', 'offers'],
        'en': ['Choose whether your store may appear. New domains require a fresh review.', 'Find a product and select it before submitting. This tour stops before submission.', 'Store and offer approval are separate. Withdraw only the offers you choose.'],
        'ar': ['اختر مشاركة متجرك. يتطلب تغيير النطاق مراجعة جديدة.', 'ابحث عن المنتج وحدده قبل الإرسال. تتوقف الجولة قبل الإرسال.', 'اعتماد المتجر والعرض مستقلان. يمكنك سحب العروض التي تختارها فقط.'],
    },
    'vendor-discovery': {
        'url': 'http://localhost:4303/discovery', 'role': 'VENDOR',
        'suffixes': ['', 'offers'],
        'en': ['Your choice applies only in the selected approved store workspace.', 'The store selects offers and the platform reviews them. Your consent alone never publishes.'],
        'ar': ['يخص اختيارك مساحة المتجر المعتمدة المحددة فقط.', 'يختار المتجر العروض وتراجعها المنصة. لا تنشر موافقتك وحدها أي عرض.'],
    },
    'admin-discovery': {
        'url': 'http://localhost:4301/discovery', 'role': 'ADMIN',
        'suffixes': ['', 'review', 'offer'],
        'en': ['Review explicit store requests and selected offers as separate decisions.', 'Verify the store domain and record a reason. This tour does not submit a decision.', 'Inspect current product content. Changed source requires a fresh review before approval.'],
        'ar': ['راجع طلب المتجر والعروض المختارة كقرارات مستقلة.', 'تحقق من نطاق المتجر وسجل السبب. لا تحفظ هذه الجولة قرارًا.', 'افحص المحتوى الحالي. يتطلب تغير المصدر مراجعة جديدة قبل الاعتماد.'],
    },
    'platform-purchases': {
        'url': 'http://localhost:4304/{locale}/account', 'role': 'CUSTOMER',
        'suffixes': ['account', '', 'orders'],
        'en': ['Use your existing customer account. The summary belongs only to the signed-in owner.', 'Read order, payment and delivery separately. Amounts keep their original purchase currency.', 'The owning store handles details, returns and support. There is no shared store balance.'],
        'ar': ['استخدم حساب العميل الحالي. يخص الملخص صاحب الحساب المسجل دخوله فقط.', 'اقرأ الطلب والدفع والتوصيل بصورة مستقلة. تبقى المبالغ بعملة الشراء الأصلية.', 'يدير المتجر المالك التفاصيل والإرجاع والدعم. لا يوجد رصيد مشترك بين المتاجر.'],
    },
}

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--guide', action='append', choices=GUIDES, help='Render only this guide in both languages; preserve other manifest entries.')
arguments = parser.parse_args()
selected = set(arguments.guide or GUIDES)

def stamp(seconds: float) -> str:
    milliseconds = round(seconds * 1000)
    return f'{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02}.{milliseconds % 1000:03}'

manifest = {
    'capture_date': '2026-11-18',
    'kind': 'guided-screenshot-clips',
    'mechanism': 'Actual CUA full-viewport screenshots, rendered as chapter stills with WebVTT captions; not continuous video and no audio.',
    'environment': 'Seeded local development preview; no live commercial/provider acceptance.',
    'privacy': 'No passwords, tokens, customer addresses, private operational notes, provider documents or payment credentials. Visible names/orders/review reasons are synthetic demo data.',
    'entries': [],
    'retained_superseded_evidence': [
        {'path': f'public/videos/platform-discovery-{locale}.webm', 'kind': 'early live-browser frame recording with Playwright CLI recorder; retained provenance, not used by current guides', 'note': 'Captured before handoff URL correction; subsequent actions and final guide frames use CUA only.'}
        for locale in ('en', 'ar')
    ],
}
manifest_path = VIDEOS / 'discovery-media-manifest.json'
if arguments.guide and manifest_path.is_file():
    previous = json.loads(manifest_path.read_text(encoding='utf-8'))
    manifest['entries'] = [entry for entry in previous.get('entries', [])
        if not any(entry['id'] == f'{key}-{locale}' for key in selected for locale in ('en', 'ar'))]
for key, guide in GUIDES.items():
    if key not in selected:
        continue
    for locale in ('en', 'ar'):
        frames = [SHOTS / f'{key}-{locale}{"-"+suffix if suffix else ""}.webp' for suffix in guide['suffixes']]
        for path in frames:
            if not path.is_file():
                raise FileNotFoundError(path)
            if Image.open(path).size != (1265, 712):
                raise ValueError(f'Unexpected original viewport: {path}')
        segment = 6 if len(frames) == 2 else 5
        output = VIDEOS / f'{key}-{locale}.mp4'
        arguments = [FFMPEG, '-v', 'error']
        for path in frames:
            arguments += ['-loop', '1', '-framerate', '12', '-t', str(segment), '-i', str(path)]
        sequence = ''.join(f'[{i}:v]' for i in range(len(frames)))
        sequence += f'concat=n={len(frames)}:v=1:a=0,pad=ceil(iw/2)*2:ceil(ih/2)*2:color=white,format=yuv420p[v]'
        arguments += ['-filter_complex', sequence, '-map', '[v]', '-r', '12', '-c:v', 'libx264',
            '-crf', '22', '-preset', 'medium', '-movflags', '+faststart', '-an', '-t', str(segment * len(frames)), '-y', str(output)]
        subprocess.run(arguments, check=True)
        captions = 'WEBVTT\n\n' + '\n\n'.join(f'{stamp(i*segment)} --> {stamp((i+1)*segment)}\n{text}' for i, text in enumerate(guide[locale])) + '\n'
        output.with_suffix('.vtt').write_text(captions, encoding='utf-8')
        probe = json.loads(subprocess.check_output([FFPROBE, '-v', 'error', '-show_entries', 'format=duration:stream=width,height', '-of', 'json', str(output)], text=True))
        manifest['entries'].append({'id': f'{key}-{locale}', 'locale': locale, 'role': guide['role'],
            'url': guide['url'].format(locale=locale), 'frames': [str(path.relative_to(ROOT)).replace('\\', '/') for path in frames],
            'frame_urls': [(f'http://localhost:4300/product/iphone-15-pro-256gb?lang={locale}' if suffix == 'handoff' else guide['url'].format(locale=locale)) for suffix in guide['suffixes']],
            'frame_provenance': [{'path': str(path.relative_to(ROOT)).replace('\\', '/'),
                'artifact_updated_at': datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(),
                'mechanism': ('Root CUA final acceptance capture of independently approved store directory, after local origin guard fix; actual JPEG screenshot converted losslessly into a PNG container.'
                    if key == 'platform-discovery' and suffix == 'stores'
                    else 'Actual CUA full-viewport screenshot; seeded local development preview.')}
                for path, suffix in zip(frames, guide['suffixes'])],
            'source_dimensions': [1265, 712], 'video': str(output.relative_to(ROOT)).replace('\\', '/'),
            'captions': str(output.with_suffix('.vtt').relative_to(ROOT)).replace('\\', '/'),
            'video_dimensions': [probe['streams'][0]['width'], probe['streams'][0]['height']],
            'duration_seconds': float(probe['format']['duration']), 'bytes': output.stat().st_size,
            'captions_text': guide[locale]})
        print(f'{key}-{locale}: {probe["format"]["duration"]}s, {output.stat().st_size} bytes')
manifest['entries'].sort(key=lambda entry: (list(GUIDES).index(entry['id'].rsplit('-', 1)[0]), entry['locale'] != 'en'))
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
