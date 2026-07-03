import { useState } from 'react'
import { DiagramCanvas } from '../components/diagram/DiagramCanvas'
import { PromptForm } from '../components/PromptForm'
import { Toolbar } from '../components/Toolbar'
import { generateDiagram } from '../services/diagramApi'
import { useDiagramStore } from '../store/diagramStore'

export function DiagramPage() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const diagram = useDiagramStore((state) => state.diagram)
  const setDiagram = useDiagramStore((state) => state.setDiagram)
  const resetDiagram = useDiagramStore((state) => state.resetDiagram)

  async function handleGenerate() {
    setIsLoading(true)
    setError(null)

    try {
      const nextDiagram = await generateDiagram(prompt.trim())
      setDiagram(nextDiagram)
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
