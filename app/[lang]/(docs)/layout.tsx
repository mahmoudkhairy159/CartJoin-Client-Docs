import { source } from '@/lib/source';
import { RoleDocsLayout } from '@/components/role-docs-layout';
import { compactSeparators } from '@/lib/guide-navigation';
import type { Node } from 'fumadocs-core/page-tree';
import { notFound } from 'next/navigation';

function languageNodes(nodes: Node[], prefix: string): Node[] {
  return compactSeparators(nodes.flatMap((node): Node[] => {
    if (node.type === 'separator') return [node];
    if (node.type === 'page') return node.url.startsWith(prefix) ? [node] : [];
    const children = languageNodes(node.children, prefix);
    const index = node.index?.url.startsWith(prefix) ? node.index : undefined;
    return children.length || index ? [{ ...node, children, index }] : [];
  }));
}

export default async function ArticleLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (lang !== 'en' && lang !== 'ar') notFound();
  const prefix = `/${lang}/`;
  const tree = source.getPageTree();
  const childrenForLanguage = languageNodes(tree.children, prefix).flatMap((node) =>
    node.type === 'folder' && node.name === (lang === 'ar' ? 'العربية' : 'English') ? node.children : [node],
  );
  const pageRoles = Object.fromEntries(source.getPages()
    .filter((page) => page.url.startsWith(prefix) && page.data.roles?.length)
    .map((page) => [page.url, page.data.roles]));
  return (
    <RoleDocsLayout tree={{ ...tree, $id: `${tree.$id}:${lang}`, children: childrenForLanguage }} lang={lang} pageRoles={pageRoles}>
      {children}
    </RoleDocsLayout>
  );
}
