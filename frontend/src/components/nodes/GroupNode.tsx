import type { DiagramNodeData } from '../../utils/diagramToReactFlow'

type GroupNodeProps = {
  data: DiagramNodeData
}

export function GroupNode({ data }: GroupNodeProps) {
  return <div className="diagram-group-label">{data.label}</div>
}
