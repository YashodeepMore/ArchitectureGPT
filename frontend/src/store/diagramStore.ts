/*
 * DiagramStore is the single source of truth.
 *
 * Every editing operation (node repositioning, label updates, deleting, layout changes)
 * updates the Diagram here. React Flow never owns the application state; it acts 
 * strictly as a view/renderer mapping the store state to the canvas.
 */

import { create } from 'zustand'
import type { Diagram, Position } from '../types/diagram'
import { layoutDiagram } from '../utils/diagramToReactFlow'
import { getOrthogonalPath } from '../utils/orthogonalRouting'

type DiagramStore = {
  // The Diagram document is the application's single source of truth.
  diagram: Diagram | null
  
  // Track history stacks for Undo / Redo
  past: Diagram[]
  future: Diagram[]

  // Track selected elements to coordinate editor actions (like Delete Selected)
  selectedNodeIds: string[]
  selectedEdgeIds: string[]
  
  // Track whether the current document has unsaved modifications.
  isDirty: boolean

  setDiagram: (diagram: Diagram) => void
  resetDiagram: () => void
  setSelectedNodeIds: (ids: string[]) => void
  setSelectedEdgeIds: (ids: string[]) => void
  setIsDirty: (dirty: boolean) => void
  selectAll: () => void
  addNode: () => void

  // Persists node movement back into the Diagram document.
  updateNodePosition: (id: string, position: Position) => void
  // Persists group movement back into the Diagram document.
  updateGroupPosition: (id: string, position: Position) => void
  // Updates the name/label of a node in the Diagram document.
  updateNodeLabel: (id: string, label: string) => void
  // Updates the visual type classification of a node in the Diagram document.
  updateNodeType: (id: string, type: string) => void
  // Removes a node and all of its connected edges from the Diagram document.
  removeNode: (id: string) => void
  // Deletes all currently selected nodes and edges from the active diagram document.
  deleteSelected: () => void
  // Triggers the layout engine to calculate and update layout positions for the current diagram document.
  autoLayout: () => void
  // Appends a new empty group container to the active diagram document.
  addGroup: () => void
  // Updates the width and height of a specific group in the Diagram document.
  updateGroupSize: (id: string, width: number, height: number) => void
  // Updates the name/label of a specific group in the Diagram document.
  updateGroupLabel: (id: string, label: string) => void
  // Appends a new edge connection to the active diagram document.
  addEdge: (source: string, target: string) => void
  // Reconnects an existing edge to another source/target node in the active diagram document.
  updateEdge: (id: string, connection: { source: string; target: string }) => void
  // Updates the name/label of a specific edge in the Diagram document.
  updateEdgeLabel: (id: string, label: string) => void
  // Updates the arrow type of a specific edge in the Diagram document.
  updateEdgeArrowType: (id: string, arrowType: 'none' | 'forward' | 'backward' | 'both') => void
  // Updates the line style of a specific edge in the Diagram document.
  updateEdgeLineStyle: (id: string, lineStyle: 'solid' | 'dashed' | 'dotted') => void
  // Updates the source connection side of a specific edge.
  updateEdgeSourceSide: (id: string, sourceSide: 'auto' | 'top' | 'right' | 'bottom' | 'left') => void
  // Updates the target connection side of a specific edge.
  updateEdgeTargetSide: (id: string, targetSide: 'auto' | 'top' | 'right' | 'bottom' | 'left') => void
  // Updates the routePoints / waypoints list of a specific edge in the Diagram document.
  updateEdgeRoutePoints: (id: string, routePoints: Position[], skipHistory?: boolean) => void
  // Inserts a new waypoint at the clicked position or the midpoint of the longest segment of the edge.
  addWaypoint: (edgeId: string, position?: Position, insertIdx?: number) => void
  // Removes a specific waypoint index from the edge's routePoints.
  deleteWaypoint: (edgeId: string, index: number) => void
  // Removes a specific edge connection by its ID in the Diagram document.
  removeEdge: (id: string) => void
  // Clipboard and copy/paste/duplicate state
  clipboard: {
    nodes: any[]
    groups: any[]
  } | null
  copy: () => void
  paste: () => void
  duplicate: () => void
  
  // Undo / Redo history actions
  undo: () => void
  redo: () => void
}
const cloneDiagram = (d: any) => {
  if (!d) return null
  return JSON.parse(JSON.stringify(d))
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  diagram: null,
  past: [],
  future: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  isDirty: false,
  clipboard: null,
  
  setDiagram: (diagram) => set({ diagram, past: [], future: [], isDirty: false }),
  resetDiagram: () => set({ diagram: null, past: [], future: [], selectedNodeIds: [], selectedEdgeIds: [], isDirty: false }),
  setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
  setSelectedEdgeIds: (selectedEdgeIds) => set({ selectedEdgeIds }),
  setIsDirty: (isDirty) => set({ isDirty }),
  selectAll: () =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        selectedNodeIds: [
          ...state.diagram.nodes.map((n) => n.id),
          ...state.diagram.groups.map((g) => g.id),
        ],
        selectedEdgeIds: state.diagram.edges.map((e) => e.id),
      }
    }),

  
  // Appends a new generic node to the active diagram document model.
  addNode: () =>
    set((state) => {
      if (!state.diagram) return {}
      const newId = `node_${Date.now()}`
      const newNode = {
        id: newId,
        type: 'service',
        label: 'New Node',
        position: { x: 100, y: 100 },
        parent: null,
      }
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          nodes: [...state.diagram.nodes, newNode],
        },
      }
    }),
  
  // Directly updates node coordinates in the source diagram document.
  updateNodePosition: (id, position) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((node) =>
            node.id === id ? { ...node, position } : node
          ),
        },
      }
    }),

  // Directly updates group coordinates in the source diagram document.
  updateGroupPosition: (id, position) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          groups: state.diagram.groups.map((group) =>
            group.id === id ? { ...group, position } : group
          ),
        },
      }
    }),

  // Directly updates a node's label in the source diagram document.
  updateNodeLabel: (id, label) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((node) =>
            node.id === id ? { ...node, label } : node
          ),
        },
      }
    }),

  // Directly updates a node's type in the source diagram document.
  updateNodeType: (id, type) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((node) =>
            node.id === id ? { ...node, type } : node
          ),
        },
      }
    }),

  // Removes node (or group) and cleans up connected edges in the source diagram document.
  // Note: If a group container is removed, child nodes are adjusted to be absolute-positioned 
  // on the canvas and their parent field is cleared, preventing canvas crashes.
  removeNode: (id) =>
    set((state) => {
      if (!state.diagram) return {}
      
      const groupToRemove = state.diagram.groups.find((g) => g.id === id)
      if (groupToRemove) {
        return {
          isDirty: true,
          past: [...state.past, cloneDiagram(state.diagram)],
          future: [],
          selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
          selectedEdgeIds: state.selectedEdgeIds.filter((eid) => eid !== id),
          diagram: {
            ...state.diagram,
            groups: state.diagram.groups.filter((g) => g.id !== id),
            nodes: state.diagram.nodes.map((node) => {
              if (node.parent === id) {
                return {
                  ...node,
                  parent: null,
                  position: {
                    x: node.position.x + groupToRemove.position.x,
                    y: node.position.y + groupToRemove.position.y,
                  },
                }
              }
              return node
            }),
          },
        }
      }

      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
        selectedEdgeIds: state.selectedEdgeIds.filter((eid) => eid !== id),
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.filter((node) => node.id !== id),
          edges: state.diagram.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
        },
      }
    }),

  // Mutates the document model by removing all selected nodes, groups, and edges.
  // Note: For any groups being deleted, children nodes are automatically unnested, 
  // re-anchored absolute-positioned on the canvas, and their parent field is cleared.
  deleteSelected: () =>
    set((state) => {
      if (!state.diagram) return {}
      const nodeIds = state.selectedNodeIds
      const edgeIds = state.selectedEdgeIds

      const groupsToDeleting = state.diagram.groups.filter((g) => nodeIds.includes(g.id))
      const groupIds = groupsToDeleting.map((g) => g.id)

      const nextGroups = state.diagram.groups.filter((g) => !nodeIds.includes(g.id))

      const nextNodes = state.diagram.nodes.map((node) => {
        if (nodeIds.includes(node.id)) return node

        if (node.parent && groupIds.includes(node.parent)) {
          const parentGroup = groupsToDeleting.find((g) => g.id === node.parent)
          const offset = parentGroup ? parentGroup.position : { x: 0, y: 0 }
          return {
            ...node,
            parent: null,
            position: {
              x: node.position.x + offset.x,
              y: node.position.y + offset.y,
            },
          }
        }
        return node
      }).filter((node) => !nodeIds.includes(node.id))

      const nextEdges = state.diagram.edges.filter((edge) => {
        const sourceDeleted = nodeIds.includes(edge.source)
        const targetDeleted = nodeIds.includes(edge.target)
        const edgeDeleted = edgeIds.includes(edge.id)
        return !sourceDeleted && !targetDeleted && !edgeDeleted
      })

      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        selectedNodeIds: [],
        selectedEdgeIds: [],
        diagram: {
          ...state.diagram,
          nodes: nextNodes,
          groups: nextGroups,
          edges: nextEdges,
        },
      }
    }),

  // Appends a new empty group container to the active diagram document model.
  addGroup: () =>
    set((state) => {
      if (!state.diagram) return {}
      const newId = `group_${Date.now()}`
      const newGroup = {
        id: newId,
        label: 'New Container',
        position: { x: 150, y: 150 },
        width: 320,
        height: 220,
      }
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          groups: [...state.diagram.groups, newGroup],
        },
      }
    }),

  // Directly updates group width and height dimensions in the source diagram document.
  updateGroupSize: (id, width, height) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          groups: state.diagram.groups.map((group) =>
            group.id === id ? { ...group, width, height } : group
          ),
        },
      }
    }),

  // Directly updates group name/label in the source diagram document.
  updateGroupLabel: (id, label) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          groups: state.diagram.groups.map((group) =>
            group.id === id ? { ...group, label } : group
          ),
        },
      }
    }),

  // Appends a new unique connection edge to the active diagram document model.
  addEdge: (source, target) =>
    set((state) => {
      if (!state.diagram) return {}
      
      // Validation: Prevent duplicate identical connection directions
      const exists = state.diagram.edges.some(
        (edge) => edge.source === source && edge.target === target
      )
      if (exists) return {}

      const newEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        source,
        target,
        label: '',
      }
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: [...state.diagram.edges, newEdge],
        },
      }
    }),

  // Reconnects an existing edge to another source/target node in the active diagram document.
  updateEdge: (id, connection) =>
    set((state) => {
      if (!state.diagram) return {}
      
      // Validation: Prevent duplicate identical edges
      const duplicate = state.diagram.edges.some(
        (edge) =>
          edge.id !== id &&
          edge.source === connection.source &&
          edge.target === connection.target
      )
      if (duplicate) return {}

      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id ? { ...edge, ...connection } : edge
          ),
        },
      }
    }),

  // Directly updates edge name/label in the source diagram document.
  updateEdgeLabel: (id, label) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id ? { ...edge, label } : edge
          ),
        },
      }
    }),

  // Updates the arrow type of a specific edge in the Diagram document.
  updateEdgeArrowType: (id, arrowType) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id ? { ...edge, arrowType } : edge
          ),
        },
      }
    }),

  // Updates the line style of a specific edge in the Diagram document.
  updateEdgeLineStyle: (id, lineStyle) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id
              ? { ...edge, style: { ...edge.style, lineStyle } }
              : edge
          ),
        },
      }
    }),

  // Updates the source connection side of a specific edge.
  updateEdgeSourceSide: (id, sourceSide) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id ? { ...edge, sourceSide } : edge
          ),
        },
      }
    }),

  // Updates the target connection side of a specific edge.
  updateEdgeTargetSide: (id, targetSide) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id ? { ...edge, targetSide } : edge
          ),
        },
      }
    }),

  // Updates the routePoints / waypoints list of a specific edge in the Diagram document.
  updateEdgeRoutePoints: (id, routePoints, skipHistory = false) =>
    set((state) => {
      if (!state.diagram) return {}
      const historyUpdate = skipHistory
        ? {}
        : {
            past: [...state.past, cloneDiagram(state.diagram)],
            future: [],
          }
      return {
        ...historyUpdate,
        isDirty: true,
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((edge) =>
            edge.id === id ? { ...edge, routePoints } : edge
          ),
        },
      }
    }),

  // Inserts a new waypoint at the clicked position or the midpoint of the longest segment of the edge.
  addWaypoint: (edgeId, position, insertIdx) =>
    set((state) => {
      if (!state.diagram) return {}
      const edge = state.diagram.edges.find((e) => e.id === edgeId)
      if (!edge) return {}

      const pPoints = edge.routePoints || []
      let nextPoints = [...pPoints]

      if (position && typeof insertIdx === 'number') {
        // Direct segment split from double-click overlay
        nextPoints.splice(insertIdx, 0, {
          x: Math.round(position.x),
          y: Math.round(position.y),
        })
      } else {
        // Fallback when insertIdx is not provided (e.g., properties panel or canvas double click)
        const sourceNode = state.diagram.nodes.find((n) => n.id === edge.source) || state.diagram.groups.find((g) => g.id === edge.source)
        const targetNode = state.diagram.nodes.find((n) => n.id === edge.target) || state.diagram.groups.find((g) => g.id === edge.target)
        if (!sourceNode || !targetNode) return {}

        const sourceW = (sourceNode as any).width || 180
        const sourceH = (sourceNode as any).height || 64
        const targetW = (targetNode as any).width || 180
        const targetH = (targetNode as any).height || 64

        const p1 = {
          x: sourceNode.position.x + sourceW / 2,
          y: sourceNode.position.y + sourceH / 2,
        }
        const p2 = {
          x: targetNode.position.x + targetW / 2,
          y: targetNode.position.y + targetH / 2,
        }

        // Resolve custom/automatic connection sides
        const userSourceSide = edge.sourceSide || 'auto'
        const userTargetSide = edge.targetSide || 'auto'

        let sourceDir = 'right'
        let targetDir = 'left'

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y

        if (userSourceSide && userSourceSide !== 'auto') {
          sourceDir = userSourceSide
        } else {
          if (Math.abs(dx) >= Math.abs(dy)) {
            sourceDir = dx > 0 ? 'right' : 'left'
          } else {
            sourceDir = dy > 0 ? 'bottom' : 'top'
          }
        }

        if (userTargetSide && userTargetSide !== 'auto') {
          targetDir = userTargetSide
        } else {
          if (Math.abs(dx) >= Math.abs(dy)) {
            targetDir = dx > 0 ? 'left' : 'right'
          } else {
            targetDir = dy > 0 ? 'top' : 'bottom'
          }
        }

        // Get the current orthogonal path
        const computedOrtho = getOrthogonalPath(
          p1,
          pPoints,
          p2,
          sourceDir,
          targetDir
        )

        let insertIdxResolved = 0
        let newWaypoint = { x: 0, y: 0 }

        if (position) {
          // Find closest segment in computedOrtho to click position
          const getDistanceToSegment = (p: Position, a: Position, b: Position) => {
            const dx = b.x - a.x
            const dy = b.y - a.y
            const l2 = dx * dx + dy * dy
            if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)
            let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2
            t = Math.max(0, Math.min(1, t))
            return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
          }

          let minDistance = Infinity
          let closestIdx = 0
          for (let i = 0; i < computedOrtho.length - 1; i++) {
            const dist = getDistanceToSegment(position, computedOrtho[i], computedOrtho[i+1])
            if (dist < minDistance) {
              minDistance = dist
              closestIdx = i
            }
          }
          const segP2 = computedOrtho[closestIdx + 1]
          insertIdxResolved = segP2.waypointIndex
          newWaypoint = {
            x: Math.round(position.x),
            y: Math.round(position.y),
          }
        } else {
          // Find longest segment to insert waypoint
          let maxLen = -1
          let splitIdx = 0
          for (let i = 0; i < computedOrtho.length - 1; i++) {
            const len = Math.hypot(computedOrtho[i+1].x - computedOrtho[i].x, computedOrtho[i+1].y - computedOrtho[i].y)
            if (len > maxLen) {
              maxLen = len
              splitIdx = i
            }
          }
          const segP1 = computedOrtho[splitIdx]
          const segP2 = computedOrtho[splitIdx + 1]
          insertIdxResolved = segP2.waypointIndex
          newWaypoint = {
            x: Math.round((segP1.x + segP2.x) / 2),
            y: Math.round((segP1.y + segP2.y) / 2),
          }
        }

        nextPoints.splice(insertIdxResolved, 0, newWaypoint)
      }

      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((e) =>
            e.id === edgeId ? { ...e, routePoints: nextPoints } : e
          ),
        },
      }
    }),

  // Removes a specific waypoint index from the edge's routePoints.
  deleteWaypoint: (edgeId, index) =>
    set((state) => {
      if (!state.diagram) return {}
      const edge = state.diagram.edges.find((e) => e.id === edgeId)
      if (!edge || !edge.routePoints) return {}

      const nextPoints = edge.routePoints.filter((_, idx) => idx !== index)

      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.map((e) =>
            e.id === edgeId ? { ...e, routePoints: nextPoints } : e
          ),
        },
      }
    }),

  // Removes a specific edge connection by its ID in the Diagram document.
  removeEdge: (id) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: {
          ...state.diagram,
          edges: state.diagram.edges.filter((edge) => edge.id !== id),
        },
      }
    }),

  // Executes layout pass and saves computed positions back to the active diagram document.
  autoLayout: () =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        isDirty: true,
        past: [...state.past, cloneDiagram(state.diagram)],
        future: [],
        diagram: layoutDiagram(state.diagram),
      }
    }),

  // Reverts the diagram state to the last checkpoint in the history stack.
  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {}
      const previous = state.past[state.past.length - 1]
      const newPast = state.past.slice(0, state.past.length - 1)
      const current = state.diagram ? cloneDiagram(state.diagram) : null
      return {
        past: newPast,
        future: current ? [current, ...state.future] : state.future,
        diagram: previous,
        isDirty: true,
      }
    }),

  // Restores a previously reverted diagram state from the forward history stack.
  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {}
      const next = state.future[0]
      const newFuture = state.future.slice(1)
      const current = state.diagram ? cloneDiagram(state.diagram) : null
      return {
        past: current ? [...state.past, current] : state.past,
        future: newFuture,
        diagram: next,
        isDirty: true,
      }
    }),

  // Copy selected nodes and groups into clipboard
  copy: () =>
    set((state) => {
      if (!state.diagram) return {}
      const selectedNodes = state.diagram.nodes.filter((n) => state.selectedNodeIds.includes(n.id))
      const selectedGroups = state.diagram.groups.filter((g) => state.selectedNodeIds.includes(g.id))
      
      if (selectedNodes.length === 0 && selectedGroups.length === 0) return {}
      
      return {
        clipboard: {
          nodes: cloneDiagram(selectedNodes),
          groups: cloneDiagram(selectedGroups),
        },
      }
    }),

  // Paste nodes and groups from clipboard with position offsets and new unique IDs
  paste: () =>
    set((state) => {
      if (!state.diagram || !state.clipboard) return {}
      
      const newPast = [...state.past, cloneDiagram(state.diagram)]
      const mapping: Record<string, string> = {}
      const timeOffset = Date.now()

      // Clone groups
      const nextGroups = [...state.diagram.groups]
      const pastedGroupIds: string[] = []
      state.clipboard.groups.forEach((group) => {
        const newGroupId = `group_paste_${timeOffset}_${Math.floor(Math.random() * 1000)}`
        mapping[group.id] = newGroupId
        pastedGroupIds.push(newGroupId)
        nextGroups.push({
          ...group,
          id: newGroupId,
          position: {
            x: group.position.x + 30,
            y: group.position.y + 30,
          },
        })
      })

      // Clone nodes
      const nextNodes = [...state.diagram.nodes]
      const pastedNodeIds: string[] = []
      state.clipboard.nodes.forEach((node) => {
        const timeOffsetNode = Date.now()
        const newNodeId = `node_paste_${timeOffsetNode}_${Math.floor(Math.random() * 1000)}`
        pastedNodeIds.push(newNodeId)
        
        let parentId = null
        if (node.parent) {
          parentId = mapping[node.parent] || node.parent
        }

        nextNodes.push({
          ...node,
          id: newNodeId,
          parent: parentId,
          position: {
            x: node.position.x + 30,
            y: node.position.y + 30,
          },
        })
      })

      return {
        isDirty: true,
        past: newPast,
        future: [],
        selectedNodeIds: [...pastedNodeIds, ...pastedGroupIds],
        selectedEdgeIds: [],
        diagram: {
          ...state.diagram,
          groups: nextGroups,
          nodes: nextNodes,
        },
      }
    }),

  // Duplicate current selection directly (one-step copy/paste)
  duplicate: () => {
    const { copy, paste } = get()
    copy()
    paste()
  },
}))




