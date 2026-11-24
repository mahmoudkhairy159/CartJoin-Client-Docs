import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HomePage } from '@/components/home-page';
import { docsUrl } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== 'en' && lang !== 'ar') notFound();
  return {
    ...(lang === 'ar' && {
      title: 'دليل عملاء كارت جوين',
      description: 'قواعد العمل ومسارات الطلب وأدلة لوحات التحكم في كارت جوين لمسؤولي المنصة وفرق المتاجر والبائعين والعملاء.',
    }),
    alternates: { canonical: docsUrl('/' + lang), languages: { en: docsUrl('/en'), ar: docsUrl('/ar') } },
  };
}

export default async function GuideHome({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (lang !== 'en' && lang !== 'ar') notFound();
  return <HomePage lang={lang} />;
}
