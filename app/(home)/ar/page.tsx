import type { Metadata } from 'next';
import { HomePage } from '@/components/home-page';

export const metadata: Metadata = {
  title: 'دليل عملاء كارت جوين',
  description: 'قواعد العمل ومسارات الطلب وأدلة لوحات التحكم في كارت جوين لمسؤولي المنصة وفرق المتاجر والبائعين والعملاء.',
};

export default function ArabicHome() {
  return <HomePage lang="ar" />;
}
