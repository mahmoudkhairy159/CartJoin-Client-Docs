'use client';

import { Dialog } from '@base-ui/react/dialog';
import { ArrowLeft, ArrowRight, Maximize2, Play, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import tourData from '@/content/system-tours.json';
import screenshotSizes from '@/content/screenshot-sizes.json';
import { guideLanguage } from '@/lib/guide-language';
import { basePath } from '@/lib/shared';

type Copy = { en: string; ar: string };
type Step = { image: string; focus: number[]; title: Copy; body: Copy; guide: string };
type Tour = { title: Copy; intro: Copy; video: boolean; steps: Step[]; secondsPerStep?: number; provenance?: Copy };
const tours: Record<string, Tour> = tourData;
const sizes: Record<string, { width: number; height: number }> = screenshotSizes;

export function SystemTour({ tour, compact = false, startAt = 0 }: { tour: string; compact?: boolean; startAt?: number }) {
  const data = tours[tour];
  const featureTour = tour.startsWith('feature-');
  const pathname = usePathname();
  const lang = guideLanguage(pathname);
  const arabic = lang === 'ar';
  const [selected, setSelected] = useState(() => Math.min(Math.max(startAt, 0), (data?.steps.length ?? 1) - 1));
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;
  const step = data.steps[selected];
  const stepLabel = arabic ? 'الخطوة' : 'Step';
  const onFeaturePage = pathname === `/${lang}/${step.guide}`;
  const guideHref = onFeaturePage ? `#${arabic ? 'القيود-والقرارات' : 'restrictions-and-decisions'}` : `/${lang}/${step.guide}`;
  const duration = data.steps.length * (data.secondsPerStep ?? 10);
  const src = `${basePath}/screenshots/${step.image}`;
  const dimensions = sizes[step.image];
  const focusStyle = { left: `${step.focus[0]}%`, top: `${step.focus[1]}%`, width: `${step.focus[2]}%`, height: `${step.focus[3]}%` };

  function markers() {
    return data.steps.map((item, index) => item.image === step.image && (
      <button key={index} type="button" className="tour-marker" data-active={selected === index}
        style={{ left: `${item.focus[0] + item.focus[2] / 2}%`, top: `${item.focus[1] + item.focus[3] / 2}%` }}
        aria-label={`${stepLabel} ${index + 1}: ${item.title[lang]}`} aria-pressed={selected === index}
        onClick={() => setSelected(index)}><bdi dir="ltr">{index + 1}</bdi></button>
    ));
  }

  return (
    <section id={featureTour ? 'screen-guide' : undefined} className={`system-tour not-prose${compact ? ' is-compact' : ''}${featureTour ? ' is-feature' : ''}`} aria-label={data.title[lang]}>
      <header className="tour-heading"><span className="tour-label">{arabic ? 'تعلم من شاشة فعلية' : 'Learn from the real screen'}</span><h3>{data.title[lang]}</h3><p>{data.intro[lang]}</p></header>
      <Dialog.Root open={expanded} onOpenChange={setExpanded}>
        <div className="tour-layout">
          <div className="tour-visual">
            <div className="tour-image-stage" dir="ltr">
              <button className="tour-image-button" type="button" onClick={() => setExpanded(true)} aria-label={arabic ? 'تكبير الصورة' : 'Enlarge screenshot'}>
                <img src={src} alt={data.title[lang]} width={dimensions?.width} height={dimensions?.height} loading="lazy" />
              </button>
              <div className="tour-focus" style={focusStyle} aria-hidden />
              {markers()}
            </div>
            <div className="tour-image-toolbar"><span>{arabic ? 'صورة من النظام التجريبي' : 'Demo system screenshot'}</span><button type="button" onClick={() => setExpanded(true)}><Maximize2 size={16} strokeWidth={1.5} aria-hidden />{arabic ? 'تكبير' : 'Enlarge'}</button></div>
          </div>
          <div className="tour-steps" role="group" aria-label={arabic ? 'خطوات الشرح' : 'Tour steps'}>
            {data.steps.map((item, index) => <button type="button" key={index} className="tour-step" aria-current={index === selected ? 'step' : undefined} onClick={() => setSelected(index)}>
              <span className="tour-step-number"><bdi dir="ltr">{index + 1}</bdi></span><span><strong>{item.title[lang]}</strong>{index === selected && <span className="tour-step-body">{item.body[lang]}</span>}</span>
            </button>)}
          </div>
        </div>
        <div className="tour-current" aria-live="polite"><p><strong>{step.title[lang]}</strong> {step.body[lang]}</p><Link href={guideHref}>{onFeaturePage ? (arabic ? 'راجع القيود والقرارات' : 'Review restrictions and decisions') : (arabic ? 'اقرأ الشرح والخطوات' : 'Read the steps and rules')}<ArrowRight size={16} strokeWidth={1.5} className="directional-icon" aria-hidden /></Link></div>
        <div className="tour-controls"><button type="button" disabled={selected === 0} onClick={() => setSelected(selected - 1)}><ArrowLeft size={16} strokeWidth={1.5} className="directional-icon" aria-hidden />{arabic ? 'السابق' : 'Previous'}</button><span><bdi dir="ltr">{selected + 1} / {data.steps.length}</bdi></span><button type="button" disabled={selected === data.steps.length - 1} onClick={() => setSelected(selected + 1)}>{arabic ? 'التالي' : 'Next'}<ArrowRight size={16} strokeWidth={1.5} className="directional-icon" aria-hidden /></button></div>
        <Dialog.Portal>
          <Dialog.Backdrop className="tour-modal-backdrop" />
          <Dialog.Popup className="tour-modal" lang={lang} dir={arabic ? 'rtl' : 'ltr'}>
            <div className="tour-modal-heading"><Dialog.Title>{step.title[lang]}</Dialog.Title><Dialog.Close className="tour-close" aria-label={arabic ? 'إغلاق الصورة' : 'Close screenshot'}><X size={18} strokeWidth={1.5} /></Dialog.Close></div>
            <Dialog.Description className="tour-modal-description">{step.body[lang]}</Dialog.Description>
            <div className="tour-modal-image-scroll"><div className="tour-image-stage" dir="ltr"><img src={src} alt={data.title[lang]} width={dimensions?.width} height={dimensions?.height} /><div className="tour-focus" style={focusStyle} aria-hidden />{markers()}</div></div>
            <div className="tour-controls"><button type="button" disabled={selected === 0} onClick={() => setSelected(selected - 1)}>{arabic ? 'السابق' : 'Previous'}</button><span><bdi dir="ltr">{selected + 1} / {data.steps.length}</bdi></span><button type="button" disabled={selected === data.steps.length - 1} onClick={() => setSelected(selected + 1)}>{arabic ? 'التالي' : 'Next'}</button></div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      {data.video && <details className="tour-video"><summary><Play size={16} strokeWidth={1.5} aria-hidden /><span>{arabic ? `شاهد جولة قصيرة — ${duration} ثانية` : `Watch the short tour — ${duration} seconds`}</span></summary>
        <p>{arabic ? 'جولة صامتة من صور النظام مع شرح بالعربية والإنجليزية. استخدم زر الترجمة في المشغل. هذه ليست عملية شراء أو تعديل حية.' : 'A silent screenshot tour with English and Arabic captions. Use the player’s captions control. It illustrates the interface rather than executing a live transaction.'}</p>
        <video key={tour + lang} controls playsInline preload="none" width={1280} height={720} poster={`${basePath}/videos/${tour}-poster.jpg`}>
          <source src={`${basePath}/videos/${tour}-tour.mp4`} type="video/mp4" />
          <track src={`${basePath}/videos/${tour}-ar.vtt`} kind="captions" srcLang="ar" label="العربية" default={arabic} />
          <track src={`${basePath}/videos/${tour}-en.vtt`} kind="captions" srcLang="en" label="English" default={!arabic} />
          {arabic ? 'متصفحك لا يدعم الفيديو؛ اتبع الخطوات أعلاه' : 'Your browser does not support video; follow the steps above'}
        </video>
        <details className="tour-transcript"><summary>{arabic ? 'قراءة نص الجولة' : 'Read the tour transcript'}</summary><ol>{data.steps.map((item, index) => <li key={index}><strong>{item.title[lang]}</strong><p>{item.body[lang]}</p></li>)}</ol></details>
      </details>}
      <p className="tour-provenance">{data.provenance?.[lang] ?? (arabic ? 'حسابات عرض · التقطت في 17 نوفمبر 2026 · الأرقام للتوضيح' : 'Demo accounts · Captured 17 November 2026 · Figures are illustrative')}</p>
    </section>
  );
}
