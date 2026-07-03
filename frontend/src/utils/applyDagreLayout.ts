import dagre from 'dagre'
import type { Edge, Node } from '@xyflow/react'
import type { DiagramNodeData } from './diagramToReactFlow'

const NODE_WIDTH = 180
const NODE_HEIGHT = 64
const GROUP_WIDTH = 320
const GROUP_HEIGHT = 220
const GROUP_PADDING = 48

const NODE_SPACING = 80
const RANK_SPACING = 120

function getNodeSize(node: Node<DiagramNodeData>) {
  if (node.type === 'group') {
    return {
      width: Number(node.style?.width) || GROUP_WIDTH,
      height: Number(node.style?.height) || GROUP_HEIGHT,
    }
  }

  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }
}

function createLayoutGraph() {
  const graph = new dagre.graphlib.Graph()

  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'TB',
    nodesep: NODE_SPACING,
    ranksep: RANK_SPACING,
  })

  return graph
}

function layoutNodeSet(
  nodes: Node<DiagramNodeData>[],
  edges: Edge[],
) {
  const graph = createLayoutGraph()
  const nodeIds = new Set(nodes.map((node) => node.id))

  nodes.forEach((node) => {
    const size = getNodeSize(node)
    graph.setNode(node.id, size)
  })

  edges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.setEdge(edge.source, edge.target)
    }
  })

  // Dagre calculates node centers; React Flow expects top-left positions.
  dagre.layout(graph)

  return nodes.map((node) => {
    const layoutNode = graph.node(node.id)
    const size = getNodeSize(node)

    return {
      ...node,
      position: {
        x: layoutNode.x - size.width / 2,
        y: layoutNode.y - size.height / 2,
      },
    }
  })
}

export function applyDagreLayout(
  nodes: Node<DiagramNodeData>[],
  edges: Edge[],
) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const childrenByParent = new Map<string, Node<DiagramNodeData>[]>()

  nodes.forEach((node) => {
    if (!node.parentId) {
      return
    }

    const children = childrenByParent.get(node.parentId) ?? []
    children.push(node)
    childrenByParent.set(node.parentId, children)
  })

  const topLevelNodes = nodes.filter((node) => !node.parentId)
  const topLevelEdges: Edge[] = []

  edges.forEach((edge) => {
    const sourceNode = nodeById.get(edge.source)
    const targetNode = nodeById.get(edge.target)
    const source = sourceNode?.parentId ?? edge.source
    const target = targetNode?.parentId ?? edge.target

    if (source !== target) {
      topLevelEdges.push({ ...edge, source, target })
    }
  })

  const laidOutTopLevelNodes = layoutNodeSet(topLevelNodes, topLevelEdges)

  const laidOutChildren = Array.from(childrenByParent.entries()).flatMap(
    ([parentId, children]) => {
      const childIds = new Set(children.map((child) => child.id))
      const childEdges = edges.filter(
        (edge) => childIds.has(edge.source) && childIds.has(edge.target),
      )

      // Child positions stay relative to the group node in React Flow.
      return layoutNodeSet(children, childEdges).map((child) => ({
        ...child,
        position: {
          x: child.position.x + GROUP_PADDING,
          y: child.position.y + GROUP_PADDING,
        },
        parentId,
      }))
    },
  )

  return [...laidOutTopLevelNodes, ...laidOutChildren]
}
