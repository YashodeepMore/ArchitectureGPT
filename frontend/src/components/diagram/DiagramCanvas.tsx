import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import { useState, useMemo, useCallback } from 'react'
import '@xyflow/react/dist/style.css'
import { useDiagramStore } from '../../store/diagramStore'
import { diagramToReactFlow } from '../../utils/diagramToReactFlow'
import { nodeTypes } from './nodeTypes'
import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { CustomEdge } from './CustomEdge'

// This component connects the document model (DiagramStore) to the renderer (React Flow).
export function DiagramCanvas() {
  const diagram = useDiagramStore((state) => state.diagram)
  const updateNodePosition = useDiagramStore((state) => state.updateNodePosition)
  const updateGroupPosition = useDiagramStore((state) => state.updateGroupPosition)

  // Track selection state locally inside this component so we don't pollute the Diagram document.
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([])

  const edgeTypes = {
    custom: CustomEdge,
  }

  // Derive the React Flow nodes and edges dynamically from the Diagram document.
  // Merges transient selection properties on every re-render.
  const { nodes, edges } = useMemo<{ nodes: Node<DiagramNodeData>[]; edges: Edge[] }>(() => {
    if (!diagram) {
      return { nodes: [], edges: [] }
    }


    const flow = diagramToReactFlow(diagram)

    const mergedNodes = flow.nodes.map((node) => ({
      ...node,
      selected: selectedNodeIds.includes(node.id),
    }))

    const mergedEdges = flow.edges.map((edge) => ({
      ...edge,
      selected: selectedEdgeIds.includes(edge.id),
    }))

    return {
      nodes: mergedNodes,
      edges: mergedEdges,
    }
  }, [diagram, selectedNodeIds, selectedEdgeIds])

  // Intercepts adjustments from React Flow and updates the source Diagram document.
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<DiagramNodeData>>[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          // Persist the new node position into the Diagram document
          const isGroup = diagram?.groups.some((g) => g.id === change.id)
          if (isGroup) {
            updateGroupPosition(change.id, change.position)
          } else {
            updateNodePosition(change.id, change.position)
          }
        } else if (change.type === 'select') {
          // Track selected nodes locally in the renderer component
          setSelectedNodeIds((prev) =>
            change.selected
              ? [...prev, change.id]
              : prev.filter((id) => id !== change.id)
          )
        }
      })
    },
    [diagram, updateNodePosition, updateGroupPosition]
  )

  // Intercepts edge selection adjustments from React Flow
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'select') {
          // Track selected edges locally in the renderer component
          setSelectedEdgeIds((prev) =>
            change.selected
              ? [...prev, change.id]
              : prev.filter((id) => id !== change.id)
          )
        }
      })
    },
    []
  )

  return (
    <div className="diagram-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}



