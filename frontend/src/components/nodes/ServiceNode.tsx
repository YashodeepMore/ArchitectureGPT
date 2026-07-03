import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { BaseNode } from './BaseNode'

type NodeProps = {
  data: DiagramNodeData
}

export function ServiceNode(props: NodeProps) {
  return <BaseNode {...props} />
}
