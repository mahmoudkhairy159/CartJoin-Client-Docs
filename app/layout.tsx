import './global.css';

import { basePath } from '@/lib/shared';
import { RoleProvider } from '@/components/role-picker';
import { GuideProvider } from '@/components/guide-provider';
import { roles } from '@/lib/roles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'CartJoin · Client Guide', template: '%s · CartJoin Guide' },
  description: 'English and Arabic business workflows, feature rules and dashboard guides for CartJoin.',
};



export default function Layout({ children }: LayoutProps<'/'>) {
  const roleCodes = JSON.stringify(roles.map((role) => role.code));
  const roleInit = `(function(){try{var codes=${roleCodes};var query=new URLSearchParams(location.search).get('role');var value=query&&query.toUpperCase();if(value==='ALL')value='';else if(!codes.includes(value)){value=(localStorage.getItem('guide-role')||'').toUpperCase();if(!codes.includes(value))value='';}document.documentElement.dataset.guideRole=value||'all';}catch(e){document.documentElement.dataset.guideRole='all';}})();`;
  const languageInit = `(function(){var path=location.pathname;var base=${JSON.stringify(basePath)};if(base&&path.startsWith(base))path=path.slice(base.length);var ar=/^\\/ar(?:\\/|$)/.test(path);document.documentElement.lang=ar?'ar':'en';document.documentElement.dir=ar?'rtl':'ltr';})();`;
  return (
    <html lang="en"  suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageInit + roleInit }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <GuideProvider>
          <RoleProvider>{children}</RoleProvider>
        </GuideProvider>
      </body>
    </html>
  );
}
