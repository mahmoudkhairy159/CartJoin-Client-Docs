'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { guideLanguage } from '@/lib/guide-language';

const languagePrefix = /^\/(en|ar)(?=\/|$)/;

export function LanguageSwitch() {
  const pathname = usePathname();
  const arabic = guideLanguage(pathname) === 'ar';
  // Guide pages keep their path across languages; the two home pages are `/` and `/ar`.
  const pagePath = pathname.replace(languagePrefix, '');
  const onHome = pagePath === '' || pagePath === '/';

  return (
    <nav className="guide-language-switch" aria-label={arabic ? 'لغة الدليل' : 'Guide language'} dir="ltr">
      <Link href={onHome ? '/' : `/en${pagePath}`} hrefLang="en" lang="en" dir="ltr" className="guide-choice"
        aria-current={!arabic ? 'page' : undefined} aria-label="Read this page in English">English</Link>
      <Link href={onHome ? '/ar' : `/ar${pagePath}`} hrefLang="ar" lang="ar" dir="rtl" className="guide-choice"
        aria-current={arabic ? 'page' : undefined} aria-label="اقرأ هذه الصفحة بالعربية">العربية</Link>
    </nav>
  );
}
