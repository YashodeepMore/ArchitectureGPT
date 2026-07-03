import type { Edge, Node } from '@xyflow/react'
import type { Diagram } from '../types/diagram'
import { applyDagreLayout } from './applyDagreLayout'
import { routeEdges } from '../layout/edgeRouting'

export type DiagramNodeData = {
  label: string
}

export function diagramToReactFlow(diagram: Diagram) {
  const groupNodes: Node<DiagramNodeData>[] = diagram.groups.map((group) => ({
    id: group.id,
    type: 'group',
    position: group.position,
    data: { label: group.label },
    style: {
      width: group.width,
      height: group.height,
    },
  }))

  const diagramNodes: Node<DiagramNodeData>[] = diagram.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    parentId: node.parent ?? undefined,
    extent: node.parent ? 'parent' : undefined,
    data: { label: node.label },
  }))

  const rawEdges: Edge[] = diagram.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }))

  const rawNodes = [...groupNodes, ...diagramNodes]
  const laidOutNodes = applyDagreLayout(rawNodes, rawEdges)

  const routedEdges = routeEdges(laidOutNodes, rawEdges).map((edge) => ({
    ...edge,
    type: 'smoothstep',
    pathOptions: {
      borderRadius: 12,
    },
    style: {
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
  }))

  return {
    nodes: laidOutNodes,
    edges: routedEdges,
  }
}
