import type { Node } from 'fumadocs-core/page-tree';

export function compactSeparators(nodes: Node[]): Node[] {
  const result: Node[] = [];
  let separator: Extract<Node, { type: 'separator' }> | undefined;
  for (const node of nodes) {
    if (node.type === 'separator') {
      separator = node;
      continue;
    }
    if (separator) result.push(separator);
    separator = undefined;
    result.push(node);
  }
  return result;
}
