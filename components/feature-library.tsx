'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Search } from 'lucide-react';
import features from '@/content/feature-library.json';
import topics from '@/content/guide-topics.json';
import { guideLanguage } from '@/lib/guide-language';
import { roles, roleName } from '@/lib/roles';
import { useGuideRole } from '@/components/role-picker';

export function FeatureLibrary() {
  const lang = guideLanguage(usePathname());
  const ar = lang === 'ar';
  const { role, setRole } = useGuideRole();
  const [query, setQuery] = useState('');
  const visible = features.filter((feature) => (!role || feature.roles.includes(role)) &&
    `${feature.title[lang]} ${feature.description[lang]}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <div className="feature-library not-prose">
    <div className="library-filter">
      <label className="library-search"><Search size={18} strokeWidth={1.5} aria-hidden /><span className="sr-only">{ar ? 'ابحث في الأدلة' : 'Search guides'}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? 'ما الذي تريد فعله؟' : 'What would you like to do?'} /></label>
      <div className="library-roles" role="group" aria-label={ar ? 'اختر دورك' : 'Choose your role'}>
        <button type="button" aria-pressed={!role} onClick={() => setRole(null)}>{ar ? 'كل الأدوار' : 'All roles'}</button>
        {roles.map((item) => <button key={item.code} type="button" aria-pressed={role === item.code} onClick={() => setRole(item.code)}>{roleName(item.code, lang)}</button>)}
      </div>
      <p className="library-count" aria-live="polite">{ar ? `${visible.length} دليلاً · الشرح والصور حسب الدور` : `${visible.length} guides · Instructions and screens by role`}</p>
    </div>
    {topics.map((topic) => {
      const items = visible.filter((item) => topic.features.includes(item.id));
      return items.length > 0 && <section id={`topic-${topic.features[0]}`} key={topic.title.en} className="library-topic"><h2>{topic.title[lang]}</h2><div className="library-grid">{items.map((feature) => <Link key={feature.id} href={`/${lang}/features/${feature.id}`} className="library-card"><span className="library-card-title">{feature.title[lang]}<ArrowUpRight size={16} strokeWidth={1.5} className="directional-icon" aria-hidden /></span><p>{feature.description[lang]}</p><span className="library-card-meta">{feature.screens > 0 ? (ar ? 'صور توضيحية وفيديو قصير' : 'Screen walkthrough + short video') : (ar ? 'دليل الخطوات والقيود' : 'Steps and business rules')}</span></Link>)}</div></section>;
    })}
    {visible.length === 0 && <div className="library-empty"><h2>{ar ? 'لا توجد أدلة تطابق بحثك' : 'No matching guides'}</h2><p>{ar ? 'جرّب كلمات بحث أخرى أو اعرض أدلة كل الأدوار.' : 'Try different search terms or show guides for all roles.'}</p><button type="button" onClick={() => { setQuery(''); setRole(null); }}>{ar ? 'عرض كل الأدلة' : 'Show all guides'}</button></div>}
  </div>;
}
