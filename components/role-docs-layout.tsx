'use client';

import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { Node, Root } from 'fumadocs-core/page-tree';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { baseOptions } from '@/lib/layout.shared';
import { RolePicker, useGuideRole } from '@/components/role-picker';
import type { RoleCode } from '@/lib/roles';
import { guideLanguage } from '@/lib/guide-language';
import { LanguageSwitch } from '@/components/language-switch';

export type PageRoleMap = Record<string, string[] | undefined>;

function languageNodes(nodes: Node[], lang: string): Node[] {
  return nodes.flatMap((node): Node[] => {
    if (node.type === 'separator') return [node];
    if (node.type === 'page') return node.url.startsWith(`/${lang}/`) ? [node] : [];
    const children = compactSeparators(languageNodes(node.children, lang));
    const index = node.index?.url.startsWith(`/${lang}/`) ? node.index : undefined;
    return children.length || index ? [{ ...node, children, index }] : [];
  });
}

function compactSeparators(nodes: Node[]): Node[] {
  const result: Node[] = [];
  let separator: Extract<Node, { type: 'separator' }> | undefined;
  for (const node of nodes) {
    if (node.type === 'separator') {
      separator = node;
      continue;
    }
    if (separator) result.push(separator);
    separator = undefined;
    result.push(node);
  }
  return result;
}

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
  pageRoles,
  children,
}: {
  tree: Root;
  pageRoles: PageRoleMap;
  children: React.ReactNode;
}) {
  const { role } = useGuideRole();
  const lang = guideLanguage(usePathname());
  const visibleTree = useMemo(() => {
    const children = languageNodes(tree.children, lang).flatMap((node) =>
      node.type === 'folder' && node.name === (lang === 'ar' ? 'العربية' : 'English') ? node.children : [node],
    );
    const localized = { ...tree, $id: `${tree.$id}:${lang}`, children };
    return role ? filterTree(localized, role, pageRoles) : localized;
  }, [pageRoles, role, tree, lang]);

  return (
    <DocsLayout tree={visibleTree} {...baseOptions(lang)} links={[]}
      sidebar={{ banner: <div className="guide-sidebar-controls"><LanguageSwitch /><RolePicker /></div> }}>
      {children}
    </DocsLayout>
  );
}

