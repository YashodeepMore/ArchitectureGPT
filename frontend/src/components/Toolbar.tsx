type ToolbarProps = {
  diagramId?: string
  onReset: () => void
}

export function Toolbar({ diagramId, onReset }: ToolbarProps) {
  return (
    <div className="toolbar">
      <span>{diagramId ? `Diagram: ${diagramId}` : 'No diagram loaded'}</span>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  )
}
