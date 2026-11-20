import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Mermaid } from '@/components/mdx/mermaid';
import { SystemTour } from '@/components/system-tour';
import { SystemScreenshot } from '@/components/system-screenshot';
import { FeatureLibrary } from '@/components/feature-library';
import { MdxImage } from '@/components/app-image';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: MdxImage,
    Mermaid,
    SystemTour,
    SystemScreenshot,
    FeatureLibrary,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
