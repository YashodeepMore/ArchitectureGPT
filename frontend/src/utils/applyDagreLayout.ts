import dagre from 'dagre'
import type { Edge, Node } from '@xyflow/react'
import type { DiagramNodeData } from './diagramToReactFlow'

const NODE_WIDTH = 180
const NODE_HEIGHT = 64
const GROUP_HEADER_HEIGHT = 40
const GROUP_PADDING = 32

const CHILD_NODE_SPACING = 32
const CHILD_RANK_SPACING = 52
const CONTAINER_SPACING = 120
const CONTAINER_RANK_SPACING = 180

type NodeSize = {
  width: number
  height: number
}

function getDefaultNodeSize(): NodeSize {
  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }
}

function getNodeSize(node: Node<DiagramNodeData>): NodeSize {
  return {
    width: Number(node.style?.width) || NODE_WIDTH,
    height: Number(node.style?.height) || NODE_HEIGHT,
  }
}

function createLayoutGraph(rankdir: 'TB' | 'LR', nodesep: number, ranksep: number) {
  const graph = new dagre.graphlib.Graph()

  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir,
    nodesep,
    ranksep,
  })

  return graph
}

function layoutWithDagre(
  nodes: Node<DiagramNodeData>[],
  edges: Edge[],
  rankdir: 'TB' | 'LR',
  nodesep: number,
  ranksep: number,
) {
  const graph = createLayoutGraph(rankdir, nodesep, ranksep)
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

function layoutChildrenVertically(
  children: Node<DiagramNodeData>[],
  edges: Edge[],
) {
  return layoutWithDagre(
    children,
    edges,
    'TB',
    CHILD_NODE_SPACING,
    CHILD_RANK_SPACING,
  )
}

function layoutChildrenInGrid(children: Node<DiagramNodeData>[]) {
  const columns = Math.ceil(Math.sqrt(children.length))
  const size = getDefaultNodeSize()

  return children.map((child, index) => {
    const row = Math.floor(index / columns)
    const column = index % columns

    return {
      ...child,
      position: {
        x: column * (size.width + CHILD_NODE_SPACING),
        y: row * (size.height + CHILD_NODE_SPACING),
      },
    }
  })
}

function getBounds(nodes: Node<DiagramNodeData>[]) {
  if (nodes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    }
  }

  return nodes.reduce(
    (bounds, node) => {
      const size = getNodeSize(node)

      return {
        minX: Math.min(bounds.minX, node.position.x),
        minY: Math.min(bounds.minY, node.position.y),
        maxX: Math.max(bounds.maxX, node.position.x + size.width),
        maxY: Math.max(bounds.maxY, node.position.y + size.height),
      }
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  )
}

function getEdgesInsideParent(edges: Edge[], children: Node<DiagramNodeData>[]) {
  const childIds = new Set(children.map((child) => child.id))

  return edges.filter(
    (edge) => childIds.has(edge.source) && childIds.has(edge.target),
  )
}

function layoutChildren(children: Node<DiagramNodeData>[], edges: Edge[]) {
  if (children.length >= 4) {
    return layoutChildrenInGrid(children)
  }

  return layoutChildrenVertically(children, edges)
}

function applyContainerPadding(nodes: Node<DiagramNodeData>[]) {
  const bounds = getBounds(nodes)

  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x - bounds.minX + GROUP_PADDING,
      y: node.position.y - bounds.minY + GROUP_HEADER_HEIGHT,
    },
  }))
}

function getContainerSize(children: Node<DiagramNodeData>[]): NodeSize {
  const bounds = getBounds(children)

  return {
    width: bounds.maxX + GROUP_PADDING,
    height: bounds.maxY + GROUP_PADDING,
  }
}

function buildTopLevelEdges(
  nodes: Node<DiagramNodeData>[],
  edges: Edge[],
) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const topLevelEdges: Edge[] = []
  const seenEdges = new Set<string>()

  edges.forEach((edge) => {
    const sourceNode = nodeById.get(edge.source)
    const targetNode = nodeById.get(edge.target)
    const source = sourceNode?.parentId ?? edge.source
    const target = targetNode?.parentId ?? edge.target

    if (source === target) {
      return
    }

    const edgeKey = `${source}->${target}`

    if (seenEdges.has(edgeKey)) {
      return
    }

    seenEdges.add(edgeKey)
    topLevelEdges.push({ ...edge, source, target })
  })

  return topLevelEdges
}

export function applyDagreLayout(
  nodes: Node<DiagramNodeData>[],
  edges: Edge[],
) {
  const childrenByParent = new Map<string, Node<DiagramNodeData>[]>()

  nodes.forEach((node) => {
    if (!node.parentId) {
      return
    }

    const children = childrenByParent.get(node.parentId) ?? []
    children.push(node)
    childrenByParent.set(node.parentId, children)
  })

  const laidOutChildrenByParent = new Map<string, Node<DiagramNodeData>[]>()
  const laidOutChildren = Array.from(childrenByParent.entries()).flatMap(
    ([parentId, children]) => {
      const childEdges = getEdgesInsideParent(edges, children)
      const paddedChildren = applyContainerPadding(
        layoutChildren(children, childEdges),
      ).map((child) => ({
        ...child,
        parentId,
      }))

      laidOutChildrenByParent.set(parentId, paddedChildren)
      return paddedChildren
    },
  )

  const topLevelNodes = nodes
    .filter((node) => !node.parentId)
    .map((node) => {
      const children = laidOutChildrenByParent.get(node.id) ?? []

      if (node.type !== 'group' || children.length === 0) {
        return node
      }

      const size = getContainerSize(children)

      return {
        ...node,
        style: {
          ...node.style,
          width: size.width,
          height: size.height,
        },
      }
    })

  // Containers are laid out after sizing, so horizontal spacing uses real bounds.
  const laidOutTopLevelNodes = layoutWithDagre(
    topLevelNodes,
    buildTopLevelEdges(nodes, edges),
    'LR',
    CONTAINER_SPACING,
    CONTAINER_RANK_SPACING,
  )

  return [...laidOutTopLevelNodes, ...laidOutChildren]
}
