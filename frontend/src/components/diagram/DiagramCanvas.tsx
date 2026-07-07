/*
 * DiagramCanvas connects our Diagram document to React Flow.
 *
 * The DiagramStore owns the application's document and selection state.
 * This component converts that document into React Flow elements,
 * merges active selection overlays, and forwards user interactions back to the store.
 */

import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import { useMemo, useCallback } from 'react'
import '@xyflow/react/dist/style.css'
import { useDiagramStore } from '../../store/diagramStore'
import { diagramToReactFlow } from '../../utils/diagramToReactFlow'
import { nodeTypes } from './nodeTypes'
import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { CustomEdge } from './CustomEdge'
import { ZoomControls } from './ZoomControls'

// This component connects the document model (DiagramStore) to the renderer (React Flow).
export function DiagramCanvas({ activeTool }: { activeTool: 'select' | 'pan' }) {
  const diagram = useDiagramStore((state) => state.diagram)
  const updateNodePosition = useDiagramStore((state) => state.updateNodePosition)
  const updateGroupPosition = useDiagramStore((state) => state.updateGroupPosition)
  const removeNode = useDiagramStore((state) => state.removeNode)
  const addEdge = useDiagramStore((state) => state.addEdge)
  const updateEdge = useDiagramStore((state) => state.updateEdge)

  // Retrieve and update canvas selection state from the global store
  const selectedNodeIds = useDiagramStore((state) => state.selectedNodeIds)
  const selectedEdgeIds = useDiagramStore((state) => state.selectedEdgeIds)
  const setSelectedNodeIds = useDiagramStore((state) => state.setSelectedNodeIds)
  const setSelectedEdgeIds = useDiagramStore((state) => state.setSelectedEdgeIds)

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
          // Track selected nodes in the global store to coordinate editor controls
          setSelectedNodeIds(
            change.selected
              ? [...selectedNodeIds, change.id]
              : selectedNodeIds.filter((id) => id !== change.id)
          )
        } else if (change.type === 'remove') {
          // Sync node removal back into the Diagram document (also handles connected edges in the store)
          removeNode(change.id)
        }
      })
    },
    [diagram, updateNodePosition, updateGroupPosition, removeNode, selectedNodeIds, setSelectedNodeIds]
  )

  // Intercepts edge selection adjustments from React Flow
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'select') {
          // Track selected edges in the global store to coordinate editor controls
          setSelectedEdgeIds(
            change.selected
              ? [...selectedEdgeIds, change.id]
              : selectedEdgeIds.filter((id) => id !== change.id)
          )
        }
      })
    },
    [selectedEdgeIds, setSelectedEdgeIds]
  )

  // Triggers when a new connection is dragged and established between two nodes.
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target && connection.source !== connection.target) {
        addEdge(connection.source, connection.target)
      }
    },
    [addEdge]
  )

  // Triggers when an existing connection line is dragged and reconnected to another node.
  const handleReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (newConnection.source && newConnection.target && newConnection.source !== newConnection.target) {
        updateEdge(oldEdge.id, {
          source: newConnection.source,
          target: newConnection.target,
        })
      }
    },
    [updateEdge]
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
        onConnect={handleConnect}
        onReconnect={handleReconnect}
        panOnDrag={activeTool === 'pan'}
        nodesDraggable={activeTool === 'select'}
        nodesConnectable={activeTool === 'select'}
        elementsSelectable={activeTool === 'select'}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <ZoomControls />
    </div>
  )
}
