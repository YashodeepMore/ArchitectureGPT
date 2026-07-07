import { useState } from 'react'
import { DiagramCanvas } from '../components/diagram/DiagramCanvas'
import { PromptForm } from '../components/PromptForm'
import { Toolbar } from '../components/Toolbar'
import { generateDiagram } from '../services/diagramApi'
import { useDiagramStore } from '../store/diagramStore'
import { layoutDiagram } from '../utils/diagramToReactFlow'

// Primary workspace page hosting the generation control and diagram renderer.
export function DiagramPage() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Connect to the global diagram document store
  const diagram = useDiagramStore((state) => state.diagram)
  const setDiagram = useDiagramStore((state) => state.setDiagram)
  const resetDiagram = useDiagramStore((state) => state.resetDiagram)

  // Submits the prompt, triggers layout for the raw result, and saves it.
  async function handleGenerate() {
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
    <main className="app-shell">
      <header className="app-header">
        <h1>ArchitectureGPT</h1>
      </header>

      {diagram ? <Toolbar diagramId={diagram.id} onReset={resetDiagram} /> : null}

      <PromptForm
        prompt={prompt}
        isLoading={isLoading}
        error={error}
        onPromptChange={setPrompt}
        onSubmit={handleGenerate}
      />

      {diagram ? (
        <DiagramCanvas />
      ) : (
        <section className="empty-state">
          <p>Your generated architecture diagram will appear here.</p>
        </section>
      )}
    </main>
  )
}
