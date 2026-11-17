export const roles = [
  {code: 'ADMIN', name: 'Platform admin · إدارة المنصة', slug: 'admin'},
  {code: 'TENANT', name: 'Tenant operator · إدارة المتجر', slug: 'tenant'},
  {code: 'VENDOR', name: 'Vendor · البائع', slug: 'vendor'},
  {code: 'CUSTOMER', name: 'Customer · العميل', slug: 'customer'},
] as const;

export type RoleCode = (typeof roles)[number]['code'];

export const focusRing = 'guide-focus';

const roleByCode = new Map<RoleCode, (typeof roles)[number]>(roles.map((role) => [role.code, role]));
const roleBySlug = new Map<string, (typeof roles)[number]>(roles.map((role) => [role.slug, role]));

export function isRoleCode(value: string): value is RoleCode {
  return roleByCode.has(value as RoleCode);
}

export function roleName(code: string, lang: 'en' | 'ar' = 'en'): string {
  const name = roleByCode.get(code as RoleCode)?.name;
  return name ? name.split(' · ')[lang === 'ar' ? 1 : 0] : code;
}

export function roleCodeFromSlug(slug: string): RoleCode | undefined {
  return roleBySlug.get(slug)?.code;
}

export function roleListLabel(codes: readonly string[], lang: 'en' | 'ar' = 'en'): string {
  if (codes.length === 0) return lang === 'ar' ? 'الجميع' : 'everyone';
  return codes.map((code) => roleName(code, lang)).join(lang === 'ar' ? '، ' : ', ');
}

