"""Resolve guide links from MDX source paths, never from browser URL directories."""
from pathlib import Path
import posixpath
import re

ROOT = Path(__file__).resolve().parents[1] / 'content/docs'
PAGES = {p.relative_to(ROOT).as_posix()[:-4] for p in ROOT.rglob('*.mdx')}

for page in ROOT.rglob('*.mdx'):
    slug = page.relative_to(ROOT).as_posix()[:-4]
    def resolve(match):
        label, href = match.groups()
        if label.startswith('!') or href.startswith(('/', '#')) or re.match(r'[a-zA-Z][\w+.-]*:', href):
            return match.group(0)
        target, separator, fragment = href.partition('#')
        target = posixpath.normpath(posixpath.join(posixpath.dirname(slug), target))
        if target not in PAGES and target + '/index' not in PAGES:
            return match.group(0)
        target = re.sub(r'/index$', '', target)
        return label + '(/' + target + (separator + fragment if separator else '') + ')'
    text = page.read_text(encoding='utf-8')
    page.write_text(re.sub(r'(!?\[[^\]]*\])\(([^)]+)\)', resolve, text), encoding='utf-8')
