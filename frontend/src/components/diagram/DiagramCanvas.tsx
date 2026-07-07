import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type NodeChange,
} from '@xyflow/react'
import { useEffect, useCallback } from 'react'
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

  // React Flow local state tracks transient renderer states (like selection/dragging highlights).
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DiagramNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const edgeTypes = {
    custom: CustomEdge,
  }

  // Subscribes to the Diagram store. Re-maps diagram data to React Flow nodes/edges on any change.
  useEffect(() => {
    if (!diagram) {
      setNodes([])
      setEdges([])
      return
    }

    const flow = diagramToReactFlow(diagram)

    // Merge new flow nodes with existing local nodes to preserve transient properties like 'selected' or 'dragging'
    setNodes((prevNodes) =>
      flow.nodes.map((newNode) => {
        const prevNode = prevNodes.find((n) => n.id === newNode.id)
        if (prevNode) {
          return {
            ...newNode,
            selected: prevNode.selected,
            dragging: prevNode.dragging,
          }
        }
        return newNode
      })
    )

    setEdges((prevEdges) =>
      flow.edges.map((newEdge) => {
        const prevEdge = prevEdges.find((e) => e.id === newEdge.id)
        if (prevEdge) {
          return {
            ...newEdge,
            selected: prevEdge.selected,
          }
        }
        return newEdge
      })
    )
  }, [diagram, setEdges, setNodes])

  // Intercepts node adjustments from React Flow and updates the source Diagram document.
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<DiagramNodeData>>[]) => {
      // Update local state first to ensure fluid dragging in the renderer
      onNodesChange(changes)

      // Persist node movement back into the Diagram document
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          const isGroup = diagram?.groups.some((g) => g.id === change.id)
          if (isGroup) {
            updateGroupPosition(change.id, change.position)
          } else {
            updateNodePosition(change.id, change.position)
          }
        }
      })
    },
    [onNodesChange, diagram, updateNodePosition, updateGroupPosition]
  )

  return (
    <div className="diagram-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}


