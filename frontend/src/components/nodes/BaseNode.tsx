import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { Handle, Position } from "@xyflow/react";

type BaseNodeProps = {
  data: DiagramNodeData
  className?: string
}

export function BaseNode({ data, className }: BaseNodeProps) {
  return (
    <div className={`diagram-node ${className || ''}`}>
      {/* Target Handles */}
      <Handle type="target" position={Position.Left} id="target-left" style={{ background: '#94a3b8' }} />
      <Handle type="target" position={Position.Right} id="target-right" style={{ background: '#94a3b8' }} />
      <Handle type="target" position={Position.Top} id="target-top" style={{ background: '#94a3b8' }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ background: '#94a3b8' }} />

      {data.label}

      {/* Source Handles */}
      <Handle type="source" position={Position.Left} id="source-left" style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Top} id="source-top" style={{ background: '#94a3b8' }} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" style={{ background: '#94a3b8' }} />
    </div>
  );
}
