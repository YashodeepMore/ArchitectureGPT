import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { useEffect } from 'react'
import '@xyflow/react/dist/style.css'
import { useDiagramStore } from '../../store/diagramStore'
import { diagramToReactFlow } from '../../utils/diagramToReactFlow'
import { nodeTypes } from './nodeTypes'
import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { CustomEdge } from './CustomEdge'

export function DiagramCanvas() {
  const diagram = useDiagramStore((state) => state.diagram)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DiagramNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const edgeTypes = {
    custom: CustomEdge,
  }

  useEffect(() => {
    if (!diagram) {
      setNodes([])
      setEdges([])
      return
    }

    const flow = diagramToReactFlow(diagram)
    setNodes(flow.nodes)
    setEdges(flow.edges)
  }, [diagram, setEdges, setNodes])
  console.log(edges);
  console.log(nodes.map(n => ({
    id: n.id,
    type: n.type
  })));
  
  return (
    <div className="diagram-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
