'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';
import { lazy, useEffect } from 'react';
import { arabicInterface, englishInterface, guideLanguage } from '@/lib/guide-language';

const GuideSearchDialog = lazy(() => import('./guide-search-dialog'));

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const lang = guideLanguage(usePathname());

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <RootProvider
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      i18n={{ locale: lang, translations: lang === 'ar' ? arabicInterface : englishInterface }}
      search={{ SearchDialog: GuideSearchDialog }}
    >
      {children}
    </RootProvider>
  );
}
