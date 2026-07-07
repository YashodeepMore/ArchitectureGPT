/*
 * GroupNode represents the visual container for logical node clusters on the canvas.
 *
 * It renders a bounding box and a label, and embeds React Flow's NodeResizer
 * to enable manual group resizing when selected by the user. Resizing events
 * are routed directly to the global DiagramStore.
 */

import { NodeResizer } from '@xyflow/react'
import type { DiagramNodeData } from '../../utils/diagramToReactFlow'
import { useDiagramStore } from '../../store/diagramStore'

type GroupNodeProps = {
  id: string
  data: DiagramNodeData
  selected?: boolean
}

export function GroupNode({ id, data, selected }: GroupNodeProps) {
  const updateGroupPosition = useDiagramStore((state) => state.updateGroupPosition)
  const updateGroupSize = useDiagramStore((state) => state.updateGroupSize)

  // Persists updated dimensions and coordinates back to the global store on resize.
  const handleResize = (_event: any, params: any) => {
    updateGroupPosition(id, { x: params.x, y: params.y })
    updateGroupSize(id, params.width, params.height)
  }

  return (
    <>
      {/* NodeResizer displays dragging handles and updates the container's state */}
      <NodeResizer
        color="#3b82f6"
        minWidth={120}
        minHeight={80}
        isVisible={!!selected}
        onResize={handleResize}
        onResizeEnd={handleResize}
      />
      <div className="diagram-group-label">{data.label}</div>
    </>
  )
}
