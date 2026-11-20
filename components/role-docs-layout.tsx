'use client';

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { useMemo } from 'react';
import { baseOptions } from '@/lib/layout.shared';
import { RolePicker, useGuideRole } from '@/components/role-picker';
import type { RoleCode } from '@/lib/roles';
import type { GuideLanguage } from '@/lib/guide-language';
import { compactSeparators } from '@/lib/guide-navigation';
import { LanguageSwitch } from '@/components/language-switch';

export type PageRoleMap = Record<string, string[] | undefined>;

function filterNodes(nodes: Node[], role: RoleCode, pageRoles: PageRoleMap): Node[] {
  const filtered = nodes.flatMap((node): Node[] => {
    if (node.type === 'separator') return [node];
    if (node.type === 'page') {
      const allowed = pageRoles[node.url];
      return !allowed || allowed.length === 0 || allowed.includes(role) ? [node] : [];
    }

    const children = filterNodes(node.children, role, pageRoles);
    const indexRoles = node.index ? pageRoles[node.index.url] : undefined;
    const index =
      node.index && (!indexRoles || indexRoles.length === 0 || indexRoles.includes(role)) ? node.index : undefined;
    if (!index && children.length === 0) return [];
    return [{ ...node, index, children }];
  });
  return compactSeparators(filtered);
}

function filterTree(tree: Root, role: RoleCode, pageRoles: PageRoleMap): Root {
  return {
    ...tree,
    // Fumadocs' TreeContextProvider memoises the tree on $id, so a filtered tree must not reuse the original's.
    $id: `${tree.$id ?? 'root'}:${role}`,
    children: filterNodes(tree.children, role, pageRoles),
    fallback: tree.fallback ? filterTree(tree.fallback, role, pageRoles) : undefined,
  };
}

export function RoleDocsLayout({
  tree,
  lang,
  pageRoles,
  children,
}: {
  tree: Root;
  lang: GuideLanguage;
  pageRoles: PageRoleMap;
  children: React.ReactNode;
}) {
  const { role } = useGuideRole();
  const visibleTree = useMemo(() => role ? filterTree(tree, role, pageRoles) : tree, [pageRoles, role, tree]);

  return (
    <DocsLayout tree={visibleTree} {...baseOptions(lang)} links={[]}
      sidebar={{ banner: <div className="guide-sidebar-controls"><LanguageSwitch /><RolePicker /></div> }}>
      {children}
    </DocsLayout>
  );
}

