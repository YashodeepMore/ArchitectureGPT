import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { BaseNode } from './BaseNode'

type NodeProps = {
  data: DiagramNodeData
}

export function QueueNode(props: NodeProps) {
  return <BaseNode {...props} className="node-type-queue" />
}
