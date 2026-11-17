import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute } from '@/lib/shared';

const { rewrite: rewriteDocs } = rewritePath(
  '{/*path}',
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  '{/*path}.md',
  `${docsContentRoute}{/*path}/content.md`,
);

export default function proxy(request: NextRequest) {
  // Docs live at the root, so the patterns above also match the markdown route itself.
  if (request.nextUrl.pathname.startsWith(docsContentRoute)) return NextResponse.next();

  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(request.nextUrl.basePath + result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(request.nextUrl.basePath + result, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      });
    }
  }

  return NextResponse.next();
}
