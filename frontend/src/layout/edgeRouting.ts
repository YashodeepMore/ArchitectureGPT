import type { Node, Edge } from "@xyflow/react";

// Dynamically routes diagram edges by calculating the optimal connector handles (top, bottom, left, right)
// based on relative node positions, ensuring edges connect cleanly.
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

    // Read user-defined overrides (supporting both top-level and data fields)
    const userSourceSide = (edge as any).sourceSide || edge.data?.sourceSide || 'auto';
    const userTargetSide = (edge as any).targetSide || edge.data?.targetSide || 'auto';

    if (!sourceNode || !targetNode) {
      const sourceDir = userSourceSide !== 'auto' ? userSourceSide : 'right';
      const targetDir = userTargetSide !== 'auto' ? userTargetSide : 'left';
      return {
        ...edge,
        sourceHandle: `source-${sourceDir}`,
        targetHandle: `target-${targetDir}`,
      };
    }

    const sourceCenter = getAbsoluteCenter(sourceNode);
    const targetCenter = getAbsoluteCenter(targetNode);

    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;

    let sourceDir: 'left' | 'right' | 'top' | 'bottom';
    let targetDir: 'left' | 'right' | 'top' | 'bottom';

    // Resolve source port direction
    if (userSourceSide && userSourceSide !== 'auto') {
      sourceDir = userSourceSide;
    } else {
      if (Math.abs(dx) >= Math.abs(dy)) {
        sourceDir = dx > 0 ? 'right' : 'left';
      } else {
        sourceDir = dy > 0 ? 'bottom' : 'top';
      }
    }

    // Resolve target port direction
    if (userTargetSide && userTargetSide !== 'auto') {
      targetDir = userTargetSide;
    } else {
      if (Math.abs(dx) >= Math.abs(dy)) {
        targetDir = dx > 0 ? 'left' : 'right';
      } else {
        targetDir = dy > 0 ? 'top' : 'bottom';
      }
    }

    return {
      ...edge,
      sourceHandle: `source-${sourceDir}`,
      targetHandle: `target-${targetDir}`,
    };
  });
}