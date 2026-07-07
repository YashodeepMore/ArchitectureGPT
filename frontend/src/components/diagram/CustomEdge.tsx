import {
  type EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
} from '@xyflow/react'
import type { Position } from '../../types/diagram'
import { WaypointHandles } from './WaypointHandles' // Interactive overlay for waypoint editing
import { getOrthogonalPath } from '../../utils/orthogonalRouting'

/*
 * CustomEdge renders the connection line between nodes.
 *
 * Responsibility:
 * - Computes a perfectly orthogonal path connecting source -> routePoints -> target.
 * - Resolves arrowheads (forward, backward, both) using custom SVG markers.
 * - Resolves line styles (solid, dashed, dotted) using SVG stroke dash arrays.
 */
export function CustomEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style,
    label,
    selected,
  } = props

  const edgeData = data as any
  const routePoints = (edgeData?.routePoints || []) as Position[]
  const arrowType = (edgeData?.arrowType || 'none') as 'none' | 'forward' | 'backward' | 'both'
  const lineStyle = (edgeData?.style?.lineStyle || 'solid') as 'solid' | 'dashed' | 'dotted'

  // 1. Generate perfectly orthogonal path points
  const source = { x: sourceX, y: sourceY }
  const target = { x: targetX, y: targetY }
  const orthoPoints = getOrthogonalPath(
    source,
    routePoints,
    target,
    sourcePosition || 'right',
    targetPosition || 'left'
  )

  // 2. Build SVG path string from orthogonal points
  let path = `M ${orthoPoints[0].x} ${orthoPoints[0].y}`
  for (let i = 1; i < orthoPoints.length; i++) {
    path += ` L ${orthoPoints[i].x} ${orthoPoints[i].y}`
  }

  // 3. Calculate coordinates to center the label text on the middle segment
  const midIndex = Math.floor(orthoPoints.length / 2)
  let labelX = 0
  let labelY = 0
  if (orthoPoints.length % 2 === 0) {
    labelX = (orthoPoints[midIndex - 1].x + orthoPoints[midIndex].x) / 2
    labelY = (orthoPoints[midIndex - 1].y + orthoPoints[midIndex].y) / 2
  } else {
    labelX = orthoPoints[midIndex].x
    labelY = orthoPoints[midIndex].y
  }

  // 4. Resolve CSS styling options
  const strokeDasharray =
    lineStyle === 'dashed' ? '6 4' : lineStyle === 'dotted' ? '2 5' : undefined

  const edgeStyle = {
    ...style,
    strokeDasharray,
  }

  // 5. Resolve arrowhead SVG markers
  const color = style?.stroke || '#94a3b8'
  const markerStart =
    arrowType === 'backward' || arrowType === 'both'
      ? `url(#arrow-backward-${id})`
      : undefined
  const markerEnd =
    arrowType === 'forward' || arrowType === 'both'
      ? `url(#arrow-forward-${id})`
      : undefined

  return (
    <>
      {/* Local marker definitions so each edge has independent markers */}
      <defs>
        <marker
          id={`arrow-forward-${id}`}
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 5 3.5 L 0 6 z" fill={color} />
        </marker>
        <marker
          id={`arrow-backward-${id}`}
          markerWidth="7"
          markerHeight="7"
          refX="1"
          refY="3.5"
          orient="auto-start-reverse"
        >
          <path d="M 5 1 L 0 3.5 L 5 6 z" fill={color} />
        </marker>
      </defs>

      {/* Draw main connector line */}
      <BaseEdge
        id={id}
        path={path}
        style={edgeStyle}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
      
      {/* Render interactive handles if the edge is selected */}
      {selected && (
        <WaypointHandles
          edgeId={id}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          routePoints={routePoints}
          orthoPoints={orthoPoints}
        />
      )}

      {/* Render text label on the path */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#ffffff',
              padding: '2px 6px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#475569',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
