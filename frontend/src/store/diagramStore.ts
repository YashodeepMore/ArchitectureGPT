import { create } from 'zustand'
import type { Diagram } from '../types/diagram'

type DiagramStore = {
  diagram: Diagram | null
  setDiagram: (diagram: Diagram) => void
  resetDiagram: () => void
}

export const useDiagramStore = create<DiagramStore>((set) => ({
  diagram: null,
  setDiagram: (diagram) => set({ diagram }),
  resetDiagram: () => set({ diagram: null }),
}))
