/*
 * DiagramPage is the primary workspace view of our application.
 *
 * It manages prompt state, initiates diagram generation with the backend API,
 * and handles UI layout. It arranges the workspace into a full-screen 
 * viewport layout containing the top Toolbar, collapsible left Sidebar, 
 * central DiagramCanvas workspace, right PropertiesPanel, and bottom StatusBar.
 *
 * It acts as the coordinator for document management operations (Importing,
 * Saving, and global keyboard shortcuts).
 */

import { useState, useRef, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { DiagramCanvas } from '../components/diagram/DiagramCanvas'
import { Toolbar } from '../components/Toolbar'
import { Sidebar } from '../components/Sidebar'
import { PropertiesPanel } from '../components/PropertiesPanel'
import { StatusBar } from '../components/StatusBar'
import { generateDiagram } from '../services/diagramApi'
import { useDiagramStore } from '../store/diagramStore'
import { layoutDiagram } from '../utils/diagramToReactFlow'

// Validates the structure of imported JSON diagrams to match the local document model schema.
function validateDiagramStructure(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  if (typeof data.id !== 'string') return false
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges) || !Array.isArray(data.groups)) return false

  // Validate standard diagram nodes
  for (const node of data.nodes) {
    if (!node || typeof node !== 'object') return false
    if (typeof node.id !== 'string' || typeof node.label !== 'string') return false
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') return false
  }

  // Validate group bounding containers
  for (const group of data.groups) {
    if (!group || typeof group !== 'object') return false
    if (typeof group.id !== 'string' || typeof group.label !== 'string') return false
    if (!group.position || typeof group.position.x !== 'number' || typeof group.position.y !== 'number') return false
    if (typeof group.width !== 'number' || typeof group.height !== 'number') return false
  }

  // Validate edge connections
  for (const edge of data.edges) {
    if (!edge || typeof edge !== 'object') return false
    if (typeof edge.id !== 'string' || typeof edge.source !== 'string' || typeof edge.target !== 'string') return false
  }

  return true
}

