import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import type { DocsSearchPage } from '@/lib/docs-search-page';
import { MAX_SEARCH_PAGE_SIZE, SEARCH_PAGE_SIZE } from '@/lib/docs-search-page';
import type { SortedResult } from 'fumadocs-core/search';

const MAX_SEARCH_HITS = 1500;

const search = createFromSource(source, {
  buildIndex: (page) => ({
    id: page.url,
    url: page.url,
    title: page.data.title,
    description: page.data.description,
    structuredData: page.data.structuredData,
    tag: page.slugs[0],
  }),
});

function positiveInteger(raw: string | null, fallback: number): number {
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get('query')?.trim().slice(0, 150);
  const locale = params.get('locale') === 'ar' ? 'ar' : 'en';
  const perPage = Math.min(MAX_SEARCH_PAGE_SIZE, positiveInteger(params.get('per_page'), SEARCH_PAGE_SIZE));
  const page = positiveInteger(params.get('page'), 1);
  const results = query ? await search.search(query, { limit: MAX_SEARCH_HITS, tag: locale }) : [];

  // Start a new result group at the document title so its matching headings,
  // body snippets and table rows stay together when the page changes.
  const groups: SortedResult[][] = [];
  for (const hit of results) {
    if (hit.type === 'page') groups.push([hit]);
    else groups.at(-1)?.push(hit);
  }
  const offset = (page - 1) * perPage;
  const data = groups.slice(offset, offset + perPage);
  const payload: DocsSearchPage = {
    data,
    pagination: {
      mode: 'offset', per_page: perPage, current_page: page,
      last_page: Math.max(1, Math.ceil(groups.length / perPage)), total: groups.length,
      from: data.length ? offset + 1 : null, to: data.length ? offset + data.length : null,
      next_cursor: null, prev_cursor: null,
    },
  };

  return Response.json(payload);
}
