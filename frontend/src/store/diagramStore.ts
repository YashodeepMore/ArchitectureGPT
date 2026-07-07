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

type DiagramStore = {
  // The Diagram document is the application's single source of truth.
  diagram: Diagram | null
  
  // Track selected elements to coordinate editor actions (like Delete Selected)
  selectedNodeIds: string[]
  selectedEdgeIds: string[]
  
  setDiagram: (diagram: Diagram) => void
  resetDiagram: () => void
  setSelectedNodeIds: (ids: string[]) => void
  setSelectedEdgeIds: (ids: string[]) => void
  addNode: () => void

  
  // Persists node movement back into the Diagram document.
  updateNodePosition: (id: string, position: Position) => void
  // Persists group movement back into the Diagram document.
  updateGroupPosition: (id: string, position: Position) => void
  // Updates the name/label of a node in the Diagram document.
  updateNodeLabel: (id: string, label: string) => void
  // Removes a node and all of its connected edges from the Diagram document.
  removeNode: (id: string) => void
  // Deletes all currently selected nodes and edges from the active diagram document.
  deleteSelected: () => void
  // Triggers the layout engine to calculate and update layout positions for the current diagram document.
  autoLayout: () => void
}

export const useDiagramStore = create<DiagramStore>((set) => ({
  diagram: null,
  selectedNodeIds: [],
  selectedEdgeIds: [],
  
  setDiagram: (diagram) => set({ diagram }),
  resetDiagram: () => set({ diagram: null, selectedNodeIds: [], selectedEdgeIds: [] }),
  // Retrieve and update canvas selection state from the global store
  setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
  setSelectedEdgeIds: (selectedEdgeIds) => set({ selectedEdgeIds }),
  
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
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.map((node) =>
            node.id === id ? { ...node, label } : node
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


  // Executes layout pass and saves computed positions back to the active diagram document.
  autoLayout: () =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        diagram: layoutDiagram(state.diagram),
      }
    }),
}))




