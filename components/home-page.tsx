import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { RoleCardLink } from '@/components/role-picker';
import { DashboardPreview } from '@/components/dashboard-preview';
import { Icon } from '@/components/icon';
import { baseOptions } from '@/lib/layout.shared';
import type { GuideLanguage } from '@/lib/guide-language';
import { roleName, roles } from '@/lib/roles';
import { source } from '@/lib/source';
import topics from '@/content/guide-topics.json';

type Copy = Record<GuideLanguage, string>;

const summaries: Record<(typeof roles)[number]['code'], Copy> = {
  ADMIN: { en: 'Oversee tenants, partners, financial health and platform operations.', ar: 'تابع المتاجر والشركاء والوضع المالي وعمليات المنصة.' },
  TENANT: { en: 'Run your store, approve vendors, manage orders and configure commerce.', ar: 'أدر متجرك، واعتمد البائعين، وتابع الطلبات، واضبط إعدادات البيع.' },
  VENDOR: { en: 'Choose a workspace, maintain products, fulfill orders and track earnings.', ar: 'اختر مساحة العمل، وحدّث المنتجات، ونفّذ الطلبات، وتابع الأرباح.' },
  CUSTOMER: { en: 'Discover products, pay once, follow parcels and manage your account.', ar: 'تصفّح المنتجات، وادفع مرة واحدة، وتابع الشحنات، وأدر حسابك.' },
};

const journeys: { label: Copy; path: string }[] = [
  { label: { en: 'From cart to invoice to delivery', ar: 'التسوق والشراء والتنفيذ' }, path: 'workflows/commerce' },
  { label: { en: 'Payments, refunds and vendor payouts', ar: 'مسار الدفع والاسترداد ومستحقات البائع' }, path: 'workflows/money' },
  { label: { en: 'Ownership and access boundaries', ar: 'نموذج العمل وملكية البيانات' }, path: 'business' },
  { label: { en: 'Dashboard coverage and evidence', ar: 'تغطية الشاشات وحدود التحقق' }, path: 'coverage' },
];

const copy = {
  en: {
    kicker: 'CartJoin client guide',
    title: 'Business rules and dashboard guides for CartJoin',
    description: 'Step-by-step instructions, order flows and real screenshots for platform admins, store teams, vendors and customers.',
    start: 'Start with the basics',
    other: { label: 'اقرأ بالعربية', href: '/ar', lang: 'ar' as const },
    rolesTitle: 'Find the guide for your role',
    openHandbook: 'Open the handbook',
    journeyTitle: 'How a purchase moves through CartJoin',
    journeyDescription: 'One checkout creates one invoice, with separate orders for the vendors who fulfill it.',
    featuresTitle: 'What each feature does',
    featuresDescription: 'Each guide covers the feature’s purpose, the steps to use it and the rules that apply.',
    explore: (count: number) => `Browse all ${count} feature guides`,
    footer: 'Screenshots come from demo accounts. Figures are illustrative.',
    separator: ' · ',
  },
  ar: {
    kicker: 'دليل عملاء كارت جوين',
    title: 'قواعد العمل وأدلة لوحات التحكم في كارت جوين',
    description: 'خطوات الاستخدام ومسارات الطلب وصور حقيقية من النظام لمسؤولي المنصة وفرق المتاجر والبائعين والعملاء.',
    start: 'ابدأ من الأساسيات',
    other: { label: 'Read in English', href: '/en', lang: 'en' as const },
    rolesTitle: 'اختر دليل دورك',
    openHandbook: 'افتح الدليل',
    journeyTitle: 'كيف تنتقل عملية الشراء في كارت جوين',
    journeyDescription: 'عملية دفع واحدة تُنشئ فاتورة واحدة، مع طلبات منفصلة لكل بائع يتولى التنفيذ.',
    featuresTitle: 'ما تفعله كل ميزة',
    featuresDescription: 'يشرح كل دليل الغرض من الميزة وخطوات استخدامها والقواعد التي تنطبق عليها.',
    explore: (count: number) => `تصفّح أدلة الميزات (${count})`,
    footer: 'الصور مأخوذة من حسابات تجريبية، والأرقام للتوضيح فقط.',
    separator: '، ',
  },
} satisfies Record<GuideLanguage, unknown>;

export function HomePage({ lang }: { lang: GuideLanguage }) {
  const t = copy[lang];
  const features = source.getPages().filter((page) => page.slugs[0] === lang && page.slugs[1] === 'features');
  const featureTitle = new Map(features.map((page) => [page.slugs[2], page.data.title.split(lang === 'ar' ? '،' : ',')[0]]));
  const featureCount = features.filter((page) => page.slugs[2]).length;

  return (
    <HomeLayout {...baseOptions(lang)}>
      <main className="guide-home" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <header className="guide-hero" data-enter>
          <div className="hero-copy">
            <p className="section-kicker">{t.kicker}</p>
            <h1>{t.title}</h1>
            <p className="hero-description">{t.description}</p>
            <div className="hero-actions">
              <Link href={`/${lang}/start`} className="guide-button is-primary is-large">
                {t.start} <Icon name="arrow-right" />
              </Link>
              <Link href={t.other.href} hrefLang={t.other.lang} lang={t.other.lang} dir={t.other.lang === 'ar' ? 'rtl' : 'ltr'} className="guide-button is-large">
                {t.other.label}
              </Link>
            </div>
          </div>
          <DashboardPreview lang={lang} />
        </header>

        <section className="home-section" aria-labelledby="roles-title">
          <h2 id="roles-title">{t.rolesTitle}</h2>
          <div className="role-grid">
            {roles.map((role) => (
              <RoleCardLink key={role.code} code={role.code} href={`/${lang}/roles/${role.slug}`} className="guide-card role-card">
                <h3>{roleName(role.code, lang)}</h3>
                <p>{summaries[role.code][lang]}</p>
                <span className="role-card-footer">{t.openHandbook}<Icon name="arrow-right" /></span>
              </RoleCardLink>
            ))}
          </div>
        </section>

        <section className="home-section journey-strip" aria-labelledby="journey-title">
          <div>
            <h2 id="journey-title">{t.journeyTitle}</h2>
            <p className="section-description">{t.journeyDescription}</p>
          </div>
          <div className="journey-links">
            {journeys.map(({ label, path }) => (
              <Link key={path} href={`/${lang}/${path}`}><span>{label[lang]}</span><Icon name="arrow-right" /></Link>
            ))}
          </div>
        </section>

        <section className="home-section" aria-labelledby="features-title">
          <h2 id="features-title">{t.featuresTitle}</h2>
          <p className="section-description">{t.featuresDescription}</p>
          <div className="topic-grid">
            {topics.map((topic) => (
              <Link key={topic.title.en} href={`/${lang}/features?role=ALL#topic-${topic.features[0]}`} className="guide-card topic-card">
                <span className="guide-card-title"><h3>{topic.title[lang]}</h3><Icon name="arrow-right" /></span>
                <p>{topic.features.slice(0, 3).map((id) => featureTitle.get(id)).filter(Boolean).join(t.separator)}</p>
              </Link>
            ))}
          </div>
          <Link className="guide-link home-library-link" href={`/${lang}/features?role=ALL`}>
            {t.explore(featureCount)} <Icon name="arrow-right" />
          </Link>
        </section>

        <footer className="home-footer"><span>{t.footer}</span></footer>
      </main>
    </HomeLayout>
  );
}
