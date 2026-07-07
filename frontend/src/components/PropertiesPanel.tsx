/*
 * PropertiesPanel is the Right Inspector Panel of the Editor Shell.
 *
 * It allows editing the properties of the currently active/selected element
 * (Node, Container/Group, or Edge) directly from the UI, bypassing browser prompts.
 * It reads selections from the DiagramStore and updates the Diagram document model.
 */

import { useState } from 'react'
import { useDiagramStore } from '../store/diagramStore'

export function PropertiesPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Retrieve document state and mutators from the global store
  const diagram = useDiagramStore((state) => state.diagram)
  const selectedNodeIds = useDiagramStore((state) => state.selectedNodeIds)
  const selectedEdgeIds = useDiagramStore((state) => state.selectedEdgeIds)

  const updateNodeLabel = useDiagramStore((state) => state.updateNodeLabel)
  const updateNodeType = useDiagramStore((state) => state.updateNodeType)
  const updateGroupLabel = useDiagramStore((state) => state.updateGroupLabel)
  const updateGroupSize = useDiagramStore((state) => state.updateGroupSize)
  const updateEdgeLabel = useDiagramStore((state) => state.updateEdgeLabel)
  const deleteSelected = useDiagramStore((state) => state.deleteSelected)

  if (!diagram) return null

  // Determine active item type and configuration
  const activeNodeId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null
  const activeEdgeId = selectedEdgeIds.length === 1 ? selectedEdgeIds[0] : null

  let activeNode = activeNodeId ? diagram.nodes.find((n) => n.id === activeNodeId) : null
  let activeGroup = activeNodeId ? diagram.groups.find((g) => g.id === activeNodeId) : null
  let activeEdge = activeEdgeId ? diagram.edges.find((e) => e.id === activeEdgeId) : null

  const hasSelection = activeNode || activeGroup || activeEdge

  return (
    <aside className={`editor-properties-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Inspector toggle tab/control */}
      <div className="properties-header">
        {!isCollapsed && <h2>Inspector</h2>}
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
          aria-label="Toggle Inspector"
        >
          {isCollapsed ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="properties-content">
          {activeNode && (
            <>
              <div className="properties-group">
                <label>Node ID</label>
                <input className="properties-input" type="text" value={activeNode.id} disabled />
              </div>

              <div className="properties-group">
                <label>Label</label>
                <input
                  className="properties-input"
                  type="text"
                  value={activeNode.label}
                  onChange={(e) => updateNodeLabel(activeNode!.id, e.target.value)}
                  placeholder="Enter node label..."
                />
              </div>

              <div className="properties-group">
                <label>Type</label>
                <select
                  className="properties-select"
                  value={activeNode.type}
                  onChange={(e) => updateNodeType(activeNode!.id, e.target.value)}
                >
                  <option value="service">Service</option>
                  <option value="client">Client / UI</option>
                  <option value="database">Database</option>
                  <option value="gateway">API Gateway</option>
                  <option value="cache">Cache / Queue</option>
                  <option value="external">External System</option>
                </select>
              </div>

              <div className="properties-group">
                <label>Coordinates</label>
                <div className="properties-row">
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>X: </span>
                    <input className="properties-input" type="text" value={Math.round(activeNode.position.x)} disabled />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Y: </span>
                    <input className="properties-input" type="text" value={Math.round(activeNode.position.y)} disabled />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="sidebar-tool-btn"
                  onClick={deleteSelected}
                  style={{
                    width: '100%',
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fee2e2',
                    justifyContent: 'center',
                  }}
                >
                  Delete Node
                </button>
              </div>
            </>
          )}

          {activeGroup && (
            <>
              <div className="properties-group">
                <label>Container ID</label>
                <input className="properties-input" type="text" value={activeGroup.id} disabled />
              </div>

              <div className="properties-group">
                <label>Label</label>
                <input
                  className="properties-input"
                  type="text"
                  value={activeGroup.label}
                  onChange={(e) => updateGroupLabel(activeGroup!.id, e.target.value)}
                  placeholder="Enter container label..."
                />
              </div>

              <div className="properties-group">
                <label>Size</label>
                <div className="properties-row">
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>W: </span>
                    <input
                      className="properties-input"
                      type="number"
                      value={activeGroup.width}
                      onChange={(e) => updateGroupSize(activeGroup!.id, Number(e.target.value), activeGroup!.height)}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>H: </span>
                    <input
                      className="properties-input"
                      type="number"
                      value={activeGroup.height}
                      onChange={(e) => updateGroupSize(activeGroup!.id, activeGroup!.width, Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="properties-group">
                <label>Coordinates</label>
                <div className="properties-row">
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>X: </span>
                    <input className="properties-input" type="text" value={Math.round(activeGroup.position.x)} disabled />
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Y: </span>
                    <input className="properties-input" type="text" value={Math.round(activeGroup.position.y)} disabled />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="sidebar-tool-btn"
                  onClick={deleteSelected}
                  style={{
                    width: '100%',
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fee2e2',
                    justifyContent: 'center',
                  }}
                >
                  Delete Container
                </button>
              </div>
            </>
          )}

          {activeEdge && (
            <>
              <div className="properties-group">
                <label>Edge ID</label>
                <input className="properties-input" type="text" value={activeEdge.id} disabled />
              </div>

              <div className="properties-group">
                <label>Label</label>
                <input
                  className="properties-input"
                  type="text"
                  value={activeEdge.label || ''}
                  onChange={(e) => updateEdgeLabel(activeEdge!.id, e.target.value)}
                  placeholder="Enter connection label (e.g. HTTPS)..."
                />
              </div>

              <div className="properties-group">
                <label>Connection</label>
                <div className="properties-group" style={{ gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    Source: <strong style={{ fontFamily: 'monospace' }}>{activeEdge.source}</strong>
                  </span>
                  <span style={{ fontSize: '11px', color: '#475569' }}>
                    Target: <strong style={{ fontFamily: 'monospace' }}>{activeEdge.target}</strong>
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="sidebar-tool-btn"
                  onClick={deleteSelected}
                  style={{
                    width: '100%',
                    background: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fee2e2',
                    justifyContent: 'center',
                  }}
                >
                  Delete Edge
                </button>
              </div>
            </>
          )}

          {!hasSelection && (
            <div className="properties-empty">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '8px', color: '#cbd5e1' }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p>Select a node, edge, or container to inspect and edit its properties.</p>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
