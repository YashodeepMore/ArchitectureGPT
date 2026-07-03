import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { BaseNode } from './BaseNode'

type NodeProps = {
  data: DiagramNodeData
}

export function CacheNode(props: NodeProps) {
  return <BaseNode {...props} className="node-type-cache" />
}
