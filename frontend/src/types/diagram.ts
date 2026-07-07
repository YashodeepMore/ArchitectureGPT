export type Position = {
  x: number
  y: number
}

export type DiagramNode = {
  id: string
  type: string
  label: string
  position: Position
  parent: string | null
}

export type DiagramEdge = {
  id: string
  source: string
  target: string
  label?: string
  routePoints?: Position[]
  arrowType?: 'none' | 'forward' | 'backward' | 'both'
  sourceSide?: 'auto' | 'top' | 'right' | 'bottom' | 'left'
  targetSide?: 'auto' | 'top' | 'right' | 'bottom' | 'left'
  style?: {
    lineStyle?: 'solid' | 'dashed' | 'dotted'
  }
}


export type DiagramGroup = {
  id: string
  label: string
  position: Position
  width: number
  height: number
}

export type Diagram = {
  id: string
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  groups: DiagramGroup[]
  metadata: Record<string, unknown>
}
