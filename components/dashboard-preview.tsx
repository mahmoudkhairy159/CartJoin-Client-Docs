'use client';

import { useState } from 'react';
import { RoleCardLink } from '@/components/role-picker';
import { ArrowRight } from 'lucide-react';
import { basePath } from '@/lib/shared';

const previews = [
  { role: 'admin', label: 'Platform', title: 'See the whole marketplace', description: 'Review tenants, orders, financial records and platform operations.', image: 'admin-screen-dashboards.jpg' },
  { role: 'tenant', label: 'Store', title: 'Operate one storefront', description: 'Manage catalog, vendors, orders and the rules of your store.', image: 'tenant-screen-dashboards.jpg' },
  { role: 'vendor', label: 'Vendor', title: 'Work in your approved workspace', description: 'Maintain your products, fulfill your orders and follow your earnings.', image: 'vendor-screen-dashboards.jpg' },
  { role: 'customer', label: 'Customer', title: 'Follow your purchases', description: 'One account for invoices, parcels, returns, credit and support.', image: 'customer-screen-dashboards.jpg' },
];

export function DashboardPreview() {
  const [selected, setSelected] = useState(0);
  const preview = previews[selected];
  return <section className="dashboard-preview" aria-label="Explore the four CartJoin dashboards">
    <div className="preview-tabs" role="group" aria-label="Preview a dashboard">{previews.map((item, index) => <button key={item.role} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.label}</button>)}</div>
    <div className="preview-image"><img src={`${basePath}/screenshots/${preview.image}`} alt={`${preview.label} dashboard captured from the updated CartJoin frontend`} width={1265} height={712} /></div>
    <div className="preview-caption" aria-live="polite"><div><strong>{preview.title}</strong><p>{preview.description}</p></div><RoleCardLink code={preview.role.toUpperCase() as 'ADMIN' | 'TENANT' | 'VENDOR' | 'CUSTOMER'} href={`/en/roles/${preview.role}`}><span className="sr-only">Open the {preview.label} handbook</span><ArrowRight size={18} strokeWidth={1.5} /></RoleCardLink></div>
  </section>;
}
