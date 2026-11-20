'use client';

import { Suspense, use, useDeferredValue, useId, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { AppSkeleton } from '@/components/app-skeleton';

export function Mermaid({ chart }: { chart: string }) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const placeholder = <AppSkeleton kind="chart" label="Loading diagram · جارٍ تحميل الرسم" />;
  return (
    <div className="guide-mermaid-frame">
      {isClient
        ? <Suspense fallback={placeholder}><MermaidContent chart={chart} /></Suspense>
        : placeholder}
    </div>
  );
}

const cache = new Map<string, Promise<unknown>>();

// Mermaid needs literal colours, so read the resolved CartJoin roles for the active theme.
function tokenThemeVariables() {
  const style = getComputedStyle(document.documentElement);
  const token = (name: string) => style.getPropertyValue(`--cj-${name}`).trim();
  return {
    darkMode: document.documentElement.classList.contains('dark'),
    background: token('surface'),
    fontFamily: token('font-sans'),
    fontSize: '14px',
    textColor: token('text'),
    primaryColor: token('accent-soft'),
    primaryTextColor: token('ink'),
    primaryBorderColor: token('accent'),
    secondaryColor: token('sunken'),
    secondaryTextColor: token('ink'),
    secondaryBorderColor: token('border'),
    tertiaryColor: token('surface'),
    tertiaryTextColor: token('ink'),
    tertiaryBorderColor: token('border'),
    lineColor: token('muted'),
    mainBkg: token('accent-soft'),
    nodeBorder: token('accent'),
    clusterBkg: token('sunken'),
    clusterBorder: token('border'),
    edgeLabelBackground: token('surface'),
    titleColor: token('ink'),
    noteBkgColor: token('sunken'),
    noteTextColor: token('ink'),
    noteBorderColor: token('border'),
    actorBkg: token('accent-soft'),
    actorBorder: token('accent'),
    actorTextColor: token('ink'),
    signalColor: token('text'),
    signalTextColor: token('ink'),
    labelBoxBkgColor: token('sunken'),
    labelBoxBorderColor: token('border'),
    labelTextColor: token('ink'),
    activationBkgColor: token('sunken'),
    activationBorderColor: token('accent'),
  };
}

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const renderedTheme = useDeferredValue(resolvedTheme);
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: 'margin: 1.5rem auto 0;',
    theme: 'base',
    themeVariables: tokenThemeVariables(),
    suppressErrorRendering: true,
  });

  // A diagram that does not parse must not take the whole page down with it.
  const result = use(
    cachePromise(`${chart}-${renderedTheme}`, () => {
      return mermaid.render(id, chart.replaceAll('\\n', '\n')).catch((error: unknown) => {
        console.error('Mermaid diagram failed to render', error);
        return null;
      });
    }),
  );

  if (!result) {
    return (
      <pre className="guide-mermaid-fallback">
        <code>{chart}</code>
      </pre>
    );
  }

  const { svg, bindFunctions } = result;

  return (
    <div
      className="guide-mermaid"
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
