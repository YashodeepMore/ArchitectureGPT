import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { BaseNode } from './BaseNode'

type NodeProps = {
  data: DiagramNodeData
}

export function GatewayNode(props: NodeProps) {
  return <BaseNode {...props} className="node-type-gateway" />
}
