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
  const updateEdgeArrowType = useDiagramStore((state) => state.updateEdgeArrowType)
  const updateEdgeLineStyle = useDiagramStore((state) => state.updateEdgeLineStyle)
  const updateEdgeSourceSide = useDiagramStore((state) => state.updateEdgeSourceSide)
  const updateEdgeTargetSide = useDiagramStore((state) => state.updateEdgeTargetSide)
  const addWaypoint = useDiagramStore((state) => state.addWaypoint)
  const deleteWaypoint = useDiagramStore((state) => state.deleteWaypoint)
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
                <label>Arrow Direction</label>
                <select
                  className="properties-input"
                  value={activeEdge.arrowType || 'none'}
                  onChange={(e) => updateEdgeArrowType(activeEdge!.id, e.target.value as any)}
                >
                  <option value="none">None</option>
                  <option value="forward">Forward</option>
                  <option value="backward">Backward</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="properties-group">
                <label>Line Style</label>
                <select
                  className="properties-input"
                  value={activeEdge.style?.lineStyle || 'solid'}
                  onChange={(e) => updateEdgeLineStyle(activeEdge!.id, e.target.value as any)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div className="properties-group">
                <label>Source Connection Side</label>
                <select
                  className="properties-input"
                  value={activeEdge.sourceSide || 'auto'}
                  onChange={(e) => updateEdgeSourceSide(activeEdge!.id, e.target.value as any)}
                >
                  <option value="auto">Auto</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="properties-group">
                <label>Target Connection Side</label>
                <select
                  className="properties-input"
                  value={activeEdge.targetSide || 'auto'}
                  onChange={(e) => updateEdgeTargetSide(activeEdge!.id, e.target.value as any)}
                >
                  <option value="auto">Auto</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="properties-group">
                <label>Edge Type</label>
                <select className="properties-input" disabled value="orthogonal">
                  <option value="orthogonal">Orthogonal</option>
                </select>
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

              <div className="properties-group" style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Waypoints ({activeEdge.routePoints?.length || 0})</span>
                </label>
                
                {activeEdge.routePoints && activeEdge.routePoints.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', marginBottom: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px', background: '#f8fafc' }} className="nodrag nopan">
                    {activeEdge.routePoints.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>#{idx + 1}</span>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#334155', flex: 1 }}>
                          x: {pt.x}, y: {pt.y}
                        </span>
                        <button
                          type="button"
                          style={{
                            padding: '2px 6px',
                            background: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => deleteWaypoint(activeEdge!.id, idx)}
                          title="Remove waypoint"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 8px 0' }}>No manual waypoints. Edge uses direct path.</p>
                )}

                <button
                  type="button"
                  className="sidebar-tool-btn"
                  onClick={() => addWaypoint(activeEdge!.id)}
                  style={{
                    width: '100%',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #dcfce7',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '6px',
                    cursor: 'pointer',
                  }}
                >
                  + Add Waypoint
                </button>
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
