import { useDiagramStore } from '../store/diagramStore'

/*
 * exportUtils contains browser-native handlers to export the React Flow canvas.
 *
 * It serializes the active viewport container, inlines relevant document styles (safely
 * filtering out external assets to avoid canvas tainting), and exports the entire diagram bounding box.
 */

// Serializes the entire diagram bounds and returns the SVG string and dimensions.
function serializeToSvgString(): { svgString: string; width: number; height: number } | null {
  const reactFlowEl = document.querySelector('.react-flow') as HTMLElement
  const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement
  if (!reactFlowEl || !viewportEl) return null

  const diagram = useDiagramStore.getState().diagram
  if (!diagram) return null

  // Calculate diagram bounds from nodes and groups
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  diagram.nodes.forEach((node) => {
    const w = (node as any).width || 180
    const h = (node as any).height || 64
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + w)
    maxY = Math.max(maxY, node.position.y + h)
  })

  diagram.groups.forEach((group) => {
    minX = Math.min(minX, group.position.x)
    minY = Math.min(minY, group.position.y)
    maxX = Math.max(maxX, group.position.x + (group.width || 400))
    maxY = Math.max(maxY, group.position.y + (group.height || 300))
  })

  // If no elements, default to viewport bounds
  if (minX === Infinity) {
    const rect = reactFlowEl.getBoundingClientRect()
    return {
      svgString: `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">
          <foreignObject x="0" y="0" width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;"></div>
          </foreignObject>
        </svg>
      `,
      width: rect.width,
      height: rect.height,
    }
  }

  // Add margin padding to bounds
  const padding = 60
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  const width = maxX - minX
  const height = maxY - minY

  // Inline CSS styles but exclude external dependencies to prevent canvas tainting
  let cssStyles = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        const text = rule.cssText
        // Remove rules containing external fonts or imports which cause security errors in Canvas
        if (
          text.includes('@import') ||
          text.includes('@font-face') ||
          text.includes('http://') ||
          text.includes('https://')
        ) {
          continue
        }
        cssStyles += text + '\n'
      }
    } catch (e) {
      // Ignore cross-origin stylesheet errors
    }
  }

  // Clone viewport content and clean up interaction/selection overlays
  const clone = viewportEl.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.react-flow__nodesselection-rect').forEach((el) => el.remove())
  clone.querySelectorAll('.react-flow__selection').forEach((el) => el.remove())
  clone.querySelectorAll('.waypoint-handles').forEach((el) => el.remove())
  clone.querySelectorAll('.orthogonal-segment-overlay').forEach((el) => el.remove())

  // Force position offset in style to render the entire bounding box starting at (0, 0)
  const transformStyle = `translate(${-minX}px, ${-minY}px) scale(1)`

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        ${cssStyles}
        .react-flow__viewport {
          transform: ${transformStyle} !important;
          transform-origin: 0 0 !important;
        }
      </style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; position: relative;">
          ${clone.innerHTML}
        </div>
      </foreignObject>
    </svg>
  `
  return { svgString, width, height }
}

// Exports the canvas to vector SVG format
export function exportToSVG(fileName: string = 'architecture.svg') {
  const result = serializeToSvgString()
  if (!result) {
    alert('Diagram canvas elements not found')
    return
  }

  const { svgString } = result
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Exports the canvas to rasterized PNG format
export function exportToPNG(fileName: string = 'architecture.png') {
  const result = serializeToSvgString()
  if (!result) {
    alert('Diagram canvas elements not found')
    return
  }

  const { svgString, width, height } = result

  // Create image element to load SVG string
  const img = new Image()
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  img.onload = () => {
    // Render SVG into HTML5 Canvas to rasterize as PNG
    const canvas = document.createElement('canvas')
    canvas.width = width * 2 // Use 2x scale for higher resolution print quality
    canvas.height = height * 2

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(2, 2)
      ctx.drawImage(img, 0, 0)
      
      try {
        const pngUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = pngUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('PNG export security error:', err)
        alert('PNG export failed due to security restrictions (external assets in canvas).')
      }
    }
    URL.revokeObjectURL(url)
  }

  img.onerror = (err) => {
    console.error('Failed to load SVG for PNG conversion:', err)
    alert('Failed to generate PNG image.')
    URL.revokeObjectURL(url)
  }

  img.src = url
}
