import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RoleCardLink } from '@/components/role-picker';
import { roles } from '@/lib/roles';
import { source } from '@/lib/source';
import { DashboardPreview } from '@/components/dashboard-preview';
import topics from '@/content/guide-topics.json';

const summaries = [
  'Oversee tenants, partners, financial health and platform operations',
  'Run your store, approve vendors, manage orders and configure commerce',
  'Choose a workspace, maintain products, fulfill orders and track earnings',
  'Discover products, pay once, follow parcels and manage your account',
];

const journeys = [
  ['Shop → invoice → delivery', '/en/workflows/commerce'],
  ['Payment → refund → payout', '/en/workflows/money'],
  ['Ownership and access boundaries', '/en/business'],
  ['Dashboard coverage and evidence', '/en/coverage'],
];

export default function Home() {
  const features = source.getPages().filter((page) => page.slugs[0] === 'en' && page.slugs[1] === 'features');

  return (
    <main className="guide-home">
      <header className="guide-hero">
        <div className="hero-copy">
          <p className="section-kicker">CartJoin operating guide</p>
          <h1>Know the system.<br />Run your part.</h1>
          <p className="hero-description">Business rules, order flows and dashboard instructions for platform admins, store teams, vendors and customers.</p>
          <p className="hero-arabic" lang="ar" dir="rtl">تعرف على مهامك في كارت جوين، وتابع الشراء من السلة إلى التسليم</p>
          <div className="hero-actions">
            <Link href="/en/start" className="guide-button is-primary">Read in English <ArrowRight size={16} strokeWidth={1.5} aria-hidden /></Link>
            <Link href="/ar/start" className="guide-button" lang="ar" dir="rtl">اقرأ بالعربية <ArrowRight size={16} strokeWidth={1.5} className="directional-icon" aria-hidden /></Link>
          </div>
        </div>

        <DashboardPreview />
      </header>

      <section className="home-section" aria-labelledby="roles-title">
        <p className="section-kicker"><span>01</span> Choose your workspace</p>
        <h2 id="roles-title">Start with your role</h2>
        <div className="role-grid">
          {roles.map((role, index) => (
            <RoleCardLink key={role.code} code={role.code} href={`/en/roles/${role.slug}`} className="role-card">
              <span className="card-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{role.name.split(' · ')[0]}</h3>
              <p>{summaries[index]}</p>
              <span className="role-card-footer"><bdi lang="ar" dir="rtl">{role.name.split(' · ')[1]}</bdi><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></span>
            </RoleCardLink>
          ))}
        </div>
      </section>

      <section className="home-section journey-strip" aria-labelledby="journey-title">
        <div><p className="section-kicker"><span>02</span> Follow the business</p><h2 id="journey-title">One purchase.<br />Connected teams.</h2><p className="section-description">One checkout creates one invoice, with separate orders for the vendors who fulfill it.</p></div>
        <div className="journey-links">
          {journeys.map(([label, href]) => <Link key={href} href={href}><span>{label}</span><ArrowRight size={16} strokeWidth={1.5} aria-hidden /></Link>)}
        </div>
      </section>

      <section className="home-section" aria-labelledby="features-title">
        <p className="section-kicker"><span>03</span> Feature library</p>
        <h2 id="features-title">Know what each feature does</h2>
        <p className="section-description">Find its purpose, the steps to use it, and the rules that apply.</p>
        <div className="topic-grid">
          {topics.map((topic, index) => <Link key={topic.title.en} href={`/en/features?role=ALL#topic-${topic.features[0]}`} className="topic-card"><span className="topic-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{topic.title.en}</h3><p>{topic.features.slice(0, 3).map((id) => features.find((page) => page.slugs[2] === id)?.data.title.split(',')[0]).join(' · ')}</p></div><ArrowRight size={18} strokeWidth={1.5} aria-hidden /></Link>)}
        </div>
        <Link className="home-library-link" href="/en/features?role=ALL">Explore all {features.filter((p) => p.slugs[2]).length} capabilities <ArrowRight size={16} strokeWidth={1.5} aria-hidden /></Link>
      </section>
      <footer className="home-footer"><span>English / <bdi lang="ar" dir="rtl">العربية</bdi></span><span>Source-reviewed 17 November 2026</span><span>System screenshots use demo data</span></footer>
    </main>
  );
}
