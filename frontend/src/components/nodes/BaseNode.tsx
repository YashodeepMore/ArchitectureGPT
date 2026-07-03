import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { Handle, Position } from "@xyflow/react";


type BaseNodeProps = {
  data: DiagramNodeData
}

export function BaseNode({ data }: BaseNodeProps) {
  return (
    <div className="diagram-node">
      <Handle type="target" position={Position.Left} />

      {data.label}

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
