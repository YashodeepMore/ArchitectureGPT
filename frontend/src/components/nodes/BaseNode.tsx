import type { DiagramNodeData } from '../../utils/diagramToReactFlow'

type BaseNodeProps = {
  data: DiagramNodeData
}

export function BaseNode({ data }: BaseNodeProps) {
  return <div className="diagram-node">{data.label}</div>
}
