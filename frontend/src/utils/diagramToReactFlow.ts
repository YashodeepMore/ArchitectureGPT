/*
 * diagramToReactFlow contains utilities to bridge the Diagram document model and React Flow elements.
 *
 * It provides pure mapping from Diagram model to React Flow elements, and separate one-time
 * Dagre-based layout calculations for initial generation and manual re-layout triggers.
 */

import type { Edge, Node } from '@xyflow/react'
import type { Diagram } from '../types/diagram'
import { applyDagreLayout } from './applyDagreLayout'
import { routeEdges } from '../layout/edgeRouting'


// Type definition for node labels passed to React Flow custom nodes.
export type DiagramNodeData = {
  label: string
}

// Converts our Diagram document into React Flow nodes and edges.
// Reads positions and sizes directly from the Diagram document. No layout calculation occurs here.
export function diagramToReactFlow(diagram: Diagram) {
  // Map groups to React Flow node containers
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

  // Map nodes to React Flow custom nodes
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
  
  // Calculate relative connector handles based on node relative positions
  const routedEdges = routeEdges(rawNodes, rawEdges).map((edge) => ({
    ...edge,
    type: 'custom',
    pathOptions: {
      borderRadius: 12,
    },
    style: {
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
  }))

  return {
    nodes: rawNodes,
    edges: routedEdges,
  }
}

// Calculates automatic layout coordinates for all nodes and groups in a diagram.
// Runs the layout calculations once and writes the positions/sizes back to the Diagram model.
export function layoutDiagram(diagram: Diagram): Diagram {
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
  
  // Compute positions using Dagre layout algorithm
  const laidOutNodes = applyDagreLayout(rawNodes, rawEdges)

  // Sync computed node positions back to the Diagram document structure
  const nextNodes = diagram.nodes.map((node) => {
    const laidOutNode = laidOutNodes.find((n) => n.id === node.id)
    return {
      ...node,
      position: laidOutNode ? laidOutNode.position : node.position,
    }
  })

  // Sync computed group positions and sizes back to the Diagram document structure
  const nextGroups = diagram.groups.map((group) => {
    const laidOutGroup = laidOutNodes.find((n) => n.id === group.id)
    return {
      ...group,
      position: laidOutGroup ? laidOutGroup.position : group.position,
      width: laidOutGroup?.style?.width ? Number(laidOutGroup.style.width) : group.width,
      height: laidOutGroup?.style?.height ? Number(laidOutGroup.style.height) : group.height,
    }
  })

  return {
    ...diagram,
    nodes: nextNodes,
    groups: nextGroups,
  }
}


