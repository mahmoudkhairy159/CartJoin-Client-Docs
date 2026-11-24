import { AppSkeleton } from '@/components/app-skeleton';

export default function GuideLoading() {
  return (
    <main className="guide-home" aria-busy="true">
      <div className="guide-hero">
        <div className="guide-hero-skeleton">
          <AppSkeleton kind="text" repeat={4} label="Loading page · جارٍ تحميل الصفحة" />
          <AppSkeleton kind="form" columns={2} />
        </div>
        <AppSkeleton kind="card" className="guide-home-preview-skeleton" />
      </div>
    </main>
  );
}
