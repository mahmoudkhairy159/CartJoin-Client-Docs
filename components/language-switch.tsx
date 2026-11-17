'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { guideLanguage } from '@/lib/guide-language';

export function LanguageSwitch() {
  const pathname = usePathname();
  const arabic = guideLanguage(pathname) === 'ar';
  const pagePath = /^\/(en|ar)(?:\/|$)/.test(pathname)
    ? pathname.replace(/^\/(en|ar)(?=\/|$)/, '')
    : '/start';

  return (
    <nav className="guide-language-switch" aria-label={arabic ? 'لغة الدليل' : 'Guide language'} dir="ltr">
      <Link href={`/en${pagePath}`} hrefLang="en" lang="en" dir="ltr"
        aria-current={!arabic ? 'page' : undefined} aria-label="Read this page in English">English</Link>
      <Link href={`/ar${pagePath}`} hrefLang="ar" lang="ar" dir="rtl"
        aria-current={arabic ? 'page' : undefined} aria-label="اقرأ هذه الصفحة بالعربية">العربية</Link>
    </nav>
  );
}
