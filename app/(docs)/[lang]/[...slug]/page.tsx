import { source } from '@/lib/source';
import {
  DocsBody,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { basePath, getPageMarkdownUrl } from '@/lib/shared';
import { PageAudience, RoleSections } from '@/components/page-role-awareness';

export default async function Page(props: PageProps<'/[lang]/[...slug]'>) {
  const { lang, slug } = await props.params;
  const page = source.getPage([lang, ...slug]);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = basePath + getPageMarkdownUrl(page).url;
  const arabic = lang === 'ar';
  const feature = slug[0] === 'features' && slug.length === 2;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} className="guide-article"
      footer={{ className: 'guide-page-pagination' }}
      lang={arabic ? 'ar' : 'en'} dir={arabic ? 'rtl' : 'ltr'}>
      <header className="guide-page-heading">
        <p className="guide-doc-kind">{arabic ? (feature ? 'دليل استخدام الميزة' : 'دليل كارت جوين') : (feature ? 'Feature guide' : 'CartJoin guide')}</p>
        <DocsTitle className="guide-page-title">{page.data.title}</DocsTitle>
        <p className="guide-page-description">{page.data.description}</p>
        <div className="guide-page-meta">
          <PageAudience roles={page.data.roles} />
          <div className="guide-page-actions">
            <MarkdownCopyButton markdownUrl={markdownUrl} />
            <ViewOptionsPopover markdownUrl={markdownUrl} />
          </div>
        </div>
        {feature && <nav className="guide-page-shortcuts" aria-label={arabic ? 'انتقل داخل الدليل' : 'Jump within this guide'}>
          <a className="guide-choice" href="#screen-guide">{arabic ? 'الشاشات والفيديو' : 'Screens and video'}</a>
          <a className="guide-choice" href={arabic ? '#خطوات-الاستخدام' : '#how-to-use-it'}>{arabic ? 'الخطوات' : 'Steps'}</a>
          <a className="guide-choice" href={arabic ? '#القيود-والقرارات' : '#restrictions-and-decisions'}>{arabic ? 'القيود' : 'Rules'}</a>
          <a className="guide-choice" href={arabic ? '#تدفق-البيانات-والنتيجة' : '#data-flow-and-outcome'}>{arabic ? 'تدفق البيانات' : 'Data flow'}</a>
        </nav>}
      </header>
      {/* Every section renders server-side; a chosen role only collapses sections after hydration. */}
      <DocsBody>
        <RoleSections sectionRoles={page.data.sectionRoles} />
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams().flatMap(({ slug: [lang, ...slug] }) =>
    slug.length && (lang === 'en' || lang === 'ar') ? [{ lang, slug }] : [],
  );
}

export async function generateMetadata(props: PageProps<'/[lang]/[...slug]'>): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const page = source.getPage([lang, ...slug]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