export function DiagramPage() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Connect to the global diagram document store
  const diagram = useDiagramStore((state) => state.diagram)
  const setDiagram = useDiagramStore((state) => state.setDiagram)
  const resetDiagram = useDiagramStore((state) => state.resetDiagram)
  const setIsDirty = useDiagramStore((state) => state.setIsDirty)
  const selectAll = useDiagramStore((state) => state.selectAll)
  const deleteSelected = useDiagramStore((state) => state.deleteSelected)
  const setSelectedNodeIds = useDiagramStore((state) => state.setSelectedNodeIds)
  const setSelectedEdgeIds = useDiagramStore((state) => state.setSelectedEdgeIds)
  const undo = useDiagramStore((state) => state.undo)
  const redo = useDiagramStore((state) => state.redo)
  const copy = useDiagramStore((state) => state.copy)
  const paste = useDiagramStore((state) => state.paste)
  const duplicate = useDiagramStore((state) => state.duplicate)

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

  // Generate directly from a pre-filled suggestion chip
  const handleChipGenerate = async (chipPrompt: string) => {
    setPrompt(chipPrompt)
    setIsLoading(true)
    setError(null)
    try {
      const nextDiagram = await generateDiagram(chipPrompt)
      const laidOutDiagram = layoutDiagram(nextDiagram)
      setDiagram(laidOutDiagram)
    } catch {
      setError('Could not generate the diagram. Check that the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  // Serializes the current Diagram document and triggers a browser download.
  const handleSave = () => {
    if (!diagram) return
    try {
      const jsonString = JSON.stringify(diagram, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${diagram.id || 'architecture'}.json`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Clean dirty state after saving
      setIsDirty(false)
    } catch (err) {
      console.error('Failed to save project:', err)
      alert('Failed to save project')
    }
  }

  // Reads the uploaded JSON file, runs structural validation, and loads it into the store.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (validateDiagramStructure(parsed)) {
          setDiagram(parsed)
          setError(null)
        } else {
          alert('Invalid ArchitectureGPT JSON format. Please upload a valid exported file.')
        }
      } catch (err) {
        console.error('Error parsing JSON file:', err)
        alert('Failed to parse JSON file. Please ensure it is valid JSON.')
      }
    }
    reader.readAsText(file)
    // Reset file input value to allow uploading the same file again
    e.target.value = ''
  }

  // Listen to global hotkeys
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      // Ctrl + S -> Save
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleSave()
      }

      // Ctrl + O -> Import
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault()
        fileInputRef.current?.click()
      }

      // Ctrl + Z -> Undo
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undo()
      }

      // Ctrl + Y -> Redo
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
      }

      // Ctrl + C -> Copy
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        copy()
      }

      // Ctrl + V -> Paste
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        paste()
      }

      // Ctrl + D -> Duplicate
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicate()
      }

      // Ctrl + A -> Select all
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        selectAll()
      }

      // Delete / Backspace -> Delete selected
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        deleteSelected()
      }

      // Escape -> Clear selection
      if (event.key === 'Escape') {
        event.preventDefault()
        setSelectedNodeIds([])
        setSelectedEdgeIds([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [diagram, selectAll, deleteSelected, setSelectedNodeIds, setSelectedEdgeIds, undo, redo, copy, paste, duplicate])

  return (
    <ReactFlowProvider>
      <div className="editor-shell">
        {/* Hidden file input for loading diagrams */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />

        {/* Top Header holding logo, search prompt and general diagram commands */}
        <Toolbar
          hasDiagram={!!diagram}
          prompt={prompt}
          isLoading={isLoading}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          onReset={resetDiagram}
          onSave={handleSave}
          onImportClick={() => fileInputRef.current?.click()}
        />

        {/* Horizontal split containing the sidebar tools and canvas workspace */}
        <div className="editor-body">
          <Sidebar
            hasDiagram={!!diagram}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            activeTool={activeTool}
            onChangeTool={setActiveTool}
          />

          <main className="editor-workspace">
            {error ? (
              <div className="form-error" style={{ margin: '16px', position: 'absolute', top: 0, left: 0, zIndex: 100 }}>
                <span>{error}</span>
              </div>
            ) : null}

            {diagram ? (
              <DiagramCanvas activeTool={activeTool} />
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
                  <p>Describe your system architecture in the prompt bar above, or select one of the templates below to start instantly:</p>

                  <div className="empty-state-actions">
                    <div className="empty-state-prompts">
                      <span>Quick Templates</span>
                      <button
                        type="button"
                        className="empty-prompt-btn"
                        onClick={() => handleChipGenerate('3-tier web app on AWS with RDS, API Gateway, and CloudFront')}
                        disabled={isLoading}
                      >
                        ⚡ 3-Tier Web App on AWS
                      </button>
                      <button
                        type="button"
                        className="empty-prompt-btn"
                        onClick={() => handleChipGenerate('Microservices system with Kafka, API Gateway, Redis Cache, and User Service')}
                        disabled={isLoading}
                      >
                        ⚡ Microservices System with Kafka
                      </button>
                      <button
                        type="button"
                        className="empty-prompt-btn"
                        onClick={() => handleChipGenerate('Serverless API using Lambda, API Gateway, and DynamoDB')}
                        disabled={isLoading}
                      >
                        ⚡ Serverless REST API
                      </button>
                    </div>

                    <div className="empty-or">or</div>

                    <button
                      type="button"
                      className="toolbar-primary"
                      style={{ width: '100%', justifyContent: 'center', height: '36px' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📁 Import Diagram JSON
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* Right Properties inspector panel */}
          <PropertiesPanel />
        </div>

        {/* Bottom status bar */}
        <StatusBar />
      </div>
    </ReactFlowProvider>
  )
}
