import type { Node, Edge } from "@xyflow/react";

export function routeEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const nodesMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));

  // Helper to get absolute center of a node
  function getAbsoluteCenter(node: Node) {
    const size = {
      width: Number(node.style?.width) || 180,
      height: Number(node.style?.height) || 64,
    };
    let x = node.position.x;
    let y = node.position.y;
    let current = node;
    while (current.parentId) {
      const parent = nodesMap.get(current.parentId);
      if (!parent) break;
      x += parent.position.x;
      y += parent.position.y;
      current = parent;
    }
    return {
      x: x + size.width / 2,
      y: y + size.height / 2,
    };
  }

  return edges.map((edge) => {
    const sourceNode = nodesMap.get(edge.source);
    const targetNode = nodesMap.get(edge.target);

    if (!sourceNode || !targetNode) {
      return {
        ...edge,
        sourceHandle: "source-right",
        targetHandle: "target-left",
      };
    }

    const sourceCenter = getAbsoluteCenter(sourceNode);
    const targetCenter = getAbsoluteCenter(targetNode);

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    let sourceDir: 'left' | 'right' | 'top' | 'bottom';
    let targetDir: 'left' | 'right' | 'top' | 'bottom';

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        sourceDir = 'right';
        targetDir = 'left';
      } else {
        sourceDir = 'left';
        targetDir = 'right';
      }
    } else {
      if (dy > 0) {
        sourceDir = 'bottom';
        targetDir = 'top';
      } else {
        sourceDir = 'top';
        targetDir = 'bottom';
      }
    }

    return {
      ...edge,
      sourceHandle: `source-${sourceDir}`,
      targetHandle: `target-${targetDir}`,
    };
  });
}