/*
 * StatusBar is the Bottom panel of the Editor Shell.
 *
 * It queries zoom level from React Flow viewport subscription and counts
 * elements in the active Diagram document model to provide instant statistics.
 */

import { useViewport } from '@xyflow/react'
import { useDiagramStore } from '../store/diagramStore'

export function StatusBar() {
  const { zoom } = useViewport()
  const diagram = useDiagramStore((state) => state.diagram)
  const isDirty = useDiagramStore((state) => state.isDirty)

  if (!diagram) return null

  // Calculate item counts
  const nodeCount = diagram.nodes.length
  const groupCount = diagram.groups.length
  const edgeCount = diagram.edges.length
  const zoomPct = Math.round(zoom * 100)

  return (
    <footer className="editor-status-bar">
      <div className="status-left">
        <div className="status-item">
          <span className={`status-dot ${isDirty ? 'dirty' : 'clean'}`} />
          <span>{isDirty ? 'Unsaved Changes' : 'Saved'}</span>
        </div>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <div className="status-item" title="Standard nodes in active diagram">
          <strong>{nodeCount}</strong> nodes
        </div>
        <div className="status-item" title="Containers/groups in active diagram">
          <strong>{groupCount}</strong> containers
        </div>
        <div className="status-item" title="Connector connections in active diagram">
          <strong>{edgeCount}</strong> edges
        </div>
      </div>

      <div className="status-right">
        <div className="status-item" title="Canvas zoom percentage">
          <span>Zoom:</span>
          <strong>{zoomPct}%</strong>
        </div>
      </div>
    </footer>
  )
}
