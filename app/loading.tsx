// A static reading skeleton: no spinner, no animation, the same in both themes.
export default function Loading() {
  return (
    <div role="status" className="guide-skeleton">
      <span className="guide-skeleton-title" aria-hidden />
      <span className="guide-skeleton-line" aria-hidden />
      <span className="guide-skeleton-line" aria-hidden />
      <span className="guide-skeleton-line is-short" aria-hidden />
      <span className="sr-only">
        Loading page · <bdi lang="ar" dir="rtl">جارٍ تحميل الصفحة</bdi>
      </span>
    </div>
  );
}
