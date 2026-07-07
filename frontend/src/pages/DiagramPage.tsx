/*
 * DiagramPage is the primary workspace view of our application.
 *
 * It manages prompt state, initiates diagram generation with the backend API,
 * and handles UI layout. It arranges the workspace into a full-screen 
 * viewport layout containing the top Toolbar, collapsible left Sidebar, 
 * and central DiagramCanvas workspace.
 */

import { useState } from 'react'
import { DiagramCanvas } from '../components/diagram/DiagramCanvas'
import { Toolbar } from '../components/Toolbar'
import { Sidebar } from '../components/Sidebar'
import { generateDiagram } from '../services/diagramApi'
import { useDiagramStore } from '../store/diagramStore'
import { layoutDiagram } from '../utils/diagramToReactFlow'

export function DiagramPage() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Connect to the global diagram document store
  const diagram = useDiagramStore((state) => state.diagram)
  const setDiagram = useDiagramStore((state) => state.setDiagram)
  const resetDiagram = useDiagramStore((state) => state.resetDiagram)

  // Submits the prompt, triggers layout for the raw result, and saves it.
  async function handleGenerate() {
    if (!prompt.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const nextDiagram = await generateDiagram(prompt.trim())
      // Compute automatic layout ONLY when loading a freshly generated diagram
      const laidOutDiagram = layoutDiagram(nextDiagram)
      setDiagram(laidOutDiagram)
    } catch {
      setError('Could not generate the diagram. Check that the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="editor-shell">
      {/* Top Header holding logo, search prompt and general diagram commands */}
      <Toolbar
        hasDiagram={!!diagram}
        prompt={prompt}
        isLoading={isLoading}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        onReset={resetDiagram}
      />

      {/* Horizontal split containing the sidebar tools and canvas workspace */}
      <div className="editor-body">
        <Sidebar
          hasDiagram={!!diagram}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="editor-workspace">
          {error ? (
            <div className="form-error" style={{ margin: '16px', position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
              <span>{error}</span>
            </div>
          ) : null}

          {diagram ? (
            <DiagramCanvas />
          ) : (
            <section className="empty-state">
              <div className="empty-state-card">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                  </svg>
                </div>
                <h3>Generate Your Architecture</h3>
                <p>Use the prompt box in the top header to describe your system architecture and generate a diagram instantly.</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
