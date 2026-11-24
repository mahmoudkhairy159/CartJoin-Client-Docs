import { basePath } from './shared';
import { source } from './source';

export function docsUrl(path: string): string {
  const origin = process.env.DOCS_PUBLIC_ORIGIN || 'https://platform-cart-join.mahmoud-khairy.com';
  return new URL(basePath + path, origin).href;
}

export function articleUrls(slug: string[]): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const lang of ['en', 'ar']) {
    const page = source.getPage([lang, ...slug]);
    if (page) languages[lang] = docsUrl(page.url);
  }
  return languages;
}
