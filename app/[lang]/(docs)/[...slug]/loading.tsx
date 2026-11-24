'use client';

import { usePathname } from 'next/navigation';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import { AppSkeleton } from '@/components/app-skeleton';
import { guideLanguage } from '@/lib/guide-language';

export default function ArticleLoading() {
  const arabic = guideLanguage(usePathname()) === 'ar';
  return (
    <DocsPage toc={[]} className="guide-article" lang={arabic ? 'ar' : 'en'} dir={arabic ? 'rtl' : 'ltr'}>
      <div aria-busy="true">
        <header className="guide-page-heading guide-article-skeleton">
          <AppSkeleton kind="text" className="guide-skeleton-eyebrow"
            label={arabic ? 'جارٍ تحميل الصفحة' : 'Loading page'} />
          <AppSkeleton kind="text" className="guide-skeleton-title" />
          <AppSkeleton kind="text" repeat={2} />
          <AppSkeleton kind="form" columns={3} />
        </header>
        <DocsBody>
          <AppSkeleton kind="text" className="guide-article-skeleton-body" repeat={5} />
        </DocsBody>
      </div>
    </DocsPage>
  );
}
