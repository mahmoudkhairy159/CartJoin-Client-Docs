import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import type { GuideLanguage } from './guide-language';
import { appName, basePath } from './shared';
import { LanguageSwitch } from '@/components/language-switch';

export function baseOptions(lang: GuideLanguage = 'en'): BaseLayoutProps {
  const arabic = lang === 'ar';
  return {
    nav: { title: <><img src={`${basePath}/cartjoin-mark.svg`} alt="" width={24} height={24} /><bdi>{appName}</bdi></> },
    links: [
      { text: arabic ? 'ابدأ هنا' : 'Start here', url: `/${lang}/start` },
      { text: arabic ? 'جولات الشرح' : 'Screen tours', url: `/${lang}/learn` },
      { text: arabic ? 'سير العمل' : 'Workflows', url: `/${lang}/workflows` },
      { type: 'custom', children: <LanguageSwitch /> },
    ],
  };
}
