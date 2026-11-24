import '../global.css';

import { RoleProvider } from '@/components/role-picker';
import { GuideProvider } from '@/components/guide-provider';
import { roles } from '@/lib/roles';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: { default: 'CartJoin · Client Guide', template: '%s · CartJoin Guide' },
  description: 'English and Arabic business workflows, feature rules and dashboard guides for CartJoin.',
};

// Matches the canvas role in each theme (stone-100 / stone-1000).
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2efec' },
    { media: '(prefers-color-scheme: dark)', color: '#090808' },
  ],
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (lang !== 'en' && lang !== 'ar') notFound();
  const roleCodes = JSON.stringify(roles.map((role) => role.code));
  const roleInit = `(function(){try{var codes=${roleCodes};var query=new URLSearchParams(location.search).get('role');var value=query&&query.toUpperCase();if(value==='ALL')value='';else if(!codes.includes(value)){value=(localStorage.getItem('guide-role')||'').toUpperCase();if(!codes.includes(value))value='';}document.documentElement.dataset.guideRole=value||'all';}catch(e){document.documentElement.dataset.guideRole='all';}})();`;
  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: roleInit }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <GuideProvider>
          <RoleProvider>{children}</RoleProvider>
        </GuideProvider>
      </body>
    </html>
  );
}
