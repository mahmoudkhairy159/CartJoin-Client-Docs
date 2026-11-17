import { source } from '@/lib/source';
import { RoleDocsLayout } from '@/components/role-docs-layout';

export default function Layout({ children }: LayoutProps<'/'>) {
  const pageRoles = Object.fromEntries(source.getPages().map((page) => [page.url, page.data.roles]));
  return (
    <RoleDocsLayout tree={source.getPageTree()} pageRoles={pageRoles}>
      {children}
    </RoleDocsLayout>
  );
}
