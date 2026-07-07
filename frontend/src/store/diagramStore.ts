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
  setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
  setSelectedEdgeIds: (selectedEdgeIds) => set({ selectedEdgeIds }),
  
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
  removeNode: (id) =>
    set((state) => {
      if (!state.diagram) return {}
      return {
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.filter((node) => node.id !== id),
          groups: state.diagram.groups.filter((group) => group.id !== id),
          edges: state.diagram.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
        },
      }
    }),

  // Mutates the document model by removing all selected nodes, groups, and edges.
  deleteSelected: () =>
    set((state) => {
      if (!state.diagram) return {}
      const nodeIds = state.selectedNodeIds
      const edgeIds = state.selectedEdgeIds

      return {
        selectedNodeIds: [],
        selectedEdgeIds: [],
        diagram: {
          ...state.diagram,
          nodes: state.diagram.nodes.filter((node) => !nodeIds.includes(node.id)),
          groups: state.diagram.groups.filter((group) => !nodeIds.includes(group.id)),
          edges: state.diagram.edges.filter(
            (edge) =>
              !nodeIds.includes(edge.source) &&
              !nodeIds.includes(edge.target) &&
              !edgeIds.includes(edge.id)
          ),
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




