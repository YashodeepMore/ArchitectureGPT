import type { Position } from '../types/diagram'

export type OrthoPoint = Position & {
  waypointIndex: number
}

/*
 * getOrthogonalPath computes a perfectly orthogonal list of segments connecting Source -> Target
 * while passing through any user routePoints.
 *
 * It maps each coordinate in the resulting path to its corresponding index in routePoints (-1 for Source, routePoints.length for Target).
 */
export function getOrthogonalPath(
  source: Position,
  routePoints: Position[],
  target: Position,
  sourcePosition: string,
  _targetPosition?: string
): OrthoPoint[] {
  const userPoints: (Position & { waypointIndex: number })[] = [
    { ...source, waypointIndex: -1 },
    ...routePoints.map((pt, idx) => ({ ...pt, waypointIndex: idx })),
    { ...target, waypointIndex: routePoints.length },
  ]

  const orthoPoints: OrthoPoint[] = [
    { x: userPoints[0].x, y: userPoints[0].y, waypointIndex: -1 }
  ]

  for (let i = 0; i < userPoints.length - 1; i++) {
    const current = orthoPoints[orthoPoints.length - 1]
    const next = userPoints[i + 1]

    if (current.x === next.x || current.y === next.y) {
      // Already orthogonally aligned, just push the next point
      orthoPoints.push({
        x: next.x,
        y: next.y,
        waypointIndex: next.waypointIndex,
      })
    } else {
      // Not aligned, insert an orthogonal corner to preserve 90 degree segments
      let goHorizontal = true

      if (i === 0) {
        // First segment uses sourcePosition port direction
        goHorizontal = sourcePosition === 'left' || sourcePosition === 'right'
      } else {
        // Subsequent segments alternate direction based on the last drawn segment
        const prev = orthoPoints[orthoPoints.length - 2]
        if (prev) {
          const wasVertical = prev.x === current.x
          goHorizontal = wasVertical
        }
      }

      if (goHorizontal) {
        orthoPoints.push({
          x: next.x,
          y: current.y,
          waypointIndex: next.waypointIndex,
        })
      } else {
        orthoPoints.push({
          x: current.x,
          y: next.y,
          waypointIndex: next.waypointIndex,
        })
      }
      orthoPoints.push({
        x: next.x,
        y: next.y,
        waypointIndex: next.waypointIndex,
      })
    }
  }

  return orthoPoints
}
