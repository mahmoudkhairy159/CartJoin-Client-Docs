'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Maximize2, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { guideLanguage } from '@/lib/guide-language';
import screenshotSizes from '@/content/screenshot-sizes.json';

const sizes: Record<string, { width: number; height: number }> = screenshotSizes;

export function SystemScreenshot({ src, alt }: { src: string; alt: string }) {
  const lang = guideLanguage(usePathname());
  const arabic = lang === 'ar';
  const dimensions = sizes[src.split('/').at(-1) ?? ''];
  return (
    <Dialog.Root>
      <figure className="system-screenshot not-prose">
        <Dialog.Trigger className="screenshot-trigger" aria-label={`${arabic ? 'تكبير' : 'Enlarge'}: ${alt}`}>
          <img src={src} alt={alt} width={dimensions?.width} height={dimensions?.height} loading="lazy" />
          <span className="screenshot-enlarge"><Maximize2 size={16} strokeWidth={1.5} aria-hidden />{arabic ? 'افتح الصورة' : 'Open screenshot'}</span>
        </Dialog.Trigger>
        <figcaption>{alt}</figcaption>
      </figure>
      <Dialog.Portal><Dialog.Backdrop className="tour-modal-backdrop" /><Dialog.Popup className="tour-modal" lang={lang} dir={arabic ? 'rtl' : 'ltr'}>
        <div className="tour-modal-heading"><Dialog.Title>{alt}</Dialog.Title><Dialog.Close className="tour-close" aria-label={arabic ? 'إغلاق الصورة' : 'Close screenshot'}><X size={18} strokeWidth={1.5} /></Dialog.Close></div>
        <Dialog.Description className="tour-modal-description">{arabic ? 'صورة من النظام التجريبي. يمكنك التمرير لفحص التفاصيل' : 'Captured from the demo system. Scroll to inspect the details'}</Dialog.Description>
        <div className="tour-modal-image-scroll"><img className="screenshot-full" src={src} alt={alt} width={dimensions?.width} height={dimensions?.height} /></div>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>
  );
}
