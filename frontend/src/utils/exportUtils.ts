/*
 * exportUtils contains browser-native handlers to export the React Flow canvas.
 *
 * It serializes the active viewport container, inlines relevant document styles,
 * and packages them into high-fidelity SVG or rasterized PNG download files.
 */

// Serializes the current React Flow viewport and returns the SVG string and dimensions.
function serializeToSvgString(): { svgString: string; width: number; height: number } | null {
  const reactFlowEl = document.querySelector('.react-flow') as HTMLElement
  const viewportEl = document.querySelector('.react-flow__viewport') as HTMLElement
  if (!reactFlowEl || !viewportEl) return null

  // Capture canvas viewport bounds
  const rect = reactFlowEl.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  // Extract transform style (pan & zoom) from active viewport
  const transform = viewportEl.style.transform || 'translate(0px, 0px) scale(1)'

  // Inline document styles so the export matches canvas themes
  let cssStyles = ''
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        cssStyles += rule.cssText + '\n'
      }
    } catch (e) {
      // Avoid security issues with cross-origin stylesheets
    }
  }

  // Clone viewport content and embed within a foreignObject tag
  const clone = viewportEl.cloneNode(true) as HTMLElement
  
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        ${cssStyles}
        .react-flow__viewport {
          transform: ${transform} !important;
          transform-origin: 0 0;
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
