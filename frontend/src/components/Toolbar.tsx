import { useEffect, useRef, useState } from 'react'

type ToolbarProps = {
  diagramId?: string
  onReset: () => void
}

// Provides interface actions (like download/reset) to manipulate or export the active Diagram document.
export function Toolbar({ diagramId, onReset }: ToolbarProps) {

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

  return (
    <div className="toolbar">
      <span>{diagramId ? `Diagram: ${diagramId}` : 'No diagram loaded'}</span>

      <div className="toolbar-actions" ref={menuRef}>
        <div className="toolbar-menu">
          <button
            type="button"
            className="toolbar-secondary"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
          >
            Download
            <span className="toolbar-caret" aria-hidden="true">
              ▾
            </span>
          </button>

          {isMenuOpen ? (
            <div className="toolbar-dropdown" role="menu">
              <button type="button" className="toolbar-dropdown-item" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Download SVG
              </button>
              <button type="button" className="toolbar-dropdown-item" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Download PNG
              </button>
              <button type="button" className="toolbar-dropdown-item" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Download JSON
              </button>
            </div>
          ) : null}
        </div>

        <button type="button" className="toolbar-primary" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
