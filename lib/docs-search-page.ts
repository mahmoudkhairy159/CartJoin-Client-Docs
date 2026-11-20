import type { SortedResult } from 'fumadocs-core/search';

export const SEARCH_PAGE_SIZE = 8;
export const MAX_SEARCH_PAGE_SIZE = 20;

export interface DocsSearchPage {
  data: SortedResult[][];
  pagination: {
    mode: 'offset';
    per_page: number;
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    next_cursor: null;
    prev_cursor: null;
  };
}
