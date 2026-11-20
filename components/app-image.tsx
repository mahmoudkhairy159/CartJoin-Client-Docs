'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, type CSSProperties, type ImgHTMLAttributes } from 'react';
import { basePath } from '@/lib/shared';

const fallback = `${basePath}/cartjoin-mark.svg`;

type AppImageProps = Omit<ImageProps, 'alt' | 'onError' | 'fill' | 'height' | 'width' | 'priority' | 'loading' | 'placeholder'> & {
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fallbackSrc?: string;
};

export function AppImage({
  src, alt = '', width, height, priority = false, fallbackSrc = fallback, sizes, style, ...props
}: AppImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps['src']>();
  const source = failedSource === src ? fallbackSrc : src;
  const address = typeof source === 'string' ? source : undefined;
  const nativeSource = address !== undefined && (!address.startsWith('/') || address.startsWith('//') || /\.svg(?:[?#]|$)/i.test(address));
  const intrinsicWidth = width ?? (typeof src === 'object' ? ('default' in src ? src.default.width : src.width) : 1440);
  const intrinsicHeight = height ?? (typeof src === 'object' ? ('default' in src ? src.default.height : src.height) : 900);
  const frame: CSSProperties = {
    aspectRatio: `${intrinsicWidth} / ${intrinsicHeight}`,
    backgroundColor: 'var(--guide-letterbox, transparent)',
    ...style,
  };

  return <Image
    {...props}
    src={source}
    alt={alt}
    width={intrinsicWidth}
    height={intrinsicHeight}
    sizes={sizes}
    quality={86}
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : undefined}
    decoding="async"
    unoptimized={nativeSource}
    style={frame}
    onError={() => { if (src !== source || address === fallbackSrc) return; setFailedSource(src); }}
  />;
}

type MdxImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: ImageProps['src'] | Blob;
};

export function MdxImage({ src, width, height, alt, title, className }: MdxImageProps) {
  if (!src || (typeof src === 'object' && !('src' in src) && !('default' in src))) return null;
  return <AppImage
    src={src}
    alt={alt}
    width={Number(width) || undefined}
    height={Number(height) || undefined}
    title={title}
    className={['rounded-lg', className].filter(Boolean).join(' ')}
    sizes="(max-width: 768px) 100vw, 800px"
  />;
}
