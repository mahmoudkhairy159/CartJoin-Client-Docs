'use client';

import { useState } from 'react';
import { RoleCardLink } from '@/components/role-picker';
import { Icon } from '@/components/icon';
import type { GuideLanguage } from '@/lib/guide-language';
import type { RoleCode } from '@/lib/roles';
import { basePath } from '@/lib/shared';

type Copy = Record<GuideLanguage, string>;
type Preview = { role: RoleCode; slug: string; label: Copy; title: Copy; description: Copy; alt: Copy; image: string };

const previews: Preview[] = [
  {
    role: 'ADMIN', slug: 'admin', image: 'admin-screen-dashboards.jpg',
    label: { en: 'Platform', ar: 'المنصة' },
    title: { en: 'See the whole marketplace', ar: 'تابع السوق بالكامل' },
    description: { en: 'Review tenants, orders, financial records and platform operations.', ar: 'راجع المتاجر والطلبات والسجلات المالية وعمليات المنصة.' },
    alt: { en: 'Platform admin overview: paid revenue, orders placed, new customers and failed payments for today, with shortcuts to reports and catalog screens.', ar: 'نظرة عامة في لوحة مسؤول المنصة: الإيرادات المدفوعة والطلبات والعملاء الجدد والمدفوعات الفاشلة لليوم، مع اختصارات للتقارير وشاشات الكتالوج.' },
  },
  {
    role: 'TENANT', slug: 'tenant', image: 'tenant-screen-dashboards.jpg',
    label: { en: 'Store', ar: 'المتجر' },
    title: { en: 'Operate one storefront', ar: 'أدر متجرًا واحدًا' },
    description: { en: 'Manage catalog, vendors, orders and the rules of your store.', ar: 'أدر الكتالوج والبائعين والطلبات وقواعد متجرك.' },
    alt: { en: 'Store admin overview: paid revenue, orders placed, average order value and new customers, above the revenue chart and order pipeline.', ar: 'نظرة عامة في لوحة مسؤول المتجر: الإيرادات المدفوعة والطلبات ومتوسط قيمة الطلب والعملاء الجدد، فوق مخطط الإيرادات ومسار الطلبات.' },
  },
  {
    role: 'VENDOR', slug: 'vendor', image: 'vendor-screen-dashboards.jpg',
    label: { en: 'Vendor', ar: 'البائع' },
    title: { en: 'Work in your approved workspace', ar: 'اعمل في مساحة العمل المعتمدة لك' },
    description: { en: 'Maintain your products, fulfill your orders and follow your earnings.', ar: 'حدّث منتجاتك، ونفّذ طلباتك، وتابع أرباحك.' },
    alt: { en: 'Vendor overview: sales, open orders, low-stock items and products in review, above the sales-over-time chart.', ar: 'نظرة عامة في لوحة البائع: المبيعات والطلبات المفتوحة والمنتجات منخفضة المخزون والمنتجات قيد المراجعة، فوق مخطط المبيعات.' },
  },
  {
    role: 'CUSTOMER', slug: 'customer', image: 'customer-screen-dashboards.jpg',
    label: { en: 'Customer', ar: 'العميل' },
    title: { en: 'Follow your purchases', ar: 'تابع مشترياتك' },
    description: { en: 'One account for invoices, parcels, returns, credit and support.', ar: 'حساب واحد للفواتير والشحنات والمرتجعات والرصيد والدعم.' },
    alt: { en: 'Customer account overview: wallet, loyalty points and open orders, with parcel tracking below and account links on the side.', ar: 'نظرة عامة على حساب العميل: المحفظة ونقاط الولاء والطلبات المفتوحة، مع تتبع الشحنات أسفلها وروابط الحساب على الجانب.' },
  },
];

export function DashboardPreview({ lang }: { lang: GuideLanguage }) {
  const [selected, setSelected] = useState(0);
  const preview = previews[selected];
  const arabic = lang === 'ar';
  return (
    <section className="dashboard-preview" aria-label={arabic ? 'معاينة لوحات كارت جوين الأربع' : 'Preview the four CartJoin dashboards'}>
      <div className="preview-tabs" role="group" aria-label={arabic ? 'اختر لوحة للمعاينة' : 'Choose a dashboard to preview'}>
        {previews.map((item, index) => (
          <button key={item.role} type="button" className="guide-choice" aria-pressed={selected === index} onClick={() => setSelected(index)}>
            {item.label[lang]}
          </button>
        ))}
      </div>
      <div className="preview-image" dir="ltr">
        <img src={`${basePath}/screenshots/${preview.image}`} alt={preview.alt[lang]} width={1265} height={712} />
      </div>
      <div className="preview-caption" aria-live="polite">
        <div>
          <strong>{preview.title[lang]}</strong>
          <p>{preview.description[lang]}</p>
        </div>
        <RoleCardLink code={preview.role} href={`/${lang}/roles/${preview.slug}`} className="guide-button is-icon">
          <span className="sr-only">{arabic ? `افتح دليل ${preview.label.ar}` : `Open the ${preview.label.en} handbook`}</span>
          <Icon name="arrow-right" size={20} />
        </RoleCardLink>
      </div>
    </section>
  );
}
