/*
 * Sidebar is the manual editing panel in the Editor Shell.
 *
 * It hosts canvas tools (Select, Pan, Add Node, Add Edge, Delete, Group)
 * and supports expanding/collapsing. It reads selection state from 
 * the DiagramStore to enable/disable specific actions.
 */

import { useState } from 'react'
import { useDiagramStore } from '../store/diagramStore'

type SidebarProps = {
  hasDiagram: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ hasDiagram, isCollapsed, onToggleCollapse }: SidebarProps) {
  const selectedNodeIds = useDiagramStore((state) => state.selectedNodeIds)
  const selectedEdgeIds = useDiagramStore((state) => state.selectedEdgeIds)
  const deleteSelected = useDiagramStore((state) => state.deleteSelected)
  const addNode = useDiagramStore((state) => state.addNode)
  const addGroup = useDiagramStore((state) => state.addGroup)

  // Internal active tools state
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select')

  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0

  const handleAddNode = () => {
    addNode()
  }

  const handleAddEdge = () => {
    alert('Add Edge feature is coming soon!')
  }

  const handleGroup = () => {
    addGroup()
  }

  return (
    <aside className={`editor-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar toggle control */}
      <div className="sidebar-toggle-wrapper">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Editing Toolbar Actions */}
      <div className="sidebar-tools">
        <button
          type="button"
          className={`sidebar-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
          onClick={() => setActiveTool('select')}
          title="Select Mode (Pointer)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 3 3 16 8 12 13 21 16 19 12 11 18 11 3 3"></polygon>
          </svg>
          <span>Select</span>
        </button>

        <button
          type="button"
          className={`sidebar-tool-btn ${activeTool === 'pan' ? 'active' : ''}`}
          onClick={() => setActiveTool('pan')}
          title="Pan Mode (Hand)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"></path>
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
            <path d="M6 14a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6a7 7 0 0 0 7 7h2a9 9 0 0 0 9-9v-3"></path>
          </svg>
          <span>Pan</span>
        </button>

        <button
          type="button"
          className="sidebar-tool-btn"
          disabled={!hasDiagram}
          onClick={handleAddNode}
          title="Add new standard Node"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <span>Add Node</span>
        </button>

        <button
          type="button"
          className="sidebar-tool-btn"
          disabled={!hasDiagram}
          onClick={handleAddEdge}
          title="Connect nodes with Edge"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
          <span>Add Edge</span>
        </button>

        <button
          type="button"
          className="sidebar-tool-btn"
          disabled={!hasDiagram || !hasSelection}
          onClick={deleteSelected}
          title="Delete selected element"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          <span>Delete</span>
        </button>

        <button
          type="button"
          className="sidebar-tool-btn"
          disabled={!hasDiagram}
          onClick={handleGroup}
          title="Create a new Container"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
          </svg>
          <span>Container</span>
        </button>
      </div>
    </aside>
  )
}
