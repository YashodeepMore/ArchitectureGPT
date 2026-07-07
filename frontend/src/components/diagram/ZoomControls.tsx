/*
 * ZoomControls is a floating action panel placed inside the DiagramCanvas view.
 *
 * It utilizes the useReactFlow hook to trigger programmatic zoom actions
 * (Zoom In, Zoom Out, Reset to 100%, and Fit View) directly on the viewport.
 */

import { useReactFlow, useViewport } from '@xyflow/react'

export function ZoomControls() {
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow()
  const { zoom } = useViewport()

  const handleZoomTo100 = () => {
    zoomTo(1)
  }

  const zoomPct = Math.round(zoom * 100)

  return (
    <div className="editor-zoom-controls" style={{ bottom: '16px', right: '16px' }}>
      <button
        type="button"
        className="zoom-btn"
        onClick={() => zoomOut()}
        title="Zoom Out"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <button
        type="button"
        className="zoom-text-btn"
        onClick={handleZoomTo100}
        title="Reset Zoom to 100%"
        style={{ minWidth: '42px' }}
      >
        {zoomPct}%
      </button>

      <button
        type="button"
        className="zoom-btn"
        onClick={() => zoomIn()}
        title="Zoom In"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <span style={{ color: '#e2e8f0', margin: '0 2px' }}>|</span>

      <button
        type="button"
        className="zoom-btn"
        onClick={() => fitView({ padding: 0.2, duration: 200 })}
        title="Fit View to Screen"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6"></path>
          <path d="M9 21H3v-6"></path>
          <path d="M21 3l-7 7"></path>
          <path d="M3 21l7-7"></path>
        </svg>
      </button>
    </div>
  )
}
