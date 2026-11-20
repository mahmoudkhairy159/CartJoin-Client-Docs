'use client';

import { Icon } from '@/components/icon';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { guideLanguage } from '@/lib/guide-language';
import { focusRing, roleListLabel, roleName, roles as allRoles } from '@/lib/roles';
import { useGuideRole } from '@/components/role-picker';

export function PageAudience({ roles = [] }: { roles?: string[] }) {
  const { role } = useGuideRole();
  const lang = guideLanguage(usePathname());
  const arabic = lang === 'ar';
  const applies = roles.length === 0 || (role ? roles.includes(role) : true);
  const forEveryone = roles.length === 0 || roles.length === allRoles.length;

  return (
    <div className="guide-audience not-prose">
      <div className="guide-audience-line">
        <span className="guide-audience-for">{arabic ? 'لمن هذا الدليل' : 'For'}</span>
        {forEveryone ? (
          <span className="guide-audience-all">{arabic ? 'كل الأدوار' : 'all roles'}</span>
        ) : (
          <ul className="guide-audience-roles">
            {roles.map((code) => (
              <li
                key={code}
                aria-current={code === role ? 'true' : undefined}
                className={
                  code === role ? 'guide-audience-role is-current' : 'guide-audience-role'
                }
              >
                <bdi>{roleName(code, lang)}</bdi>
              </li>
            ))}
          </ul>
        )}
      </div>
      {role && !applies && (
        <p className="guide-audience-notice">
          <Icon name="information" />
          <span>
            {arabic
              ? `هذه الصفحة ليست ضمن دليل ${roleName(role, lang)}. ظهرت لأنك فتحت رابطها مباشرةً.`
              : `This page is outside the ${roleName(role, lang)} guide. You opened it through a direct link.`}
          </span>
        </p>
      )}
    </div>
  );
}

type SectionTarget = {
  id: string;
  heading: HTMLElement;
  headingLabel: string;
  nodes: HTMLElement[];
  roles: string[];
};

function headingDepth(element: Element): number | undefined {
  const match = /^H([1-6])$/.exec(element.tagName);
  return match ? Number(match[1]) : undefined;
}

export function RoleSections({ sectionRoles }: { sectionRoles?: Record<string, string[]> }) {
  const anchor = useRef<HTMLDivElement>(null);
  const { role } = useGuideRole();
  const lang = guideLanguage(usePathname());
  const arabic = lang === 'ar';
  const [targets, setTargets] = useState<SectionTarget[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [resolvedKey, setResolvedKey] = useState('');
  const sectionRolesKey = JSON.stringify(sectionRoles ?? {});
  const viewKey = `${role ?? 'all'}:${sectionRolesKey}`;

  useEffect(() => {
    const container = anchor.current?.parentElement;
    delete container?.dataset.guideSectionsReady;
    if (!container || !sectionRoles) {
      setTargets([]);
      setResolvedKey(viewKey);
      return;
    }

    const headings = Array.from(container.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    const nextTargets = Object.entries(sectionRoles).flatMap(([id, allowedRoles]): SectionTarget[] => {
      const heading = headings.find((candidate) => candidate.id === id);
      const depth = heading ? headingDepth(heading) : undefined;
      if (!heading || !depth) return [];

      const nodes: HTMLElement[] = [];
      let sibling = heading.nextElementSibling;
      while (sibling) {
        const siblingDepth = headingDepth(sibling);
        if (siblingDepth && siblingDepth <= depth) break;
        if (sibling instanceof HTMLElement) nodes.push(sibling);
        sibling = sibling.nextElementSibling;
      }
      return [{ id, heading, headingLabel: heading.textContent?.trim() || id, nodes, roles: allowedRoles }];
    });

    setTargets(nextTargets);
    setCollapsed(
      Object.fromEntries(
        nextTargets.map((target) => [
          target.id,
          Boolean(role && target.roles.length > 0 && !target.roles.includes(role)),
        ]),
      ),
    );
    setShowAll(false);
    setResolvedKey(viewKey);
  }, [viewKey]);

  useEffect(() => {
    const container = anchor.current?.parentElement;
    if (!container || resolvedKey !== viewKey) return;

    for (const element of container.querySelectorAll<HTMLElement>('[data-guide-section-hidden]')) {
      element.hidden = false;
      delete element.dataset.guideSectionHidden;
    }
    if (!showAll) {
      for (const target of targets) {
        // A tagged subsection overrides a tagged parent, so processing in
        // document order lets the more specific section restore its range.
        target.heading.hidden = false;
        delete target.heading.dataset.guideSectionHidden;
        for (const element of target.nodes) {
          element.hidden = Boolean(collapsed[target.id]);
          if (element.hidden) element.dataset.guideSectionHidden = '';
          else delete element.dataset.guideSectionHidden;
        }
      }
    }
    container.dataset.guideSectionsReady = '';

    return () => {
      delete container.dataset.guideSectionsReady;
      for (const element of container.querySelectorAll<HTMLElement>('[data-guide-section-hidden]')) {
        element.hidden = false;
        delete element.dataset.guideSectionHidden;
      }
    };
  }, [collapsed, resolvedKey, showAll, targets, viewKey]);

  useEffect(() => {
    if (resolvedKey !== viewKey || targets.length === 0) return;

    const revealHashTarget = () => {
      let id: string;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (!id) return;
      const element = document.getElementById(id);
      if (!element) return;
      const containing = targets.filter(
        (target) =>
          target.heading === element ||
          target.heading.contains(element) ||
          target.nodes.some((node) => node === element || node.contains(element)),
      );
      if (containing.length === 0) return;
      setCollapsed((value) => {
        const next = { ...value };
        for (const target of containing) next[target.id] = false;
        return next;
      });
      requestAnimationFrame(() => requestAnimationFrame(() => element.scrollIntoView()));
    };

    revealHashTarget();
    window.addEventListener('hashchange', revealHashTarget);
    return () => window.removeEventListener('hashchange', revealHashTarget);
  }, [resolvedKey, targets, viewKey]);

  if (!sectionRoles || Object.keys(sectionRoles).length === 0) return null;

  return (
    <>
      <div ref={anchor} className="not-prose guide-role-toggle-row">
        <button
          type="button"
          aria-pressed={showAll}
          onClick={() => setShowAll((value) => !value)}
          className={`guide-button ${focusRing}`}
        >
          {arabic ? 'عرض كل الأقسام' : 'Show all sections'}
        </button>
      </div>
      {targets.map((target) => {
        const visible = showAll || !collapsed[target.id];
        const action = arabic ? (visible ? 'إخفاء' : 'عرض') : (visible ? 'Hide' : 'Show');
        return createPortal(
          <span className="not-prose guide-section-role">
            <span>{arabic ? 'مخصص لـ' : 'For'} {roleListLabel(target.roles, lang)}</span>
            <button
              type="button"
              aria-expanded={visible}
              aria-label={`${action} ${arabic ? 'قسم' : 'section'} ${target.headingLabel}`}
              onClick={() => {
                setCollapsed((value) => ({ ...value, [target.id]: visible }));
                setShowAll(false);
              }}
              className={`guide-button is-ghost is-compact ${focusRing}`}
            >
              {action}
            </button>
          </span>,
          target.heading,
          target.id,
        );
      })}
    </>
  );
}

