'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Icon } from '@/components/icon';
import { AppImage } from '@/components/app-image';
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
          <AppImage src={src} alt={alt} width={dimensions?.width} height={dimensions?.height} sizes="(max-width: 768px) 100vw, 800px" />
          <span className="guide-button screenshot-enlarge" aria-hidden><Icon name="fullscreen" />{arabic ? 'تكبير' : 'Enlarge'}</span>
        </Dialog.Trigger>
        <figcaption>{alt}</figcaption>
      </figure>
      <Dialog.Portal><Dialog.Backdrop className="tour-modal-backdrop" /><Dialog.Popup className="tour-modal" lang={lang} dir={arabic ? 'rtl' : 'ltr'}>
        <div className="tour-modal-heading"><Dialog.Title>{alt}</Dialog.Title><Dialog.Close className="guide-button is-icon" aria-label={arabic ? 'إغلاق الصورة' : 'Close screenshot'}><Icon name="close" size={20} /></Dialog.Close></div>
        <Dialog.Description className="tour-modal-description">{arabic ? 'صورة من النظام التجريبي. يمكنك التمرير لفحص التفاصيل' : 'Captured from the demo system. Scroll to inspect the details'}</Dialog.Description>
        <div className="tour-modal-image-scroll" dir="ltr"><AppImage className="screenshot-full" src={src} alt={alt} width={dimensions?.width} height={dimensions?.height} sizes={dimensions ? `${dimensions.width}px` : '100vw'} priority /></div>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>
  );
}
