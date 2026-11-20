'use client';

import { useCallback, useRef, useState } from 'react';
import { experimental_useSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  type SearchDialogProps,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from 'fumadocs-ui/components/dialog/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { searchCache } from '@/lib/search-cache';
import { basePath } from '@/lib/shared';
import { SEARCH_PAGE_SIZE, type DocsSearchPage } from '@/lib/docs-search-page';
import { AppSkeleton } from '@/components/app-skeleton';

export default function GuideSearchDialog(props: Pick<SearchDialogProps, 'open' | 'onOpenChange' | 'dialogHandle'>) {
  const { locale } = useI18n();
  const [requested, setRequested] = useState<{ query: string; page: number } | null>(null);
  const [resolved, setResolved] = useState<{ query: string; pagination: DocsSearchPage['pagination'] } | null>(null);
  const requestId = useRef(0);
  const run = useCallback(async (raw: string) => {
    const id = ++requestId.current;
    const query = raw.trim();
    const page = requested?.query === query ? requested.page : 1;
    const params = new URLSearchParams({ query, locale: locale ?? 'en', page: String(page), per_page: String(SEARCH_PAGE_SIZE) });
    const key = `${basePath}/api/search?${params}`;
    let data = searchCache.get(key);
    if (!data) {
      const response = await fetch(key);
      if (!response.ok) throw new Error(`Search failed (${response.status})`);
      data = await response.json() as DocsSearchPage;
      searchCache.set(key, data);
    }
    if (id === requestId.current) setResolved({ query, pagination: data.pagination });
    return data.data.flat();
  }, [locale, requested]);
  const search = experimental_useSearch(run);
  const query = search.search.trim();
  const page = resolved?.query === query ? resolved.pagination : undefined;
  const arabic = locale === 'ar';

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <div aria-busy={search.isLoading} className="guide-search-results">
          {search.isLoading && !search.data
            ? <AppSkeleton kind="table-row" className="guide-search-skeleton" repeat={5} columns={1}
                label={arabic ? 'جارٍ البحث في الأدلة' : 'Searching guides'} />
            : <SearchDialogList />}
        </div>
        {page && page.last_page > 1 && (
          <SearchDialogFooter>
            <button type="button" className="guide-button is-ghost" disabled={search.isLoading || page.current_page <= 1}
              onClick={() => setRequested({ query, page: page.current_page - 1 })}>
              {arabic ? 'السابق' : 'Previous'}
            </button>
            <span aria-live="polite">{page.current_page} / {page.last_page}</span>
            <button type="button" className="guide-button is-ghost" disabled={search.isLoading || page.current_page >= page.last_page}
              onClick={() => setRequested({ query, page: page.current_page + 1 })}>
              {arabic ? 'التالي' : 'Next'}
            </button>
          </SearchDialogFooter>
        )}
      </SearchDialogContent>
    </SearchDialog>
  );
}
