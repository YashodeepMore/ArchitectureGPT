/*
 * Toolbar is the Top Header of the Editor Shell.
 *
 * It contains the logo, the interactive prompt input for generation,
 * and document-level controls (Layout, Undo/Redo stubs, Export dropdown).
 */

import { useEffect, useRef, useState } from 'react'
import { useDiagramStore } from '../store/diagramStore'

type ToolbarProps = {
  hasDiagram: boolean
  prompt: string
  isLoading: boolean
  onPromptChange: (val: string) => void
  onGenerate: () => void
  onReset: () => void
}

export function Toolbar({
  hasDiagram,
  prompt,
  isLoading,
  onPromptChange,
  onGenerate,
  onReset,
}: ToolbarProps) {
  const autoLayout = useDiagramStore((state) => state.autoLayout)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = () => {
    alert('Save feature is coming soon!')
  }

  const handleThemeChange = () => {
    alert('Themes feature is coming soon!')
  }

  const handleUndo = () => {
    alert('Undo feature is coming soon!')
  }

  const handleRedo = () => {
    alert('Redo feature is coming soon!')
  }

  return (
    <header className="editor-header">
      {/* Left side: Logo & Title */}
      <div className="editor-header-logo">
        <h1>ArchitectureGPT</h1>
        <span>Beta</span>
      </div>

      {/* Center: Compact prompt input and generation button */}
      <div className="editor-header-prompt">
        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the architecture (e.g. 3-tier web app on AWS)..."
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && prompt.trim() && !isLoading) {
              onGenerate()
            }
          }}
        />
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Right side: Document operations and action buttons */}
      <div className="editor-header-actions" ref={menuRef}>
        <button
          type="button"
          className="toolbar-secondary"
          onClick={handleUndo}
          title="Undo last change"
        >
          Undo
        </button>

        <button
          type="button"
          className="toolbar-secondary"
          onClick={handleRedo}
          title="Redo last change"
        >
          Redo
        </button>

        <button
          type="button"
          className="toolbar-secondary"
          disabled={!hasDiagram}
          onClick={autoLayout}
          title="Auto arrange diagram components"
        >
          Auto Layout
        </button>

        <button
          type="button"
          className="toolbar-secondary"
          disabled={!hasDiagram}
          onClick={handleSave}
          title="Save diagram document"
        >
          Save
        </button>

        <button
          type="button"
          className="toolbar-secondary"
          disabled={!hasDiagram}
          onClick={handleThemeChange}
          title="Switch theme settings"
        >
          Theme
        </button>

        {/* Export / Download Menu */}
        <div className="toolbar-menu">
          <button
            type="button"
            className="toolbar-secondary"
            disabled={!hasDiagram}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            Export
            <span className="toolbar-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {isMenuOpen && hasDiagram ? (
            <div className="toolbar-dropdown" role="menu">
              <button
                type="button"
                className="toolbar-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false)
                  alert('Export SVG is coming soon!')
                }}
              >
                Export SVG
              </button>
              <button
                type="button"
                className="toolbar-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false)
                  alert('Export PNG is coming soon!')
                }}
              >
                Export PNG
              </button>
              <button
                type="button"
                className="toolbar-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false)
                  alert('Export JSON is coming soon!')
                }}
              >
                Export JSON
              </button>
            </div>
          ) : null}
        </div>

        {/* Reset/Clear Workspace */}
        <button
          type="button"
          className="toolbar-primary"
          disabled={!hasDiagram}
          onClick={onReset}
          title="Reset active diagram workspace"
        >
          Reset
        </button>
      </div>
    </header>
  )
}
