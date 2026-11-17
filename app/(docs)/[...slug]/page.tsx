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

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = basePath + getPageMarkdownUrl(page).url;
  const arabic = params.slug[0] === 'ar';
  const feature = params.slug[1] === 'features' && params.slug.length === 3;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} className="guide-article"
      lang={params.slug[0] === 'ar' ? 'ar' : 'en'} dir={params.slug[0] === 'ar' ? 'rtl' : 'ltr'}>
      <header className="guide-page-heading">
        <p className="guide-doc-kind">{arabic ? (feature ? 'دليل خاصية' : 'دليل كارت جوين') : (feature ? 'Capability guide' : 'CartJoin guide')}</p>
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
          <a href="#screen-guide">{arabic ? 'الشاشات والفيديو' : 'Screens & video'}</a>
          <a href={arabic ? '#خطوات-الاستخدام' : '#how-to-use-it'}>{arabic ? 'الخطوات' : 'Steps'}</a>
          <a href={arabic ? '#القيود-والقرارات' : '#restrictions-and-decisions'}>{arabic ? 'القيود' : 'Rules'}</a>
          <a href={arabic ? '#تدفق-البيانات-والنتيجة' : '#data-flow-and-outcome'}>{arabic ? 'تدفق البيانات' : 'Data flow'}</a>
        </nav>}
      </header>
      <DocsBody className={page.data.sectionRoles ? 'role-sections-pending' : undefined}>
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
  // The guide's index page is replaced by the home page at the root.
  return source.generateParams().filter((params) => params.slug.length > 0);
}

export async function generateMetadata(props: PageProps<'/[...slug]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
