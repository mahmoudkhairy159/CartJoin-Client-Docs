'use client';

import { Select } from '@base-ui/react/select';
import { Icon } from '@/components/icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { focusRing, isRoleCode, roleName, roles, type RoleCode } from '@/lib/roles';
import { guideLanguage } from '@/lib/guide-language';

const storageKey = 'guide-role';
const allRolesValue = 'all';

type RoleContextValue = {
  role: RoleCode | null;
  setRole: (role: RoleCode | null) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

function readBrowserRole(): RoleCode | null {
  const queryRole = new URLSearchParams(window.location.search).get('role')?.toUpperCase();
  if (queryRole === 'ALL') return null;
  if (queryRole && isRoleCode(queryRole)) return queryRole;
  try {
    const stored = localStorage.getItem(storageKey)?.toUpperCase();
    return stored && isRoleCode(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleCode | null>(null);
  const pathname = usePathname();

  const setRole = useCallback((nextRole: RoleCode | null) => {
    setRoleState(nextRole);
    document.documentElement.dataset.guideRole = nextRole ?? 'all';
    try {
      if (nextRole) localStorage.setItem(storageKey, nextRole);
      else localStorage.removeItem(storageKey);
    } catch {
      // Storage can be disabled (for example in a private browsing policy).
    }
  }, []);

  useEffect(() => {
    const nextRole = readBrowserRole();
    setRoleState(nextRole);
    document.documentElement.dataset.guideRole = nextRole ?? 'all';
  }, [pathname]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const nextRole = readBrowserRole();
      setRoleState(nextRole);
      document.documentElement.dataset.guideRole = nextRole ?? 'all';
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(() => ({ role, setRole }), [role, setRole]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useGuideRole(): RoleContextValue {
  const value = useContext(RoleContext);
  if (!value) throw new Error('useGuideRole must be used inside RoleProvider');
  return value;
}

function RoleOption({ value, label }: { value: string; label: string }) {
  return (
    <Select.Item value={value} className="guide-role-option">
      <Select.ItemText>{label}</Select.ItemText>
      <Select.ItemIndicator className="guide-role-option-check">
        <Icon name="check" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}

export function RolePicker() {
  const { role, setRole } = useGuideRole();
  const lang = guideLanguage(usePathname());
  const allLabel = lang === 'ar' ? 'كل الأدوار' : 'All roles';
  const pickerItems = [
    { value: allRolesValue, label: allLabel },
    ...roles.map((option) => ({ value: option.code, label: roleName(option.code, lang) })),
  ];

  return (
    <Select.Root
      items={pickerItems}
      value={role ?? allRolesValue}
      onValueChange={(next) => setRole(next === allRolesValue ? null : (next as RoleCode))}
    >
      <div className="guide-role-field">
        <Select.Label className="guide-role-label">
          {lang === 'ar' ? 'تصفّح الأدلة حسب دورك' : 'Browse guides by role'}
        </Select.Label>
        <Select.Trigger className={`guide-role-trigger ${focusRing}`}>
          <Select.Value className="truncate" />
          <Select.Icon className="guide-role-chevron">
            <Icon name="expand-up-down" />
          </Select.Icon>
        </Select.Trigger>
      </div>
      <Select.Portal>
        <Select.Positioner alignItemWithTrigger={false} sideOffset={8} className="z-50 outline-none">
          <Select.Popup className="guide-role-popup">
            <Select.List>
              <RoleOption value={allRolesValue} label={allLabel} />
              <Select.Separator className="guide-role-separator" />
              {roles.map((option) => (
                <RoleOption key={option.code} value={option.code} label={roleName(option.code, lang)} />
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export function RoleCardLink({
  code,
  href,
  className,
  children,
}: {
  code: RoleCode;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { setRole } = useGuideRole();
  return (
    <Link href={href} onClick={() => setRole(code)} className={className}>
      {children}
    </Link>
  );
}
