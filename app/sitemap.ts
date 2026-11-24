import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { articleUrls, docsUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().flatMap((page) => {
    const [lang, ...slug] = page.slugs;
    if (!slug.length || (lang !== 'en' && lang !== 'ar')) return [];
    return [{ url: docsUrl(page.url), alternates: { languages: articleUrls(slug) } }];
  });
}
