import type { DocsSearchPage } from './docs-search-page';

const MAX_CACHED_QUERIES = 128;
const STALE_AFTER_MS = 2 * 60 * 1000;

class SearchCache extends Map<string, DocsSearchPage> {
  private readonly expiresAt = new Map<string, number>();

  override get(key: string): DocsSearchPage | undefined {
    if ((this.expiresAt.get(key) ?? 0) <= Date.now()) {
      this.delete(key);
      return undefined;
    }

    return super.get(key);
  }

  override set(key: string, result: DocsSearchPage): this {
    this.delete(key);
    if (this.size >= MAX_CACHED_QUERIES) {
      const oldestKey = this.keys().next().value;
      if (oldestKey !== undefined) this.delete(oldestKey);
    }
    this.expiresAt.set(key, Date.now() + STALE_AFTER_MS);
    return super.set(key, result);
  }

  override delete(key: string): boolean {
    this.expiresAt.delete(key);
    return super.delete(key);
  }

  override clear(): void {
    this.expiresAt.clear();
    super.clear();
  }
}

export const searchCache = new SearchCache();
