import { create } from 'zustand'
import type { Diagram, Position } from '../types/diagram'

// DiagramStore defines the state and actions for the application's document model.
// All editing operations (dragging, renaming, adding, deleting elements) are CRUD mutations here.
type DiagramStore = {
  // The Diagram document is the application's single source of truth.
  diagram: Diagram | null
  setDiagram: (diagram: Diagram) => void
  resetDiagram: () => void
  // Persists node movement back into the Diagram document.
  updateNodePosition: (id: string, position: Position) => void
  // Persists group movement back into the Diagram document.
  updateGroupPosition: (id: string, position: Position) => void
}

export const useDiagramStore = create<DiagramStore>((set) => ({
  diagram: null,
  setDiagram: (diagram) => set({ diagram }),
  resetDiagram: () => set({ diagram: null }),
  
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
}))


